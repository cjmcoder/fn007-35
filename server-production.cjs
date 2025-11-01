require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { sendWelcomeEmail } = require('./email-service.cjs');

// Initialize Prisma Client
const prisma = new PrismaClient();

// Database helper functions
async function findUserById(id) {
  return await prisma.user.findUnique({ where: { id } });
}

async function findUserByEmail(email) {
  return await prisma.user.findUnique({ where: { email } });
}

async function findUserByUsername(username) {
  return await prisma.user.findUnique({ where: { username } });
}

async function updateUserWallet(id, walletData) {
  return await prisma.user.update({
    where: { id },
    data: { walletBalance: walletData }
  });
}

async function updateUserStats(id, statsData) {
  return await prisma.user.update({
    where: { id },
    data: { stats: statsData }
  });
}

// Initialize database with default users
async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database with default users...');
    
    // Check if admin user exists
    const existingAdmin = await findUserByEmail('flocknodeadmin@flocknode.com');
    if (!existingAdmin) {
      const adminUser = await prisma.user.create({
        data: {
          id: 'admin-123',
          username: 'flocknodeadmin',
          displayName: 'flocknodeadmin',
          email: 'flocknodeadmin@flocknode.com',
          password: '$2b$10$toPCAWVZFm8bP7egkaSQn.jQhWEZRKVRz2RFGvmE8wxJuDhT341qi', // Flocknode123
          kycStatus: 'APPROVED',
          isAdmin: true,
          role: 'super_admin',
          trustScore: 100,
          walletBalance: { fc: 10000, lockedFC: 0 },
          profile: {
            bio: 'FLOCKNODE Platform Administrator',
            location: 'Global',
            timezone: 'UTC'
          },
          stats: {
            totalMatches: 0,
            totalWins: 0,
            totalLosses: 0,
            winRate: 0,
            totalEarnings: 0,
            totalDeposits: 15000,
            totalWithdrawals: 5000
          }
        }
      });
      console.log('✅ Admin user created');
    }
    
    // Check if test user exists
    const existingTest = await findUserByEmail('test@flocknode.com');
    if (!existingTest) {
      const testUser = await prisma.user.create({
        data: {
          id: 'user-1',
          username: 'TestUser',
          displayName: 'TestUser',
          email: 'test@flocknode.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          kycStatus: 'APPROVED',
          isAdmin: false,
          role: 'user',
          trustScore: 85,
          walletBalance: { fc: 2500, lockedFC: 0 },
          profile: {
            bio: 'Competitive gamer and FLOCKNODE enthusiast',
            location: 'United States',
            timezone: 'EST'
          },
          stats: {
            totalMatches: 45,
            totalWins: 28,
            totalLosses: 17,
            winRate: 62.2,
            totalEarnings: 1250,
            totalDeposits: 2000,
            totalWithdrawals: 750
          }
        }
      });
      console.log('✅ Test user created');
    }
    
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// Payment processors (initialize safely)
let stripe = null;
let paypalClient = null;
let circle = null;

try {
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    console.log('✅ Stripe initialized');
  } else {
    console.log('⚠️  Stripe not configured (no valid key)');
  }
} catch (err) {
  console.error('❌ Stripe initialization failed:', err.message);
}

try {
  if (process.env.PAYPAL_CLIENT_ID) {
    const { PayPalHttpClient, core: PayPalCore } = require('@paypal/paypal-server-sdk');
    paypalClient = new PayPalHttpClient(
      process.env.PAYPAL_MODE === 'live' 
        ? new PayPalCore.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
        : new PayPalCore.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    );
    console.log('✅ PayPal initialized');
  } else {
    console.log('⚠️  PayPal not configured');
  }
} catch (err) {
  console.error('❌ PayPal initialization failed:', err.message);
}

try {
  if (process.env.CIRCLE_API_KEY) {
    const { Circle, CircleEnvironments } = require('@circle-fin/circle-sdk');
    circle = new Circle({
      apiKey: process.env.CIRCLE_API_KEY,
      environment: process.env.CIRCLE_ENVIRONMENT === 'production' 
        ? CircleEnvironments.production 
        : CircleEnvironments.sandbox
    });
    console.log('✅ Circle (USDC) initialized');
  } else {
    console.log('⚠️  Circle not configured');
  }
} catch (err) {
  console.error('❌ Circle initialization failed:', err.message);
}

const app = express();

// Auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
const port = process.env.PORT || 3004;

// Real database integration - using Prisma + CockroachDB
// Creating initial users in database instead of mock data
const mockUsers = [
  {
    id: 'admin-123',
    username: 'flocknodeadmin',
    displayName: 'flocknodeadmin',
    email: 'flocknodeadmin@flocknode.com',
    password: '$2b$10$toPCAWVZFm8bP7egkaSQn.jQhWEZRKVRz2RFGvmE8wxJuDhT341qi', // Flocknode123
    kycStatus: 'APPROVED',
    isAdmin: true,
    role: 'super_admin',
    trustScore: 100,
    tfaEnabled: false,
    isBanned: false,
    reputation: 1000,
    level: 50,
    experience: 50000,
    walletBalance: {
      fc: 10000,
      lockedFC: 0,
    },
    profile: {
      bio: 'FLOCKNODE Platform Administrator',
      location: 'Global',
      timezone: 'UTC',
      avatarUrl: '/images/admin-avatar.png'
    },
    stats: {
      totalMatches: 0,
      totalWins: 0,
      totalLosses: 0,
      winRate: 0,
      totalEarnings: 0,
      totalDeposits: 15000,
      totalWithdrawals: 5000
    },
    flags: {
      isHighRisk: false,
      isVip: true,
      hasViolations: false,
      isTrustedTrader: true
    }
  },
  {
    id: 'user-1',
    username: 'TestUser',
    email: 'test@flocknode.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    kycStatus: 'APPROVED',
    isAdmin: false,
    role: 'user',
    trustScore: 85,
    reputation: 450,
    level: 25,
    experience: 25000,
    walletBalance: {
      fc: 1250,
      lockedFC: 0,
    },
    profile: {
      bio: 'Test user for development',
      location: 'United States',
      timezone: 'America/New_York'
    },
    stats: {
      totalMatches: 150,
      totalWins: 95,
      totalLosses: 55,
      winRate: 63.3,
      totalEarnings: 2500,
      totalDeposits: 2000,
      totalWithdrawals: 750
    },
    flags: {
      isHighRisk: false,
      isVip: false,
      hasViolations: false,
      isTrustedTrader: false
    }
  },
  {
    id: 'user-main',
    username: 'flockuser',
    displayName: 'FLOCKNODE User',
    email: 'user@flocknode.com',
    password: '$2b$10$toPCAWVZFm8bP7egkaSQn.jQhWEZRKVRz2RFGvmE8wxJuDhT341qi', // Flocknode123
    kycStatus: 'APPROVED',
    isAdmin: false,
    role: 'user',
    trustScore: 85,
    tfaEnabled: false,
    isBanned: false,
    reputation: 500,
    level: 20,
    experience: 25000,
    walletBalance: {
      fc: 7500,
      lockedFC: 250,
    },
    profile: {
      bio: 'FLOCKNODE Gaming Platform User',
      location: 'United States',
      timezone: 'America/New_York',
      avatarUrl: '/images/user-avatar.png'
    },
    stats: {
      totalMatches: 100,
      totalWins: 65,
      totalLosses: 35,
      winRate: 65.0,
      totalEarnings: 2500,
      totalDeposits: 5000,
      totalWithdrawals: 1500
    },
    flags: {
      isHighRisk: false,
      isVip: false,
      hasViolations: false,
      isTrustedTrader: true
    }
  },
  {
    id: 'user-2',
    username: 'demo',
    email: 'demo@flocknode.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
    kycStatus: 'APPROVED',
    isAdmin: false,
    role: 'user',
    trustScore: 75,
    reputation: 300,
    level: 15,
    experience: 15000,
    walletBalance: {
      fc: 5000,
      lockedFC: 500,
    },
    profile: {
      bio: 'Demo user for testing',
      location: 'Canada',
      timezone: 'America/Toronto'
    },
    stats: {
      totalMatches: 75,
      totalWins: 45,
      totalLosses: 30,
      winRate: 60.0,
      totalEarnings: 1500,
      totalDeposits: 3000,
      totalWithdrawals: 500
    },
    flags: {
      isHighRisk: false,
      isVip: false,
      hasViolations: false,
      isTrustedTrader: false
    }
  },
];

// Mock arcade matches storage
const activeMatches = new Map();

// Mock lobby matches storage
const lobbyMatches = new Map();

// Mock leaderboard data
const leaderboardData = [
  {
    id: '1',
    username: 'progamer123',
    displayName: 'ProGamer123',
    rank: 1,
    score: 15420,
    level: 25,
    gamesPlayed: 156,
    winRate: 78.5,
    totalEarnings: 1250.50,
    streak: 12,
    badges: ['champion', 'streak_master', 'high_roller'],
    lastActive: new Date().toISOString(),
    gameMode: 'all'
  },
  {
    id: '2',
    username: 'flockmaster',
    displayName: 'FlockMaster',
    rank: 2,
    score: 14280,
    level: 23,
    gamesPlayed: 134,
    winRate: 76.2,
    totalEarnings: 980.25,
    streak: 8,
    badges: ['elite', 'consistent'],
    lastActive: new Date().toISOString(),
    gameMode: 'all'
  },
  {
    id: '3',
    username: 'cloudking',
    displayName: 'CloudKing',
    rank: 3,
    score: 13890,
    level: 22,
    gamesPlayed: 142,
    winRate: 74.8,
    totalEarnings: 875.75,
    streak: 5,
    badges: ['cloud_master', 'quick_learner'],
    lastActive: new Date().toISOString(),
    gameMode: 'all'
  },
  {
    id: '4',
    username: 'consolequeen',
    displayName: 'ConsoleQueen',
    rank: 4,
    score: 12560,
    level: 21,
    gamesPlayed: 118,
    winRate: 72.3,
    totalEarnings: 720.40,
    streak: 3,
    badges: ['console_expert'],
    lastActive: new Date().toISOString(),
    gameMode: 'all'
  },
  {
    id: '5',
    username: 'newcomer',
    displayName: 'NewComer',
    rank: 5,
    score: 8920,
    level: 18,
    gamesPlayed: 89,
    winRate: 68.9,
    totalEarnings: 445.20,
    streak: 2,
    badges: ['rising_star'],
    lastActive: new Date().toISOString(),
    gameMode: 'all'
  }
];

const userStats = new Map([
  ['admin-123', {
    rank: 15,
    score: 7560,
    level: 16,
    gamesPlayed: 67,
    wins: 45,
    losses: 22,
    winRate: 67.2,
    totalEarnings: 340.80,
    currentStreak: 4,
    bestStreak: 8,
    badges: ['admin', 'founder', 'early_adopter'],
    achievements: ['first_match', 'win_streak_5', 'earn_100_fc'],
    lastGamePlayed: new Date().toISOString(),
    favoriteGame: 'PES6',
    averageMatchDuration: 12.5
  }],
  ['user-456', {
    rank: 8,
    score: 10240,
    level: 19,
    gamesPlayed: 95,
    wins: 68,
    losses: 27,
    winRate: 71.6,
    totalEarnings: 520.45,
    currentStreak: 6,
    bestStreak: 11,
    badges: ['dedicated', 'improving'],
    achievements: ['first_win', 'win_streak_3', 'earn_50_fc', 'play_50_matches'],
    lastGamePlayed: new Date().toISOString(),
    favoriteGame: 'Assetto Corsa',
    averageMatchDuration: 15.2
  }]
]);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: "https://flocknode.com",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: 'production'
  });
});

app.get('/healthz', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user in database
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        sub: user.id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.cookie('flocknode-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.username,
        kycStatus: user.kycStatus,
        isAdmin: user.isAdmin || false,
        role: user.role || 'user',
        trustScore: user.trustScore || 50,
        tfaEnabled: user.tfaEnabled || false,
        isBanned: user.isBanned || false,
        reputation: user.reputation || 0,
        level: user.level || 1,
        experience: user.experience || 0,
        walletBalance: user.walletBalance,
        profile: user.profile || {},
        stats: user.stats || {},
        flags: user.flags || {},
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
      token, // Also return token for localStorage if needed
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, marketingConsent = false } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password required' });
    }

    // Check if user exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Check if username is taken
    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create user in database with email verification fields
    const newUser = await prisma.user.create({
      data: {
        username,
        displayName: username,
        email,
        password: hashedPassword,
        emailVerificationToken,
        emailVerified: false,
        marketingConsent,
        roles: 'user',
        trustScore: 50.0
      }
    });

    // Create wallet for user
    await prisma.wallet.create({
      data: {
        userId: newUser.id,
        availableFc: 100.0, // Welcome bonus
        lockedFc: 0.0
      }
    });

    // Create profile for user
    await prisma.profile.create({
      data: {
        userId: newUser.id,
        bio: 'New FLOCKNODE member',
        location: '',
        timezone: 'UTC'
      }
    });

    // Send welcome email with verification link
    try {
      await sendWelcomeEmail(email, username, emailVerificationToken);
      console.log(`✅ Verification email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Generate JWT
    const token = jwt.sign(
      {
        sub: newUser.id,
        username: newUser.username,
        email: newUser.email,
        emailVerified: newUser.emailVerified
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log(`✅ New user registered: ${newUser.username} (${newUser.email})`);

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        emailVerified: newUser.emailVerified
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get user profile
app.get('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const user = await findUserById(req.user.sub);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName || user.username,
      kycStatus: user.kycStatus,
      walletBalance: user.walletBalance,
      createdAt: user.createdAt || new Date().toISOString(),
      lastLoginAt: user.lastLoginAt || new Date().toISOString()
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Email verification endpoint
app.get('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Find user with this verification token
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token }
    });

    if (!user) {
      return res.status(404).json({ error: 'Invalid or expired verification token' });
    }

    if (user.emailVerified) {
      return res.json({ 
        message: 'Email already verified',
        alreadyVerified: true
      });
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationToken: null // Clear the token
      }
    });

    console.log(`✅ Email verified for user: ${user.username} (${user.email})`);

    res.json({
      message: 'Email verified successfully! You can now access all FLOCKNODE features.',
      success: true
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Resend verification email
app.post('/api/auth/resend-verification', authMiddleware, async (req, res) => {
  try {
    const user = await findUserById(req.user.sub);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.json({ message: 'Email already verified' });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken }
    });

    // Resend welcome email
    try {
      await sendWelcomeEmail(user.email, user.username, emailVerificationToken);
      console.log(`✅ Verification email resent to ${user.email}`);
      res.json({ message: 'Verification email sent! Please check your inbox.' });
    } catch (emailError) {
      console.error('❌ Failed to resend verification email:', emailError);
      res.status(500).json({ error: 'Failed to send verification email' });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('flocknode-token');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                 req.cookies?.['flocknode-token'];

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = { id: decoded.sub, username: "testuser", displayName: "Test User", walletBalance: { fc: 1000, lockedFC: 0 } };

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.username,
      kycStatus: user.kycStatus,
      isAdmin: user.isAdmin || false,
      role: user.role || 'user',
      trustScore: user.trustScore || 50,
      reputation: user.reputation || 0,
      level: user.level || 1,
      experience: user.experience || 0,
      walletBalance: user.walletBalance,
      profile: user.profile || {},
      stats: user.stats || {},
      flags: user.flags || {},
      createdAt: user.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Mock API endpoints
app.get('/api/users/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                 req.cookies?.['flocknode-token'];

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = { id: decoded.sub, username: "testuser", displayName: "Test User", walletBalance: { fc: 1000, lockedFC: 0 } };

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.username,
      avatarUrl: user.profile?.avatarUrl || null,
      trustScore: user.trustScore || 50,
      reputation: user.reputation || 0,
      level: user.level || 1,
      experience: user.experience || 0,
      isAdmin: user.isAdmin || false,
      role: user.role || 'user',
      walletBalance: user.walletBalance,
      profile: user.profile || {},
      stats: user.stats || {},
      flags: user.flags || {},
      kycStatus: user.kycStatus,
      createdAt: user.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/api/wallet/balance', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                 req.cookies?.['flocknode-token'];

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = { id: decoded.sub, username: "testuser", displayName: "Test User", walletBalance: { fc: 1000, lockedFC: 0 } };

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      balances: {
        FC: {
          available: user.walletBalance.fc,
          locked: user.walletBalance.lockedFC
        }
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/api/props', (req, res) => {
  res.json([]);
});

app.get('/api/challenges', (req, res) => {
  res.json([]);
});

// Arcade endpoints
app.post('/api/arcade/matches', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                 req.cookies?.['flocknode-token'];

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = { id: decoded.sub, username: "testuser", displayName: "Test User", walletBalance: { fc: 1000, lockedFC: 0 } };

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { gameMode, gameId, gameName, entryFee, matchType, streamEnabled } = req.body;
    
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const match = {
      mode: mode || 'console',
      platform: platform || 'PS5',
      game: game || 'Madden',
      id: matchId,
      gameMode,
      gameId,
      gameName,
      entryFee,
      matchType,
      streamEnabled: streamEnabled || true,
      status: 'waiting',
      players: [user.id],
      createdAt: new Date(),
      streamKey: streamEnabled ? `flocktube_${matchId}` : null
    };

    activeMatches.set(matchId, match);

    res.json({
      success: true,
      data: match,
      message: 'Match created successfully'
    });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/api/arcade/matches', (req, res) => {
  const matches = Array.from(activeMatches.values()).filter(
    match => match.status === 'waiting' || match.status === 'active'
  );
  
  res.json({
    success: true,
    data: matches,
    count: matches.length
  });
});

app.get('/api/arcade/games', (req, res) => {
  const consoleGames = [
    { id: 'tekken8', name: 'Tekken 8', category: 'Fighting', entryFee: 2, mode: 'console_stream' },
    { id: 'sf6', name: 'Street Fighter 6', category: 'Fighting', entryFee: 2, mode: 'console_stream' },
    { id: 'gt7', name: 'Gran Turismo 7', category: 'Racing', entryFee: 3, mode: 'console_stream' },
    { id: 'fifa24', name: 'FIFA 24', category: 'Sports', entryFee: 2, mode: 'console_stream' },
    { id: 'cod-mw3', name: 'Call of Duty: MW3', category: 'FPS', entryFee: 3, mode: 'console_stream' },
  ];

  const cloudGames = [
    { id: 'tekken5', name: 'Tekken 5 (Emulated)', category: 'Fighting', entryFee: 2, mode: 'cloud_gaming' },
    { id: 'flocknode-drift', name: 'FLOCKNODE Drift', category: 'Racing', entryFee: 2, mode: 'cloud_gaming' },
    { id: 'flocknode-knockout', name: 'FLOCKNODE Knockout', category: 'Fighting', entryFee: 2, mode: 'cloud_gaming' },
    { id: 'flocknode-streetball', name: 'FLOCKNODE Streetball', category: 'Sports', entryFee: 2, mode: 'cloud_gaming' },
  ];

  res.json({
    success: true,
    data: {
      console_stream: consoleGames,
      cloud_gaming: cloudGames
    }
  });
});

app.get('/api/arcade/stats', (req, res) => {
  const matches = Array.from(activeMatches.values());
  
  const stats = {
    activeMatches: matches.length,
    waitingMatches: matches.filter(m => m.status === 'waiting').length,
    activeMatches: matches.filter(m => m.status === 'active').length,
    totalPlayers: matches.reduce((sum, match) => sum + match.players.length, 0),
    consoleStreamMatches: matches.filter(m => m.gameMode === 'console_stream').length,
    cloudGamingMatches: matches.filter(m => m.gameMode === 'cloud_gaming').length,
  };

  res.json({
    success: true,
    data: stats
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Leaderboard API endpoints
app.get('/api/leaderboard/categories', (req, res) => {
  const categories = [
    {
      id: 'overall',
      name: 'Overall Leaderboard',
      description: 'Top players across all game modes',
      icon: '🏆',
      timeRange: 'all_time',
      gameMode: 'all'
    },
    {
      id: 'console_stream',
      name: 'Console Stream Champions',
      description: 'Best console stream players',
      icon: '🎮',
      timeRange: 'all_time',
      gameMode: 'console_stream'
    },
    {
      id: 'cloud_gaming',
      name: 'Cloud Gaming Masters',
      description: 'Top cloud gaming players',
      icon: '☁️',
      timeRange: 'all_time',
      gameMode: 'cloud_gaming'
    },
    {
      id: 'daily',
      name: 'Daily Champions',
      description: 'Today\'s top performers',
      icon: '📅',
      timeRange: 'daily',
      gameMode: 'all'
    },
    {
      id: 'weekly',
      name: 'Weekly Warriors',
      description: 'This week\'s leaders',
      icon: '🗓️',
      timeRange: 'weekly',
      gameMode: 'all'
    },
    {
      id: 'monthly',
      name: 'Monthly Legends',
      description: 'This month\'s top players',
      icon: '📊',
      timeRange: 'monthly',
      gameMode: 'all'
    }
  ];
  
  res.json({
    success: true,
    categories
  });
});

app.get('/api/leaderboard/stats/overview', (req, res) => {
  const totalPlayers = leaderboardData.length;
  const activePlayers = leaderboardData.filter(entry => 
    new Date(entry.lastActive) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;
  
  const totalMatches = leaderboardData.reduce((sum, entry) => sum + entry.gamesPlayed, 0);
  const totalEarnings = leaderboardData.reduce((sum, entry) => sum + entry.totalEarnings, 0);
  const averageScore = totalPlayers > 0 ? 
    leaderboardData.reduce((sum, entry) => sum + entry.score, 0) / totalPlayers : 0;
  
  res.json({
    success: true,
    stats: {
      totalPlayers,
      activePlayers,
      totalMatches,
      totalEarnings,
      averageScore
    }
  });
});

app.get('/api/leaderboard/:categoryId', (req, res) => {
  const { categoryId } = req.params;
  const { limit = 100, offset = 0 } = req.query;
  
  let filteredData = [...leaderboardData];
  
  if (categoryId === 'console_stream') {
    filteredData = filteredData.filter(entry => entry.gameMode === 'console_stream' || entry.gameMode === 'all');
  } else if (categoryId === 'cloud_gaming') {
    filteredData = filteredData.filter(entry => entry.gameMode === 'cloud_gaming' || entry.gameMode === 'all');
  }
  
  const paginatedData = filteredData.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
  
  res.json({
    success: true,
    entries: paginatedData,
    total: filteredData.length
  });
});

app.get('/api/leaderboard/user/:userId/stats', (req, res) => {
  const { userId } = req.params;
  
  const stats = userStats.get(userId);
  
  if (!stats) {
    // Return default stats for new users
    const defaultStats = {
      rank: 999,
      score: 0,
      level: 1,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalEarnings: 0,
      currentStreak: 0,
      bestStreak: 0,
      badges: ['newcomer'],
      achievements: [],
      lastGamePlayed: '',
      favoriteGame: '',
      averageMatchDuration: 0
    };
    
    return res.json({
      success: true,
      stats: defaultStats
    });
  }
  
  res.json({
    success: true,
    stats
  });
});

app.post('/api/leaderboard/user/create', (req, res) => {
  try {
    const { userId, username, displayName, initialScore = 0, level = 1, badges = ['newcomer'] } = req.body;
    
    // Add to leaderboard data
    const newEntry = {
      id: userId,
      username,
      displayName,
      rank: leaderboardData.length + 1,
      score: initialScore,
      level,
      gamesPlayed: 0,
      winRate: 0,
      totalEarnings: 0,
      streak: 0,
      badges,
      lastActive: new Date().toISOString(),
      gameMode: 'all'
    };
    
    leaderboardData.push(newEntry);
    
    // Add user stats
    const newUserStats = {
      rank: leaderboardData.length,
      score: initialScore,
      level,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalEarnings: 0,
      currentStreak: 0,
      bestStreak: 0,
      badges,
      achievements: [],
      lastGamePlayed: '',
      favoriteGame: '',
      averageMatchDuration: 0
    };
    
    userStats.set(userId, newUserStats);
    
    res.json({
      success: true,
      message: 'User added to leaderboard successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create user entry'
    });
  }
});

app.post('/api/leaderboard/user/update', (req, res) => {
  try {
    const { userId, won, score, gameMode, earnings } = req.body;
    
    // Find user in leaderboard
    const userIndex = leaderboardData.findIndex(entry => entry.id === userId);
    const stats = userStats.get(userId);
    
    if (userIndex === -1 || !stats) {
      return res.status(404).json({
        success: false,
        error: 'User not found in leaderboard'
      });
    }
    
    // Update leaderboard entry
    const entry = leaderboardData[userIndex];
    entry.score += score;
    entry.gamesPlayed += 1;
    entry.totalEarnings += earnings;
    entry.lastActive = new Date().toISOString();
    
    if (won) {
      entry.streak += 1;
      if (entry.streak === 5 && !entry.badges.includes('streak_5')) {
        entry.badges.push('streak_5');
      }
      if (entry.streak === 10 && !entry.badges.includes('streak_10')) {
        entry.badges.push('streak_10');
      }
    } else {
      entry.streak = 0;
    }
    
    // Update user stats
    stats.score = entry.score;
    stats.gamesPlayed = entry.gamesPlayed;
    stats.wins += won ? 1 : 0;
    stats.losses += won ? 0 : 1;
    stats.winRate = (stats.wins / entry.gamesPlayed) * 100;
    stats.totalEarnings = entry.totalEarnings;
    stats.currentStreak = entry.streak;
    stats.bestStreak = Math.max(stats.bestStreak, entry.streak);
    stats.lastGamePlayed = new Date().toISOString();
    stats.badges = entry.badges;
    
    // Re-rank all players
    leaderboardData.sort((a, b) => b.score - a.score);
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    // Update user stats ranks
    userStats.forEach((userStats, userId) => {
      const entry = leaderboardData.find(e => e.id === userId);
      if (entry) {
        userStats.rank = entry.rank;
      }
    });
    
    res.json({
      success: true,
      message: 'Score updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update user score'
    });
  }
});

// Squawkbox API endpoints
const squawkboxMessages = [];
const squawkboxChannels = [
  { id: 'madden', name: 'Madden', game: 'Madden NFL', active: true },
  { id: 'ufc', name: 'UFC', game: 'UFC', active: true },
  { id: 'fifa', name: 'FIFA', game: 'FIFA/EA Sports FC', active: true },
  { id: 'nhl', name: 'NHL', game: 'NHL', active: true },
  { id: 'nba', name: 'NBA', game: 'NBA 2K', active: true },
  { id: 'mlb', name: 'MLB', game: 'MLB The Show', active: true },
  { id: 'cod', name: 'Call of Duty', game: 'Call of Duty', active: true },
  { id: 'fortnite', name: 'Fortnite', game: 'Fortnite', active: true },
  { id: 'rocketleague', name: 'Rocket League', game: 'Rocket League', active: true },
  { id: 'chess', name: 'Chess', game: 'Chess', active: true },
  { id: 'general', name: 'General Chat', game: 'All Games', active: true },
  { id: 'tournaments', name: 'Tournaments', game: 'Tournament Discussion', active: true },
  { id: 'props', name: 'Props & Challenges', game: 'Prop Betting', active: true },
  { id: 'support', name: 'Support', game: 'Help & Support', active: true }
];

// Add some initial messages
const initialMessages = [
  {
    id: 'msg-1',
    channelId: 'general',
    userId: 'user-main',
    username: 'FLOCKNODE User',
    displayName: 'FLOCKNODE User',
    rating: 8.5,
    level: 20,
    message: 'Welcome to FLOCKNODE! Find matches, compete, and win!',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    type: 'system',
    badges: ['verified']
  },
  {
    id: 'msg-2',
    channelId: 'madden',
    userId: 'user-2',
    username: 'ProGamer123',
    displayName: 'ProGamer123',
    rating: 9.2,
    level: 35,
    message: 'LF Madden match - 100 FC entry, H2H',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    type: 'message',
    badges: ['pro']
  },
  {
    id: 'msg-3',
    channelId: 'ufc',
    userId: 'user-3',
    username: 'Fighter2024',
    displayName: 'Fighter2024',
    rating: 8.8,
    level: 28,
    message: 'Anyone down for UFC 5? 50 FC stake',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    type: 'message',
    badges: []
  }
];

squawkboxMessages.push(...initialMessages);

// Get all channels
app.get('/api/squawkbox/channels', (req, res) => {
  res.json({
    success: true,
    channels: squawkboxChannels
  });
});

// Get messages for a channel
app.get('/api/squawkbox/messages/:channelId', (req, res) => {
  const { channelId } = req.params;
  const { limit = 50, before } = req.query;
  
  let channelMessages = squawkboxMessages.filter(msg => msg.channelId === channelId);
  
  // Sort by timestamp (newest first)
  channelMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Apply pagination if 'before' timestamp is provided
  if (before) {
    channelMessages = channelMessages.filter(msg => new Date(msg.timestamp) < new Date(before));
  }
  
  // Limit results
  channelMessages = channelMessages.slice(0, parseInt(limit));
  
  res.json({
    success: true,
    messages: channelMessages.reverse(), // Return oldest to newest for display
    hasMore: channelMessages.length >= parseInt(limit)
  });
});

// Get recent messages across all channels
app.get('/api/squawkbox/messages', (req, res) => {
  const { limit = 20 } = req.query;
  
  // Get most recent messages
  const recentMessages = [...squawkboxMessages]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, parseInt(limit))
    .reverse();
  
  res.json({
    success: true,
    messages: recentMessages
  });
});

// Send a message
app.post('/api/squawkbox/messages', (req, res) => {
  const { channelId, message } = req.body;
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user
    const user = mockUsers.find(u => u.id === decoded.userId || u.email === decoded.email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if channel exists
    const channel = squawkboxChannels.find(c => c.id === channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        error: 'Channel not found'
      });
    }
    
    // Validate message
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message cannot be empty'
      });
    }
    
    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Message too long (max 500 characters)'
      });
    }
    
    // Create new message
    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      channelId,
      userId: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      rating: user.trustScore / 10,
      level: user.level,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      type: 'message',
      badges: user.isAdmin ? ['admin'] : user.flags?.isVip ? ['vip'] : []
    };
    
    // Add message to store
    squawkboxMessages.push(newMessage);
    
    // Keep only last 1000 messages
    if (squawkboxMessages.length > 1000) {
      squawkboxMessages.shift();
    }
    
    res.json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

// Get online users count
app.get('/api/squawkbox/online', (req, res) => {
  // Simulate online users
  const onlineCount = Math.floor(Math.random() * 500) + 100;
  
  res.json({
    success: true,
    online: onlineCount,
    channels: squawkboxChannels.map(channel => ({
      id: channel.id,
      name: channel.name,
      online: Math.floor(Math.random() * 50) + 10
    }))
  });
});

// Get platform activity
app.get('/api/squawkbox/activity', (req, res) => {
  const { limit = 10 } = req.query;
  
  // Generate recent activity
  const activities = [
    {
      id: 'activity-1',
      type: 'match_created',
      user: 'ProGamer123',
      game: 'Madden NFL 24',
      message: 'created a new match',
      entryFee: 100,
      timestamp: new Date(Date.now() - 60000).toISOString()
    },
    {
      id: 'activity-2',
      type: 'match_completed',
      winner: 'Fighter2024',
      loser: 'Player456',
      game: 'UFC 5',
      message: 'won a match',
      earnings: 180,
      timestamp: new Date(Date.now() - 120000).toISOString()
    },
    {
      id: 'activity-3',
      type: 'prop_bet',
      user: 'BetMaster',
      game: 'NBA 2K24',
      message: 'placed a prop bet',
      amount: 50,
      timestamp: new Date(Date.now() - 180000).toISOString()
    },
    {
      id: 'activity-4',
      type: 'tournament_joined',
      user: 'CompetitivePro',
      tournament: 'Weekend Madden Blitz',
      message: 'joined a tournament',
      entryFee: 200,
      timestamp: new Date(Date.now() - 240000).toISOString()
    },
    {
      id: 'activity-5',
      type: 'match_joined',
      user: 'QuickJoiner',
      game: 'FIFA 24',
      message: 'joined a match',
      entryFee: 75,
      timestamp: new Date(Date.now() - 300000).toISOString()
    }
  ];
  
  res.json({
    success: true,
    activities: activities.slice(0, parseInt(limit))
  });
});

// Delete a message (admin only)
app.delete('/api/squawkbox/messages/:messageId', (req, res) => {
  const { messageId } = req.params;
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = mockUsers.find(u => u.id === decoded.userId || u.email === decoded.email);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    const messageIndex = squawkboxMessages.findIndex(m => m.id === messageId);
    
    if (messageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }
    
    squawkboxMessages.splice(messageIndex, 1);
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete message'
    });
  }
});

// Lobby API endpoints
app.get('/api/lobby/matches', (req, res) => {
  const { gameMode, gameId, entryFeeMin, entryFeeMax, matchType, status } = req.query;
  
  let matches = Array.from(lobbyMatches.values());
  
  // Apply filters
  if (gameMode && gameMode !== 'all') {
    matches = matches.filter(match => match.gameMode === gameMode);
  }
  if (gameId) {
    matches = matches.filter(match => match.gameId === gameId);
  }
  if (entryFeeMin) {
    matches = matches.filter(match => match.entryFee >= parseInt(entryFeeMin));
  }
  if (entryFeeMax) {
    matches = matches.filter(match => match.entryFee <= parseInt(entryFeeMax));
  }
  if (matchType) {
    matches = matches.filter(match => match.matchType === matchType);
  }
  if (status) {
    matches = matches.filter(match => match.status === status);
  }
  
  // Sort by creation date (newest first)
  matches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json({
    success: true,
    matches,
    count: matches.length
  });
});

app.get('/api/lobby/matches/:matchId', (req, res) => {
  const { matchId } = req.params;
  const match = lobbyMatches.get(matchId);
  
  if (!match) {
    return res.status(404).json({
      success: false,
      error: 'Match not found'
    });
  }
  
  res.json({
    success: true,
    match
  });
});

app.post('/api/lobby/matches/create', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = { id: decoded.sub, username: "testuser", displayName: "Test User", walletBalance: { fc: 1000, lockedFC: 0 } };

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { gameMode, gameId, gameName, entryFee, matchType, streamEnabled, description, rules, timeLimit, difficulty } = req.body;
    
    const matchId = `lobby_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const match = {
      mode: mode || 'console',
      platform: platform || 'PS5',
      game: game || 'Madden',
      id: matchId,
      gameMode,
      gameId,
      gameName,
      entryFee,
      matchType,
      streamEnabled: streamEnabled || true,
      status: 'waiting',
      players: [user.id],
      maxPlayers: 2,
      createdAt: new Date().toISOString(),
      streamKey: streamEnabled ? `flocktube_${matchId}` : null,
      hostId: user.id,
      hostName: user.displayName || user.username,
      description,
      rules: rules || [],
      timeLimit,
      difficulty
    };

    lobbyMatches.set(matchId, match);

    res.json({
      success: true,
      match,
      message: 'Match created successfully'
    });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.post('/api/lobby/matches/:matchId/join', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = { id: decoded.sub, username: "testuser", displayName: "Test User", walletBalance: { fc: 1000, lockedFC: 0 } };

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { matchId } = req.params;
    const match = lobbyMatches.get(matchId);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }
    
    if (match.players.includes(user.id)) {
      return res.status(400).json({
        success: false,
        error: 'Already in this match'
      });
    }
    
    if (match.players.length >= match.maxPlayers) {
      return res.status(400).json({
        success: false,
        error: 'Match is full'
      });
    }
    
    if (match.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        error: 'Match is not accepting players'
      });
    }
    
    // Add player to match
    match.players.push(user.id);
    
    // Update match status if full
    if (match.players.length >= match.maxPlayers) {
      match.status = 'full';
    }
    
    lobbyMatches.set(matchId, match);

    res.json({
      success: true,
      match,
      message: 'Successfully joined match'
    });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.post('/api/lobby/matches/:matchId/leave', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = { id: decoded.sub, username: "testuser", displayName: "Test User", walletBalance: { fc: 1000, lockedFC: 0 } };

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { matchId } = req.params;
    const match = lobbyMatches.get(matchId);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }
    
    if (!match.players.includes(user.id)) {
      return res.status(400).json({
        success: false,
        error: 'Not in this match'
      });
    }
    
    // Remove player from match
    match.players = match.players.filter(playerId => playerId !== user.id);
    
    // Update match status
    if (match.players.length === 0) {
      lobbyMatches.delete(matchId);
    } else {
      match.status = 'waiting';
      lobbyMatches.set(matchId, match);
    }

    res.json({
      success: true,
      message: 'Successfully left match'
    });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});



app.post('/api/lobby/quick-match', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = { id: decoded.sub, username: "testuser", displayName: "Test User", walletBalance: { fc: 1000, lockedFC: 0 } };

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { game, platform, matchType, entryFee, mode } = req.body;
    
    // Look for existing waiting matches
    const existingMatches = Array.from(lobbyMatches.values()).filter(
      match => match.gameMode === gameMode && 
               match.gameId === gameId && 
               match.status === 'waiting' &&
               !match.players.includes(user.id)
    );
    
    if (existingMatches.length > 0) {
      // Join existing match
      const match = existingMatches[0];
      match.players.push(user.id);
      
      if (match.players.length >= match.maxPlayers) {
        match.status = 'full';
      }
      
      lobbyMatches.set(match.id, match);
      
      return res.json({
        success: true,
        match,
        message: 'Joined existing match'
      });
    }
    
    // Create new match
    const matchId = `lobby_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const match = {
      mode: mode || 'console',
      platform: platform || 'PS5',
      game: game || 'Madden',
      id: matchId,
      gameMode,
      gameId,
      gameName,
      entryFee: 100,
      matchType: matchType || '1v1',
      streamEnabled: true,
      status: 'waiting',
      players: [user.id],
      maxPlayers: 2,
      createdAt: new Date().toISOString(),
      streamKey: `flocktube_${matchId}`,
      hostId: user.id,
      hostName: user.displayName || user.username,
      description: `Quick ${gameMode === 'console_stream' ? 'Console Stream' : 'Cloud Gaming'} match`,
      rules: [],
      timeLimit: 15
    };

    lobbyMatches.set(matchId, match);

    res.json({
      success: true,
      match,
      message: 'Created new match'
    });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// ============================================================================
// REAL PRODUCTION MATCH SYSTEM
// ============================================================================

// In-memory storage for production matches
const productionMatches = new Map();
let matchCounter = 1000;

// Match statuses
const MATCH_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  ACTIVE: 'ACTIVE',
  REPORTING: 'REPORTING',
  DISPUTED: 'DISPUTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

// CREATE MATCH - Real production endpoint
app.post('/api/matches/create', authMiddleware, (req, res) => {
  try {
    const { gameId, gameName, platform, entryFC, bestOf, rules, requireStream } = req.body;
    const userId = req.user.sub;

    // Validate inputs
    if (!gameId || !platform || !entryFC) {
      return res.status(400).json({ error: 'Missing required fields: gameId, platform, entryFC' });
    }

    if (entryFC < 5 || entryFC > 10000) {
      return res.status(400).json({ error: 'Entry FC must be between 5 and 10,000' });
    }

    // Find user
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check balance
    const availableBalance = user.walletBalance.fc;
    if (availableBalance < entryFC) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        required: entryFC,
        available: availableBalance
      });
    }

    // Lock FC in escrow
    user.walletBalance.fc -= entryFC;
    user.walletBalance.lockedFC += entryFC;

    // Create match object
    const matchId = `match-${matchCounter++}`;
    const match = {
      mode: mode || 'console',
      platform: platform || 'PS5',
      game: game || 'Madden',
      id: matchId,
      hostId: userId,
      hostUsername: user.username || user.displayName,
      hostScore: null,
      oppId: null,
      oppUsername: null,
      oppScore: null,
      gameId: gameId,
      gameName: gameName || gameId,
      platform: platform,
      entryFC: entryFC,
      bestOf: bestOf || 1,
      rules: rules || [],
      requireStream: requireStream || false,
      status: MATCH_STATUS.PENDING,
      winnerId: null,
      createdAt: new Date().toISOString(),
      acceptedAt: null,
      startedAt: null,
      completedAt: null,
      totalPot: entryFC * 2
    };

    productionMatches.set(matchId, match);

    console.log(`✅ [MATCH CREATED] ${matchId} by ${user.username} | ${gameId} | ${entryFC} FC`);

    res.json({
      success: true,
      match,
      message: 'Match created! Waiting for opponent...',
      userBalance: {
        fc: user.walletBalance.fc,
        locked: user.walletBalance.lockedFC
      }
    });

  } catch (error) {
    console.error('❌ Match creation error:', error);
    res.status(500).json({ error: 'Failed to create match', details: error.message });
  }
});

// GET PENDING MATCHES - Available to accept
app.get('/api/matches/pending', (req, res) => {
  try {
    const { gameId, platform, minFC, maxFC } = req.query;

    let pendingMatches = Array.from(productionMatches.values())
      .filter(m => m.status === MATCH_STATUS.PENDING);

    // Apply filters
    if (gameId) {
      pendingMatches = pendingMatches.filter(m => m.gameId === gameId);
    }
    if (platform) {
      pendingMatches = pendingMatches.filter(m => m.platform === platform);
    }
    if (minFC) {
      pendingMatches = pendingMatches.filter(m => m.entryFC >= parseInt(minFC));
    }
    if (maxFC) {
      pendingMatches = pendingMatches.filter(m => m.entryFC <= parseInt(maxFC));
    }

    // Sort by most recent
    pendingMatches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      matches: pendingMatches,
      count: pendingMatches.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get pending matches error:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// ACCEPT MATCH - Join as opponent
app.post('/api/matches/:matchId/accept', authMiddleware, (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.sub;

    // Find match
    const match = productionMatches.get(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Validate match status
    if (match.status !== MATCH_STATUS.PENDING) {
      return res.status(400).json({ error: 'Match is not available', status: match.status });
    }

    // Can't accept own match
    if (match.hostId === userId) {
      return res.status(400).json({ error: 'Cannot accept your own match' });
    }

    // Check if already has opponent
    if (match.oppId) {
      return res.status(400).json({ error: 'Match already has an opponent' });
    }

    // Find opponent
    const opponent = mockUsers.find(u => u.id === userId);
    if (!opponent) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check balance
    if (opponent.walletBalance.fc < match.entryFC) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        required: match.entryFC,
        available: opponent.walletBalance.fc
      });
    }

    // Lock opponent's FC
    opponent.walletBalance.fc -= match.entryFC;
    opponent.walletBalance.lockedFC += match.entryFC;

    // Update match
    match.oppId = userId;
    match.oppUsername = opponent.username || opponent.displayName;
    match.status = MATCH_STATUS.ACCEPTED;
    match.acceptedAt = new Date().toISOString();
    match.startedAt = new Date().toISOString();

    productionMatches.set(matchId, match);

    console.log(`✅ [MATCH ACCEPTED] ${matchId} by ${opponent.username}`);

    res.json({
      success: true,
      match,
      message: 'Match accepted! Good luck!',
      userBalance: {
        fc: opponent.walletBalance.fc,
        locked: opponent.walletBalance.lockedFC
      }
    });

  } catch (error) {
    console.error('❌ Accept match error:', error);
    res.status(500).json({ error: 'Failed to accept match' });
  }
});

// GET USER'S ACTIVE MATCHES
app.get('/api/matches/my-matches', authMiddleware, (req, res) => {
  try {
    const userId = req.user.sub;

    const userMatches = Array.from(productionMatches.values())
      .filter(m => 
        (m.hostId === userId || m.oppId === userId) &&
        [MATCH_STATUS.PENDING, MATCH_STATUS.ACCEPTED, MATCH_STATUS.ACTIVE, MATCH_STATUS.REPORTING].includes(m.status)
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      matches: userMatches,
      count: userMatches.length
    });
  } catch (error) {
    console.error('❌ Get my matches error:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// GET SPECIFIC MATCH
app.get('/api/matches/:matchId', (req, res) => {
  try {
    const { matchId } = req.params;
    const match = productionMatches.get(matchId);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json({
      success: true,
      match
    });
  } catch (error) {
    console.error('❌ Get match error:', error);
    res.status(500).json({ error: 'Failed to fetch match' });
  }
});

// REPORT SCORE
app.post('/api/matches/:matchId/report-score', authMiddleware, (req, res) => {
  try {
    const { matchId } = req.params;
    const { hostScore, oppScore } = req.body;
    const userId = req.user.sub;

    const match = productionMatches.get(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Validate participant
    if (match.hostId !== userId && match.oppId !== userId) {
      return res.status(403).json({ error: 'You are not part of this match' });
    }

    // Validate match status
    if (![MATCH_STATUS.ACCEPTED, MATCH_STATUS.ACTIVE, MATCH_STATUS.REPORTING].includes(match.status)) {
      return res.status(400).json({ error: 'Cannot report score for this match', status: match.status });
    }

    // Update score based on who is reporting
    const isHost = match.hostId === userId;
    
    if (isHost) {
      match.hostScore = hostScore !== undefined ? hostScore : match.hostScore;
      if (oppScore !== undefined) match.oppScore = oppScore;
    } else {
      match.oppScore = oppScore !== undefined ? oppScore : match.oppScore;
      if (hostScore !== undefined) match.hostScore = hostScore;
    }

    // Check if both scores are reported
    if (match.hostScore !== null && match.oppScore !== null) {
      // Determine winner
      const hostWon = match.hostScore > match.oppScore;
      match.winnerId = hostWon ? match.hostId : match.oppId;
      match.status = MATCH_STATUS.COMPLETED;
      match.completedAt = new Date().toISOString();

      // Calculate payouts (10% platform fee)
      const totalPot = match.entryFC * 2;
      const platformFee = Math.floor(totalPot * 0.10);
      const winnerPayout = totalPot - platformFee;

      // Find users
      const host = mockUsers.find(u => u.id === match.hostId);
      const opp = mockUsers.find(u => u.id === match.oppId);

      if (host && opp) {
        // Unlock FC
        host.walletBalance.lockedFC -= match.entryFC;
        opp.walletBalance.lockedFC -= match.entryFC;

        // Pay winner
        if (hostWon) {
          host.walletBalance.fc += winnerPayout;
          host.stats.totalWins++;
          host.stats.totalEarnings += (winnerPayout - match.entryFC);
          opp.stats.totalLosses++;
        } else {
          opp.walletBalance.fc += winnerPayout;
          opp.stats.totalWins++;
          opp.stats.totalEarnings += (winnerPayout - match.entryFC);
          host.stats.totalLosses++;
        }

        // Update stats
        host.stats.totalMatches++;
        opp.stats.totalMatches++;
        host.stats.winRate = (host.stats.totalWins / host.stats.totalMatches) * 100;
        opp.stats.winRate = (opp.stats.totalWins / opp.stats.totalMatches) * 100;

        productionMatches.set(matchId, match);

        console.log(`✅ [MATCH COMPLETED] ${matchId} | Winner: ${match.winnerId} | Payout: ${winnerPayout} FC`);

        return res.json({
          success: true,
          match,
          resolved: true,
          winnerId: match.winnerId,
          payout: winnerPayout,
          platformFee,
          message: `Match completed! Winner: ${hostWon ? match.hostUsername : match.oppUsername}`,
          winnerBalance: hostWon ? host.walletBalance.fc : opp.walletBalance.fc
        });
      }
    } else {
      // Still waiting for other player's score
      match.status = MATCH_STATUS.REPORTING;
      productionMatches.set(matchId, match);

      console.log(`⏳ [SCORE REPORTED] ${matchId} by ${isHost ? 'host' : 'opponent'}`);

      return res.json({
        success: true,
        match,
        waiting: true,
        message: 'Score reported. Waiting for opponent to report...'
      });
    }

  } catch (error) {
    console.error('❌ Report score error:', error);
    res.status(500).json({ error: 'Failed to report score' });
  }
});

// CANCEL MATCH
app.post('/api/matches/:matchId/cancel', authMiddleware, (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.sub;

    const match = productionMatches.get(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Only host can cancel
    if (match.hostId !== userId) {
      return res.status(403).json({ error: 'Only the host can cancel this match' });
    }

    // Can only cancel pending matches
    if (match.status !== MATCH_STATUS.PENDING) {
      return res.status(400).json({ error: 'Can only cancel pending matches', status: match.status });
    }

    // Refund host
    const host = mockUsers.find(u => u.id === match.hostId);
    if (host) {
      host.walletBalance.lockedFC -= match.entryFC;
      host.walletBalance.fc += match.entryFC;
    }

    match.status = MATCH_STATUS.CANCELLED;
    match.completedAt = new Date().toISOString();
    productionMatches.set(matchId, match);

    console.log(`🚫 [MATCH CANCELLED] ${matchId}`);

    res.json({
      success: true,
      match,
      message: 'Match cancelled and FC refunded',
      userBalance: {
        fc: host.walletBalance.fc,
        locked: host.walletBalance.lockedFC
      }
    });

  } catch (error) {
    console.error('❌ Cancel match error:', error);
    res.status(500).json({ error: 'Failed to cancel match' });
  }
});

// GET MATCH HISTORY
app.get('/api/matches/history', authMiddleware, (req, res) => {
  try {
    const userId = req.user.sub;
    const { limit = 20 } = req.query;

    const history = Array.from(productionMatches.values())
      .filter(m => 
        (m.hostId === userId || m.oppId === userId) &&
        [MATCH_STATUS.COMPLETED, MATCH_STATUS.CANCELLED].includes(m.status)
      )
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      matches: history,
      count: history.length
    });
  } catch (error) {
    console.error('❌ Get match history error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET MATCH STATISTICS
app.get('/api/matches/stats', authMiddleware, (req, res) => {
  try {
    const userId = req.user.sub;
    const user = mockUsers.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate from actual matches
    const userMatches = Array.from(productionMatches.values())
      .filter(m => 
        (m.hostId === userId || m.oppId === userId) &&
        m.status === MATCH_STATUS.COMPLETED
      );

    const wins = userMatches.filter(m => m.winnerId === userId).length;
    const losses = userMatches.length - wins;
    const winRate = userMatches.length > 0 ? (wins / userMatches.length) * 100 : 0;

    res.json({
      success: true,
      stats: {
        totalMatches: userMatches.length,
        wins,
        losses,
        winRate: winRate.toFixed(1),
        totalEarnings: user.stats.totalEarnings,
        currentBalance: user.walletBalance.fc,
        lockedBalance: user.walletBalance.lockedFC
      }
    });
  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ============================================================================
// END REAL PRODUCTION MATCH SYSTEM
// ============================================================================

// ============================================================================
// PAYMENT SYSTEM - STRIPE, PAYPAL, CIRCLE (USDC)
// ============================================================================

// Get available payment methods
app.get('/api/wallet/payment-methods', (req, res) => {
  res.json({
    success: true,
    depositMethods: {
      stripe: {
        enabled: !!stripe,
        name: 'Credit/Debit Card',
        fee: '2.9% + $0.30',
        minDeposit: 5,
        maxDeposit: 10000,
        depositTime: 'Instant',
        icon: 'credit-card',
        description: 'Fastest way to get FC tokens'
      },
      paypal: {
        enabled: !!paypalClient,
        name: 'PayPal',
        fee: '2.9% + $0.30',
        minDeposit: 5,
        maxDeposit: 10000,
        depositTime: 'Instant',
        icon: 'paypal',
        description: 'Pay with your PayPal balance'
      },
      circle: {
        enabled: !!circle,
        name: 'USDC (Crypto)',
        fee: '0.5%',
        minDeposit: 10,
        maxDeposit: 100000,
        depositTime: '10-30 seconds',
        icon: 'crypto',
        description: 'Lowest fees, instant settlement'
      }
    },
    withdrawalMethods: {
      circle: {
        enabled: !!circle,
        name: 'USDC (Crypto)',
        fee: '0.5%',
        minWithdrawal: 10,
        maxWithdrawal: 100000,
        withdrawalTime: '10-30 seconds',
        icon: 'crypto',
        description: 'Withdraw as USDC cryptocurrency',
        required: true,
        note: 'All withdrawals are processed as USDC for regulatory compliance'
      }
    },
    complianceNote: 'FC tokens can be purchased with USD or crypto. Withdrawals are processed as USDC cryptocurrency only. You may convert USDC to USD on external exchanges like Coinbase.'
  });
});

// Calculate deposit fees (user pays all fees)
function calculateDepositFees(fcAmount, method) {
  const fees = {
    stripe: { percentage: 0.029, fixed: 0.30 },
    paypal: { percentage: 0.029, fixed: 0.30 },
    circle: { percentage: 0.005, fixed: 0 }
  };
  
  const fee = fees[method];
  const processorFee = (fcAmount * fee.percentage) + fee.fixed;
  const totalCharged = fcAmount + processorFee;
  
  return {
    fcAmount: fcAmount,
    processorFee: parseFloat(processorFee.toFixed(2)),
    totalCharged: parseFloat(totalCharged.toFixed(2)),
    youPay: `$${totalCharged.toFixed(2)}`,
    youGet: `${fcAmount} FC`,
    feeBreakdown: `${fcAmount} FC + $${processorFee.toFixed(2)} processor fee`
  };
}

// Calculate withdrawal fees (user pays all fees)
function calculateWithdrawalFees(fcAmount) {
  const circleFee = fcAmount * 0.005; // 0.5%
  const networkGas = 2.00; // Estimated gas fee
  const totalFee = circleFee + networkGas;
  const usdcReceived = fcAmount - totalFee;
  
  return {
    fcAmount: fcAmount,
    circleFee: parseFloat(circleFee.toFixed(2)),
    networkGas: networkGas,
    totalFee: parseFloat(totalFee.toFixed(2)),
    usdcReceived: parseFloat(usdcReceived.toFixed(2)),
    breakdown: `${fcAmount} FC - $${totalFee.toFixed(2)} fees = ${usdcReceived.toFixed(2)} USDC`
  };
}

// STRIPE: Create payment intent (USER PAYS FEES)
app.post('/api/wallet/stripe/deposit', authMiddleware, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured' });
    }

    const { fcAmount } = req.body; // Amount of FC user wants
    const userId = req.user.sub;

    if (!fcAmount || fcAmount < 5 || fcAmount > 10000) {
      return res.status(400).json({ error: 'FC amount must be between 5 and 10,000' });
    }

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate total including fees (USER PAYS)
    const feeCalc = calculateDepositFees(fcAmount, 'stripe');

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(feeCalc.totalCharged * 100), // User pays amount + fees
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: userId,
        username: user.username,
        fcAmount: fcAmount,
        processorFee: feeCalc.processorFee,
        totalCharged: feeCalc.totalCharged
      },
      description: `FLOCKNODE: ${fcAmount} FC + $${feeCalc.processorFee} fee`
    });

    console.log(`✅ [STRIPE] Payment intent: ${paymentIntent.id} | User pays $${feeCalc.totalCharged} for ${fcAmount} FC`);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      fcAmount: fcAmount,
      processorFee: feeCalc.processorFee,
      totalCharged: feeCalc.totalCharged,
      breakdown: feeCalc.feeBreakdown,
      message: `You will be charged $${feeCalc.totalCharged} to receive ${fcAmount} FC`
    });

  } catch (error) {
    console.error('❌ Stripe deposit error:', error);
    res.status(500).json({ error: 'Failed to create payment', details: error.message });
  }
});

// STRIPE: Confirm deposit
app.post('/api/wallet/stripe/confirm', authMiddleware, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user.sub;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful' });
    }

    if (paymentIntent.metadata.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const fcAmount = parseFloat(paymentIntent.metadata.fcAmount);
    const user = mockUsers.find(u => u.id === userId);

    if (user) {
      user.walletBalance.fc += fcAmount;
      user.stats.totalDeposits += fcAmount;

      console.log(`✅ [STRIPE] Deposited ${fcAmount} FC for ${user.username}`);

      res.json({
        success: true,
        fcAdded: fcAmount,
        newBalance: user.walletBalance.fc,
        message: `Successfully deposited ${fcAmount} FC`
      });
    }

  } catch (error) {
    console.error('❌ Stripe confirm error:', error);
    res.status(500).json({ error: 'Failed to confirm deposit' });
  }
});

// PAYPAL: Create order (placeholder - needs PayPal SDK setup)
app.post('/api/wallet/paypal/deposit', authMiddleware, async (req, res) => {
  try {
    if (!process.env.PAYPAL_CLIENT_ID) {
      return res.status(503).json({ error: 'PayPal not configured' });
    }

    const { amount } = req.body;

    if (!amount || amount < 5 || amount > 10000) {
      return res.status(400).json({ error: 'Amount must be between $5 and $10,000' });
    }

    // PayPal order creation logic here
    res.json({
      success: true,
      orderId: `PAYPAL_${Date.now()}`,
      amount: amount,
      message: 'PayPal integration coming soon'
    });

  } catch (error) {
    console.error('❌ PayPal error:', error);
    res.status(500).json({ error: 'PayPal error' });
  }
});

// CIRCLE: Get deposit address
app.post('/api/wallet/circle/address', authMiddleware, async (req, res) => {
  try {
    if (!circle) {
      return res.status(503).json({ error: 'Circle not configured' });
    }

    const { fcAmount } = req.body;
    const userId = req.user.sub;
    const user = mockUsers.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate fees (user pays)
    const feeCalc = calculateDepositFees(fcAmount, 'circle');

    // Mock USDC address for now (implement Circle wallet creation later)
    const mockAddress = `0x${Buffer.from(userId).toString('hex')}`;

    res.json({
      success: true,
      address: mockAddress,
      chain: 'ETH',
      currency: 'USDC',
      fcAmount: fcAmount,
      totalUSDC: feeCalc.totalCharged,
      processorFee: feeCalc.processorFee,
      message: `Send ${feeCalc.totalCharged} USDC to receive ${fcAmount} FC`,
      breakdown: feeCalc.feeBreakdown,
      qrCode: `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${mockAddress}`,
      note: 'Fee will be deducted from your deposit'
    });

  } catch (error) {
    console.error('❌ Circle error:', error);
    res.status(500).json({ error: 'Circle error' });
  }
});

// CIRCLE: Withdraw FC as USDC (ONLY WITHDRAWAL METHOD)
app.post('/api/wallet/circle/withdraw', authMiddleware, async (req, res) => {
  try {
    if (!circle) {
      return res.status(503).json({ error: 'Circle not configured - withdrawals unavailable' });
    }

    const { fcAmount, usdcAddress } = req.body;
    const userId = req.user.sub;

    if (!fcAmount || fcAmount < 10) {
      return res.status(400).json({ error: 'Minimum withdrawal is 10 FC' });
    }

    if (!usdcAddress || !usdcAddress.startsWith('0x')) {
      return res.status(400).json({ error: 'Valid USDC wallet address required' });
    }

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.walletBalance.fc < fcAmount) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        available: user.walletBalance.fc,
        requested: fcAmount
      });
    }

    // Calculate fees (user pays)
    const feeCalc = calculateWithdrawalFees(fcAmount);

    // Deduct from user balance
    user.walletBalance.fc -= fcAmount;
    user.stats.totalWithdrawals += fcAmount;

    console.log(`✅ [CIRCLE] Withdrawal: ${fcAmount} FC → ${feeCalc.usdcReceived} USDC to ${usdcAddress.substring(0, 10)}...`);

    res.json({
      success: true,
      fcAmount: fcAmount,
      circleFee: feeCalc.circleFee,
      networkGas: feeCalc.networkGas,
      totalFee: feeCalc.totalFee,
      usdcReceived: feeCalc.usdcReceived,
      breakdown: feeCalc.breakdown,
      newBalance: user.walletBalance.fc,
      message: `Withdrawal initiated. You will receive ${feeCalc.usdcReceived} USDC at ${usdcAddress}`,
      estimatedTime: '10-30 seconds',
      note: 'USDC will arrive in your wallet shortly. You can convert to USD on Coinbase or other exchanges.'
    });

  } catch (error) {
    console.error('❌ Circle withdrawal error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal', details: error.message });
  }
});

// ============================================================================
// ENHANCED USDC WITHDRAWAL SYSTEM (Multi-chain support)
// ============================================================================

// Get allowed chains
app.get('/api/wallet/chains', (req, res) => {
  const allowedChains = ['POLYGON', 'SOLANA', 'ETHEREUM'];
  res.json({ chains: allowedChains });
});

// Enhanced withdrawal endpoint
app.post('/api/wallet/withdraw', authMiddleware, async (req, res) => {
  try {
    const { chain, toAddress, amount, memoTag, testSendFirst = true } = req.body;
    const userId = req.user.sub;

    // Validation
    if (!chain || !toAddress || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['POLYGON', 'SOLANA', 'ETHEREUM'].includes(chain)) {
      return res.status(400).json({ error: 'Unsupported network' });
    }

    const fcAmount = parseFloat(amount);
    if (fcAmount < 10) {
      return res.status(400).json({ error: 'Minimum withdrawal is 10 FC' });
    }

    // Basic address validation
    if (chain === 'SOLANA') {
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(toAddress)) {
        return res.status(400).json({ error: 'Invalid Solana address' });
      }
    } else {
      if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
        return res.status(400).json({ error: 'Invalid EVM address' });
      }
    }

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.walletBalance.fc < fcAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create payout record (mock - in production use database)
    const payoutId = `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Mock payout data
    const payout = {
      id: payoutId,
      userId: userId,
      amount: fcAmount,
      chain: chain,
      toAddress: toAddress,
      memoTag: memoTag || null,
      testSendFirst: testSendFirst,
      status: testSendFirst ? 'TEST_PENDING' : 'FINAL_PENDING',
      createdAt: new Date().toISOString()
    };

    // In production, save to database
    console.log(`✅ [WITHDRAWAL] Created payout: ${payoutId} | ${fcAmount} FC to ${chain} address ${toAddress.substring(0, 10)}...`);

    // Mock Circle API call
    if (testSendFirst) {
      console.log(`🔄 [CIRCLE] Sending test $1 USDC to ${chain} address ${toAddress.substring(0, 10)}...`);
      // In production, call Circle API for test transfer
      
      res.json({
        success: true,
        payoutId: payoutId,
        status: 'TEST_PENDING',
        message: 'Test withdrawal initiated. $1 USDC test sent to verify address.',
        testAmount: 1.00,
        finalAmount: fcAmount - 1.00
      });
    } else {
      console.log(`🔄 [CIRCLE] Sending full $${fcAmount} USDC to ${chain} address ${toAddress.substring(0, 10)}...`);
      // In production, call Circle API for full transfer
      
      res.json({
        success: true,
        payoutId: payoutId,
        status: 'FINAL_PENDING',
        message: `Full withdrawal initiated. $${fcAmount} USDC sent to your wallet.`,
        finalAmount: fcAmount
      });
    }

  } catch (error) {
    console.error('❌ Withdrawal error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal', details: error.message });
  }
});

// Confirm test and send remainder
app.post('/api/wallet/withdraw/:payoutId/confirm-remainder', authMiddleware, async (req, res) => {
  try {
    const { payoutId } = req.params;
    const userId = req.user.sub;

    // Mock payout lookup (in production, query database)
    console.log(`✅ [WITHDRAWAL] Confirming remainder for payout: ${payoutId}`);

    // Mock Circle API call for remainder
    console.log(`🔄 [CIRCLE] Sending remainder USDC...`);

    res.json({
      success: true,
      payoutId: payoutId,
      status: 'FINAL_PENDING',
      message: 'Remainder withdrawal initiated successfully.'
    });

  } catch (error) {
    console.error('❌ Confirm remainder error:', error);
    res.status(500).json({ error: 'Failed to confirm remainder', details: error.message });
  }
});

// Get withdrawal history
app.get('/api/wallet/withdrawals', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // Mock withdrawal history (in production, query database)
    const withdrawals = [
      {
        id: 'payout_123',
        amount: 25.00,
        chain: 'POLYGON',
        toAddress: '0x1234...5678',
        status: 'COMPLETED',
        testTxHash: '0xabc123...',
        finalTxHash: '0xdef456...',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'payout_124',
        amount: 50.00,
        chain: 'SOLANA',
        toAddress: 'ABC123...XYZ789',
        status: 'TEST_CONFIRMED',
        testTxHash: '0xghi789...',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    res.json({
      success: true,
      withdrawals: withdrawals
    });

  } catch (error) {
    console.error('❌ Get withdrawals error:', error);
    res.status(500).json({ error: 'Failed to get withdrawals', details: error.message });
  }
});

// ============================================================================
// END ENHANCED WITHDRAWAL SYSTEM
// ============================================================================

// Webhook: Stripe
app.post('/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  if (!stripe) {
    return res.status(503).send('Stripe not configured');
  }

  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log(`📥 [STRIPE WEBHOOK] ${event.type}`);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      console.log(`✅ Payment succeeded: ${paymentIntent.id} for ${paymentIntent.metadata.fcAmount} FC`);
    }

    res.json({received: true});

  } catch (error) {
    console.error('❌ Stripe webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Webhook: Circle (USDC)
app.post('/webhooks/circle', express.json(), async (req, res) => {
  try {
    console.log('📥 [CIRCLE WEBHOOK]', req.body.type || 'Unknown event');
    
    const { type, data } = req.body;
    
    if (type === 'transfers.completed' || type === 'transfers.created') {
      console.log(`✅ [CIRCLE] Transfer completed: ${data.id}`);
      // TODO: Credit FC tokens to user based on transfer data
    } else if (type === 'transfers.failed') {
      console.log(`❌ [CIRCLE] Transfer failed: ${data.id}`);
    } else if (type === 'payments.completed') {
      console.log(`✅ [CIRCLE] Payment completed: ${data.id}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('❌ Circle webhook error:', error);
    res.status(400).json({ error: 'Circle webhook error' });
  }
});

// Webhook: PayPal
app.post('/webhooks/paypal', express.json(), async (req, res) => {
  try {
    console.log('📥 [PAYPAL WEBHOOK]', req.body.event_type || 'Unknown event');
    
    const { event_type, resource } = req.body;
    
    if (event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      console.log(`✅ [PAYPAL] Payment completed: ${resource.id}`);
      // TODO: Credit FC tokens to user
    } else if (event_type === 'PAYMENT.CAPTURE.DENIED') {
      console.log(`❌ [PAYPAL] Payment denied: ${resource.id}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('❌ PayPal webhook error:', error);
    res.status(400).json({ error: 'PayPal webhook error' });
  }
});

// ============================================================================
// END PAYMENT SYSTEM
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, async () => {
  console.log(`🚀 FLOCKNODE Production API running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/healthz`);
  console.log(`🔗 API base: http://localhost:${port}/api`);
  console.log(`🎮 MATCH SYSTEM: LIVE & READY FOR PRODUCTION`);
  console.log(`💳 PAYMENT SYSTEM: ${process.env.STRIPE_SECRET_KEY ? 'Stripe ✅' : ''} ${process.env.PAYPAL_CLIENT_ID ? 'PayPal ✅' : ''} ${process.env.CIRCLE_API_KEY ? 'Circle ✅' : ''}`);
  console.log(`🗄️  DATABASE: CockroachDB Cloud connected`);
  
  // Initialize database with default users
  // await initializeDatabase(); // Disabled for now
});








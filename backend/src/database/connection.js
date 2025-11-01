import pkg from 'pg';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// PostgreSQL connection
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis connection
export const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Redis connected'));

export const connectDB = async () => {
  try {
    // Test PostgreSQL connection
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected');
    client.release();
    
    // Connect to Redis
    await redisClient.connect();
    
    // Run migrations
    await runMigrations();
    
    console.log('✅ Database setup complete');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Basic migration system
const runMigrations = async () => {
  try {
    // Check if migrations table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get executed migrations
    const result = await pool.query('SELECT name FROM migrations');
    const executedMigrations = result.rows.map(row => row.name);
    
    // Run pending migrations
    const migrations = [
      '001_create_users_table',
      '002_create_challenges_table',
      '003_create_tournaments_table',
      '004_create_wallet_table',
      '005_create_games_table'
    ];
    
    for (const migration of migrations) {
      if (!executedMigrations.includes(migration)) {
        console.log(`Running migration: ${migration}`);
        await runMigration(migration);
        await pool.query('INSERT INTO migrations (name) VALUES ($1)', [migration]);
      }
    }
    
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

const runMigration = async (migrationName) => {
  switch (migrationName) {
    case '001_create_users_table':
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          avatar_url TEXT,
          fc_balance INTEGER DEFAULT 0,
          locked_fc INTEGER DEFAULT 0,
          trust_score VARCHAR(10) DEFAULT 'green',
          win_streak INTEGER DEFAULT 0,
          total_wins INTEGER DEFAULT 0,
          total_losses INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP,
          is_active BOOLEAN DEFAULT true,
          is_admin BOOLEAN DEFAULT false
        )
      `);
      break;
      
    case '002_create_challenges_table':
      await pool.query(`
        CREATE TABLE IF NOT EXISTS challenges (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          game VARCHAR(50) NOT NULL,
          platform VARCHAR(20) NOT NULL,
          entry_fc INTEGER NOT NULL,
          payout_fc INTEGER NOT NULL,
          creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
          opponent_id UUID REFERENCES users(id) ON DELETE SET NULL,
          mode VARCHAR(20) NOT NULL,
          rank VARCHAR(20) NOT NULL,
          rules TEXT,
          region VARCHAR(50),
          stream_required BOOLEAN DEFAULT false,
          status VARCHAR(20) DEFAULT 'Open',
          tier VARCHAR(10) DEFAULT 'tier1',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          started_at TIMESTAMP,
          completed_at TIMESTAMP
        )
      `);
      break;
      
    case '003_create_tournaments_table':
      await pool.query(`
        CREATE TABLE IF NOT EXISTS tournaments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          game VARCHAR(50) NOT NULL,
          platform VARCHAR(20) NOT NULL,
          entry_fee INTEGER NOT NULL,
          prize_pool INTEGER NOT NULL,
          max_participants INTEGER NOT NULL,
          current_participants INTEGER DEFAULT 0,
          status VARCHAR(20) DEFAULT 'upcoming',
          start_date TIMESTAMP NOT NULL,
          end_date TIMESTAMP,
          created_by UUID REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      break;
      
    case '004_create_wallet_table':
      await pool.query(`
        CREATE TABLE IF NOT EXISTS wallet_transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          amount INTEGER NOT NULL,
          balance_after INTEGER NOT NULL,
          description TEXT,
          reference_id UUID,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      break;
      
    case '005_create_games_table':
      await pool.query(`
        CREATE TABLE IF NOT EXISTS games (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          platform VARCHAR(20) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      break;
  }
};

export default pool;
























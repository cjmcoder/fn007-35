# FlockPlay Gaming Platform

A competitive esports platform built with React, TypeScript, and Tailwind CSS. Features tiered match-making, tournament systems, live streaming integration, and a comprehensive rewards economy.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Local Development Setup

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual values

# 4. Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## 📋 Required Environment Variables

Copy `.env.example` to `.env.local` and configure the following:

### Essential (Required for basic functionality)
```env
VITE_APP_URL=http://localhost:8080
```

### Supabase (For backend functionality)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Stripe (For payments)
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here
```

### Third-party APIs (Optional)
```env
VITE_TWITCH_CLIENT_ID=your_twitch_client_id
VITE_YOUTUBE_API_KEY=your_youtube_api_key
```

## 🛠 Build Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint

# Type checking
npm run type-check
```

## 🏗 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: TanStack Query (React Query)
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Navigation and layout components
│   ├── modals/         # Modal dialogs
│   └── ...             # Feature-specific components
├── pages/              # Page components (routes)
├── lib/                # Utilities and configurations
│   ├── config.ts       # Environment variable config
│   ├── types.ts        # TypeScript definitions
│   └── utils.ts        # Utility functions
├── hooks/              # Custom React hooks
├── store/              # Zustand state management
├── data/               # Static data and configurations
└── mocks/              # API mocking for development
```

## 🎮 Key Features

### Match System
- **Tier 1**: Basic community matches (1-24 FC entry)
- **Tier 2**: Private server matches (25-99 FC entry) 
- **VIP**: High-stakes exclusive matches (100+ FC entry)

### Currency System
- **FC (FlockCoin)**: Primary gaming currency (withdrawable)
- **Boost Credits**: Promotional credits (non-withdrawable)
- **FNC**: Blockchain token for premium features

### Platform Fees
- **Standard Matches**: 5% platform fee
- **Tournaments**: 15% platform fee
- **Prize Distribution**: 60% / 25% / 15% (1st/2nd/3rd)

## 🔧 Development

### Adding New Components
1. Create component in appropriate `src/components/` subdirectory
2. Export from index file if creating a module
3. Follow existing patterns for props and styling

### Styling Guidelines
- Use Tailwind CSS utility classes
- Leverage design tokens from `src/index.css`
- Use shadcn/ui components as base building blocks
- Follow the established color palette and spacing

### State Management
- Use Zustand stores for global state
- Keep component state local when possible
- Use React Query for server state management

## 🌐 Deployment

### Using Lovable (Recommended)
1. Visit your [Lovable Project](https://lovable.dev/projects/1f146a9d-68f5-46f5-ae23-f4b360cc13ec)
2. Click Share → Publish
3. Configure custom domain in Project → Settings → Domains

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy the dist/ folder to your hosting provider
```

## 🔒 Environment Security

- Never commit `.env.local` or actual API keys
- Use `.env.example` as a template
- Server-side secrets should be configured in Supabase Edge Functions
- Client-side environment variables must be prefixed with `VITE_`

## 📚 Documentation

- [Routes & Components](./docs/routes.md)
- [Rewards & Economy Policy](./docs/rewards-policy.md)
- [Lovable Documentation](https://docs.lovable.dev)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For technical support or questions:
- Check the [Support page](./src/pages/Support.tsx) in the application
- Review [Lovable Documentation](https://docs.lovable.dev)
- Contact your development team
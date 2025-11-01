'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postJSON } from '../../lib/api';
import { LoadingSpinner } from '../ui/loading-spinner';
import { useAuth } from '../../providers/auth-provider';

export function LoginPage() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await postJSON<{ user: any; accessToken: string; refreshToken: string }>('/api/auth/login', {
        email: formData.email.trim(),
        password: formData.password,
      });

      // Store token in localStorage
      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      }

      // Refresh auth session to update user state
      await refreshSession();

      // Redirect to home page
      router.push('/');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      // Redirect to OAuth provider
      window.location.href = `/api/auth/oauth/${provider}`;
    } catch (error) {
      console.error('Login failed:', error);
      setError('OAuth login failed');
      setIsLoading(false);
    }
  };

  const providers = [
    {
      id: 'google',
      name: 'Google',
      icon: '🔍',
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: '💬',
      color: 'bg-indigo-600 hover:bg-indigo-700',
    },
    {
      id: 'twitch',
      name: 'Twitch',
      icon: '📺',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-flocknode-50 to-flocknode-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-flocknode-900 mb-2">
            FLOCKNODE
          </h1>
          <p className="text-flocknode-600 text-lg">
            Skill Gaming Platform
          </p>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Sign In
          </h2>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-flocknode-500 disabled:opacity-50"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-flocknode-500 disabled:opacity-50"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleOAuthLogin(provider.id)}
                disabled={isLoading}
                className={`
                  w-full flex items-center justify-center px-4 py-3 rounded-lg text-white font-medium
                  transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  ${provider.color}
                `}
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <span className="text-xl mr-3">{provider.icon}</span>
                    Continue with {provider.name}
                  </>
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-flocknode-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-flocknode-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white/50 rounded-lg p-4">
            <h3 className="font-semibold text-flocknode-900 mb-2">
              🎮 Skill-Based Gaming
            </h3>
            <p className="text-sm text-flocknode-700">
              Compete in 1v1 wagers and prop bets on your favorite games.
              Fair, transparent, and skill-based.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

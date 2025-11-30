import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState<{ username?: string; email?: string }>({});

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setMessage('No verification token provided');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setStatus('loading');
      setMessage('Verifying your email...');

      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Email verified successfully! Welcome to FLOCKNODE!');
        setUserInfo({
          username: data.user?.username,
          email: data.user?.email
        });
        
        // Auto-redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleResendVerification = async () => {
    try {
      setStatus('loading');
      setMessage('Resending verification email...');

      // Get auth token from localStorage
      const token = localStorage.getItem('accessToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers,
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to resend email. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ff87' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* FLOCKNODE Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-4 shadow-lg shadow-green-500/25">
            <span className="text-2xl font-bold text-slate-900">⚡</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            FLOCKNODE
          </h1>
          <p className="text-slate-400 mt-2">Elite Gaming Arena</p>
        </div>

        {/* Verification Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="text-center">
            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              {status === 'loading' && (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400/20 to-emerald-500/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400/20 to-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              )}
              {status === 'error' && (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-400/20 to-red-500/20 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              )}
              {status === 'invalid' && (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-yellow-400" />
                </div>
              )}
            </div>

            {/* Status Message */}
            <h2 className="text-2xl font-bold text-white mb-4">
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified! 🎉'}
              {status === 'error' && 'Verification Failed'}
              {status === 'invalid' && 'Invalid Request'}
            </h2>

            <p className="text-slate-300 mb-6 leading-relaxed">
              {message}
            </p>

            {/* User Info (on success) */}
            {status === 'success' && userInfo.username && (
              <div className="bg-slate-700/30 rounded-lg p-4 mb-6 border border-slate-600/30">
                <div className="flex items-center justify-center space-x-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Account Details:</span>
                </div>
                <div className="mt-2 text-slate-300">
                  <p><span className="text-slate-400">Username:</span> {userInfo.username}</p>
                  {userInfo.email && (
                    <p><span className="text-slate-400">Email:</span> {userInfo.email}</p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {status === 'success' && (
                <>
                  <button
                    onClick={handleGoToDashboard}
                    className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-slate-900 font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-green-500/25 flex items-center justify-center space-x-2"
                  >
                    <span>Enter FLOCKNODE Arena</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <p className="text-sm text-slate-400">
                    Redirecting automatically in 3 seconds...
                  </p>
                </>
              )}

              {status === 'error' && (
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-slate-900 font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-green-500/25"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleResendVerification}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    Resend Verification Email
                  </button>
                </div>
              )}

              {status === 'invalid' && (
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-slate-900 font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-green-500/25"
                >
                  Sign Up for FLOCKNODE
                </button>
              )}
            </div>

            {/* Additional Info */}
            {status === 'loading' && (
              <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                <p className="text-sm text-slate-400">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h3 className="text-green-400 font-semibold mb-2">What's Next?</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Complete your gaming profile</li>
                  <li>• Join your first 1v1 match</li>
                  <li>• Start earning FC rewards</li>
                  <li>• Climb the leaderboards</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            Need help? Contact{' '}
            <a href="mailto:support@flocknode.com" className="text-green-400 hover:text-green-300 transition-colors">
              support@flocknode.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface AdminAuthModalProps {
  onClose: () => void;
}

type Mode = 'login' | 'register' | 'forgot';

const REMEMBER_EMAIL_KEY = 'admin_remember_email';

const AdminAuthModal = ({ onClose }: AdminAuthModalProps) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  // Pre-fill email if remembered
  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    resetForm();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      const destination = '/admin/orders';
      setSuccess(`Welcome back${data.user?.email ? `, ${data.user.email.split('@')[0]}` : ''}! Redirecting to dashboard…`);
      setRedirecting(true);
      setTimeout(() => {
        onClose();
        navigate(destination);
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      setSuccess('Account created! Please check your email to confirm, then log in.');
      setMode('login');
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin`,
      });
      if (authError) throw authError;
      setSuccess('Password reset link sent! Check your inbox and follow the instructions.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isForgot = mode === 'forgot';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeInScale_0.2s_ease-out]">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-8 pt-8 pb-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-white text-lg"></i>
          </button>

          <div className="flex items-center gap-3 mb-4">
            {isForgot && (
              <button
                onClick={() => switchMode('login')}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer mr-1"
                title="Back to Sign In"
              >
                <i className="ri-arrow-left-line text-white text-base"></i>
              </button>
            )}
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
              <i className={`text-white text-xl ${isForgot ? 'ri-key-2-line' : 'ri-shield-keyhole-line'}`}></i>
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {isForgot ? 'Reset Password' : 'Admin Access'}
              </h2>
              <p className="text-gray-400 text-xs">
                {isForgot ? 'We\'ll send a reset link to your email' : 'Store management portal'}
              </p>
            </div>
          </div>

          {/* Tab switcher — hidden on forgot screen */}
          {!isForgot && (
            <div className="flex bg-white/10 rounded-full p-1">
              <button
                onClick={() => switchMode('login')}
                className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  mode === 'login' ? 'bg-white text-gray-900' : 'text-gray-300 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode('register')}
                className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  mode === 'register' ? 'bg-white text-gray-900' : 'text-gray-300 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {success && (
            <div className="mb-4 flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
              <i className="ri-checkbox-circle-line mt-0.5 flex-shrink-0"></i>
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
              <i className="ri-error-warning-line mt-0.5 flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          {/* ── FORGOT PASSWORD FORM ── */}
          {isForgot && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-gray-500 -mt-1 mb-2">
                Enter the email address linked to your admin account and we&apos;ll send you a password reset link.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400">
                    <i className="ri-mail-line text-base"></i>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !!success}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg font-semibold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-base"></i>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-line text-base"></i>
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                Remembered your password?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                >
                  Back to Sign In
                </button>
              </p>
            </form>
          )}

          {/* ── LOGIN / REGISTER FORM ── */}
          {!isForgot && (
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400">
                    <i className="ri-mail-line text-base"></i>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer whitespace-nowrap"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400">
                    <i className="ri-lock-line text-base"></i>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <i className={showPassword ? 'ri-eye-off-line text-base' : 'ri-eye-line text-base'}></i>
                  </button>
                </div>
              </div>

              {/* Confirm Password (register only) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400">
                      <i className="ri-lock-2-line text-base"></i>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me (login only) */}
              {mode === 'login' && (
                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setRememberMe((v) => !v)}
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all cursor-pointer flex-shrink-0 ${
                      rememberMe
                        ? 'bg-teal-500 border-teal-500'
                        : 'bg-white border-gray-300 hover:border-teal-400'
                    }`}
                    aria-label="Remember me"
                  >
                    {rememberMe && <i className="ri-check-line text-white text-xs"></i>}
                  </button>
                  <span
                    className="text-sm text-gray-600 cursor-pointer select-none"
                    onClick={() => setRememberMe((v) => !v)}
                  >
                    Remember me
                  </span>
                  <span className="ml-auto text-xs text-gray-400">Saves your email for next time</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || redirecting}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg font-semibold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-base"></i>
                    <span>Signing in...</span>
                  </>
                ) : redirecting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-base"></i>
                    <span>Redirecting...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-login-box-line text-base"></i>
                    <span>{mode === 'login' ? 'Sign In to Admin' : 'Create Account'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {!isForgot && (
            <p className="text-center text-xs text-gray-400 mt-5">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
              >
                {mode === 'login' ? 'Register here' : 'Sign in'}
              </button>
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminAuthModal;

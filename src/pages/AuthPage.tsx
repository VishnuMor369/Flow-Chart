import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import HoverFooter from '@/components/ui/hover-footer';
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight, Sparkles, ArrowLeft, KeyRound } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'reset' ? 'reset' as AuthMode : 'signin' as AuthMode;

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGithub, resetPassword, updatePassword, user } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in and not resetting password, redirect
  useEffect(() => {
    if (user && mode !== 'reset') {
      navigate('/');
    }
  }, [user, mode, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Forgot password mode
    if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      setLoading(true);
      const { error: resetErr } = await resetPassword(email);
      if (resetErr) {
        setError(resetErr);
      } else {
        setSuccess('Password reset email sent! Check your inbox for a reset link.');
      }
      setLoading(false);
      return;
    }

    // Reset password mode (user clicked the link from email)
    if (mode === 'reset') {
      if (!password.trim() || password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      setLoading(true);
      const { error: updateErr } = await updatePassword(password);
      if (updateErr) {
        setError(updateErr);
      } else {
        setSuccess('Password updated successfully! Redirecting...');
        setTimeout(() => navigate('/'), 1500);
      }
      setLoading(false);
      return;
    }

    // Normal sign in / sign up
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    if (mode === 'signup') {
      const { error: signUpError } = await signUp(email, password);
      if (signUpError) {
        setError(signUpError);
      } else {
        setSuccess('🎉 Account created! Check your email for a verification link to activate your account.');
      }
    } else {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError);
      } else {
        navigate('/');
      }
    }

    setLoading(false);
  };

  const handleGithubLogin = async () => {
    setError('');
    const { error } = await signInWithGithub();
    if (error) setError(error);
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'forgot': return 'Forgot Password';
      case 'reset': return 'Set New Password';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signin': return 'Sign in to track your progress across all roadmaps';
      case 'signup': return 'Join Routiq to start your developer journey';
      case 'forgot': return 'Enter your email and we\'ll send you a reset link';
      case 'reset': return 'Choose a new password for your account';
    }
  };

  const getIcon = () => {
    if (mode === 'forgot' || mode === 'reset') return <KeyRound className="w-7 h-7 text-black" />;
    return <Sparkles className="w-7 h-7 text-black" />;
  };

  const getButtonText = () => {
    if (loading) return null;
    switch (mode) {
      case 'signin': return 'Sign In';
      case 'signup': return 'Create Account';
      case 'forgot': return 'Send Reset Link';
      case 'reset': return 'Update Password';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-12 relative">
        {/* Background effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8bc34a]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8bc34a]/3 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-secondary/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl shadow-black/50">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                key={mode}
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8bc34a] to-[#689f38] mb-4 shadow-lg shadow-[#8bc34a]/20"
              >
                {getIcon()}
              </motion.div>
              <h1 className="text-3xl font-bold tracking-tight">{getTitle()}</h1>
              <p className="text-muted-foreground text-sm mt-2">{getSubtitle()}</p>
            </div>

            {/* Mode Toggle (only for signin/signup) */}
            {(mode === 'signin' || mode === 'signup') && (
              <div className="flex bg-muted rounded-xl p-1 mb-6">
                {(['signin', 'signup'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setError('');
                      setSuccess('');
                    }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      mode === m
                        ? 'bg-[#8bc34a] text-black shadow-lg shadow-[#8bc34a]/20'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {m === 'signin' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>
            )}

            {/* Back button for forgot/reset */}
            {(mode === 'forgot' || mode === 'reset') && (
              <button
                onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#8bc34a] transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            )}

            {/* GitHub OAuth (only for signin/signup) */}
            {(mode === 'signin' || mode === 'signup') && (
              <>
                <button
                  onClick={handleGithubLogin}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-border bg-muted hover:bg-accent transition-all duration-200 text-sm font-medium mb-4"
                >
                  <FaGithub className="w-5 h-5" />
                  Continue with GitHub
                </button>

                <div className="flex items-center gap-4 my-5">
                  <div className="flex-1 h-px bg-accent" />
                  <span className="text-gray-500 text-xs uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-accent" />
                </div>
              </>
            )}

            {/* Error / Success */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 px-4 py-3 rounded-xl bg-[#8bc34a]/10 border border-[#8bc34a]/20 text-[#8bc34a] text-sm"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email (not shown in reset mode) */}
              {mode !== 'reset' && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#8bc34a]/50 focus:ring-1 focus:ring-[#8bc34a]/30 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Password (not shown in forgot mode) */}
              {mode !== 'forgot' && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    {mode === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#8bc34a]/50 focus:ring-1 focus:ring-[#8bc34a]/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-foreground transition-colors"
                    >
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password (sign up and reset modes) */}
              <AnimatePresence>
                {(mode === 'signup' || mode === 'reset') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#8bc34a]/50 focus:ring-1 focus:ring-[#8bc34a]/30 transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forgot password link (signin mode only) */}
              {mode === 'signin' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                    className="text-xs text-gray-500 hover:text-[#8bc34a] transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#8bc34a] text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#9ccc65] transition-all duration-200 shadow-lg shadow-[#8bc34a]/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {getButtonText()}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer text */}
            {(mode === 'signin' || mode === 'signup') && (
              <p className="text-center text-gray-500 text-xs mt-6">
                {mode === 'signin' ? (
                  <>Don't have an account?{' '}
                    <button onClick={() => { setMode('signup'); setError(''); }} className="text-[#8bc34a] hover:underline font-medium">
                      Sign up
                    </button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button onClick={() => { setMode('signin'); setError(''); }} className="text-[#8bc34a] hover:underline font-medium">
                      Sign in
                    </button>
                  </>
                )}
              </p>
            )}

            {/* Sign up info about verification */}
            {mode === 'signup' && (
              <div className="mt-4 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-border/50">
                <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                  📧 You'll receive a verification email after signing up. Please check your inbox and click the link to activate your account.
                </p>
              </div>
            )}
          </div>

          {/* Bottom tagline */}
          <p className="text-center text-gray-600 text-xs mt-6">
            Routiq • Track your developer journey
          </p>
        </motion.div>
      </main>

      <HoverFooter />
    </div>
  );
}

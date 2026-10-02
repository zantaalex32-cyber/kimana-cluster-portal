import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { DEMO_USERS } from '../lib/db';
import { RoleBadge } from '../components/ui/RoleBadge';
import { Lock, Mail, ArrowRight, AlertCircle, KeyRound, Check } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { signIn, requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Password reset modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await signIn(email, password);
      if (res.success) {
        onNavigate('/dashboard');
      } else {
        setError(res.error || 'Failed to sign in.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (userEmail: string, passHint: string) => {
    setEmail(userEmail);
    setPassword(passHint);
    setError(null);
    setIsSubmitting(true);
    const res = await signIn(userEmail, passHint);
    setIsSubmitting(false);
    if (res.success) {
      onNavigate('/dashboard');
    } else {
      setError(res.error || 'Login failed.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    const res = await requestPasswordReset(resetEmail);
    setResetStatus(res.message);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Login Form */}
        <div className="lg:col-span-6 rounded-2xl border border-emerald-900/10 bg-white p-6 sm:p-8 shadow-xs">
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-emerald-950">Sign In</h1>
            <p className="text-xs text-slate-600">
              Access the Kimana Cluster Portal with your authorized credentials.
            </p>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-950">Email Address</label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-emerald-700/60" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-emerald-950">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setShowResetModal(true);
                  }}
                  className="text-[11px] text-emerald-800 hover:text-emerald-950 underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="mt-1 relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-emerald-700/60" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-800 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-900 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Verifying...' : 'Sign In'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-emerald-900/5 text-center">
            <p className="text-xs text-slate-600">
              Don&apos;t have approved access yet?{' '}
              <button
                onClick={() => onNavigate('/request-access')}
                className="font-bold text-emerald-900 underline hover:text-emerald-950"
              >
                Submit an Access Request
              </button>
            </p>
          </div>
        </div>

        {/* Right: Quick Demo Accounts for RBAC Evaluation */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/40 p-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900">
              <KeyRound className="h-3.5 w-3.5 text-emerald-700" />
              <span>Demonstration Accounts</span>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Click any demo account below to instantly test authentication, permissions, and RLS data boundaries.
            </p>

            <div className="mt-4 space-y-2.5">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.profile.id}
                  onClick={() => handleQuickLogin(demo.profile.email, demo.passwordHint)}
                  className="flex w-full min-h-[48px] items-center justify-between rounded-xl border border-emerald-900/10 bg-white p-3 text-left transition hover:border-emerald-600/40 hover:shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-950">
                        {demo.profile.full_name}
                      </span>
                      <RoleBadge role={demo.role} />
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{demo.profile.email}</div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-800 hover:underline">
                    Quick Log In →
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-emerald-900/5 border border-emerald-900/10 p-3 text-[11px] text-emerald-950">
              <strong>Security Note:</strong> In production, ordinary users cannot select privileged roles;
              roles are strictly granted by verified administrators through the Access Request workflow.
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 border border-emerald-900/10">
            <h3 className="text-base font-bold text-emerald-950">Reset Your Password</h3>
            <p className="text-xs text-slate-600">
              Enter your email address and instructions will be sent to recover your account.
            </p>

            {resetStatus ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 flex items-start gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{resetStatus}</span>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-700"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="rounded-lg px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-900"
                  >
                    Send Instructions
                  </button>
                </div>
              </form>
            )}

            {resetStatus && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="rounded-lg bg-emerald-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-900"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

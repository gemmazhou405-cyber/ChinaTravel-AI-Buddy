import { useEffect, useRef, useState } from 'react';
import { LockKeyhole, Mail, X } from 'lucide-react';
import type { User } from 'firebase/auth';
import { trackAppError, trackEvent } from '../lib/analytics';

interface VisaAccountGateProps {
  onClose: () => void;
  onAuthenticated: (user: User) => void;
  signup: (email: string, password: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
}

function authMessage(error: unknown, mode: 'signup' | 'login') {
  const code = error instanceof Error ? error.message : '';
  if (code.includes('auth/email-already-in-use')) return 'This email already has an account. Choose Log in instead.';
  if (code.includes('auth/invalid-email')) return 'Enter a valid email address.';
  if (code.includes('auth/weak-password')) return 'Use a password with at least 6 characters.';
  if (code.includes('auth/invalid-credential')) return 'The email or password is incorrect.';
  if (code.includes('auth/popup-closed-by-user')) return 'Google sign-in was closed before it finished.';
  if (code.includes('auth/popup-blocked')) return 'Your browser blocked Google sign-in. Allow popups or use email instead.';
  if (code.includes('auth/network-request-failed')) return 'Connection issue. Check your internet and try again.';
  return mode === 'signup'
    ? 'We could not create your account. Please try again.'
    : 'We could not log you in. Please try again.';
}

export default function VisaAccountGate({
  onClose,
  onAuthenticated,
  signup,
  login,
  loginWithGoogle,
  resetPassword,
}: VisaAccountGateProps) {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    emailRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus();
    };
  }, [loading, onClose]);

  const finish = (user: User) => {
    onAuthenticated(user);
    onClose();
  };

  const handleEmailAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        void trackEvent('signup_started', { method: 'email', source: 'visa_checker' });
        const user = await signup(email.trim(), password);
        void trackEvent('signup_completed', { method: 'email', source: 'visa_checker' });
        finish(user);
      } else {
        finish(await login(email.trim(), password));
      }
    } catch (caught) {
      const message = authMessage(caught, mode);
      setError(message);
      trackAppError('auth_error', { method: mode === 'signup' ? 'email_signup' : 'email_login', errorCode: message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setStatus('');
    setLoading(true);
    try {
      void trackEvent('signup_started', { method: 'google', source: 'visa_checker' });
      const user = await loginWithGoogle();
      void trackEvent('signup_completed', { method: 'google', source: 'visa_checker' });
      finish(user);
    } catch (caught) {
      const message = authMessage(caught, mode);
      setError(message);
      trackAppError('auth_error', { method: 'google', errorCode: message });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Enter your email address first.');
      return;
    }
    setError('');
    setStatus('');
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setStatus('Password reset email sent. Check your inbox.');
    } catch {
      setError('We could not send the reset email. Check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4" role="presentation">
      <button type="button" aria-label="Close account dialog" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !loading && onClose()} />
      <section role="dialog" aria-modal="true" aria-labelledby="visa-account-title" className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl">
        <header className="flex items-start gap-3 bg-[#155e63] px-5 py-5 text-white">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15"><LockKeyhole aria-hidden="true" className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <h2 id="visa-account-title" className="text-lg font-bold">Create a free account to view your result</h2>
            <p className="mt-1 text-xs leading-5 text-white/75">Your answers are ready. Sign up or log in to reveal the policy check.</p>
          </div>
          <button type="button" onClick={onClose} disabled={loading} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 transition hover:bg-white/20 disabled:opacity-50"><X aria-hidden="true" className="h-4 w-4" /></button>
        </header>

        <div className="p-5 sm:p-6">
          <div className="mb-5 grid grid-cols-2 rounded-xl bg-gray-100 p-1" role="tablist" aria-label="Account access">
            {(['signup', 'login'] as const).map((option) => (
              <button key={option} type="button" role="tab" aria-selected={mode === option} onClick={() => { setMode(option); setError(''); setStatus(''); }} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${mode === option ? 'bg-white text-[#155e63] shadow-sm' : 'text-gray-500'}`}>
                {option === 'signup' ? 'Create account' : 'Log in'}
              </button>
            ))}
          </div>

          <button type="button" onClick={() => void handleGoogle()} disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold text-gray-800 transition hover:bg-gray-50 disabled:opacity-50">
            <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full border text-xs font-black text-[#155e63]">G</span>
            Continue with Google
          </button>

          <div className="my-4 flex items-center gap-3" aria-hidden="true"><span className="h-px flex-1 bg-gray-200" /><span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">or use email</span><span className="h-px flex-1 bg-gray-200" /></div>

          <form onSubmit={handleEmailAuth} noValidate>
            <label className="block text-sm font-bold text-gray-800">Email address
              <span className="relative mt-1.5 block">
                <Mail aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input ref={emailRef} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-12 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-[#155e63] focus:ring-2 focus:ring-[#155e63]/15" />
              </span>
            </label>
            <label className="mt-3 block text-sm font-bold text-gray-800">Password
              <span className="relative mt-1.5 block">
                <LockKeyhole aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-[#155e63] focus:ring-2 focus:ring-[#155e63]/15" />
              </span>
            </label>
            {mode === 'login' && <button type="button" onClick={() => void handleReset()} disabled={loading} className="mt-2 text-xs font-bold text-[#155e63] hover:underline disabled:opacity-50">Forgot password?</button>}
            {error && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}
            {status && <p role="status" className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">{status}</p>}
            <button type="submit" disabled={loading || !email.trim() || password.length < 6} className="mt-4 min-h-12 w-full rounded-xl bg-[#155e63] px-4 text-sm font-bold text-white transition hover:bg-[#104c50] disabled:cursor-not-allowed disabled:opacity-45">
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create account and view result' : 'Log in and view result'}
            </button>
          </form>

          <p className="mt-4 text-xs leading-5 text-gray-500">Your visa-check answers stay in this browser and are not saved to your account. By continuing, you agree to the <a href="/terms/" className="font-semibold text-[#155e63] underline">Terms</a> and <a href="/privacy/" className="font-semibold text-[#155e63] underline">Privacy Policy</a>.</p>
        </div>
      </section>
    </div>
  );
}

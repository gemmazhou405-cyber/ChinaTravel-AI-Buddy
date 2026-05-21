import { useState } from 'react';
import { X, Mail, Lock, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  onClose: () => void;
  onSignup: (email: string, password: string) => Promise<unknown>;
  onLogin: (email: string, password: string) => Promise<unknown>;
  onGoogleLogin: () => Promise<unknown>;
}

export default function AuthModal({ onClose, onSignup, onLogin, onGoogleLogin }: Props) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        await onSignup(email, password);
      } else {
        await onLogin(email, password);
      }
      onClose();
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      if (mode === 'signup' && message.includes('auth/email-already-in-use')) {
        setMode('login');
        setError('This email already has an account. Please log in instead.');
      } else {
        setError(message || t('auth.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await onGoogleLogin();
      onClose();
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      if (message.includes('auth/popup-closed-by-user')) {
        setError('Google sign-in was closed before it finished.');
      } else if (message.includes('auth/popup-blocked')) {
        setError('Your browser blocked the Google sign-in popup. Please allow popups and try again.');
      } else {
        setError('Could not sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 bg-[#155e63]">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm">{t('auth.title')}</h3>
            <p className="text-white/60 text-xs">{t('auth.subtitle')}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            {(['signup', 'login'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === m ? 'bg-white text-[#155e63] shadow-sm' : 'text-gray-500'
                }`}
              >
                {m === 'signup' ? t('auth.signup') : t('auth.login')}
              </button>
            ))}
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-xs font-bold text-[#155e63]">G</span>
            Continue with Google
          </button>

          <div className="mb-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-100" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-300">or</span>
            <span className="h-px flex-1 bg-gray-100" />
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder={t('auth.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#155e63]/40"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#155e63]/40"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="w-full mt-4 bg-[#155e63] text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#0e4a4e] transition-colors"
          >
            {loading ? t('auth.loading') : mode === 'signup' ? t('auth.createAccount') : t('auth.loginBtn')}
          </button>

          {mode === 'signup' && (
            <p className="text-center text-gray-400 text-xs mt-3">
              {t('auth.freeNote')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

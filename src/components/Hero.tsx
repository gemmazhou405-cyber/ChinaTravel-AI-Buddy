import { Star, Globe, LogOut, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { UserState } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Francais' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Espanol' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
];

interface Props {
  user: User | null;
  userState: UserState | null;
  onAuthClick: () => void;
  onAskBuddy: () => void;
  onLogout: () => Promise<void>;
  onResendVerification: () => Promise<void>;
}

export default function Hero({ user, userState, onAuthClick, onAskBuddy, onLogout, onResendVerification }: Props) {
  const { t } = useTranslation();
  const [lang, setLang] = useState(i18n.language.toUpperCase());
  const [langOpen, setLangOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const assetBase = import.meta.env.BASE_URL;
  const planLabel = userState?.plan ? userState.plan.charAt(0).toUpperCase() + userState.plan.slice(1) : 'Free';
  const isPasswordUser = user?.providerData.some((provider) => provider.providerId === 'password') ?? false;
  const isGoogleUser = user?.providerData.some((provider) => provider.providerId === 'google.com') ?? false;
  const emailVerified = Boolean(user?.emailVerified || isGoogleUser);
  const showResendVerification = Boolean(user && isPasswordUser && !user.emailVerified);

  useEffect(() => {
    const saved = window.localStorage?.getItem('chinaease-lang');
    if (saved) {
      i18n.changeLanguage(saved);
      setLang(saved.toUpperCase());
    }
  }, []);

  const handleLangChange = (code: string) => {
    i18n.changeLanguage(code);
    setLang(code.toUpperCase());
    setLangOpen(false);
    window.localStorage?.setItem('chinaease-lang', code);
  };

  const scrollToTabs = () => {
    document.getElementById('tabs')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      <style>{`
        .hero-bg {
          background:
            linear-gradient(to right, rgba(0,0,0,0.70) 0%, rgba(21,94,99,0.45) 50%, rgba(0,0,0,0.20) 100%),
            url("/hero.jpg") center center/cover no-repeat;
        }
        @media (max-width: 768px) {
          .hero-bg {
            background:
              linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, rgba(21,94,99,0.12) 38%, rgba(0,0,0,0.34) 76%, rgba(0,0,0,0.52) 100%),
              linear-gradient(to right, rgba(0,0,0,0.24) 0%, rgba(21,94,99,0.10) 54%, rgba(0,0,0,0.08) 100%),
              url("/hero-mobile.jpg") 57% 18%/cover no-repeat;
          }
        }
      `}</style>

      <div className="hero-bg absolute inset-0" />

      {/* Nav bar */}
      <div className="relative z-20 flex items-center justify-between px-4 py-3 md:px-10 md:py-5">
        <div className="flex items-center gap-2">
          <img src={`${assetBase}logo.png`} width="28" height="28" alt="ChinaEase Buddy" style={{ borderRadius: '6px' }} />
          <span className="text-white font-semibold text-sm tracking-tight">ChinaEase Buddy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 text-white/80 text-xs hover:text-white transition-colors bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20"
            >
              <Globe className="w-3 h-3" />
              <span>{lang}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl overflow-hidden z-50 min-w-[100px]">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleLangChange(l.code)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      l.code.toUpperCase() === lang ? 'bg-[#155e63]/10 text-[#155e63] font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={scrollToTabs}
            className="hidden md:block text-white/80 text-sm hover:text-white transition-colors"
          >
            {t('nav.howItWorks')}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setAccountOpen((open) => !open)}
                className="text-xs md:text-sm font-medium bg-white text-[#155e63] px-3 py-1.5 md:px-4 md:py-2 rounded-full hover:bg-[#f7f3ea] transition-all shadow-lg"
              >
                {t('nav.currentPlan', { plan: planLabel })}
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white p-4 text-gray-700 shadow-2xl z-50">
                  <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#155e63]">Account</p>
                      <p className="mt-1 truncate text-sm font-semibold text-gray-900">{user.email}</p>
                    </div>
                    <button onClick={() => setAccountOpen(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2 py-3 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Current plan</span>
                      <span className="font-semibold text-[#155e63]">{planLabel}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Buddy AI quota</span>
                      <span className="font-semibold text-gray-900">{userState?.buddyAiQuotaUsed ?? 0} / {userState?.buddyAiQuotaTotal ?? 5}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Menu scan quota</span>
                      <span className="font-semibold text-gray-900">{userState?.menuScanQuotaUsed ?? 0} / {userState?.menuScanQuotaTotal ?? 3}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Email verification</span>
                      <span className={`font-semibold ${emailVerified ? 'text-[#155e63]' : 'text-amber-600'}`}>
                        {emailVerified ? 'Verified' : 'Not verified'}
                      </span>
                    </div>
                  </div>
                  {showResendVerification && (
                    <button
                      onClick={async () => {
                        await onResendVerification();
                      }}
                      className="mb-2 w-full rounded-xl border border-amber-100 bg-amber-50 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                    >
                      Resend verification email
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmLogoutOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="text-xs md:text-sm font-medium bg-white text-[#155e63] px-3 py-1.5 md:px-4 md:py-2 rounded-full hover:bg-[#f7f3ea] transition-all shadow-lg"
            >
              {t('nav.startFree')}
            </button>
          )}
        </div>
      </div>

      {/* 主内容：badge + slogan + subtitle + 按钮，整体放在画面上半部分 */}
      <div className="relative z-10 flex-1 flex flex-col justify-start px-6 md:px-10 max-w-7xl mx-auto w-full pt-8 md:pt-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 mb-4">
            <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
            <span className="text-white/90 text-xs font-medium">{t('hero.badge')}</span>
          </div>

          <h1
            className="font-black text-white leading-none tracking-tight mb-4 drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)]"
            style={{ fontSize: 'clamp(2.8rem, 9vw, 5.5rem)' }}
          >
            {t('hero.line1')}<br />
            {t('hero.line2')}<br />
            <span className="text-[#7dd3d8]">{t('hero.line3')}</span>
          </h1>

          <p className="text-white/82 text-sm md:text-lg leading-relaxed mb-6 max-w-lg drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
            {t('hero.subtitle')}
          </p>

          <div className="absolute left-1/2 bottom-[17vh] z-20 flex w-[min(17.5rem,calc(100vw-2.5rem))] -translate-x-1/2 flex-col gap-2 md:static md:w-auto md:translate-x-0 md:flex-row">
            <button
              onClick={onAuthClick}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#155e63] text-white font-semibold px-5 py-3.5 md:px-8 md:py-4 rounded-xl hover:bg-[#0e4a4e] transition-all shadow-2xl md:shadow-xl text-sm md:text-base"
            >
              <span>{t('hero.cta')}</span>
              <span className="text-white/60">· No download needed</span>
            </button>
            <button
              onClick={onAskBuddy}
              className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/12 px-5 py-3.5 text-sm font-semibold text-white shadow-xl backdrop-blur-sm transition-all hover:bg-white/18 md:px-7 md:py-4 md:text-base"
            >
              Ask Buddy
            </button>
          </div>

          <p className="text-white/50 text-xs mt-3">
            {t('hero.trust')}
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce">
        <div className="w-5 h-8 border-2 border-white/30 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </div>
      </div>
      {confirmLogoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirmLogoutOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-950">Log out?</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">Are you sure you want to log out of ChinaEase Buddy?</p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setConfirmLogoutOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setConfirmLogoutOpen(false);
                  setAccountOpen(false);
                  await onLogout();
                }}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

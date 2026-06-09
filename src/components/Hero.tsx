import { ChevronDown, Globe, LogOut, ShieldCheck, Sparkles, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { UserState } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
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
  const currentPlan = userState?.plan ?? 'free';
  const planLabel = t(`pay.plans.${currentPlan}.name`);
  const isPasswordUser = user?.providerData.some((provider) => provider.providerId === 'password') ?? false;
  const isGoogleUser = user?.providerData.some((provider) => provider.providerId === 'google.com') ?? false;
  const emailVerified = Boolean(user?.emailVerified || isGoogleUser);
  const showResendVerification = Boolean(user && isPasswordUser && !user.emailVerified);
  const navLinks = [
    { label: t('nav.guides'), href: '/china-travel-apps' },
    { label: t('nav.destinations'), href: '/china-travel-checklist' },
    { label: t('nav.tools'), href: '#journey-tools' },
    { label: t('nav.services'), href: '/pricing' },
    { label: t('nav.aboutUs'), href: '/about' },
    { label: t('nav.contact'), href: '/contact' },
  ];

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
    <section className="relative h-[68svh] min-h-[29rem] max-h-[34rem] md:h-auto md:min-h-[92vh] md:max-h-none flex flex-col overflow-hidden bg-[#061e1f]">
      <style>{`
        .hero-bg {
          background:
            radial-gradient(circle at 76% 26%, rgba(232,194,122,0.22), transparent 31%),
            linear-gradient(110deg, rgba(2,10,11,0.92) 0%, rgba(6,30,31,0.76) 42%, rgba(6,30,31,0.30) 72%, rgba(2,10,11,0.88) 100%),
            linear-gradient(to bottom, rgba(2,10,11,0.22), rgba(2,10,11,0.84)),
            url("/china-landscape.svg") center center/cover no-repeat;
        }
        @media (max-width: 768px) {
          .hero-bg {
            background:
              radial-gradient(circle at 72% 24%, rgba(232,194,122,0.20), transparent 34%),
              linear-gradient(to bottom, rgba(2,10,11,0.52) 0%, rgba(6,30,31,0.36) 42%, rgba(2,10,11,0.82) 100%),
              url("/china-landscape.svg") 57% center/cover no-repeat;
          }
        }
      `}</style>

      <div className="hero-bg absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_18%,rgba(0,0,0,0.28)_82%,#061e1f_100%)]" />

      {/* Nav bar */}
      <div className="relative z-20 px-3 py-3 md:px-8 md:py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/12 bg-[#061e1f]/55 px-3 py-2 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl md:bg-[#061e1f]/42 md:px-5 md:py-3">
        <div className="flex min-w-0 items-center gap-2">
          <img src={`${assetBase}logo.png`} width="34" height="34" alt="ChinaEase Buddy" className="h-8 w-8 shrink-0 rounded-lg ring-1 ring-white/20 md:h-9 md:w-9" />
          <span className="truncate text-sm font-semibold tracking-tight text-white md:text-base">ChinaEase Buddy</span>
        </div>
        <nav className="hidden items-center gap-5 text-sm font-medium text-white/72 lg:flex">
          {navLinks.map((link) => (
            link.href.startsWith('#') ? (
              <button
                key={link.label}
                onClick={() => document.getElementById('journey-tools')?.scrollIntoView({ behavior: 'smooth' })}
                className="transition-colors hover:text-[#e8c27a]"
              >
                {link.label}
              </button>
            ) : (
              <a key={link.label} href={link.href} className="transition-colors hover:text-[#e8c27a]">
                {link.label}
              </a>
            )
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1.5 text-[11px] text-white/86 backdrop-blur-sm transition-colors hover:text-white md:text-xs"
            >
              <Globe className="w-3 h-3" />
              <span>{lang}</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
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
            className="hidden text-sm text-white/80 transition-colors hover:text-[#e8c27a] lg:hidden"
          >
            {t('nav.howItWorks')}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setAccountOpen((open) => !open)}
                className="hidden max-w-[9rem] truncate rounded-full bg-[#e8c27a] px-4 py-2 text-sm font-bold text-[#061e1f] shadow-[0_14px_34px_rgba(232,194,122,0.24)] transition-all hover:bg-[#f4d78f] md:block"
              >
                {t('nav.currentPlan', { plan: planLabel })}
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white p-4 text-gray-700 shadow-2xl z-50">
                  <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#155e63]">{t('account.title')}</p>
                      <p className="mt-1 truncate text-sm font-semibold text-gray-900">{user.email}</p>
                    </div>
                    <button onClick={() => setAccountOpen(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2 py-3 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">{t('account.currentPlan')}</span>
                      <span className="font-semibold text-[#155e63]">{planLabel}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">{t('account.buddyQuota')}</span>
                      <span className="font-semibold text-gray-900">{userState?.buddyAiQuotaUsed ?? 0} / {userState?.buddyAiQuotaTotal ?? 5}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">{t('account.menuQuota')}</span>
                      <span className="font-semibold text-gray-900">{userState?.menuScanQuotaUsed ?? 0} / {userState?.menuScanQuotaTotal ?? 3}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">{t('account.emailVerification')}</span>
                      <span className={`font-semibold ${emailVerified ? 'text-[#155e63]' : 'text-amber-600'}`}>
                        {emailVerified ? t('account.verified') : t('account.notVerified')}
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
                      {t('account.resendVerification')}
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmLogoutOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('account.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="hidden rounded-full bg-[#e8c27a] px-4 py-2 text-sm font-bold text-[#061e1f] shadow-[0_14px_34px_rgba(232,194,122,0.24)] transition-all hover:bg-[#f4d78f] md:block"
            >
              {t('nav.getHelpNow')}
            </button>
          )}
        </div>
      </div>
      </div>

      {/* 主内容：badge + slogan + subtitle + 按钮，整体放在画面上半部分 */}
      <div className="relative z-10 flex w-full flex-1 flex-col justify-center px-4 pb-8 pt-1 md:mx-auto md:max-w-7xl md:px-10 md:pb-24 md:pt-3">
        <div className="max-w-3xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#e8c27a]/35 bg-[#e8c27a]/12 px-3 py-1.5 backdrop-blur-sm md:mb-5">
            <Star className="h-3.5 w-3.5 fill-[#e8c27a] text-[#e8c27a]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#f6ddb0] md:text-xs">{t('hero.badge')}</span>
          </div>

          <h1
            className="mb-3 leading-[0.96] tracking-[-0.035em] text-[#fffaf0] drop-shadow-[0_6px_34px_rgba(0,0,0,0.52)] md:mb-6"
            style={{ fontFamily: 'Cormorant Garamond, Playfair Display, Georgia, serif', fontSize: 'clamp(2.55rem, 11vw, 6.6rem)' }}
          >
            {t('hero.titleLine1')}<br />
            <span className="text-[#e8c27a]">{t('hero.titleLine2')}</span>
          </h1>

          <p className="mb-4 max-w-[20rem] text-sm font-semibold leading-relaxed text-[#fffaf0]/95 drop-shadow-[0_2px_18px_rgba(0,0,0,0.78)] md:mb-7 md:max-w-xl md:text-xl md:font-medium md:text-[#f7f2e8]/92">
            <span className="md:hidden">{t('hero.mobileSubtitle')}</span>
            <span className="hidden md:inline">{t('hero.homeSubtitle')}</span>
          </p>

          <div className="flex w-[min(17rem,100%)] flex-col gap-2 min-[420px]:w-[18rem] md:w-auto md:flex-row md:gap-3">
            <button
              onClick={onAuthClick}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#e8c27a] px-5 text-sm font-bold text-[#061e1f] shadow-[0_18px_44px_rgba(232,194,122,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#f4d78f] md:h-auto md:w-auto md:px-8 md:py-4 md:text-base"
            >
              <span>{t('hero.startFree')}</span>
            </button>
            <button
              onClick={onAskBuddy}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/26 bg-white/14 px-5 text-sm font-bold text-white shadow-xl backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/18 md:h-auto md:w-auto md:px-7 md:py-4 md:text-base"
            >
              {t('hero.askBuddy')}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-[#fffaf0]/94 drop-shadow-[0_1px_12px_rgba(0,0,0,0.76)] md:mt-6 md:text-xs">
            <span className="md:hidden">{t('hero.mobileTrustShort')}</span>
            <span className="hidden items-center gap-2 md:inline-flex"><ShieldCheck className="h-4 w-4 text-[#e8c27a]" />{t('hero.trustTrusted')}</span>
            <span className="hidden items-center gap-2 md:inline-flex"><Sparkles className="h-4 w-4 text-[#e8c27a]" />{t('hero.trustSupport')}</span>
            <span className="hidden items-center gap-2 md:inline-flex"><ShieldCheck className="h-4 w-4 text-[#e8c27a]" />{t('hero.trustSafety')}</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden flex-col items-center gap-1 animate-bounce md:flex">
        <div className="w-5 h-8 border-2 border-white/30 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </div>
      </div>
      {confirmLogoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirmLogoutOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-950">{t('account.logoutTitle')}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{t('account.logoutText')}</p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setConfirmLogoutOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                {t('account.cancel')}
              </button>
              <button
                onClick={async () => {
                  setConfirmLogoutOpen(false);
                  setAccountOpen(false);
                  await onLogout();
                }}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                {t('account.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

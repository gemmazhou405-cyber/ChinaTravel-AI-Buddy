import { ChevronDown, LogOut, X } from 'lucide-react';
import { useState } from 'react';
import { User } from 'firebase/auth';
import { UserState } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface Props {
  user: User | null;
  userState: UserState | null;
  onNeedAuth: () => void;
  onAskBuddy: () => void;
  onOpenToolkit: () => void;
  onNavigate: (id: string) => void;
  onLogout: () => Promise<void>;
  onResendVerification: () => Promise<void>;
}

export default function SiteHeader({ user, userState, onNeedAuth, onAskBuddy, onOpenToolkit, onNavigate, onLogout, onResendVerification }: Props) {
  const { t } = useTranslation();
  const [accountOpen, setAccountOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const assetBase = import.meta.env.BASE_URL;
  const currentPlan = userState?.plan ?? 'free';
  const planLabel = t(`pay.plans.${currentPlan}.name`);
  const isPasswordUser = user?.providerData.some((provider) => provider.providerId === 'password') ?? false;
  const isGoogleUser = user?.providerData.some((provider) => provider.providerId === 'google.com') ?? false;
  const emailVerified = Boolean(user?.emailVerified || isGoogleUser);
  const showResendVerification = Boolean(user && isPasswordUser && !user.emailVerified);

  const NAV = [
    { id: 'toolkit', label: t('home.nav.toolkit') },
    { id: 'features', label: t('home.nav.features') },
    { id: 'travel-passes', label: t('home.nav.pricing') },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-hairline/70 bg-canvas/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-container items-center justify-between gap-3 px-6 md:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <img src={`${assetBase}logo.png`} width="30" height="30" alt="" className="h-[30px] w-[30px] rounded-lg" />
          <span className="truncate text-sm font-semibold tracking-tight text-ink md:text-base">ChinaEase Buddy</span>
          <span className="hidden rounded-full border border-jade/25 bg-jade-wash px-2 py-0.5 text-[11px] font-semibold text-jade sm:inline">
            {t('home.hero.free')}
          </span>
        </div>

        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-secondary lg:flex">
          {NAV.map(({ id, label }) => (
            <button key={id} onClick={() => onNavigate(id)} className="transition-colors duration-hover ease-out hover:text-ink">
              {label}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onAskBuddy}
            className="hidden text-sm font-medium text-jade transition-colors duration-hover ease-out hover:text-[#0B4145] md:inline"
          >
            {t('home.hero.ctaSecondary')}
          </button>
          <button
            onClick={onOpenToolkit}
            className="hidden rounded-lg bg-jade px-3.5 py-2 text-sm font-semibold text-white transition-colors duration-hover ease-out hover:bg-[#0B4145] md:inline-flex"
          >
            {t('home.hero.ctaPrimary')}
          </button>
          <LanguageSwitcher />
          {user ? (
            <div className="relative">
              <button
                onClick={() => setAccountOpen((open) => !open)}
                className="flex items-center gap-2 rounded-lg border border-hairline bg-surface py-1 pl-1 pr-2 transition-colors duration-hover ease-out hover:border-ink-tertiary"
                aria-label={t('account.title')}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-jade text-xs font-semibold text-white">
                  {(user.email?.[0] ?? '?').toUpperCase()}
                </span>
                <ChevronDown className="h-3 w-3 shrink-0 text-ink-tertiary" strokeWidth={1.5} />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-hairline bg-surface p-4 shadow-card">
                  <div className="flex items-start justify-between gap-3 border-b border-hairline pb-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-jade text-sm font-semibold text-white">
                        {(user.email?.[0] ?? '?').toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-jade">{t('account.title')}</p>
                        <p className="mt-0.5 truncate text-sm font-medium text-ink">{user.email}</p>
                      </div>
                    </div>
                    <button onClick={() => setAccountOpen(false)} className="rounded-md p-1 text-ink-tertiary transition-colors duration-hover ease-out hover:text-ink" aria-label={t('footer.close')}>
                      <X className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="space-y-2 py-3 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="text-ink-tertiary">{t('account.currentPlan')}</span>
                      <span className="font-medium text-jade">{planLabel}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-ink-tertiary">{t('account.buddyQuota')}</span>
                      <span className="font-medium text-ink">{userState?.buddyAiQuotaUsed ?? 0} / {userState?.buddyAiQuotaTotal ?? 5}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-ink-tertiary">{t('account.emailVerification')}</span>
                      <span className={`font-medium ${emailVerified ? 'text-jade' : 'text-amber-600'}`}>
                        {emailVerified ? t('account.verified') : t('account.notVerified')}
                      </span>
                    </div>
                  </div>
                  {showResendVerification && (
                    <button
                      onClick={async () => { await onResendVerification(); }}
                      className="mb-2 w-full rounded-lg border border-hairline bg-canvas py-2.5 text-sm font-medium text-ink-secondary transition-colors duration-hover ease-out hover:text-ink"
                    >
                      {t('account.resendVerification')}
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmLogoutOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-hairline py-2.5 text-sm font-medium text-red-600 transition-colors duration-hover ease-out hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.5} />
                    {t('account.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onNeedAuth}
              className="rounded-lg border border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors duration-hover ease-out hover:border-ink-tertiary"
            >
              {t('nav.login')}
            </button>
          )}
        </div>
      </div>

      {confirmLogoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirmLogoutOpen(false)}>
          <div className="animate-modal-in w-full max-w-sm rounded-[20px] bg-surface p-6 shadow-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3 className="text-lg font-semibold text-ink">{t('account.logoutTitle')}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{t('account.logoutText')}</p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setConfirmLogoutOpen(false)}
                className="flex-1 rounded-lg border border-hairline py-2.5 text-sm font-medium text-ink-secondary transition-colors duration-hover ease-out hover:text-ink"
              >
                {t('account.cancel')}
              </button>
              <button
                onClick={async () => {
                  setConfirmLogoutOpen(false);
                  setAccountOpen(false);
                  await onLogout();
                }}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white transition-colors duration-hover ease-out hover:bg-red-700"
              >
                {t('account.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

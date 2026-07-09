import { ChevronDown, LogOut, X } from 'lucide-react';
import { useState } from 'react';
import { User } from 'firebase/auth';
import { UserState } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface Props {
  user: User | null;
  userState: UserState | null;
  onGetHelpNow: () => void;
  onNeedAuth: () => void;
  onAskBuddy: () => void;
  onLogout: () => Promise<void>;
  onResendVerification: () => Promise<void>;
}

export default function Hero({ user, userState, onGetHelpNow, onNeedAuth, onAskBuddy, onLogout, onResendVerification }: Props) {
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

  return (
    <section className="bg-canvas">
      {/* Header */}
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-container items-center justify-between px-6 py-4 md:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <img src={`${assetBase}logo.png`} width="32" height="32" alt="" className="h-8 w-8 rounded-lg" />
            <span className="truncate text-sm font-semibold tracking-tight text-ink md:text-base">ChinaEase Buddy</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher />
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setAccountOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-lg border border-hairline bg-surface py-1 pl-1 pr-2.5 transition-colors duration-hover ease-out hover:border-ink-tertiary"
                  aria-label={t('account.title')}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-jade text-xs font-semibold text-white">
                    {(user.email?.[0] ?? '?').toUpperCase()}
                  </span>
                  <span className="hidden max-w-[7rem] truncate text-xs font-medium text-ink-secondary sm:inline">{user.email}</span>
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
                      <button onClick={() => setAccountOpen(false)} className="rounded-md p-1 text-ink-tertiary transition-colors duration-hover ease-out hover:text-ink">
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
      </header>

      {/* Hero body — text first on mobile, image right on desktop */}
      <div className="mx-auto grid max-w-container items-center gap-10 px-6 pb-20 pt-14 md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:px-8 md:py-32">
        <div>
          <h1 className="font-display text-[40px] font-normal leading-[1.05] tracking-[-0.02em] text-ink md:text-[64px]">
            {t('home.hero.title')}
          </h1>
          <p className="mt-6 max-w-[32rem] text-lg leading-relaxed text-ink-secondary md:text-xl">
            {t('home.hero.subtitle')}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={user ? onGetHelpNow : onNeedAuth}
              className="rounded-lg bg-jade px-6 py-3.5 text-base font-semibold text-white transition-colors duration-hover ease-out hover:bg-[#0B4145]"
            >
              {t('home.hero.ctaPrimary')}
            </button>
            <button
              onClick={onAskBuddy}
              className="rounded-lg border border-hairline bg-surface px-6 py-3.5 text-base font-semibold text-ink transition-colors duration-hover ease-out hover:border-ink-tertiary"
            >
              {t('home.hero.ctaSecondary')}
            </button>
          </div>
        </div>

        <picture>
          <source
            type="image/avif"
            srcSet={`${assetBase}hero-product-768.avif 768w, ${assetBase}hero-product-1200.avif 1200w`}
            sizes="(min-width: 768px) 45vw, calc(100vw - 48px)"
          />
          <source
            type="image/webp"
            srcSet={`${assetBase}hero-product-768.webp 768w, ${assetBase}hero-product-1200.webp 1200w`}
            sizes="(min-width: 768px) 45vw, calc(100vw - 48px)"
          />
          <img
            src={`${assetBase}hero-product.png`}
            width={1200}
            height={1500}
            alt={t('home.hero.imageAlt')}
            decoding="async"
            className="aspect-[4/5] w-full rounded-2xl object-cover shadow-card"
            {...({ fetchpriority: 'high' } as Record<string, string>)}
          />
        </picture>
      </div>

      {confirmLogoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirmLogoutOpen(false)}>
          <div className="w-full max-w-sm rounded-[20px] bg-surface p-6 shadow-card animate-modal-in" onClick={(e) => e.stopPropagation()}>
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
    </section>
  );
}

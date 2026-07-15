import { Check, X } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserState } from '../../hooks/useAuth';
import { trackAppError, trackEvent } from '../../lib/analytics';
import { PLANS } from '../PricingPlans';
import { useRevealOnView } from '../../hooks/useRevealOnView';
import { captureCheckoutOrder, createCheckoutOrder, MANUAL_PAYPAL_LINKS, paymentMode } from '../../lib/payment';

type PaidPlan = 'trip' | 'group';

interface Props {
  user: User | null;
  userState: UserState | null;
  showToast: (msg: string) => void;
  onNeedAuth: () => void;
  onOpenToolkit: () => void;
  onRefreshUserState?: () => Promise<UserState | null>;
}

export default function HomePasses({ user, userState, showToast, onNeedAuth, onOpenToolkit, onRefreshUserState }: Props) {
  const { t } = useTranslation();
  const { ref, revealed } = useRevealOnView<HTMLElement>();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<PaidPlan | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutOrderId, setCheckoutOrderId] = useState('');
  const [checkoutApprovalUrl, setCheckoutApprovalUrl] = useState('');

  const hasActivePaidPass = Boolean(
    userState
      && (userState.plan === 'trip' || userState.plan === 'group')
      && (!userState.planExpiresAt || userState.planExpiresAt > Date.now()),
  );

  const handleCta = (plan: string) => {
    if (loadingPlan) return;
    const isPaid = plan === 'trip' || plan === 'group';
    void trackEvent('cta_clicked', {
      ctaName: plan === 'trip' ? 'Get Trip Pass' : plan === 'group' ? 'Get Group Pass' : 'Start Free',
      destination: isPaid ? (paymentMode === 'sandbox' ? 'PayPal Checkout' : 'PayPal Manual Link') : 'free-toolkit',
      tool: 'pay',
      plan: plan === 'trip' ? 'trip_pass' : plan === 'group' ? 'group_pass' : 'free',
    }, userState?.uid);

    if (!isPaid) {
      setLoadingPlan(plan);
      window.setTimeout(() => setLoadingPlan(null), 500);
      onOpenToolkit();
      return;
    }
    if (!user) {
      showToast(t('pay.claim.signInFirst'));
      onNeedAuth();
      return;
    }
    if (hasActivePaidPass) {
      showToast(t('pay.checkout.activePass'));
      return;
    }
    setLoadingPlan(plan);
    if (paymentMode === 'sandbox') {
      setCheckoutPlan(plan as PaidPlan);
      setAcknowledged(false);
      setCheckoutError('');
      setCheckoutOrderId('');
      setCheckoutApprovalUrl('');
      setLoadingPlan(null);
      return;
    }
    window.open(MANUAL_PAYPAL_LINKS[plan as PaidPlan], '_blank', 'noopener,noreferrer');
    window.setTimeout(() => setLoadingPlan(null), 900);
  };

  const handleCreateCheckout = async () => {
    if (!user || !checkoutPlan || !acknowledged) return;
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      const order = await createCheckoutOrder(user, checkoutPlan);
      setCheckoutOrderId(order.orderId);
      setCheckoutApprovalUrl(order.approvalUrl);
      void trackEvent('checkout_created', {
        tool: 'pay',
        plan: checkoutPlan === 'trip' ? 'trip_pass' : 'group_pass',
        status: order.status,
      }, user.uid);
      window.open(order.approvalUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      trackAppError('checkout_error', {
        tool: 'pay',
        plan: checkoutPlan === 'trip' ? 'trip_pass' : 'group_pass',
        context: 'home_create_order',
        errorCode: error instanceof Error ? error.message.slice(0, 80) : 'create_order_failed',
      }, user.uid);
      setCheckoutError(error instanceof Error ? error.message : t('pay.checkout.createError'));
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCaptureCheckout = async () => {
    if (!user || !checkoutOrderId) return;
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      const result = await captureCheckoutOrder(user, checkoutOrderId);
      if (result.status === 'completed') {
        void trackEvent('payment_completed', {
          tool: 'pay',
          plan: checkoutPlan === 'trip' ? 'trip_pass' : 'group_pass',
          status: 'completed',
        }, user.uid);
        await onRefreshUserState?.();
        showToast(t('pay.checkout.success'));
        setCheckoutPlan(null);
        setCheckoutOrderId('');
        setCheckoutApprovalUrl('');
        return;
      }
      showToast(t('pay.checkout.pending'));
    } catch (error) {
      trackAppError('checkout_error', {
        tool: 'pay',
        plan: checkoutPlan === 'trip' ? 'trip_pass' : 'group_pass',
        context: 'home_capture_order',
        errorCode: error instanceof Error ? error.message.slice(0, 80) : 'capture_order_failed',
      }, user.uid);
      setCheckoutError(error instanceof Error ? error.message : t('pay.checkout.captureError'));
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <section ref={ref} id="travel-passes" className={`scroll-mt-20 bg-canvas py-20 md:py-32 ${revealed ? 'motion-reveal-on' : ''}`}>
      <div className="mx-auto max-w-container px-6 md:px-8">
        <h2 className="motion-reveal-item max-w-[26rem] font-display text-3xl font-normal leading-[1.1] tracking-[-0.01em] text-ink md:max-w-[34rem] md:text-[44px]">
          {t('home.passes.header')}
        </h2>
        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-6">
          {PLANS.map(({ key, price, periodKey, highlighted }, planIndex) => {
            const isFree = key === 'free';
            const paidDisabled = !isFree && hasActivePaidPass;
            const isLoading = loadingPlan === key;
            return (
              <div
                key={key}
                className={`motion-reveal-item motion-safe-hover-lift ${
                  isFree
                    ? 'rounded-2xl border border-hairline bg-white/40 p-6 backdrop-blur-sm md:p-8'
                    : highlighted
                      ? 'glass rounded-2xl border-jade/40 p-6 !shadow-[var(--glass-highlight),var(--jade-glow)] md:p-8'
                      : 'glass rounded-2xl p-6 md:p-8'
                }`}
                style={{ '--reveal-index': planIndex + 1 } as CSSProperties}
              >
                <h3 className="text-xl font-semibold text-ink">{t(`pay.plans.${key}.name`)}</h3>
                <p className="mt-1 text-sm leading-snug text-ink-tertiary">{t(`pay.plans.${key}.desc`)}</p>
                <p className="mt-4">
                  <span className="text-[32px] font-semibold tracking-tight text-ink">{price}</span>
                  {periodKey && <span className="ml-2 text-sm text-ink-tertiary">{t(periodKey)}</span>}
                </p>
                <ul className="mt-6 space-y-3">
                  {(t(`pay.plans.${key}.features`, { returnObjects: true }) as string[]).map((feature, featureIndex) => (
                    <li
                      key={feature}
                      className="motion-reveal-item flex items-start gap-2.5 text-sm leading-snug text-ink-secondary md:text-base"
                      style={{ '--reveal-index': planIndex + featureIndex + 2 } as CSSProperties}
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-jade" strokeWidth={1.5} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCta(key)}
                  disabled={paidDisabled || isLoading}
                  className={`mt-8 w-full rounded-lg px-6 py-3.5 text-base font-semibold transition-[background-color,border-color,transform,opacity] duration-hover ease-out active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${
                    highlighted
                      ? 'bg-jade text-white hover:-translate-y-0.5 hover:bg-[#0B4145]'
                      : 'border border-hairline bg-surface text-ink hover:-translate-y-0.5 hover:border-ink-tertiary'
                  }`}
                >
                  {isLoading ? t('pay.checkout.opening') : paidDisabled ? t('pay.checkout.activeButton') : t(`pay.plans.${key}.cta`)}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm text-ink-tertiary">{t('home.passes.note')}</p>
      </div>
      {checkoutPlan && user && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => !checkoutLoading && setCheckoutPlan(null)}
        >
          <div
            className="max-h-[92svh] w-full overflow-y-auto rounded-t-3xl bg-[#fffdf8] p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-checkout-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6a85a]">
                  {paymentMode === 'sandbox' ? t('pay.checkout.sandboxBadge') : t('pay.checkout.secureCheckout')}
                </p>
                <h3 id="home-checkout-title" className="mt-1 text-xl font-bold text-gray-950">
                  {t('pay.checkout.title', { plan: t(`pay.plans.${checkoutPlan}.name`) })}
                </h3>
              </div>
              <button
                onClick={() => !checkoutLoading && setCheckoutPlan(null)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-40"
                disabled={checkoutLoading}
                aria-label={t('footer.close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 rounded-2xl border border-[#155e63]/12 bg-[#155e63]/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#155e63]">{t('pay.claim.accountLabel')}</p>
              <p className="mt-1 break-words text-sm font-bold text-gray-950">{user.email}</p>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">{t('pay.checkout.accountHelp')}</p>
            </div>
            <div className="mt-4 grid gap-3 rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-gray-950">{t(`pay.plans.${checkoutPlan}.name`)}</p>
                  <p className="text-xs text-gray-500">{checkoutPlan === 'trip' ? t('pay.checkout.tripValidity') : t('pay.checkout.groupValidity')}</p>
                </div>
                <p className="text-xl font-black text-[#155e63]">{checkoutPlan === 'trip' ? '$9.90' : '$29.90'}</p>
              </div>
              <ul className="space-y-2">
                {(t(`pay.checkout.${checkoutPlan}.features`, { returnObjects: true }) as string[]).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs font-medium text-gray-600">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#155e63]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <label className="flex items-start gap-2 rounded-xl bg-[#f7f3ea] p-3 text-xs font-medium leading-relaxed text-gray-600">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(event) => setAcknowledged(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#155e63]"
                />
                <span>{t('pay.checkout.acknowledgement')}</span>
              </label>
            </div>
            {checkoutError && <p className="mt-3 text-sm font-semibold text-red-600" aria-live="polite">{checkoutError}</p>}
            <div className="mt-4 grid gap-2 sm:grid-cols-2" aria-live="polite">
              <button
                onClick={handleCreateCheckout}
                disabled={!acknowledged || checkoutLoading}
                className="rounded-xl bg-[#155e63] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0e4a4e] disabled:opacity-50"
              >
                {checkoutLoading && !checkoutOrderId ? t('pay.checkout.creating') : t('pay.checkout.openPaypal')}
              </button>
              <button
                onClick={handleCaptureCheckout}
                disabled={!checkoutOrderId || checkoutLoading}
                className="rounded-xl border border-[#155e63]/15 bg-white px-4 py-3 text-sm font-bold text-[#155e63] transition-colors hover:bg-[#155e63]/5 disabled:opacity-50"
              >
                {checkoutLoading && checkoutOrderId ? t('pay.checkout.capturing') : t('pay.checkout.confirmPayment')}
              </button>
            </div>
            {checkoutApprovalUrl && (
              <a href={checkoutApprovalUrl} target="_blank" rel="noreferrer" className="mt-3 block text-center text-xs font-bold text-[#155e63] underline">
                {t('pay.checkout.reopenPaypal')}
              </a>
            )}
            <p className="mt-4 text-xs leading-relaxed text-gray-500">{t('pay.checkout.legalLinks')}</p>
            <div className="mt-2 flex gap-3 text-xs font-semibold text-[#155e63]">
              <a href="/terms" target="_blank" rel="noreferrer">{t('footer.terms')}</a>
              <a href="/privacy" target="_blank" rel="noreferrer">{t('footer.privacy')}</a>
              <a href="/refund" target="_blank" rel="noreferrer">{t('footer.refundPolicy')}</a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

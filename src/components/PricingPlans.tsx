import { Check, ShieldCheck, X, Zap } from 'lucide-react';
import type { User } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import type { UserState } from '../hooks/useAuth';
import { trackAppError, trackEvent } from '../lib/analytics';
import { db } from '../firebase-config';
import { captureCheckoutOrder, createCheckoutOrder, paymentMode } from '../lib/payment';

const GUMROAD_LINKS = {
  trip: 'https://gemmazhou.gumroad.com/l/oentc',
  group: 'https://gemmazhou.gumroad.com/l/mbgkxz',
} as const;

const PLANS = [
  {
    key: 'free',
    price: '$0',
    periodKey: '',
    ctaStyle: 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50',
    highlighted: false,
  },
  {
    key: 'trip',
    price: '$9.90',
    periodKey: 'pay.oneTime',
    ctaStyle: 'bg-white text-[#155e63] hover:bg-gray-50 font-bold',
    highlighted: true,
  },
  {
    key: 'group',
    price: '$29.90',
    periodKey: 'pay.oneTime',
    ctaStyle: 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50',
    highlighted: false,
  },
];

interface Props {
  user?: User | null;
  userState: UserState | null;
  showToast: (msg: string) => void;
  onCtaClick?: (plan: string) => void;
  onNeedAuth?: () => void;
  onRefreshUserState?: () => Promise<UserState | null>;
}

type PaidPlan = 'trip' | 'group';

export default function PricingPlans({ user, userState, showToast, onCtaClick, onNeedAuth, onRefreshUserState }: Props) {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<PaidPlan | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<PaidPlan | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutOrderId, setCheckoutOrderId] = useState('');
  const [checkoutApprovalUrl, setCheckoutApprovalUrl] = useState('');
  const [claimOpen, setClaimOpen] = useState(false);
  const [paypalTransactionId, setPaypalTransactionId] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState('');

  const openGumroad = (plan: PaidPlan) => {
    window.open(plan === 'trip' ? GUMROAD_LINKS.trip : GUMROAD_LINKS.group, '_blank', 'noopener,noreferrer');
  };

  const hasActivePaidPass = Boolean(
    userState
      && (userState.plan === 'trip' || userState.plan === 'group')
      && (!userState.planExpiresAt || userState.planExpiresAt > Date.now()),
  );

  const currentPlanExpires = userState?.planExpiresAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(userState.planExpiresAt))
    : null;

  const handlePlanCta = (plan: string) => {
    onCtaClick?.(plan);
    const isTrip = plan === 'trip';
    const isGroup = plan === 'group';
    const isPaid = isTrip || isGroup;

    void trackEvent('cta_clicked', {
      ctaName: isTrip ? 'Get Trip Pass' : isGroup ? 'Get Group Pass' : 'Start Free',
      destination: isPaid ? 'Gumroad Checkout' : 'free-toolkit',
      tool: 'pay',
      plan: isTrip ? 'trip_pass' : isGroup ? 'group_pass' : 'free',
    }, userState?.uid);

    if (!isPaid) {
      showToast(t('pay.freeToolkitReady'));
      return;
    }

    if (!user) {
      showToast(t('pay.claim.signInFirst'));
      onNeedAuth?.();
      return;
    }

    if (hasActivePaidPass) {
      showToast(t('pay.checkout.activePass'));
      return;
    }

    openGumroad(isTrip ? 'trip' : 'group');
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
        context: 'create_order',
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
        context: 'capture_order',
        errorCode: error instanceof Error ? error.message.slice(0, 80) : 'capture_order_failed',
      }, user.uid);
      setCheckoutError(error instanceof Error ? error.message : t('pay.checkout.captureError'));
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleSubmitClaim = async () => {
    if (!user || !selectedPlan) return;
    const tx = paypalTransactionId.trim();
    const email = paypalEmail.trim();

    setClaimError('');
    if (tx.length < 4) {
      setClaimError(t('pay.claim.transactionRequired'));
      return;
    }

    setClaimLoading(true);
    void trackEvent('cta_clicked', {
      ctaName: "I've paid — request activation",
      destination: 'paymentClaims',
      tool: 'pay',
      plan: selectedPlan === 'trip' ? 'trip_pass' : 'group_pass',
    }, user.uid);

    try {
      await addDoc(collection(db, 'paymentClaims'), {
        userId: user.uid,
        accountEmail: user.email || '',
        plan: selectedPlan === 'trip' ? 'trip_pass' : 'group_pass',
        paypalTransactionId: tx.slice(0, 120),
        ...(email ? { paypalEmail: email.slice(0, 160) } : {}),
        sourcePath: `${window.location.pathname}${window.location.search}`.slice(0, 500),
        createdAt: serverTimestamp(),
        status: 'pending',
      });
      showToast(t('pay.claim.submitted'));
      setClaimOpen(false);
      setSelectedPlan(null);
      setPaypalTransactionId('');
      setPaypalEmail('');
    } catch {
      setClaimError(t('pay.claim.submitError'));
    } finally {
      setClaimLoading(false);
    }
  };

  return (
    <section id="plans">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-[#155e63]" />
        <h2 className="text-base font-semibold text-gray-900">{t('pay.plansTitle')}</h2>
      </div>
      {userState && (
        <p className="text-xs text-gray-500 mb-3">
          {t('pay.currentPlan')} <span className="font-semibold text-[#155e63]">{userState.plan}</span> · {t('pay.aiUsed')}{' '}
          <span className="font-semibold text-[#155e63]">{userState.buddyAiQuotaUsed}/{userState.buddyAiQuotaTotal}</span>
          {hasActivePaidPass && currentPlanExpires ? (
            <span> · {t('pay.checkout.expires', { date: currentPlanExpires })}</span>
          ) : null}
        </p>
      )}

      <div className="mb-4 rounded-[1.35rem] border border-[#155e63]/15 bg-white/60 p-4 shadow-[0_14px_34px_rgba(11,63,67,0.06)] backdrop-blur-xl">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#155e63]" />
          <p className="text-sm font-bold text-gray-950">{t('pay.manualPayment.title')}</p>
        </div>
        <p className="text-xs font-medium leading-relaxed text-gray-600">{t('pay.manualPayment.body')}</p>
        <p className="mt-2 text-xs font-semibold leading-relaxed text-[#155e63]">{t('pay.manualPayment.note')}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className={`relative rounded-2xl p-5 transition-all hover:shadow-md ${
              plan.highlighted
                ? 'bg-[#155e63] text-white shadow-lg shadow-[#155e63]/20'
                : 'bg-white border border-gray-100 shadow-sm'
            }`}
          >
            <h3 className={`font-semibold text-sm ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
              {t(`pay.plans.${plan.key}.name`)}
            </h3>
            <div className="mt-2 mb-1">
              <span className={`text-2xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                {plan.price}
              </span>
              {plan.periodKey && (
                <span className={plan.highlighted ? 'text-white/60' : 'text-gray-400'}> {t(plan.periodKey)}</span>
              )}
            </div>
            <p className={`text-xs mb-4 ${plan.highlighted ? 'text-white/70' : 'text-gray-500'}`}>
              {t(`pay.plans.${plan.key}.desc`)}
            </p>
            <ul className="space-y-2 mb-5">
              {(t(`pay.plans.${plan.key}.features`, { returnObjects: true }) as string[]).map((f) => (
                <li key={f} className={`flex items-start gap-2 text-xs ${plan.highlighted ? 'text-white/85' : 'text-gray-600'}`}>
                  <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-[#7dd3d8]' : 'text-[#155e63]'}`} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanCta(plan.key)}
              disabled={plan.key !== 'free' && hasActivePaidPass}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${plan.ctaStyle}`}
            >
              {plan.key !== 'free' && hasActivePaidPass ? t('pay.checkout.activeButton') : t(`pay.plans.${plan.key}.cta`)}
            </button>
          </div>
        ))}
      </div>
      <p className="text-center text-gray-400 text-xs mt-3">
        {t('pay.refund')}
      </p>
      {selectedPlan && user && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setSelectedPlan(null)}>
          <div className="max-h-[92svh] w-full overflow-y-auto rounded-t-3xl bg-[#fffdf8] p-5 shadow-2xl sm:max-w-md sm:rounded-3xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6a85a]">{t('pay.claim.kicker')}</p>
                <h3 className="mt-1 text-xl font-bold text-gray-950">
                  {t('pay.claim.title', { plan: t(`pay.plans.${selectedPlan}.name`) })}
                </h3>
              </div>
              <button onClick={() => setSelectedPlan(null)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-[#155e63]/12 bg-[#155e63]/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#155e63]">{t('pay.claim.accountLabel')}</p>
              <p className="mt-1 break-words text-sm font-bold text-gray-950">{user.email}</p>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">{t('pay.claim.accountHelp')}</p>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                onClick={() => openGumroad(selectedPlan)}
                className="rounded-xl bg-[#155e63] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0e4a4e]"
              >
                {t('pay.claim.openPaypal')}
              </button>
              <button
                onClick={() => setClaimOpen((open) => !open)}
                className="rounded-xl border border-[#155e63]/15 bg-white px-4 py-3 text-sm font-bold text-[#155e63] transition-colors hover:bg-[#155e63]/5"
              >
                {t('pay.claim.requestActivation')}
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-gray-500">{t('pay.claim.afterPaymentHelp')}</p>

            {claimOpen && (
              <div className="mt-4 space-y-3 rounded-2xl border border-gray-100 bg-white p-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600">{t('pay.claim.transactionId')}</label>
                  <input
                    value={paypalTransactionId}
                    onChange={(event) => setPaypalTransactionId(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#155e63]/40"
                    placeholder={t('pay.claim.transactionPlaceholder')}
                    maxLength={120}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">{t('pay.claim.paypalEmail')}</label>
                  <input
                    value={paypalEmail}
                    onChange={(event) => setPaypalEmail(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#155e63]/40"
                    placeholder={t('pay.claim.paypalEmailPlaceholder')}
                    maxLength={160}
                  />
                </div>
                {claimError && <p className="text-xs font-semibold text-red-600">{claimError}</p>}
                <button
                  onClick={handleSubmitClaim}
                  disabled={claimLoading}
                  className="w-full rounded-xl bg-[#e8c27a] px-4 py-3 text-sm font-bold text-[#061e1f] transition-colors hover:bg-[#f4d78f] disabled:opacity-60"
                >
                  {claimLoading ? t('pay.claim.submitting') : t('pay.claim.submit')}
                </button>
                <p className="text-[11px] leading-relaxed text-gray-400">{t('pay.claim.noCards')}</p>
              </div>
            )}
          </div>
        </div>
      )}
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
            aria-labelledby="checkout-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6a85a]">
                  {paymentMode === 'sandbox' ? t('pay.checkout.sandboxBadge') : t('pay.checkout.secureCheckout')}
                </p>
                <h3 id="checkout-title" className="mt-1 text-xl font-bold text-gray-950">
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

import { Check, Mail, ShieldCheck, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserState } from '../hooks/useAuth';

const PLANS = [
  {
    key: 'free',
    price: '$0',
    period: '',
    ctaStyle: 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50',
    highlighted: false,
  },
  {
    key: 'trip',
    price: '$9.90',
    period: '',
    ctaStyle: 'bg-white text-[#155e63] hover:bg-gray-50 font-bold',
    highlighted: true,
  },
  {
    key: 'group',
    price: '$39.90',
    period: '',
    ctaStyle: 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50',
    highlighted: false,
  },
];

interface Props {
  userState: UserState | null;
  showToast: (msg: string) => void;
}

export default function PricingPlans({ userState, showToast }: Props) {
  const { t } = useTranslation();
  const [modalPlan, setModalPlan] = useState<'trip' | 'group' | null>(null);
  const [email, setEmail] = useState(userState?.email ?? '');
  const [travelDate, setTravelDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const openRequestModal = (plan: string) => {
    if (plan === 'free') {
      window.location.reload();
      return;
    }
    setModalPlan(plan as 'trip' | 'group');
    setEmail(userState?.email ?? email);
    setError('');
  };

  const submitRequest = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(t('pay.earlyAccess.emailRequired'));
      return;
    }

    const planName = modalPlan ? t(`pay.plans.${modalPlan}.name`) : '';
    const subject = `ChinaEase Buddy Early Access Request - ${planName}`;
    const body = [
      `Email: ${trimmedEmail}`,
      `Plan: ${planName}`,
      `Travel date: ${travelDate.trim() || '-'}`,
      `Message: ${message.trim() || '-'}`,
    ].join('\n');
    window.location.href = `mailto:gemmazhou405@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast(t('pay.earlyAccess.mailReady'));
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
        </p>
      )}
      <div className="mb-4 rounded-[1.35rem] border border-[#155e63]/15 bg-white/60 p-4 shadow-[0_14px_34px_rgba(11,63,67,0.06)] backdrop-blur-xl">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#155e63]" />
          <p className="text-sm font-bold text-gray-950">{t('pay.earlyAccess.title')}</p>
        </div>
        <p className="text-xs font-medium leading-relaxed text-gray-600">{t('pay.earlyAccess.body')}</p>
        <p className="mt-2 text-xs leading-relaxed text-gray-500">{t('pay.earlyAccess.options')}</p>
        <p className="mt-2 text-xs font-semibold text-[#155e63]">{t('pay.earlyAccess.safety')}</p>
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
              {plan.period && (
                <span className={plan.highlighted ? 'text-white/60' : 'text-gray-400'}>{plan.period}</span>
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
              onClick={() => openRequestModal(plan.key)}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${plan.ctaStyle}`}
            >
              {t(`pay.plans.${plan.key}.cta`)}
            </button>
          </div>
        ))}
      </div>
      <p className="text-center text-gray-400 text-xs mt-3">
        {t('pay.refund')}
      </p>
      {modalPlan && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setModalPlan(null)}>
          <div className="max-h-[92svh] w-full overflow-y-auto rounded-t-3xl bg-[#f7f3ea] p-5 shadow-2xl sm:max-w-md sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black tracking-tight text-gray-950">{t('pay.earlyAccess.modalTitle')}</h3>
                <p className="mt-1 text-xs font-medium leading-relaxed text-gray-500">{t('pay.earlyAccess.modalSubtitle')}</p>
              </div>
              <button onClick={() => setModalPlan(null)} className="rounded-full bg-white/70 p-2 text-gray-400 shadow-sm hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-700">{t('pay.earlyAccess.email')}</span>
                <input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  type="email"
                  className="w-full rounded-xl border border-white/70 bg-white px-3 py-3 text-sm outline-none focus:border-[#155e63]/40"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-700">{t('pay.earlyAccess.plan')}</span>
                <select
                  value={modalPlan}
                  onChange={(e) => setModalPlan(e.target.value as 'trip' | 'group')}
                  className="w-full rounded-xl border border-white/70 bg-white px-3 py-3 text-sm outline-none focus:border-[#155e63]/40"
                >
                  <option value="trip">{t('pay.plans.trip.name')}</option>
                  <option value="group">{t('pay.plans.group.name')}</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-700">{t('pay.earlyAccess.travelDate')}</span>
                <input
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  type="date"
                  className="w-full rounded-xl border border-white/70 bg-white px-3 py-3 text-sm outline-none focus:border-[#155e63]/40"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-700">{t('pay.earlyAccess.message')}</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/70 bg-white px-3 py-3 text-sm outline-none focus:border-[#155e63]/40"
                  placeholder={t('pay.earlyAccess.messagePlaceholder')}
                />
              </label>
            </div>

            <p className="mt-3 text-xs font-medium leading-relaxed text-gray-500">
              {userState ? t('pay.earlyAccess.sameEmail') : t('pay.earlyAccess.createAccount')}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">{t('pay.earlyAccess.confirmation')}</p>
            <p className="mt-2 rounded-xl border border-[#155e63]/10 bg-white/60 px-3 py-2 text-xs font-semibold text-[#155e63]">
              {t('pay.earlyAccess.noCard')}
            </p>
            {error && <p className="mt-2 text-center text-xs font-semibold text-red-500">{error}</p>}

            <button
              onClick={submitRequest}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#155e63] py-3 text-sm font-bold text-white transition-colors hover:bg-[#0e4a4e]"
            >
              <Mail className="h-4 w-4" />
              {t('pay.earlyAccess.submit')}
            </button>
            <a href="mailto:gemmazhou405@gmail.com" className="mt-3 block text-center text-xs font-semibold text-[#155e63] hover:underline">
              {t('pay.earlyAccess.contactEmail')}
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

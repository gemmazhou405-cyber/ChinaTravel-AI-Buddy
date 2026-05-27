import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TabId } from '../App';

type Journey = 'before' | 'now' | 'emergency';

type Category = {
  label: string;
  note: string;
  tab?: TabId;
  askBuddy?: boolean;
};

interface Props {
  onTabSelect: (tab: TabId) => void;
  onAskBuddy: () => void;
}

function CategoryButton({ category, onTabSelect, onAskBuddy }: Props & { category: Category }) {
  return (
    <button
      onClick={() => (category.askBuddy ? onAskBuddy() : category.tab && onTabSelect(category.tab))}
      className="min-h-[5.35rem] rounded-[1.35rem] border border-white/60 bg-white/[0.52] px-4 py-3.5 text-left shadow-[0_16px_42px_rgba(11,63,67,0.09)] backdrop-blur-2xl transition-all duration-200 hover:-translate-y-0.5 hover:border-[#155e63]/30 hover:bg-white/[0.74] hover:shadow-[0_22px_52px_rgba(11,63,67,0.14)] active:scale-[0.98]"
    >
      <span className="block text-sm font-bold tracking-tight text-gray-950">{category.label}</span>
      <span className="mt-1.5 block text-xs font-medium leading-relaxed text-gray-500/95">{category.note}</span>
    </button>
  );
}

export default function QuickActions({ onTabSelect, onAskBuddy }: Props) {
  const { t } = useTranslation();
  const [journey, setJourney] = useState<Journey>('now');
  const journeys: Array<{ id: Journey; label: string }> = [
    { id: 'before', label: t('journey.states.before') },
    { id: 'now', label: t('journey.states.now') },
    { id: 'emergency', label: t('journey.states.emergency') },
  ];
  const valueTags = [
    t('journey.badges.noApp'),
    t('journey.badges.showChinese'),
    t('journey.badges.askBuddy'),
  ];
  const beforeCategories: Category[] = [
    { label: `✅ ${t('journey.before.checklist')}`, note: t('journey.before.checklistNote'), tab: 'before' },
    { label: `📱 ${t('journey.before.apps')}`, note: t('journey.before.appsNote'), tab: 'before' },
    { label: `💳 ${t('journey.before.basics')}`, note: t('journey.before.basicsNote'), tab: 'before' },
    { label: `📍 ${t('journey.before.cityGuides')}`, note: t('journey.before.cityGuidesNote'), tab: 'stay' },
  ];
  const nowCategories: Category[] = [
    { label: `🏨 ${t('journey.now.stay')}`, note: t('journey.now.stayNote'), tab: 'stay' },
    { label: `🍜 ${t('journey.now.food')}`, note: t('journey.now.foodNote'), tab: 'food' },
    { label: `🚄 ${t('journey.now.transport')}`, note: t('journey.now.transportNote'), tab: 'transport' },
    { label: `💳 ${t('journey.now.pay')}`, note: t('journey.now.payNote'), tab: 'pay' },
    { label: `✨ ${t('journey.now.askBuddy')}`, note: t('journey.now.askBuddyNote'), askBuddy: true },
  ];
  const emergencyCategories: Category[] = [
    { label: `🆘 ${t('journey.emergency.numbers')}`, note: '110 · 120 · 119', tab: 'emergency' },
    { label: `🏥 ${t('journey.emergency.hospital')}`, note: t('journey.emergency.hospitalNote'), tab: 'emergency' },
    { label: `👮 ${t('journey.emergency.police')}`, note: t('journey.emergency.policeNote'), tab: 'emergency' },
    { label: `🎒 ${t('journey.emergency.lostItems')}`, note: t('journey.emergency.lostItemsNote'), tab: 'emergency' },
  ];

  const title =
    journey === 'before' ? t('journey.before.title') : journey === 'emergency' ? t('journey.emergency.title') : t('journey.now.title');
  const subtitle =
    journey === 'before'
      ? t('journey.before.subtitle')
      : journey === 'emergency'
        ? t('journey.emergency.subtitle')
        : t('journey.now.subtitle');
  const categories =
    journey === 'before' ? beforeCategories : journey === 'emergency' ? emergencyCategories : nowCategories;

  return (
    <section className="relative overflow-hidden border-b border-[#155e63]/10 bg-[#f7f3ea] px-4 py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_-6%,rgba(125,211,216,0.24),transparent_34%),radial-gradient(circle_at_92%_4%,rgba(11,63,67,0.17),transparent_31%),linear-gradient(180deg,rgba(14,74,78,0.08),rgba(247,243,234,0.76)_42%,rgba(255,255,255,0.28))]" />
      <div className="relative mx-auto max-w-4xl">
        <div className="rounded-[2rem] border border-white/55 bg-white/[0.22] p-3 shadow-[0_24px_70px_rgba(11,63,67,0.10)] backdrop-blur-2xl sm:p-4">
          <div className="grid grid-cols-3 gap-1.5 rounded-[1.35rem] border border-white/70 bg-white/[0.42] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_16px_42px_rgba(11,63,67,0.10)] backdrop-blur-2xl">
          {journeys.map((item) => (
              <button
                key={item.id}
                onClick={() => setJourney(item.id)}
                className={`rounded-2xl px-2 py-2.5 text-xs font-bold transition-all duration-200 sm:text-sm ${
                  journey === item.id
                    ? 'bg-gradient-to-br from-[#176f75] via-[#155e63] to-[#0b3f43] text-white shadow-[0_10px_26px_rgba(11,63,67,0.30)]'
                    : 'text-gray-600 hover:bg-white/55 hover:text-[#155e63]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {valueTags.map((tag) => (
              <span
                key={tag}
                className="shrink-0 rounded-full border border-white/70 bg-white/[0.38] px-3 py-1.5 text-xs font-semibold text-[#155e63] shadow-[0_8px_24px_rgba(11,63,67,0.06)] backdrop-blur-xl"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="mb-2 h-1 w-9 rounded-full bg-gradient-to-r from-[#155e63] via-[#2e8f94] to-[#7dd3d8] shadow-[0_0_18px_rgba(125,211,216,0.45)]" />
                <h2 className="text-2xl font-black tracking-tight text-gray-950">{title}</h2>
                <p className="mt-1.5 text-sm font-medium text-gray-600/90">{subtitle}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-3">
              {categories.map((category) => (
                <CategoryButton
                  key={category.label}
                  category={category}
                  onTabSelect={onTabSelect}
                  onAskBuddy={onAskBuddy}
                />
              ))}
            </div>
          </div>

          {journey === 'emergency' && (
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {[
                ['110', t('journey.emergency.policeLabel')],
                ['120', t('journey.emergency.ambulanceLabel')],
                ['119', t('journey.emergency.fireLabel')],
              ].map(([number, label]) => (
                <a
                  key={number}
                  href={`tel:${number}`}
                  className="rounded-[1.35rem] border border-red-100/80 bg-red-50/60 px-3 py-3 text-center shadow-[0_14px_34px_rgba(127,29,29,0.08)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-red-50/85"
                >
                  <span className="block text-xl font-black text-red-700">{number}</span>
                  <span className="text-xs font-semibold text-red-700/70">{label}</span>
                </a>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            {journey !== 'now' && (
              <button onClick={() => setJourney('now')} className="rounded-full border border-white/70 bg-white/[0.40] px-3 py-1.5 text-[#155e63] shadow-sm backdrop-blur-xl transition-all hover:bg-white/70">
                {t('journey.switch.daily')}
              </button>
            )}
            {journey !== 'before' && (
              <button onClick={() => setJourney('before')} className="rounded-full border border-white/70 bg-white/[0.40] px-3 py-1.5 text-[#155e63] shadow-sm backdrop-blur-xl transition-all hover:bg-white/70">
                {t('journey.switch.planning')}
              </button>
            )}
            {journey !== 'emergency' && (
              <button onClick={() => setJourney('emergency')} className="rounded-full border border-red-100/90 bg-red-50/65 px-3 py-1.5 text-red-700 shadow-sm backdrop-blur-xl transition-all hover:bg-red-50">
                {t('journey.switch.urgent')}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

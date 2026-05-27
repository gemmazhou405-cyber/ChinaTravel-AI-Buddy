import { useState } from 'react';
import type { TabId } from '../App';

type Journey = 'before' | 'now' | 'emergency';

type Category = {
  label: string;
  note: string;
  tab?: TabId;
  askBuddy?: boolean;
};

const JOURNEYS: Array<{ id: Journey; label: string }> = [
  { id: 'before', label: 'Before your trip' },
  { id: 'now', label: 'In China now' },
  { id: 'emergency', label: 'Emergency help' },
];

const VALUE_TAGS = ['No app download', 'Show Chinese to locals', 'Ask Buddy when you’re stuck'];

const BEFORE_CATEGORIES: Category[] = [
  { label: '✅ Preparation checklist', note: 'Visas, money, apps', tab: 'before' },
  { label: '📱 Apps to download', note: 'Set up before landing', tab: 'before' },
  { label: '💳 China payment & transport basics', note: 'Know what works', tab: 'before' },
  { label: '📍 City guides', note: 'Pick your first stops', tab: 'stay' },
];

const NOW_CATEGORIES: Category[] = [
  { label: '🏨 Stay', note: 'Hotels and check-in', tab: 'stay' },
  { label: '🍜 Food', note: 'Menus and ordering', tab: 'food' },
  { label: '🚄 Transport', note: 'Taxi, train, metro', tab: 'transport' },
  { label: '💳 Pay in China', note: 'Alipay, WeChat, cash', tab: 'pay' },
  { label: '✨ Ask Buddy', note: 'Custom answer now', askBuddy: true },
];

const EMERGENCY_CATEGORIES: Category[] = [
  { label: '🆘 Emergency numbers', note: '110 · 120 · 119', tab: 'emergency' },
  { label: '🏥 Hospital help', note: 'Medical phrases', tab: 'emergency' },
  { label: '👮 Police help', note: 'Report and explain', tab: 'emergency' },
  { label: '🎒 Lost items', note: 'Passport or belongings', tab: 'emergency' },
];

interface Props {
  onTabSelect: (tab: TabId) => void;
  onAskBuddy: () => void;
}

function CategoryButton({ category, onTabSelect, onAskBuddy }: Props & { category: Category }) {
  return (
    <button
      onClick={() => (category.askBuddy ? onAskBuddy() : category.tab && onTabSelect(category.tab))}
      className="min-h-[5.4rem] rounded-3xl border border-white/70 bg-white/55 px-4 py-3.5 text-left shadow-[0_14px_36px_rgba(15,74,78,0.08)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-[#155e63]/28 hover:bg-white/75 hover:shadow-[0_18px_44px_rgba(15,74,78,0.13)] active:scale-[0.98]"
    >
      <span className="block text-sm font-bold tracking-tight text-gray-950">{category.label}</span>
      <span className="mt-1.5 block text-xs font-medium leading-relaxed text-gray-500">{category.note}</span>
    </button>
  );
}

export default function QuickActions({ onTabSelect, onAskBuddy }: Props) {
  const [journey, setJourney] = useState<Journey>('now');

  const title =
    journey === 'before' ? 'Before your trip' : journey === 'emergency' ? 'Emergency help' : 'In China now';
  const subtitle =
    journey === 'before'
      ? 'Get ready before arriving in China.'
      : journey === 'emergency'
        ? 'Important words and numbers when something goes wrong.'
        : 'Quick help for everyday travel moments.';
  const categories =
    journey === 'before' ? BEFORE_CATEGORIES : journey === 'emergency' ? EMERGENCY_CATEGORIES : NOW_CATEGORIES;

  return (
    <section className="relative overflow-hidden border-b border-[#155e63]/10 bg-[#f7f3ea] px-4 py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(125,211,216,0.18),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(21,94,99,0.10),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.38),rgba(247,243,234,0))]" />
      <div className="relative mx-auto max-w-4xl">
        <div className="grid grid-cols-3 gap-1.5 rounded-[1.35rem] border border-white/65 bg-white/45 p-1.5 shadow-[0_16px_45px_rgba(15,74,78,0.10)] backdrop-blur-xl">
          {JOURNEYS.map((item) => (
            <button
              key={item.id}
              onClick={() => setJourney(item.id)}
              className={`rounded-2xl px-2 py-2.5 text-xs font-bold transition-all duration-200 sm:text-sm ${
                journey === item.id
                  ? 'bg-gradient-to-br from-[#155e63] to-[#0b3f43] text-white shadow-[0_10px_24px_rgba(21,94,99,0.26)]'
                  : 'text-gray-600 hover:bg-white/60 hover:text-[#155e63]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {VALUE_TAGS.map((tag) => (
            <span
              key={tag}
              className="shrink-0 rounded-full border border-white/65 bg-white/42 px-3 py-1.5 text-xs font-semibold text-[#155e63] shadow-[0_8px_24px_rgba(15,74,78,0.06)] backdrop-blur-xl"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="mb-2 h-1 w-9 rounded-full bg-gradient-to-r from-[#155e63] to-[#7dd3d8]" />
              <h2 className="text-2xl font-black tracking-tight text-gray-950">{title}</h2>
              <p className="mt-1.5 text-sm font-medium text-gray-600">{subtitle}</p>
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
              ['110', 'Police'],
              ['120', 'Ambulance'],
              ['119', 'Fire'],
            ].map(([number, label]) => (
              <a
                key={number}
                href={`tel:${number}`}
                className="rounded-3xl border border-red-100/80 bg-red-50/70 px-3 py-3 text-center shadow-[0_12px_30px_rgba(127,29,29,0.08)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-red-50"
              >
                <span className="block text-xl font-black text-red-700">{number}</span>
                <span className="text-xs font-semibold text-red-700/70">{label}</span>
              </a>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          {journey !== 'now' && (
            <button onClick={() => setJourney('now')} className="rounded-full border border-white/70 bg-white/45 px-3 py-1.5 text-[#155e63] shadow-sm backdrop-blur-xl transition-all hover:bg-white/70">
              Need daily travel help?
            </button>
          )}
          {journey !== 'before' && (
            <button onClick={() => setJourney('before')} className="rounded-full border border-white/70 bg-white/45 px-3 py-1.5 text-[#155e63] shadow-sm backdrop-blur-xl transition-all hover:bg-white/70">
              Planning your trip?
            </button>
          )}
          {journey !== 'emergency' && (
            <button onClick={() => setJourney('emergency')} className="rounded-full border border-red-100 bg-red-50/75 px-3 py-1.5 text-red-700 shadow-sm backdrop-blur-xl transition-all hover:bg-red-50">
              Need urgent help?
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

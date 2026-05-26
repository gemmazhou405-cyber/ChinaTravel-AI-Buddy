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
      className="rounded-2xl border border-[#155e63]/12 bg-white px-3.5 py-3 text-left shadow-sm transition-all hover:border-[#155e63]/30 hover:text-[#155e63] active:scale-[0.98]"
    >
      <span className="block text-sm font-bold text-gray-900">{category.label}</span>
      <span className="mt-1 block text-xs font-medium text-gray-500">{category.note}</span>
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
    <section className="border-b border-[#155e63]/10 bg-[#f7f3ea] px-4 py-5">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#155e63]/10 bg-white/60 p-1.5">
          {JOURNEYS.map((item) => (
            <button
              key={item.id}
              onClick={() => setJourney(item.id)}
              className={`rounded-xl px-2 py-2 text-xs font-bold transition-all sm:text-sm ${
                journey === item.id ? 'bg-[#155e63] text-white shadow-sm' : 'text-gray-600 hover:bg-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <h2 className="text-xl font-bold tracking-tight text-gray-950">{title}</h2>
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
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
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              ['110', 'Police'],
              ['120', 'Ambulance'],
              ['119', 'Fire'],
            ].map(([number, label]) => (
              <a
                key={number}
                href={`tel:${number}`}
                className="rounded-2xl border border-red-100 bg-red-50 px-3 py-3 text-center"
              >
                <span className="block text-xl font-black text-red-700">{number}</span>
                <span className="text-xs font-semibold text-red-700/70">{label}</span>
              </a>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          {journey !== 'now' && (
            <button onClick={() => setJourney('now')} className="rounded-full bg-white px-3 py-1.5 text-[#155e63]">
              Need daily travel help?
            </button>
          )}
          {journey !== 'before' && (
            <button onClick={() => setJourney('before')} className="rounded-full bg-white px-3 py-1.5 text-[#155e63]">
              Planning your trip?
            </button>
          )}
          {journey !== 'emergency' && (
            <button onClick={() => setJourney('emergency')} className="rounded-full bg-red-50 px-3 py-1.5 text-red-700">
              Need urgent help?
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

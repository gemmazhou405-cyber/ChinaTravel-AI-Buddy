import type { TabId } from '../App';

const ACTIONS: Array<{ label: string; tab?: TabId; askBuddy?: boolean }> = [
  { label: '🚕 I need a taxi', tab: 'transport' },
  { label: '💳 I need to pay', tab: 'pay' },
  { label: '🍜 I need to order food', tab: 'food' },
  { label: '🏨 I need hotel help', tab: 'stay' },
  { label: '🆘 Emergency help', tab: 'emergency' },
  { label: '✨ Ask Buddy', askBuddy: true },
];

interface Props {
  onTabSelect: (tab: TabId) => void;
  onAskBuddy: () => void;
}

export default function QuickActions({ onTabSelect, onAskBuddy }: Props) {
  return (
    <section className="border-b border-[#155e63]/10 bg-[#f7f3ea] px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-3 text-base font-semibold text-gray-950">What do you need help with right now?</h2>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => action.askBuddy ? onAskBuddy() : action.tab && onTabSelect(action.tab)}
              className="min-h-14 rounded-2xl border border-[#155e63]/12 bg-white px-3 py-3 text-left text-sm font-semibold text-gray-800 shadow-sm transition-all hover:border-[#155e63]/30 hover:text-[#155e63] active:scale-[0.98]"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

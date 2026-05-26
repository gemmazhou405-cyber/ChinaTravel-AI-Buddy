import type { TabId } from '../App';

const ACTIONS: Array<{ label: string; tab?: TabId; askBuddy?: boolean }> = [
  { label: '🚕 Taxi', tab: 'transport' },
  { label: '💳 Pay', tab: 'pay' },
  { label: '🍜 Food', tab: 'food' },
  { label: '🏨 Hotel', tab: 'stay' },
  { label: '🚄 Transport', tab: 'transport' },
  { label: '🆘 Emergency', tab: 'emergency' },
];

interface Props {
  onTabSelect: (tab: TabId) => void;
  onAskBuddy: () => void;
}

export default function QuickActions({ onTabSelect, onAskBuddy }: Props) {
  return (
    <section className="border-b border-[#155e63]/10 bg-[#f7f3ea] px-4 py-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-3 text-base font-semibold text-gray-950">What do you need?</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => action.askBuddy ? onAskBuddy() : action.tab && onTabSelect(action.tab)}
              className="min-h-12 rounded-2xl border border-[#155e63]/12 bg-white px-3 py-2.5 text-center text-sm font-semibold text-gray-800 shadow-sm transition-all hover:border-[#155e63]/30 hover:text-[#155e63] active:scale-[0.98]"
            >
              {action.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-600">
          <span>Not sure what to say?</span>
          <button onClick={onAskBuddy} className="font-semibold text-[#155e63] hover:underline">
            Ask Buddy
          </button>
        </div>
      </div>
    </section>
  );
}

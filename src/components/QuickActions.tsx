import type { TabId } from '../App';

type Action = {
  label: string;
  tab?: TabId;
  askBuddy?: boolean;
};

const IN_CHINA_ACTIONS: Action[] = [
  { label: '🚕 Taxi', tab: 'transport' },
  { label: '🏨 Hotel', tab: 'stay' },
  { label: '🍜 Food', tab: 'food' },
  { label: '💳 Pay', tab: 'pay' },
  { label: '🚄 Transport', tab: 'transport' },
  { label: '✨ Ask Buddy', askBuddy: true },
];

const BEFORE_ACTIONS: Action[] = [
  { label: '✅ Checklist', tab: 'before' },
  { label: '📱 Apps to download', tab: 'before' },
  { label: '💳 China basics', tab: 'before' },
  { label: '📍 City guides', tab: 'stay' },
];

const EMERGENCY_ACTIONS: Action[] = [
  { label: '🆘 Emergency numbers', tab: 'emergency' },
  { label: '🏥 Hospital phrases', tab: 'emergency' },
  { label: '👮 Police help', tab: 'emergency' },
];

interface Props {
  onTabSelect: (tab: TabId) => void;
  onAskBuddy: () => void;
}

function ActionButton({ action, onTabSelect, onAskBuddy, compact = false }: Props & { action: Action; compact?: boolean }) {
  return (
    <button
      onClick={() => (action.askBuddy ? onAskBuddy() : action.tab && onTabSelect(action.tab))}
      className={`rounded-2xl border border-[#155e63]/12 bg-white text-center text-sm font-semibold text-gray-800 shadow-sm transition-all hover:border-[#155e63]/30 hover:text-[#155e63] active:scale-[0.98] ${
        compact ? 'min-h-11 px-3 py-2.5' : 'min-h-12 px-3 py-2.5'
      }`}
    >
      {action.label}
    </button>
  );
}

export default function QuickActions({ onTabSelect, onAskBuddy }: Props) {
  return (
    <section className="border-b border-[#155e63]/10 bg-[#f7f3ea] px-4 py-5">
      <div className="mx-auto max-w-4xl space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#155e63]">Main tools</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-gray-950">In China now?</h2>
          <p className="mt-1 text-sm text-gray-600">Quick help for everyday travel moments.</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
            {IN_CHINA_ACTIONS.map((action) => (
              <ActionButton key={action.label} action={action} onTabSelect={onTabSelect} onAskBuddy={onAskBuddy} />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#155e63]/10 bg-white/55 p-4">
          <h3 className="text-base font-bold text-gray-950">Before you go</h3>
          <p className="mt-1 text-sm text-gray-600">Get ready before arriving in China.</p>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            {BEFORE_ACTIONS.map((action) => (
              <ActionButton key={action.label} action={action} onTabSelect={onTabSelect} onAskBuddy={onAskBuddy} compact />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-red-100 bg-red-50/55 p-4">
          <h3 className="text-base font-bold text-gray-950">Emergency help</h3>
          <p className="mt-1 text-sm text-gray-600">Important words and numbers when something goes wrong.</p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {EMERGENCY_ACTIONS.map((action) => (
              <ActionButton key={action.label} action={action} onTabSelect={onTabSelect} onAskBuddy={onAskBuddy} compact />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

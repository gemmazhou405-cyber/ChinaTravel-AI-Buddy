import { TabId } from '../App';
import { Compass, Hotel, UtensilsCrossed, Brain as Train, AlertTriangle, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TABS: { id: TabId; labelKey: string; emoji: string; icon: React.ReactNode }[] = [
  { id: 'before', labelKey: 'tabs.before', emoji: '🧳', icon: <Compass className="w-4 h-4" /> },
  { id: 'stay', labelKey: 'tabs.stay', emoji: '🏨', icon: <Hotel className="w-4 h-4" /> },
  { id: 'food', labelKey: 'tabs.food', emoji: '🍜', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { id: 'transport', labelKey: 'tabs.transport', emoji: '🚄', icon: <Train className="w-4 h-4" /> },
  { id: 'emergency', labelKey: 'tabs.emergency', emoji: '🆘', icon: <AlertTriangle className="w-4 h-4" /> },
  { id: 'pay', labelKey: 'tabs.pay', emoji: '💳', icon: <CreditCard className="w-4 h-4" /> },
];

interface Props {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

export default function TabNav({ activeTab, onTabChange }: Props) {
  const { t } = useTranslation();

  return (
    <nav className="overflow-x-auto scrollbar-hide bg-white border-b border-gray-100">
      <div className="flex min-w-max md:min-w-0 md:justify-center px-2 md:px-6">
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 md:px-5 py-4 text-sm font-medium whitespace-nowrap transition-all
                ${active
                  ? 'text-[#155e63]'
                  : 'text-gray-400 hover:text-gray-600'
                }
              `}
            >
              <span className="text-base">{tab.emoji}</span>
              <span>{t(tab.labelKey)}</span>
              {active && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#155e63] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

import { TabId } from '../App';
import { useTranslation } from 'react-i18next';

const TABS: { id: TabId; emoji: string; labelKey: string }[] = [
  { id: 'before', emoji: '🧳', labelKey: 'tabs.before' },
  { id: 'stay', emoji: '🏨', labelKey: 'tabs.stay' },
  { id: 'food', emoji: '🍜', labelKey: 'tabs.food' },
  { id: 'transport', emoji: '🚄', labelKey: 'tabs.transport' },
  { id: 'emergency', emoji: '🆘', labelKey: 'tabs.emergency' },
  { id: 'pay', emoji: '💳', labelKey: 'tabs.pay' },
];

interface Props {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

export default function TabNav({ activeTab, onTabChange }: Props) {
  const { t } = useTranslation();
  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="grid grid-cols-3 md:flex md:justify-center md:px-6">
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-all
                ${active ? 'text-[#155e63]' : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span>{t(tab.labelKey)}</span>
              {active && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#155e63] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

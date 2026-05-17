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
      {/* 手机端：横向滑动工具包入口 */}
      <div className="md:hidden bg-[#f7f3ea] border-b border-[#155e63]/10 px-4 py-2">
        <p className="text-[11px] font-medium text-[#155e63]">
          Swipe to explore your China travel toolkit
        </p>
      </div>
      <div className="md:hidden overflow-x-auto scrollbar-hide bg-white px-3 py-2.5">
        <div className="flex min-w-max gap-2">
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex flex-shrink-0 items-center justify-center gap-1.5 rounded-2xl border px-3.5 py-2.5 text-xs font-semibold shadow-sm transition-all
                  ${active
                    ? 'border-[#155e63] bg-[#155e63] text-white shadow-[#155e63]/20'
                    : 'border-[#155e63]/12 bg-[#f7f3ea] text-gray-600 hover:border-[#155e63]/30 hover:text-[#155e63]'}
                `}
              >
                <span className="text-base">{tab.emoji}</span>
                <span>{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 电脑端：横排，有间距，文字和emoji并排 */}
      <div className="hidden md:flex md:justify-center md:px-6 md:gap-2">
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all
                ${active ? 'text-[#155e63]' : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              <span className="text-base">{tab.emoji}</span>
              <span>{t(tab.labelKey)}</span>
              {active && (
                <span className="absolute bottom-0 left-4 right-4 h-[3px] bg-[#155e63] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

import { CheckCircle, Circle, Wifi, CreditCard, Smartphone, FileText, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const CHECKLIST = [
  { id: 1, labelKey: 'before.items.visa', sublabelKey: 'before.items.visaSub', icon: <FileText className="w-4 h-4" /> },
  { id: 2, labelKey: 'before.items.vpn', sublabelKey: 'before.items.vpnSub', icon: <Wifi className="w-4 h-4" /> },
  { id: 3, labelKey: 'before.items.wechat', sublabelKey: 'before.items.wechatSub', icon: <CreditCard className="w-4 h-4" /> },
  { id: 4, labelKey: 'before.items.maps', sublabelKey: 'before.items.mapsSub', icon: <Smartphone className="w-4 h-4" /> },
  { id: 5, labelKey: 'before.items.embassy', sublabelKey: 'before.items.embassySub', icon: <FileText className="w-4 h-4" /> },
];

const TIPS = [
  { titleKey: 'before.tips.sim.title', bodyKey: 'before.tips.sim.body', tagKey: 'before.tips.sim.tag' },
  { titleKey: 'before.tips.apps.title', bodyKey: 'before.tips.apps.body', tagKey: 'before.tips.apps.tag' },
  { titleKey: 'before.tips.cash.title', bodyKey: 'before.tips.cash.body', tagKey: 'before.tips.cash.tag' },
];

export default function BeforeTab() {
  const { t } = useTranslation();
  const [checked, setChecked] = useState<number[]>([]);

  const toggle = (id: number) =>
    setChecked((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">{t('before.title')}</h2>
          <span className="text-xs text-gray-400">{checked.length}/{CHECKLIST.length} {t('before.done')}</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {CHECKLIST.map((item, i) => {
            const done = checked.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all hover:bg-gray-50 ${
                  i !== CHECKLIST.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <div className={`flex-shrink-0 transition-colors ${done ? 'text-[#155e63]' : 'text-gray-300'}`}>
                  {done ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium transition-colors ${done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {t(item.labelKey)}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5 truncate">{t(item.sublabelKey)}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t('before.tipsTitle')}</h2>
        <div className="space-y-3">
          {TIPS.map((tip) => (
            <div key={tip.titleKey} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs bg-[#155e63]/10 text-[#155e63] px-2 py-0.5 rounded-full font-medium">{t(tip.tagKey)}</span>
                <h3 className="font-semibold text-gray-800 text-sm">{t(tip.titleKey)}</h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{t(tip.bodyKey)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

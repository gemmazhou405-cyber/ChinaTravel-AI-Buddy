import {
  Camera,
  CarTaxiFront,
  Check,
  CreditCard,
  HeartPulse,
  HelpCircle,
  ListChecks,
  MessageSquareText,
  PhoneCall,
  ShieldAlert,
  Signal,
  Smartphone,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TabId } from '../../App';
import { useRevealOnView } from '../../hooks/useRevealOnView';

type Item = { icon: LucideIcon; tab: TabId; tool?: string };

const COLUMNS: Array<{
  key: 'col1' | 'col2' | 'col3';
  tint: string;
  label: string;
  labelText: string;
  items: Item[];
}> = [
  {
    key: 'col1',
    tint: 'bg-tint-blue/75',
    label: 'bg-tint-bluelabel',
    labelText: 'text-[#3D5A6B]',
    items: [
      { icon: Smartphone, tab: 'before', tool: 'apps' },
      { icon: Wallet, tab: 'before', tool: 'payment' },
      { icon: Signal, tab: 'before', tool: 'apps' },
      { icon: ListChecks, tab: 'before', tool: 'checklist' },
    ],
  },
  {
    key: 'col2',
    tint: 'bg-tint-cream/75',
    label: 'bg-tint-creamlabel',
    labelText: 'text-[#8A6A2F]',
    items: [
      { icon: Camera, tab: 'food' },
      { icon: CarTaxiFront, tab: 'transport' },
      { icon: MessageSquareText, tab: 'stay' },
      { icon: CreditCard, tab: 'pay' },
    ],
  },
  {
    key: 'col3',
    tint: 'bg-tint-red/75',
    label: 'bg-tint-redlabel',
    labelText: 'text-[#A13D33]',
    items: [
      { icon: PhoneCall, tab: 'emergency', tool: 'numbers' },
      { icon: HeartPulse, tab: 'emergency', tool: 'hospital' },
      { icon: ShieldAlert, tab: 'emergency', tool: 'police' },
      { icon: HelpCircle, tab: 'emergency', tool: 'lost' },
    ],
  },
];

interface Props {
  onOpen: (tab: TabId, tool?: string) => void;
}

export default function ToolkitGrid({ onOpen }: Props) {
  const { t } = useTranslation();
  const { ref, revealed } = useRevealOnView<HTMLElement>();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const handleOpen = (itemKey: string, tab: TabId, tool?: string) => {
    setSelectedKey(itemKey);
    window.setTimeout(() => {
      onOpen(tab, tool);
      setSelectedKey(null);
    }, 150);
  };

  return (
    <section ref={ref} id="toolkit" className={`scroll-mt-20 bg-canvas py-20 md:py-32 ${revealed ? 'motion-reveal-on' : ''}`}>
      <div className="mx-auto max-w-container px-6 md:px-8">
        <div className="motion-reveal-item md:flex md:items-end md:justify-between md:gap-10">
          <h2 className="min-w-0 font-display text-3xl font-normal leading-[1.1] tracking-[-0.01em] text-ink md:flex-1 md:text-[44px]">
            {t('home.toolkit.title')}
          </h2>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 md:mt-0 md:shrink-0 md:pb-1">
            {(['check1', 'check2'] as const).map((c) => (
              <span key={c} className="inline-flex items-center gap-2 text-sm text-ink-secondary">
                <Check className="h-4 w-4 text-jade" strokeWidth={1.5} />
                {t(`home.toolkit.${c}`)}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-6">
          {COLUMNS.map(({ key, tint, label, labelText, items }, columnIndex) => (
            <div
              key={key}
              className={`motion-reveal-item rounded-2xl border border-white/60 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_8px_24px_rgba(17,20,24,0.05)] backdrop-blur-sm md:p-7 ${tint}`}
              style={{ '--reveal-index': columnIndex + 1 } as CSSProperties}
            >
              <span className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${label} ${labelText}`}>
                {t(`home.toolkit.${key}.label`)}
              </span>
              <ul className="mt-6 space-y-5">
                {items.map(({ icon: Icon, tab, tool }, index) => {
                  const itemKey = `${key}-${index}`;
                  const selected = selectedKey === itemKey;
                  return (
                  <li key={index}>
                    <button
                      onClick={() => handleOpen(itemKey, tab, tool)}
                      className={`group motion-card flex min-h-[56px] w-full items-start gap-3 rounded-xl border px-2 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
                        selected
                          ? 'border-jade/30 bg-white/78 shadow-[0_10px_28px_rgba(15,82,87,0.12)]'
                          : 'border-transparent hover:border-jade/18 hover:bg-white/46 hover:shadow-[0_10px_28px_rgba(17,20,24,0.06)] focus-visible:border-jade/22 focus-visible:bg-white/52'
                      }`}
                    >
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-[background-color,box-shadow,transform] duration-hover ease-out ${
                        selected ? 'bg-jade text-white shadow-[0_8px_20px_rgba(15,82,87,0.18)]' : 'bg-white/70 text-jade group-hover:bg-jade group-hover:text-white group-focus-visible:bg-jade group-focus-visible:text-white'
                      }`}>
                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink transition-colors duration-hover ease-out group-hover:text-jade">
                          {t(`home.toolkit.${key}.i${index + 1}.title`)}
                        </span>
                        <span className="mt-0.5 block text-sm leading-snug text-ink-secondary">
                          {t(`home.toolkit.${key}.i${index + 1}.desc`)}
                        </span>
                      </span>
                      <ArrowRightIcon />
                    </button>
                  </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArrowRightIcon() {
  return (
    <span
      aria-hidden="true"
      className="mt-1 text-jade/60 opacity-0 transition-[opacity,transform] duration-hover ease-out group-hover:translate-x-[3px] group-hover:opacity-100 group-focus-visible:translate-x-[3px] group-focus-visible:opacity-100"
    >
      →
    </span>
  );
}

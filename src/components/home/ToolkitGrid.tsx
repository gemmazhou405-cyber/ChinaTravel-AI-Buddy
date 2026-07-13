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
import { useTranslation } from 'react-i18next';
import type { TabId } from '../../App';

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
    tint: 'bg-tint-blue',
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
    tint: 'bg-tint-cream',
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
    tint: 'bg-tint-red',
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

  return (
    <section id="toolkit" className="scroll-mt-20 bg-canvas py-20 md:py-32">
      <div className="mx-auto max-w-container px-6 md:px-8">
        <div className="md:flex md:items-end md:justify-between md:gap-10">
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
          {COLUMNS.map(({ key, tint, label, labelText, items }) => (
            <div key={key} className={`rounded-2xl p-6 md:p-7 ${tint}`}>
              <span className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${label} ${labelText}`}>
                {t(`home.toolkit.${key}.label`)}
              </span>
              <ul className="mt-6 space-y-5">
                {items.map(({ icon: Icon, tab, tool }, index) => (
                  <li key={index}>
                    <button
                      onClick={() => onOpen(tab, tool)}
                      className="group flex w-full items-start gap-3 text-left"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/70">
                        <Icon className="h-4 w-4 text-jade" strokeWidth={1.5} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-ink transition-colors duration-hover ease-out group-hover:text-jade">
                          {t(`home.toolkit.${key}.i${index + 1}.title`)}
                        </span>
                        <span className="mt-0.5 block text-sm leading-snug text-ink-secondary">
                          {t(`home.toolkit.${key}.i${index + 1}.desc`)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

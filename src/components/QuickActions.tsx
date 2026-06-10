import {
  ArrowRight,
  BookOpen,
  Building2,
  Car,
  CreditCard,
  HeartPulse,
  Hotel,
  Landmark,
  MapPinned,
  MessageCircle,
  Plane,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Train,
  Utensils,
} from 'lucide-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { JourneyId, TabId } from '../App';

type Category = {
  label: string;
  note: string;
  icon: ReactNode;
  tab?: TabId;
  tool?: string;
  askBuddy?: boolean;
};

interface Props {
  journey: JourneyId;
  onJourneyChange: (journey: JourneyId) => void;
  onTabSelect: (tab: TabId, tool?: string) => void;
  onAskBuddy: () => void;
}

function CategoryButton({ category, onTabSelect, onAskBuddy }: Pick<Props, 'onTabSelect' | 'onAskBuddy'> & { category: Category }) {
  return (
    <button
      onClick={() => (category.askBuddy ? onAskBuddy() : category.tab && onTabSelect(category.tab, category.tool))}
      className="group min-h-[5.45rem] rounded-[1.2rem] border border-[#e8dcc6] bg-[#fffdf8] p-3.5 text-left shadow-[0_18px_46px_rgba(8,37,38,0.08)] transition-all duration-200 hover:-translate-y-1 hover:border-[#d6a85a]/60 hover:shadow-[0_24px_58px_rgba(8,37,38,0.14)] active:scale-[0.985] md:min-h-[7rem] md:rounded-[1.35rem] md:p-4 lg:min-h-[7.4rem]"
    >
      <div className="flex h-full flex-col justify-between gap-4">
        <div>
          <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-[#0f6f6c]/10 text-[#0f6f6c] ring-1 ring-[#0f6f6c]/10 md:mb-3 md:h-10 md:w-10 lg:h-9 lg:w-9">
            {category.icon}
          </div>
          <span className="block truncate text-sm font-bold tracking-tight text-[#122022] md:text-base lg:text-[15px]">{category.label}</span>
          <span className="mt-1 block truncate text-xs font-medium leading-snug text-[#536365] md:text-sm">{category.note}</span>
        </div>
        <ArrowRight className="h-4 w-4 text-[#d6a85a] transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );
}

export default function QuickActions({ journey, onJourneyChange, onTabSelect, onAskBuddy }: Props) {
  const { t } = useTranslation();

  const journeys: Array<{ id: JourneyId; label: string; shortLabel: string; subtitle: string; keywords: string; icon: ReactNode }> = [
    {
      id: 'before',
      label: t('journey.states.before'),
      shortLabel: t('journey.statesShort.before'),
      subtitle: t('journey.selector.beforeSubtitle'),
      keywords: t('journey.selector.beforeKeywords'),
      icon: <Plane className="h-5 w-5" />,
    },
    {
      id: 'now',
      label: t('journey.states.now'),
      shortLabel: t('journey.statesShort.now'),
      subtitle: t('journey.selector.nowSubtitle'),
      keywords: t('journey.selector.nowKeywords'),
      icon: <MapPinned className="h-5 w-5" />,
    },
    {
      id: 'emergency',
      label: t('journey.states.emergency'),
      shortLabel: t('journey.statesShort.emergency'),
      subtitle: t('journey.selector.emergencySubtitle'),
      keywords: t('journey.selector.emergencyKeywords'),
      icon: <ShieldCheck className="h-5 w-5" />,
    },
  ];

  const beforeCategories: Category[] = [
    { label: t('journey.before.apps'), note: t('journey.cards.appsNote'), icon: <Smartphone className="h-5 w-5" />, tab: 'before', tool: 'apps' },
    { label: t('journey.cards.payments'), note: t('journey.cards.paymentsNote'), icon: <CreditCard className="h-5 w-5" />, tab: 'before', tool: 'payment' },
    { label: t('journey.before.checklist'), note: t('journey.before.checklistNote'), icon: <BookOpen className="h-5 w-5" />, tab: 'before', tool: 'checklist' },
    { label: t('journey.before.transport'), note: t('journey.before.transportNote'), icon: <Train className="h-5 w-5" />, tab: 'before', tool: 'transport' },
    { label: t('journey.before.cityGuides'), note: t('journey.before.cityGuidesNote'), icon: <Landmark className="h-5 w-5" />, tab: 'before', tool: 'city' },
    { label: t('journey.now.askBuddy'), note: t('journey.cards.askBuddyNote'), icon: <MessageCircle className="h-5 w-5" />, askBuddy: true },
  ];

  const nowCategories: Category[] = [
    { label: t('journey.cards.apps'), note: t('journey.cards.appsNote'), icon: <Smartphone className="h-5 w-5" />, tab: 'before', tool: 'apps' },
    { label: t('journey.cards.payments'), note: t('journey.cards.paymentsNote'), icon: <CreditCard className="h-5 w-5" />, tab: 'pay', tool: 'pay' },
    { label: t('journey.cards.food'), note: t('journey.cards.foodNote'), icon: <Utensils className="h-5 w-5" />, tab: 'food', tool: 'food' },
    { label: t('journey.cards.transport'), note: t('journey.cards.transportNote'), icon: <Car className="h-5 w-5" />, tab: 'transport', tool: 'transport' },
    { label: t('journey.cards.stay'), note: t('journey.cards.stayNote'), icon: <Hotel className="h-5 w-5" />, tab: 'stay', tool: 'stay' },
    { label: t('journey.cards.askBuddy'), note: t('journey.cards.askBuddyNote'), icon: <MessageCircle className="h-5 w-5" />, askBuddy: true },
  ];

  const emergencyCategories: Category[] = [
    { label: t('journey.emergency.numbers'), note: '110 · 120 · 119', icon: <HeartPulse className="h-5 w-5" />, tab: 'emergency', tool: 'numbers' },
    { label: t('journey.emergency.hospital'), note: t('journey.emergency.hospitalNote'), icon: <HeartPulse className="h-5 w-5" />, tab: 'emergency', tool: 'hospital' },
    { label: t('journey.emergency.police'), note: t('journey.emergency.policeNote'), icon: <ShieldCheck className="h-5 w-5" />, tab: 'emergency', tool: 'police' },
    { label: t('journey.emergency.lostItems'), note: t('journey.emergency.lostItemsNote'), icon: <Building2 className="h-5 w-5" />, tab: 'emergency', tool: 'lost' },
    { label: t('journey.cards.askBuddy'), note: t('journey.cards.askBuddyNote'), icon: <MessageCircle className="h-5 w-5" />, askBuddy: true },
  ];

  const categories = journey === 'before' ? beforeCategories : journey === 'emergency' ? emergencyCategories : nowCategories;
  const guideCards = [
    ['firstTime', '/china-travel-checklist', 'url("/hero.jpg")'],
    ['destinations', '/china-travel-checklist', 'url("/images/hero-china-landscape.jpg")'],
    ['culture', '/faq', 'url("/hero-mobile.jpg")'],
    ['tips', '/china-travel-apps', 'url("/email_header.jpg")'],
  ] as const;

  return (
    <section id="journey-tools" className="relative overflow-hidden bg-[#061e1f] px-3 py-5 md:px-6 md:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(214,168,90,0.16),transparent_28%),radial-gradient(circle_at_92%_18%,rgba(18,123,120,0.28),transparent_32%),linear-gradient(180deg,#061e1f,#0b2a2a_38%,#f8f3ea_38%,#f8f3ea)] md:bg-[radial-gradient(circle_at_12%_8%,rgba(214,168,90,0.16),transparent_28%),radial-gradient(circle_at_92%_18%,rgba(18,123,120,0.28),transparent_32%),linear-gradient(180deg,#061e1f,#0b2a2a_44%,#f8f3ea_44%,#f8f3ea)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-3 gap-1.5 rounded-[1.35rem] border border-white/[0.12] bg-white/[0.07] p-1.5 shadow-[0_28px_90px_rgba(0,0,0,0.24)] backdrop-blur-2xl md:gap-3 md:rounded-[2rem] md:p-3">
          {journeys.map((item) => (
            <button
              key={item.id}
              onClick={() => onJourneyChange(item.id)}
              className={`group min-h-[5.4rem] rounded-[1rem] border px-2 py-2.5 text-left transition-all duration-200 md:min-h-0 md:rounded-[1.25rem] md:p-5 ${
                journey === item.id
                  ? 'border-[#d6a85a]/50 bg-gradient-to-br from-[#0f6f6c]/92 to-[#061e1f]/92 text-white shadow-[0_20px_54px_rgba(0,0,0,0.25)]'
                  : 'border-white/10 bg-white/[0.06] text-white/70 hover:border-[#d6a85a]/[0.28] hover:bg-white/[0.10] hover:text-white'
              }`}
            >
              <div className="hidden items-start justify-between gap-3 md:flex">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${journey === item.id ? 'bg-[#e8c27a] text-[#061e1f]' : 'bg-white/10 text-[#e8c27a]'}`}>
                  {item.icon}
                </div>
                <ArrowRight className={`mt-2 h-4 w-4 transition-transform group-hover:translate-x-1 ${journey === item.id ? 'text-[#e8c27a]' : 'text-white/30'}`} />
              </div>
              <h2 className="text-center text-[12px] font-bold leading-tight tracking-tight md:mt-4 md:text-left md:text-xl">
                <span className="md:hidden">{item.shortLabel}</span>
                <span className="hidden md:inline">{item.label}</span>
              </h2>
              <p className={`mt-1 line-clamp-2 text-center text-[10.5px] font-medium leading-snug md:text-left md:text-sm ${journey === item.id ? 'text-white/80' : 'text-white/60'}`}>{item.subtitle}</p>
              <p className={`mt-3 hidden text-[11px] font-semibold uppercase tracking-[0.16em] md:block ${journey === item.id ? 'text-[#f6ddb0]' : 'text-white/40'}`}>{item.keywords}</p>
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 md:mt-5 md:justify-center">
          {[t('journey.badges.noApp'), t('journey.badges.showChinese'), t('journey.badges.askBuddy')].map((tag, index) => (
            <span
              key={tag}
              className={`rounded-full border border-white/[0.12] bg-white/[0.10] px-3 py-1.5 text-[11px] font-semibold text-[#f7f2e8]/90 backdrop-blur-xl md:text-xs ${index > 1 ? 'hidden md:inline-flex' : ''}`}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 rounded-[1.6rem] bg-[#f8f3ea] p-3.5 shadow-[0_28px_90px_rgba(0,0,0,0.18)] md:mt-7 md:rounded-[1.5rem] md:p-4">
          <div className="mb-4 flex flex-col gap-2 md:mb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d6a85a]">{t('journey.cards.kicker')}</p>
              <h2
                className="mt-1.5 text-2xl font-semibold tracking-tight text-[#122022] md:mt-1 md:text-2xl"
                style={{ fontFamily: 'Cormorant Garamond, Playfair Display, Georgia, serif' }}
              >
                {t('journey.cards.title')}
              </h2>
            </div>
            {journey === 'now' && (
              <p className="max-w-sm text-xs font-medium leading-relaxed text-[#536365] md:text-sm">
                {t('journey.now.askBuddyHint')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 lg:grid-cols-6">
            {categories.map((category) => (
              <CategoryButton
                key={`${category.label}-${category.tool ?? 'buddy'}`}
                category={category}
                onTabSelect={onTabSelect}
                onAskBuddy={onAskBuddy}
              />
            ))}
          </div>

          {journey === 'emergency' && (
            <div className="mt-5 grid grid-cols-3 gap-2 md:gap-3">
              {[
                ['110', t('journey.emergency.policeLabel')],
                ['120', t('journey.emergency.ambulanceLabel')],
                ['119', t('journey.emergency.fireLabel')],
              ].map(([number, label]) => (
                <a
                  key={number}
                  href={`tel:${number}`}
                  className="rounded-[1.15rem] border border-red-100 bg-red-50 px-2 py-3 text-center shadow-[0_14px_34px_rgba(127,29,29,0.08)] transition-all hover:-translate-y-0.5 hover:bg-red-50/85 md:rounded-[1.35rem]"
                >
                  <span className="block text-xl font-black text-red-700 md:text-2xl">{number}</span>
                  <span className="text-[10px] font-semibold text-red-700/70 md:text-xs">{label}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-3 md:mt-5 md:grid-cols-4">
          {[
            ['ai', t('journey.trust.ai.title'), t('journey.trust.ai.body')],
            ['mobile', t('journey.trust.mobile.title'), t('journey.trust.mobile.body')],
            ['firstTimers', t('journey.trust.firstTimers.title'), t('journey.trust.firstTimers.body')],
            ['practical', t('journey.trust.practical.title'), t('journey.trust.practical.body')],
          ].map(([key, title, body]) => (
            <div key={key} className="rounded-[1.25rem] border border-white/[0.14] bg-white/[0.10] p-4 text-[#f7f2e8] backdrop-blur-xl md:rounded-[1.1rem]">
              <Sparkles className="mb-3 h-4 w-4 text-[#e8c27a]" />
              <h3 className="text-sm font-bold">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-white/80 md:text-white/60">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 md:mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2
              className="text-2xl font-semibold tracking-tight text-[#fffaf0] md:text-2xl"
              style={{ fontFamily: 'Cormorant Garamond, Playfair Display, Georgia, serif' }}
            >
              {t('journey.guides.title')}
            </h2>
            <a href="/china-travel-apps" className="hidden items-center gap-2 text-xs font-semibold text-[#f6ddb0] transition-colors hover:text-[#fffaf0] md:inline-flex">
              {t('journey.guides.exploreAll')} <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            {guideCards.map(([key, href, image]) => (
              <a
                key={key}
                href={href}
                className="group relative min-h-[10rem] overflow-hidden rounded-[1.25rem] bg-cover bg-center p-4 text-white shadow-[0_20px_54px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-1 md:min-h-[8.5rem]"
                style={{ backgroundImage: image }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,30,31,0.10),rgba(6,30,31,0.82)),radial-gradient(circle_at_78%_18%,rgba(232,194,122,0.24),transparent_28%)]" />
                <div className="relative flex h-full flex-col justify-end">
                  <div>
                    <h3 className="text-base font-bold">{t(`journey.guides.${key}.title`)}</h3>
                    <p className="mt-1 text-xs font-medium text-white/70">{t(`journey.guides.${key}.body`)}</p>
                    <ArrowRight className="mt-3 h-4 w-4 text-[#e8c27a] transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
          {journey !== 'now' && (
            <button onClick={() => onJourneyChange('now')} className="rounded-full border border-white/[0.14] bg-white/[0.08] px-3 py-1.5 text-[#f7f2e8]/80 backdrop-blur-xl transition-all hover:bg-white/[0.13]">
              {t('journey.switch.daily')}
            </button>
          )}
          {journey !== 'before' && (
            <button onClick={() => onJourneyChange('before')} className="rounded-full border border-white/[0.14] bg-white/[0.08] px-3 py-1.5 text-[#f7f2e8]/80 backdrop-blur-xl transition-all hover:bg-white/[0.13]">
              {t('journey.switch.planning')}
            </button>
          )}
          {journey !== 'emergency' && (
            <button onClick={() => onJourneyChange('emergency')} className="rounded-full border border-red-200/25 bg-red-100/10 px-3 py-1.5 text-red-100 backdrop-blur-xl transition-all hover:bg-red-100/15">
              {t('journey.switch.urgent')}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

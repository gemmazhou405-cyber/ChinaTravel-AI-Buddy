import { ArrowRight, Building2, Phone, Shield, Stethoscope } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TabId } from '../../App';

type TagTarget = { tab: TabId; tool?: string };

// Each tag deep-links into the toolkit via the same openToolkit flow the
// header CTA and toolkit grid use — no separate navigation logic.
const SCENARIOS: Array<{ key: 's1' | 's2' | 's3'; image: string; tags: TagTarget[] }> = [
  {
    key: 's1',
    image: '/scenario-arrival-900.webp',
    tags: [
      { tab: 'before', tool: 'apps' },      // Essential apps
      { tab: 'before', tool: 'payment' },   // Alipay setup
      { tab: 'before', tool: 'apps' },      // eSIM & data (lives in the apps tool)
      { tab: 'before', tool: 'transport' }, // Airport transfer
    ],
  },
  {
    key: 's2',
    image: '/scenario-food-900.webp',
    tags: [
      { tab: 'food', tool: 'food' },  // Menu photo translation
      { tab: 'food', tool: 'food' },  // Allergen alerts (part of the menu tool)
      { tab: 'food', tool: 'food' },  // Dietary filters (part of the menu tool)
      { tab: 'stay', tool: 'stay' },  // Show it in Chinese (phrase cards)
    ],
  },
  {
    key: 's3',
    image: '/screenshot_emergency.jpg',
    tags: [
      { tab: 'emergency', tool: 'numbers' },
      { tab: 'emergency', tool: 'hospital' },
      { tab: 'emergency', tool: 'police' },
      { tab: 'emergency', tool: 'lost' },
    ],
  },
];

interface Props {
  onOpenTool: (tab: TabId, tool?: string) => void;
}

export default function Scenarios({ onOpenTool }: Props) {
  const { t } = useTranslation();

  return (
    <section id="features" className="scroll-mt-20 bg-canvas py-20 md:py-32">
      <div className="mx-auto max-w-container space-y-6 px-6 md:space-y-8 md:px-8">
        {SCENARIOS.map(({ key, image, tags }, index) => (
          <div key={key} className="grid overflow-hidden rounded-2xl shadow-card md:grid-cols-2">
            <div
              className={`flex flex-col justify-center p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] md:p-12 ${index % 2 === 1 ? 'md:order-2' : ''}`}
              style={{ background: 'var(--surface-jade-deep)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                {t(`home.scenarios.${key}.kicker`)}
              </p>
              <h3 className="mt-4 font-display text-3xl font-normal leading-[1.1] tracking-[-0.01em] text-white md:text-[40px]">
                {t(`home.scenarios.${key}.title`)}
              </h3>
              <p className="mt-4 max-w-[26rem] text-base leading-relaxed text-white/75">
                {t(`home.scenarios.${key}.body`)}
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {tags.map((target, n) => {
                  const label = t(`home.scenarios.${key}.tag${n + 1}`);
                  return (
                    <button
                      key={n}
                      onClick={() => onOpenTool(target.tab, target.tool)}
                      aria-label={t('home.scenarios.tagAria', { name: label })}
                      className="min-h-[40px] cursor-pointer rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-[background-color,border-color,transform] duration-hover ease-out hover:border-white/50 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/90 active:bg-[#0B4145] active:text-white motion-safe:hover:-translate-y-0.5 md:min-h-[32px]"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {key === 's1' && (
                <button
                  onClick={() => onOpenTool('before', 'checklist')}
                  className="group mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-white/90 transition-colors duration-hover ease-out hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/90"
                >
                  {t('home.scenarios.s1.cta')}
                  <ArrowRight className="h-4 w-4 transition-transform duration-hover ease-out motion-safe:group-hover:translate-x-0.5" strokeWidth={1.5} />
                </button>
              )}
            </div>
            <div className={`relative min-h-[240px] md:min-h-[420px] ${index % 2 === 1 ? 'md:order-1' : ''}`}>
              {key === 's3' ? (
                <EmergencySupportScene label={t(`home.scenarios.${key}.title`)} />
              ) : (
                <img
                  src={image}
                  alt={t(`home.scenarios.${key}.title`)}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmergencySupportScene({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="absolute inset-0 overflow-hidden bg-[#071E1F]"
    >
      <img
        src="/images/hero-china-landscape-900.jpg"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-55 blur-[2px]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_28%,rgba(232,194,122,0.24),transparent_28%),linear-gradient(135deg,rgba(4,24,25,0.9),rgba(8,56,57,0.55)_48%,rgba(4,20,22,0.88))]" />
      <div className="absolute -bottom-16 -right-12 h-56 w-56 rounded-full bg-[#0F6F6C]/35 blur-3xl" />
      <div className="absolute left-5 top-6 hidden rounded-2xl border border-white/18 bg-white/12 px-4 py-3 text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-md sm:block">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4 text-[#E8C27A]" strokeWidth={1.7} />
          110 Police
        </div>
      </div>
      <div className="absolute bottom-8 left-6 rounded-2xl border border-white/18 bg-white/12 px-4 py-3 text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-md">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Phone className="h-4 w-4 text-[#E8C27A]" strokeWidth={1.7} />
          120 Ambulance
        </div>
      </div>
      <div className="absolute right-6 top-7 rounded-2xl border border-white/18 bg-white/12 px-4 py-3 text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-md">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Stethoscope className="h-4 w-4 text-[#E8C27A]" strokeWidth={1.7} />
          Hospital phrases
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 top-0 flex items-center justify-center px-8 py-7">
        <div className="relative h-[82%] min-h-[260px] w-[min(68%,250px)] max-w-[270px] rounded-[2.25rem] border border-white/30 bg-[#11191A] p-2 shadow-[0_32px_90px_rgba(0,0,0,0.46),0_0_0_1px_rgba(232,194,122,0.18)] md:h-[78%] md:w-[42%] md:min-w-[230px]">
          <div className="absolute left-1/2 top-3 h-5 w-20 -translate-x-1/2 rounded-full bg-[#0A0F10]" />
          <div className="flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[#FFFDF8]">
            <div className="bg-[linear-gradient(135deg,#F8F3EA,#FFFFFF)] px-5 pb-4 pt-9 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F6F6C] text-white shadow-[0_10px_30px_rgba(15,111,108,0.28)]">
                <Shield className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <p className="font-display text-2xl text-[#123033]">Emergency Kit</p>
            </div>
            <div className="flex-1 space-y-3 bg-[#F8F3EA] px-4 py-4">
              <EmergencyPhoneRow tone="jade" number="110" label="Police" icon={<Shield className="h-4 w-4" strokeWidth={1.8} />} />
              <EmergencyPhoneRow tone="red" number="120" label="Ambulance" icon={<Phone className="h-4 w-4" strokeWidth={1.8} />} />
              <EmergencyPhoneRow tone="orange" number="119" label="Fire" icon={<Phone className="h-4 w-4" strokeWidth={1.8} />} />
              <div className="rounded-2xl border border-[#0F6F6C]/12 bg-white/85 p-3 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#0F4C4E]">
                  <Building2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                  My information
                </div>
                <div className="space-y-1.5 text-[10px] leading-tight text-[#536365]">
                  <div className="flex justify-between gap-2">
                    <span>Hotel address</span>
                    <span className="font-medium text-[#122022]">北京市朝阳区...</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Passport help</span>
                    <span className="font-medium text-[#122022]">Show to police</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 bg-[#0F6F6C] px-5 py-3 text-center text-[9px] font-medium text-white/75">
              <span>Call</span>
              <span>Location</span>
              <span>Phrases</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmergencyPhoneRow({
  tone,
  number,
  label,
  icon,
}: {
  tone: 'jade' | 'red' | 'orange';
  number: string;
  label: string;
  icon: React.ReactNode;
}) {
  const tones = {
    jade: 'from-[#0F6F6C] to-[#0A4D50]',
    red: 'from-[#C93A34] to-[#9F241F]',
    orange: 'from-[#E45E2E] to-[#BB3D1E]',
  };

  return (
    <div className={`flex items-center gap-3 rounded-2xl bg-gradient-to-r ${tones[tone]} px-3 py-2.5 text-white shadow-[0_12px_28px_rgba(0,0,0,0.14)]`}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/17">
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight">{number}</span>
        <span className="truncate text-xs font-semibold text-white/86">{label}</span>
      </div>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/16">
        <Phone className="h-3.5 w-3.5" strokeWidth={1.8} />
      </div>
    </div>
  );
}

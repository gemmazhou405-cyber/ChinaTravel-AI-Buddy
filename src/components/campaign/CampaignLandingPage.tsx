import { useEffect, useState } from 'react';
import {
  AppWindow,
  ArrowRight,
  Car,
  CheckCircle2,
  HelpCircle,
  CreditCard,
  Globe2,
  Hotel,
  Languages,
  MapPinned,
  Route,
  ShieldCheck,
  Siren,
  Soup,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ChatModal from '../ChatModal';
import VisaFreeCheckerTool from '../VisaFreeCheckerTool';
import { usePass } from '../../hooks/usePass';
import { campaignLandings, type CampaignCta, type CampaignIcon } from '../../data/campaignLandings';
import { getCampaignPartner, type CampaignLandingVariant } from '../../data/campaignPartners';
import { captureCampaignAttribution, sanitizeCampaignValue } from '../../lib/campaignAttribution';
import { trackEvent, trackEventOnce } from '../../lib/analytics';
import CampaignShell from './CampaignShell';

const icons: Record<CampaignIcon, LucideIcon> = {
  apps: AppWindow,
  car: Car,
  emergency: Siren,
  food: Soup,
  hotel: Hotel,
  internet: Globe2,
  language: Languages,
  payment: CreditCard,
  route: Route,
  safety: ShieldCheck,
  visa: MapPinned,
};

const requiredGuides = [
  ['/plan/', 'resources.plan'],
  ['/first-trip-to-china/', 'resources.firstTrip'],
  ['/china-travel-checklist/', 'resources.checklist'],
  ['/china-travel-apps/', 'resources.apps'],
  ['/alipay-for-foreigners/', 'resources.alipay'],
  ['/china-payment-guide/', 'resources.payment'],
  ['/china-emergency-numbers/', 'resources.emergency'],
] as const;

function setCampaignMeta(variant: CampaignLandingVariant) {
  const config = campaignLandings[variant];
  document.title = config.title;
  const setMeta = (selector: string, value: string) => {
    let node = document.head.querySelector<HTMLMetaElement>(selector);
    if (!node) {
      node = document.createElement('meta');
      const name = selector.match(/name="([^"]+)"/)?.[1];
      const property = selector.match(/property="([^"]+)"/)?.[1];
      if (name) node.name = name;
      if (property) node.setAttribute('property', property);
      document.head.appendChild(node);
    }
    node.content = value;
  };
  setMeta('meta[name="description"]', config.description);
  setMeta('meta[name="robots"]', 'index, follow');
  setMeta('meta[property="og:title"]', config.title);
  setMeta('meta[property="og:description"]', config.description);
  setMeta('meta[property="og:url"]', `https://chinaeasebuddy.com${config.path}`);
  setMeta('meta[name="twitter:title"]', config.title);
  setMeta('meta[name="twitter:description"]', config.description);
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = `https://chinaeasebuddy.com${config.path}`;
}

export default function CampaignLandingPage({ variant }: { variant: CampaignLandingVariant }) {
  const { t } = useTranslation('campaign');
  const config = campaignLandings[variant];
  const [chatOpen, setChatOpen] = useState(false);
  const { passState, refreshPassState } = usePass();
  const params = new URLSearchParams(window.location.search);
  const rawPartner = sanitizeCampaignValue(params.get('partner') || params.get('ref'), 40);
  const partner = getCampaignPartner(rawPartner, variant);
  const isVisaLanding = variant === 'visa';

  const trackCta = (cta: CampaignCta, placement: string) => {
    void trackEvent('campaign_primary_cta_click', {
      landingVariant: variant,
      partnerId: rawPartner,
      partnerType: partner?.type || sanitizeCampaignValue(params.get('channel'), 40),
      destinationPath: cta.href || 'ask-buddy',
      placement,
    });
  };

  useEffect(() => {
    setCampaignMeta(variant);
    captureCampaignAttribution(variant);
    trackEventOnce(`campaign-view:${variant}:${rawPartner || 'direct'}`, 'campaign_landing_view', {
      landingVariant: variant,
      partnerId: rawPartner,
      partnerType: partner?.type || sanitizeCampaignValue(params.get('channel'), 40),
    });
  // Search params are captured once for the landing-page lifecycle.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  const renderCta = (cta: CampaignCta, className: string, placement: string) => {
    if (cta.action === 'buddy') {
      return (
        <button
          key={cta.labelKey}
          type="button"
          onClick={() => { trackCta(cta, placement); setChatOpen(true); }}
          className={className}
        >
          {t(cta.labelKey)} <HelpCircle className="h-4 w-4" aria-hidden="true" />
        </button>
      );
    }
    return (
      <a key={cta.labelKey} href={cta.href} onClick={() => trackCta(cta, placement)} className={className}>
        {t(cta.labelKey)} <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </a>
    );
  };

  return (
    <CampaignShell>
      <main>
        {isVisaLanding ? (
          <section className="relative overflow-hidden border-b border-hairline bg-[#F2F7F5] py-8 sm:py-12 md:py-16">
            <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-jade-wash to-transparent" aria-hidden="true" />
            <div className="relative mx-auto grid w-full min-w-0 max-w-container gap-8 px-4 sm:px-6 md:grid-cols-[1.05fr_0.95fr] md:items-center md:px-8">
              <div className="min-w-0">
                <p className="inline-flex rounded-full border border-jade/20 bg-white px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-jade shadow-sm">
                  {t('visa.eyebrow')}
                </p>
                <h1 className="mt-4 max-w-2xl font-display text-[40px] leading-[1.02] sm:text-5xl md:text-[58px]">
                  {t('visa.title')}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-secondary md:text-lg">
                  {t('visa.description')}
                </p>
                <p className="mt-4 flex max-w-xl items-start gap-2 text-sm font-semibold leading-relaxed text-ink">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-jade" aria-hidden="true" />
                  {t('visa.basis')}
                </p>
                {partner && (
                  <p className="mt-4 inline-flex rounded-full border border-jade/20 bg-white px-4 py-2 text-sm font-semibold text-jade">
                    {t('recommendedBy', { name: partner.displayName })}
                  </p>
                )}
                <div className="mt-6">
                  {renderCta(
                    { ...config.primary, href: '#visa-checker-form' },
                    'inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-jade px-7 py-4 text-base font-bold text-white shadow-soft transition hover:bg-jade-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jade sm:w-auto',
                    'hero_primary',
                  )}
                </div>
                <p className="mt-3 text-xs font-semibold text-ink-tertiary">{t('visa.microcopy')}</p>
              </div>

              <aside className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-jade/15 bg-white p-5 shadow-soft sm:p-6" aria-label="Free China visa policy checker">
                <VisaFreeCheckerTool id="visa-checker-form" compact />
              </aside>
            </div>
          </section>
        ) : (
          <section className="relative overflow-hidden border-b border-hairline bg-[#F2F7F5] py-12 md:py-20">
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-jade-wash to-transparent" aria-hidden="true" />
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-jade">{t(`${config.translationKey}.eyebrow`)}</p>
              <h1 className="mx-auto mt-4 max-w-3xl font-display text-[38px] leading-[1.06] sm:text-5xl md:text-[58px]">
                {t(`${config.translationKey}.title`)}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-secondary md:text-lg">
                {t(`${config.translationKey}.description`)}
              </p>
              {partner && (
                <p className="mx-auto mt-5 inline-flex rounded-full border border-jade/20 bg-white px-4 py-2 text-sm font-semibold text-jade">
                  {t('recommendedBy', { name: partner.displayName })}
                </p>
              )}
              <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                {renderCta(
                  config.primary,
                  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-jade px-6 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-jade-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jade',
                  'hero_primary',
                )}
                {config.secondary.map((cta) => renderCta(
                  cta,
                  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-jade/25 bg-white px-5 py-3.5 text-sm font-bold text-jade transition hover:border-jade/50 hover:bg-jade-wash focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jade',
                  'hero_secondary',
                ))}
              </div>
              <p className="mt-4 text-xs font-medium text-ink-tertiary">{t(`${config.translationKey}.microcopy`)}</p>
            </div>
          </section>
        )}

        {isVisaLanding && (
          <section className="border-b border-hairline bg-white py-10 md:py-14" aria-labelledby="visa-why-title">
            <div className="mx-auto max-w-container px-4 sm:px-6 md:px-8">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-dark">{t('visa.whyEyebrow')}</p>
                <h2 id="visa-why-title" className="mt-3 font-display text-3xl md:text-4xl">{t('visa.whyTitle')}</h2>
              </div>
              <div className="mt-7 grid gap-4 md:grid-cols-3">
                {(t('visa.whyPoints', { returnObjects: true }) as Array<{ title: string; description: string }>).map((point, index) => (
                  <article key={point.title} className="rounded-2xl border border-hairline bg-surface p-5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-jade text-sm font-bold text-white" aria-hidden="true">{index + 1}</span>
                    <h3 className="mt-4 text-base font-bold text-ink">{point.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{point.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-12 md:py-16" aria-labelledby="campaign-help-title">
          <div className="mx-auto max-w-container px-4 sm:px-6 md:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-dark">{t('helpEyebrow')}</p>
              <h2 id="campaign-help-title" className="mt-3 font-display text-3xl md:text-4xl">{t(`${config.translationKey}.helpTitle`)}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary md:text-base">{t(`${config.translationKey}.helpDescription`)}</p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {config.cards.map((card) => {
                const Icon = icons[card.icon];
                return (
                  <a
                    key={card.titleKey}
                    href={card.href}
                    onClick={() => {
                      void trackEvent('outbound_tool_click', {
                        landingVariant: variant,
                        partnerId: rawPartner,
                        partnerType: partner?.type || sanitizeCampaignValue(params.get('channel'), 40),
                        destinationPath: card.href,
                      });
                    }}
                    className="group flex min-h-44 flex-col rounded-2xl border border-hairline bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-jade/30 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jade"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-jade-wash text-jade">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-bold">{t(card.titleKey)}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-secondary">{t(card.descriptionKey)}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-jade">
                      {t('openHelp')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {isVisaLanding ? (
          <section className="border-y border-hairline bg-[#F2F7F5] py-10 md:py-14">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
              <h2 className="font-display text-3xl text-ink md:text-4xl">{t('visa.secondaryTitle')}</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary md:text-base">{t('visa.secondaryDescription')}</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <a
                  href="/plan/"
                  onClick={() => trackCta({ href: '/plan/', labelKey: 'visa.planCta' }, 'secondary_section')}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-jade/25 bg-white px-5 py-3.5 text-sm font-bold text-jade transition hover:border-jade/50 hover:bg-jade-wash focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jade"
                >
                  {t('visa.planCta')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="/china-travel-checklist/"
                  onClick={() => trackCta({ href: '/china-travel-checklist/', labelKey: 'visa.checklistCta' }, 'secondary_section')}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-hairline bg-transparent px-5 py-3.5 text-sm font-bold text-ink transition hover:border-jade/40 hover:text-jade focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jade"
                >
                  {t('visa.checklistCta')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        ) : (
        <section className="bg-jade py-12 text-white md:py-16">
          <div className="mx-auto grid max-w-container gap-8 px-4 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:items-center md:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E8C27A]">{t('planEyebrow')}</p>
              <h2 className="mt-3 max-w-2xl font-display text-3xl md:text-4xl">{t(`${config.translationKey}.planTitle`)}</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">{t(`${config.translationKey}.planDescription`)}</p>
              <a
                href="/plan/"
                onClick={() => trackCta({ href: '/plan/', labelKey: `${config.translationKey}.planButton` }, 'plan_section')}
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F8F3EA] px-6 py-3.5 text-sm font-bold text-jade shadow-soft transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {t(`${config.translationKey}.planButton`)} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            <ul className="grid gap-3 rounded-2xl border border-white/15 bg-white/10 p-5">
              {(t(`${config.translationKey}.planPoints`, { returnObjects: true }) as string[]).map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-white/85">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#E8C27A]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
        )}

        <section className="py-12 md:py-16" aria-labelledby="campaign-resources-title">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 id="campaign-resources-title" className="font-display text-3xl">{t('resources.title')}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{t('resources.description')}</p>
            <div className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {requiredGuides.map(([href, labelKey]) => (
                <a key={href} href={href} className="inline-flex min-h-11 items-center justify-between gap-3 border-b border-hairline py-2 text-sm font-semibold text-ink transition hover:text-jade focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade">
                  {t(labelKey)} <ArrowRight className="h-4 w-4 shrink-0 text-jade" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-hairline bg-surface py-7">
          <p className="mx-auto max-w-3xl px-4 text-xs leading-relaxed text-ink-tertiary sm:px-6">{t('disclaimer')}</p>
        </section>
      </main>

      {chatOpen && (
        <ChatModal
          onClose={() => setChatOpen(false)}
          passState={passState}
          refreshPassState={refreshPassState}
          onOpenToolkit={() => { window.location.href = '/?journey=before&tool=apps'; }}
          onViewPricing={() => { setChatOpen(false); window.location.href = '/pricing/'; }}
        />
      )}
    </CampaignShell>
  );
}

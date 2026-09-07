import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import type { PassState } from '../hooks/usePass';

interface Props {
  passState: PassState | null;
  onAskBuddy: () => void;
  onOpenToolkit: () => void;
  onNavigate: (id: string) => void;
  onViewPass: () => void;
}

const NAV_IDS = ['trip-plan', 'toolkit', 'features', 'travel-passes'] as const;

export default function SiteHeader({ passState, onAskBuddy, onOpenToolkit, onNavigate, onViewPass }: Props) {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('toolkit');
  const assetBase = import.meta.env.BASE_URL;

  const hasPaidPass = Boolean(passState && passState.tier !== 'free' && !passState.expired);
  const NAV = [
    { id: 'trip-plan', label: t('home.nav.tripPlan') },
    { id: 'toolkit', label: t('home.nav.toolkit') },
    { id: 'features', label: t('home.nav.features') },
    { id: 'travel-passes', label: t('home.nav.pricing') },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0.08, 0.2, 0.36] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className={`sticky top-0 z-50 border-b border-hairline backdrop-blur-2xl transition-[background-color,box-shadow] duration-[260ms] ease-out ${
      scrolled ? 'bg-[#FFFDFA]/[0.9] shadow-[0_6px_24px_rgba(17,20,24,0.08)]' : 'bg-[#FFFDFA]/[0.74] shadow-[0_1px_16px_rgba(17,20,24,0.05)]'
    }`}>
      <div className="mx-auto flex h-16 max-w-container items-center justify-between gap-3 px-6 md:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <img src={`${assetBase}logo.png`} width="30" height="30" alt="" className="h-[30px] w-[30px] rounded-lg" />
          <span className="truncate text-sm font-semibold tracking-tight text-ink md:text-base">ChinaEase Buddy</span>
          <span className="hidden rounded-full border border-jade/25 bg-jade-wash px-2 py-0.5 text-[11px] font-semibold text-jade sm:inline">
            {t('home.hero.free')}
          </span>
        </div>

        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-secondary lg:flex">
          {NAV.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`relative transition-colors duration-hover ease-out hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jade ${activeSection === id ? 'text-jade' : ''}`}
            >
              {label}
              <span className={`absolute -bottom-2 left-0 h-px bg-jade transition-[width,opacity] duration-hover ease-out ${activeSection === id ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onAskBuddy}
            className="hidden text-sm font-medium text-jade transition-colors duration-hover ease-out hover:text-jade-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jade md:inline"
          >
            {t('home.hero.ctaSecondary')}
          </button>
          <button
            onClick={onOpenToolkit}
            className="hidden rounded-lg bg-jade px-3.5 py-2 text-sm font-semibold text-white transition-colors duration-hover ease-out hover:bg-jade-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade md:inline-flex"
          >
            {t('home.hero.ctaPrimary')}
          </button>
          <LanguageSwitcher />
          {hasPaidPass ? (
            <button
              onClick={onViewPass}
              className="flex items-center gap-1.5 rounded-lg border border-jade/30 bg-jade-wash px-2.5 py-1.5 text-xs font-semibold text-jade transition-colors duration-hover ease-out hover:border-jade/50"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-jade" />
              {t(`pay.plans.${passState?.tier}.name`)}
              {typeof passState?.remaining === 'number' && (
                <span className="text-jade/70">· {passState.remaining}</span>
              )}
            </button>
          ) : (
            <button
              onClick={onViewPass}
              className="hidden rounded-lg border border-jade/30 px-2.5 py-1.5 text-xs font-semibold text-jade transition-colors duration-hover ease-out hover:bg-jade-wash sm:block"
            >
              {t('nav.getPass')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

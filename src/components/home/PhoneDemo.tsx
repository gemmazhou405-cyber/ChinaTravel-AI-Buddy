import { MessageSquareText, QrCode, RotateCcw, Send, Sparkles, UtensilsCrossed } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type FeatureId = 'pay' | 'menu' | 'phrase';

const TIMELINE = [
  { delay: 0, stage: 1 },
  { delay: 400, stage: 2 },
  { delay: 700, stage: 3 },
  { delay: 900, stage: 4 },
  { delay: 1180, stage: 5 },
  { delay: 1400, stage: 6 },
  { delay: 1500, stage: 7 },
  { delay: 1780, stage: 8 },
  { delay: 2000, stage: 9 },
  { delay: 2300, stage: 10 },
  { delay: 2480, stage: 11 },
  { delay: 2700, stage: 12 },
] as const;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}

function TypingIndicator({ show }: { show: boolean }) {
  return (
    <div
      aria-hidden={!show}
      className={cx(
        'hero-demo-item flex h-[34px] w-fit items-center gap-1.5 rounded-xl rounded-bl-sm border border-hairline bg-surface px-3',
        show && 'is-visible',
      )}
    >
      <span className="hero-typing-dot" />
      <span className="hero-typing-dot [animation-delay:120ms]" />
      <span className="hero-typing-dot [animation-delay:240ms]" />
    </div>
  );
}

function FeatureCard({
  id,
  icon: Icon,
  title,
  body,
  visual,
  stage,
  visibleAt,
  hovered,
  onHover,
}: {
  id: FeatureId;
  icon: LucideIcon;
  title: string;
  body: string;
  visual: ReactNode;
  stage: number;
  visibleAt: number;
  hovered: FeatureId | null;
  onHover: (id: FeatureId | null) => void;
}) {
  const isVisible = stage >= visibleAt;
  const isHovered = hovered === id;

  return (
    <div
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      className={cx(
        'hero-feature-card glass-strong rounded-2xl p-4',
        isVisible && 'is-visible',
        isHovered && 'is-hovered',
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-jade-wash">
          <Icon className="h-3.5 w-3.5 text-jade" strokeWidth={1.5} />
        </span>
        <p className="text-sm font-semibold text-ink">{title}</p>
      </div>
      <p className="mt-1.5 text-xs leading-snug text-ink-secondary">{body}</p>
      <div className="mt-2.5 border-t border-jade/15 pt-2.5">{visual}</div>
    </div>
  );
}

function ConnectorLine({
  id,
  stage,
  activeAt,
  hovered,
}: {
  id: FeatureId;
  stage: number;
  activeAt: number;
  hovered: FeatureId | null;
}) {
  const active = stage >= activeAt;
  const emphasized = active && hovered === id;

  return (
    <svg
      aria-hidden="true"
      className={cx('hero-connector absolute hidden overflow-visible lg:block', `hero-connector-${id}`, active && 'is-active', emphasized && 'is-hovered')}
      viewBox="0 0 170 90"
      fill="none"
    >
      <path
        d={id === 'pay' ? 'M2 70 C54 20 100 16 168 24' : id === 'menu' ? 'M2 46 C58 42 106 42 168 46' : 'M2 20 C56 72 108 76 168 64'}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeDasharray="3 7"
      />
      <circle className="hero-connector-dot" r="3.5" cx={id === 'pay' ? 122 : id === 'menu' ? 100 : 126} cy={id === 'pay' ? 21 : id === 'menu' ? 43 : 73} />
    </svg>
  );
}

export default function PhoneDemo() {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const [stage, setStage] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState<FeatureId | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const playDemo = useCallback(() => {
    clearTimers();
    if (reducedMotion) {
      setStage(12);
      setHasPlayed(true);
      return;
    }

    setStage(0);
    TIMELINE.forEach(({ delay, stage: nextStage }) => {
      timersRef.current.push(window.setTimeout(() => setStage(nextStage), delay));
    });
    setHasPlayed(true);
  }, [clearTimers, reducedMotion]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || hasPlayed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          playDemo();
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasPlayed, playDemo]);

  useEffect(() => clearTimers, [clearTimers]);

  const paymentHighlighted = hoveredFeature === 'pay';
  const menuHighlighted = hoveredFeature === 'menu';
  const phraseHighlighted = hoveredFeature === 'phrase';

  return (
    <div ref={rootRef} className="hero-showcase relative lg:h-[640px]" aria-label="ChinaEase Buddy product demo">
      <style>{`
        .hero-demo-item,
        .hero-feature-card,
        .hero-phone-shell {
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 440ms ease-out, transform 440ms ease-out, border-color 180ms ease-out, box-shadow 180ms ease-out;
        }
        .hero-demo-item.is-visible,
        .hero-feature-card.is-visible,
        .hero-phone-shell.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .hero-feature-card {
          transform: translateX(14px);
          box-shadow: var(--glass-highlight), 0 12px 32px rgba(17, 20, 24, 0.08), 0 0 0 rgba(15, 82, 87, 0);
        }
        .hero-feature-card.is-visible {
          transform: translateX(0);
          animation: hero-card-glow 760ms ease-out both;
        }
        .hero-highlight {
          box-shadow: 0 0 0 1px rgba(15, 82, 87, 0.16), 0 10px 28px rgba(15, 82, 87, 0.12);
          border-color: rgba(15, 82, 87, 0.24);
        }
        .hero-connector {
          color: rgba(15, 82, 87, 0.18);
          opacity: 0;
          transition: opacity 420ms ease-out, color 180ms ease-out;
        }
        .hero-connector.is-active {
          opacity: 1;
          color: rgba(15, 82, 87, 0.34);
        }
        .hero-connector.is-hovered {
          color: rgba(15, 82, 87, 0.62);
        }
        .hero-connector path {
          stroke-dashoffset: 30;
          transition: stroke-dashoffset 720ms ease-out;
        }
        .hero-connector.is-active path {
          stroke-dashoffset: 0;
        }
        .hero-connector-dot {
          fill: #0F5257;
          opacity: 0;
          filter: drop-shadow(0 0 8px rgba(15, 82, 87, 0.5));
        }
        .hero-connector.is-active .hero-connector-dot {
          animation: hero-dot-pulse 680ms ease-out 1 both;
        }
        .hero-connector-pay {
          left: 42%;
          top: 82px;
          width: 180px;
        }
        .hero-connector-menu {
          left: 42%;
          top: 278px;
          width: 180px;
        }
        .hero-connector-phrase {
          left: 42%;
          bottom: 94px;
          width: 180px;
        }
        .hero-typing-dot {
          height: 5px;
          width: 5px;
          border-radius: 9999px;
          background: rgba(15, 82, 87, 0.55);
          animation: hero-typing 900ms ease-in-out infinite;
        }
        @media (hover: hover) and (pointer: fine) {
          .hero-feature-card.is-visible:hover,
          .hero-feature-card.is-hovered {
            transform: translateY(-3px);
            border-color: rgba(15, 82, 87, 0.24);
            box-shadow: var(--glass-highlight), 0 18px 44px rgba(15, 82, 87, 0.15);
          }
          .hero-phone-shell.is-visible:hover {
            transform: translateY(0) rotate(-0.7deg);
            box-shadow: 0 34px 100px rgba(17,20,24,0.16), 0 0 0 1px rgba(255,255,255,0.84);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-demo-item,
          .hero-feature-card,
          .hero-phone-shell,
          .hero-connector,
          .hero-connector path,
          .hero-connector-dot,
          .hero-typing-dot {
            animation: none !important;
            transition-duration: 1ms !important;
            transform: none !important;
          }
          .hero-typing-dot {
            opacity: 0.55;
          }
        }
        @keyframes hero-card-glow {
          0% { box-shadow: var(--glass-highlight), 0 12px 32px rgba(17, 20, 24, 0.08), 0 0 0 rgba(15, 82, 87, 0); }
          45% { box-shadow: var(--glass-highlight), 0 18px 46px rgba(15, 82, 87, 0.16), 0 0 26px rgba(15, 82, 87, 0.14); }
          100% { box-shadow: var(--glass-highlight), 0 12px 32px rgba(17, 20, 24, 0.08), 0 0 0 rgba(15, 82, 87, 0); }
        }
        @keyframes hero-dot-pulse {
          0% { opacity: 0; transform: scale(0.45); }
          40% { opacity: 1; transform: scale(1.28); }
          100% { opacity: 0.52; transform: scale(1); }
        }
        @keyframes hero-typing {
          0%, 80%, 100% { opacity: 0.32; transform: translateY(0); }
          40% { opacity: 0.9; transform: translateY(-2px); }
        }
      `}</style>

      <img
        src="/hero-atmosphere-900.webp"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute -inset-3 hidden h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] rounded-[3rem] object-cover opacity-[0.18] blur-[8px] md:block"
        style={{
          maskImage: 'radial-gradient(92% 92% at 58% 48%, black 22%, transparent 84%)',
          WebkitMaskImage: 'radial-gradient(92% 92% at 58% 48%, black 22%, transparent 84%)',
        }}
      />
      <div className="pointer-events-none absolute left-[42%] top-1/2 hidden h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-jade/[0.075] blur-3xl lg:block" />

      <ConnectorLine id="pay" stage={stage} activeAt={3} hovered={hoveredFeature} />
      <ConnectorLine id="menu" stage={stage} activeAt={7} hovered={hoveredFeature} />
      <ConnectorLine id="phrase" stage={stage} activeAt={10} hovered={hoveredFeature} />

      <div className="relative z-10 mx-auto flex flex-col items-center gap-6 lg:h-full lg:block">
        <div className="lg:absolute lg:left-[6%] lg:top-1/2 lg:-translate-y-1/2">
          <div
            onMouseEnter={() => setHoveredFeature(null)}
            className={cx(
              'hero-phone-shell relative rounded-[2.35rem] bg-ink p-[7px] shadow-card',
              stage >= 1 && 'is-visible',
            )}
            style={{
              width: 'clamp(280px, 21vw, 330px)',
              aspectRatio: '9 / 19.5',
            }}
          >
            <div className="absolute -inset-x-5 bottom-0 top-9 -z-10 rounded-[2.75rem] border border-white/55 bg-[#D7E0E6]/42 backdrop-blur-sm" />
            <div className="flex h-full flex-col overflow-hidden rounded-[1.82rem] bg-canvas">
              <div className="flex items-center justify-between px-5 pb-1 pt-2.5 text-[10px] font-semibold text-ink">
                <span>9:41</span>
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink/70" />
                  <span className="h-1.5 w-1.5 rounded-full bg-ink/50" />
                  <span className="h-1.5 w-1.5 rounded-full bg-ink/30" />
                </span>
              </div>
              <div className="flex items-center gap-2 border-b border-hairline px-4 py-2.5">
                <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-jade">
                  <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
                  <span className="absolute -bottom-0 -right-0 h-2 w-2 rounded-full border border-canvas bg-[#3E9B5F]" />
                </span>
                <div className="leading-tight">
                  <p className="text-xs font-semibold text-ink">Buddy</p>
                  <p className="text-[10px] text-ink-tertiary">{t('home.phone.role')}</p>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-2.5 px-3.5 py-3.5">
                <div className={cx('hero-demo-item ml-auto w-fit max-w-[85%] rounded-xl rounded-br-sm bg-jade px-3 py-2 text-[11px] leading-snug text-white', stage >= 2 && 'is-visible')}>
                  {t('home.phone.question')}
                </div>

                <TypingIndicator show={stage === 3 || stage === 5 || stage === 8 || stage === 11} />

                <div className={cx('hero-demo-item w-fit max-w-[92%] rounded-xl rounded-bl-sm border border-hairline bg-surface px-3 py-2 text-[11px] leading-snug text-ink', stage >= 4 && 'is-visible', paymentHighlighted && 'hero-highlight')}>
                  {t('home.phone.answerLead')}
                </div>
                <div className={cx('hero-demo-item w-fit max-w-[92%] rounded-xl rounded-bl-sm border border-hairline bg-surface px-3 py-2 text-[11px] leading-snug text-ink', stage >= 6 && 'is-visible', paymentHighlighted && 'hero-highlight')}>
                  <strong className="font-semibold">{t('home.phone.answerStep1Bold')}</strong> {t('home.phone.answerStep1')}
                </div>
                <div className={cx('hero-demo-item w-fit max-w-[92%] rounded-xl rounded-bl-sm border border-hairline bg-surface px-3 py-2 text-[11px] leading-snug text-ink', stage >= 9 && 'is-visible', paymentHighlighted && 'hero-highlight')}>
                  <strong className="font-semibold">{t('home.phone.answerStep2Bold')}</strong> {t('home.phone.answerStep2')}
                </div>
                <div className={cx('hero-demo-item w-fit max-w-[92%] rounded-xl rounded-bl-sm border border-hairline bg-surface p-2.5', stage >= 12 && 'is-visible', menuHighlighted && 'hero-highlight')}>
                  <p className="font-display text-[15px] leading-none text-ink">麻婆豆腐</p>
                  <p className="mt-1 text-[11px] font-semibold text-ink">{t('home.phone.cardName')}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-ink-secondary">{t('home.phone.cardDesc')}</p>
                  <div className="mt-1.5 flex gap-1.5">
                    <span className="rounded-full bg-tint-redlabel px-2 py-0.5 text-[9px] font-semibold text-[#A13D33]">{t('home.phone.tagSpicy')}</span>
                    <span className="rounded-full bg-tint-creamlabel px-2 py-0.5 text-[9px] font-semibold text-[#8A6A2F]">{t('home.phone.tagPork')}</span>
                  </div>
                </div>
              </div>

              <div className={cx('flex items-center gap-2 border-t border-hairline px-3.5 py-2.5 transition-colors duration-hover', phraseHighlighted && 'bg-jade-wash/70')}>
                <span className="flex-1 rounded-full border border-hairline bg-surface px-3 py-1.5 text-[10px] text-ink-tertiary">
                  {t('home.phone.placeholder')}
                </span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-jade">
                  <Send className="h-3 w-3 text-white" strokeWidth={1.5} />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid w-full max-w-xl gap-3 sm:grid-cols-3 lg:absolute lg:right-0 lg:top-1/2 lg:block lg:w-[250px] lg:max-w-none lg:-translate-y-1/2 lg:space-y-5">
          <FeatureCard
            id="pay"
            icon={QrCode}
            title={t('home.showcase.cardA.title')}
            body={t('home.showcase.cardA.body')}
            stage={stage}
            visibleAt={3}
            hovered={hoveredFeature}
            onHover={setHoveredFeature}
            visual={
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md border border-jade/20 bg-white/70">
                  <QrCode className="h-[18px] w-[18px] text-jade" strokeWidth={1.5} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-jade">Alipay · WeChat Pay</span>
              </div>
            }
          />

          <FeatureCard
            id="menu"
            icon={UtensilsCrossed}
            title={t('home.showcase.cardB.title')}
            body={t('home.showcase.cardB.body')}
            stage={stage}
            visibleAt={7}
            hovered={hoveredFeature}
            onHover={setHoveredFeature}
            visual={
              <div>
                <p className="font-display text-sm leading-none text-ink">麻婆豆腐</p>
                <p className="mt-1 text-[11px] font-medium text-ink">
                  {t('home.showcase.cardB.dish')}
                  <span className="ml-1.5 text-[10px] font-normal text-ink-tertiary">{t('home.showcase.cardB.meta')}</span>
                </p>
              </div>
            }
          />

          <FeatureCard
            id="phrase"
            icon={MessageSquareText}
            title={t('home.showcase.cardC.title')}
            body={t('home.showcase.cardC.body')}
            stage={stage}
            visibleAt={10}
            hovered={hoveredFeature}
            onHover={setHoveredFeature}
            visual={
              <div>
                <p className="font-display text-sm leading-tight text-ink">请带我去这个地址</p>
                <p className="mt-0.5 text-[10px] text-ink-tertiary">{t('home.showcase.cardC.phrase')}</p>
              </div>
            }
          />
        </div>
      </div>

      <button
        type="button"
        onClick={playDemo}
        className="mx-auto mt-4 flex items-center gap-1.5 rounded-full border border-hairline bg-surface/70 px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors duration-hover hover:border-jade/30 hover:text-jade focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade lg:absolute lg:bottom-3 lg:left-[20%] lg:mt-0"
      >
        <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
        Replay demo
      </button>
    </div>
  );
}

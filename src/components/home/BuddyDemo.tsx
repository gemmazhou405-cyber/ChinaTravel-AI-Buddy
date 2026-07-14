import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRevealOnView } from '../../hooks/useRevealOnView';

const QUESTIONS = ['q1', 'q2', 'q3'] as const;
type QuestionKey = typeof QUESTIONS[number];

interface Props {
  onAsk: (question: string) => void;
}

export default function BuddyDemo({ onAsk }: Props) {
  const { t } = useTranslation();
  const { ref, revealed } = useRevealOnView<HTMLElement>();
  const timersRef = useRef<number[]>([]);
  const [activeKey, setActiveKey] = useState<QuestionKey>('q1');
  const [stage, setStage] = useState(3);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const playAnswer = useCallback((key: QuestionKey) => {
    clearTimers();
    setActiveKey(key);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStage(3);
      return;
    }
    setStage(0);
    timersRef.current = [
      window.setTimeout(() => setStage(1), 520),
      window.setTimeout(() => setStage(2), 1050),
      window.setTimeout(() => setStage(3), 1650),
    ];
  }, [clearTimers]);

  useEffect(() => {
    playAnswer('q1');
    return clearTimers;
  }, [clearTimers, playAnswer]);

  const activeQuestion = t(`home.demo.${activeKey}.question`);
  const steps = t(`home.demo.${activeKey}.demoSteps`, { returnObjects: true }) as string[];

  return (
    <section ref={ref} className={`bg-jade-wash py-20 md:py-32 ${revealed ? 'motion-reveal-on' : ''}`}>
      <div className="mx-auto max-w-container px-6 md:px-8">
        <div className="motion-reveal-item">
          <h2 className="max-w-[26rem] text-2xl font-semibold tracking-tight text-ink md:max-w-[34rem] md:text-[32px] md:leading-tight">
            {t('home.demo.header')}
          </h2>
          <p className="mt-3 text-base text-ink-secondary">{t('home.demo.hint')}</p>
        </div>

        <div className="mt-10 grid gap-4 md:mt-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-6">
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
            {QUESTIONS.map((key, index) => {
              const question = t(`home.demo.${key}.question`);
              const isActive = activeKey === key;
              return (
                <button
                  key={key}
                  onClick={() => playAnswer(key)}
                  className={`motion-reveal-item motion-card glass group min-h-[132px] rounded-2xl p-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade md:p-6 ${
                    isActive
                      ? 'border-jade/35 bg-white/78 shadow-[var(--glass-highlight),var(--jade-glow)]'
                      : 'hover:border-jade/20 hover:shadow-[var(--glass-highlight),0_14px_34px_rgba(15,82,87,0.1)]'
                  }`}
                  style={{ '--reveal-index': index + 1 } as CSSProperties}
                  aria-pressed={isActive}
                >
                  <p className="text-base font-semibold leading-snug text-ink md:text-lg">“{question}”</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-jade">
                    {t('home.demo.tryIt')}
                    <ArrowRight className="h-4 w-4 transition-transform duration-hover ease-out group-hover:translate-x-[3px]" strokeWidth={1.5} />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="motion-reveal-item glass min-h-[360px] rounded-2xl p-5 md:p-7" style={{ '--reveal-index': 4 } as CSSProperties}>
            <div className="flex items-center gap-2.5 border-b border-hairline pb-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-jade">
                <MessageCircle className="h-4 w-4 text-white" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Buddy</p>
                <p className="text-xs text-ink-tertiary">{activeQuestion}</p>
              </div>
            </div>

            <div className="mt-5 min-h-[238px] space-y-3" aria-live="polite">
              {stage === 0 && (
                <div className="flex h-12 w-fit items-center gap-1.5 rounded-xl rounded-bl-sm border border-hairline bg-surface px-3">
                  <span className="demo-typing-dot" />
                  <span className="demo-typing-dot [animation-delay:120ms]" />
                  <span className="demo-typing-dot [animation-delay:240ms]" />
                </div>
              )}

              <div className={`rounded-xl rounded-bl-sm border border-hairline bg-surface px-4 py-3 text-sm leading-relaxed text-ink transition-[opacity,transform] duration-[320ms] ease-out ${stage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                {t(`home.demo.${activeKey}.demoLead`)}
              </div>

              <div className={`rounded-xl border border-hairline bg-white/70 p-4 transition-[opacity,transform] duration-[320ms] ease-out ${stage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                <ul className="space-y-2.5">
                  {steps.map((step) => (
                    <li key={step} className="flex gap-2.5 text-sm leading-relaxed text-ink-secondary">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-jade" strokeWidth={1.5} />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`rounded-xl border border-jade/15 bg-jade-wash/70 p-4 transition-[opacity,transform] duration-[320ms] ease-out ${stage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-jade">{t(`home.demo.${activeKey}.demoActionTitle`)}</p>
                <p className="mt-2 font-display text-lg leading-tight text-ink">{t(`home.demo.${activeKey}.demoAction`)}</p>
              </div>
            </div>

            <button
              onClick={() => onAsk(activeQuestion)}
              className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-jade px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-hover ease-out hover:-translate-y-0.5 hover:bg-[#0B4145] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade active:scale-[0.99]"
            >
              {t('home.demo.askThisQuestion')}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

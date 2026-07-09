import { ArrowRight, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const QUESTIONS = ['q1', 'q2', 'q3'] as const;

interface Props {
  onAsk: (question: string) => void;
}

export default function BuddyDemo({ onAsk }: Props) {
  const { t } = useTranslation();

  return (
    <section className="bg-jade-wash py-20 md:py-32">
      <div className="mx-auto max-w-container px-6 md:px-8">
        <h2 className="max-w-[26rem] text-2xl font-semibold tracking-tight text-ink md:max-w-[34rem] md:text-[32px] md:leading-tight">
          {t('home.demo.header')}
        </h2>
        <p className="mt-3 text-base text-ink-secondary">{t('home.demo.hint')}</p>
        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-6">
          {QUESTIONS.map((key) => {
            const question = t(`home.demo.${key}.question`);
            return (
              <button
                key={key}
                onClick={() => onAsk(question)}
                className="group flex flex-col rounded-2xl bg-surface p-6 text-left shadow-card transition-transform duration-hover ease-out hover:-translate-y-0.5 md:p-8"
              >
                <p className="text-lg font-semibold leading-snug text-ink">“{question}”</p>
                <div className="mt-4 flex items-start gap-2.5 border-t border-hairline pt-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jade">
                    <MessageCircle className="h-3 w-3 text-white" strokeWidth={1.5} />
                  </span>
                  <p className="line-clamp-4 text-sm leading-relaxed text-ink-secondary">
                    {t(`home.demo.${key}.answer`)}
                  </p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-jade">
                  {t('home.demo.tryIt')}
                  <ArrowRight className="h-4 w-4 transition-transform duration-hover ease-out group-hover:translate-x-0.5" strokeWidth={1.5} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

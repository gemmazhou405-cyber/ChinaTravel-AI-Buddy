import { CarTaxiFront, CreditCard, UtensilsCrossed } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MOMENTS = [
  { key: 'payment', Icon: CreditCard },
  { key: 'taxi', Icon: CarTaxiFront },
  { key: 'menu', Icon: UtensilsCrossed },
] as const;

export default function Moments() {
  const { t } = useTranslation();

  return (
    <section className="bg-canvas py-20 md:py-32">
      <div className="mx-auto max-w-container px-6 md:px-8">
        <h2 className="max-w-[26rem] text-2xl font-semibold tracking-tight text-ink md:max-w-[34rem] md:text-[32px] md:leading-tight">
          {t('home.moments.header')}
        </h2>
        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-6">
          {MOMENTS.map(({ key, Icon }) => (
            <div key={key} className="rounded-2xl bg-surface p-6 shadow-card md:p-8">
              <Icon className="h-6 w-6 text-jade" strokeWidth={1.5} />
              <h3 className="mt-5 text-xl font-semibold text-ink">{t(`home.moments.${key}.title`)}</h3>
              <p className="mt-2 text-base leading-relaxed text-ink-secondary">{t(`home.moments.${key}.body`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

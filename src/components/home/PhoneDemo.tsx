import { MessageSquareText, QrCode, Send, Sparkles, UtensilsCrossed } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// Hero product showcase — the live phone mockup surrounded by three floating
// glass feature cards. Everything is DOM (crisp at any DPR, no image assets).
// Floating composition applies at lg+; below that the cards stack under the phone.

function FeatureCard({
  icon: Icon,
  title,
  body,
  visual,
  className,
  floatClass,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  visual: ReactNode;
  className?: string;
  floatClass?: string;
}) {
  return (
    <div className={`glass-strong rounded-2xl p-4 ${floatClass ?? ''} ${className ?? ''}`}>
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

// Dotted connector + glow dot pointing from a floating card toward the phone (lg+ only).
function Connector({ className }: { className: string }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none hidden lg:flex items-center ${className}`}>
      <span className="h-2 w-2 rounded-full bg-jade/50 blur-[1px]" />
      <span className="h-px w-9 bg-gradient-to-r from-jade/45 to-transparent" style={{ backgroundImage: 'repeating-linear-gradient(to right, rgba(15,82,87,0.45) 0 4px, transparent 4px 8px)' }} />
    </span>
  );
}

export default function PhoneDemo() {
  const { t } = useTranslation();

  return (
    <div className="relative lg:h-[640px]" aria-hidden="true">
      {/* Shanghai atmosphere — restrained, masked toward the text side */}
      <img
        src="/hero-atmosphere-900.webp"
        alt=""
        className="pointer-events-none absolute -inset-4 hidden h-[calc(100%+2rem)] w-[calc(100%+2rem)] rounded-[3rem] object-cover opacity-[0.21] blur-[9px] md:block"
        style={{
          maskImage: 'radial-gradient(85% 90% at 68% 45%, black 30%, transparent 82%)',
          WebkitMaskImage: 'radial-gradient(85% 90% at 68% 45%, black 30%, transparent 82%)',
        }}
      />
      {/* Soft jade glow anchoring the composition */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-jade/[0.08] blur-3xl lg:block" />

      {/* Phone — focal point */}
      <div className="relative mx-auto w-[300px] lg:absolute lg:left-0 lg:top-1/2 lg:mx-0 lg:-translate-y-1/2">
        <div className="absolute -inset-x-5 bottom-0 top-9 rounded-[2.5rem] border border-white/50 bg-[#D7E0E6]/45 backdrop-blur-sm" />
        <div className="relative rounded-[2.1rem] bg-ink p-[7px] shadow-card">
          <div className="overflow-hidden rounded-[1.75rem] bg-canvas">
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
            <div className="space-y-2.5 px-3.5 py-3.5">
              <div className="ml-auto w-fit max-w-[85%] rounded-xl rounded-br-sm bg-jade px-3 py-2 text-[11px] leading-snug text-white">
                {t('home.phone.question')}
              </div>
              <div className="w-fit max-w-[92%] rounded-xl rounded-bl-sm border border-hairline bg-surface px-3 py-2 text-[11px] leading-snug text-ink">
                <p>{t('home.phone.answerLead')}</p>
                <ul className="mt-1.5 space-y-1 pl-3.5" style={{ listStyle: 'disc' }}>
                  <li><strong className="font-semibold">{t('home.phone.answerStep1Bold')}</strong> {t('home.phone.answerStep1')}</li>
                  <li><strong className="font-semibold">{t('home.phone.answerStep2Bold')}</strong> {t('home.phone.answerStep2')}</li>
                </ul>
              </div>
              <div className="w-fit max-w-[92%] rounded-xl rounded-bl-sm border border-hairline bg-surface p-2.5">
                <p className="font-display text-[15px] leading-none text-ink">麻婆豆腐</p>
                <p className="mt-1 text-[11px] font-semibold text-ink">{t('home.phone.cardName')}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-ink-secondary">{t('home.phone.cardDesc')}</p>
                <div className="mt-1.5 flex gap-1.5">
                  <span className="rounded-full bg-tint-redlabel px-2 py-0.5 text-[9px] font-semibold text-[#A13D33]">{t('home.phone.tagSpicy')}</span>
                  <span className="rounded-full bg-tint-creamlabel px-2 py-0.5 text-[9px] font-semibold text-[#8A6A2F]">{t('home.phone.tagPork')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-hairline px-3.5 py-2.5">
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

      {/* Floating feature cards — absolute at lg+, stacked below the phone otherwise */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:static lg:mt-0 lg:block">
        <div className="relative lg:absolute lg:right-0 lg:top-3 lg:w-[240px]">
          <Connector className="absolute right-full top-7 flex-row-reverse" />
          <FeatureCard
            icon={QrCode}
            title={t('home.showcase.cardA.title')}
            body={t('home.showcase.cardA.body')}
            floatClass="animate-float-slow"
            visual={
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md border border-jade/20 bg-white/70">
                  <QrCode className="h-4.5 w-4.5 h-[18px] w-[18px] text-jade" strokeWidth={1.5} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-jade">Alipay · WeChat Pay</span>
              </div>
            }
          />
        </div>

        <div className="relative lg:absolute lg:right-[-6px] lg:top-1/2 lg:w-[240px] lg:-translate-y-1/2">
          <Connector className="absolute right-full top-1/2 flex-row-reverse" />
          <FeatureCard
            icon={UtensilsCrossed}
            title={t('home.showcase.cardB.title')}
            body={t('home.showcase.cardB.body')}
            floatClass="animate-float-slower"
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
        </div>

        <div className="relative lg:absolute lg:bottom-3 lg:right-0 lg:w-[240px]">
          <Connector className="absolute right-full bottom-8 flex-row-reverse" />
          <FeatureCard
            icon={MessageSquareText}
            title={t('home.showcase.cardC.title')}
            body={t('home.showcase.cardC.body')}
            floatClass="animate-float-slowest"
            visual={
              <div>
                <p className="font-display text-sm leading-tight text-ink">请带我去这个地址</p>
                <p className="mt-0.5 text-[10px] text-ink-tertiary">{t('home.showcase.cardC.phrase')}</p>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}

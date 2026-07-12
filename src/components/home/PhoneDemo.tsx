import { Send, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Static hero mockup — a Buddy conversation rendered as real DOM so it stays
// crisp at any DPR and needs no image asset or API call.
export default function PhoneDemo() {
  const { t } = useTranslation();

  return (
    <div className="relative mx-auto w-full max-w-[380px]" aria-hidden="true">
      {/* Glass stage */}
      <div className="absolute -inset-x-4 top-8 bottom-0 rounded-[2.5rem] border border-white/50 bg-[#D7E0E6]/45 backdrop-blur-sm" />

      {/* Phone */}
      <div className="relative mx-auto w-[264px] rounded-[2.1rem] bg-ink p-[7px] shadow-card md:w-[286px]">
        <div className="overflow-hidden rounded-[1.75rem] bg-canvas">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pb-1 pt-2.5 text-[10px] font-semibold text-ink">
            <span>9:41</span>
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-ink/70" />
              <span className="h-1.5 w-1.5 rounded-full bg-ink/50" />
              <span className="h-1.5 w-1.5 rounded-full bg-ink/30" />
            </span>
          </div>

          {/* Chat header */}
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

          {/* Conversation */}
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
            {/* Menu translation card */}
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

          {/* Input bar */}
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
  );
}

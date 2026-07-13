import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Floating Ask Buddy entry. Fixed dimensions at every breakpoint — the previous
// scroll-driven compact state animated width/padding via transition-all and let
// the label wrap, which deformed the pill mid-scroll. The outer container never
// transforms for animation; only the inner sparkle icon does (motion-safe).
export default function ChatButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      aria-label={t('chat.askBuddy')}
      className="glass group fixed bottom-[calc(16px+env(safe-area-inset-bottom))] right-4 z-50 flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-[transform,box-shadow] duration-hover ease-out hover:-translate-y-0.5 hover:shadow-[var(--glass-highlight),var(--jade-glow)] active:scale-[0.98] md:bottom-6 md:right-6 md:h-12 md:w-auto md:justify-start md:gap-2.5 md:py-0 md:pl-1.5 md:pr-5"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-jade shadow-[0_2px_10px_rgba(15,82,87,0.35)]">
        <Sparkles className="h-4 w-4 text-white motion-safe:animate-sparkle-slow" strokeWidth={1.5} />
      </span>
      <span className="hidden whitespace-nowrap text-sm font-semibold text-ink md:inline">{t('chat.askBuddy')}</span>
    </button>
  );
}

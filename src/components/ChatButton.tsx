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
      className="glass group fixed bottom-6 right-6 z-50 hidden h-12 w-auto shrink-0 items-center justify-start gap-2.5 rounded-full py-0 pl-1.5 pr-5 transition-[transform,box-shadow] duration-hover ease-out hover:-translate-y-0.5 hover:shadow-[var(--glass-highlight),var(--jade-glow)] active:scale-[0.98] md:flex"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-jade shadow-[0_2px_10px_rgba(15,82,87,0.35)]">
        <Sparkles className="h-4 w-4 text-white transition-transform duration-hover ease-out animate-buddy-spark-once group-hover:rotate-6 group-hover:scale-[1.06]" strokeWidth={1.5} />
      </span>
      <span className="hidden whitespace-nowrap text-sm font-semibold text-ink md:inline">{t('chat.askBuddy')}</span>
    </button>
  );
}

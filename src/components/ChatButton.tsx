import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  onClick: () => void;
}

export default function ChatButton({ onClick }: Props) {
  const { t } = useTranslation();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 260);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-[calc(12px+env(safe-area-inset-bottom))] right-3 z-50 flex items-center justify-center rounded-full bg-jade text-white shadow-card transition-all duration-hover ease-out hover:bg-[#0B4145] active:scale-95 group md:bottom-6 md:right-5 md:gap-2 md:pl-4 md:pr-5 md:py-3.5 ${compact ? 'h-12 w-12 px-0 py-0' : 'max-w-[7.8rem] gap-1.5 px-3 py-2.5'}`}
      aria-label={t('chat.askBuddy')}
    >
      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors md:h-6 md:w-6">
        <MessageCircle className="w-3 h-3 md:h-3.5 md:w-3.5" />
      </div>
      <span className={`text-xs font-semibold md:hidden ${compact ? 'sr-only' : ''}`}>Buddy</span>
      <span className="hidden text-sm font-semibold md:inline">{t('chat.askBuddy')}</span>
    </button>
  );
}

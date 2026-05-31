import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  onClick: () => void;
}

export default function ChatButton({ onClick }: Props) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      className="fixed bottom-[calc(14px+env(safe-area-inset-bottom))] right-3 z-50 flex max-w-[7.8rem] items-center gap-1.5 rounded-full bg-[#155e63] px-3 py-2.5 text-white shadow-2xl shadow-[#155e63]/35 transition-all hover:bg-[#0e4a4e] active:scale-95 group animate-breathing md:bottom-6 md:right-5 md:max-w-none md:gap-2 md:pl-4 md:pr-5 md:py-3.5"
      aria-label={t('chat.askBuddy')}
    >
      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors md:h-6 md:w-6">
        <MessageCircle className="w-3 h-3 md:h-3.5 md:w-3.5" />
      </div>
      <span className="text-xs font-semibold md:hidden">Buddy</span>
      <span className="hidden text-sm font-semibold md:inline">{t('chat.askBuddy')}</span>
      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse md:-top-1 md:-right-1 md:h-3 md:w-3" />
    </button>
  );
}

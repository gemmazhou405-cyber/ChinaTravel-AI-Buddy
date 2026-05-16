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
      className="fixed bottom-6 right-5 z-50 flex items-center gap-2 bg-[#155e63] text-white shadow-2xl shadow-[#155e63]/40 pl-4 pr-5 py-3.5 rounded-full hover:bg-[#0e4a4e] active:scale-95 transition-all group"
      aria-label={t('chat.askBuddy')}
    >
      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
        <MessageCircle className="w-3.5 h-3.5" />
      </div>
      <span className="text-sm font-semibold">{t('chat.askBuddy')}</span>
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
    </button>
  );
}

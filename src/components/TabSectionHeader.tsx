import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  title: string;
  subtitle: string;
  onAskBuddy: () => void;
}

export default function TabSectionHeader({ title, subtitle, onAskBuddy }: Props) {
  const { t } = useTranslation();

  return (
    <header className="rounded-[1.75rem] border border-white/60 bg-white/[0.50] p-4 shadow-[0_18px_46px_rgba(11,63,67,0.08)] backdrop-blur-2xl sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-gray-950">{title}</h1>
          <p className="mt-1 text-sm font-medium leading-relaxed text-gray-500">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onAskBuddy}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#155e63]/15 bg-[#155e63]/8 px-3.5 py-2 text-sm font-semibold text-[#155e63] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#155e63]/30 hover:bg-[#155e63]/12 sm:shrink-0"
        >
          <MessageCircle className="h-4 w-4" />
          {t('chat.askBuddy')}
        </button>
      </div>
    </header>
  );
}

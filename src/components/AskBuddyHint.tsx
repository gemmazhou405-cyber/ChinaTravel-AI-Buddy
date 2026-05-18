import { MessageCircle } from 'lucide-react';

interface Props {
  onClick: () => void;
  text?: string;
}

export default function AskBuddyHint({ onClick, text = "Can't find what you need? Ask Buddy." }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl border border-[#155e63]/15 bg-white/70 px-4 py-3 text-left text-sm font-medium text-[#155e63] shadow-sm transition-all hover:border-[#155e63]/30 hover:bg-white"
    >
      <span>{text}</span>
      <MessageCircle className="h-4 w-4 shrink-0" />
    </button>
  );
}

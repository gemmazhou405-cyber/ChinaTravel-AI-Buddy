import { ChevronDown } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

interface Props {
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function ToolDisclosure({ title, subtitle, icon, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  return (
    <section className="overflow-hidden rounded-[1.65rem] border border-white/60 bg-white/[0.48] shadow-[0_18px_46px_rgba(11,63,67,0.08)] backdrop-blur-2xl">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-all hover:bg-white/45"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#155e63]/10 text-[#155e63]">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold tracking-tight text-gray-950">{title}</h2>
          <p className="mt-0.5 text-xs font-medium leading-relaxed text-gray-500">{subtitle}</p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && <div className="border-t border-white/60 px-4 pb-4 pt-3">{children}</div>}
    </section>
  );
}

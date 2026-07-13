import { ChevronDown, Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import i18n from '../i18n';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
];

interface Props {
  direction?: 'up' | 'down';
}

export default function LanguageSwitcher({ direction = 'down' }: Props) {
  const [lang, setLang] = useState(i18n.language.toUpperCase().slice(0, 2));
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = window.localStorage?.getItem('chinaease-lang');
    if (saved) {
      i18n.changeLanguage(saved);
      setLang(saved.toUpperCase().slice(0, 2));
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
    setLang(code.toUpperCase());
    setOpen(false);
    window.localStorage?.setItem('chinaease-lang', code);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-white/60 bg-white/55 px-2.5 py-1.5 text-xs font-medium text-ink-secondary backdrop-blur-sm transition-colors duration-hover ease-out hover:text-ink"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span>{lang}</span>
        <ChevronDown className="h-3 w-3 opacity-60" strokeWidth={1.5} />
      </button>
      {open && (
        <div
          className={`absolute right-0 z-50 min-w-[8rem] overflow-hidden rounded-lg border border-hairline bg-surface shadow-card ${
            direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
          role="listbox"
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => handleChange(l.code)}
              className={`block w-full px-3.5 py-2 text-left text-sm transition-colors duration-hover ease-out ${
                l.code.toUpperCase() === lang ? 'bg-jade-wash font-medium text-jade' : 'text-ink-secondary hover:bg-canvas hover:text-ink'
              }`}
              role="option"
              aria-selected={l.code.toUpperCase() === lang}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

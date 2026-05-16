import { Star, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { UserState } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
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
  user: User | null;
  userState: UserState | null;
  onAuthClick: () => void;
  onLogout: () => Promise<void>;
}

export default function Hero({ user, userState, onAuthClick, onLogout }: Props) {
  const { t } = useTranslation();
  const [lang, setLang] = useState(i18n.language.toUpperCase());
  const [langOpen, setLangOpen] = useState(false);
  const assetBase = import.meta.env.BASE_URL;

  useEffect(() => {
    const saved = window.localStorage?.getItem('chinaease-lang');
    if (saved) {
      i18n.changeLanguage(saved);
      setLang(saved.toUpperCase());
    }
  }, []);

  const handleLangChange = (code: string) => {
    i18n.changeLanguage(code);
    setLang(code.toUpperCase());
    setLangOpen(false);
    window.localStorage?.setItem('chinaease-lang', code);
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      {/* Background photo with gradient overlay */}
      <div
        className="absolute inset-0 bg-cover"
        style={{
          background:
            `linear-gradient(to right, rgba(0,0,0,0.70) 0%, rgba(21,94,99,0.45) 50%, rgba(0,0,0,0.20) 100%), url("${assetBase}hero.jpg") center top/cover no-repeat`,
        }}
      />

      {/* Nav bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2.5">
          <img src={`${assetBase}logo.png`} width="40" height="40" alt="ChinaEase Buddy" style={{ borderRadius: '8px' }} />
          <span className="text-white font-semibold text-lg tracking-tight">ChinaEase Buddy</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 text-white/80 text-sm hover:text-white transition-colors bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl overflow-hidden z-50 min-w-[100px]">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleLangChange(l.code)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      l.code.toUpperCase() === lang ? 'bg-[#155e63]/10 text-[#155e63] font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          
            href="#tabs"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('tabs')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hidden md:block text-white/80 text-sm hover:text-white transition-colors"
          >
            {t('nav.howItWorks')}
          </a>
          {user ? (
            <button
              onClick={onLogout}
              className="text-sm font-medium bg-white text-[#155e63] px-4 py-2 rounded-full hover:bg-[#f7f3ea] transition-all shadow-lg"
            >
              {userState?.plan ? t('nav.currentPlan', { plan: userState.plan }) : t('nav.logout')}
            </button>
          ) : (
            <button
              onClick={onAuthClick}
              className="text-sm font-medium bg-white text-[#155e63] px-4 py-2 rounded-full hover:bg-[#f7f3ea] transition-all shadow-lg"
            >
              {t('nav.startFree')}
            </button>
          )}
        </div>
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col md:flex-row items-end md:items-center justify-between px-6 pb-16 pt-32 md:px-10 md:pb-24 max-w-7xl mx-auto w-full">
        <div className="flex-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 mb-6">
            <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
            <span className="text-white/90 text-xs font-medium">{t('hero.badge')}</span>
          </div>

          <h1
            className="font-black text-white leading-none tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
          >
            {t('hero.line1')}<br />
            {t('hero.line2')}<br />
            <span className="text-[#7dd3d8]">{t('hero.line3')}</span>
          </h1>

          <p className="text-white/75 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
            {t('hero.subtitle')}
          </p>

          <button
            onClick={onAuthClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#155e63] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#0e4a4e] transition-all shadow-xl text-base"
          >
            {t('hero.cta')}
          </button>

          <p className="text-white/50 text-xs mt-4">
            {t('hero.trust')}
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce">
        <div className="w-5 h-8 border-2 border-white/30 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  );
}

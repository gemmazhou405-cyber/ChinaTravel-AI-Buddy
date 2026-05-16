import { Brain as Train, Car, Plane, Navigation, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const METRO_PHRASES = [
  { key: 'transport.phrases.whereSubway', zh: '地铁站在哪里？', pinyin: 'Dìtiě zhàn zài nǎlǐ?' },
  { key: 'transport.phrases.whichLine', zh: '几号线去...？', pinyin: 'Jǐ hào xiàn qù...?' },
  { key: 'transport.phrases.howManyStops', zh: '几站？', pinyin: 'Jǐ zhàn?' },
  { key: 'transport.phrases.transfer', zh: '在这里换乘吗？', pinyin: 'Zài zhèlǐ huànchéng ma?' },
];

const TAXI_PHRASES = [
  { key: 'transport.phrases.address', zh: '请去这个地址', pinyin: 'Qǐng qù zhège dìzhǐ' },
  { key: 'transport.phrases.leftRight', zh: '左转 / 右转', pinyin: 'Zuǒ zhuǎn / Yòu zhuǎn' },
  { key: 'transport.phrases.stopHere', zh: '请在这里停车', pinyin: 'Qǐng zài zhèlǐ tíngchē' },
  { key: 'transport.phrases.meter', zh: '请打表', pinyin: 'Qǐng dǎ biǎo' },
];

interface TransportApp {
  name: string;
  label: string;
  desc: string;
  color: string;
}

interface Props {
  showToast: (msg: string) => void;
}

export default function TransportTab({ showToast }: Props) {
  const { t } = useTranslation();
  const apps = t('transport.apps', { returnObjects: true }) as TransportApp[];

  const copyPhrase = async (text: string) => {
    await navigator.clipboard?.writeText(text);
    showToast(t('toast.copied'));
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t('transport.appsTitle')}</h2>
        <div className="space-y-2.5">
          {apps.map((app) => (
            <div key={app.name} className={`border rounded-2xl p-4 flex items-center justify-between ${app.color}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{app.name}</span>
                  <span className="text-xs opacity-70">{app.label}</span>
                </div>
                <p className="text-xs mt-0.5 opacity-70">{app.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Train className="w-4 h-4 text-[#155e63]" />
          <h2 className="text-base font-semibold text-gray-900">{t('transport.metroTitle')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {METRO_PHRASES.map((p) => (
            <button
              key={p.key}
              onClick={() => copyPhrase(p.zh)}
              className="text-left bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm hover:shadow-md hover:border-[#155e63]/20 transition-all group"
            >
              <p className="text-gray-500 text-xs group-hover:text-[#155e63] mb-1 transition-colors">{t(p.key)}</p>
              <p className="text-gray-900 font-medium text-sm">{p.zh}</p>
              <p className="text-gray-400 text-xs mt-0.5">{p.pinyin}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Car className="w-4 h-4 text-[#155e63]" />
          <h2 className="text-base font-semibold text-gray-900">{t('transport.taxiTitle')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {TAXI_PHRASES.map((p) => (
            <button
              key={p.key}
              onClick={() => copyPhrase(p.zh)}
              className="text-left bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm hover:shadow-md hover:border-[#155e63]/20 transition-all group"
            >
              <p className="text-gray-500 text-xs group-hover:text-[#155e63] mb-1 transition-colors">{t(p.key)}</p>
              <p className="text-gray-900 font-medium text-sm">{p.zh}</p>
              <p className="text-gray-400 text-xs mt-0.5">{p.pinyin}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="bg-[#155e63]/5 border border-[#155e63]/15 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Navigation className="w-4 h-4 text-[#155e63]" />
          <p className="font-semibold text-[#155e63] text-sm">{t('transport.trainTitle')}</p>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed mb-3">
          {t('transport.trainSub')}
        </p>
        <div className="flex gap-2">
          <div className="flex-1 bg-white rounded-xl px-3 py-2 text-xs text-gray-400 border border-gray-100">{t('transport.from')}</div>
          <div className="flex-1 bg-white rounded-xl px-3 py-2 text-xs text-gray-400 border border-gray-100">{t('transport.to')}</div>
        </div>
        <button className="mt-2 w-full bg-[#155e63] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#0e4a4e] transition-colors flex items-center justify-center gap-2">
          <Plane className="w-4 h-4" /> {t('transport.search')}
        </button>
      </div>
    </div>
  );
}

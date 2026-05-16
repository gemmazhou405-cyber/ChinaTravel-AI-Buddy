import { useState, useRef } from 'react';
import { Upload, AlertTriangle, MessageSquare, ChevronRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PHRASE_CARDS = [
  { labelKey: 'food.phrases.vegetarian', chinese: '我是素食者', pinyin: 'Wǒ shì sùshí zhě' },
  { labelKey: 'food.phrases.spicy', chinese: '请不要太辣', pinyin: 'Qǐng bùyào tài là' },
  { labelKey: 'food.phrases.msg', chinese: '请不要放味精', pinyin: 'Qǐng bùyào fàng wèijīng' },
  { labelKey: 'food.phrases.menu', chinese: '可以给我菜单吗？', pinyin: 'Kěyǐ gěi wǒ càidān ma?' },
  { labelKey: 'food.phrases.bill', chinese: '买单，谢谢', pinyin: 'Mǎidān, xièxiè' },
  { labelKey: 'food.phrases.spicyQ', chinese: '这道菜辣吗？', pinyin: 'Zhè dào cài là ma?' },
];

interface AllergyCardData {
  name: string;
  chinese: string;
  pinyin: string;
  phrase: string;
  chinesePhrase: string;
  color: string;
  iconColor: string;
  badge: string;
}

interface MenuItem {
  cn: string;
  en: string;
  desc: string;
  alert: string;
}

interface AllergyCardProps {
  card: AllergyCardData;
}

function AllergyCard({ card }: AllergyCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border rounded-2xl p-4 transition-all ${card.color}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
            <AlertTriangle className={`w-4 h-4 ${card.iconColor}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">{card.name}</h3>
            <p className="text-gray-500 text-xs">{card.chinese} · {card.pinyin}</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${card.badge} transition-all`}
        >
          {expanded ? t('food.hide') : t('food.showPhrase')}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-black/5">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <p className="text-gray-600 text-xs leading-relaxed mb-2">{card.phrase}</p>
            <p className="text-gray-800 text-sm font-medium leading-relaxed">{card.chinesePhrase}</p>
          </div>
          <button className="mt-2 w-full text-xs text-gray-400 flex items-center justify-center gap-1 hover:text-gray-600 transition-colors">
            <MessageSquare className="w-3 h-3" />
            {t('food.copy')}
          </button>
        </div>
      )}
    </div>
  );
}

export default function FoodTab() {
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const allergyCards = t('food.allergyCards', { returnObjects: true }) as AllergyCardData[];
  const menuItems = t('food.menuItems', { returnObjects: true }) as MenuItem[];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file.name);
  };

  return (
    <div className="space-y-6">
      {/* Section: Menu Decoder */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-semibold text-gray-900">{t('food.decoderTitle')}</h2>
          <span className="text-xs bg-[#155e63]/10 text-[#155e63] px-2 py-0.5 rounded-full font-medium">{t('food.ai')}</span>
        </div>
        <p className="text-gray-500 text-sm mb-4">
          {t('food.decoderSub')}
        </p>

        {uploadedFile ? (
          <div className="border-2 border-[#155e63] bg-[#155e63]/5 rounded-2xl p-5 text-center">
            <div className="text-sm text-[#155e63] font-medium mb-1">{t('food.analyzing')}</div>
            <p className="text-xs text-gray-400 mb-3">{uploadedFile}</p>
            <div className="space-y-2 text-left">
              {menuItems.map((item, i) => (
                <div key={i} className="bg-white rounded-xl px-3 py-2.5 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-gray-800 font-medium text-sm">{item.cn}</span>
                    <span className="text-gray-400 text-xs ml-2">{item.en}</span>
                    <p className="text-gray-400 text-xs">{item.desc}</p>
                  </div>
                  {item.alert && <span className="text-lg">{item.alert}</span>}
                </div>
              ))}
            </div>
            <button
              onClick={() => setUploadedFile(null)}
              className="mt-3 text-xs text-gray-400 flex items-center gap-1 mx-auto hover:text-gray-600"
            >
              <X className="w-3 h-3" /> {t('food.clear')}
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`
              border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
              ${dragOver
                ? 'border-[#155e63] bg-[#155e63]/5'
                : 'border-gray-200 hover:border-[#155e63]/50 hover:bg-[#155e63]/3 bg-white'
              }
            `}
          >
            <div className="w-12 h-12 bg-[#155e63]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Upload className="w-5 h-5 text-[#155e63]" />
            </div>
            <p className="font-medium text-gray-700 text-sm">{t('food.dropZone')}</p>
            <p className="text-gray-400 text-xs mt-1">{t('food.dropZoneSub')}</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setUploadedFile(file.name);
              }}
            />
          </div>
        )}
      </section>

      {/* Section: Allergy Alerts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">{t('food.allergyTitle')}</h2>
          <button className="text-xs text-[#155e63] font-medium flex items-center gap-0.5 hover:underline">
            {t('food.customize')} <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-3">
          {allergyCards.map((card) => (
            <AllergyCard key={card.name} card={card} />
          ))}
        </div>
      </section>

      {/* Section: Phrase Cards */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t('food.phrasesTitle')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PHRASE_CARDS.map((p) => (
            <div
              key={p.labelKey}
              className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm hover:shadow-md hover:border-[#155e63]/20 transition-all cursor-pointer group"
            >
              <p className="text-gray-500 text-xs mb-1 group-hover:text-[#155e63] transition-colors">{t(p.labelKey)}</p>
              <p className="text-gray-900 font-medium text-sm">{p.chinese}</p>
              <p className="text-gray-400 text-xs mt-0.5">{p.pinyin}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

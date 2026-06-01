import { useState, useRef } from 'react';
import { Upload, AlertTriangle, MessageSquare, ChevronRight, X, Search, Utensils } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PhraseCategoryAccordion from '../PhraseCategoryAccordion';
import TabSectionHeader from '../TabSectionHeader';
import ToolDisclosure from '../ToolDisclosure';
import { restaurantCards } from '../../data/phraseCards';
import type { UserState } from '../../hooks/useAuth';
import { isTripOrGroup } from '../../lib/membership';
import allDishes from '../../data/dishes/commonChineseDishes.json';

interface Dish {
  id: string;
  chineseName: string;
  englishName: string;
  pinyin: string;
  cuisine: string;
  allergens: string[];
  spicyLevel: number;
  vegetarianFriendly: boolean;
  veganFriendly: boolean;
  shortDescription: string;
  orderTip: string;
}

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
  showToast: (msg: string) => void;
}

function AllergyCard({ card, showToast }: AllergyCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const speakChinese = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };
  const copyPhrase = async (text: string) => {
    await navigator.clipboard?.writeText(text);
    showToast(t('toast.copied'));
  };

  return (
    <div className={`border rounded-2xl p-4 transition-all ${card.color}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
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
          <div className="flex gap-2 mt-2">
            <button onClick={() => speakChinese(card.chinesePhrase)} className="flex-1 text-xs text-[#155e63] flex items-center justify-center gap-1">
              🔊 {t('common.speak')}
            </button>
            <button onClick={() => copyPhrase(card.chinesePhrase)} className="flex-1 text-xs text-gray-400 flex items-center justify-center gap-1 hover:text-gray-600 transition-colors">
              <MessageSquare className="w-3 h-3" />
              📋 {t('common.copy')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  userState: UserState | null;
  showToast: (msg: string) => void;
  onAskBuddy: () => void;
  onUpgradeClick: (message?: string) => void;
  deepTool?: string | null;
  onToolOpened?: (category: string) => void;
}

export default function FoodTab({ userState, showToast, onAskBuddy, onUpgradeClick, deepTool, onToolOpened }: Props) {
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const allergyCards = t('food.allergyCards', { returnObjects: true }) as AllergyCardData[];
  const menuItems = t('food.menuItems', { returnObjects: true }) as MenuItem[];
  const hasFullAccess = isTripOrGroup(userState);
  const [dishQuery, setDishQuery] = useState('');

  const dishResults = (() => {
    const q = dishQuery.trim().toLowerCase();
    if (!q) return [];
    return (allDishes as Dish[])
      .filter(
        (d) =>
          d.englishName.toLowerCase().includes(q) ||
          d.chineseName.includes(dishQuery.trim()) ||
          d.pinyin.toLowerCase().includes(q),
      )
      .slice(0, 8);
  })();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file.name);
  };

  return (
    <div className="space-y-6">
      <TabSectionHeader
        title={t('tabs.food')}
        subtitle={t('tabHeaders.food')}
        onAskBuddy={onAskBuddy}
      />

      {/* Section: Menu Decoder */}
      <ToolDisclosure
        title={t('food.decoderTitle')}
        subtitle={t('food.decoderSub')}
        icon={<Upload className="w-4 h-4" />}
        defaultOpen={deepTool === 'food' || deepTool === 'menu'}
        onOpen={() => onToolOpened?.('menu')}
      >
        <div className="mb-3">
          <span className="text-xs bg-[#155e63]/10 text-[#155e63] px-2 py-0.5 rounded-full font-medium">{t('food.ai')}</span>
        </div>
        {/* Dish Search — independent local search, no API calls */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">{t('food.dishSearchTitle')}</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
            <input
              value={dishQuery}
              onChange={(e) => setDishQuery(e.target.value)}
              placeholder={t('food.dishSearchPlaceholder')}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-white rounded-xl border border-gray-200 outline-none focus:border-[#155e63]/40 transition-all placeholder:text-gray-300"
            />
            {dishQuery && (
              <button onClick={() => setDishQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {dishResults.length > 0 && (
            <div className="mt-2 space-y-2">
              {dishResults.map((dish) => (
                <div key={dish.id} className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">{dish.chineseName}</p>
                        <p className="text-gray-500 text-xs">{dish.englishName}</p>
                        {dish.spicyLevel > 0 && (
                          <span className="text-xs">{'🌶'.repeat(Math.min(dish.spicyLevel, 5))}</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">{dish.pinyin}</p>
                    </div>
                    <div className="flex gap-1 shrink-0 mt-0.5">
                      {dish.veganFriendly && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">{t('food.vegan')}</span>
                      )}
                      {!dish.veganFriendly && dish.vegetarianFriendly && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">{t('food.vegetarianShort')}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">{dish.shortDescription}</p>
                  {dish.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {dish.allergens.map((a) => (
                        <span key={a} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-full">
                          ⚠️ {a}
                        </span>
                      ))}
                    </div>
                  )}
                  {dish.orderTip && (
                    <p className="text-[11px] text-[#155e63] mt-1.5 leading-relaxed">
                      💬 {dish.orderTip}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {dishQuery.trim() && dishResults.length === 0 && (
            <p className="text-xs text-gray-400 mt-2 text-center">{t('food.noDishes', { query: dishQuery })}</p>
          )}
        </div>

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
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragOver ? 'border-[#155e63] bg-[#155e63]/5' : 'border-gray-200 hover:border-[#155e63]/50 bg-white'
            }`}
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
      </ToolDisclosure>

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
            <AllergyCard key={card.name} card={card} showToast={showToast} />
          ))}
        </div>
      </section>

      {/* Section: Phrase Cards */}
      <PhraseCategoryAccordion
        categories={[
          {
            id: 'restaurant',
            title: t('food.phrasesTitle'),
            subtitle: t('food.restaurantCardsSubtitle', { count: restaurantCards.length }),
            icon: <Utensils className="w-4 h-4" />,
            cards: restaurantCards,
          },
        ]}
        freeLimit={3}
        lockedPreviewLimit={3}
        isPaidUser={hasFullAccess}
        showToast={showToast}
        onUpgradeClick={onUpgradeClick}
        initialOpenId={deepTool === 'phrases' ? 'restaurant' : null}
        onCategoryOpen={(category) => onToolOpened?.(category)}
      />
    </div>
  );
}

import { useState } from 'react';
import { Upload, X, Search, Utensils } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PhraseCategoryAccordion from '../PhraseCategoryAccordion';
import TabSectionHeader from '../TabSectionHeader';
import ToolDisclosure from '../ToolDisclosure';
import AllergenPhraseSelector from '../AllergenPhraseSelector';
import { restaurantCards } from '../../data/phraseCards';
import type { PassState } from '../../hooks/usePass';
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

interface Props {
  passState: PassState | null;
  showToast: (msg: string) => void;
  onAskBuddy: () => void;
  onUpgradeClick: (message?: string) => void;
  deepTool?: string | null;
  onToolOpened?: (category: string) => void;
}

export default function FoodTab({ passState, showToast, onAskBuddy, onUpgradeClick, deepTool, onToolOpened }: Props) {
  const { t } = useTranslation();
  const hasFullAccess = isTripOrGroup(passState);
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

  return (
    <div className="space-y-6">
      <TabSectionHeader
        title={t('tabs.food')}
        subtitle={t('tabHeaders.food')}
        onAskBuddy={onAskBuddy}
      />

      {/* Section: Menu Decoder */}
      <ToolDisclosure
        id="tool-food"
        title={t('food.decoderTitle')}
        subtitle={t('food.decoderSub')}
        icon={<Upload className="w-4 h-4" />}
        defaultOpen={deepTool === 'food' || deepTool === 'menu'}
        onOpen={() => onToolOpened?.('menu')}
      >
        <div className="mb-4">
          <span className="text-xs bg-[#155e63]/10 text-[#155e63] px-2 py-0.5 rounded-full font-medium">{t('food.ai')}</span>
          <div className="mt-3 rounded-2xl border border-[#155e63]/15 bg-[#155e63]/5 p-4">
            <p className="text-sm font-semibold text-gray-900">{t('food.privateTestingTitle')}</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-600">{t('food.privateTestingBody')}</p>
          </div>
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
              {/* Universal disclaimer — shown once above all results */}
              <p className="text-[11px] leading-relaxed text-amber-700 px-0.5">
                ⚠️ {t('food.allergenResultWarning')}
              </p>
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
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {dish.allergens.length > 0 ? (
                      dish.allergens.map((a) => (
                        <span key={a} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-full">
                          ⚠️ {a}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] bg-gray-50 text-gray-500 border border-gray-100 px-1.5 py-0.5 rounded-full">
                        {t('food.allergensUnconfirmed')}
                      </span>
                    )}
                  </div>
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

      </ToolDisclosure>

      {/* Section: Allergy Phrases */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-1">{t('food.allergyTitle')}</h2>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">{t('food.allergyHint')}</p>
        {/* Persistent safety disclaimer */}
        <div className="mb-4 flex gap-2.5 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5">
          <span className="mt-px shrink-0 text-sm">⚠️</span>
          <p className="text-[11px] leading-relaxed text-amber-800">
            {t('food.allergyDisclaimer')}
          </p>
        </div>
        <AllergenPhraseSelector
          cards={restaurantCards.filter((c) => c.id === 'r-allergy' || c.id === 'r-allergy-check')}
          showToast={showToast}
        />
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

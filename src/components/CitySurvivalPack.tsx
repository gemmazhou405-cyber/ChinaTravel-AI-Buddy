import { ChevronDown, CreditCard, MapPin, Plane, ShieldAlert, Train, Utensils } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CityPack } from '../types/cityPack';

type CategoryId = 'airport' | 'transport' | 'payment' | 'food' | 'watch' | 'phrases';

interface Category {
  id: CategoryId;
  title: string;
  icon: ReactNode;
  tone: string;
}

interface Props {
  city: CityPack;
  badge?: string;
}

function asList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

export default function CitySurvivalPack({ city, badge }: Props) {
  const { t } = useTranslation();
  const [openIds, setOpenIds] = useState<CategoryId[]>([]);
  const categories: Category[] = [
    { id: 'airport', title: t('citySurvival.categories.airport'), icon: <Plane className="h-4 w-4" />, tone: 'text-sky-700 bg-sky-50/80 border-sky-100' },
    { id: 'transport', title: t('citySurvival.categories.transport'), icon: <Train className="h-4 w-4" />, tone: 'text-[#155e63] bg-[#155e63]/8 border-[#155e63]/10' },
    { id: 'payment', title: t('citySurvival.categories.payment'), icon: <CreditCard className="h-4 w-4" />, tone: 'text-emerald-700 bg-emerald-50/80 border-emerald-100' },
    { id: 'food', title: t('citySurvival.categories.food'), icon: <Utensils className="h-4 w-4" />, tone: 'text-orange-700 bg-orange-50/80 border-orange-100' },
    { id: 'watch', title: t('citySurvival.categories.watch'), icon: <ShieldAlert className="h-4 w-4" />, tone: 'text-amber-700 bg-amber-50/80 border-amber-100' },
    { id: 'phrases', title: t('citySurvival.categories.phrases'), icon: <MapPin className="h-4 w-4" />, tone: 'text-violet-700 bg-violet-50/80 border-violet-100' },
  ];

  const toggle = (id: CategoryId) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const getItems = (id: CategoryId) => {
    const localized = asList(t(`citySurvival.cities.${city.cityId}.${id}`, { returnObjects: true }));
    if (localized.length > 0) return localized;
    return asList(t(`citySurvival.fallback.${id}`, { returnObjects: true }));
  };

  return (
    <div className="rounded-[1.75rem] border border-white/60 bg-white/[0.50] p-4 shadow-[0_18px_46px_rgba(11,63,67,0.08)] backdrop-blur-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black tracking-tight text-gray-950">
            {t('citySurvival.title', { city: city.cityName })}
          </h3>
          <p className="mt-1 text-xs font-medium leading-relaxed text-gray-500">
            {t('citySurvival.summary')}
          </p>
        </div>
        {badge && (
          <span className="shrink-0 rounded-full bg-[#155e63]/10 px-2.5 py-1 text-[11px] font-semibold text-[#155e63]">
            {badge}
          </span>
        )}
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {categories.map((category) => {
          const open = openIds.includes(category.id);
          return (
            <div key={category.id} className="overflow-hidden rounded-2xl border border-white/60 bg-white/[0.45] shadow-[0_12px_34px_rgba(11,63,67,0.06)] backdrop-blur-xl">
              <button
                type="button"
                onClick={() => toggle(category.id)}
                className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-all hover:bg-white/55"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${category.tone}`}>
                  {category.icon}
                </span>
                <span className="min-w-0 flex-1 text-sm font-bold text-gray-950">{category.title}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>

              {open && (
                <div className="border-t border-white/60 px-4 py-3">
                  <ul className="space-y-2">
                    {getItems(category.id).map((item) => (
                      <li key={item} className="flex gap-2 text-xs font-medium leading-relaxed text-gray-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#155e63]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

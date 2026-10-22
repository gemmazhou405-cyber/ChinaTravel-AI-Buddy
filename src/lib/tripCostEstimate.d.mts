export type TripCostStyle = 'budget' | 'mid-range' | 'comfortable';
export const TRIP_COST_STYLES: Readonly<Record<TripCostStyle, Readonly<{
  label: string;
  minimum: number;
  maximum: number;
  openEnded: boolean;
}>>>;
export function estimateTripCost(days: string | number, travelers: string | number, style: string): {
  days: number;
  travelers: number;
  style: TripCostStyle;
  label: string;
  dailyMinimum: number;
  dailyMaximum: number;
  perPersonMinimum: number;
  perPersonMaximum: number;
  groupMinimum: number;
  groupMaximum: number;
  openEnded: boolean;
};
export function formatTripCostRange(minimum: number, maximum: number, openEnded?: boolean): string;

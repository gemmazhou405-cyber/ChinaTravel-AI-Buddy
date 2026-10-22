import { useState } from 'react';
import content from '../data/tripCostEstimatorContent.json';
import { TRIP_COST_STYLES, estimateTripCost, formatTripCostRange, type TripCostStyle } from '../lib/tripCostEstimate.mjs';

export default function ChinaTripCostEstimator() {
  const [days, setDays] = useState('10');
  const [travelers, setTravelers] = useState('1');
  const [style, setStyle] = useState<TripCostStyle>('mid-range');
  const result = estimateTripCost(days, travelers, style);
  const styles = Object.entries(TRIP_COST_STYLES);

  return (
    <section id="cost-estimator" className="rounded-2xl border border-[#155e63]/20 bg-white p-4 shadow-sm md:p-5" aria-labelledby="cost-estimator-title">
      <h2 id="cost-estimator-title" className="text-xl font-bold text-gray-950">{content.heading}</h2>
      <p className="mt-2 text-sm text-gray-600">{content.intro}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-semibold text-gray-800">Days
          <input className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2" type="number" min="1" max="60" step="1" value={days} onChange={(event) => setDays(event.target.value)} onBlur={() => setDays(String(result.days))} />
        </label>
        <label className="text-sm font-semibold text-gray-800">Travelers
          <input className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2" type="number" min="1" max="20" step="1" value={travelers} onChange={(event) => setTravelers(event.target.value)} onBlur={() => setTravelers(String(result.travelers))} />
        </label>
        <label className="text-sm font-semibold text-gray-800">Travel style
          <select aria-label="Travel style" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2" value={style} onChange={(event) => setStyle(event.target.value as TripCostStyle)}>
            {styles.map(([value, range]) => <option key={value} value={value}>{range.label}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2" aria-label="Trip length examples">
        {content.exampleDays.map((value) => (
          <button key={value} type="button" aria-pressed={result.days === value} onClick={() => setDays(String(value))} className="rounded-full border border-[#155e63]/20 px-3 py-1.5 text-sm font-semibold text-[#155e63] hover:bg-[#155e63]/5">
            {value} days
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-[#155e63]/5 p-4" aria-live="polite" aria-atomic="true">
        <p className="text-sm font-semibold text-gray-700">{result.label}: {formatTripCostRange(result.dailyMinimum, result.dailyMaximum, result.openEnded)} per person per day</p>
        <p className="mt-2 text-base font-bold text-[#155e63]">Per person for {result.days} days: {formatTripCostRange(result.perPersonMinimum, result.perPersonMaximum, result.openEnded)}</p>
        <p className="mt-1 text-xl font-bold text-[#155e63]">All {result.travelers} traveler{result.travelers === 1 ? '' : 's'} for {result.days} days: {formatTripCostRange(result.groupMinimum, result.groupMaximum, result.openEnded)}</p>
        <p className="mt-2 text-xs font-semibold text-gray-700">Daily-cost subtotals. Add separate trip costs below.</p>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-gray-600">{content.assumptions}</p>
      <p className="mt-2 text-xs leading-relaxed text-gray-600">{content.excludedCosts}</p>
      <p className="mt-2 text-xs leading-relaxed text-gray-600">{content.roomNote}</p>
      <h3 className="mt-5 text-base font-bold text-gray-950">{content.examplesHeading}</h3>
      <p className="mt-2 text-xs leading-relaxed text-gray-600">{content.examplesNote}</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm text-gray-700">
          <thead><tr><th scope="col" className="border-b p-2 text-left">Days / one person</th>{styles.map(([value, range]) => <th key={value} scope="col" className="border-b p-2 text-left">{range.label}</th>)}</tr></thead>
          <tbody>{content.exampleDays.map((value) => <tr key={value}><th scope="row" className="border-b p-2 text-left">{value} days</th>{styles.map(([key]) => { const example = estimateTripCost(value, 1, key); return <td key={key} className="border-b p-2">{formatTripCostRange(example.perPersonMinimum, example.perPersonMaximum, example.openEnded)}</td>; })}</tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

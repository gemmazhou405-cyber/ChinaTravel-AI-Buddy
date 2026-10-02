import {
  COUNTRY_NAMES,
  HAINAN_30_DAY_POLICIES,
  MUTUAL_VISA_EXEMPTION_POLICIES,
  OFFICIAL_VISA_SOURCES,
  POLICY_LAST_VERIFIED_DATE,
  TRANSIT_240_POLICIES,
  UNILATERAL_30_DAY_POLICIES,
  normalizeNationalityToIso,
  type PassportType,
  type TripType,
  type VisaPolicyRecord,
  type VisaPolicyType,
  type VisaPurpose,
} from '../data/chinaVisaPolicies.ts';

export type { PassportType, TripType, VisaPurpose } from '../data/chinaVisaPolicies.ts';

export interface VisaCheckerInput {
  nationalityCode: string;
  passportType: PassportType | '';
  entryDate: string;
  purpose: VisaPurpose | '';
  stayDays: number;
  tripType: TripType | '';
  originCountryOrRegion: string;
  onwardCountryOrRegion: string;
}

export type VisaResultCategory =
  | 'likely_eligible'
  | 'additional_checks'
  | 'date_unconfirmed'
  | 'visa_may_be_required'
  | 'cannot_determine';

export interface VisaCheckerResult {
  category: VisaResultCategory;
  policyType: VisaPolicyType | 'none';
  heading: string;
  summary: string;
  basis: string[];
  remainingConditions: string[];
  maximumStay: string;
  policyValidity: string;
  sources: Array<{ label: string; url: string }>;
  nextAction: string;
  lastPolicyCheck: string;
}

const officialFallback = OFFICIAL_VISA_SOURCES.unilateralCountries;
const excludedPurposes = new Set<VisaPurpose>(['work', 'study', 'journalism', 'other']);

function policyFor(policies: VisaPolicyRecord[], countryCode: string) {
  return policies.find((policy) => policy.countryIsoCode === countryCode);
}

function hasCompleteInput(input: VisaCheckerInput) {
  return Boolean(
    input.nationalityCode &&
    input.passportType &&
    /^\d{4}-\d{2}-\d{2}$/.test(input.entryDate) &&
    input.purpose &&
    input.tripType &&
    Number.isInteger(input.stayDays) &&
    input.stayDays >= 1 &&
    input.stayDays <= 180,
  );
}

function isPolicyActive(policy: VisaPolicyRecord, entryDate: string) {
  if (policy.validFrom && entryDate < policy.validFrom) return false;
  if (policy.validUntil && entryDate > policy.validUntil) return false;
  return true;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${value}T00:00:00Z`));
}

function validityText(policy: VisaPolicyRecord) {
  if (policy.validUntil) return `Verified through ${formatDate(policy.validUntil)}`;
  if (policy.validFrom) return `In force from ${formatDate(policy.validFrom)}; no expiry is stated in the cited source`;
  return 'No expiry is stated in the cited source; recheck before travel';
}

function sourcesFor(policy?: VisaPolicyRecord) {
  if (!policy) return [{ label: 'Official NIA visa-free policy information', url: officialFallback }];
  return [
    { label: 'Primary official policy source', url: policy.officialSourceUrl },
    ...policy.additionalOfficialSourceUrls.map((url, index) => ({ label: `Additional official source ${index + 1}`, url })),
  ];
}

function fallback(
  category: VisaResultCategory,
  heading: string,
  summary: string,
  basis: string[],
  nextAction: string,
): VisaCheckerResult {
  return {
    category,
    policyType: 'none',
    heading,
    summary,
    basis,
    remainingConditions: ['Chinese border inspection makes the final admission decision.'],
    maximumStay: 'Not determined',
    policyValidity: 'No automated policy match',
    sources: [{ label: 'Official NIA policy information', url: officialFallback }],
    nextAction,
    lastPolicyCheck: POLICY_LAST_VERIFIED_DATE,
  };
}

function resultFromPolicy(
  category: VisaResultCategory,
  policy: VisaPolicyRecord,
  heading: string,
  summary: string,
  basis: string[],
  remainingConditions: string[],
  nextAction: string,
): VisaCheckerResult {
  return {
    category,
    policyType: policy.policyType,
    heading,
    summary,
    basis,
    remainingConditions,
    maximumStay: policy.maximumStayText,
    policyValidity: validityText(policy),
    sources: sourcesFor(policy),
    nextAction,
    lastPolicyCheck: policy.lastVerifiedDate,
  };
}

function normalizedRoutePart(value: string) {
  const iso = normalizeNationalityToIso(value);
  return iso === 'ZZ' ? value.trim().toLocaleLowerCase().replace(/[.,]/g, '').replace(/\s+/g, ' ') : iso;
}

export function evaluateVisaFree(input: VisaCheckerInput): VisaCheckerResult {
  if (!hasCompleteInput(input)) {
    return fallback(
      'cannot_determine',
      'This checker cannot determine your case',
      'Complete every required field with a valid travel date and a stay between 1 and 180 days.',
      ['Necessary trip information is missing or invalid.'],
      'Complete the form, or use the official sources for a manual check.',
    );
  }

  const countryName = COUNTRY_NAMES[input.nationalityCode] ?? 'the selected nationality';

  if (input.passportType !== 'ordinary') {
    return fallback(
      'cannot_determine',
      'This checker currently covers ordinary passports only',
      'Diplomatic, service, official and other travel documents can follow different agreements and cannot be assessed with ordinary-tourist rules.',
      ['The selected passport type is outside this checker’s scope.'],
      'Check the exact passport category with a Chinese embassy or consulate and your carrier.',
    );
  }

  if (excludedPurposes.has(input.purpose as VisaPurpose)) {
    return fallback(
      'visa_may_be_required',
      'A visa may be required',
      'You will normally need the appropriate visa or prior approval for this purpose.',
      [`${input.purpose === 'journalism' ? 'Journalism/news reporting' : input.purpose} is not covered by the visitor policies automated here.`],
      'Contact a Chinese embassy or consulate before booking travel.',
    );
  }

  const mutual = policyFor(MUTUAL_VISA_EXEMPTION_POLICIES, input.nationalityCode);
  if (mutual && isPolicyActive(mutual, input.entryDate)) {
    if (!mutual.acceptedPurposes.includes(input.purpose as VisaPurpose) || input.stayDays > mutual.maximumStayDays) {
      return resultFromPolicy(
        'visa_may_be_required',
        mutual,
        'A visa may be required',
        `A verified ordinary-passport mutual agreement exists for ${countryName}, but this stay length or purpose is outside the terms automated by this checker.`,
        [`Requested stay: ${input.stayDays} days.`, `Agreement limit recorded here: ${mutual.maximumStayText}.`],
        mutual.cumulativeStayRestriction ? [mutual.cumulativeStayRestriction, 'Confirm purpose and cumulative prior stays.'] : ['Confirm the agreement’s permitted purpose and any prior stays.'],
        'Check the country-specific agreement and contact the relevant Chinese embassy or consulate.',
      );
    }
    return resultFromPolicy(
      'likely_eligible',
      mutual,
      'Likely eligible under a mutual visa exemption agreement',
      `The current official agreement table records ordinary-passport visa-free entry for ${countryName}. This is a bilateral agreement, not China’s unilateral 30-day policy.`,
      ['Ordinary passport selected.', `Planned stay of ${input.stayDays} days is within the recorded limit.`, 'Purpose is within the visitor purposes checked by this tool.'],
      [
        ...(mutual.cumulativeStayRestriction ? [mutual.cumulativeStayRestriction] : []),
        'Carry documents consistent with the stated purpose and confirm the agreement immediately before travel.',
        'Chinese border inspection makes the final admission decision.',
      ],
      'Open the official agreement table and confirm any cumulative-stay restriction before departure.',
    );
  }

  const unilateral = policyFor(UNILATERAL_30_DAY_POLICIES, input.nationalityCode);
  if (unilateral && !isPolicyActive(unilateral, input.entryDate) && input.tripType === 'mainland_visit') {
    return resultFromPolicy(
      'date_unconfirmed',
      unilateral,
      'Policy not yet confirmed for your travel date',
      `The currently verified unilateral policy for ${countryName} expires before the planned entry date. This checker does not assume an extension.`,
      [`Planned entry: ${formatDate(input.entryDate)}.`, unilateral.validUntil ? `Current verified end date: ${formatDate(unilateral.validUntil)}.` : 'No matching effective period was found.'],
      ['Recheck the MFA or NIA source close to departure.'],
      'Do not rely on visa-free entry unless an official extension or replacement policy is published.',
    );
  }
  if (unilateral && isPolicyActive(unilateral, input.entryDate) && unilateral.acceptedPurposes.includes(input.purpose as VisaPurpose) && input.stayDays <= 30) {
    return resultFromPolicy(
      'likely_eligible',
      unilateral,
      'Likely eligible for 30-day visa-free entry',
      `The current unilateral policy includes ordinary-passport holders from ${countryName} for the selected purpose and stay length.`,
      ['Nationality is on the current official 50-country list.', 'Ordinary passport selected.', `Planned stay: ${input.stayDays} days.`],
      [
        'The 30 calendar days are calculated from 00:00 on the day after entry.',
        'Carry a return or onward ticket, accommodation booking, and documents consistent with your stated purpose.',
        'Chinese border inspection makes the final admission decision.',
      ],
      'Recheck the official list and policy validity immediately before travel.',
    );
  }

  if (input.tripType === 'hainan_only') {
    const hainan = policyFor(HAINAN_30_DAY_POLICIES, input.nationalityCode);
    if (hainan && hainan.acceptedPurposes.includes(input.purpose as VisaPurpose) && input.stayDays <= hainan.maximumStayDays) {
      return resultFromPolicy(
        'additional_checks',
        hainan,
        'May qualify — additional checks required',
        `The Hainan 30-day policy includes ordinary-passport holders from ${countryName} for this purpose and stay length.`,
        ['The selected trip is Hainan only.', `Planned stay: ${input.stayDays} days.`],
        ['This policy limits your stay to Hainan Province.', 'Enter and leave through an open port in Hainan.', 'Confirm the current port and purpose conditions before travel.'],
        'Check the official Hainan policy and verify your arrival port before booking.',
      );
    }
    return fallback(
      'visa_may_be_required',
      'A visa may be required',
      'The selected nationality, purpose or stay length does not match the Hainan-only policy automated here.',
      ['Hainan visa-free entry is regional and cannot be used for travel to Beijing or other mainland destinations outside Hainan.'],
      'Check the official Hainan list and a Chinese embassy or consulate.',
    );
  }

  if (input.tripType === 'transit') {
    const transit = policyFor(TRANSIT_240_POLICIES, input.nationalityCode);
    const origin = normalizedRoutePart(input.originCountryOrRegion);
    const onward = normalizedRoutePart(input.onwardCountryOrRegion);
    if (!origin || !onward) {
      return fallback(
        'cannot_determine',
        'This checker cannot determine your case',
        'A 240-hour transit check needs both the country or region before Mainland China and the next country or region after Mainland China.',
        ['The transit route is incomplete.'],
        'Add both route points and check again.',
      );
    }
    if (origin === 'CN' || onward === 'CN') {
      return fallback(
        'visa_may_be_required',
        'A visa may be required',
        'The route entered does not show transit between two places outside Mainland China.',
        ['The place before and the destination after Mainland China must both be outside Mainland China.'],
        'Check the ticketed route with the carrier and use the appropriate visitor visa if it is not a qualifying transit.',
      );
    }
    if (origin === onward) {
      if (!transit) {
        return fallback(
          'visa_may_be_required',
          'A visa may be required',
          'The itinerary is not a third-country or third-region transit, and the selected nationality is not on the verified 240-hour transit list.',
          [`Route entered: ${input.originCountryOrRegion} → Mainland China → ${input.onwardCountryOrRegion}.`],
          'Check the appropriate visitor visa before travel.',
        );
      }
      return resultFromPolicy(
        'visa_may_be_required',
        transit,
        'A visa may be required',
        'The itinerary is not a third-country or third-region transit because the route returns to the same origin.',
        [`Route entered: ${input.originCountryOrRegion} → Mainland China → ${input.onwardCountryOrRegion}.`],
        ['The destination after Mainland China must differ from the place before Mainland China.'],
        'Change the ticketed route or check the appropriate visitor visa before travel.',
      );
    }
    if (transit && input.stayDays <= transit.maximumStayDays && transit.acceptedPurposes.includes(input.purpose as VisaPurpose)) {
      return resultFromPolicy(
        'additional_checks',
        transit,
        'May qualify — additional checks required',
        'You may qualify for the 240-hour visa-free transit policy, subject to your entry port, exit port and permitted stay area.',
        ['Nationality is on the current 57-country list.', 'Ordinary passport selected.', 'The route continues to a different country or region.', `Planned stay: ${input.stayDays} days.`],
        ['Hold an onward ticket with a confirmed departure date and seat.', 'Use designated entry and exit ports.', 'Remain within the permitted stay area.', 'Confirm Hong Kong, Macao or Taiwan routing with the carrier and border authorities when relevant.'],
        'Verify the exact ports, domestic stops and permitted area on the official NIA page before booking.',
      );
    }
    return fallback(
      'visa_may_be_required',
      'A visa may be required',
      'The nationality, purpose or stay length does not match the 240-hour transit conditions automated here.',
      [input.stayDays > 10 ? 'The planned stay is longer than 240 hours.' : 'No safe 240-hour policy match was found.'],
      'Check the official 240-hour policy and contact the carrier or a Chinese embassy or consulate.',
    );
  }

  if (unilateral && input.stayDays > 30) {
    return resultFromPolicy(
      'visa_may_be_required',
      unilateral,
      'A visa may be required',
      'The planned stay is longer than the 30-day unilateral visa-free limit.',
      [`Planned stay: ${input.stayDays} days.`, 'Current unilateral limit: 30 days.'],
      ['A longer stay normally requires the appropriate visa before travel.'],
      'Contact a Chinese embassy or consulate for the correct visa category.',
    );
  }

  return fallback(
    'visa_may_be_required',
    'A visa may be required',
    `No verified ordinary-passport policy in this checker safely covers a direct Mainland China visit for ${countryName}.`,
    ['Nationality alone is not enough; passport type, purpose, dates and itinerary all matter.'],
    'Use the official sources and contact a Chinese embassy or consulate before travel.',
  );
}

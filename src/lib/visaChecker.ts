export type VisaPurpose = 'tourism' | 'business' | 'family_visit' | 'exchange' | 'transit' | 'medical' | 'work' | 'study' | 'journalism' | 'other';

export interface VisaCheckerInput {
  nationality: string;
  ordinaryPassport: boolean;
  entryDate: string;
  stayDays: number;
  purpose: VisaPurpose;
  arrivalPort: string;
  departurePort: string;
  continuesToThirdCountryOrRegion: boolean;
  originCountryOrRegion: string;
  onwardCountryOrRegion: string;
  hainanOnly: boolean;
}

export type VisaRuleType = 'temporary_30_day' | 'unilateral_30_day' | 'mutual_agreement' | 'transit_240_hour' | 'hainan_30_day' | 'official_confirmation_required';

export interface VisaRuleMetadata {
  type: VisaRuleType;
  sourceUrl: string;
  effectiveDate: string | null;
  expiryDate: string | null;
  lastVerifiedDate: string;
}

export interface VisaCheckerResult {
  status: 'may_be_eligible' | 'not_eligible_for_selected_route' | 'confirm_officially';
  ruleType: VisaRuleType;
  heading: string;
  explanation: string;
  checks: string[];
  sourceUrl: string;
}

export const VISA_RULE_METADATA: VisaRuleMetadata[] = [
  {
    type: 'temporary_30_day',
    sourceUrl: 'https://english.www.gov.cn/news/202602/15/content_WS6991bc11c6d00ca5f9a092d6.html',
    effectiveDate: '2026-02-17',
    expiryDate: '2026-12-31',
    lastVerifiedDate: '2026-10-01',
  },
  {
    type: 'unilateral_30_day',
    sourceUrl: 'https://cs.mfa.gov.cn/zytz/202607/t20260721_11988631.html',
    effectiveDate: null,
    expiryDate: '2026-12-31',
    lastVerifiedDate: '2026-10-01',
  },
  {
    type: 'mutual_agreement',
    sourceUrl: 'https://cs.mfa.gov.cn/lh/lhqz_149493/list/202607/t20260713_11981384.html',
    effectiveDate: null,
    expiryDate: null,
    lastVerifiedDate: '2026-10-01',
  },
  {
    type: 'transit_240_hour',
    sourceUrl: 'https://en.nia.gov.cn/n147418/n147463/c183412/content.html',
    effectiveDate: '2026-08-20',
    expiryDate: null,
    lastVerifiedDate: '2026-10-01',
  },
  {
    type: 'hainan_30_day',
    sourceUrl: 'https://en.nia.gov.cn/n147418/n147463/c180637/content.html',
    effectiveDate: '2026-08-20',
    expiryDate: null,
    lastVerifiedDate: '2026-10-01',
  },
  {
    type: 'official_confirmation_required',
    sourceUrl: 'https://en.nia.gov.cn/n147418/n147463/index.html',
    effectiveDate: null,
    expiryDate: null,
    lastVerifiedDate: '2026-10-01',
  },
];

const TEMPORARY_UK_CANADA = new Set(['Canada', 'United Kingdom']);
const UNILATERAL_30_DAY = new Set([
  'Brunei', 'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Ireland', 'Hungary', 'Austria', 'Belgium', 'Luxembourg', 'New Zealand', 'Australia', 'Poland', 'Portugal', 'Greece', 'Cyprus', 'Slovenia', 'Slovakia', 'Norway', 'Finland', 'Denmark', 'Iceland', 'Andorra', 'Monaco', 'Liechtenstein', 'South Korea', 'Bulgaria', 'Romania', 'Croatia', 'Montenegro', 'North Macedonia', 'Malta', 'Estonia', 'Latvia', 'Japan', 'Brazil', 'Argentina', 'Chile', 'Peru', 'Uruguay', 'Saudi Arabia', 'Oman', 'Kuwait', 'Bahrain', 'Russia', 'Sweden', 'Canada', 'United Kingdom',
]);
const MUTUAL_ORDINARY_PASSPORT = new Set([
  'Albania', 'Antigua and Barbuda', 'Armenia', 'Azerbaijan', 'Bahamas', 'Barbados', 'Belarus', 'Bosnia and Herzegovina', 'Georgia', 'Grenada', 'Kazakhstan', 'Malaysia', 'Maldives', 'Mauritius', 'Qatar', 'Samoa', 'San Marino', 'Serbia', 'Seychelles', 'Singapore', 'Solomon Islands', 'Suriname', 'Thailand', 'Tonga', 'United Arab Emirates', 'Uzbekistan',
]);
const TRANSIT_240 = new Set([
  'Albania', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'Canada', 'United States', 'Argentina', 'Brazil', 'Chile', 'Mexico', 'Australia', 'New Zealand', 'Brunei', 'Indonesia', 'Japan', 'Kyrgyzstan', 'Qatar', 'Singapore', 'South Korea', 'United Arab Emirates', 'Vietnam',
]);
const HAINAN_30_DAY = new Set([
  'Albania', 'Argentina', 'Australia', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Brazil', 'Brunei', 'Bulgaria', 'Canada', 'Chile', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Indonesia', 'Ireland', 'Italy', 'Japan', 'Kazakhstan', 'Kyrgyzstan', 'Latvia', 'Lithuania', 'Luxembourg', 'Malaysia', 'Malta', 'Mexico', 'Monaco', 'Montenegro', 'Netherlands', 'New Zealand', 'North Macedonia', 'Norway', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'South Korea', 'Romania', 'Russia', 'Serbia', 'Singapore', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Vietnam',
]);

export const NATIONALITIES = Array.from(new Set([
  ...TEMPORARY_UK_CANADA,
  ...UNILATERAL_30_DAY,
  ...MUTUAL_ORDINARY_PASSPORT,
  ...TRANSIT_240,
  ...HAINAN_30_DAY,
])).sort((a, b) => a.localeCompare(b));

const ORDINARY_PURPOSES = new Set<VisaPurpose>(['tourism', 'business', 'family_visit', 'exchange', 'transit']);
const HAINAN_PURPOSES = new Set<VisaPurpose>(['tourism', 'business', 'family_visit', 'medical', 'exchange']);

function rule(type: VisaRuleType) {
  return VISA_RULE_METADATA.find((item) => item.type === type)!;
}

function isWithin(date: string, start: string | null, end: string | null) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

function normalizeRegion(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

export function evaluateVisaFree(input: VisaCheckerInput, validTransitPorts: readonly string[]): VisaCheckerResult {
  const officialFallback = rule('official_confirmation_required');
  if (!input.ordinaryPassport) {
    return {
      status: 'confirm_officially',
      ruleType: 'official_confirmation_required',
      heading: 'Your passport type needs an official check',
      explanation: 'This checker only evaluates ordinary-passport routes. Diplomatic, service, official, emergency, refugee, and other travel documents can follow different rules.',
      checks: ['Confirm the exact document category with a Chinese embassy or consulate and your carrier.'],
      sourceUrl: officialFallback.sourceUrl,
    };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.entryDate) || !Number.isInteger(input.stayDays) || input.stayDays < 1) {
    return {
      status: 'confirm_officially', ruleType: 'official_confirmation_required', heading: 'Add a valid date and stay length',
      explanation: 'Eligibility cannot be checked without a valid planned entry date and a positive whole-number stay length.', checks: [], sourceUrl: officialFallback.sourceUrl,
    };
  }
  if (['work', 'study', 'journalism'].includes(input.purpose)) {
    return {
      status: 'not_eligible_for_selected_route', ruleType: 'official_confirmation_required', heading: 'A visa or prior approval is normally required',
      explanation: 'The visitor and transit policies checked here do not cover work, study, or journalism. Apply for the appropriate visa or approval before travel.', checks: [], sourceUrl: officialFallback.sourceUrl,
    };
  }

  if (TEMPORARY_UK_CANADA.has(input.nationality)) {
    const currentRule = rule('temporary_30_day');
    if (isWithin(input.entryDate, currentRule.effectiveDate, currentRule.expiryDate) && input.stayDays <= 30 && ORDINARY_PURPOSES.has(input.purpose)) {
      return {
        status: 'may_be_eligible', ruleType: currentRule.type, heading: 'You may be eligible for temporary 30-day visa-free entry',
        explanation: 'Based on the information provided, an ordinary-passport holder from Canada or the United Kingdom may use the temporary policy for up to 30 days for a covered purpose between February 17 and December 31, 2026.',
        checks: ['Confirm the policy is still in force on the entry date.', 'Carry evidence matching the stated purpose and onward or return arrangements.', 'The final decision belongs to the carrier and Chinese border inspection.'], sourceUrl: currentRule.sourceUrl,
      };
    }
    if (input.entryDate > '2026-12-31') {
      return {
        status: 'confirm_officially', ruleType: currentRule.type, heading: 'The published UK/Canada temporary policy has expired for this date',
        explanation: 'The verified policy currently runs through December 31, 2026. Do not assume it continues after that date unless an official extension is published.',
        checks: ['Check the Chinese Foreign Ministry or embassy for an extension.'], sourceUrl: currentRule.sourceUrl,
      };
    }
  }

  const ordinaryRule = rule('unilateral_30_day');
  if (UNILATERAL_30_DAY.has(input.nationality) && isWithin(input.entryDate, ordinaryRule.effectiveDate, ordinaryRule.expiryDate) && input.stayDays <= 30 && ORDINARY_PURPOSES.has(input.purpose)) {
    return {
      status: 'may_be_eligible', ruleType: ordinaryRule.type, heading: 'You may be eligible for ordinary 30-day visa-free entry',
      explanation: 'Based on the nationality, date, stay length, passport type, and purpose provided, the current ordinary-passport policy may apply. Individual policy validity dates can differ, so recheck the official list immediately before travel.',
      checks: ['No third-country transit route is required for ordinary visa-free entry.', 'Confirm the current nationality entry and expiry date in the official FAQ.', 'Carrier and border inspection make the operational and final decisions.'], sourceUrl: ordinaryRule.sourceUrl,
    };
  }

  if (MUTUAL_ORDINARY_PASSPORT.has(input.nationality)) {
    const mutualRule = rule('mutual_agreement');
    return {
      status: 'confirm_officially', ruleType: mutualRule.type, heading: 'A mutual visa-waiver agreement may apply',
      explanation: 'The official mutual-agreement table includes ordinary passports for this nationality, but allowed stay, purpose, document wording, and one-way conditions can differ by agreement. This checker does not convert those treaty details into an automatic approval.',
      checks: ['Open the official agreement table for the exact passport and nationality.', 'Confirm permitted stay and purpose with the embassy or consulate.', 'Carry documents requested by the carrier.'], sourceUrl: mutualRule.sourceUrl,
    };
  }

  const hainanRule = rule('hainan_30_day');
  if (input.hainanOnly && HAINAN_30_DAY.has(input.nationality) && input.stayDays <= 30 && HAINAN_PURPOSES.has(input.purpose)) {
    return {
      status: 'may_be_eligible', ruleType: hainanRule.type, heading: 'You may be eligible for Hainan-only 30-day visa-free entry',
      explanation: 'Based on the information provided, the Hainan regional policy may apply. It is limited to Hainan Province and is not the same as nationwide ordinary visa-free entry or 240-hour transit.',
      checks: ['Enter through an open port in Hainan.', 'Remain within Hainan Province.', 'Confirm that the purpose and travel date remain covered.'], sourceUrl: hainanRule.sourceUrl,
    };
  }

  const transitRule = rule('transit_240_hour');
  const origin = normalizeRegion(input.originCountryOrRegion);
  const onward = normalizeRegion(input.onwardCountryOrRegion);
  const routeIsThirdRegion = input.continuesToThirdCountryOrRegion && Boolean(origin) && Boolean(onward) && origin !== onward;
  const arrivalValid = validTransitPorts.includes(input.arrivalPort);
  const departureValid = validTransitPorts.includes(input.departurePort);
  if (TRANSIT_240.has(input.nationality) && input.stayDays <= 10) {
    if (!routeIsThirdRegion) {
      return {
        status: 'not_eligible_for_selected_route', ruleType: transitRule.type, heading: 'This route does not meet the third-country transit condition',
        explanation: 'The 240-hour policy requires travel from one country or region through mainland China to a different country or region. A return to the same origin does not qualify.',
        checks: ['Enter distinct origin and onward countries or regions.', 'Do not treat Hong Kong, Macao, Taiwan, and mainland China as interchangeable; verify the exact ticketed sequence with immigration and the carrier.'], sourceUrl: transitRule.sourceUrl,
      };
    }
    if (arrivalValid && departureValid && input.purpose === 'transit') {
      return {
        status: 'may_be_eligible', ruleType: transitRule.type, heading: 'You may be eligible for 240-hour visa-free transit',
        explanation: 'Based on the information provided, the nationality, ordinary passport, stay length, third-country route, and selected designated ports match core published conditions. You must still remain within the permitted area connected to the route.',
        checks: ['Hold confirmed onward transport with a seat and departure date.', 'Verify every mainland stop is within the permitted stay area.', 'The 240-hour clock starts at 00:00 on the day after entry.', 'Confirm complex Hong Kong, Macao, or Taiwan routing with NIA 12367 and the carrier.'], sourceUrl: transitRule.sourceUrl,
      };
    }
    if (!arrivalValid || !departureValid) {
      return {
        status: 'not_eligible_for_selected_route', ruleType: transitRule.type, heading: 'A selected port is not in the current 65-port list',
        explanation: 'The 240-hour policy is limited to designated entry and exit ports. Choose the exact official port rather than only the city name, and verify the permitted area.', checks: [], sourceUrl: transitRule.sourceUrl,
      };
    }
  }

  return {
    status: 'confirm_officially', ruleType: 'official_confirmation_required', heading: 'No safe automatic match was found',
    explanation: 'This does not mean a visa is definitely required. A mutual agreement, another regional rule, a residence permit, or a visa category may apply, but the information provided is not enough for a reliable automated result.',
    checks: ['Check the Chinese embassy or consulate for your passport nationality.', 'Confirm the route with the carrier.', 'For immigration policy questions in China, contact NIA 12367.'], sourceUrl: officialFallback.sourceUrl,
  };
}

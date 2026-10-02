export type PassportType = 'ordinary' | 'other';
export type VisaPurpose =
  | 'tourism'
  | 'business'
  | 'family_visit'
  | 'exchange'
  | 'transit'
  | 'work'
  | 'study'
  | 'journalism'
  | 'other';
export type TripType = 'mainland_visit' | 'transit' | 'hainan_only';
export type VisaPolicyType = 'mutual_agreement' | 'unilateral_30_day' | 'transit_240_hour' | 'hainan_30_day';

export interface VisaPolicyRecord {
  id: string;
  policyType: VisaPolicyType;
  countryIsoCode: string;
  countryDisplayName: string;
  acceptedPassportTypes: PassportType[];
  acceptedPurposes: VisaPurpose[];
  validFrom: string | null;
  validUntil: string | null;
  maximumStayDays: number;
  maximumStayText: string;
  cumulativeStayRestriction: string | null;
  transitRequirement: string | null;
  geographicRestriction: string | null;
  eligiblePortsUrl: string | null;
  officialSourceUrl: string;
  additionalOfficialSourceUrls: string[];
  sourcePublicationDate: string;
  lastVerifiedDate: string;
  policyNotes: string[];
}

export const POLICY_LAST_VERIFIED_DATE = '2026-10-02';
export const POLICY_LAST_VERIFIED_LABEL = 'October 2, 2026';

export const OFFICIAL_VISA_SOURCES = {
  unilateralCountries: 'https://en.nia.gov.cn/n147418/n147463/c183390/content.html',
  unilateralFaq: 'https://www.mfa.gov.cn/wjbzwfwpt/kzx/tzgg/202511/t20251110_11749824.html',
  transit240: 'https://en.nia.gov.cn/n147418/n147463/c183412/content.html',
  hainan: 'https://en.nia.gov.cn/n147418/n147463/c180637/content.html',
  mutualList: 'https://cs.mfa.gov.cn/wgrlh/lhqz/lhqzjjs/202510/t20251023_11739051.shtml',
  mutualTerms: 'https://en.nia.gov.cn/n147418/n147463/c181470/content.html',
  mutualFaq: 'https://en.nia.gov.cn/n147418/n147463/c183401/content.html',
} as const;

export const COUNTRY_NAMES: Record<string, string> = {
  AD: 'Andorra', AG: 'Antigua and Barbuda', AL: 'Albania', AM: 'Armenia', AR: 'Argentina',
  AT: 'Austria', AU: 'Australia', AE: 'United Arab Emirates', BA: 'Bosnia and Herzegovina',
  BB: 'Barbados', BE: 'Belgium', BG: 'Bulgaria', BH: 'Bahrain', BN: 'Brunei',
  BR: 'Brazil', BS: 'Bahamas', BY: 'Belarus', CA: 'Canada', CH: 'Switzerland', CL: 'Chile',
  CN: 'China (Mainland)', CY: 'Cyprus', CZ: 'Czechia', DE: 'Germany', DK: 'Denmark',
  DM: 'Dominica', EE: 'Estonia', ES: 'Spain', FI: 'Finland', FJ: 'Fiji', FR: 'France',
  GB: 'United Kingdom', GE: 'Georgia', GR: 'Greece', HR: 'Croatia', HU: 'Hungary',
  ID: 'Indonesia', IE: 'Ireland', IN: 'India', IS: 'Iceland', IT: 'Italy', JP: 'Japan',
  KG: 'Kyrgyzstan', KR: 'South Korea', KW: 'Kuwait', KZ: 'Kazakhstan', LI: 'Liechtenstein',
  LT: 'Lithuania', LU: 'Luxembourg', LV: 'Latvia', MC: 'Monaco', ME: 'Montenegro',
  MK: 'North Macedonia', MT: 'Malta', MU: 'Mauritius', MV: 'Maldives', MX: 'Mexico',
  MY: 'Malaysia', NL: 'Netherlands', NO: 'Norway', NZ: 'New Zealand', OM: 'Oman',
  PE: 'Peru', PH: 'Philippines', PL: 'Poland', PT: 'Portugal', QA: 'Qatar', RO: 'Romania',
  RS: 'Serbia', RU: 'Russia', SA: 'Saudi Arabia', SB: 'Solomon Islands', SC: 'Seychelles',
  SE: 'Sweden', SG: 'Singapore', SI: 'Slovenia', SK: 'Slovakia', SR: 'Suriname',
  TH: 'Thailand', TO: 'Tonga', UA: 'Ukraine', US: 'United States', UY: 'Uruguay',
  VN: 'Vietnam', WS: 'Samoa', HK: 'Hong Kong SAR', MO: 'Macao SAR', TW: 'Taiwan',
  ZZ: 'Other / not listed',
};

const ISO_COUNTRY_CODES = `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`.split(' ');
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
for (const code of ISO_COUNTRY_CODES) {
  if (!COUNTRY_NAMES[code]) COUNTRY_NAMES[code] = regionNames.of(code) ?? code;
}

export const COUNTRY_NAME_ALIASES: Record<string, string> = {
  'united kingdom': 'GB', uk: 'GB', britain: 'GB',
  'united states': 'US', usa: 'US', 'united states of america': 'US',
  'south korea': 'KR', 'republic of korea': 'KR',
  russia: 'RU', 'russian federation': 'RU',
  czechia: 'CZ', 'czech republic': 'CZ',
  brunei: 'BN', 'brunei darussalam': 'BN',
  netherlands: 'NL', 'the netherlands': 'NL',
  bahamas: 'BS', 'the bahamas': 'BS',
  philippines: 'PH', 'the philippines': 'PH',
};

const ordinaryPurposes: VisaPurpose[] = ['tourism', 'business', 'family_visit', 'exchange', 'transit'];
const transitPurposes: VisaPurpose[] = ['tourism', 'business', 'family_visit', 'exchange', 'transit'];
const hainanPurposes: VisaPurpose[] = ['tourism', 'business', 'family_visit', 'exchange'];

export const UNILATERAL_30_DAY_COUNTRY_CODES = [
  'AD', 'AT', 'BE', 'BG', 'HR', 'CY', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS',
  'IE', 'IT', 'LV', 'LI', 'LU', 'MT', 'MC', 'ME', 'NL', 'MK', 'NO', 'PL', 'PT', 'RO',
  'RU', 'SK', 'SI', 'ES', 'SE', 'CH', 'GB', 'AU', 'NZ', 'BH', 'BN', 'JP', 'KW', 'OM',
  'KR', 'SA', 'AR', 'BR', 'CA', 'CL', 'PE', 'UY',
] as const;

export const TRANSIT_240_COUNTRY_CODES = [
  'AL', 'AT', 'BY', 'BE', 'BA', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE',
  'GR', 'HU', 'IS', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'MC', 'ME', 'NL', 'MK', 'NO',
  'PL', 'PT', 'RO', 'RU', 'RS', 'SK', 'SI', 'ES', 'SE', 'CH', 'UA', 'GB', 'CA', 'US',
  'AR', 'BR', 'CL', 'MX', 'AU', 'NZ', 'BN', 'ID', 'JP', 'KG', 'QA', 'SG', 'KR', 'AE', 'VN',
] as const;

export const HAINAN_30_DAY_COUNTRY_CODES = [
  'AL', 'AR', 'AU', 'AT', 'BY', 'BE', 'BA', 'BR', 'BN', 'BG', 'CA', 'CL', 'HR', 'CY',
  'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'ID', 'IE', 'IT', 'JP', 'KZ',
  'KG', 'LV', 'LT', 'LU', 'MY', 'MT', 'MX', 'MC', 'ME', 'NL', 'NZ', 'MK', 'NO', 'PH',
  'PL', 'PT', 'QA', 'KR', 'RO', 'RU', 'RS', 'SG', 'SK', 'SI', 'ES', 'SE', 'CH', 'TH',
  'UA', 'AE', 'GB', 'US', 'VN',
] as const;

type MutualSeed = {
  code: string;
  effectiveDate: string;
  maximumStayDays: number;
  maximumStayText: string;
  cumulative: string | null;
};

// Conservative subset: only ordinary-passport agreements whose effective date and stay limit
// are explicit in the current MFA/NIA tables. Other agreements require an official check.
const mutualSeeds: MutualSeed[] = [
  { code: 'AL', effectiveDate: '2023-03-18', maximumStayDays: 90, maximumStayText: 'Up to 90 days within each 180-day period', cumulative: 'Maximum 90 days within each 180-day period' },
  { code: 'BA', effectiveDate: '2018-05-29', maximumStayDays: 90, maximumStayText: 'Up to 90 days within each 180-day period', cumulative: 'Maximum 90 days within each 180-day period' },
  { code: 'RS', effectiveDate: '2017-01-15', maximumStayDays: 30, maximumStayText: 'Up to 30 days', cumulative: null },
  { code: 'MV', effectiveDate: '2022-05-20', maximumStayDays: 30, maximumStayText: 'Up to 30 days', cumulative: null },
  { code: 'BY', effectiveDate: '2018-08-10', maximumStayDays: 30, maximumStayText: 'Up to 30 days per visit', cumulative: 'Maximum 90 days per calendar year' },
  { code: 'KZ', effectiveDate: '2023-11-10', maximumStayDays: 30, maximumStayText: 'Up to 30 days per visit', cumulative: 'Maximum 90 days within each 180-day period' },
  { code: 'GE', effectiveDate: '2024-05-28', maximumStayDays: 30, maximumStayText: 'Up to 30 days per visit', cumulative: 'Maximum 90 days within each 180-day period' },
  { code: 'AM', effectiveDate: '2020-01-19', maximumStayDays: 90, maximumStayText: 'Up to 90 days within each 180-day period', cumulative: 'Maximum 90 days within each 180-day period' },
  { code: 'TH', effectiveDate: '2024-03-01', maximumStayDays: 30, maximumStayText: 'Up to 30 days per visit', cumulative: 'Maximum 90 days within each 180-day period' },
  { code: 'WS', effectiveDate: '2025-04-02', maximumStayDays: 30, maximumStayText: 'Up to 30 days per visit', cumulative: 'Maximum 90 days within each 180-day period' },
  { code: 'SG', effectiveDate: '2024-02-09', maximumStayDays: 30, maximumStayText: 'Up to 30 days', cumulative: null },
  { code: 'AE', effectiveDate: '2018-01-16', maximumStayDays: 30, maximumStayText: 'Up to 30 days', cumulative: null },
  { code: 'TO', effectiveDate: '2016-08-19', maximumStayDays: 30, maximumStayText: 'Up to 30 days', cumulative: null },
  { code: 'SC', effectiveDate: '2013-06-26', maximumStayDays: 30, maximumStayText: 'Up to 30 days', cumulative: null },
  { code: 'MU', effectiveDate: '2017-06-14', maximumStayDays: 60, maximumStayText: 'Up to 60 days', cumulative: null },
  { code: 'BS', effectiveDate: '2014-02-12', maximumStayDays: 30, maximumStayText: 'Up to 30 days', cumulative: null },
  { code: 'DM', effectiveDate: '2022-09-19', maximumStayDays: 30, maximumStayText: 'Up to 30 days', cumulative: null },
  { code: 'SR', effectiveDate: '2021-05-01', maximumStayDays: 30, maximumStayText: 'Up to 30 days', cumulative: null },
  { code: 'BB', effectiveDate: '2017-06-01', maximumStayDays: 30, maximumStayText: 'Up to 30 days', cumulative: null },
  { code: 'FJ', effectiveDate: '2015-03-14', maximumStayDays: 30, maximumStayText: 'Up to 30 days', cumulative: null },
  { code: 'QA', effectiveDate: '2018-12-21', maximumStayDays: 30, maximumStayText: 'Up to 30 days', cumulative: null },
  { code: 'SB', effectiveDate: '2024-12-28', maximumStayDays: 30, maximumStayText: 'Up to 30 days per visit', cumulative: 'Maximum 90 days within each 180-day period' },
  { code: 'AG', effectiveDate: '2024-05-11', maximumStayDays: 30, maximumStayText: 'Up to 30 days per visit', cumulative: 'Maximum 90 days within each 180-day period' },
];

function baseRecord(code: string) {
  return {
    countryIsoCode: code,
    countryDisplayName: COUNTRY_NAMES[code],
    acceptedPassportTypes: ['ordinary'] as PassportType[],
    lastVerifiedDate: POLICY_LAST_VERIFIED_DATE,
  };
}

export const MUTUAL_VISA_EXEMPTION_POLICIES: VisaPolicyRecord[] = mutualSeeds.map((seed) => ({
  ...baseRecord(seed.code),
  id: `mutual-${seed.code.toLowerCase()}`,
  policyType: 'mutual_agreement',
  acceptedPurposes: ordinaryPurposes,
  validFrom: seed.effectiveDate,
  validUntil: null,
  maximumStayDays: seed.maximumStayDays,
  maximumStayText: seed.maximumStayText,
  cumulativeStayRestriction: seed.cumulative,
  transitRequirement: null,
  geographicRestriction: null,
  eligiblePortsUrl: null,
  officialSourceUrl: OFFICIAL_VISA_SOURCES.mutualTerms,
  additionalOfficialSourceUrls: [OFFICIAL_VISA_SOURCES.mutualList, OFFICIAL_VISA_SOURCES.mutualFaq],
  sourcePublicationDate: '2025-07-04',
  policyNotes: ['Agreement terms differ by country; the recorded ordinary-passport limit must be checked again before travel.'],
}));

export const UNILATERAL_30_DAY_POLICIES: VisaPolicyRecord[] = UNILATERAL_30_DAY_COUNTRY_CODES.map((code) => ({
  ...baseRecord(code),
  id: `unilateral-30-${code.toLowerCase()}`,
  policyType: 'unilateral_30_day',
  acceptedPurposes: ordinaryPurposes,
  validFrom: null,
  validUntil: code === 'BN' ? null : code === 'RU' ? '2027-12-31' : '2026-12-31',
  maximumStayDays: 30,
  maximumStayText: 'Up to 30 calendar days, calculated from 00:00 on the day after entry',
  cumulativeStayRestriction: null,
  transitRequirement: null,
  geographicRestriction: null,
  eligiblePortsUrl: null,
  officialSourceUrl: OFFICIAL_VISA_SOURCES.unilateralCountries,
  additionalOfficialSourceUrls: [OFFICIAL_VISA_SOURCES.unilateralFaq],
  sourcePublicationDate: '2026-02-17',
  policyNotes: [
    code === 'BN' ? 'The official FAQ states no expiry date for Brunei.' : code === 'RU' ? 'Verified through December 31, 2027.' : 'Verified through December 31, 2026.',
    'Work, study and news reporting are not covered.',
  ],
}));

export const TRANSIT_240_POLICIES: VisaPolicyRecord[] = TRANSIT_240_COUNTRY_CODES.map((code) => ({
  ...baseRecord(code),
  id: `transit-240-${code.toLowerCase()}`,
  policyType: 'transit_240_hour',
  acceptedPurposes: transitPurposes,
  validFrom: null,
  validUntil: null,
  maximumStayDays: 10,
  maximumStayText: 'No more than 240 hours',
  cumulativeStayRestriction: null,
  transitRequirement: 'Travel through Mainland China to a different country or region with a confirmed onward ticket, date and seat.',
  geographicRestriction: 'Entry and exit must use designated ports, and travel must remain within the permitted stay area.',
  eligiblePortsUrl: OFFICIAL_VISA_SOURCES.transit240,
  officialSourceUrl: OFFICIAL_VISA_SOURCES.transit240,
  additionalOfficialSourceUrls: [],
  sourcePublicationDate: '2026-08-20',
  policyNotes: ['Port and permitted-area eligibility require an additional official check.'],
}));

export const HAINAN_30_DAY_POLICIES: VisaPolicyRecord[] = HAINAN_30_DAY_COUNTRY_CODES.map((code) => ({
  ...baseRecord(code),
  id: `hainan-30-${code.toLowerCase()}`,
  policyType: 'hainan_30_day',
  acceptedPurposes: hainanPurposes,
  validFrom: null,
  validUntil: null,
  maximumStayDays: 30,
  maximumStayText: 'Up to 30 days',
  cumulativeStayRestriction: null,
  transitRequirement: null,
  geographicRestriction: 'The entire stay must remain within the administrative region of Hainan Province.',
  eligiblePortsUrl: OFFICIAL_VISA_SOURCES.hainan,
  officialSourceUrl: OFFICIAL_VISA_SOURCES.hainan,
  additionalOfficialSourceUrls: [],
  sourcePublicationDate: '2026-08-20',
  policyNotes: ['Use an open port in Hainan. This is not general permission to travel elsewhere in Mainland China.'],
}));

export const CHINA_VISA_POLICIES: VisaPolicyRecord[] = [
  ...MUTUAL_VISA_EXEMPTION_POLICIES,
  ...UNILATERAL_30_DAY_POLICIES,
  ...TRANSIT_240_POLICIES,
  ...HAINAN_30_DAY_POLICIES,
];

const checkerCodes = new Set(ISO_COUNTRY_CODES);
checkerCodes.add('ZZ');

export const CHECKER_COUNTRY_OPTIONS = [...checkerCodes]
  .map((code) => ({ code, name: COUNTRY_NAMES[code] }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function normalizeNationalityToIso(value: string) {
  const trimmed = value.trim();
  const upper = trimmed.toUpperCase();
  if (COUNTRY_NAMES[upper]) return upper;
  const alias = COUNTRY_NAME_ALIASES[trimmed.toLowerCase()];
  if (alias) return alias;
  const direct = Object.entries(COUNTRY_NAMES).find(([, name]) => name.toLowerCase() === trimmed.toLowerCase());
  return direct?.[0] ?? 'ZZ';
}

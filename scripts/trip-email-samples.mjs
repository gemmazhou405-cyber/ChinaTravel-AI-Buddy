// Shared fixtures for the itinerary-email tests and the sample sender. No AI call, no Firestore,
// no free-plan claim: a fixed plan goes through the same enforcement and rendering code as production.
import { buildTouch } from '../src/lib/leadSource.ts';

export const SAMPLE_NOW = Date.parse('2026-10-14T03:00:00Z');

export const samplePlan = {
  title: 'Four relaxed days in Beijing',
  summary: 'A history-focused first visit with an easy pace and one full day for the Great Wall.',
  daily_itinerary: [
    {
      day: 'Day 1', city: 'Beijing',
      morning: 'Arrive and check in near Wangfujing.',
      afternoon: 'Walk around Tiananmen Square and Qianmen Street.',
      evening: 'Peking duck dinner near Qianmen.',
      transport: 'Airport Express to Dongzhimen, then metro.', food: 'Peking duck.', notes: '',
    },
    {
      day: 'Day 2', city: 'Beijing',
      morning: 'Forbidden City (Palace Museum), entering from Meridian Gate.',
      afternoon: 'Jingshan Park for the view over the palace roofs.',
      evening: 'Hutong walk around Nanluoguxiang.',
      transport: 'Metro Line 1 to Tiananmen East.', food: 'Zhajiangmian noodles.', notes: 'Bring the passport used for booking.',
    },
    {
      day: 'Day 3', city: 'Beijing',
      morning: 'Temple of Heaven early, when locals exercise.',
      afternoon: 'Summer Palace and a boat on Kunming Lake.',
      evening: 'Acrobatics show at Chaoyang Theatre.',
      transport: 'Taxi via DiDi between sights.', food: 'Hot pot.', notes: '',
    },
    {
      day: 'Day 4', city: 'Beijing',
      morning: 'Day trip to the Great Wall at Mutianyu with the cable car.',
      afternoon: 'Return to the city and pack.',
      evening: 'Fly home. A VPN is guaranteed to keep your apps working.',
      transport: 'Private car to Mutianyu, about 1.5–2 hours each way.', food: 'Lunch near the Wall.', notes: '',
    },
  ],
  transport: ['Use the metro outside rush hour.'],
  preparation: ['Install a VPN before you arrive.', 'Book major sights in advance.'],
  personalised_notes: ['Plan breaks for children.'],
  verify_before_booking: ['Check opening hours.'],
};

const baseLead = {
  email: 'chinaeastbuddy@gmail.com',
  travelDate: '2026-10-27',
  travelers: 4,
  tripLength: 4,
  arrivalCity: 'Beijing',
  destinationCities: ['Beijing'],
  cities: ['beijing'],
  interests: ['history', 'family'],
  priorities: ['History', 'Family-friendly'],
  helpWith: 'History, Family-friendly',
  contactMethod: 'email',
  locale: 'en',
  sourcePath: '/',
  createdAt: SAMPLE_NOW,
};

export const customerScenarios = [
  { id: 'us-passport-beijing', label: 'US passport, Beijing', lead: { ...baseLead, requestId: '00000000-0000-4000-8000-000000000001', departureCountry: 'United States' } },
  { id: 'uk-passport-beijing', label: 'UK passport, Beijing', lead: { ...baseLead, requestId: '00000000-0000-4000-8000-000000000002', departureCountry: 'United Kingdom' } },
  { id: 'no-country', label: 'Departure country not given', lead: { ...baseLead, requestId: '00000000-0000-4000-8000-000000000003', departureCountry: null } },
];

const page = 'https://chinaeasebuddy.com';
export const sourceScenarios = [
  {
    id: 'google',
    label: 'Google search',
    href: `${page}/china-240-hour-transit-calculator/`,
    referrer: 'https://www.google.com/',
    expect: 'Channel: organic_search (google.com) · Landing page: /china-240-hour-transit-calculator/ · Submitted on: /',
  },
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    href: `${page}/china-240-hour-transit-us-citizens/`,
    referrer: 'https://chatgpt.com/c/abc123?model=x',
    expect: 'Channel: ai_assistant (chatgpt.com) · Landing page: /china-240-hour-transit-us-citizens/ · Submitted on: /',
  },
  {
    id: 'utm',
    label: 'UTM link',
    href: `${page}/alipay-for-foreigners/?utm_source=reddit&utm_medium=social&utm_campaign=oct_launch&email=someone@example.com`,
    referrer: 'https://www.reddit.com/r/travelchina/comments/xyz/?share_id=123',
    expect: 'Channel: utm (reddit / social / oct_launch) · Landing page: /alipay-for-foreigners/ · Submitted on: /',
  },
  {
    id: 'direct',
    label: 'Direct visit',
    href: `${page}/`,
    referrer: '',
    expect: 'Channel: direct · Landing page: / · Submitted on: /',
  },
];

export function leadForSource(scenario, plan = samplePlan) {
  const touch = buildTouch({ href: scenario.href, referrer: scenario.referrer, now: SAMPLE_NOW - 60 * 60 * 1000 });
  return {
    ...customerScenarios[1].lead,
    requestId: `00000000-0000-4000-8000-00000000010${sourceScenarios.indexOf(scenario)}`,
    firstTouch: touch,
    lastTouch: touch,
    leadChannel: touch.channel,
    plan,
  };
}

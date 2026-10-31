import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { TRIP_COST_STYLES, estimateTripCost, formatTripCostRange } from '../src/lib/tripCostEstimate.mjs';

import { renderPlanningHelp } from './render-planning-help.mjs';
import { createAmapGuideRenderer, renderAmapInline } from './render-amap-guide.mjs';
import { plainText, quickAnswerText } from '../src/lib/amapGuideMarkup.mjs';
const planningHelp = JSON.parse(await readFile('src/data/planningHelp.json', 'utf8'));
const passCopy = JSON.parse(await readFile('src/i18n/locales/en.json', 'utf8')).translation;
const guideRelatedLinks = JSON.parse(await readFile('src/data/guideRelatedLinks.json', 'utf8'));

const siteUrl = 'https://chinaeasebuddy.com';
const distDir = 'dist';
const source = join(distDir, 'index.html');
const suzhouGuide = JSON.parse(await readFile('src/data/suzhouGuide.json', 'utf8'));
const nanjingGuide = JSON.parse(await readFile('src/data/nanjingGuide.json', 'utf8'));
const daliGuide = JSON.parse(await readFile('src/data/seoPages/3-day-dali-itinerary.json', 'utf8'));
const goldenWeekGuide = JSON.parse(await readFile('src/data/seoPages/china-golden-week-2026-travel-guide.json', 'utf8'));
const greatWallGuide = JSON.parse(await readFile('src/data/seoPages/great-wall-of-china-day-trip-from-beijing.json', 'utf8'));
const emergencyGuideContent = JSON.parse(await readFile('src/data/emergencyGuideContent.json', 'utf8'));
const tripCostEstimatorContent = JSON.parse(await readFile('src/data/tripCostEstimatorContent.json', 'utf8'));
const beijingGuide = JSON.parse(await readFile('src/data/beijingGuide.json', 'utf8'));
const zhangjiajieTianmenUpdate = JSON.parse(await readFile('src/data/zhangjiajieTianmenUpdate.json', 'utf8'));
const sevenDayItineraryContent = JSON.parse(await readFile('src/data/sevenDayItineraryContent.json', 'utf8'));
const tenDayItineraryContent = JSON.parse(await readFile('src/data/tenDayItineraryContent.json', 'utf8'));
const shanghaiVisitPlanning = JSON.parse(await readFile('src/data/shanghaiVisitPlanning.json', 'utf8'));
const chongqingVisitPlanning = JSON.parse(await readFile('src/data/chongqingVisitPlanning.json', 'utf8'));
const firstTimeItineraryContent = JSON.parse(await readFile('src/data/firstTimeItineraryContent.json', 'utf8'));
const pandaBaseGuide = JSON.parse(await readFile('src/data/pandaBaseGuide.json', 'utf8'));
const didiPaymentGuide = JSON.parse(await readFile('src/data/didiPaymentGuide.json', 'utf8'));
const wechatPayGuide = JSON.parse(await readFile('src/data/wechatPayGuide.json', 'utf8'));
const beijingAirportGuide = JSON.parse(await readFile('src/data/seoPages/beijing-airport-to-city-guide.json', 'utf8'));
const mapsComparisonGuide = JSON.parse(await readFile('src/data/mapsGuide.json', 'utf8'));
const transit240Guide = JSON.parse(await readFile('src/data/seoPages/china-240-hour-visa-free-transit-2026.json', 'utf8'));
const tenPayGoGuide = JSON.parse(await readFile('src/data/tenpaygoGuide.json', 'utf8'));
const accommodationRegistrationGuide = JSON.parse(await readFile('src/data/seoPages/china-online-accommodation-registration-12367.json', 'utf8'));
const visaFreeCheckerGuide = JSON.parse(await readFile('src/data/seoPages/china-visa-free-checker.json', 'utf8'));
// Online arrival card guide; the same file feeds the React route in src/components/PolicyPage.tsx
const arrivalCardGuide = JSON.parse(await readFile('src/data/seoPages/china-online-arrival-card-2026.json', 'utf8'));
// 240-hour transit question pages; the same file feeds src/components/TransitAnswerPage.tsx
const transitAnswers = JSON.parse(await readFile('src/data/transitAnswers.json', 'utf8'));
const calculatorContent = JSON.parse(await readFile('src/data/transitCalculatorContent.json', 'utf8'));
const amapEnglishSetup = JSON.parse(await readFile('src/data/amapEnglishSetup.json', 'utf8'));
const alipayMetroGuide = JSON.parse(await readFile('src/data/alipayMetroGuide.json', 'utf8'));
const wechatVerificationGuide = JSON.parse(await readFile('src/data/wechatVerificationGuide.json', 'utf8'));
const airportArrivalGuide = JSON.parse(await readFile('src/data/airportArrivalGuide.json', 'utf8'));
const trainGuide = JSON.parse(await readFile('src/data/trainGuide.json', 'utf8'));
const budgetGuide = JSON.parse(await readFile('src/data/budgetGuide.json', 'utf8'));
const appsHubGuide = JSON.parse(await readFile('src/data/appsHubGuide.json', 'utf8'));
const hotelsGuide = JSON.parse(await readFile('src/data/hotelsGuide.json', 'utf8'));
const checklistGuide = JSON.parse(await readFile('src/data/checklistGuide.json', 'utf8'));
const shenzhenItineraryPlanning = JSON.parse(await readFile('src/data/shenzhenItineraryPlanning.json', 'utf8'));
const layoverAirportPlanning = JSON.parse(await readFile('src/data/layoverAirportPlanning.json', 'utf8'));
const didiGuide = JSON.parse(await readFile('src/data/didiGuide.json', 'utf8'));
// Extra sections, FAQs and in-body links (including content folded in from guides that now 301 here);
// src/components/PolicyPage.tsx applies the same file.
const guideContentAdditions = JSON.parse(await readFile('src/data/guideContentAdditions.json', 'utf8'));

// The WeChat how-to page still inherits the WeChat Pay guide's pre-October 31 sections, FAQs and sources.
// It is kept here, unchanged, only for that page; /wechat-pay-for-foreigners/ reads src/data/wechatPayGuide.json.
const legacyWechatHowToMeta = {
    title: 'WeChat Pay for Foreigners (2026): Cards, Fees & Setup',
    heading: 'WeChat Pay for Foreigners: Setup and Payment Guide (2026)',
    description:
      'Foreigners can use WeChat Pay in China by linking an eligible international card. See how fees work, how to scan merchant QR codes and fix failed payments.',
    quickAnswer:
      'Foreign visitors, including US citizens, may be able to use WeChat Pay in mainland China when the payment feature is available on their account and an eligible international card passes identity, issuer, and transaction checks. Register the standard WeChat app with a mobile number you can access, open the payment or wallet area shown in your version, add the card, and complete any requested verification. Set it up before departure and keep Alipay, a physical card, and some RMB as backups.',
    lastReviewed: 'October 8, 2026',
    lastModified: '2026-10-08',
    article: true,
    contentSections: [
      {
        title: 'Can foreigners use WeChat Pay in China?',
        items: [
          'Eligible foreign visitors can use WeChat Pay for supported merchant purchases after completing the account, identity, card, and issuer checks shown in the app.',
          'A Chinese bank account is not always required for eligible merchant payments funded by a supported international card.',
          'Availability can vary by account, card issuer, merchant, transaction type, app version, and current risk controls.',
          'Personal transfers, red packets, balance functions, and some mini-program payments may remain unavailable even when ordinary merchant payments work.',
        ],
      },
      {
        title: 'What foreigners need to set up WeChat Pay',
        items: [
          'The standard WeChat app from an official app store, rather than a separate regional wallet product.',
          'A mobile number that can receive verification messages while you travel.',
          'An eligible debit or credit card issued outside the Chinese mainland.',
          'Your passport details if identity verification is requested.',
          'Access to your bank app, SMS, or other card-approval method.',
          'Alipay, a physical bank card, and a modest amount of RMB as payment backups.',
        ],
      },
      {
        title: 'Set up WeChat Pay before your flight',
        ordered: true,
        items: [
          'Download the standard WeChat app from your phone\'s official app store and register with a mobile number you can continue to access.',
          'Open Me and look for Services, Pay and Services, or Wallet. The label and location can vary by region, account, and app version.',
          'Choose Wallet or Cards, then add your international card using the details requested in the app.',
          'Complete identity verification exactly as prompted. Make sure your name and passport details match your documents.',
          'Approve any verification request from your card issuer and review the terms, supported uses, limits, and fees shown in the app.',
          'Keep the registered phone number, passport, and bank-verification method available during the trip.',
        ],
      },
      {
        title: 'How to pay by QR code',
        items: [
          'When the merchant scans you, open the payment code inside WeChat Pay and let the merchant scan it.',
          'When you scan the merchant, use Scan, confirm the merchant name, enter the amount if required, and review it before paying.',
          'If a QR code is for a personal transfer rather than a merchant payment, your international card may not be available. Ask for a merchant code or another payment method.',
          'Never hand an unlocked phone to a stranger or share a payment password or verification code.',
        ],
      },
      {
        title: 'What may be different with an international card',
        items: [
          'Merchant purchases may be available while person-to-person transfers, red packets, wallet balance functions, or other financial features remain restricted.',
          'Availability depends on the account, card network, issuer, merchant, transaction, and current WeChat Pay rules.',
          'A card that was added successfully can still be declined later by the issuer or payment risk controls.',
          'Use the card and feature information shown inside your account as the current source of truth.',
        ],
      },
      {
        title: 'WeChat Pay cross-border access, Weixin Pay, and regional wallets',
        items: [
          'Weixin Pay is the payment service inside the Weixin or WeChat ecosystem for the Chinese mainland.',
          'For an overseas visitor, cross-border access usually means using an eligible international card or a supported regional wallet for permitted merchant payments; it does not unlock every wallet feature.',
          'Regional products such as WeChat Pay HK follow their own eligibility, funding, and cross-border rules.',
          'Do not assume instructions for a regional wallet match the standard international WeChat account on your phone.',
          'Follow the payment menu and terms shown in your exact app version and region.',
        ],
      },
      {
        title: 'Fees, limits, and exchange rates',
        items: [
          'China\'s current government guide says card brands, payment limits, and charging standards can vary by payment product. Use the current in-app prompt and service agreement for the transaction you are about to approve.',
          'Review the amount, any service fee, and the selected card on the confirmation screen before approving payment.',
          'Your card network and issuing bank may determine the exchange rate and may add a foreign-transaction or currency-conversion fee.',
          'Transaction and account limits can change after verification or risk checks.',
          'Do not rely on an old fixed fee or limit from a blog; check the current in-app notice and your card issuer.',
        ],
      },
      {
        title: 'If WeChat Pay does not work',
        ordered: true,
        items: [
          'Confirm that the payment feature and linked card still appear in your account.',
          'Check whether identity verification or an issuer approval request is incomplete.',
          'Make sure you are paying a merchant rather than trying a personal transfer.',
          'Check your mobile connection and retry only after confirming that the first attempt did not complete.',
          'Try another eligible card, Alipay, a physical card, or RMB cash.',
          'Use WeChat Pay support for account-specific restrictions because ChinaEase Buddy cannot access or change your wallet.',
        ],
      },
      {
        title: 'Useful payment phrases',
        items: [
          '可以用微信支付吗？ — Can I pay with WeChat Pay?',
          '请扫我的付款码。 — Please scan my payment code.',
          '这个是商家收款码吗？ — Is this a merchant payment code?',
          '支付失败了，可以换一种方式吗？ — My payment failed. Can I pay another way?',
        ],
      },
    ],
    faqs: [
      ['Can foreigners use WeChat Pay in China?', 'Yes, when the payment feature is available on the account and an eligible international card passes identity, issuer, and payment checks. Availability can vary by account and transaction.'],
      ['Can US citizens use WeChat Pay in China?', 'US citizenship does not by itself prevent access. A US traveler may be able to use an eligible international card for supported merchant payments after completing the account, identity, issuer, and transaction checks shown in WeChat. Availability still varies by account, card, merchant, and payment type.'],
      ['Does WeChat Pay charge fees for foreign cards?', 'Fees are not safely described by one universal rule. China\'s government guide says charging standards and limits can vary by payment product. Review the fee displayed before approval, the current service agreement, and any foreign-transaction or currency-conversion fee charged separately by your card issuer.'],
      ['Do I need a Chinese bank account for WeChat Pay?', 'Foreign visitors may be able to fund eligible merchant payments with a supported international card, so a Chinese bank account is not always required. Follow the options shown in your account.'],
      ['Is Weixin Pay the same as WeChat Pay for foreign visitors?', 'Weixin Pay is the mainland payment service within the Weixin and WeChat ecosystem. The name and menu shown can depend on your app version, account region, and product. Regional wallets such as WeChat Pay HK have separate eligibility and cross-border rules.'],
      ['Can I set up WeChat Pay before arriving in China?', 'Yes. Install the standard WeChat app, register, look for the payment or wallet area, add your card, and complete verification before departure if the feature is available.'],
      ['Why can I not see Wallet or Pay and Services?', 'Menu names and payment availability can differ by region, account, identity status, and app version. Update the official app and use WeChat support if the payment feature is unavailable.'],
      ['Can I send money to a person with an international card?', 'Do not assume that you can. Merchant purchases may work while personal transfers, red packets, and balance features remain restricted for an international-card setup.'],
      ['What should I do if WeChat Pay is declined?', 'Check verification and issuer approval, confirm that the QR code is for a merchant, then use another prepared payment method rather than repeatedly retrying an uncertain transaction.'],
      ['Should I choose WeChat Pay or Alipay for China?', 'Prepare both if possible. Many first-time visitors use Alipay as the primary wallet and WeChat Pay as a backup, while also carrying a physical card and some RMB.'],
    ],
    sourceLinks: [
      ['Tencent: cross-border payment support through Weixin Pay', 'https://www.tencent.com/tencent-showcases-future-of-finance-at-hong-kong-fintech-week-2025/'],
      ['WeChat official Google Play listing', 'https://play.google.com/store/apps/details?id=com.tencent.mm'],
      ['China government: Guide to Payment Services in China', 'https://english.www.gov.cn/2025special/bizexpatsinchina2025'],
    ],
  };

const pageMeta = {
  plan: {
    lastModified: '2026-10-23',
    title: 'Get your free personalised China itinerary | ChinaEase Buddy',
    description:
      'Tell us your travel dates, cities and interests and get a free personalised China itinerary. Instant route preview, full day-by-day plan by email. No payment, no account.',
    customBody: `
    <main id="static-plan-content" style="max-width: 640px; margin: 0 auto; padding: 32px 20px; color: #122022; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <p style="margin: 0 0 8px; color: #0F5257; font-size: 13px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;">Free personalised China itinerary</p>
      <h1 style="margin: 0 0 16px; font-size: clamp(1.75rem, 5vw, 2.5rem); line-height: 1.12; letter-spacing: -0.02em;">Tell us your dates and cities &mdash; get your free China itinerary.</h1>
      <p style="margin: 0 0 16px; color: #536365; line-height: 1.6;">Share your travel dates, the cities you want to visit and what you enjoy. You will see an instant route preview, and the full day-by-day itinerary is sent to your email. No payment and no account required.</p>
      <ul style="margin: 0 0 20px; padding-left: 20px; color: #536365; line-height: 1.8;">
        <li>A route built around your dates, cities and interests &mdash; not a template.</li>
        <li>Instant Day 1 preview, full plan by email.</li>
        <li>Practical transport, timing, payment and arrival checks for first-time visitors.</li>
      </ul>
      <p style="margin: 0 0 24px;"><a href="/" style="display: inline-flex; border-radius: 999px; background: #0F5257; color: #fffdf8; padding: 12px 18px; font-weight: 700; text-decoration: none;">Open ChinaEase Buddy</a></p>
      <p style="margin: 0; color: #6b7678; font-size: 0.85rem; line-height: 1.7;">ChinaEase Buddy is a digital travel toolkit. It is not an official travel authority, visa service, immigration service, medical service, legal service, financial service, hotel booking service, or flight booking service. Always confirm important travel, payment, health and entry information with official sources or service providers.</p>
    </main>
  `,
  },
  guides: {
    title: 'China Travel Guides for Foreigners: Visas, Apps & Itineraries',
    heading: 'China Travel Guides for Foreigners: Start Here',
    description:
      'Plan a China trip with practical guides for visa-free entry, airport arrival, payments, apps, transport, hotels, food, safety and itineraries.',
    quickAnswer:
      'Before booking, check entry rules and your arrival plan. Next, prepare mobile data, payments, maps and transport. Then choose a 7-, 10- or 14-day route and open the city guides that match your trip. Each section below links directly to the relevant guide or free tool.',
    lastReviewed: 'October 10, 2026',
    lastModified: '2026-10-21',
    sections: [
      ['China eSIM & Internet Guide', 'Choose, install, activate, and troubleshoot mobile data for a trip to mainland China.', '/china-esim-internet-guide/'],
      ['China SIM Card for Foreigners', 'Compare eSIM and physical SIM options, passport registration, mainland carriers, airport purchase, and top-ups.', '/china-sim-card-for-foreigners/'],
      ['China 240-Hour Visa-Free Transit 2026', 'Check 57 eligible countries, 65 designated ports, permitted stay areas, route rules, and the official 10-day clock.', '/china-240-hour-visa-free-transit-2026/'],
      ['China Visa-Free Checker', 'Compare verified ordinary-passport, 30-day, transit, mutual-agreement, and Hainan rules for a planned route.', '/china-visa-free-checker/'],
      ['China 240-Hour Visa-Free Transit Calculator', 'Enter your recorded entry date to calculate the transit exit deadline in China time. Check eligibility separately.', '/china-240-hour-transit-calculator/'],
      ['How to Use TenPayGo in China: Sign Up, Link a Card, Pay', 'Sign up with an email, link a foreign card or Apple Pay, pay at WeChat Pay shops, and top up the Shenzhen Transit Card.', '/tenpaygo-for-tourists/'],
      ['China Visa-Free Travel Guide', 'Compare 30-day visa-free entry, 240-hour visa-free transit, and the documents each route requires.', '/china-visa-free-travel-guide/'],
      ['China Arrival Card Online 2026', 'Use the free official NIA form, check exemptions, and prepare your entry details.', '/china-online-arrival-card-2026/'],
      ['China Airport Arrival Guide', 'Follow immigration, baggage, customs, mobile data, payment, and airport-transfer steps after landing.', '/china-airport-arrival-guide/'],
      ['China Hotels for Foreigners', 'Book with a foreign passport, check in smoothly, understand registration, and handle common hotel problems.', '/china-hotels-for-foreigners/'],
      ['China Food Ordering Guide', 'Use QR and photo menus, explain dietary needs, handle serious food allergies, and pay.', '/china-food-ordering-guide/'],
      ['Chinese Travel Phrases', 'Save practical Mandarin for transport, hotels, food, payment, and emergencies.', '/chinese-travel-phrases/'],
      ['China Travel Safety Guide', 'Understand crime, scams, transport, local laws, health, weather, and emergency planning.', '/china-travel-safety-guide/'],
      ['China Travel Budget', 'Estimate daily costs, trip totals, transport, food, hotels, and seasonal price changes.', '/china-travel-budget/'],
      ['China Travel Apps', 'Prepare Alipay, WeChat, Amap, Didi, and Trip.com before arrival.', '/china-travel-apps/'],
      ['AMap in English', 'Search places, plan walking and metro routes, and navigate stations and entrances.', '/amap-english-mode-guide-2026/'],
      ['China Metro Guide', 'Buy tickets, pass security, transfer lines, and choose the correct station exit.', '/china-metro-guide/'],
      ['DiDi in China for Foreigners', 'Book rides, find the correct pickup point, verify the car, and handle payment.', '/didi-in-china-for-foreigners/'],
      ['China Train Travel Guide', 'Book high-speed train tickets with a foreign passport and board with confidence.', '/china-train-travel-guide/'],
      ['7-Day China Itinerary', 'Compare a fast Beijing–Xi\'an–Shanghai route with a more relaxed two-city trip.', '/7-day-china-itinerary/'],
      ['10-Day China Itinerary', 'Follow a practical first-trip route through Beijing, Xi\'an, and Shanghai.', '/10-day-china-itinerary/'],
      ['14-Day China Itinerary', 'Build a balanced two-week route through Beijing, Xi\'an, Chengdu, and Shanghai.', '/14-day-china-itinerary/'],
      ['Beijing vs Shanghai', 'Choose the better first stop based on history, city style, trip length, flights, and onward route.', '/beijing-vs-shanghai/'],
      ['3-Day Beijing Itinerary', 'Plan the Palace Museum, Great Wall, Temple of Heaven, hutongs, bookings, and transport.', '/3-day-beijing-itinerary/'],
      ['3-Day Shanghai Itinerary', 'Group the Bund, Yuyuan Garden, Wukang Road, Pudong, museums, food, and transport.', '/3-day-shanghai-itinerary/'],
      ['3-Day Xi\'an Itinerary', 'Plan the Terracotta Army, city wall, Muslim Quarter, museums, pagodas, and transport.', '/3-day-xian-itinerary/'],
      ['3-Day Chongqing Itinerary', 'Plan Hongya Cave, Liziba monorail, museums, hotpot, rivers, hills, and transport.', '/3-day-chongqing-itinerary/'],
      ['3-Day Chengdu Itinerary', 'Plan pandas, teahouses, Sichuan food, museums, neighbourhoods, and a day-trip option.', '/3-day-chengdu-itinerary/'],
      ['3-Day Guilin and Yangshuo Itinerary', 'Plan the Li River, Yangshuo, Yulong River, karst scenery, transport, and weather alternatives.', '/3-day-guilin-yangshuo-itinerary/'],
      ['3-Day Zhangjiajie Itinerary', 'Plan Wulingyuan, Zhangjiajie National Forest Park, Tianmen Mountain, hotels, transport, and weather alternatives.', '/3-day-zhangjiajie-itinerary/'],
      ['3-Day Shenzhen Itinerary', 'Plan Futian, Shenzhen Museum, OCT-LOFT, Shenzhen Bay, Nantou, hotels, Metro travel, and a flexible third day.', '/3-day-shenzhen-itinerary/'],
      ['3-Day Guangzhou Itinerary', 'Plan Chen Clan Ancestral Hall, Yongqingfang, Shamian, Canton Tower, dim sum, hotels, Metro travel, and transport.', '/3-day-guangzhou-itinerary/'],
      ['3-Day Hangzhou Itinerary', 'Plan West Lake, Lingyin, Longjing tea, the Grand Canal, Hefang Street, hotels, trains, and weather alternatives.', '/3-day-hangzhou-itinerary/'],
      ['3-Day Suzhou Itinerary', 'Plan classical gardens, Pingjiang Road, Suzhou Museum, canals, food and Shanghai train connections.', '/3-day-suzhou-itinerary/'],
      ['3-Day Nanjing Itinerary', 'Plan Sun Yat-sen Mausoleum, Ming Xiaoling, museums, the memorial, city walls and Qinhuai River.', '/3-day-nanjing-itinerary/'],
      ['3-Day Dali Itinerary', 'Plan Dali Old Town, Three Pagodas, Erhai Lake, Xizhou and a flexible Cangshan day.', '/3-day-dali-itinerary/'],
      ['DiDi Payment for Foreigners', 'Troubleshoot foreign card and wallet payment for a ride in China.', '/didi-payment-for-foreigners/'],
      ['Beijing Airport to City Guide', 'Compare PEK and PKX express trains, taxis and late arrival transfers.', '/beijing-airport-to-city-guide/'],
      ['AMap vs Google Maps in China', 'Choose local maps, verify entrances and save Chinese addresses.', '/amap-vs-google-maps-china/'],
      ['China Golden Week 2026 Travel Guide', 'Plan October 1–7 trains, hotels, attractions, crowds and a flexible first-time route.', '/china-golden-week-2026-travel-guide/'],
      ['Great Wall Day Trip from Beijing', 'Compare Mutianyu and Badaling, booking layers, transport, walking and return timing.', '/great-wall-of-china-day-trip-from-beijing/'],
      ['Chengdu Panda Base Guide', 'Book official tickets, choose South or West Gate and plan a manageable viewing route.', '/chengdu-panda-base-guide/'],
      ['Best Time to Visit China', 'Compare seasons, months, regions, crowds, public holidays, and weather risks.', '/best-time-to-visit-china/'],
      ['Alipay for Foreigners', 'What foreign visitors should know before trying Alipay in China.', '/alipay-for-foreigners/'],
      ['WeChat Pay for Foreigners', 'Set up an eligible international card, pay by QR code, and prepare a backup.', '/wechat-pay-for-foreigners/'],
      ['China Payment Guide', 'Practical payment reminders for Alipay, WeChat Pay, cards, and cash backup.', '/china-payment-guide/'],
      ['China Travel Checklist', 'A first-time visitor checklist for apps, payments, hotels, phrases, and emergency basics.', '/china-travel-checklist/'],
      ['Emergency Numbers in China', 'Know 110, 120, and 119, plus simple phrases for urgent situations.', '/china-emergency-numbers/'],
      ['Paying in China', 'Set up Alipay and WeChat Pay, understand fees, and prepare backups.', '/china-payment-guide/'],
      ['First-Time China Itineraries', 'Choose a practical 7, 10, or 14-day route.', '/china-itinerary-first-time-7-10-14-days/'],
      ['NIA 12367 Accommodation Registration', 'Register a private or non-hotel stay through the currently available official channels.', '/nia-12367-online-accommodation-registration-guide/'],
      ['Amap English Mode', 'Switch languages, search destinations, and save China-ready addresses.', '/amap-english-mode-guide-2026/'],
      ['Alipay Metro QR', 'Activate the city-specific transport service and prepare ticket backups.', '/alipay-metro-qr-transport-code-guide/'],
      ['China Travel AI Itinerary Generator', 'Turn dates, interests, pace, and budget into a practical route and booking checklist.', '/china-travel-ai-itinerary-generator/'],
      ['WeChat Verification Without a Friend', 'Use official registration and account-recovery paths safely.', '/wechat-verification-without-friend-qr-2026/'],
      ['FAQ', 'Short answers about ChinaEase Buddy, paid passes, travel tools, and service limits.', '/faq/'],
    ],
  },
  'china-visa-free-travel-guide': {
    title: 'China Visa-Free Travel Guide (2026) | ChinaEase Buddy',
    heading: 'China Visa-Free Travel Guide for Tourists (2026)',
    description:
      'Eligible ordinary-passport holders can visit China visa-free for up to 30 days for approved purposes, or use 240-hour transit en route to a third country.',
    quickAnswer:
      'First decide which policy fits your passport and route. China\'s ordinary visa-free entry lets eligible ordinary-passport holders visit for up to 30 days for approved purposes without needing a third-country itinerary. The separate 240-hour visa-free transit policy is available to eligible nationals only when they travel through mainland China to a third country or region, use an approved port, remain within the permitted area, and hold a confirmed onward ticket. A return trip such as London–Beijing–London is not third-country transit. Policies can change, and admission is still subject to border inspection, so verify your nationality, passport, purpose, route, ports, and exact dates with the official sources immediately before travel.',
    lastReviewed: 'September 20, 2026',
    lastModified: '2026-09-20',
    article: true,
    contentSections: [
      {
        title: 'Choose the correct entry route first',
        ordered: true,
        items: [
          'Ordinary visa-free entry: use this when your passport nationality is on the current visa-waiver list, your purpose is covered, and your intended stay is within the allowed period. A third-country route is not required.',
          '240-hour visa-free transit: use this only when your eligible itinerary continues from mainland China to a different country or region, through an approved port and within the permitted stay area.',
          '24-hour visa-free transit: this generally covers an international connection of no more than 24 hours while remaining in the restricted port area. Leaving that area requires a temporary entry permit.',
          'Visa required: arrange the correct visa in advance when your passport, purpose, route, port, destination area, or stay length does not satisfy a visa-free policy.',
          'Do not treat an airline ticket, arrival card, hotel booking, or this guide as approval to enter. Border inspection authorities make the final decision.',
        ],
      },
      {
        title: 'Ordinary visa-free entry: up to 30 days',
        items: [
          'As reviewed on 20 September 2026, China\'s Ministry of Foreign Affairs lists 50 nationalities whose valid ordinary-passport holders can enter without a visa for up to 30 days for business, tourism, family or friend visits, exchange, or transit.',
          'The route does not need to continue to a third country. Eligible travelers may depart for China from any country or region and may leave for the same country they came from.',
          'The 30-day stay is calculated from the day after entry and covers 30 calendar days, according to the Ministry of Foreign Affairs FAQ.',
          'No advance declaration to a Chinese embassy or consulate is required, but travelers should carry evidence consistent with the purpose of entry, such as flight tickets, accommodation reservations, and an itinerary or invitation when relevant.',
          'Work, long-term study, news reporting, and other purposes outside the waiver still require the appropriate visa or approval.',
          'Most of the listed waivers are scheduled to run through 31 December 2026; the official FAQ gives different validity for Brunei and Russia. Recheck the current list and policy period before every trip.',
        ],
      },
      {
        title: '240-hour visa-free transit: the route is essential',
        items: [
          'As reviewed on 20 September 2026, the National Immigration Administration lists 57 eligible nationalities, 65 approved ports, and permitted stay areas across 24 provincial-level regions.',
          'You need a valid ordinary passport and a confirmed onward international air, sea, or train ticket showing a seat and departure date within the permitted period.',
          'Your itinerary must transit mainland China on the way to a third country or region. The destination after mainland China must differ from the place from which you entered mainland China.',
          'You must enter through an approved port, leave through an approved port allowed for the itinerary, and remain inside the policy\'s designated area during the stay.',
          'Tourism, business, visits, and family reunions are allowed within the designated area. Work, study, and news reporting still require prior approval and the appropriate visa.',
          'Ten days is a maximum, not a guaranteed stay. Border officers examine the passport, route, ticket, purpose, and other circumstances at entry.',
        ],
      },
      {
        title: 'Route examples: what third-country transit means',
        items: [
          'London → Beijing → Tokyo: potentially qualifies as third-country transit when the passport, ports, tickets, dates, purpose, and permitted area all satisfy the current policy.',
          'London → Beijing → London: does not meet the third-country transit route requirement because the traveler returns to the same country.',
          'New York → Shanghai → Seoul: potentially qualifies for an eligible United States passport holder when every other condition is met.',
          'Sydney → Guangzhou → Bangkok: potentially qualifies for transit, although an eligible Australian ordinary-passport holder may also qualify for ordinary 30-day visa-free entry. Use the policy that accurately matches the journey.',
          'Separate tickets can create airline and missed-connection risks. Confirm that the carrier will check you in for the full route and that you can show the confirmed onward departure.',
        ],
      },
      {
        title: 'Documents to keep ready',
        ordered: true,
        items: [
          'Original valid ordinary passport. Check that its validity covers the intended stay and that the document type is accepted by the policy you plan to use.',
          'Confirmed inbound and outbound or onward bookings. Transit travelers should keep the ticket showing the confirmed seat and departure date to the third country or region.',
          'Accommodation reservation with the hotel\'s name, address, phone number, and Chinese-language details available offline.',
          'A simple itinerary and evidence matching the stated travel purpose; carry an invitation letter when it is relevant to a business, family, or exchange visit.',
          'Official policy pages saved offline, especially the current country list, approved ports, permitted areas, and policy dates applicable to the journey.',
          'Arrival-card confirmation when required. The National Immigration Administration\'s official online arrival-card service is free and does not replace entry eligibility.',
        ],
      },
      {
        title: 'Check the port and permitted area before booking',
        items: [
          'The 240-hour policy does not turn every mainland China airport, railway station, or seaport into an eligible entry or exit point.',
          'The permitted movement area varies by the port and region. Do not assume the policy allows unrestricted travel throughout mainland China.',
          'Check every mainland segment, including domestic connections. A connecting flight or train can take you outside the area allowed by the port through which you entered.',
          'Use the National Immigration Administration\'s current table of approved ports and permitted stay areas, then confirm the itinerary with the operating carrier before buying a restrictive ticket.',
          'If the route changes because of a cancellation or missed connection, contact the carrier and immigration authorities immediately rather than improvising a new domestic route.',
        ],
      },
      {
        title: 'At airline check-in and border inspection',
        ordered: true,
        items: [
          'Tell the airline which entry basis you intend to use and present the full confirmed itinerary. Check-in staff may need time to verify the current rule.',
          'At the China port, follow the sign or staff instruction for visa-free or temporary entry processing rather than joining a lane based only on an old airport video.',
          'Present the passport, onward booking, accommodation, and supporting travel-purpose documents clearly and consistently.',
          'Answer questions about the route, cities, stay length, and departure plan accurately. Do not describe a trip as transit when the ticket returns to the same country.',
          'Keep the entry record and confirm the permitted stay and area. If you are uncertain, ask the border officer before leaving the inspection area.',
        ],
      },
      {
        title: 'Common mistakes to avoid',
        items: [
          'Confusing ordinary 30-day visa-free entry with 240-hour visa-free transit. They have different nationality lists and route conditions.',
          'Assuming that any 10-day China stay is visa-free. Transit requires an eligible nationality, third-country route, approved ports, confirmed onward ticket, permitted area, and acceptable purpose.',
          'Counting a return to the origin country as third-country transit.',
          'Booking a domestic segment that leaves the permitted transit area or using a port not included in the current official table.',
          'Relying on a social-media country list or an old screenshot after the policy has changed.',
          'Treating the free arrival card as a visa application or entry approval.',
          'Planning work, study, or reporting activity under a tourist or transit exemption.',
        ],
      },
      {
        title: 'Final verification checklist',
        items: [
          'Passport nationality and document type are on the current official list for the policy you plan to use.',
          'Travel purpose is permitted and the stay is within the current maximum.',
          'For 240-hour transit, the origin and onward country or region are different and the ticket is confirmed.',
          'Every entry, domestic connection, destination, and exit fits the approved ports and permitted area.',
          'Accommodation, itinerary, onward ticket, and policy evidence are available offline.',
          'The airline and an official Chinese government, embassy, or consular source have been checked again immediately before departure.',
        ],
      },
    ],
    faqs: [
      ['Is China visa-free for tourists in 2026?', 'China offers ordinary visa-free entry to eligible ordinary-passport holders and separate visa-free transit policies. Eligibility depends on nationality, passport type, purpose, route, port, permitted area, stay length, and travel dates.'],
      ['What is the difference between 30-day visa-free entry and 240-hour transit?', 'Ordinary 30-day visa-free entry does not require a third-country route when the traveler meets that policy. The 240-hour policy requires eligible transit through mainland China to a different country or region and is limited to approved ports and permitted areas.'],
      ['Does London to Beijing to London qualify for 240-hour visa-free transit?', 'No. It returns to the same country and therefore does not meet the third-country or region transit requirement.'],
      ['Can a US passport holder visit China without a visa?', 'A United States passport holder is on the current 240-hour transit list but not the current ordinary 30-day unilateral visa-waiver list. The traveler must meet every transit condition or obtain the appropriate visa.'],
      ['Can UK and Australian passport holders enter China visa-free?', 'As reviewed on 20 September 2026, the Ministry of Foreign Affairs lists the United Kingdom and Australia among the countries eligible for ordinary visa-free entry of up to 30 days for covered purposes. Recheck the official list and validity period before travel.'],
      ['Can I travel anywhere in China during 240-hour visa-free transit?', 'No. You must remain within the permitted area associated with the approved entry port and use eligible entry and exit ports. Check the current National Immigration Administration table for the exact itinerary.'],
      ['Does completing the China arrival card guarantee entry?', 'No. The arrival card records entry information; it does not replace a visa or visa-free eligibility, and it does not guarantee admission. The final decision is made by border inspection authorities.'],
    ],
    sourceLinks: [
      ['Ministry of Foreign Affairs: FAQs on visa-free entry into China', 'https://www.mfa.gov.cn/wjbzwfwpt/kzx/tzgg/202511/t20251110_11749824.html'],
      ['National Immigration Administration: visa-free transit policies', 'https://en.nia.gov.cn/n147418/n147463/c183412/content.html'],
      ['National Immigration Administration: official arrival-card guidance', 'https://en.nia.gov.cn/n147418/n147463/c191530/content.html'],
      ['Official China online arrival card form', 'https://s.nia.gov.cn/ArrivalCardFillingPC/'],
    ],
  },
  'china-airport-arrival-guide': {
    article: true,
    title: airportArrivalGuide.metaTitle,
    heading: airportArrivalGuide.heading,
    description: airportArrivalGuide.metaDescription,
    quickAnswer: quickAnswerText(airportArrivalGuide.quickAnswer),
    faqs: airportArrivalGuide.faqs.map(({ question, answer }) => [question, plainText(answer)]),
    sourceLinks: airportArrivalGuide.sources.map(({ label, href }) => [label, href]),
    lastReviewed: airportArrivalGuide.reviewed,
    lastModified: airportArrivalGuide.modified,
  },
  'china-hotels-for-foreigners': {
    article: true,
    title: hotelsGuide.metaTitle,
    heading: hotelsGuide.heading,
    description: hotelsGuide.metaDescription,
    quickAnswer: quickAnswerText(hotelsGuide.quickAnswer),
    faqs: hotelsGuide.faqs.map(({ question, answer }) => [question, plainText(answer)]),
    sourceLinks: hotelsGuide.sources.map(({ label, href }) => [label, href]),
    lastReviewed: hotelsGuide.reviewed,
    lastModified: hotelsGuide.modified,
  },
  'china-food-ordering-guide': {
    title: 'How to Order Food in China (2026) | ChinaEase Buddy',
    heading: 'How to Order Food in China: Menu and Allergy Guide (2026)',
    description:
      'You can order food in China without speaking Chinese: use a QR or photo menu and point to the dish. Explain allergies or diet needs and save key phrases.',
    quickAnswer:
      'You can order without speaking Chinese by using a QR menu, a photo menu, or a translation app and pointing to the dish. Confirm the number of dishes, spice level, rice, drinks, and payment before finishing the order. If you have a serious food allergy, show a clinician-reviewed bilingual allergy card, name the exact allergen and its oils, sauces, stocks, and derivatives, ask about shared woks and utensils, and do not eat the dish when staff cannot confirm. A translation app or phrase card is useful communication support, but it is not a medical safeguard.',
    lastReviewed: 'September 20, 2026',
    lastModified: '2026-09-20',
    article: true,
    contentSections: [
      {
        title: 'The simplest way to order',
        ordered: true,
        items: [
          'Choose a restaurant where you can see a paper, wall, photo, counter, or QR menu and where staff can answer questions when you have dietary restrictions.',
          'Open the QR menu in WeChat, Alipay, or your browser when offered. If it does not load, ask for a paper or photo menu instead.',
          'Use photos and translated dish names to shortlist choices, then ask about ingredients, spice level, portion size, and allergens before submitting.',
          'Check the cart or repeat the order with staff. Confirm the quantity of each dish and whether steamed white rice, drinks, or tableware are separate charges.',
          'Pay through the menu or at the counter with Alipay, WeChat Pay, an accepted card, or cash. Keep a second payment method ready.',
        ],
      },
      {
        title: 'QR, photo, paper, and counter menus',
        items: [
          'QR ordering varies by restaurant. The code may open a WeChat mini-program, Alipay mini-program, or ordinary web page; some require a table number or phone verification.',
          'A photo menu is often easier than translating a long dish name, but a picture does not reveal cooking oil, stock, sauce, garnish, or cross-contact risk.',
          'At counter-service restaurants, point to the item and show the quantity with your phone. Check whether you must collect the food when a number is called.',
          'Keep an offline translation tool available, because a menu or mini-program may not offer English and mobile data can fail.',
          'Save the restaurant name and address in Chinese so you can return, share it with companions, or explain your location if help is needed.',
        ],
      },
      {
        title: 'Shared dishes, rice, spice, and portions',
        items: [
          'Many sit-down meals are ordered for the table and shared. Ask the server how many people a dish serves instead of ordering one main dish per person automatically.',
          'Steamed white rice is often ordered separately. Ask for the exact number of bowls you need: 请给我一碗白米饭。',
          'Spice levels are not standardized. “Not spicy” may still include chili oil or pepper, so ask whether the dish itself, sauce, garnish, or hotpot base contains chili.',
          'Cold dishes, tea, tableware, tissues, or snacks placed on the table may be chargeable. Ask before opening or using them if the price matters.',
          'For leftovers, ask 可以打包吗？ (“Can I take this away?”), but refrigerate perishable food promptly and discard it if storage has been unsafe.',
        ],
      },
      {
        title: 'Vegetarian, vegan, and halal needs',
        items: [
          'A dish described as vegetables or 素菜 may still contain meat stock, oyster sauce, lard, egg, or a garnish. Name everything you avoid rather than relying on one label.',
          'For vegetarian food, show: 我是素食者，不吃肉、鱼和海鲜。 Ask separately about broth, sauces, cooking fat, and shared cookware when those matter to you.',
          'For vegan food, also ask the restaurant to exclude egg, dairy, honey, fish sauce, oyster sauce, meat stock, and animal fat as applicable.',
          'For halal food, look for 清真, then confirm pork, lard, alcohol, meat sourcing, and shared utensils according to your requirements. A sign alone may not answer every question.',
          'When staff cannot confirm an ingredient or preparation method, choose a simpler dish or another restaurant instead of guessing.',
        ],
      },
      {
        title: 'Serious food allergies and cross-contact',
        items: [
          'Prepare a clinician-reviewed bilingual allergy card that states the exact allergen, common derivatives, severity, and what must be avoided. Do not rely on automatic translation alone.',
          'Show the card before ordering and ask staff to confirm sauces, oils, marinades, stock, garnish, shared woks, utensils, chopping boards, and fryers.',
          'Use direct wording such as 我对花生严重过敏。 (“I have a severe peanut allergy.”) and ask whether the dish contains peanuts, peanut oil, or peanut sauce.',
          'Cross-contamination can occur even when the main ingredient is absent. If staff appear unsure or the kitchen cannot prevent cross-contact, do not eat the dish.',
          'China\'s updated GB 7718-2025 prepackaged-food label standard includes allergen provisions but takes effect in 2027. In 2026, do not assume allergen declarations are uniform; read the full ingredient list and ask.',
        ],
      },
      {
        title: 'Food and water safety',
        items: [
          'Choose food that is cooked thoroughly and served steaming hot. Avoid raw or undercooked meat, poultry, seafood, eggs, and food that has been sitting lukewarm.',
          'Prefer busy stalls and restaurants where food is prepared fresh. Street food is safer when cooked in front of you and served hot rather than held at room temperature.',
          'Use factory-sealed bottled water or water that has been properly treated when safety is uncertain, and check that the bottle seal is intact.',
          'Wash your hands with soap and water before eating, or use an alcohol-based hand sanitizer when washing is not available.',
          'People who are pregnant, older, very young, or immunocompromised should take particular care with high-risk foods and seek personalized medical advice before travel.',
        ],
      },
      {
        title: 'Payment and receipts',
        items: [
          'Some QR menus combine ordering and payment; others only send the order and require payment at the counter. Check before leaving the table.',
          'Alipay and WeChat Pay are common, but availability and foreign-card transactions vary. Keep a physical card and some RMB as backups.',
          'Confirm the total, service or tableware charges, and any deposit before paying. Ask for a receipt when you need to review the order or claim reimbursement.',
          'If the mobile payment fails, try the second wallet, another linked card, a physical card accepted by the restaurant, or cash rather than repeatedly submitting the same charge.',
        ],
      },
      {
        title: 'If an allergic reaction starts',
        items: [
          'Treat breathing difficulty, throat or tongue swelling, faintness, or a rapidly worsening reaction as an emergency. Anaphylaxis can be life-threatening and progress quickly.',
          'Follow your personal emergency plan and use your prescribed adrenaline auto-injector immediately if instructed to do so; do not wait for a translation app to settle the diagnosis.',
          'Call 120 for an ambulance in China, or ask staff: 请帮我叫救护车，我可能严重过敏。 (“Please call an ambulance; I may be having a severe allergic reaction.”)',
          'Carry prescribed emergency medicine with you, not in checked luggage or back at the hotel, and tell companions where it is and how to help.',
          'This guide is general travel information, not medical advice. Discuss severe allergies and an emergency plan with a qualified clinician before travel.',
        ],
      },
      {
        title: 'Useful Chinese restaurant phrases',
        items: [
          '可以看一下英文菜单吗？ — Can I see an English menu?',
          '请给我看有图片的菜单。 — Please show me a menu with pictures.',
          '这个辣吗？ / 请不要放辣。 — Is this spicy? / Please do not make it spicy.',
          '请给我一碗白米饭。 / 可以打包吗？ — Please give me a bowl of steamed white rice. / Can I take this away?',
          '我对花生严重过敏。 — I have a severe peanut allergy.',
          '这道菜里有花生、花生油或花生酱吗？ — Does this contain peanuts, peanut oil, or peanut sauce?',
          '请不要使用含花生的调料、油或厨具。 — Do not use sauces, oil, or utensils containing peanuts.',
          '我不吃猪肉。 / 我是素食者，不吃肉、鱼和海鲜。 — I do not eat pork. / I am vegetarian; I do not eat meat, fish, or seafood.',
        ],
      },
      {
        title: 'Common mistakes to avoid',
        items: [
          'Assuming every QR menu has English, accepts a foreign phone number, or completes payment automatically.',
          'Ordering from a photo without checking hidden ingredients, cooking oil, sauce, stock, garnish, or cross-contact.',
          'Treating “vegetable,” 素菜, 清真, or a translated label as a complete guarantee for a dietary or medical requirement.',
          'Using a generic translation card for a severe allergy without clinician review, exact allergen names, derivatives, and an emergency plan.',
          'Relying on one payment app, ordering too many shared dishes, or forgetting that rice may need to be ordered separately.',
        ],
      },
    ],
    faqs: [
      ['Can tourists order food in China without speaking Chinese?', 'Yes. Use a QR, paper, or photo menu; point to the dish; use an offline translation app; and show short Chinese phrases. Confirm the item, quantity, spice level, rice, and total before submitting the order.'],
      ['Do restaurants in China have English menus?', 'Some tourist-area, hotel, chain, and larger restaurants do, but many local restaurants do not. A photo menu, translation app, and saved Chinese phrases are useful backups.'],
      ['How do QR restaurant menus work in China?', 'Scan the table code with WeChat, Alipay, or your phone camera. It may open a mini-program or web page where you choose items and sometimes pay. If it requires unsupported verification or does not load, ask for a paper or photo menu.'],
      ['Is Chinese food always spicy?', 'No. Chinese cuisines vary greatly, and many dishes are mild. Ask 这个辣吗？ and 请不要放辣, while remembering that chili may also appear in oil, sauce, garnish, or hotpot base.'],
      ['How do I explain vegetarian, vegan, or halal needs?', 'Name the specific ingredients and preparation methods you avoid. Ask about stock, sauces, lard, egg, dairy, alcohol, meat sourcing, and shared cookware rather than relying only on a broad label.'],
      ['How should I handle a severe food allergy in China?', 'Carry a clinician-reviewed bilingual allergy card and prescribed emergency medicine, ask about exact ingredients and cross-contact, and do not eat when staff cannot confirm. Follow your medical action plan and call 120 for a severe reaction.'],
      ['How do tourists pay at restaurants in China?', 'Many restaurants accept Alipay or WeChat Pay, while some accept cards or cash. The QR menu may collect payment or you may pay at the counter. Keep at least one backup method.'],
    ],
    sourceLinks: [
      ['CDC: food and drink safety while traveling', 'https://wwwnc.cdc.gov/travel/page/food-water-safety'],
      ['China National Health Commission: GB 7718-2025 FAQ', 'https://www.nhc.gov.cn/sps/c100087/202509/bc824a504ec34c27883da73f14c20d44.shtml'],
      ['China Customs: GB 7718-2025 standard record', 'https://jckspj.customs.gov.cn/spj/2024-07/25/article_2025121606074757815.html'],
      ['NHS: anaphylaxis symptoms and emergency action', 'https://www.nhs.uk/conditions/anaphylaxis/'],
      ['People\'s Bank of China: payment guide for visitors', 'https://english.www.gov.cn/news/202403/15/content_WS65f3b5d9c6d0868f4e8e52ea.html'],
    ],
  },
  'chinese-travel-phrases': {
    title: 'Chinese Phrases for Travelers: Essential Basics (2026)',
    heading: 'Essential Chinese Phrases for Travel in China (2026)',
    description:
      'Save essential Chinese phrases for travel, with characters, pinyin and English for taxis, hotels, food, payments, trains, directions and emergencies.',
    quickAnswer:
      'You do not need fluent Mandarin for a first trip to China, but you should save a compact set of phrases in Chinese characters. Show the Chinese sentence full-screen when pronunciation is difficult, keep the address or destination beside it, and download an offline translation tool before arrival. Pinyin helps you attempt the sound, but showing the characters is usually more reliable in a noisy station, taxi, restaurant, or emergency.',
    lastReviewed: 'September 20, 2026',
    lastModified: '2026-09-20',
    article: true,
    contentSections: [
      {
        title: 'How to use these phrases',
        ordered: true,
        items: [
          'Save this page and screenshot the phrases you are most likely to need. Do not assume mobile data will be available exactly when a problem occurs.',
          'Show the Chinese characters at a readable size. For an address, hotel, station, or attraction, show the exact Chinese name as well as the sentence.',
          'Use pinyin as a pronunciation aid, not as the only message. Tone marks matter, and an English approximation can easily be misunderstood.',
          'Keep each request short and specific. Ask one question at a time, then use 可以打字吗？ to invite the person to type the answer.',
          'For medical, allergy, police, immigration, or legal situations, use these phrases only to obtain help; contact the appropriate professional or authority directly.',
        ],
      },
      {
        title: 'Basic communication',
        items: [
          '你好 — nǐ hǎo — Hello.',
          '谢谢 — xièxie — Thank you.',
          '不好意思 — bù hǎo yìsi — Excuse me / sorry.',
          '我不会说中文。— wǒ bù huì shuō Zhōngwén — I do not speak Chinese.',
          '我听不懂。— wǒ tīng bù dǒng — I do not understand.',
          '请说慢一点。— qǐng shuō màn yìdiǎn — Please speak more slowly.',
          '可以打字吗？— kěyǐ dǎzì ma — Can you type it?',
          '请写下来。— qǐng xiě xiàlái — Please write it down.',
        ],
      },
      {
        title: 'Directions, taxis, and ride-hailing',
        items: [
          '请带我去这个地址。— qǐng dài wǒ qù zhège dìzhǐ — Please take me to this address.',
          '地铁站在哪里？— dìtiě zhàn zài nǎlǐ — Where is the metro station?',
          '这个入口在哪里？— zhège rùkǒu zài nǎlǐ — Where is this entrance?',
          '我走错了吗？— wǒ zǒu cuò le ma — Am I going the wrong way?',
          '请在这里停车。— qǐng zài zhèlǐ tíngchē — Please stop here.',
          '我在这个上车点。— wǒ zài zhège shàngchē diǎn — I am at this pickup point.',
          '我找不到您。— wǒ zhǎo bù dào nín — I cannot find you.',
          '车牌号是多少？— chēpái hào shì duōshao — What is the licence-plate number?',
        ],
      },
      {
        title: 'Hotel phrases',
        items: [
          '我有预订。— wǒ yǒu yùdìng — I have a reservation.',
          '我可以用护照入住吗？— wǒ kěyǐ yòng hùzhào rùzhù ma — Can I check in with my passport?',
          '请帮我办理住宿登记。— qǐng bāng wǒ bànlǐ zhùsù dēngjì — Please help me complete the accommodation registration.',
          'Wi-Fi密码是什么？— Wi-Fi mìmǎ shì shénme — What is the Wi-Fi password?',
          '房间里没有热水。— fángjiān lǐ méiyǒu rèshuǐ — There is no hot water in the room.',
          '可以晚一点退房吗？— kěyǐ wǎn yìdiǎn tuìfáng ma — Can I check out later?',
          '请帮我叫一辆出租车。— qǐng bāng wǒ jiào yí liàng chūzūchē — Please call a taxi for me.',
        ],
      },
      {
        title: 'Restaurant and food phrases',
        items: [
          '可以看一下英文菜单吗？— kěyǐ kàn yíxià Yīngwén càidān ma — Can I see an English menu?',
          '请给我看有图片的菜单。— qǐng gěi wǒ kàn yǒu túpiàn de càidān — Please show me a menu with pictures.',
          '这个辣吗？— zhège là ma — Is this spicy?',
          '请不要放辣。— qǐng bù yào fàng là — Please do not make it spicy.',
          '请给我一碗白米饭。— qǐng gěi wǒ yì wǎn bái mǐfàn — Please give me a bowl of steamed white rice.',
          '我对花生严重过敏。— wǒ duì huāshēng yánzhòng guòmǐn — I have a severe peanut allergy.',
          '我不吃猪肉。— wǒ bù chī zhūròu — I do not eat pork.',
          '可以打包吗？— kěyǐ dǎbāo ma — Can I take this away?',
        ],
      },
      {
        title: 'Payment and shopping phrases',
        items: [
          '这个多少钱？— zhège duōshao qián — How much is this?',
          '可以用支付宝吗？— kěyǐ yòng Zhīfùbǎo ma — Can I use Alipay?',
          '可以用微信支付吗？— kěyǐ yòng Wēixìn Zhīfù ma — Can I use WeChat Pay?',
          '可以刷卡吗？— kěyǐ shuākǎ ma — Can I pay by card?',
          '可以用现金吗？— kěyǐ yòng xiànjīn ma — Can I pay in cash?',
          '支付失败了。— zhīfù shībài le — The payment failed.',
          '请再试一次。— qǐng zài shì yí cì — Please try again.',
          '请给我收据。— qǐng gěi wǒ shōujù — Please give me a receipt.',
        ],
      },
      {
        title: 'Train, metro, and station phrases',
        items: [
          '站台在哪里？— zhàntái zài nǎlǐ — Where is the platform?',
          '这趟车去北京吗？— zhè tàng chē qù Běijīng ma — Does this train go to Beijing?',
          '我应该在哪一站下车？— wǒ yīnggāi zài nǎ yí zhàn xiàchē — At which station should I get off?',
          '换乘在哪里？— huànchéng zài nǎlǐ — Where do I transfer?',
          '这个出口对吗？— zhège chūkǒu duì ma — Is this the correct exit?',
          '我的座位在哪里？— wǒ de zuòwèi zài nǎlǐ — Where is my seat?',
          '我赶不上这趟车了。— wǒ gǎn bù shàng zhè tàng chē le — I am going to miss this train.',
        ],
      },
      {
        title: 'Internet and everyday needs',
        items: [
          '洗手间在哪里？— xǐshǒujiān zài nǎlǐ — Where is the toilet?',
          '这里有Wi-Fi吗？— zhèlǐ yǒu Wi-Fi ma — Is there Wi-Fi here?',
          '我的手机没有网络。— wǒ de shǒujī méiyǒu wǎngluò — My phone has no internet connection.',
          '这里可以充电吗？— zhèlǐ kěyǐ chōngdiàn ma — Can I charge my phone here?',
          '可以帮我拍照吗？— kěyǐ bāng wǒ pāizhào ma — Can you take a photo for me?',
          '营业到几点？— yíngyè dào jǐ diǎn — What time do you close?',
        ],
      },
      {
        title: 'Emergency and medical phrases',
        items: [
          '我需要帮助。— wǒ xūyào bāngzhù — I need help.',
          '请帮我报警。— qǐng bāng wǒ bàojǐng — Please help me call the police.',
          '请帮我叫救护车。— qǐng bāng wǒ jiào jiùhùchē — Please help me call an ambulance.',
          '我需要医生。— wǒ xūyào yīshēng — I need a doctor.',
          '我的护照丢了。— wǒ de hùzhào diū le — I lost my passport.',
          '我的手机丢了。— wǒ de shǒujī diū le — I lost my phone.',
          '我可能严重过敏。— wǒ kěnéng yánzhòng guòmǐn — I may be having a severe allergic reaction.',
          'China emergency numbers: 110 police, 120 ambulance, and 119 fire. Call the appropriate service directly in an urgent situation.',
        ],
      },
    ],
    faqs: [
      ['Do I need to speak Chinese to travel in China?', 'No. Many first-time visitors travel with translation tools, Chinese addresses, and a short phrase list. Prepare offline backups because English support and mobile data vary by place and situation.'],
      ['Should I speak the pinyin or show the Chinese characters?', 'Try the pinyin if you feel comfortable, but show the Chinese characters as well. Correct tones can be difficult for beginners, while a clear written sentence is often easier for the other person to understand.'],
      ['What is the most useful Chinese phrase for tourists?', '可以打字吗？ (“Can you type it?”) is especially useful because the reply can be copied into a translation app. For transport, also keep 请带我去这个地址 (“Please take me to this address”) beside the exact Chinese destination.'],
      ['Will an English translation app work everywhere in China?', 'Do not rely on one online app. Download an offline Chinese language pack, test camera and text translation before departure, and keep screenshots for hotels, transport, payment, food, and emergencies.'],
      ['How do I show a taxi driver my destination?', 'Show the exact Chinese place name and full address, not only an English name. Save the entrance or pickup point when a large station, mall, or attraction has several gates.'],
      ['Can I use a translated phrase for a severe food allergy?', 'A translated phrase can start the conversation, but it is not a medical safeguard. Use a clinician-reviewed bilingual allergy card, ask about ingredients and cross-contact, carry prescribed medicine, and do not eat when staff cannot confirm.'],
      ['Which emergency numbers should I save in China?', 'Save 110 for police, 120 for ambulance, and 119 for fire. ChinaEase Buddy provides reference phrases only and cannot contact emergency services for you.'],
    ],
    sourceLinks: [
      ['People\'s Bank of China: payment guide for visitors', 'https://english.www.gov.cn/news/202403/15/content_WS65f3b5d9c6d0868f4e8e52ea.html'],
      ['Railway 12306 English website', 'https://www.12306.cn/en/index.html'],
      ['China National Immigration Administration 12367 service', 'https://en.nia.gov.cn/n108/c117393/content.html'],
      ['CDC: food and drink safety while traveling', 'https://wwwnc.cdc.gov/travel/page/food-water-safety'],
    ],
  },
  'china-travel-safety-guide': {
    title: 'Is It Safe to Travel to China? Tourist Safety Guide (2026)',
    heading: 'Is It Safe to Travel to China in 2026?',
    description:
      'Many tourists visit mainland China without serious incidents; UK guidance says serious crime against foreigners is relatively rare. Know scams and laws.',
    quickAnswer:
      'Many tourists visit mainland China without serious incidents, and UK guidance says serious crime against foreign nationals is relatively rare. That does not make every trip risk-free. Use verified transport, avoid common tourist scams, follow local laws, prepare payment and mobile-data backups, and know how to contact emergency services. Government advisories also highlight broad national-security laws, possible exit bans, and restrictions in sensitive areas, so check the current advice for your nationality and itinerary before departure.',
    lastReviewed: 'October 7, 2026',
    lastModified: '2026-10-07',
    article: true,
    contentSections: [
      {
        title: 'Is it safe to travel to China right now?',
        items: [
          'Separate everyday tourist safety from legal and geopolitical risk. Street crime may be relatively uncommon while laws, restricted areas, business disputes, or a traveler\'s professional background can create different risks.',
          'The US Department of State currently rates mainland China Level 2, “Exercise increased caution.” Its advisory reissued on September 4, 2026 cites arbitrary enforcement of local laws, exit bans, and the risk of unjust arrest or detention.',
          'UK guidance says serious crime against foreign nationals is relatively rare, but isolated violent incidents have occurred and ordinary precautions remain necessary.',
          'Travel advice varies by nationality and can change quickly. Read the current government advisory for your passport, not only social-media accounts or an old travel video.',
          'Hong Kong and Macao have separate entry, legal, emergency, and travel-advisory pages. Do not treat a mainland China guide as complete advice for either place.',
        ],
      },
      {
        title: 'Prepare a safety backup before departure',
        ordered: true,
        items: [
          'Share your route, hotel details, transport bookings, and check-in plan with one trusted person who is not traveling with you.',
          'Save your embassy or consulate contact, travel insurer, card issuer, airline, hotel, and the China emergency numbers 110, 120, and 119.',
          'Keep passport and visa details, insurance documents, prescriptions, and bookings available offline. Store a separate secure copy in case the original is lost.',
          'Set up at least two payment routes, mobile data plus an offline information backup, and Chinese-language addresses for every hotel and major destination.',
          'Buy travel insurance that matches your activities and check medical treatment, evacuation, trip disruption, valuables, and pre-existing-condition terms.',
        ],
      },
      {
        title: 'Solo and female traveler precautions',
        items: [
          'Use the same baseline precautions you would use in any large unfamiliar city: tell someone where you are going, avoid isolated shortcuts, and keep control of your transport home.',
          'Do not leave food or drinks unattended or accept open drinks from strangers. Official guidance notes that drink spiking and sexual assault are uncommon but can occur.',
          'Meet new contacts in public places, keep your own phone and payment access, and avoid moving to a second unknown venue when the situation changes unexpectedly.',
          'At night, use a verified DiDi or a marked, metered taxi; check the licence plate and driver details before entering and share the ride when practical.',
          'If a person or venue makes you uncomfortable, leave early and move toward hotel staff, station staff, security, police, or another busy public place.',
        ],
      },
      {
        title: 'Recognize common tourist scams',
        items: [
          'Tea-house, massage, bar, and “practice English” scams often begin with a friendly stranger inviting you to a nearby venue, followed by an inflated bill and pressure to pay.',
          'Decline spontaneous invitations from strangers in major tourist areas when you cannot independently verify the venue, menu, price, and route back.',
          'Inspect payment requests before scanning or approving them. QR-code phishing, substituted payment codes, fake customer support, and suspicious links can expose money or account data.',
          'Use ATMs inside banks or established shopping centers where possible, shield the keypad, and stop if the machine or card slot looks altered.',
          'Never carry a parcel or luggage for a stranger. Pack your own bags and keep them under your control through airport and railway security.',
          'If a dispute becomes threatening, do not start a physical confrontation. Move to a public area, call 110, contact the card issuer if needed, and request a police report.',
        ],
      },
      {
        title: 'Transport and road safety',
        items: [
          'Use official airport taxi queues, verified ride-hailing, or marked and metered taxis. Avoid unmarked or unmetered vehicles even when the offer appears convenient.',
          'Check the licence plate, car model, and driver shown in the app before entering. Do not get into a different vehicle because someone knows your destination.',
          'Traffic direction and road behavior may differ from what you expect. Look both ways at crossings, watch for scooters and e-bikes, and do not assume a green pedestrian light removes every risk.',
          'A foreign or international driving permit alone does not normally authorize driving in mainland China. Confirm current licence and insurance requirements before renting a vehicle.',
          'At railway stations, airports, and overnight trains, keep your passport, phone, cards, and essential medicine on your person rather than in unattended luggage.',
        ],
      },
      {
        title: 'Local laws, identification, and sensitive places',
        items: [
          'Foreign visitors are subject to Chinese law. Rules and enforcement can differ from those in your home country, and saying that you did not know the rule may not prevent penalties.',
          'Official UK advice tells travelers to carry their original passport because police can conduct identity checks and may not accept a printed copy. Keep a separate secure copy as a loss backup.',
          'Avoid demonstrations and political gatherings. Do not photograph military, police, border, government, industrial, or other restricted facilities when permission is unclear.',
          'National-security, counterespionage, data, mapping, research, and publication rules can be broad. Travelers in journalism, academia, government, NGOs, technology, or business should obtain role-specific advice.',
          'Illegal-drug penalties are severe. Do not carry cannabis, CBD, unknown medicine, drug-containing products, or another person\'s bag without confirming legality through official channels.',
          'Drones are regulated. Check current Civil Aviation Administration and local rules before bringing, registering, or flying one.',
        ],
      },
      {
        title: 'Phone, payment, and data safety',
        items: [
          'Set up essential apps before departure and keep access to the phone number used for verification. Do not let a stranger take control of your unlocked phone to “fix” a payment.',
          'Check the merchant name and amount before approving an Alipay or WeChat Pay transaction. Keep receipts and screenshots when a charge is disputed.',
          'Use strong device locks, account recovery methods, and remote-loss controls. Avoid accessing highly sensitive accounts over unknown public Wi-Fi.',
          'Save hotel addresses, emergency phrases, bookings, and one map area offline because international services or mobile data may be unavailable.',
          'If a phone or wallet is lost, freeze cards and payment access quickly, change exposed credentials from a trusted device, and make a police report when required.',
        ],
      },
      {
        title: 'Health, medicine, food, and water',
        items: [
          'Check destination-specific vaccines and medicines with a qualified clinician ideally at least one month before travel. Recommendations depend on route, season, activities, and medical history.',
          'Carry routine and prescribed medicine in appropriate packaging with supporting documents, and verify Chinese import and controlled-medicine rules before travel.',
          'CDC guidance says tap water is not drinkable in China, including major cities. Use sealed bottled water or properly treated water when drinking safety is uncertain.',
          'Choose thoroughly cooked food served hot, practice hand hygiene, and use extra caution with raw or undercooked meat, seafood, eggs, and food held at unsafe temperatures.',
          'For a serious illness, injury, or allergic reaction, follow your personal medical plan and call 120. ChinaEase phrases are communication support, not medical advice.',
        ],
      },
      {
        title: 'Weather and outdoor safety',
        items: [
          'China covers many climates and is affected by earthquakes, heat, cold, altitude, flooding, and severe storms. Check the exact cities and season, not a national average.',
          'Typhoons and flooding commonly affect parts of southern and eastern China from May to November. Monitor official weather and follow local closure or evacuation instructions.',
          'Do not hike alone in isolated areas or on unrestored sections of the Great Wall. Leave the route and expected return time with another person.',
          'Carry water, power, offline navigation, weather-appropriate clothing, and an emergency contact plan for outdoor trips.',
          'When air quality, extreme heat, altitude, or an existing medical condition is relevant, seek personalized medical advice and reduce exposure rather than relying on a generic travel rule.',
        ],
      },
      {
        title: 'What to do in an emergency',
        ordered: true,
        items: [
          'Move away from immediate danger and toward a staffed, well-lit public place when it is safe to do so.',
          'Call 110 for police, 120 for ambulance, or 119 for fire. Ask a hotel, station, restaurant, or security employee to call if language is a barrier.',
          'Show a short Chinese phrase and your exact location: 请帮我报警 (“Please help me call the police”) or 请帮我叫救护车 (“Please help me call an ambulance”).',
          'Contact your embassy or consulate and travel insurer when the situation involves detention, a lost passport, serious medical care, crime, or emergency travel changes.',
          'Preserve booking records, receipts, card charges, screenshots, photos, and the police report number. Do not publish sensitive evidence before obtaining appropriate advice.',
        ],
      },
    ],
    faqs: [
      ['Is it safe to travel to China in 2026?', 'Many tourists travel without serious incidents, and UK guidance says serious crime against foreign nationals is relatively rare. Travelers should still protect belongings, avoid scams, use verified transport, follow local laws, and check current government advice for their nationality and route.'],
      ['Is China safe for solo female travelers?', 'Many women travel independently in China, but normal solo-travel precautions still matter. Keep control of drinks and transport, meet new contacts in public, share plans, avoid isolated places at night, and leave if a person or venue makes you uncomfortable.'],
      ['What scams should tourists watch for in China?', 'Common warnings include tea-house, massage, bar, and “practice English” invitations that end with an inflated bill. Also check QR codes, payment amounts, ATM equipment, suspicious links, and anyone asking you to carry a parcel.'],
      ['Should I carry my passport in China?', 'Official UK guidance advises carrying the original passport because police may conduct identity checks and may not accept a printed copy. Store a secure copy separately and check the current advice for your nationality and situation.'],
      ['Is tap water safe to drink in China?', 'CDC traveler guidance says tap water is not drinkable in China, including major cities. Use factory-sealed bottled water or water that has been properly treated when drinking safety is uncertain.'],
      ['What are the emergency numbers in China?', 'Call 110 for police, 120 for ambulance, and 119 for fire. Save the numbers and useful Chinese phrases offline before travel.'],
      ['Do I need travel insurance for China?', 'Travel insurance is strongly recommended. Check that the policy covers your medical needs, planned activities, evacuation, trip disruption, valuables, and any pre-existing conditions; exclusions vary by policy.'],
    ],
    sourceLinks: [
      ['UK government: China safety and security advice', 'https://www.gov.uk/foreign-travel-advice/china/safety-and-security'],
      ['US Department of State: China travel advisory', 'https://travel.state.gov/en/international-travel/travel-advisories/china.html'],
      ['Australian Smartraveller: China travel advice', 'https://www.smartraveller.gov.au/destinations/asia/china'],
      ['CDC: China traveler health guidance', 'https://wwwnc.cdc.gov/travel/destinations/traveler/none/china'],
      ['China Meteorological Administration', 'https://www.cma.gov.cn/en/'],
    ],
  },
  'china-travel-budget': {
    title: budgetGuide.metaTitle,
    heading: budgetGuide.heading,
    description: budgetGuide.metaDescription,
    quickAnswer: quickAnswerText(budgetGuide.quickAnswer),
    lastReviewed: budgetGuide.reviewed,
    lastModified: budgetGuide.modified,
    article: true,
    faqs: budgetGuide.faqs.map(({ question, answer }) => [question, plainText(answer)]),
    sourceLinks: budgetGuide.sources.map(({ label, href }) => [label, href]),
  },
  pricing: {
    lastReviewed: 'October 31, 2026',
    lastModified: '2026-10-31',
    title: 'Pricing | ChinaEase Buddy',
    description: 'Compare one-time Trip Pass and Group Pass options for the full Premium Toolkit and Buddy AI messages. Human customized itinerary planning is a separate paid service.',
    sections: [
      ['Free', 'Basic toolkit for apps, payments, transport, food, hotels, emergency help, and limited Buddy AI access.', '/?journey=china&tool=food'],
      ['Trip Pass', 'USD 9.90 one-time travel pass with the full Premium Toolkit, all premium phrase cards and 50 extra Buddy AI messages (on top of 10 free a day) for 14 days on up to 2 devices.', '/pricing/'],
      ['Group Pass', 'USD 29.90 one-time travel pass with the full Premium Toolkit, all premium phrase cards and 200 extra Buddy AI messages (on top of 10 free a day) for 14 days on up to 5 devices sharing one pass.', '/pricing/'],
    ],
    faqs: [
      ['How do paid passes work?', `${planningHelp.digitalScope} Passes are purchased through Gumroad. Activate with the Order ID on your receipt; returning from checkout does not activate a Pass.`],
      ['How is payment processed?', 'Payments are processed securely by Gumroad. ChinaEase Buddy never sees or stores your card details.'],
      ['Is there auto-renewal?', 'No. ChinaEase Buddy passes are one-time travel passes with no auto-renewal.'],
    ],
  },
  terms: {
    title: 'Terms of Service | ChinaEase Buddy',
    description: 'Terms of Service for ChinaEase Buddy, a digital travel toolkit for visitors in China.',
  },
  privacy: {
    title: 'Privacy Policy | ChinaEase Buddy',
    description: 'Privacy Policy for ChinaEase Buddy, including account data, usage quota, Firebase, and Buddy AI data handling.',
  },
  refund: {
    title: 'Refund Policy | ChinaEase Buddy',
    description: 'ChinaEase Buddy passes are one-time purchases and are generally non-refundable once access is activated. This does not affect statutory consumer rights under your local laws.',
  },
  contact: {
    title: 'Contact | ChinaEase Buddy',
    description: 'Contact ChinaEase Buddy for account, refund, privacy, or product support.',
  },
  about: {
    title: 'About ChinaEase Buddy',
    description: 'Learn about ChinaEase Buddy, a web-based digital China travel toolkit for foreign visitors.',
  },
  unsubscribe: {
    title: 'Unsubscribe | ChinaEase Buddy',
    description: 'Unsubscribe from occasional ChinaEase Buddy travel updates.',
  },
  'china-travel-apps': {
    article: true,
    title: appsHubGuide.metaTitle,
    heading: appsHubGuide.heading,
    description: appsHubGuide.metaDescription,
    quickAnswer: quickAnswerText(appsHubGuide.quickAnswer),
    faqs: appsHubGuide.faqs.map(({ question, answer }) => [question, plainText(answer)]),
    sourceLinks: appsHubGuide.sources.map(({ label, href }) => [label, href]),
    lastReviewed: appsHubGuide.reviewed,
    lastModified: appsHubGuide.modified,
  },
  'china-train-travel-guide': {
    article: true,
    title: trainGuide.metaTitle,
    heading: trainGuide.heading,
    description: trainGuide.metaDescription,
    quickAnswer: quickAnswerText(trainGuide.quickAnswer),
    faqs: trainGuide.faqs.map(({ question, answer }) => [question, plainText(answer)]),
    sourceLinks: trainGuide.sources.map(({ label, href }) => [label, href]),
    lastReviewed: trainGuide.reviewed,
    lastModified: trainGuide.modified,
  },
  'didi-in-china-for-foreigners': {
    article: true,
    title: didiGuide.metaTitle,
    heading: didiGuide.heading,
    description: didiGuide.metaDescription,
    quickAnswer: quickAnswerText(didiGuide.quickAnswer),
    faqs: didiGuide.faqs.map(({ question, answer }) => [question, plainText(answer)]),
    sourceLinks: didiGuide.sources.map(({ label, href }) => [label, href]),
    lastReviewed: didiGuide.reviewed,
    lastModified: didiGuide.modified,
  },
  'china-metro-guide': {
    title: 'China Metro Guide for Foreigners (2026) | ChinaEase Buddy',
    heading: 'China Metro Guide for Foreigners (2026)',
    description:
      'Foreign visitors can ride China\'s metro with a single-journey ticket from an English machine; some cities also take QR codes or selected overseas cards.',
    quickAnswer:
      'Foreign visitors can use metro systems in major Chinese cities, but ticket and payment options vary by city. The most dependable first-ride method is to plan the route in AMap, note the destination station and exit, then buy a single-journey ticket from an English-language machine or staffed counter. Some cities also support Alipay or WeChat transport QR codes, local transit cards, or direct contactless payment with selected overseas bank cards. Check the signs on the machine and gate instead of assuming one payment method works nationwide, keep the same ticket, card, or QR method for entry and exit, and allow time for the security check.',
    lastReviewed: 'September 18, 2026',
    lastModified: '2026-09-18',
    article: true,
    contentSections: [
      {
        title: 'Prepare your first metro trip',
        ordered: true,
        items: [
          'Use AMap to find the nearest station, destination station, line direction, transfer stations, estimated journey time, and recommended exit.',
          'Save the station names in Chinese and English. A station can serve several lines, exits, shopping centres, and large road junctions.',
          'Check the approximate last-train time for the complete route, especially when a transfer or airport line is involved.',
          'Keep a payment backup: some cash in RMB, a working Alipay or WeChat Pay account, and a physical bank card.',
          'Allow extra time for ticket purchase, security screening, transfers, and walking through a large interchange.',
        ],
      },
      {
        title: 'Choose a ticket or payment method',
        items: [
          'Single-journey ticket: normally bought for a specific destination from a vending machine or staffed counter. This is the simplest backup for a visitor taking only a few rides.',
          'Transport QR code: available through Alipay, WeChat, a city metro app, or another local service in some cities. Activation and international-card support vary.',
          'Contactless overseas bank card: available on supported gates or machines in certain cities. Beijing officially supports five major card organizations across its network, while the exact card and gate support elsewhere differs.',
          'Local transport card or visitor pass: useful for repeated rides, but purchase, deposit, top-up, refund, and cross-city use rules vary.',
          'Cash or staffed counter: keep this as a fallback when a QR code, foreign card, phone, or vending machine does not work.',
        ],
      },
      {
        title: 'Buy a single-journey ticket',
        ordered: true,
        items: [
          'Find a ticket vending machine and switch it to English when that option is available.',
          'Select the destination line and station, not the attraction name. Confirm similarly named stations carefully.',
          'Choose the number of passengers and review the fare shown on the screen.',
          'Pay with one of the methods displayed on that machine. Card brands, cash acceptance, notes, coins, and mobile-payment support can differ.',
          'Collect the ticket or token and any change. Keep it until you have fully exited at the destination.',
          'If the machine will not accept your payment, show the destination station to staff at the service counter.',
        ],
      },
      {
        title: 'Enter the station and pass security',
        items: [
          'Follow signs for the correct metro line. Airport, railway, and shopping-centre entrances may connect to several transport areas.',
          'Place bags on the security scanner when directed and carry liquids or other items through the passenger screening route. Follow local instructions because procedures can vary.',
          'Use the designated gate for your ticket, QR code, transit card, or overseas bank card. Not every gate necessarily accepts every method.',
          'Use the same payment medium at entry and exit. Do not enter with a physical card and try to exit with the phone wallet linked to that card.',
          'Do not follow another passenger through the gate. If the gate does not open, use the service point instead of repeatedly tapping.',
        ],
      },
      {
        title: 'Find the correct platform and direction',
        items: [
          'After entering, follow the line number, line colour, and terminus or next-station direction shown on overhead signs.',
          'Check the next one or two station names against your route before boarding. Opposite directions often use different platforms or corridors.',
          'Stand behind the platform safety line and let passengers leave before boarding.',
          'Watch or listen for the destination station. English announcements and signage are common in major systems, but coverage can vary.',
          'Keep bags close during busy periods and avoid blocking doors or priority areas.',
        ],
      },
      {
        title: 'Transfer between metro lines',
        items: [
          'Follow the transfer signs for the next line without passing through an exit gate unless the route specifically requires an out-of-station transfer.',
          'Large interchange stations can involve long corridors, stairs, escalators, or a separate platform level, so the map time may not include every delay.',
          'Confirm the direction again when you reach the new line. The same line number has two opposite terminus directions.',
          'If you accidentally exit, ask staff before buying another ticket or attempting to re-enter.',
        ],
      },
      {
        title: 'Choose the right station exit',
        items: [
          'Check the exit letter or number in AMap before the train arrives, then compare it with the station exit map and signs.',
          'Different exits can be on opposite sides of a wide road, inside a shopping centre, or several hundred metres apart.',
          'For attractions, hotels, hospitals, and railway stations, use the exit linked to the correct entrance rather than simply choosing the nearest-looking exit.',
          'If an exit is closed, follow the station notice to the alternative and recalculate the walking route after reaching street level.',
        ],
      },
      {
        title: 'Airport, railway-station, and luggage tips',
        items: [
          'Confirm the exact airport terminal or full railway-station name. Major cities can have several airports, terminals, and distant railway stations.',
          'Check that the metro or airport line will still be operating when you land or when your train arrives; do not assume service runs all night.',
          'Allow more transfer time with suitcases, because some routes involve long walks, stairs, crowded trains, or limited lift access.',
          'Follow signs for lifts and accessible routes when needed, but allow a backup route because facilities and access points can change.',
          'During peak periods, an official taxi queue or DiDi may be more practical than several crowded metro transfers with heavy luggage.',
        ],
      },
      {
        title: 'Common metro problems and fixes',
        items: [
          'Card or phone will not open the gate: confirm the gate accepts that brand or QR service, remove other contactless cards, and ask staff rather than tapping repeatedly.',
          'Ticket will not work at exit: take it to the service counter; the fare may need adjustment if the destination or journey time differs.',
          'QR code will not load: check mobile data, screen brightness, account status, and whether the correct city transport code is active.',
          'You boarded in the wrong direction: leave at the next station and follow signs to the opposite platform without exiting the paid area when possible.',
          'You missed the last train or a connection: use the official taxi queue, DiDi, or another verified transport option rather than accepting an unsolicited ride.',
        ],
      },
      {
        title: 'Useful Chinese metro phrases',
        items: [
          '我要去这个地铁站。 — I want to go to this metro station.',
          '怎么买单程票？ — How do I buy a single-journey ticket?',
          '这张银行卡可以用吗？ — Can I use this bank card?',
          '我应该坐哪个方向？ — Which direction should I take?',
          '在哪里换乘？ — Where do I transfer?',
          '我应该从哪个出口出去？ — Which exit should I use?',
          '末班车是几点？ — What time is the last train?',
        ],
      },
    ],
    faqs: [
      ['Can foreigners use the metro in China?', 'Yes. Foreign visitors can use metro systems in Chinese cities. A passport is not normally needed for an ordinary metro ride, but local security, payment, and ticket rules apply.'],
      ['Can I buy a China metro ticket with cash?', 'Many systems provide ticket machines or staffed counters that accept RMB, but the denominations and cash support can differ by machine and city. Carry smaller notes and keep a digital or card backup.'],
      ['Can I use a foreign bank card on the metro?', 'It depends on the city and card. Beijing officially supports contactless access through five major card organizations across its network, and Shanghai offers several international-card routes. Check the gate or machine logo in each city.'],
      ['Can I use Alipay or WeChat Pay for the metro?', 'Many cities offer a transport QR code or ticket payment through Alipay, WeChat, or a local metro app. Activation, city selection, identity checks, and support for an international card can vary.'],
      ['Do I need a Chinese phone number to ride the metro?', 'Not if you buy a supported single-journey ticket or use an accepted contactless card. App-based transport codes may have their own account, verification, and phone-number requirements.'],
      ['Does every Chinese metro use the same ticket or QR code?', 'No. Metro payment products and transport codes are usually city-specific. A method that works in Beijing or Shanghai may require separate activation or may not work in another city.'],
      ['How late do metros run in China?', 'Operating hours differ by city, line, station, weekday, and special date. Check the official operator or live route information for every line in your journey, especially the final transfer.'],
    ],
    sourceLinks: [
      ['Beijing government: How to buy subway tickets', 'https://english.beijing.gov.cn/specials/beijinglifeonthesubway/noticeforpassengers/202206/t20220623_2749418.html'],
      ['Beijing government: Overseas card tap-and-go', 'https://english.beijing.gov.cn/latest/news/202506/t20250616_4114250.html'],
      ['Shanghai government: How to take the metro', 'https://english.shanghai.gov.cn/en-Transportation/20231214/c727f5e15eff4b8c9340651dd95f3f7c.html'],
      ['AMap official mobile website', 'https://mobile.amap.com/'],
    ],
  },
  '7-day-china-itinerary': {
    title: '7-Day China Itinerary for First-Time Visitors (2026)',
    heading: '7-Day China Itinerary for First-Time Visitors (2026)',
    description:
      'A 7-day China itinerary works well as three nights in Beijing and three in Shanghai, with a faster Xi\'an option. See day-by-day timing, trains and costs.',
    quickAnswer: sevenDayItineraryContent.quickAnswer,
    lastReviewed: 'September 20, 2026',
    lastModified: sevenDayItineraryContent.modified,
    article: true,
    contentSections: sevenDayItineraryContent.sections,
    faqs: sevenDayItineraryContent.faqs.map(({ question, answer }) => [question, answer]),
    sourceLinks: [
      ['Palace Museum: official tickets and Monday closure', 'https://young.dpm.org.cn/en/category/279'],
      ['The Palace Museum official international website', 'https://intl.dpm.org.cn/index.html'],
      ['Emperor Qinshihuang\'s Mausoleum Site Museum official website', 'https://www.bmy.com.cn/'],
      ['China Railway 12306 English website', 'https://www.12306.cn/en/'],
      ['Railway 12306 official English FAQ', 'https://www.12306.cn/en/faq.html'],
    ],
  },
  '10-day-china-itinerary': {
    title: '10-Day China Itinerary for First-Time Visitors',
    heading: '10-Day China Itinerary for First-Time Visitors',
    description:
      'Plan a classic 10-day China trip through Beijing, Xi\'an, and Shanghai with daily highlights, train advice, booking tips, and flexible alternatives.',
    quickAnswer: tenDayItineraryContent.quickAnswer,
    lastReviewed: 'September 18, 2026',
    lastModified: tenDayItineraryContent.modified,
    article: true,
    contentSections: tenDayItineraryContent.sections,
    faqs: tenDayItineraryContent.faqs.map(({ question, answer }) => [question, answer]),
    sourceLinks: [
      ['The Palace Museum official international website', 'https://intl.dpm.org.cn/index.html'],
      ['Emperor Qinshihuang\'s Mausoleum Site Museum official website', 'https://www.bmy.com.cn/'],
      ['Railway 12306 English website', 'https://www.12306.cn/en/index.html'],
      ['Railway 12306 official English FAQ', 'https://www.12306.cn/en/faq.html'],
    ],
  },
  '14-day-china-itinerary': {
    title: '14-Day China Itinerary for First-Time Visitors (2026)',
    heading: '14-Day China Itinerary for First-Time Visitors (2026)',
    description:
      'A 14-day China itinerary can cover Beijing, Xi\'an, Chengdu and Shanghai. See transport advice, booking priorities, costs and a Guilin alternative.',
    quickAnswer:
      'For a first 14-day trip to China, limit the route to four bases: four nights in Beijing, three in Xi\'an, three in Chengdu, and three in Shanghai, with the final day reserved for departure. This gives you imperial history and the Great Wall, the Terracotta Warriors, Sichuan food and pandas, then historic and modern Shanghai. If landscapes matter more than pandas and food, replace Chengdu with Guilin and Yangshuo rather than adding a fifth destination. Use an open-jaw international ticket so you arrive in Beijing and depart from Shanghai, and verify every long-distance leg against the live 12306 or airline schedule before booking.',
    lastReviewed: 'September 21, 2026',
    lastModified: '2026-10-22',
    article: true,
    contentSections: [
      {
        title: 'The 14-day route at a glance',
        table: {
          headers: ['Day', 'Base', 'Main plan'],
          rows: [
            ['1', 'Beijing', 'Arrive, check in, set up data and payments, then take a short local walk'],
            ['2', 'Beijing', 'Tiananmen area, Palace Museum, and Jingshan Park'],
            ['3', 'Beijing', 'Full-day Great Wall trip'],
            ['4', 'Beijing', 'Temple of Heaven and hutongs, or the Summer Palace'],
            ['5', 'Xi\'an', 'High-speed train, hotel check-in, then City Wall or Bell and Drum Tower area'],
            ['6', 'Xi\'an', 'Terracotta Warriors and a light evening'],
            ['7', 'Xi\'an', 'History museum or Tang-culture focus and Giant Wild Goose Pagoda area'],
            ['8', 'Chengdu', 'Train or flight, hotel check-in, Sichuan food, and an easy neighborhood walk'],
            ['9', 'Chengdu', 'Early Panda Base visit, then People\'s Park or a teahouse area'],
            ['10', 'Chengdu', 'Leshan day trip, food day, or a slower city day'],
            ['11', 'Shanghai', 'Travel east, check in, then a short Bund walk if energy allows'],
            ['12', 'Shanghai', 'Old city or Yu Garden area, the Bund, and Pudong skyline'],
            ['13', 'Shanghai', 'Neighborhoods, museum, architecture, food, or one focused day trip'],
            ['14', 'Shanghai', 'Flexible final half-day and airport transfer'],
          ],
        },
        items: [
          'This assumes 13 nights in China and an open-jaw flight. If your 14 days include both long-haul travel days, remove one optional day trip or one city.',
          'Four bases are enough. A fifth major destination creates another hotel change and often removes the recovery time that makes a two-week trip enjoyable.',
          'Reverse the route only when international flights and live domestic transport make the opposite direction clearly easier.',
        ],
      },
      {
        title: 'Choose four cities, not every famous place',
        table: {
          headers: ['Route style', 'Suggested bases', 'Best for'],
          rows: [
            ['Balanced classic', 'Beijing, Xi\'an, Chengdu, Shanghai', 'History, food, pandas, and modern cities'],
            ['History and scenery', 'Beijing, Xi\'an, Guilin/Yangshuo, Shanghai', 'Landscapes and outdoor photography'],
            ['Slower first trip', 'Beijing, Xi\'an, Shanghai', 'Families, mobility needs, deeper city time, or less packing'],
          ],
        },
        items: [
          'Chengdu and Guilin solve different travel goals. Choose one instead of trying to fit both between Xi\'an and Shanghai.',
          'Zhangjiajie can replace Chengdu or Xi\'an, but mountain weather, park transfers, walking, and flight schedules require more buffer.',
          'Hong Kong is a separate immigration and border-planning decision. Add it only after checking entry documents and the effect on your mainland route.',
        ],
      },
      {
        title: 'Days 1–4: Beijing with recovery time',
        items: [
          'Keep Day 1 light because immigration, baggage, airport transfer, hotel registration, mobile data, payments, and jet lag can consume much of the day.',
          'Group the Tiananmen area, Palace Museum, and Jingshan on Day 2. Verify the current reservation, identity-document, closure, and entry rules before travel.',
          'Give the Great Wall a full day and choose the section, transfer, walking difficulty, weather backup, and return time in advance.',
          'Use Day 4 for the Temple of Heaven and hutongs, or choose the Summer Palace if gardens and architecture are a higher priority.',
          'Stay near a useful metro line rather than choosing only by straight-line distance to one attraction.',
        ],
      },
      {
        title: 'Days 5–7: Xi\'an history without rushing',
        items: [
          'Take a daytime high-speed train from Beijing and confirm the complete station names because both cities have multiple railway stations.',
          'Keep the arrival evening flexible: choose the City Wall or Bell and Drum Tower area according to hotel location and energy.',
          'Reserve Day 6 for the Terracotta Warriors. The museum is outside central Xi\'an and its official site says visits use real-name reservations, including for foreign visitors.',
          'Use Day 7 for a history museum or Tang-culture focus, then the Giant Wild Goose Pagoda area. Confirm any separate reservation requirement.',
          'The third Xi\'an night protects the pace of the trip and avoids another late transfer after a full sightseeing day.',
        ],
      },
      {
        title: 'Days 8–10: Chengdu for pandas and food',
        items: [
          'Travel from Xi\'an on Day 8, then keep the first Chengdu evening for a neighborhood walk and a planned Sichuan meal.',
          'Visit the Chengdu Research Base of Giant Panda Breeding early on Day 9. Check its official hours, tickets, transport, and visitor notices before departure.',
          'Pair the Panda Base with a lighter afternoon such as People\'s Park, a teahouse area, or a food-focused neighborhood.',
          'Use Day 10 for Leshan only if live transport and your walking pace work. Otherwise stay in Chengdu for food, culture, or rest.',
          'If spice, food allergies, or dietary restrictions matter, carry clear Chinese text and ask about ingredients and cross-contact.',
        ],
      },
      {
        title: 'Days 11–14: Shanghai and departure',
        items: [
          'Compare a flight with a longer train from Chengdu to Shanghai using total door-to-door time. Either option consumes a meaningful part of Day 11.',
          'Use Day 12 for older streets or the Yu Garden area, the Bund, and the Pudong skyline, keeping nearby stops together.',
          'Use Day 13 for neighborhoods, architecture, a museum, food, or one focused day trip.',
          'Keep Day 14 flexible for a missed highlight, shopping, weather changes, or an unhurried airport transfer.',
          'Shanghai has two major airports and several railway stations. Confirm the full name and terminal before leaving the hotel.',
        ],
      },
      {
        title: 'Nature alternative: replace Chengdu with Guilin and Yangshuo',
        items: [
          'Use Day 8 to reach Guilin or Yangshuo, but price the exact Xi\'an connection before committing because the best route may involve a flight or a long rail journey.',
          'Use Day 9 for the Li River or another major karst-landscape experience, subject to the current operator, weather, water, and ticket conditions.',
          'Use Day 10 for Yangshuo countryside at a pace that matches heat, rain, cycling ability, and road confidence.',
          'Travel toward Shanghai on Day 11. If the connection is poor, reduce the final Shanghai plan rather than scheduling an impossible transfer day.',
          'This swap is best for scenery and photography; Chengdu is better for pandas, Sichuan food, and an easier urban recovery block.',
        ],
      },
      {
        title: 'Intercity transport plan',
        table: {
          headers: ['Leg', 'Default choice', 'What to verify'],
          rows: [
            ['Beijing → Xi\'an', 'High-speed train', 'Exact stations, live duration, seat class, passport details, and hotel transfer'],
            ['Xi\'an → Chengdu', 'High-speed train or flight', 'Door-to-door time, schedule, baggage, and arrival hour'],
            ['Chengdu → Shanghai', 'Flight or longer train', 'Total travel day, airport or station transfer, and disruption buffer'],
            ['Shanghai → home', 'International flight', 'Correct airport, terminal, check-in time, and visa or transit implications'],
          ],
        },
        items: [
          'Use the official Railway 12306 English service to check the exact live rail schedule, fare, accepted identity document, change, and refund conditions.',
          'A third-party booking flow may be easier, but compare the final price, service fee, support, ticket-issuance status, and refund rules.',
          'Do not build the itinerary around estimated journey times from an old article. Timetables, fares, and availability are date-specific.',
        ],
      },
      {
        title: 'Book in this order',
        ordered: true,
        items: [
          'Confirm passport validity, visa or visa-free eligibility, route, permitted purpose, entry port, and departure plan.',
          'Compare open-jaw international flights into Beijing and out of Shanghai before fixing domestic transport.',
          'Reserve hotels with clear foreign-guest policies, useful transport, correct room occupancy, and workable cancellation terms.',
          'Book the Palace Museum, Terracotta Warriors, Panda Base, and other capacity-controlled attractions through official or clearly authorized channels.',
          'Book intercity rail or flights when the relevant sales window opens, entering the passport name and number exactly.',
          'Set up mobile data, Alipay, WeChat, AMap, translation, insurance, payment backups, and Chinese hotel addresses before departure.',
        ],
      },
      {
        title: 'Estimated budget for two weeks',
        items: [
          'For planning, allow roughly RMB 6,500–11,000 per person for a budget trip, RMB 13,000–25,000 for mid-range travel, or RMB 28,000–50,000+ for a comfortable trip.',
          'These are ChinaEase planning envelopes, not official averages or quotations. They exclude international flights and assume a broad domestic intercity allowance.',
          'Solo travelers often pay the full hotel-room price, while two people sharing one room may reduce the per-person total.',
          'Public holidays, major events, central hotels, premium tours, private transfers, and late booking can raise the cost substantially.',
          'Replace the transport allowance with live 12306 or airline prices, then add insurance, visa costs, card fees, shopping, and a contingency.',
        ],
      },
      {
        title: 'Adjust the route to your pace',
        items: [
          'For slower travel, remove Chengdu and redistribute the nights across Beijing, Xi\'an, and Shanghai.',
          'For families, older travelers, or limited mobility, plan one major anchor per day and stay close to useful transport.',
          'For food-focused travel, keep Chengdu; for scenery, replace it with Guilin and Yangshuo.',
          'For mountains, replace Chengdu with Zhangjiajie and add weather flexibility.',
          'For a late arrival or early departure, remove an optional day trip before removing recovery time around long transport legs.',
        ],
      },
      {
        title: 'Common two-week itinerary mistakes',
        items: [
          'Adding five or six major cities and losing the holiday to packing, stations, airports, and check-in.',
          'Treating arrival, every transfer, and departure as full sightseeing days.',
          'Booking a round trip to one city when an open-jaw ticket could remove a long return journey.',
          'Leaving major attraction and peak-period train reservations until arrival.',
          'Choosing hotels by map distance without checking metro lines, station exits, luggage routes, and airport connections.',
          'Depending on one payment method, one map app, or constant access to international services.',
        ],
      },
    ],
    faqs: [
      ['Is 14 days enough for a first trip to China?', 'Yes. Fourteen days is enough for a balanced four-base trip through Beijing, Xi\'an, Chengdu, and Shanghai, or a slower three-city route. It is not enough to cover every major region comfortably.'],
      ['What is the best two-week China itinerary?', 'A strong first-trip route is Beijing for imperial history and the Great Wall, Xi\'an for the Terracotta Warriors, Chengdu for pandas and Sichuan culture, then Shanghai for historic neighborhoods and modern China.'],
      ['Should I choose Chengdu or Guilin?', 'Choose Chengdu for pandas, Sichuan food, teahouse culture, and an urban recovery block. Choose Guilin and Yangshuo for karst landscapes, outdoor experiences, and photography. Replace one with the other instead of adding both.'],
      ['How many cities should I visit in 14 days?', 'Three cities create a relaxed trip; four bases create a varied but manageable route. Five or more major destinations usually introduce too much transport and too little flexibility for a first visit.'],
      ['How much does a 14-day China trip cost?', 'A useful planning envelope is RMB 6,500–11,000 for budget travel, RMB 13,000–25,000 for mid-range travel, or RMB 28,000–50,000+ for a comfortable trip, excluding international flights.'],
      ['Should I use trains or domestic flights?', 'High-speed rail is a natural choice from Beijing to Xi\'an. Compare rail and air for the longer legs using live door-to-door time, station or airport location, baggage, fare, and your preferred pace.'],
      ['Can ChinaEase Buddy personalize this two-week itinerary?', 'Yes. Share your dates, flights, arrival and departure cities, interests, group size, pace, hotel preferences, and practical concerns to receive a route built around the real trip.'],
    ],
    sourceLinks: [
      ['The Palace Museum official international website', 'https://intl.dpm.org.cn/index.html'],
      ['Emperor Qinshihuang\'s Mausoleum Site Museum official website', 'https://www.bmy.com.cn/'],
      ['Chengdu Research Base of Giant Panda Breeding', 'https://www.panda.org.cn/en/'],
      ['China Railway 12306 English website', 'https://www.12306.cn/en/'],
      ['People\'s Bank of China: payment guide for visitors', 'https://english.www.gov.cn/news/202403/15/content_WS65f3b5d9c6d0868f4e8e52ea.html'],
    ],
  },
  'beijing-vs-shanghai': {
    title: 'Beijing or Shanghai: Which Should You Visit? (2026)',
    heading: 'Beijing vs Shanghai: Which City Should You Visit First? (2026)',
    description:
      'Choose Beijing for imperial history and the Great Wall, or Shanghai for modern city life and waterfront views. With seven days or more, consider both.',
    quickAnswer:
      'Choose Beijing if your first priority is imperial history, the Palace Museum, the Great Wall, monumental landmarks, and a stronger sense of China\'s political and historical centre. Choose Shanghai if you prefer a more compact urban introduction, waterfront architecture, modern city life, neighbourhood walks, easier short stays, and convenient onward travel through eastern China. For a trip of seven days or more, the strongest answer is often both: enter through Beijing, spend three to four full days there, take a high-speed train to Shanghai, spend two to three full days there, and fly home from Shanghai. Check live flights, rail schedules, attraction reservations, weather, and entry rules before fixing the order.',
    lastReviewed: 'September 21, 2026',
    lastModified: '2026-09-21',
    article: true,
    contentSections: [
      {
        title: 'Beijing vs Shanghai at a glance',
        table: {
          headers: ['Question', 'Beijing', 'Shanghai'],
          rows: [
            ['Best for', 'Imperial history, major monuments, the Great Wall, traditional urban fabric', 'Modern China, waterfront architecture, neighbourhoods, design, food, and day trips'],
            ['Ideal first stay', '3–5 full days', '2–4 full days'],
            ['Sightseeing style', 'Large landmark days with longer transfers and more advance planning', 'Denser urban days that are easier to group by neighbourhood'],
            ['Signature experiences', 'Palace Museum, Temple of Heaven, hutongs, Great Wall', 'The Bund, Pudong skyline, Yuyuan area, former-concession streets'],
            ['Best onward route', 'Xi\'an, northern China, or south to Shanghai', 'Suzhou, Hangzhou, eastern China, or international departure'],
            ['Choose it when', 'History is the main reason for your China trip', 'You want the easiest short urban introduction'],
          ],
        },
        items: [
          'Neither city is objectively better. The right choice depends on what you want to understand, how many full days you have, your international flights, and the next destination.',
          'Count full sightseeing days rather than hotel nights. Arrival, jet lag, airport transfers, and departure can remove much of the first and last day.',
          'If the flight difference is large, let the better international connection influence the route rather than forcing a theoretical “best” city.',
        ],
      },
      {
        title: 'Choose Beijing for history and landmark experiences',
        items: [
          'Beijing is the stronger first choice when the Palace Museum, the Great Wall, the Temple of Heaven, imperial planning, and modern national history are central to the trip.',
          'The city rewards three to five full days because its major sights are large, security and reservation steps take time, and the Great Wall normally needs its own day.',
          'A strong first visit combines one imperial-core day, one Great Wall day, and one flexible day for the Temple of Heaven, Summer Palace, hutongs, museums, or food.',
          'The Palace Museum provides official opening-hour, ticket, service-map, and visitor-trail information. Check the current identity-document and reservation process before the visit.',
          'Beijing can feel more demanding on a very short trip because distances, walking, seasonal weather, and advance bookings shape the day.',
        ],
      },
      {
        title: 'Choose Shanghai for a shorter and more urban first stop',
        items: [
          'Shanghai is the stronger choice when your interests are architecture, modern city life, design, restaurants, shopping, waterfront views, and walkable neighbourhood clusters.',
          'A useful first visit can fit into two or three full days: combine the Bund and older central areas, spend another day in neighbourhoods and museums, then add a focused day trip only if time allows.',
          'The Shanghai municipal tourism pages identify the Bund as a protected historic waterfront and list Yuyuan Garden, Wukang Road, museums, parks, and other city attractions.',
          'Shanghai is not only skyscrapers. Its value comes from the contrast between the Bund, lane neighbourhoods, commercial streets, traditional gardens, and Pudong.',
          'It is often the easier final city because a flexible urban day can sit before an international departure without committing to a distant excursion.',
        ],
      },
      {
        title: 'Which city matches your travel style?',
        table: {
          headers: ['Traveler priority', 'Better starting point', 'Why'],
          rows: [
            ['Chinese history and famous monuments', 'Beijing', 'More imperial and national landmarks, plus access to the Great Wall'],
            ['Architecture, cafés, design, and city walks', 'Shanghai', 'Denser neighbourhood variety and strong historic-modern contrast'],
            ['Only 2–3 full days in China', 'Shanghai', 'A coherent first visit can be built with fewer long-distance attraction days'],
            ['First trip of 4–5 full days', 'Beijing', 'Enough time for the historic core, Great Wall, and one flexible day'],
            ['Travel with limited walking capacity', 'Depends', 'Shanghai can be easier to cluster, but hotel location and daily transport matter more than the city name'],
            ['Continue to Xi\'an', 'Beijing', 'The route fits a classic north-to-central itinerary'],
            ['Continue to Suzhou or Hangzhou', 'Shanghai', 'Both are natural additions to an eastern China route'],
          ],
        },
        items: [
          'Food is not a clean tie-breaker: both cities have deep local traditions and broad restaurant choice. Pick the city for the overall route, then plan food deliberately.',
          'Families, older travellers, and anyone sensitive to heat, cold, or long walking days should compare season and hotel location before deciding.',
        ],
      },
      {
        title: 'How many days do you need?',
        table: {
          headers: ['Time available', 'Recommended choice', 'Realistic plan'],
          rows: [
            ['2–3 full days', 'Choose one city', 'Shanghai for a compact urban trip; Beijing only if you prioritise two or three major sights'],
            ['4–5 full days', 'One city in depth', 'Beijing for a classic first visit, or Shanghai plus one nearby day trip'],
            ['6–7 full days', 'Both cities', '3–4 full days in Beijing, train day, then 2–3 full days in Shanghai'],
            ['8–10 full days', 'Both plus Xi\'an or a nearby region', 'Use an open-jaw route and avoid returning to the arrival city'],
            ['14 days', 'Both within a wider route', 'Add Xi\'an and one of Chengdu or Guilin without exceeding four bases'],
          ],
        },
        items: [
          'Do not count a late arrival as a full day or schedule a major timed attraction immediately after a long-haul flight.',
          'For seven days, flying into Beijing and home from Shanghai usually protects more sightseeing time than a round trip through one city.',
          'For ten or fourteen days, use the ChinaEase itinerary guides to decide whether Xi\'an, Chengdu, or Guilin deserves the additional nights.',
        ],
      },
      {
        title: 'Getting between Beijing and Shanghai',
        items: [
          'High-speed rail is usually the simplest city-to-city comparison because central-station access can reduce airport-transfer time, but the answer depends on the live departure, station, fare, and hotel locations.',
          'Use the official Railway 12306 English service to check the exact train, complete station name, journey time, fare, accepted identity document, availability, change, and refund rules.',
          'Both cities have multiple airports and railway stations. Never write only “Beijing station” or “Shanghai airport” in the plan; save the complete English and Chinese name plus terminal.',
          'A flight may make sense when it connects directly with another domestic leg or offers a much better schedule, but compare total door-to-door time rather than time in the air.',
          'Treat the transfer as a travel block. Even a fast train requires hotel checkout, station arrival, security, boarding, arrival, and another hotel transfer.',
        ],
      },
      {
        title: 'Weather, pace, and seasonal trade-offs',
        items: [
          'Beijing generally has a more continental feel, with colder winters, hotter summers, and drier conditions; Shanghai is typically more humid and has a different rain and heat pattern.',
          'Do not choose by average temperature alone. Check the short-range forecast, air conditions, rain, wind, attraction closures, and outdoor walking load immediately before travel.',
          'Public holidays and major events can change hotel prices, rail availability, attraction capacity, and crowd levels in both cities.',
          'In difficult weather, Beijing needs an alternative to the Great Wall day, while Shanghai needs a strong indoor plan for neighbourhood walks and skyline views.',
        ],
      },
      {
        title: 'Budget differences that actually matter',
        items: [
          'Both cities can support budget, mid-range, and comfortable trips; hotel location and standard usually matter more than a simple city-wide price label.',
          'Beijing can create extra transport or tour costs for a Great Wall day. Shanghai can create higher spending through central hotels, restaurants, nightlife, shopping, and paid skyline experiences.',
          'Compare real hotel quotes for your dates near a useful metro line, then add attraction tickets, local transport, food, airport or station transfers, and one contingency allowance.',
          'Do not assume the cheapest room is the cheapest trip. A remote hotel can add daily transfer time and ride-hailing costs.',
          'Use the China travel budget guide for broad planning, but replace every estimate with live prices before booking.',
        ],
      },
      {
        title: 'Best first-trip route using both cities',
        ordered: true,
        items: [
          'Fly into Beijing and keep the arrival day light for immigration, hotel registration, data, payments, and recovery.',
          'Spend three or four full days on the imperial core, the Great Wall, and one flexible Beijing day.',
          'Take a daytime high-speed train to Shanghai, using the exact station and passport details shown in the booking.',
          'Spend two or three full days on the Bund and central historic areas, neighbourhoods, museums, food, or one carefully chosen day trip.',
          'Fly home from Shanghai, or reverse the route when international flights, weather, reservations, or the wider itinerary clearly favour it.',
        ],
      },
      {
        title: 'Common Beijing vs Shanghai planning mistakes',
        items: [
          'Choosing only from social-media aesthetics instead of matching the city to the trip length and onward route.',
          'Trying to visit both cities in three or four days and losing most of the trip to transfers and check-in.',
          'Adding a distant Great Wall trip or regional day trip without protecting enough time for the city itself.',
          'Booking international round-trip flights before comparing an open-jaw arrival and departure.',
          'Assuming every major attraction accepts a spontaneous walk-in visit with no identity or reservation requirement.',
          'Ignoring the complete airport, railway-station, terminal, and hotel address until travel day.',
        ],
      },
    ],
    faqs: [
      ['Is Beijing or Shanghai better for a first trip to China?', 'Beijing is better for imperial history, major monuments, and the Great Wall. Shanghai is better for a shorter urban introduction, architecture, neighbourhoods, restaurants, and modern city life. Choose according to your main interest and onward route.'],
      ['Is Beijing or Shanghai easier for tourists?', 'Shanghai can be easier to structure into compact neighbourhood days, while Beijing requires more time for large sights and the Great Wall. In both cities, a well-located hotel, mobile data, payment setup, maps, and saved Chinese addresses matter more than the city label.'],
      ['Which city needs more days, Beijing or Shanghai?', 'Beijing usually needs more time. Allow three to five full days for a first visit, compared with two to four full days for Shanghai, depending on day trips and travel pace.'],
      ['Can I visit Beijing and Shanghai in one week?', 'Yes. A realistic plan is three to four full days in Beijing, one rail travel block, and two to three full days in Shanghai. Use open-jaw flights if the price and schedule work.'],
      ['Should I fly or take the train between Beijing and Shanghai?', 'High-speed rail is often the simplest city-centre-to-city-centre option, but compare live 12306 schedules, complete station locations, fares, flight times, airport transfers, and your hotel locations before deciding.'],
      ['Which city is better for families or older travelers?', 'Either can work. Shanghai may be easier to cluster into shorter urban days, while Beijing offers more iconic historic sights. The best choice depends on mobility, weather, hotel location, transport, and whether a Great Wall day is essential.'],
      ['Can ChinaEase Buddy choose the right city for my route?', 'Yes. Share your dates, flights, trip length, interests, group size, pace, budget, mobility needs, and next destination to receive a route built around the real trip.'],
    ],
    sourceLinks: [
      ['The Palace Museum official international website', 'https://intl.dpm.org.cn/index.html'],
      ['Badaling Great Wall official website', 'https://www.badaling.cn/website/pc/index.html'],
      ['Shanghai Municipal Government: scenic spots', 'https://english.shanghai.gov.cn/en-ScenicSpots/'],
      ['China Railway 12306 English website', 'https://www.12306.cn/en/index.html'],
    ],
  },
  '3-day-beijing-itinerary': {
    article: true,
    title: beijingGuide.metaTitle,
    heading: beijingGuide.heading,
    description: beijingGuide.metaDescription,
    quickAnswer: quickAnswerText(beijingGuide.quickAnswer),
    faqs: beijingGuide.faqs.map(({ question, answer }) => [question, plainText(answer)]),
    sourceLinks: beijingGuide.sources.map(({ label, href }) => [label, href]),
    lastReviewed: beijingGuide.reviewed,
    lastModified: beijingGuide.modified,
  },
  '3-day-shanghai-itinerary': {
    title: '3-Day Shanghai Itinerary for First-Time Visitors (2026)',
    heading: '3-Day Shanghai Itinerary for First-Time Visitors (2026)',
    description: 'Plan three days in Shanghai with the Bund, Yuyuan Garden, Wukang Road, Pudong, museums, hotel areas, transport, food, costs, and alternatives.',
    quickAnswer: shanghaiVisitPlanning.quickAnswer,
    lastReviewed: 'September 21, 2026',
    lastModified: shanghaiVisitPlanning.modified,
    article: true,
    contentSections: [
      {
        title: 'Three days in Shanghai at a glance',
        table: {
          headers: ['Day', 'Main plan', 'Why this grouping works'],
          rows: [
            ['Day 1', 'Yuyuan Garden area, old-city streets, the Bund, Nanjing Road', 'Links traditional and historic waterfront sights without repeated cross-city travel'],
            ['Day 2', 'Wukang Road, former French Concession neighbourhoods, Xintiandi or a museum', 'Creates a walkable day focused on architecture, local streets, cafés, and culture'],
            ['Day 3', 'Pudong skyline, riverfront, observation deck or museum, flexible evening', 'Groups the east-bank landmarks and leaves room for weather or a special interest'],
          ],
        },
        items: [
          'This itinerary assumes three complete sightseeing days after arrival and before departure.',
          'The order can be reversed. Put the Bund and any observation deck on the clearest day, then use museums and covered attractions during heavy rain or extreme heat.',
          'Do not add Suzhou, Hangzhou, Zhujiajiao, Shanghai Disney, and every central landmark to the same three-day visit. Each addition replaces a city day rather than fitting around it.',
        ],
      },
      ...shanghaiVisitPlanning.sections,
      {
        title: 'Day 1: Yuyuan Garden, old Shanghai, and the Bund',
        ordered: true,
        items: [
          shanghaiVisitPlanning.gardenNote,
          'Allow time to distinguish the historic garden from the surrounding commercial streets; trying to photograph every lane can consume the whole morning.',
          'Continue toward the Bund and walk a focused section of the waterfront. The Shanghai municipal government describes it as a 1.5-kilometre protected historical district.',
          'Cross to or view Pudong when visibility is good, but save the deeper Pudong visit for Day 3 instead of repeatedly crossing the river.',
          'Finish with Nanjing Road or an evening Bund view according to energy and crowd levels. Keep the hotel address and nearest metro exit saved in Chinese.',
        ],
      },
      {
        title: 'Day 2: Wukang Road and central neighbourhoods',
        ordered: true,
        items: [
          'Start around Wukang Road and the surrounding historic streets. The municipal visitor pages highlight its varied architecture, residences, and lane houses.',
          'Walk in one direction instead of jumping between social-media photo locations. Choose a small number of streets, a café or lunch stop, and one cultural attraction.',
          'Continue toward Xintiandi, the Former Residence or First CPC National Congress area, People\'s Square, or a museum based on your interests and live opening schedule.',
          'For art and design, replace part of the neighbourhood walk with one museum or gallery rather than adding it after a full walking day.',
          'Use the evening for a local meal, a performance, or a relaxed neighbourhood walk; leave enough time for the return metro or a verified ride-hailing pickup.',
        ],
      },
      {
        title: 'Day 3: Pudong and a flexible final day',
        items: [
          'Visit Lujiazui and the Pudong riverfront for the contrast with the Bund. Choose one observation deck only if visibility and the live price justify it.',
          'The Oriental Pearl Tower is listed by Shanghai\'s municipal visitor pages as a combined sightseeing, dining, shopping, exhibition, and entertainment complex.',
          shanghaiVisitPlanning.museumNote,
          'If modern Shanghai is not your priority, replace Pudong with the Shanghai Museum, an art district, a food-focused day, or a slower neighbourhood route.',
          'Keep the final evening near the hotel when departing early the next morning, and verify the complete airport or railway-station name and terminal before bed.',
        ],
      },
      {
        title: 'Book and check these before the trip',
        table: {
          headers: ['Item', 'What to confirm', 'When to act'],
          rows: [
            ['Yuyuan Garden or major museum', 'Live opening day, ticket or reservation, passport requirement, entry gate', 'Before fixing that day around a timed entry'],
            ['Observation deck or performance', 'Visibility, operating hours, ticket conditions, last admission', 'Book only after checking the actual plan and weather'],
            ['Hotel', 'Foreign-passport check-in, Chinese address, nearest useful metro station', 'Before paying a non-refundable rate'],
            ['Airport transfer', 'Pudong or Hongqiao airport, terminal, arrival time, metro and taxi options', 'Before arrival day'],
            ['Onward train', 'Shanghai Hongqiao, Shanghai, or another complete station name; passport and change rules', 'Check through the official Railway 12306 service'],
          ],
        },
        items: [
          'Shanghai has multiple railway stations and two major airports. Never save only “Shanghai station” or “Shanghai airport.”',
          'Opening hours, reservation systems, temporary exhibitions, event controls, ferry services, and observation-deck operations can change. Recheck official notices immediately before visiting.',
        ],
      },
      {
        title: 'Where to stay for a three-day visit',
        items: [
          'People\'s Square and central Huangpu work well for first-time visitors who want convenient access to the Bund, metro lines, museums, and shopping.',
          'Jing\'an can suit travellers who prioritise restaurants, nightlife, and easy central transport while accepting a short ride to the Bund.',
          'Areas around the former French Concession suit neighbourhood walking and cafés, but the exact metro distance matters more than the district label.',
          'Lujiazui offers skyline views and modern hotels but is not automatically the most efficient base for a trip focused on historic central neighbourhoods.',
          'Confirm foreign-passport check-in, late-arrival arrangements, deposit method, breakfast time, and the hotel name and address in Chinese.',
        ],
      },
      {
        title: 'Transport, airports, and daily pace',
        items: [
          'Shanghai\'s municipal transportation guide identifies metro, bus, taxi, ferry, rail, and airport connections as the main travel options. Use the metro for predictable journeys and verified rides for awkward transfers.',
          'Allow time for station security, large interchanges, long corridors, the correct exit, and walking from the exit to the actual entrance.',
          'Pudong International Airport and Hongqiao Airport serve different routes and sit in very different parts of the city. Check the complete airport and terminal before planning transfer time.',
          'For the Bund, old city, and dense neighbourhoods, walking time can exceed the map estimate because of crowds, crossings, photographs, and heat or rain.',
          'Save Chinese destination names and screenshots for the hotel, station, airport, and each fixed booking. Mobile data and a payment backup should be ready before the first full day.',
        ],
      },
      {
        title: 'Adjust the itinerary for your trip',
        table: {
          headers: ['Situation', 'Best adjustment'],
          rows: [
            ['Only two full days', 'Keep Day 1 and Day 2; add only the Pudong view that fits naturally'],
            ['Four full days', 'Add Pudong in depth, one museum day, or one carefully selected nearby excursion'],
            ['Heavy rain or extreme heat', 'Move a museum or indoor attraction forward and shorten exposed waterfront walking'],
            ['Travelling with children', 'Reduce long neighbourhood walks and choose one clear family priority'],
            ['Limited mobility', 'Use shorter clusters, verify step-free access, and budget for more point-to-point transport'],
            ['Want Suzhou or Hangzhou', 'Add at least one extra day rather than squeezing a long excursion into the three city days'],
          ],
        },
        items: [
          'Shanghai Disney normally needs its own full day and advance planning. Treat it as a replacement for a city day or add another night.',
          'If Shanghai is part of a Beijing–Xi\'an–Shanghai route, connect this page with the 7-day, 10-day, or 14-day itinerary rather than planning every city independently.',
        ],
      },
    ],
    faqs: [
      ...shanghaiVisitPlanning.faqs.map(({ question, answer }) => [question, answer]),
      ['Are three days enough for Shanghai?', 'Yes. Three full days are enough for the Bund and old city, central historic neighbourhoods, and Pudong or a major museum. Three hotel nights with a late arrival and early departure are not the same as three full sightseeing days.'],
      ['What should I not miss on a first Shanghai trip?', 'Prioritise the Bund, one old-city or traditional sight such as Yuyuan Garden, one historic neighbourhood walk, and the Pudong skyline contrast. Add museums, food, shopping, or nightlife according to your interests.'],
      ['Should I stay near the Bund or in the former French Concession?', 'Stay near the Bund or People\'s Square for classic sights and central connections; choose the former French Concession area for neighbourhood walks and cafés. The exact hotel-to-metro distance and passport check-in matter more than the label.'],
      ['Can I visit Suzhou or Hangzhou during a three-day Shanghai trip?', 'You can, but it replaces a Shanghai day. For a first visit, add a fourth day if Suzhou or Hangzhou is important rather than compressing the Bund, neighbourhoods, Pudong, and a regional excursion.'],
      ['Which Shanghai airport is closer to the city?', 'Hongqiao is generally closer to central Shanghai, while Pudong handles many international flights. Always plan from the actual airport, terminal, arrival time, hotel, and live transport options.'],
      ['How should I get around Shanghai?', 'Use the metro for predictable cross-city journeys, walk within compact neighbourhood clusters, and use licensed taxis or app-based rides for awkward connections. Save Chinese addresses and verify the vehicle before entering.'],
      ['Can ChinaEase Buddy personalise this Shanghai itinerary?', 'Yes. Share your dates, flights or trains, hotel, group, interests, walking ability, budget, and fixed bookings to receive a route adapted to the real trip.'],
    ],
    sourceLinks: [
      ...shanghaiVisitPlanning.sources.map(({ label, href }) => [label, href]),
      ['Shanghai Municipal Government: scenic spots', 'https://english.shanghai.gov.cn/en-ScenicSpots/'],
      ['Shanghai Municipal Government: transportation', 'https://english.shanghai.gov.cn/en-Transportation/'],
      ['Shanghai Municipal Government: museums and galleries', 'https://english.shanghai.gov.cn/en-MuseumsGalleries/'],
      ['China Railway 12306 English website', 'https://www.12306.cn/en/index.html'],
    ],
  },
  '3-day-xian-itinerary': {
    title: '3-Day Xi\'an Itinerary for First-Time Visitors (2026)',
    heading: '3-Day Xi\'an Itinerary for First-Time Visitors (2026)',
    description: 'Plan three days in Xi\'an with the Terracotta Army, city wall, Muslim Quarter, Shaanxi History Museum, pagodas, hotels, transport, and alternatives.',
    quickAnswer: 'With three full days in Xi\'an, keep the Terracotta Army as a separate day, use one day for the city wall and historic centre, and reserve the third for the Shaanxi History Museum plus the Big Wild Goose Pagoda area or another focused interest. The official Terracotta Army museum states that foreign visitors can make real-name reservations through its website or official WeChat channel, and that the Terracotta Warriors Museum and Lishan Garden each need substantial time. Book the hardest museum first, use the same passport details throughout, and do not treat arrival or departure as a full sightseeing day.',
    lastReviewed: 'September 21, 2026',
    lastModified: '2026-09-21',
    article: true,
    contentSections: [
      {
        title: 'Three days in Xi\'an at a glance',
        table: { headers: ['Day', 'Main plan', 'Why this grouping works'], rows: [
          ['Day 1', 'City wall, Bell and Drum Tower area, Great Mosque and Muslim Quarter', 'Keeps the historic centre together and leaves room for food and evening atmosphere'],
          ['Day 2', 'Terracotta Army and optional Lishan Garden', 'Protects a full day for the out-of-centre transfer, real-name entry, and museum visit'],
          ['Day 3', 'Shaanxi History Museum, Big Wild Goose Pagoda area, flexible evening', 'Connects the region\'s history with Tang-era Xi\'an and allows an indoor alternative'],
        ] },
        items: ['This itinerary assumes three complete sightseeing days after arrival and before departure.', 'Book the hardest reservation first, then organise the other two days around its date and time.', 'Do not combine the Terracotta Army, city wall, Shaanxi History Museum, and a Tang show into one rushed day.'],
      },
      {
        title: 'Day 1: City wall and historic centre', ordered: true,
        items: [
          'Start at a city-wall gate that fits the rest of the route, after checking live opening, ticket, bicycle, weather, and gate-access information.',
          'Walk or cycle only the distance suitable for your fitness and weather. The full wall is much longer than a short photo stop and has limited shade in some conditions.',
          'Continue to the Bell and Drum Tower area, then visit the Great Mosque and surrounding lanes with respectful clothing and behaviour.',
          'Treat the Muslim Quarter as a broad neighbourhood experience rather than one famous main street. Compare stalls, watch hygiene, and order smaller portions to try more dishes.',
          'Keep the evening flexible for a night view, food, or an early finish before the Terracotta Army day.',
        ],
      },
      {
        title: 'Day 2: Terracotta Army day trip',
        items: [
          'Use the official Emperor Qinshihuang\'s Mausoleum Site Museum channel for the current real-name reservation and entry rules. Match the booking exactly to the passport carried on the day.',
          'Allow enough time for the transfer to Lintong, security, entry, the three main pits, exhibitions, crowds, and the return to central Xi\'an.',
          'The official museum explains that the Terracotta Warriors Museum and Lishan Garden are separate parts of the site and each requires about 1.5 hours; a shuttle links them.',
          'Decide in advance whether Lishan Garden is essential. Adding it creates a longer day and should not be treated as a quick extra.',
          'Avoid unverified “official” guides or transport offers near stations and entrances. Confirm the vehicle, pickup point, inclusions, and return arrangement before leaving.',
        ],
      },
      {
        title: 'Day 3: Shaanxi History Museum and Tang Xi\'an', ordered: true,
        items: [
          'Visit the Shaanxi History Museum only with a confirmed reservation for the correct venue. Its official site publishes live opening times, notices, transport, ticket information, and exhibitions.',
          'Allow several hours for the collection rather than rushing through every gallery. If tickets are unavailable, use Xi\'an Museum, the Stele Forest Museum, or another verified museum as the backup.',
          'Continue to the Big Wild Goose Pagoda and surrounding public spaces, choosing the actual pagoda visit, a neighbourhood walk, or evening atmosphere according to time and energy.',
          'Add one evening show only after checking the venue, seat, language support, start time, duration, and return transport.',
        ],
      },
      {
        title: 'Book and check these before the trip',
        table: { headers: ['Item', 'What to confirm', 'When to act'], rows: [
          ['Terracotta Army', 'Official real-name ticket, passport details, entry time, Lishan Garden plan, transport', 'As soon as the official booking window allows'],
          ['Shaanxi History Museum', 'Correct venue, official reservation, opening date, passport entry, exhibition access', 'Before fixing Day 3'],
          ['City wall', 'Open gates, bicycle operation, weather restrictions, last entry', 'Recheck the day before'],
          ['Hotel', 'Foreign-passport check-in, Chinese address, metro access, late arrival', 'Before paying a non-refundable rate'],
          ['Onward train', 'Xi\'an North or Xi\'an station, passport name, departure time, change rules', 'Check through the official Railway 12306 service'],
        ] },
        items: ['Use the exact passport spelling and document number across tickets, trains, and hotel bookings.', 'Museum opening hours, reservation releases, free-ticket rules, exhibitions, and temporary closures can change. Recheck official sources immediately before the visit.'],
      },
      {
        title: 'Where to stay for a three-day visit',
        items: ['Inside or near the city wall works well for first-time visitors who prioritise the historic centre, food, evening walks, and metro access.', 'The Bell Tower area is central, but check the exact room location, noise, road crossings, and distance to a useful metro entrance.', 'The Big Wild Goose Pagoda area can suit travellers prioritising museums, modern public spaces, and a calmer evening base.', 'Staying near Xi\'an North station only saves time for a specific early train; it is not automatically the best base for central sightseeing.', 'Confirm foreign-passport check-in, deposit method, breakfast time, and the hotel name and address in Chinese.'],
      },
      {
        title: 'Transport and daily pace',
        items: ['Use the metro for central-city journeys and verified taxis or ride-hailing for awkward connections. Save the destination in Chinese and verify the licence plate.', 'The Terracotta Army sits outside central Xi\'an, so compare official public transport with a clearly documented private transfer by total time and reliability.', 'Xi\'an North and Xi\'an railway stations are different. Save the complete station name shown on the ticket and allow time for security and passport checks.', 'Walking surfaces, stairs, heat, cold, rain, and crowds can change the pace. Build one flexible block into every day.'],
      },
      {
        title: 'Adjust the itinerary for your trip',
        table: { headers: ['Situation', 'Best adjustment'], rows: [
          ['Only two full days', 'Keep the Terracotta Army and combine a focused city-wall visit with one central neighbourhood'],
          ['Four full days', 'Add a deeper museum day, Hanyangling, the Stele Forest, or a slower food and neighbourhood day'],
          ['Museum tickets unavailable', 'Use Xi\'an Museum or another official museum and keep the Big Wild Goose Pagoda area'],
          ['Extreme heat or poor air/weather', 'Shorten exposed wall time and move an indoor museum earlier'],
          ['Travelling with children', 'Reduce museum duration, protect meal breaks, and avoid stacking a late show after the Terracotta Army'],
          ['Limited mobility', 'Use shorter wall sections, verify accessibility, and budget for more point-to-point transport'],
        ] },
        items: ['If Xi\'an is part of a Beijing–Xi\'an–Shanghai trip, connect this plan with the 7-day, 10-day, or 14-day itinerary and protect the rail transfer blocks.', 'A day trip to Mount Hua is not a casual addition to these three days; add another day and plan around weather, transport, tickets, and physical ability.'],
      },
    ],
    faqs: [
      ['Are three days enough for Xi\'an?', 'Yes. Three full days are enough for one historic-centre day, one Terracotta Army day, and one museum plus pagoda day. A late arrival and early departure should not be counted as two of those days.'],
      ['How much time do I need at the Terracotta Army?', 'Protect most of a day including the transfer from central Xi\'an. The official museum says the Terracotta Warriors Museum and Lishan Garden each need about 1.5 hours, before transport, security, queues, and breaks.'],
      ['Do foreigners need to book the Terracotta Army in advance?', 'Use the live official real-name reservation process and carry the passport used for booking. The museum states that foreign visitors can reserve through its official website or WeChat channel.'],
      ['Is the Shaanxi History Museum worth visiting?', 'Yes for travellers who want context for Zhou, Qin, Han, and Tang history. It can be difficult to reserve, so confirm the correct venue and keep another official museum as a backup.'],
      ['Where should a first-time visitor stay in Xi\'an?', 'Near the city wall or a useful central metro station is usually the simplest choice. The Bell Tower area is convenient, while the Big Wild Goose Pagoda area suits museum and evening-space priorities.'],
      ['Which railway station should I use in Xi\'an?', 'Use the exact station printed on the ticket. Xi\'an North handles many high-speed trains and is separate from Xi\'an station, so compare hotel transfer time before booking.'],
      ['Can ChinaEase Buddy personalise this Xi\'an itinerary?', 'Yes. Share your dates, trains or flights, hotel, group, interests, walking ability, budget, and fixed bookings to receive a route adapted to the actual trip.'],
    ],
    sourceLinks: [
      ['Emperor Qinshihuang\'s Mausoleum Site Museum official website', 'https://www.bmy.com.cn/index.html'],
      ['Shaanxi History Museum official website', 'https://www.sxhm.com/index.html'],
      ['Xi\'an City Wall official website', 'https://www.xacitywall.com/'],
      ['China Railway 12306 English website', 'https://www.12306.cn/en/index.html'],
    ],
  },
  '3-day-chongqing-itinerary': {
    title: '3-Day Chongqing Itinerary for First-Time Visitors (2026)',
    heading: '3-Day Chongqing Itinerary for First-Time Visitors (2026)',
    description: 'Plan three days in Chongqing with Hongya Cave, Liziba monorail, Three Gorges Museum, hotpot, river views, hotels, transport, hills, and alternatives.',
    quickAnswer: chongqingVisitPlanning.quickAnswer,
    lastReviewed: 'September 22, 2026',
    lastModified: chongqingVisitPlanning.modified,
    article: true,
    contentSections: [
      {
        title: 'Three days in Chongqing at a glance',
        table: { headers: ['Day', 'Main plan', 'Why this grouping works'], rows: [
          ['Day 1', 'Jiefangbei, central lanes, Chaotianmen area, Hongya Cave at night', 'Keeps the core peninsula together and saves the illuminated skyline for evening'],
          ['Day 2', 'Liziba monorail, Three Gorges Museum, People\'s Great Hall area, hotpot', 'Links an outdoor city icon with a substantial indoor history stop'],
          ['Day 3', 'Ciqikou and a slower neighbourhood day, or a pre-planned Dazu day trip', 'Lets you choose local atmosphere or one major heritage excursion without overloading the first two days'],
        ] },
        items: ['This plan assumes three complete sightseeing days after arrival and before departure.', 'Do not judge transfers by straight-line distance alone: hills, stairs, bridges, lifts, and multi-level roads change the real journey.', 'Keep one flexible block each day for weather, crowds, queues, and locating the correct building entrance.'],
      },
      ...chongqingVisitPlanning.sections,
      {
        title: 'Day 1: Jiefangbei, rivers, and Hongya Cave', ordered: true,
        items: ['Start around Jiefangbei and explore a small number of nearby streets instead of collecting distant photo stops.', 'Continue toward the Chaotianmen and river-confluence area, checking current access because construction, viewpoints, and walking routes can change.', 'Take a meal break before the evening crowds. For hotpot, choose the spice level deliberately and confirm whether the broth, condiments, and dishes are priced separately.', 'Visit Hongya Cave around dusk or after dark for the illuminated exterior. The famous viewpoint and the internal commercial complex are different experiences, so decide which matters most.', 'Before leaving, save a specific ride-hailing pickup point or metro entrance. A driver on another road level may be physically close but difficult to reach.'],
      },
      {
        title: 'Day 2: Liziba and Chongqing history', ordered: true,
        items: [chongqingVisitPlanning.lizibaNote, chongqingVisitPlanning.museumNote, 'Pair the museum with the People\'s Great Hall exterior and nearby public space, allowing time for security, galleries, and breaks.', 'Use the evening for one neighbourhood, a river view, or hotpot. Do not stack Liziba, every museum gallery, a cableway queue, a cruise, and Hongya Cave into the same day.'],
      },
      {
        title: 'Day 3: choose one clear priority',
        items: ['For a slower city day, visit Ciqikou early, leave the busiest main lane when possible, and keep the afternoon flexible for a café, riverside walk, or another neighbourhood.', 'For art and history, use the day for the UNESCO-listed Dazu Rock Carvings only after confirming current tickets, transport, opening information, and the exact site you will visit.', 'Wulong is another major excursion, but long transfers make it a demanding addition to a short first visit. Treat it as a dedicated day with verified transport rather than a quick side trip.', 'If rain, heat, or low visibility changes the plan, prioritise the museum and food experiences and move exposed viewpoints to the clearest period.'],
      },
      {
        title: 'Plan around Chongqing\'s vertical terrain',
        table: { headers: ['Situation', 'What can go wrong', 'Practical fix'], rows: [
          ['Map says the stop is close', 'The route may include steep stairs or several road levels', 'Check the walking profile and allow extra time'],
          ['Ride-hailing pickup', 'Driver and passenger can wait on different levels', 'Choose a named gate, hotel entrance, or landmark'],
          ['Large building or mall', 'Street level on one side may be a high floor on another', 'Save the floor, entrance, and Chinese place name'],
          ['Night attraction', 'Crowds make crossings and pickups slower', 'Arrive before peak darkness and leave from a planned point'],
          ['Limited mobility', 'Stairs and slopes can make short routes difficult', 'Use more point-to-point rides and verify lift access'],
        ] },
        items: ['Wear shoes with grip and carry only what you need. Wet steps and long descents can be tiring even when the total distance looks modest.', 'Download an offline copy of the hotel name, address, and phone number in Chinese.'],
      },
      {
        title: 'Where to stay for a three-day visit',
        items: ['Jiefangbei is convenient for a first visit focused on Hongya Cave, central food, and evening walks, but check noise and the exact walking route to the metro.', 'Near a useful metro interchange can be more practical than staying beside one famous sight. Compare the entrance, elevation, and last part of the walk.', 'Nan\'an can suit travellers prioritising skyline views, but river crossings add time to central sightseeing.', 'Confirm foreign-passport check-in, late-arrival arrangements, deposit method, and the hotel\'s Chinese address before paying a non-refundable rate.'],
      },
      {
        title: 'Bookings and transport to check',
        table: { headers: ['Item', 'What to confirm', 'When to check'], rows: [
          chongqingVisitPlanning.bookingRow,
          ['Dazu excursion', 'Official opening information, selected carving site, tickets, return transport', 'Before choosing Day 3'],
          ['Train', 'Chongqing North, West, Shapingba, or another exact station', 'Before booking hotel transfers'],
          ['Airport transfer', 'Terminal, metro operating time, realistic luggage route', 'Before arrival and departure'],
          ['Night activity', 'Weather, queue, final service, return pickup point', 'Recheck on the day'],
        ] },
        items: ['Use China Railway 12306 or another authorised channel and copy the complete station name from the ticket.', 'Opening hours, reservations, transport operations, and temporary closures can change. Recheck official sources immediately before the visit.'],
      },
      {
        title: 'Adjust the itinerary for your trip',
        items: ['With only two full days, keep the central peninsula and the Liziba–museum day; skip the out-of-city excursion.', 'With four or five days, add Dazu or Wulong as a dedicated excursion and keep a recovery evening afterward.', 'For families, shorten long museum blocks and protect regular meal and rest stops.', 'For limited mobility, reduce hillside wandering, verify accessible entrances, and budget for more direct rides.', 'If Chongqing is part of a longer China route, protect the transfer day and connect this plan with the 10-day or 14-day itinerary.'],
      },
    ],
    faqs: [
      ...chongqingVisitPlanning.faqs.map(({ question, answer }) => [question, answer]),
      ['Are three days enough for Chongqing?', 'Yes. Three full days cover the central peninsula, Liziba and a museum day, plus either a slower neighbourhood day or one carefully planned excursion. Arrival and departure days should not be counted as full sightseeing days.'],
      ['Is Chongqing difficult to walk around?', 'It can be. Hills, stairs, lifts, bridges, and stacked roads make map distance misleading. Group sights by area and elevation, use the metro and ride-hailing strategically, and allow extra time.'],
      ['When should I visit Hongya Cave?', 'The illuminated exterior is the main reason many visitors go after dark. Arriving around dusk can make orientation easier before peak crowds, but check current lighting, access, weather, and transport on the day.'],
      ['Is Liziba monorail worth visiting?', 'Yes if Chongqing\'s vertical transport and urban design interest you. Combine the designated viewing area with a ride on Line 2 and nearby history stops rather than making it a long standalone visit.'],
      ['Should I choose Dazu or Wulong for Day 3?', 'Choose Dazu for historic rock carvings and Wulong for dramatic natural scenery. Both require a dedicated, pre-planned day; for a slower first visit, stay in the city and use Ciqikou or another neighbourhood instead.'],
      ['Which Chongqing railway station should I use?', 'Use the exact station printed on your ticket. Chongqing has multiple major stations, and transfer times vary substantially, so compare the station with your hotel before booking.'],
      ['Can ChinaEase Buddy personalise this Chongqing itinerary?', 'Yes. Share your dates, arrival station or airport, hotel, group, walking ability, food preferences, budget, and fixed bookings for a route adapted to the actual trip.'],
    ],
    sourceLinks: [
      ...chongqingVisitPlanning.sources.map(({ label, href }) => [label, href]),
      ['Chongqing Municipal Government English website', 'https://english.cq.gov.cn/'],
      ['Chongqing Rail Transit official website', 'https://www.cqmetro.cn/'],
      ['Chongqing China Three Gorges Museum official website', 'https://www.3gmuseum.cn/'],
      ['UNESCO: Dazu Rock Carvings', 'https://whc.unesco.org/en/list/912/'],
      ['China Railway 12306 English website', 'https://www.12306.cn/en/index.html'],
    ],
  },
  '3-day-chengdu-itinerary': {
    title: '3-Day Chengdu Itinerary for First-Time Visitors (2026)',
    heading: '3-Day Chengdu Itinerary for First-Time Visitors (2026)',
    description: 'Plan three days in Chengdu with the Panda Base, People\'s Park, Sichuan food, museums, hotels, transport, Leshan, and Sanxingdui alternatives.',
    quickAnswer: 'With three full days in Chengdu, visit the Chengdu Research Base of Giant Panda Breeding early on one morning, use another day for People\'s Park, a teahouse, central neighbourhoods, and Sichuan food, then choose either a deeper city day or one focused excursion such as Leshan or Sanxingdui. The Panda Base requires advance online booking according to its official ticket notice. Do not combine pandas, Leshan, Sanxingdui, and every central attraction into three days; choose one out-of-city priority and leave room for meals, queues, and transport.',
    lastReviewed: 'September 22, 2026', lastModified: '2026-09-22', article: true,
    contentSections: [
      { title: 'Three days in Chengdu at a glance', table: { headers: ['Day', 'Main plan', 'Why this grouping works'], rows: [
        ['Day 1', 'People\'s Park, teahouse, central neighbourhoods, Sichuan dinner', 'Starts slowly and keeps flexible city experiences together'],
        ['Day 2', 'Early Panda Base visit, Giant Panda Museum if booked, relaxed evening', 'Protects the best part of the day for animal activity and the large park'],
        ['Day 3', 'Leshan or Sanxingdui, or a second Chengdu culture-and-food day', 'Gives one clear priority instead of stacking incompatible excursions'],
      ] }, items: ['This itinerary assumes three complete sightseeing days after arrival and before departure.', 'Book the Panda Base first, then organise the other days around its confirmed entry period.', 'Chengdu rewards slower meals and neighbourhood time, so avoid treating every stop as a short photo visit.'] },
      { title: 'Day 1: teahouse culture and central Chengdu', ordered: true, items: ['Start at People\'s Park and choose a teahouse experience without trying to schedule every park activity.', 'Continue through one or two central areas such as Kuanzhai Alley, Tianfu Square, or a nearby museum, depending on crowds and your interests.', 'Use the afternoon for a neighbourhood walk, café, or rest rather than crossing the city for another checklist sight.', 'Plan a Sichuan dinner with the spice level, allergies, offal, bones, and shared-dish format clearly communicated. Order conservatively before adding more.', 'Keep the evening flexible for Jinli, a performance, or a quieter local area, but verify current hours and transport before going.'] },
      { title: 'Day 2: Chengdu Panda Base', ordered: true, items: ['Reserve through the official Panda Base channel. Its current ticket notice says all visitors should book online in advance, with on-site sales subject to availability in special circumstances.', 'Choose the correct site: a Panda Base ticket does not cover the separate Dujiangyan Panda Valley.', 'Arrive early enough for your booked entry period and allow time for security, walking, orientation, crowds, and animal rest periods.', 'Use the official map to plan a limited route. The base is extensive, so prioritise a few enclosures instead of rushing everywhere.', 'If visiting the Chengdu Giant Panda Museum, follow its separate official reservation instructions. Keep the evening light after the long walking day.'] },
      { title: 'Day 3: choose Leshan, Sanxingdui, or Chengdu', items: ['Choose Leshan for the UNESCO-listed Giant Buddha and a full heritage excursion. Confirm the live rail or road plan, scenic-area tickets, weather, walking route, and return time.', 'Choose Sanxingdui for archaeology and bronze-age culture. Confirm the official museum reservation, the exact transport connection, passport entry rules, and return journey before fixing the day.', 'Stay in Chengdu if you prefer food, teahouses, markets, museums, or a lower-effort final day. Jinsha Site Museum can provide archaeological context without the longer Sanxingdui transfer.', 'Do not attempt both Leshan and Sanxingdui on the same day. Each deserves a focused visit and reliable return plan.'] },
      { title: 'Choose the right third day', table: { headers: ['Priority', 'Best choice', 'Main trade-off'], rows: [
        ['Giant Buddha and UNESCO heritage', 'Leshan', 'Longer transfer, weather and walking considerations'], ['Ancient archaeology and bronzes', 'Sanxingdui Museum', 'Advance reservation and out-of-city transport'], ['Food and relaxed local life', 'Stay in Chengdu', 'Fewer headline day-trip sights'], ['Travelling with young children', 'Panda day plus a gentle city day', 'Skip the longest excursion'], ['Limited mobility', 'Accessible city museums and direct rides', 'Verify each entrance and facility in advance'],
      ] }, items: ['Mount Emei normally needs more time than a casual addition to this three-day plan. Add a separate day or overnight plan if it is a priority.', 'Weather, ticket availability, group energy, and onward transport should decide the final choice.'] },
      { title: 'Where to stay and how to get around', items: ['Tianfu Square and nearby metro stations offer a central base for first-time visitors, but check the exact walk from the station exit.', 'Chunxi Road and Taikoo Li suit travellers prioritising restaurants, shopping, and evening activity; compare noise and room location.', 'A hotel near one attraction is not automatically convenient for the whole trip. Prioritise a useful metro connection and verified foreign-passport check-in.', 'Use the metro for predictable city transfers and verified ride-hailing for awkward connections. Save destinations and your hotel address in Chinese.', 'Tianfu International Airport is far from central Chengdu. Shuangliu and Tianfu are different airports, so confirm the full airport and terminal before planning the transfer.'] },
      { title: 'Book and check these before the trip', table: { headers: ['Item', 'What to confirm', 'When to act'], rows: [
        ['Panda Base', 'Correct site, official ticket, entry period, passport details, route', 'As soon as the official window allows'], ['Giant Panda Museum', 'Separate reservation method and entry conditions', 'Before fixing Day 2'], ['Day 3 excursion', 'Ticket, passport rules, transport, weather, return time', 'Before paying for a fixed transfer'], ['Hotel', 'Foreign-passport check-in, metro access, Chinese address, late arrival', 'Before choosing a non-refundable rate'], ['Train or flight', 'Exact station, airport, terminal, passport name, baggage rules', 'Before planning arrival and departure day'],
      ] }, items: ['Use the exact passport spelling across tickets, trains, flights, and hotels.', 'Opening hours, entry periods, museum reservations, animal visibility, and transport can change. Recheck official sources immediately before travel.'] },
      { title: 'Adjust the itinerary for your trip', items: ['With only two full days, keep the Panda Base and one central Chengdu day; skip the excursion.', 'With four days, add either Leshan or Sanxingdui without sacrificing the city experience.', 'With five or more days, consider Dujiangyan, Mount Qingcheng, or an overnight Emei plan after checking current access and transport.', 'For food allergies or dietary restrictions, carry a Chinese allergy card and confirm ingredients, broth, oils, garnishes, and shared utensils.', 'If Chengdu sits between Xi\'an and Shanghai, protect the transfer blocks and connect this plan with the 14-day China itinerary.'] },
    ],
    faqs: [
      ['Are three days enough for Chengdu?', 'Yes. Three full days allow one central city day, one Panda Base day, and either one excursion or a deeper city day. Arrival and departure days should not be counted as full sightseeing days.'],
      ['Do I need to book the Chengdu Panda Base in advance?', 'Yes. The official ticket page currently says all visitors are required to book online in advance, while on-site purchases in special circumstances depend on availability.'],
      ['What time should I visit the pandas?', 'An early visit is usually the most practical plan because it protects time for the large park and can avoid part of the later-day crowd. Animal activity is never guaranteed, so use the current official entry periods rather than relying on an old timetable.'],
      ['Should I visit Leshan or Sanxingdui?', 'Choose Leshan for the Giant Buddha and UNESCO heritage; choose Sanxingdui for archaeology and distinctive bronze culture. Both need a dedicated day and confirmed tickets and transport.'],
      ['Where should a first-time visitor stay in Chengdu?', 'A central hotel near a useful metro station around Tianfu Square, Chunxi Road, or another well-connected area is usually easiest. Confirm the exact station exit, noise, and foreign-passport check-in.'],
      ['Which Chengdu airport should I use?', 'Use the exact airport and terminal printed on the booking. Tianfu International and Shuangliu are different airports with very different transfer times from the centre.'],
      ['Can ChinaEase Buddy personalise this Chengdu itinerary?', 'Yes. Share your dates, arrival airport or station, hotel, group, walking ability, food needs, budget, and preferred excursion for a route adapted to the actual trip.'],
    ],
    sourceLinks: [
      ['Chengdu Research Base of Giant Panda Breeding: tickets', 'https://m.panda.org.cn/en/service/ticket/'], ['Chengdu Research Base of Giant Panda Breeding: visitor services', 'https://m.panda.org.cn/en/service/'], ['Chengdu Research Base of Giant Panda Breeding: official map', 'https://m.panda.org.cn/en/service/map/'], ['UNESCO: Mount Emei Scenic Area and Leshan Giant Buddha', 'https://whc.unesco.org/en/list/779/'], ['China Railway 12306 English website', 'https://www.12306.cn/en/index.html'],
    ],
  },
  '3-day-guilin-yangshuo-itinerary': {
    title: '3-Day Guilin and Yangshuo Itinerary (2026)', heading: '3-Day Guilin and Yangshuo Itinerary (2026)',
    description: 'Plan three days in Guilin and Yangshuo, or stay all three nights in Yangshuo. Compare Li River, Yulong River and Xingping routes, hotels and transfers.',
    quickAnswer: 'For three full days starting in Guilin, spend the first night there, travel down the Li River or transfer by road on Day 2, then use Yangshuo for the Yulong River and karst countryside. If you arrive directly near Yangshuo, stay there for all three nights and make Xingping a separate day instead of backtracking to Guilin. Confirm the actual station, pier, hotel access, weather and luggage transfers; Yangshuo town, Xingping and the river activities are not one compact stop.',
    lastReviewed: 'October 19, 2026', lastModified: '2026-10-19', article: true,
    contentSections: [
      { title: 'Three days at a glance', table: { headers: ['Day', 'Main plan', 'Overnight'], rows: [['Day 1', 'Arrive in Guilin, lakes or one central sight, prepare the river transfer', 'Guilin'], ['Day 2', 'Li River cruise or verified road transfer, arrive in Yangshuo, easy evening', 'Yangshuo'], ['Day 3', 'Yulong River and countryside, or Xingping as the main alternative', 'Yangshuo or depart']] }, items: ['This itinerary assumes three complete sightseeing days; a late arrival should not be counted as Day 1.', 'One night in Guilin and two in Yangshuo usually reduces backtracking for a landscape-focused first visit.', 'Longji rice terraces need additional transfer time and normally work better with a fourth day.'] },
      { title: 'Three days based in Yangshuo instead', table: { headers: ['Day', 'Main plan', 'Transfer check'], rows: [
        ['Day 1', 'Travel directly to your Yangshuo hotel; take a short town or countryside walk after check-in', 'Confirm your actual arrival station or airport and the hotel vehicle-access point'],
        ['Day 2', 'Keep one full day for the Yulong River countryside; add a regulated rafting section only if it is operating', 'Confirm section, pickup, return transport, weather and any booking rules'],
        ['Day 3', 'Choose Xingping and a Li River viewpoint, or use the day for a slower countryside route', 'Check the onward train or flight and leave a realistic transfer buffer'],
      ] }, items: ['This version works when the landscape is the priority and you do not need a Guilin city night or a full Guilin-to-Yangshuo cruise.', 'Yangshuo railway station is near Xingping rather than Yangshuo town; a train arrival still needs an onward road transfer.', 'If you depart from Guilin airport or a Guilin station, plan the return trip separately instead of treating Day 3 as a full sightseeing day.'] },
      { title: 'Day 1: arrive and keep Guilin simple', ordered: true, items: ['Check whether you arrive at Guilin Liangjiang International Airport, Guilin railway station, Guilin North, or Guilin West; they require different transfers.', 'Choose one compact city experience such as the central lakes, Elephant Trunk Hill area, or a relaxed food walk rather than filling the day with distant caves and parks.', 'Confirm the next morning\'s Li River cruise pier, pickup, ticket, passport requirements, luggage policy, and Yangshuo drop-off before sleeping.', 'If weather or river operations make the cruise unsuitable, keep a verified road transfer as the alternative.'] },
      { title: 'Day 2: Guilin to Yangshuo', ordered: true, items: ['For the classic river journey, use a verified Li River cruise product and confirm the actual departure pier. Common piers sit outside the city centre.', 'Allow for the transfer to the pier, check-in, the cruise itself, disembarkation, and the final transfer to your Yangshuo hotel.', 'If travelling by road instead, use the saved Chinese hotel address and confirm whether the driver reaches the hotel entrance or a nearby vehicle-access point.', 'After check-in, keep the evening easy. West Street can be lively and crowded; it is optional rather than the whole Yangshuo experience.'] },
      { title: 'Day 3: Yulong River countryside or Xingping', items: ['Choose the Yulong River for a slower countryside day, cycling or walking, and a separately booked regulated rafting section if operating.', 'Choose Xingping for Li River viewpoints and an old-town base, but verify the transfer from Yangshuo and do not assume Yangshuo railway station sits beside Yangshuo town.', 'For cycling or e-bikes, check the vehicle, helmet, traffic comfort, weather, battery, route surface, and return plan before leaving.', 'Avoid entering closed river sections or using unverified boats. Heavy rain, high water, heat, and poor visibility can change the safest plan.'] },
      { title: 'Choose one main landscape experience', table: { headers: ['Experience', 'Best for', 'Main planning issue'], rows: [['Li River cruise', 'Classic Guilin-to-Yangshuo scenery', 'Correct pier, fixed departure, luggage and weather'], ['Yulong River', 'Slower countryside and short activities', 'Section choice, rafting operation and local transfers'], ['Xingping', 'River viewpoints and photography', 'Separate location and station confusion'], ['Longji terraces', 'Rice terraces and village landscapes', 'Long transfer; add a fourth day'], ['Yangshuo town', 'Restaurants and convenient base', 'Crowds and distance from rural scenery']] }, items: ['A cruise and a Yulong countryside day complement each other; multiple similar boat activities may not add enough value.', 'Choose activities for the actual season and river conditions, not only for photos seen online.'] },
      { title: 'Where to stay and how to move', items: ['Stay centrally in Guilin only for the first night and an easy morning departure; verify the transfer to the actual cruise pier.', 'In Yangshuo, town is convenient for restaurants, while countryside hotels provide quieter scenery but require more transport.', 'Confirm that the hotel accepts foreign passports and save its Chinese name, phone number, location pin, and vehicle-access instructions.', 'Yangshuo railway station is closer to Xingping than to Yangshuo town. Calculate the full hotel transfer before selecting it.', 'Use China Railway 12306 for the exact station name and train, and allow time for security and passport checks.'] },
      { title: 'Book and check before travel', table: { headers: ['Item', 'What to confirm', 'When to check'], rows: [['Li River cruise', 'Operator, pier, pickup, entry ID, luggage, end point', 'Before booking the Guilin hotel'], ['Yulong activity', 'Official operation, section, age or safety rules, weather', 'Recheck the day before'], ['Hotel', 'Foreign-passport check-in, road access, Chinese address', 'Before paying a non-refundable rate'], ['Train', 'Exact Guilin or Yangshuo-area station and passport details', 'Before fixing transfers'], ['Outdoor day', 'Rain, heat, visibility, water conditions, closure notices', 'Morning of the activity']] }, items: ['River schedules, piers, access, rafting sections, and safety restrictions can change. Confirm with official or authorised channels immediately before travel.', 'Keep a weather-safe alternative such as a shorter city route, café, museum, or rest block.'] },
      { title: 'Adjust this itinerary', items: ['With two full days, travel directly to Yangshuo or use the Li River transfer, then keep one countryside day.', 'With four days, add Longji, a slower Xingping day, or more time in the Yangshuo countryside—choose one.', 'With children or limited mobility, reduce cycling and steep viewpoints, confirm boat access, and arrange point-to-point transport.', 'If Guilin and Yangshuo replace Chengdu in a 14-day China route, compare the exact flight or rail connection before fixing the city order.', 'Avoid stacking a late show after a long outdoor day unless transport and group energy are secure.'] },
    ],
    faqs: [
      ['Are three days enough for Guilin and Yangshuo?', 'Yes for one Guilin arrival day, one river or transfer day, and one Yangshuo countryside day. Add another day for Longji or a slower Xingping visit.'], ['Should I stay in Guilin or Yangshuo?', 'For a scenery-focused trip, spend the first night in Guilin and two nights in Yangshuo. Guilin is useful for arrival and cruise access; Yangshuo is better for the Yulong River and countryside.'], ['Can I spend all three days in Yangshuo?', 'Yes if your arrival and departure connections work. Keep one day for the Yulong River countryside, one for Xingping or a second slower route, and a flexible arrival day. This skips a Guilin city night and may skip the full Guilin-to-Yangshuo cruise; check your station and hotel transfers.'], ['Is the Li River cruise worth it?', 'It is the classic Guilin-to-Yangshuo landscape journey and also functions as a transfer. Confirm the operator, pier, luggage arrangement, weather policy, and Yangshuo endpoint before booking.'], ['What is the difference between the Li River and Yulong River?', 'The Li River offers the broader Guilin-to-Yangshuo landscape journey. The Yulong River is a smaller Yangshuo-area countryside experience suited to shorter activities, walking, cycling, and regulated rafting sections.'], ['Is Yangshuo railway station in Yangshuo town?', 'No. It is closer to Xingping and requires an onward transfer to Yangshuo town. Calculate the full journey before booking a train or hotel pickup.'], ['Should I add the Longji rice terraces?', 'Add Longji only with another day or by replacing a core activity. The road transfer and village access make it a poor fit as a rushed extra in this three-day plan.'], ['Can ChinaEase Buddy personalise this route?', 'Yes. Share your dates, arrival station or airport, hotels, group, mobility, weather tolerance, and preferred river activities for a route adapted to the actual trip.'],
    ],
    sourceLinks: [['Visit Guilin: official Guilin travel guide', 'https://visitguilin.org/'], ['Visit Guilin: Li River', 'https://visitguilin.org/things-to-do/guilin-attractions/li-river/'], ['Visit Guilin: Yulong River', 'https://visitguilin.org/things-to-do/yangshuo-attractions/yulong-river/'], ['China Railway 12306 English website', 'https://www.12306.cn/en/index.html']],
  },
  '3-day-zhangjiajie-itinerary': {
    title: '3-Day Zhangjiajie Itinerary for First-Time Visitors (2026)', heading: '3-Day Zhangjiajie Itinerary for First-Time Visitors (2026)',
    description: 'Plan three days in Zhangjiajie with Wulingyuan, the national forest park, Tianmen Mountain, hotels, park entrances, trains, weather, and alternatives.',
    quickAnswer: 'With three full days, stay near Wulingyuan for two days in Zhangjiajie National Forest Park, then use one separate day for Tianmen Mountain near Zhangjiajie city. Wulingyuan is a large UNESCO-listed scenic area, not one short trail, and Tianmen Mountain is a different attraction with its own ticket and access route. Confirm the park entrance, timed ticket, shuttle and cableway operations, weather, walking difficulty, and final transport before each day. See the dated Tianmen cableway and Line C update below.',
    lastReviewed: 'September 22, 2026', lastModified: zhangjiajieTianmenUpdate.modified, article: true,
    contentSections: [
      { title: 'Three days at a glance', table: { headers: ['Day', 'Main plan', 'Best base'], rows: [['Day 1', 'Wulingyuan entrance, Yuanjiajie area, one upper scenic route', 'Wulingyuan'], ['Day 2', 'Second forest-park route: Tianzi Mountain or a valley-level alternative', 'Wulingyuan'], ['Day 3', 'Tianmen Mountain, then Zhangjiajie city departure', 'Zhangjiajie city']] }, items: ['This plan assumes three complete sightseeing days and workable weather.', 'Do not combine Tianmen Mountain with a full Wulingyuan park day.', 'Keep one route flexible because fog, rain, wind, queues, and transport operations can change visibility and access.'] },
      zhangjiajieTianmenUpdate.section,
      { title: 'Day 1: first Wulingyuan park route', ordered: true, items: ['Enter through the gate that matches your hotel and planned route; Wulingyuan and Zhangjiajie National Forest Park gates are not interchangeable starting points.', 'Use the official park map and live shuttle information to select one upper scenic area rather than chasing every viewpoint.', 'Allow time for queues at shuttle buses, lifts, cableways, and popular viewpoints.', 'Carry water and weather protection, but keep luggage at the hotel. Return before the final internal transport service.'] },
      { title: 'Day 2: second forest-park route', items: ['Choose a contrasting route such as Tianzi Mountain, Yangjiajie, Golden Whip Stream, or another open section based on weather and walking ability.', 'Low cloud can hide upper viewpoints; a valley walk may be the better alternative, but rain can make stone paths slippery.', 'Do not assume every lift, cableway, trail, or gate is operating. Check live notices and last-service times.', 'Move to Zhangjiajie city after the park only if it improves the confirmed Tianmen Mountain entry and departure plan.'] },
      { title: 'Day 3: Tianmen Mountain', ordered: true, items: ['Check the dated Tianmen route notice above, then follow the entry time and starting point on your current booking. If Line C applies, do not use an old Line A/B route; newer operator instructions take priority.', 'Allow most of the day for check-in, queues, cableway or shuttle travel, cliff paths, weather changes, and descent.', 'Glass walkways and exposed cliff paths are optional. Choose alternatives if heights, rain, wind, or mobility make them unsuitable.', 'Keep a generous buffer before an evening train or flight; do not rely on a best-case descent time.'] },
      { title: 'Do not confuse these places', table: { headers: ['Place', 'What it is', 'Planning consequence'], rows: [['Wulingyuan', 'Main tourist base and a common park entrance area', 'Best for two forest-park days'], ['Zhangjiajie National Forest Park', 'Part of the wider Wulingyuan scenic area', 'Multiple gates and large internal transport network'], ['Tianmen Mountain', 'Separate mountain attraction by Zhangjiajie city', 'Separate ticket and dedicated day'], ['Zhangjiajie city', 'Transport hub near Tianmen Mountain', 'Not the best base for early Wulingyuan starts'], ['Zhangjiajie West station', 'Major railway station', 'Check hotel and park transfer time']] }, items: ['Save every gate, hotel, station, and ticket name in Chinese.', 'A place that looks close on a map may still require a shuttle, cableway, queue, or mountain road.'] },
      { title: 'Where to stay and how to move', items: ['Stay near Wulingyuan for the first two park days to protect early starts and reduce daily transfers.', 'Move to Zhangjiajie city only when Tianmen Mountain or an early departure makes it useful.', 'Confirm foreign-passport check-in, luggage storage, breakfast time, and late arrival before booking.', 'Use verified hotel transfers, official park transport, or ride-hailing with the destination saved in Chinese.', 'Check whether your train uses Zhangjiajie West or another station and copy the exact station from the ticket.'] },
      { title: 'Book and check before travel', table: { headers: ['Item', 'What to confirm', 'When to check'], rows: [['Wulingyuan ticket', 'Valid dates, entrance, passport, included transport, re-entry rules', 'Before choosing the hotel'], ['Tianmen Mountain', 'Route product, timed entry, cableway or shuttle sequence', 'Before fixing Day 3'], ['Weather', 'Rain, fog, wind, heat, visibility and warnings', 'Each morning'], ['Hotel', 'Correct base, foreign-passport check-in, luggage transfer', 'Before paying'], ['Train or flight', 'Exact station or airport, departure buffer and baggage', 'Before the final day']] }, items: ['Tickets, route products, park sections, lifts, cableways, shuttle buses, and safety closures can change.', 'Use current official notices and keep a lower-level or rest-day alternative.'] },
      { title: 'Adjust this itinerary', items: ['With two full days, choose one Wulingyuan day and one Tianmen Mountain day.', 'With four days, add another forest-park route or a recovery day; do not automatically add another distant attraction.', 'With children or limited mobility, shorten cliff paths, verify lift access, and protect meal and toilet breaks.', 'In heavy fog, prioritise safe lower routes and accept that famous pillar views may not appear.', 'If Zhangjiajie replaces Chengdu or Guilin in a longer China route, verify the actual flight or rail schedule before setting the city order.'] },
    ],
    faqs: [...zhangjiajieTianmenUpdate.faqs.map(({ question, answer }) => [question, answer]), ['Are three days enough for Zhangjiajie?', 'Yes for two Wulingyuan park days and one Tianmen Mountain day. Add time for slower walking, uncertain weather, or another regional attraction.'], ['Is Tianmen Mountain inside Zhangjiajie National Forest Park?', 'No. Tianmen Mountain is a separate attraction near Zhangjiajie city with its own ticket and access route.'], ['Where should I stay in Zhangjiajie?', 'Stay near Wulingyuan for the forest-park days, then consider Zhangjiajie city for Tianmen Mountain or an early departure.'], ['Which park entrance should I use?', 'Use the entrance that matches the confirmed route and hotel. Multiple gates lead to different parts of the large scenic area, so do not choose only by the English name.'], ['What if Zhangjiajie is foggy or raining?', 'Upper viewpoints may disappear and stone paths can become slippery. Check warnings and live operations, use a safe lower route, or keep a flexible rest block.'], ['Which railway station serves Zhangjiajie?', 'Many high-speed services use Zhangjiajie West, but use the exact station printed on the ticket and calculate the transfer from your hotel.'], ['Can ChinaEase Buddy personalise this itinerary?', 'Yes. Share your dates, tickets, hotel, walking ability, heights tolerance, group, and onward transport for a route adapted to the actual trip.']],
    sourceLinks: [...zhangjiajieTianmenUpdate.sourceLinks, ['UNESCO: Wulingyuan Scenic and Historic Interest Area', 'https://whc.unesco.org/en/list/640/'], ['Hunan Provincial Government English website', 'https://enghunan.gov.cn/'], ['China Railway 12306 English website', 'https://www.12306.cn/en/index.html']],
  },
  '3-day-shenzhen-itinerary': {
    title: '3-Day Shenzhen Itinerary for First-Time Visitors (2026)', heading: '3-Day Shenzhen Itinerary for First-Time Visitors (2026)',
    description: 'Plan three days in Shenzhen with Futian, museums, OCT-LOFT, Shenzhen Bay, Nantou, food, hotels, Metro, airport transfers, and flexible day-three options.',
    quickAnswer: 'With three full days, use one day for Shenzhen\'s civic centre and modern skyline, one for the Nanshan creative and waterfront corridor, and one flexible day for a theme park, Dapeng coast, shopping, or another neighbourhood. Stay near a Metro interchange in Futian or Nanshan, group places by district, and do not treat distant Dapeng beaches as a quick city-centre stop. Confirm museum reservations, attraction tickets, opening hours, weather warnings, and the exact airport, railway-station, or Hong Kong border transfer before travel.',
    lastReviewed: 'September 22, 2026', lastModified: shenzhenItineraryPlanning.modified, article: true,
    contentSections: [
      { title: 'Three days at a glance', table: { headers: ['Day', 'Main plan', 'Area'], rows: [['Day 1', 'Shenzhen Museum, Civic Center, Lianhuashan Park, Futian evening', 'Futian'], ['Day 2', 'OCT-LOFT, Nantou Ancient Town, Shenzhen Bay waterfront', 'Nanshan'], ['Day 3', 'Choose one: theme park, Dapeng coast, electronics and shopping, or a slower local day', 'Route-specific']] }, items: ['This plan assumes three complete sightseeing days, not arrival and departure fragments.', 'Shenzhen is long from east to west. Group each day geographically instead of crossing the city repeatedly.', 'Keep Day 3 flexible because the best option depends on weather, interests, ticket availability, and onward transport.'] },
      shenzhenItineraryPlanning.durationSection,
      { title: 'Day 1: understand modern Shenzhen', ordered: true, items: ['Start around Civic Center and visit the appropriate Shenzhen Museum venue after checking its current opening, reservation, and passport rules.', 'Walk through the civic district, then use Lianhuashan Park for an elevated city view if the weather and visibility are suitable.', 'Leave time for a rest during hot or humid weather; much of this day can be split between indoor exhibits and outdoor walking.', 'Finish in Futian with a food or evening block close to your hotel instead of adding a distant attraction.'] },
      { title: 'Day 2: design, history and the bay', ordered: true, items: ['Begin at OCT-LOFT for galleries, design spaces, cafés, and adaptive industrial architecture; check individual venue opening days.', 'Continue to Nantou Ancient Town for a contrasting layer of local history and regenerated urban space.', 'Move toward Shenzhen Bay Park or another confirmed waterfront section for late afternoon. Distances along the bay are larger than they look.', 'Choose a sunset or dinner stop that keeps the return simple. Coastal weather, heat, rain, and temporary access controls can change the plan.'] },
      shenzhenItineraryPlanning.metroSection,
      { title: 'Day 3: choose one route', table: { headers: ['Option', 'Best for', 'Planning note'], rows: [['Window of the World or another theme park', 'Families, entertainment, a full attraction day', 'Check dated tickets, opening hours and show schedules'], ['Dapeng Peninsula', 'Coast, villages and a slower scenic day', 'A long transfer; verify beach or site access and return transport'], ['Huaqiangbei and central shopping', 'Technology, markets, malls and flexible indoor time', 'Compare prices and warranty terms; keep valuables secure'], ['Shekou and Sea World area', 'Waterfront, dining and a relaxed urban day', 'Useful when you want less travel than Dapeng'], ['Extra local day', 'Museums, cafés, parks or recovery', 'Best after a late arrival or before onward travel']] }, items: ['Dapeng Fortress and the eastern beaches are not on the central Metro grid; plan the full transfer and avoid a tight evening departure.', 'A theme-park day usually fills the day. Do not stack it with Futian, Nantou, or Dapeng.', 'If the weather is poor, favour museums, design venues, shopping areas, and food rather than forcing a coastal plan.'] },
      { title: 'Where to stay', items: ['Futian works well for first-time visitors who want central Metro connections, Civic Center access, business-district hotels, and straightforward travel to major stations.', 'Nanshan suits OCT, Nantou, Shenzhen Bay, Shekou, and many technology-district visits, but calculate the exact airport or railway transfer.', 'Luohu can be useful for Dongmen, traditional shopping areas, Shenzhen Railway Station, and the Luohu border, but it is less convenient for western Nanshan days.', 'Confirm that the hotel accepts foreign passports, record the Chinese name and address, and check which station exit is closest.', 'Do not choose a hotel described only as “near Hong Kong” without identifying the actual border crossing and its operating arrangements.'] },
      { title: 'Airport, trains, Metro and border planning', table: { headers: ['Journey', 'What to verify', 'Common mistake'], rows: [['Shenzhen Bao\'an Airport', 'Terminal, Metro or taxi plan, late-arrival time', 'Assuming the airport is close to Futian or Luohu'], ['High-speed rail', 'Exact station: Shenzhen North, Futian, Shenzhen, or another station', 'Going to the wrong station'], ['City Metro', 'Correct line, interchange, exit and last-train time', 'Estimating distance only from the English place name'], ['Hong Kong crossing', 'Eligible documents, chosen checkpoint, current hours and onward route', 'Treating every border point as interchangeable'], ['Dapeng or eastern coast', 'Road transfer, weather, reservation or access rules, return plan', 'Planning it as a short Metro excursion']] }, items: ['Airport Line 11 connects the airport corridor with central and western parts of the city, but the best route depends on the hotel and current service.', 'Save destinations in Chinese and use the live route in a reliable map app.', 'Use the exact station printed on a China Railway ticket; Shenzhen has several major stations.'] },
      { title: 'Food, payments and practical pacing', items: ['Try Cantonese and Chaoshan-influenced food, dim sum, roast meats, seafood, noodles, and Shenzhen\'s broad migrant-city dining scene, but choose by dietary needs and location rather than a rigid checklist.', 'For serious allergies, show a written Chinese allergy card and confirm ingredients; translation tools do not guarantee kitchen separation.', 'Prepare Alipay or WeChat Pay with a physical card and some RMB cash as backup.', 'Summer heat, humidity, heavy rain, and tropical-cyclone warnings can materially change outdoor days. Check official forecasts and local notices.', 'Shenzhen rewards a slower district-based plan. One museum, one neighbourhood, one park or waterfront, and one meal focus can be enough for a strong day.'] },
      { title: 'Book and check before travel', items: ['Check the current Shenzhen Museum venue, reservation method, closure day, passport entry, and exhibition notices.', 'Buy dated theme-park tickets only after confirming the day and cancellation terms.', 'For Dapeng, verify attraction or beach access, weather, transport, and any reservation requirement.', 'Confirm the exact hotel, railway station, airport terminal, or border checkpoint in Chinese.', 'Review official weather warnings and keep an indoor alternative for every coastal or park day.'] },
    ],
    faqs: [[shenzhenItineraryPlanning.durationFaq.question, shenzhenItineraryPlanning.durationFaq.answer], ['Is Shenzhen worth visiting for tourists?', 'Yes if you enjoy modern Chinese cities, design, technology, food, parks, waterfronts, shopping, or a contrast with older historic destinations. The city works best when planned by district.'], ['Where should a first-time visitor stay in Shenzhen?', 'Futian is the easiest all-round base for many first visits. Nanshan is strong for OCT, Nantou, Shenzhen Bay, and Shekou; Luohu suits Dongmen, Shenzhen Railway Station, and the Luohu crossing.'], ['Can I visit Shenzhen from Hong Kong for the day?', 'It may be possible if your passport, entry permission, chosen checkpoint, and timings allow it, but verify current immigration rules and checkpoint hours. Three days gives a much better view of the city.'], ['Which Shenzhen railway station should I use?', 'Use the exact station on your ticket. Shenzhen North, Futian, Shenzhen, and other stations are in different parts of the city and are not interchangeable.'], ['Should I include Dapeng in a three-day trip?', 'Choose Dapeng only if coast or heritage is a priority and you can give it most of a day. It requires more road travel than central attractions and is weather-sensitive.'], ['Can ChinaEase Buddy personalise this Shenzhen itinerary?', 'Yes. Share your dates, hotel, arrival point, interests, group, pace, weather tolerance, and onward route for a district-by-district plan.']],
    sourceLinks: [...shenzhenItineraryPlanning.sources.map(({ label, href }) => [label, href]), ['Shenzhen Government Online: Travel Guide', 'https://www.sz.gov.cn/en_szgov/travel/guide/'], ['Shenzhen Government Online: Travel', 'https://www.sz.gov.cn/en_szgov/travel/index.html'], ['Shenzhen Metro: Line 11', 'https://www.szmc.net/szmc_enm/Time_Table/Line11/202003/83269.html'], ['China Railway 12306 English website', 'https://www.12306.cn/en/index.html']],
  },
  '3-day-guangzhou-itinerary': {
    title: '3-Day Guangzhou Itinerary for First-Time Visitors (2026)', heading: '3-Day Guangzhou Itinerary for First-Time Visitors (2026)',
    description: 'Plan three days in Guangzhou with Chen Clan Ancestral Hall, Yongqingfang, Shamian, Canton Tower, dim sum, hotels, Metro, airport and train advice.',
    quickAnswer: 'With three full days, use one day for old Guangzhou and Xiguan culture, one for the modern Pearl River and Canton Tower area, and one flexible museum, park, food, or day-trip day. Stay near a useful Metro interchange in Yuexiu, Liwan, Tianhe, or Haizhu rather than choosing only by hotel price. Reserve capacity-controlled museums or tower tickets where required, check closure days and weather, and confirm the exact Guangzhou railway station and Baiyun Airport terminal before travel.',
    lastReviewed: 'September 23, 2026', lastModified: '2026-09-23', article: true,
    contentSections: [
      { title: 'Three days at a glance', table: { headers: ['Day', 'Main plan', 'Area'], rows: [['Day 1', 'Chen Clan Ancestral Hall, Yongqingfang, Enning Road, Shamian Island', 'Liwan'], ['Day 2', 'Guangdong Museum or city museum, Huacheng Square, Canton Tower and Pearl River evening', 'Tianhe and Haizhu'], ['Day 3', 'Choose one: Yuexiu history, Baiyun Mountain, Chimelong, food-focused exploration, or Foshan', 'Route-specific']] }, items: ['This plan assumes three complete sightseeing days rather than partial arrival and departure days.', 'Guangzhou is large, humid for much of the year, and busy around trade fairs and public holidays. Group places by district.', 'Treat meals as part of the itinerary: dim sum and Cantonese dinner reservations can shape the most efficient route.'] },
      { title: 'Day 1: old Guangzhou and Xiguan', ordered: true, items: ['Start at Chen Clan Ancestral Hall and check the current opening hours, ticket or reservation method, passport entry, and closure notices.', 'Continue through Liwan toward Yongqingfang, Enning Road, or the Cantonese Opera Arts Museum, choosing only the venues that match your pace.', 'Use Shamian Island for a slower late-afternoon walk among historic buildings and mature trees.', 'Finish with Cantonese food in Liwan or return toward the hotel. Do not add Canton Tower merely because it looks close on a map.'] },
      { title: 'Day 2: museums, the new city and the Pearl River', ordered: true, items: ['Choose one main museum such as Guangdong Museum after confirming its current reservation system, opening days, exhibition access, and passport requirements.', 'Walk through Huacheng Square and the Zhujiang New Town civic axis when heat, rain, and visibility allow.', 'Cross toward the Canton Tower area or select a riverside viewpoint. A tower ticket and a Pearl River cruise are separate products, not automatic parts of the same visit.', 'For a night cruise, verify the pier, boarding time, route, passport rule, cancellation terms, and last Metro connection before paying.'] },
      { title: 'Day 3: choose one route', table: { headers: ['Option', 'Best for', 'Planning note'], rows: [['Yuexiu Park and historic centre', 'History, monuments, a moderate city day', 'Combine with one nearby museum or temple, not a distant theme park'], ['Baiyun Mountain', 'Green space and city views', 'Weather, heat, walking ability and transport affect the day'], ['Chimelong area', 'Families, wildlife or theme parks', 'A full attraction day in Panyu; buy the correct dated product'], ['Food-focused Guangzhou', 'Dim sum, markets, neighbourhoods and slower travel', 'Check restaurant queues and serious allergy needs'], ['Foshan extension', 'Lingnan culture, ceramics or martial-arts history', 'Confirm intercity route and keep a full return buffer']] }, items: ['Choose one Day 3 route. Chimelong, Baiyun Mountain, and Foshan should not be stacked together.', 'In heavy rain or extreme heat, use museums, covered shopping areas, and a longer meal instead of forcing outdoor sightseeing.', 'If you depart that evening, keep the final activity in the same side of the city as the correct railway station or airport route.'] },
      { title: 'Where to stay in Guangzhou', items: ['Yuexiu is practical for Beijing Road, older city sights, parks, and central Metro connections.', 'Liwan is best for Xiguan culture, Yongqingfang, Shamian, traditional food, and a slower historic atmosphere.', 'Tianhe suits modern malls, business travel, Guangzhou East connections, and the Zhujiang New Town area, but it is farther from Liwan sights.', 'Haizhu works for Canton Tower, the Pearl River, Pazhou, and Canton Fair visits; event dates can sharply change hotel prices and transport demand.', 'Confirm foreign-passport check-in, the nearest station exit, luggage storage, and the exact Chinese hotel address before paying.'] },
      { title: 'Airport, train and Metro planning', table: { headers: ['Journey', 'What to verify', 'Common mistake'], rows: [['Baiyun International Airport', 'T1, T2 or T3, live airline assignment, rail or road transfer', 'Going to the wrong terminal'], ['Guangzhou South', 'Long Metro or taxi transfer from central districts', 'Treating it as a city-centre station'], ['Guangzhou East', 'Exact train and onward Metro route', 'Confusing it with Guangzhou or Guangzhou South'], ['Guangzhou or Guangzhou Baiyun station', 'Station name printed on the ticket', 'Using “Guangzhou station” as a generic term'], ['City Metro', 'Line, interchange, exit and last-train time', 'Choosing the nearest-looking English place name']] }, items: ['Baiyun Airport now has multiple terminals and transport arrangements; check the current terminal rather than relying on an old screenshot.', 'Guangzhou has several major railway stations. Use the exact station shown in 12306 and allow time for security and passport checks.', 'Foreign visitors can use several Metro payment routes, but keep a physical bank card and some RMB cash as backup.'] },
      { title: 'How to plan Cantonese food', items: ['For dim sum, decide whether you want an early local breakfast, a hotel-friendly late morning, or a famous restaurant that may require queueing.', 'Useful categories include dim sum, roast goose or other roast meats, wonton noodles, claypot rice, congee, double-skin milk, and seasonal Cantonese dishes; availability differs by restaurant.', 'Do not order a long checklist at every meal. Choose one or two priorities and leave room for neighbourhood discoveries.', 'For allergies or strict dietary requirements, show a written Chinese card, confirm stocks and sauces, and understand that translation does not guarantee separation from allergens.', 'Save the restaurant name and branch in Chinese because chains can have several locations across the city.'] },
      { title: 'Weather, crowds and booking checks', items: ['Spring and summer can bring heat, humidity, heavy rain and tropical-cyclone disruption. Check official forecasts and warnings every day.', 'The Canton Fair and other major events can increase hotel prices, Metro crowding and taxi demand, especially around Pazhou and business districts.', 'Museums commonly have closure days, capacity limits or online reservation systems. Verify each venue shortly before the visit.', 'Canton Tower, cruises, Chimelong parks and special exhibitions may use dated or timed tickets with separate cancellation terms.', 'Keep one indoor alternative and protect transfer buffers before flights or high-speed trains.'] },
      { title: 'Adjust this itinerary', items: ['With two days, keep the Liwan old-city day and the Pearl River modern-city day.', 'With four days, add one full Day 3 option rather than spreading distant attractions across several rushed half-days.', 'For a Shenzhen–Guangzhou combination, use the real railway station pair and hotel locations to choose the city order.', 'For children, older travellers, or limited mobility, reduce long walks, check step-free exits, and plan air-conditioned breaks.', 'If food is the priority, shorten the attraction list and reserve time for breakfast, tea, dinner, and neighbourhood movement.'] },
    ],
    faqs: [['Are three days enough for Guangzhou?', 'Yes for old Guangzhou, the modern Pearl River area, and one flexible interest day. Add time for several theme parks, a full Foshan trip, business events, or slower food exploration.'], ['Is Guangzhou worth visiting for first-time China travellers?', 'Yes if you value Cantonese food, Lingnan architecture, historic trading districts, museums, modern skyline views, or a Shenzhen and Hong Kong regional route.'], ['Where should I stay in Guangzhou?', 'Yuexiu is the easiest general base, Liwan is strongest for old-city culture, Tianhe suits modern business and shopping, and Haizhu is useful for Canton Tower or Pazhou. Choose by the exact daily route.'], ['Should I visit Canton Tower?', 'Visit if skyline views or the tower experience matter to you and visibility is suitable. Otherwise, riverside public areas can provide a strong evening without a tower ticket.'], ['Which Guangzhou railway station should I use?', 'Use the exact station printed on your ticket. Guangzhou South, Guangzhou East, Guangzhou, and Guangzhou Baiyun are different stations with different transfer times.'], ['Can Guangzhou and Shenzhen be combined?', 'Yes. High-speed trains make the cities easy to combine, but station locations, ticket availability, hotel transfers, and the actual sightseeing route determine whether a day trip or overnight stay works better.'], ['Can ChinaEase Buddy personalise this Guangzhou itinerary?', 'Yes. Share your dates, hotel, arrival station or terminal, food priorities, interests, group, pace, and onward city for a practical district-based plan.']],
    sourceLinks: [['Guangzhou International: old and new Guangzhou', 'https://www.eguangzhou.gov.cn/gznewsphotos/content/post_30437.html'], ['Guangzhou Government: transport guide for international visitors', 'https://www.gz.gov.cn/zfjg/gzsjtysj/zwfw/jtfw/content/post_9599057.html'], ['Guangzhou Government: Baiyun Airport terminal transport', 'https://www.gz.gov.cn/zwfw/zxfw/jtfw/content/post_10690829.html'], ['China Railway 12306 English website', 'https://www.12306.cn/en/index.html']],
  },
  '3-day-hangzhou-itinerary': {
    title: '3-Day Hangzhou Itinerary for First-Time Visitors (2026)', heading: '3-Day Hangzhou Itinerary for First-Time Visitors (2026)',
    description: 'Plan three days in Hangzhou with West Lake, Lingyin Temple, Longjing tea, the Grand Canal, Hefang Street, hotels, trains, airport and weather advice.',
    quickAnswer: 'With three full days, give West Lake one unhurried day, combine Lingyin and the western hills or Longjing area on another, then use the third day for the Grand Canal, Southern Song heritage, a wetland, or a water-town extension. Stay near the east or north side of West Lake, a useful Metro interchange, or Hangzhou East only when transport convenience matters more than atmosphere. Confirm temple and museum reservations, boat operations, weather, the exact railway station, and Xiaoshan Airport transfer before travel.',
    lastReviewed: 'September 23, 2026', lastModified: '2026-09-23', article: true,
    contentSections: [
      { title: 'Three days at a glance', table: { headers: ['Day', 'Main plan', 'Planning focus'], rows: [['Day 1', 'West Lake causeways, gardens, viewpoints and optional boat', 'Keep the route compact'], ['Day 2', 'Lingyin area, Feilai Peak and a Longjing or western-hills block', 'Reservations and road traffic'], ['Day 3', 'Grand Canal and historic streets, or one full alternative', 'Choose by weather and interests']] }, items: ['This plan assumes three complete sightseeing days rather than arrival and departure fragments.', 'West Lake is a large cultural landscape, not one viewpoint. Trying to circle every shore section usually weakens the day.', 'Weekend, holiday, blossom, lotus, autumn and temple crowds can materially change walking and road times.'] },
      { title: 'Day 1: experience West Lake without rushing', ordered: true, items: ['Choose one coherent side of West Lake based on your hotel and weather, then connect a causeway, garden, historic site, and waterside walk.', 'Use a legal sightseeing boat only if the current route, pier, timetable, weather and ticket terms fit the day. Do not treat old online prices or schedules as current.', 'Leave room for tea, lunch, rain shelter, photography and crowded paths rather than filling every hour with named viewpoints.', 'Finish on the side of the lake that gives you a simple dinner and hotel return. Night shows, cruises and tower or pagoda tickets require separate checks.'] },
      { title: 'Day 2: Lingyin and tea country', ordered: true, items: ['Start early for Lingyin and the Feilai Peak scenic area after checking the current ticket, reservation, identity-document and opening arrangements.', 'Dress and behave respectfully at religious sites; incense, prayer areas, photography and access rules can differ by zone.', 'Choose one second block: Longjing village and tea fields, Meijiawu, another western-hills walk, or an early return to the lake.', 'Use official taxis, ride-hailing or confirmed buses for hillside areas. Road congestion can make a short map distance take much longer.', 'Buy tea only when origin, grade, weight, price and seller are clear; a tasting does not create an obligation to purchase.'] },
      { title: 'Day 3: choose one Hangzhou route', table: { headers: ['Option', 'Best for', 'Planning note'], rows: [['Grand Canal and Xiaohe/Zhejiang museum area', 'Urban history, crafts and slower neighbourhoods', 'Check museum closure days and canal boat operations'], ['Hefang Street and Southern Song heritage', 'Historic lanes, snacks, medicine and shopping', 'Crowded and commercial; pair with one nearby museum'], ['Xixi Wetland', 'Nature and a quieter full block', 'Large site; confirm entrance, boat route and weather'], ['Liangzhu museums or archaeology', 'Ancient history and design', 'A separate outer-city route with reservations'], ['Water-town extension', 'Canals and traditional architecture', 'Choose one town and calculate the full road or rail transfer']] }, items: ['Do not combine the Grand Canal, Xixi, Liangzhu and a distant water town in one day.', 'If rain is heavy, prioritise museums and sheltered neighbourhoods; if visibility is poor, skip view-dependent plans.', 'Keep a generous departure buffer because scenic-area traffic and Hangzhou East station security can be busy.'] },
      { title: 'Where to stay in Hangzhou', items: ['The east and northeast sides of West Lake are convenient for first-time sightseeing, restaurants and Metro access, but prices and crowds can be higher.', 'The north or northwest side can suit Lingyin, the Grand Canal and quieter lake access, depending on the exact station and bus route.', 'Near Hangzhou East railway station is practical for a short Shanghai extension or early train but less atmospheric for evenings.', 'Qianjiang New Town suits business, modern skyline and transport connections but adds travel to classic West Lake sights.', 'Confirm foreign-passport check-in, the Chinese hotel address, nearest Metro exit, luggage storage and late-arrival instructions before paying.'] },
      { title: 'Airport, train and city transport', table: { headers: ['Journey', 'What to verify', 'Common mistake'], rows: [['Hangzhou Xiaoshan Airport', 'Terminal, Metro or road transfer and late-arrival plan', 'Assuming it is close to West Lake'], ['Hangzhou East', 'Most high-speed services, station entrance and hotel transfer', 'Underestimating the station size'], ['Hangzhou station', 'Exact service and city-centre transfer', 'Confusing it with Hangzhou East'], ['Hangzhou West or South', 'Ticket station name and long cross-city transfer', 'Going to the familiar station instead of the booked one'], ['West Lake scenic area', 'Walking, bus, taxi restrictions and live congestion', 'Expecting Metro to reach every lakeside stop']] }, items: ['Shanghai–Hangzhou trains are frequent in principle, but ticket availability, departure station, arrival station and hotel location determine the real convenience.', 'Use the exact station printed in 12306 and arrive with time for security and foreign-passport ticket checks.', 'Save key destinations in Chinese and combine Metro with walking, buses or verified ride-hailing.'] },
      { title: 'Tea, food and shopping', items: ['Longjing tea is closely associated with Hangzhou, but harvest season, origin, grade and processing affect price and taste. Do not rely on packaging alone.', 'Hangzhou dishes can include freshwater fish, pork, bamboo shoots and sweet or delicate flavours; check ingredients rather than assuming a dish name explains everything.', 'For serious allergies, show a written Chinese allergy card and confirm stocks, oils and sauces; translation does not guarantee separation.', 'Hefang Street and scenic areas are useful for browsing but not automatically the best place for every tea, silk or souvenir purchase.', 'Keep Alipay or WeChat Pay ready with a physical card and some RMB cash as backup.'] },
      { title: 'Weather, crowds and reservations', items: ['Spring rain, summer heat and humidity, typhoon-related disruption, autumn crowds and winter damp cold can all change the practical route.', 'West Lake remains attractive in imperfect weather, but boats, exposed walks, hill routes and sunset plans are condition-dependent.', 'Lingyin and popular museums may use reservation or capacity controls, especially on weekends and public holidays.', 'Check live official notices each morning and keep one indoor museum or historic-street alternative.', 'Avoid public-holiday day trips from Shanghai unless transport and crowd levels are acceptable.'] },
      { title: 'Adjust this itinerary', items: ['With two days, keep West Lake and Lingyin, then add only a short historic-street or canal block.', 'With four days, add one full third-day alternative such as Xixi, Liangzhu or a water town.', 'For Shanghai plus Hangzhou, an overnight stay protects early and evening West Lake time better than a rushed return day trip.', 'With children or limited mobility, shorten causeway walks, verify boat and step-free access, and plan frequent rest stops.', 'If tea culture is the priority, reduce lake stops and arrange one credible plantation or producer visit without committing to a purchase.'] },
    ],
    faqs: [['Are three days enough for Hangzhou?', 'Yes for West Lake, Lingyin and one additional canal, museum, wetland or historic-area day. Add time for several outer-city sites or a distant water town.'], ['Can Hangzhou be a day trip from Shanghai?', 'Yes, but station transfers and West Lake travel reduce usable time. Staying one or two nights produces a calmer visit and gives you early morning or evening at the lake.'], ['Where should I stay in Hangzhou?', 'For a first visit, choose the east or north side of West Lake near useful transport. Stay by Hangzhou East only when an early or late train is the main constraint.'], ['Do I need a full day for West Lake?', 'A full day is appropriate if you want a causeway, gardens, historic sites, a boat or tea break without rushing. A short visit should focus on one side rather than circling the entire lake.'], ['Do I need to reserve Lingyin Temple?', 'Reservation, ticket and identity-document arrangements can change and may involve separate scenic-area access. Check the current official instructions before the visit.'], ['Which Hangzhou railway station should I use?', 'Use the exact station printed on your ticket. Hangzhou East, Hangzhou, Hangzhou West and Hangzhou South are different stations with very different transfer times.'], ['Can ChinaEase Buddy personalise this Hangzhou itinerary?', 'Yes. Share your dates, hotel, arrival station, walking ability, tea or heritage interests, group, weather tolerance, and onward city for a practical route.']],
    sourceLinks: [['UNESCO: West Lake Cultural Landscape of Hangzhou', 'https://whc.unesco.org/en/list/1334/'], ['UNESCO: The Grand Canal', 'https://whc.unesco.org/en/list/1443/'], ['Hangzhou city international portal', 'https://www.ehangzhou.gov.cn/'], ['China Railway 12306 English website', 'https://www.12306.cn/en/index.html']],
  },
  '3-day-suzhou-itinerary': {
    article: true,
    title: suzhouGuide.metaTitle,
    heading: suzhouGuide.heading,
    description: suzhouGuide.metaDescription,
    quickAnswer: quickAnswerText(suzhouGuide.quickAnswer),
    faqs: suzhouGuide.faqs.map(({ question, answer }) => [question, plainText(answer)]),
    sourceLinks: suzhouGuide.sources.map(({ label, href }) => [label, href]),
    lastReviewed: suzhouGuide.reviewed,
    lastModified: suzhouGuide.modified,
  },
  '3-day-nanjing-itinerary': {
    article: true,
    title: nanjingGuide.metaTitle,
    heading: nanjingGuide.heading,
    description: nanjingGuide.metaDescription,
    quickAnswer: quickAnswerText(nanjingGuide.quickAnswer),
    faqs: nanjingGuide.faqs.map(({ question, answer }) => [question, plainText(answer)]),
    sourceLinks: nanjingGuide.sources.map(({ label, href }) => [label, href]),
    lastReviewed: nanjingGuide.reviewed,
    lastModified: nanjingGuide.modified,
  },
  '3-day-dali-itinerary': daliGuide,
  'china-golden-week-2026-travel-guide': goldenWeekGuide,
  'great-wall-of-china-day-trip-from-beijing': greatWallGuide,
  'chengdu-panda-base-guide': {
    article: true,
    title: pandaBaseGuide.metaTitle,
    heading: pandaBaseGuide.heading,
    description: pandaBaseGuide.metaDescription,
    quickAnswer: quickAnswerText(pandaBaseGuide.quickAnswer),
    faqs: pandaBaseGuide.faqs.map(({ question, answer }) => [question, plainText(answer)]),
    sourceLinks: pandaBaseGuide.sources.map(({ label, href }) => [label, href]),
    lastReviewed: pandaBaseGuide.reviewed,
    lastModified: pandaBaseGuide.modified,
  },
  'didi-payment-for-foreigners': {
    article: true,
    title: didiPaymentGuide.metaTitle,
    heading: didiPaymentGuide.heading,
    description: didiPaymentGuide.metaDescription,
    quickAnswer: quickAnswerText(didiPaymentGuide.quickAnswer),
    faqs: didiPaymentGuide.faqs.map(({ question, answer }) => [question, plainText(answer)]),
    sourceLinks: didiPaymentGuide.sources.map(({ label, href }) => [label, href]),
    lastReviewed: didiPaymentGuide.reviewed,
    lastModified: didiPaymentGuide.modified,
  },
  'beijing-airport-to-city-guide': beijingAirportGuide,
  'amap-vs-google-maps-china': {
    article: true,
    title: mapsComparisonGuide.metaTitle,
    heading: mapsComparisonGuide.heading,
    description: mapsComparisonGuide.metaDescription,
    quickAnswer: quickAnswerText(mapsComparisonGuide.quickAnswer),
    faqs: mapsComparisonGuide.faqs.map(({ question, answer }) => [question, plainText(answer)]),
    sourceLinks: mapsComparisonGuide.sources.map(({ label, href }) => [label, href]),
    lastReviewed: mapsComparisonGuide.reviewed,
    lastModified: mapsComparisonGuide.modified,
  },
  'best-time-to-visit-china': {
    title: 'Best Time to Visit China: Month-by-Month Guide (2026)',
    heading: 'Best Time to Visit China: Weather and Crowds by Month (2026)',
    description:
      'For a classic Beijing, Xi\'an and Shanghai trip, April to May and September to October are useful starting windows. Compare regions, weather and crowds.',
    quickAnswer:
      'For a classic first trip through Beijing, Xi\'an, and Shanghai, late spring and autumn usually offer the easiest balance of outdoor sightseeing and manageable temperatures. April to May and September to October are useful starting windows, but avoid assuming the whole country shares one climate and check the exact public-holiday dates before booking. Northern China, the humid east and south, high-altitude western regions, and tropical Hainan can need completely different timing. Choose the route first, then compare city-level climate, current forecasts, weather warnings, holiday crowds, and live prices for your exact dates.',
    lastReviewed: 'September 21, 2026',
    lastModified: '2026-09-21',
    article: true,
    contentSections: [
      {
        title: 'The best season depends on your route',
        table: {
          headers: ['Season', 'Often works well for', 'Main trade-offs'],
          rows: [
            ['Spring: March–May', 'Beijing, Xi\'an, Shanghai, gardens, walking, multi-city first trips', 'Fast weather changes, rain in some regions, northern wind or dust, early-May crowds'],
            ['Summer: June–August', 'High-altitude routes, school-holiday travel, long daylight, some mountain regions', 'Heat, humidity, heavy rain, flooding, typhoons in affected coastal areas, larger crowds'],
            ['Autumn: September–November', 'Classic city routes, walking, northern landscapes, photography', 'Early-October holiday demand, shorter days later in the season, rapid cooling in the north'],
            ['Winter: December–February', 'Harbin, snow, lower-season city travel, southern escapes', 'Cold in the north, limited daylight, seasonal closures, Spring Festival transport demand'],
          ],
        },
        items: [
          'There is no single nationwide best month. China spans tropical, temperate, arid, monsoon, mountain, and high-altitude environments.',
          'A comfortable Beijing week can coincide with very different rain, heat, or altitude conditions elsewhere, so compare every overnight stop.',
          'Use climate patterns for the first decision, then switch to official short-range forecasts and warnings close to departure.',
        ],
      },
      {
        title: 'China month by month',
        table: {
          headers: ['Month', 'Where it can work', 'What to plan around'],
          rows: [
            ['January', 'Harbin snow trips, Yunnan, Hainan, quieter major cities', 'Severe cold in the north, winter daylight, ice, holiday dates'],
            ['February', 'Winter culture, southern routes, selected city trips', 'Spring Festival crowds and closures vary by lunar calendar'],
            ['March', 'Yunnan, southern and eastern city trips, early spring routes', 'Unstable temperatures, rain, wind, possible northern dust'],
            ['April', 'Beijing–Xi\'an–Shanghai, gardens, walking, many classic routes', 'Cool mornings, spring rain, Qingming travel demand'],
            ['May', 'Northern and central routes, mountains before peak summer heat', 'Early-May public-holiday demand, rising heat and rain later'],
            ['June', 'Highlands, some mountain routes, early-summer travel', 'Heat, humidity, rainy seasons, school-calendar effects'],
            ['July', 'Tibet and some high-altitude or northern routes', 'Peak heat, heavy rain, flooding, school holidays, strong demand'],
            ['August', 'Highlands, grasslands, family travel', 'Heat, rain, typhoon disruption in affected coastal regions, crowds'],
            ['September', 'Classic multi-city routes, northern and western scenery', 'Residual heat or rain in some regions; check Mid-Autumn dates'],
            ['October', 'Beijing, Xi\'an, Shanghai, many scenic routes', 'National Day holiday demand at the start of the month; cooling later'],
            ['November', 'Major cities, Yunnan, some southern routes', 'Shorter days, colder north, seasonal change and dry conditions'],
            ['December', 'Harbin season, southern cities, lower-season urban travel', 'Cold, ice, reduced daylight, winter attraction schedules'],
          ],
        },
        items: [
          'This table is a planning screen, not a forecast. Conditions vary by year, city, elevation, and the exact week.',
          'Do not buy non-refundable transport solely because a month is described as “best” online. Check the route and live conditions first.',
        ],
      },
      {
        title: 'Choose timing by region',
        table: {
          headers: ['Region or route', 'Useful starting window', 'Important constraint'],
          rows: [
            ['Beijing and northern China', 'April–May or September–October', 'Winter cold, summer heat and rain, wind or dust, holiday crowds'],
            ['Shanghai, Hangzhou, and eastern China', 'Spring or autumn', 'Humidity, plum-rain periods, summer heat, coastal storms'],
            ['Xi\'an and central routes', 'Spring or autumn', 'Hot summers, cold winters, outdoor walking load'],
            ['Chengdu and Sichuan Basin', 'Spring or autumn for many city routes', 'Cloud, humidity, rain, mountain conditions outside the city'],
            ['Guilin and Yangshuo', 'Spring or autumn, depending on the experience', 'Rain, river conditions, heat, visibility, outdoor activity safety'],
            ['Yunnan', 'Route-specific across much of the year', 'Elevation, large day–night temperature range, regional rainy season'],
            ['Tibet and high-altitude west', 'Specialist route and season planning', 'Altitude health, permits where applicable, snow, road and flight disruption'],
            ['Guangdong, Hainan, and the far south', 'Cooler months for many visitors', 'Summer heat, humidity, rain, and tropical-cyclone risk'],
          ],
        },
        items: [
          'A multi-region itinerary inherits the hardest weather constraint. The best dates for Shanghai do not automatically make a Tibet or Hainan extension sensible.',
          'For mountains, river cruises, hiking, cycling, or high altitude, check operators, local authorities, forecasts, and safety notices.',
        ],
      },
      {
        title: 'Spring: the flexible first-trip season',
        items: [
          'Spring can work well for the classic Beijing–Xi\'an–Shanghai route because much of the sightseeing is outdoors and summer heat has not fully arrived.',
          'March may still feel wintry in northern cities while southern and eastern regions move into wetter conditions. Pack layers instead of assuming uniform mild weather.',
          'April is a strong general planning month, but reservations, weekends, Qingming travel, blossoms, and local events can still change prices and crowds.',
          'May becomes warmer and wetter in many places. Check the official early-May holiday arrangement before choosing transport or attraction dates.',
        ],
      },
      {
        title: 'Summer: possible, but build weather resilience',
        items: [
          'Summer is not automatically a bad time, especially when school holidays or high-altitude destinations determine the trip, but the itinerary needs more recovery and indoor alternatives.',
          'Heat and humidity can reduce realistic walking time. Plan one main outdoor anchor, start earlier, carry water, and protect the hottest part of the day.',
          'Heavy rain can affect urban transport, mountain access, rivers, flights, and trains. Coastal routes may also face tropical-cyclone disruption.',
          'China Meteorological Administration describes official warnings for typhoons, heavy rain, severe convection, high temperatures, floods, and geological risks.',
          'Use flexible bookings where disruption would damage the whole route, and keep an indoor backup for every weather-sensitive day.',
        ],
      },
      {
        title: 'Autumn: excellent weather, but watch the calendar',
        items: [
          'September and October often suit classic city routes, walking, and northern scenery, but early autumn can remain hot or wet in some southern and eastern regions.',
          'The National Day holiday period around early October can sharply increase domestic travel demand, accommodation prices, attraction crowds, and rail-ticket competition.',
          'Late October and November may be quieter, but northern destinations cool quickly and daylight shortens.',
          'Autumn colour timing is local and weather-dependent. Do not build a non-refundable trip around a single predicted foliage date.',
        ],
      },
      {
        title: 'Winter: lower-season value or a snow-focused trip',
        items: [
          'Winter can be rewarding for Harbin, snow experiences, museums, food, and quieter urban travel, provided you plan for cold, ice, and shorter daylight.',
          'Southern destinations may be more comfortable than northern cities, but weather still differs by elevation and coast.',
          'Outdoor sites may operate shorter schedules or close sections in poor conditions. Verify official opening information for each key attraction.',
          'Spring Festival dates move with the lunar calendar and can transform transport demand, business hours, hotel availability, and family travel patterns.',
        ],
      },
      {
        title: 'Public holidays can matter more than the weather',
        items: [
          'Before paying, check the State Council\'s official holiday arrangement for your travel year. Compensatory working days and the exact break length can change annually.',
          'The highest-impact periods for many first-time routes include Spring Festival, the early-May Labor Day break, and the National Day holiday period around early October.',
          'Holiday travel is possible, but reserve intercity transport, hotels, and capacity-controlled attractions early and expect more queueing and less flexibility.',
          'A date just outside a peak period can be more valuable than a theoretically perfect weather week inside it.',
        ],
      },
      {
        title: 'A practical booking timeline',
        ordered: true,
        items: [
          'Choose the regions and non-negotiable experiences before choosing the month.',
          'Check visa or visa-free eligibility, passport validity, permitted route, and entry conditions.',
          'Compare city-level climate patterns and the official annual public-holiday calendar.',
          'Price open-jaw international flights, hotels, and domestic transport for at least two nearby date windows.',
          'Choose flexible terms for weather-sensitive routes and peak periods.',
          'Reserve capacity-controlled attractions and transport when their official sales windows open.',
          'Review official forecasts and warnings before departure and each weather-sensitive travel day.',
        ],
      },
      {
        title: 'Common timing mistakes',
        items: [
          'Using one city\'s monthly temperature to plan a route across several climate zones.',
          'Calling April, May, September, or October “perfect” without checking the exact holiday calendar.',
          'Treating climate averages as a guarantee for a particular week.',
          'Planning every day outdoors with no heat, rain, cold, or air-quality alternative.',
          'Booking mountains, river activities, or high-altitude travel without local safety checks.',
          'Choosing the cheapest flight dates before comparing hotels, trains, and attraction closures.',
        ],
      },
    ],
    faqs: [
      ['What is the best month to visit China?', 'For a classic Beijing, Xi\'an, and Shanghai trip, April, May, September, and October are useful months to compare. The best exact week depends on public holidays, current weather, prices, and the regions in your route.'],
      ['Is spring or autumn better for China?', 'Both can work well. Spring brings changing temperatures and rain patterns, while autumn can bring comfortable city weather but heavy early-October demand. Choose using your route and exact dates rather than the season name alone.'],
      ['When is the cheapest time to travel to China?', 'Lower prices are more likely outside major public holidays, school breaks, major events, and the most popular weather windows. Compare live flights and hotels because low season differs by city and experience.'],
      ['Should I avoid China during Golden Week?', 'If you have flexible dates, avoiding the National Day holiday period around early October usually reduces competition for trains, hotels, and attractions. If you must travel then, book early and simplify the route.'],
      ['Is summer too hot for a China trip?', 'Not always, but many eastern, central, and southern routes can be hot and humid, with heavy rain and possible coastal storm disruption. Use shorter outdoor blocks, indoor alternatives, weather warnings, and flexible bookings.'],
      ['Can I visit China in winter?', 'Yes. Winter suits Harbin, snow experiences, museums, quieter city travel, and some southern routes. Plan around cold, ice, daylight, seasonal opening hours, and Spring Festival demand.'],
      ['Can ChinaEase Buddy choose dates for my itinerary?', 'Yes. Share your possible dates, destinations, interests, group, pace, weather tolerance, and budget so the route can be matched to the season and practical constraints.'],
    ],
    sourceLinks: [
      ['China Meteorological Administration', 'https://www.cma.gov.cn/en/'],
      ['National Meteorological Centre forecasts and warnings', 'https://www.nmc.cn/publish/forecast.html'],
      ['State Council policy portal', 'https://english.www.gov.cn/policies/'],
      ['China government Visit China portal', 'https://english.www.gov.cn/services/visitchina/'],
    ],
  },
  'china-esim-internet-guide': {
    title: 'China eSIM for Tourists (2026): Buy, Install & Get Online',
    heading: 'How to Get an eSIM in China (2026 Internet Guide)',
    description:
      'China travel eSIM: check your phone is unlocked, buy a plan covering mainland China, install it on Wi-Fi before you fly, then follow the activation steps.',
    quickAnswer:
      'To get an eSIM for China, first confirm that your phone is carrier-unlocked and eSIM-compatible. Choose a travel plan that explicitly covers mainland China, buy and install it on reliable Wi-Fi before your flight, then follow the provider\'s activation timing and select it for mobile data after landing. Do not assume every China eSIM gives access to Google or other restricted services: routing, phone-number support, hotspot rules, speed limits, and activation policies differ by plan.',
    lastReviewed: 'October 20, 2026',
    lastModified: '2026-10-20',
    article: true,
    contentSections: [
      {
        title: 'How to get an eSIM for China',
        ordered: true,
        items: [
          'Check that your exact phone model supports eSIM and is not locked to your home carrier.',
          'Compare provider plans that explicitly include mainland China, the trip dates, data allowance, network coverage, hotspot rules, and support channel you need.',
          'Confirm whether the plan is data-only and whether it supports the international services you rely on; do not infer either point from the word eSIM.',
          'Buy and install the plan on reliable Wi-Fi before departure, then save its QR code, order number, APN details, and setup instructions offline.',
          'After landing, enable the travel line and any provider-required data roaming, select it for mobile data, and test maps, messaging, and a normal website.',
        ],
      },
      {
        title: 'Choose between a travel eSIM, roaming, and a local SIM',
        items: [
          'Travel eSIM: convenient for an unlocked, compatible phone; usually data-only and installed before arrival.',
          'Home-carrier roaming: often the easiest option for a short trip, but check the daily price, data allowance, and whether international services work before relying on it.',
          'Mainland local SIM: can provide a Chinese phone number, but purchase and registration requirements differ and ordinary local internet access remains subject to mainland restrictions.',
          'There is no single best option for everyone. Compare total cost, local-number needs, coverage, hotspot support, and access to the services you actually use.',
        ],
      },
      {
        title: 'Travel eSIM versus mainland carrier eSIM',
        items: [
          'An international travel eSIM and a mainland carrier eSIM are separate products. Check mainland China coverage, whether the travel plan is data-only, and when its validity starts.',
          'For a mainland carrier eSIM, Apple requires an eligible iPhone model and a visit to a carrier store. Apple says an iPhone purchased outside mainland China cannot use an eSIM from a mainland carrier. A travel eSIM from an international provider follows that provider’s compatibility and activation rules instead.',
          'iPhone eSIM capability can differ by exact model and country of purchase. Check Apple’s current model guidance before paying for a non-refundable plan.',
        ],
      },
      {
        title: 'Check these details before buying an eSIM',
        items: [
          'Your phone supports eSIM and is carrier-unlocked. On iPhone, Carrier Lock should show No SIM Restrictions.',
          'The plan explicitly covers mainland China, not only Hong Kong or Macao.',
          'When validity begins: at purchase, installation, or first connection to a supported network.',
          'Whether the plan is data-only or includes calls, SMS, or a phone number.',
          'The high-speed data allowance, fair-use or throttling rules, hotspot support, top-up options, and refund policy.',
          'Whether the provider explicitly says that your required international apps work on that exact plan. Do not infer this from the word eSIM alone.',
        ],
      },
      {
        title: 'Install it before your flight',
        ordered: true,
        items: [
          'Buy the plan from a provider you can contact if setup fails, then save the order number and support channel.',
          'Connect to reliable Wi-Fi and install the eSIM using the provider app, QR code, or manual activation details.',
          'Label the new line China Travel so you do not confuse it with your home SIM.',
          'Keep the QR code or manual installation details available on another device or offline document.',
          'Follow the provider\'s instructions about whether to leave the line off until arrival. Installation and plan activation are not always the same event.',
          'Do not delete an installed eSIM while troubleshooting unless the provider tells you to; some activation codes can be used only once.',
        ],
      },
      {
        title: 'Settings to use after landing',
        ordered: true,
        items: [
          'Turn on the travel eSIM line and select it as the cellular or mobile data line.',
          'Enable data roaming for the travel eSIM if your provider requires it; most international travel plans connect through roaming partners.',
          'Turn off data roaming for your home line and disable cellular data switching to reduce the risk of unexpected charges.',
          'Wait several minutes for network registration, then test a normal website, your map app, and your messaging app.',
          'Keep your home line active only if you need calls or verification SMS, and check what your home carrier charges for receiving or answering them abroad.',
        ],
      },
      {
        title: 'Internet access in mainland China',
        items: [
          'Ordinary mainland mobile networks and Wi-Fi are subject to local internet controls. Google, Facebook, YouTube, X, and some other services are blocked or restricted.',
          'Some international roaming and travel eSIM plans route data outside mainland China, but this is provider- and plan-specific. Confirm the claim on the exact product page and keep a backup.',
          'A travel eSIM is not automatically a VPN. Do not advertise or assume unrestricted access unless the provider explicitly supports it.',
          'If you consider a VPN or similar service, check current rules. UK travel advice notes that online services such as VPNs need to be licensed by the Chinese government.',
          'Download essential local apps, offline maps, hotel addresses, tickets, and translation phrases before departure even if your plan promises international access.',
        ],
      },
      {
        title: 'How much data should you buy?',
        items: [
          'Light use: messaging, payments, maps, and occasional browsing may fit within roughly 3–5 GB for a short trip.',
          'Typical use: frequent maps, social posting, translation, and ride-hailing often justify around 10 GB for one to two weeks.',
          'Heavy use: video, hotspot sharing, cloud photo backup, and frequent calls can require 20 GB or more.',
          'Turn off automatic photo backup, app updates, and high-resolution video on cellular data if your allowance is limited.',
          'Unlimited plans may reduce speed after a daily or total threshold, so read the fair-use terms rather than relying on the word unlimited.',
        ],
      },
      {
        title: 'If the eSIM has no signal or data',
        ordered: true,
        items: [
          'Confirm the eSIM line is turned on and selected for mobile data.',
          'Check that data roaming is enabled on the travel line and disabled on the home line.',
          'Toggle airplane mode for about 30 seconds, then restart the phone if needed.',
          'Use automatic network selection first; choose a partner network manually only if the provider lists one.',
          'Check the provider\'s APN instructions, activation status, validity dates, and remaining high-speed data.',
          'Contact the eSIM provider on airport or hotel Wi-Fi before deleting the plan.',
        ],
      },
      {
        title: 'Keep an offline backup',
        items: [
          'Screenshot your hotel name, address, and phone number in Chinese.',
          'Save flight and train details, your first airport transfer, and emergency contacts offline.',
          'Download an offline translation pack and the map area for your first destination.',
          'Keep a payment card, some RMB cash, and key Chinese phrases available in case both data and QR payments are temporarily unavailable.',
        ],
      },
    ],
    faqs: [
      ['How do I get an eSIM in China?', 'Buy a travel eSIM that explicitly covers mainland China before departure, after confirming that your phone is unlocked and eSIM-compatible. Install it on reliable Wi-Fi, follow the provider\'s activation timing, and save the QR code and setup instructions offline.'],
      ['Does eSIM work in mainland China?', 'A travel eSIM can work if your exact phone supports eSIM, is unlocked, and the plan covers mainland China. A mainland carrier eSIM is a different product with its own device and in-store activation requirements. Check both before buying.'],
      ['Can I get a mainland carrier eSIM on an iPhone bought abroad?', 'Apple says no: an iPhone purchased outside mainland China cannot use an eSIM from a mainland carrier. An international travel eSIM is a separate product; check your exact phone and plan before buying. If you need a +86 number, compare a registered physical SIM.'],
      ['Will a China eSIM let me use Google, WhatsApp, or Instagram?', 'Sometimes, but not because it is an eSIM. Access depends on how that specific provider routes traffic. Confirm each required service with the provider before purchase and keep an offline backup.'],
      ['Should I install the eSIM before arriving in China?', 'Usually yes. Install it on reliable Wi-Fi before departure, but follow the provider\'s instructions about when validity starts and whether the line should remain off until arrival.'],
      ['Do I need to turn on data roaming?', 'Many travel eSIMs require data roaming because they connect through partner networks. Enable it only for the travel line and follow the provider\'s setup instructions.'],
      ['Will I get a Chinese phone number?', 'Most short-term travel eSIMs are data-only. Check the plan details if you need traditional calls, SMS, or a local number.'],
      ['What should I do if the eSIM does not connect?', 'Check the selected data line, roaming setting, network selection, APN, activation status, validity, and remaining data. Contact the provider before deleting the eSIM.'],
    ],
    sourceLinks: [
      ['Apple: using eSIM with iPhone in China mainland', 'https://support.apple.com/en-us/123879'],
      ['Apple: use eSIM while travelling internationally', 'https://support.apple.com/en-us/118227'],
      ['Apple: carriers and worldwide eSIM service providers', 'https://support.apple.com/en-us/101569'],
      ['UK government China travel advice: internet access', 'https://www.gov.uk/foreign-travel-advice/china/safety-and-security#internet-access'],
    ],
  },
  'china-sim-card-for-foreigners': {
    title: 'China SIM Card for Tourists (2026): Passport Guide',
    heading: 'China SIM Card for Foreigners (2026): How to Buy & Use Without Chinese ID',
    description:
      'Tourists can buy a China SIM card with a passport at an official carrier outlet. Check airport counters, phone compatibility and the plan before you pay.',
    quickAnswer:
      'Foreign visitors can buy a physical China SIM card at an official staffed carrier outlet using a valid passport; a Chinese national ID is not normally required. Confirm that your phone is unlocked, ask the carrier to complete real-name registration, and test the plan before leaving the counter. Beijing Capital, Beijing Daxing and Shanghai Pudong publish airport SIM services, but check your terminal, opening hours and stock before relying on an airport purchase. A travel eSIM or home roaming can be an arrival backup if your phone and plan support it.',
    lastReviewed: 'October 19, 2026',
    lastModified: '2026-10-19',
    article: true,
    featuredFaqCount: 3,
    contentSections: [
      {
        title: 'Buy a physical China SIM with a passport',
        table: {
          headers: ['Where', 'What to bring or verify', 'If unavailable'],
          rows: [
            ['Official China Mobile, China Unicom or China Telecom outlet', 'Original passport, unlocked phone, plan details and total price', 'Try another staffed branch or use roaming until one opens'],
            ['Beijing Capital or Daxing airport service counter', 'Official Beijing guidance lists airport SIM services; confirm the exact terminal, counter and hours', 'Use an official city outlet after arrival'],
            ['Shanghai Pudong international traveler service center', 'Official Shanghai guidance describes short-term China Telecom SIM service with passport ID', 'Keep a travel eSIM or roaming backup'],
          ],
        },
        items: [
          'Ask whether the plan includes a Chinese +86 number, voice and SMS, how much high-speed data it contains, when it expires and how to top up. Do not infer the price or included service from another airport or city.',
          'Have the staff complete identity registration and activate the SIM, then test mobile data and a required SMS before leaving. An airport service listing does not guarantee your arrival-time availability or your phone model compatibility.',
        ],
      },
      {
        title: 'eSIM vs physical SIM at the airport',
        table: {
          headers: ['Option', 'Useful when', 'Important limitation'],
          rows: [
            ['Travel eSIM', 'You want data ready soon after landing', 'Requires an unlocked, eSIM-compatible phone and is often data-only'],
            ['Physical mainland SIM', 'You need a Chinese number for calls, SMS, or local services', 'Requires passport registration and remains subject to mainland internet controls'],
            ['Home-carrier roaming', 'You need the simplest arrival backup', 'Can cost more; allowance and international-service access vary by carrier'],
          ],
        },
        items: [
          'Install a travel eSIM before departure on reliable Wi-Fi, but follow the provider\'s instructions about when validity begins. Do not assume every eSIM includes a Chinese phone number or unrestricted access to international services.',
          'For a physical SIM, use an official staffed carrier counter or store. Avoid an unregistered SIM sold informally because real-name registration, ownership, support, and replacement may be unclear.',
          'Dual-SIM travelers can often keep the home line active for verification SMS while using the China line for data. Disable home-line data roaming unless your home plan explicitly includes it.',
        ],
      },
      {
        title: 'China Mobile, China Unicom, and China Telecom compared',
        table: {
          headers: ['Carrier', 'Practical strength', 'Check before paying'],
          rows: [
            ['China Mobile', 'Large nationwide network and broad retail presence', 'Confirm your phone supports the plan\'s required network bands'],
            ['China Unicom', 'Often considered by visitors using international handsets', 'Verify coverage for rural destinations and the exact prepaid plan'],
            ['China Telecom', 'Another major nationwide option with city and regional coverage', 'Device and network compatibility can vary, especially on older imported phones'],
          ],
        },
        items: [
          'Coverage differs by destination, building, route, and device. Ask the counter to verify your phone model and test mobile data before you leave.',
          'Compare the included high-speed data, domestic calls, validity, renewal rules, hotspot support, and what happens when the allowance is used.',
          'English support varies by branch. Keep your destination list in Chinese and ask the hotel which carrier works reliably in any rural area on your route.',
        ],
      },
      {
        title: 'How to buy at an official carrier counter',
        ordered: true,
        items: [
          'At an airport, check the official service directory and ask the information desk for a staffed SIM counter. Beijing Capital, Beijing Daxing and Shanghai Pudong publish visitor services; for other airports, confirm a counter before travel. Locations, opening hours and stock can change.',
          'Present the original passport you used to enter China. The carrier may photograph or scan the document and your face to complete legally required real-name registration.',
          'Show the trip length, cities, expected data use, and whether you need a Chinese number, voice calls, SMS, hotspot use, or only mobile data.',
          'Ask the staff to confirm the total price, included allowance, validity, top-up method, and whether the number expires or enters a grace period after the plan ends.',
          'Insert or activate the SIM at the counter. Test data, one website, maps, and any required SMS before leaving. Save the carrier receipt, plan name, phone number, and support number.',
          'If the airport counter is closed or unavailable, keep roaming or eSIM data active and visit an official staffed carrier store in the city with your passport.',
        ],
      },
      {
        title: 'How to top up with Alipay',
        ordered: true,
        items: [
          'Open Alipay and search for mobile top-up or phone recharge, then enter the Chinese mobile number carefully.',
          'Confirm the carrier and number shown before choosing an amount. A mistaken top-up may be difficult to reverse.',
          'Review the funding source and final amount. An international card linked to Alipay may not support every recharge product or transaction.',
          'Keep the carrier app, official store, staffed counter, or another supported payment method as a backup. Save the top-up receipt until the balance appears.',
          'Do not share a payment PIN, SMS code, or passport image with an informal seller offering to recharge the number.',
        ],
      },
      {
        title: 'VPN, Alipay, and WeChat Pay: what to prepare',
        items: [
          'Ordinary mainland SIM data is subject to local internet controls. Some international roaming and travel eSIM plans route traffic differently, but this depends on the exact provider and plan.',
          'If you intend to use a VPN or similar service, check current rules and install only a trusted, legally compliant service before departure. A China SIM does not itself provide unrestricted internet access.',
          'Set up Alipay and WeChat Pay before departure while you can receive verification messages from your usual number. Linking an international card and passing identity checks are not guaranteed for every user or transaction.',
          'Alipay and WeChat Pay do not normally require a VPN for domestic payment functions. Keep a physical card and some RMB cash because wallet, card issuer, merchant, or connectivity failures can still occur.',
          'Save the hotel address, first transfer, tickets, essential contacts, and key Chinese phrases offline so one connection or payment failure does not block the arrival plan.',
        ],
      },
    ],
    faqs: [
      ['Can foreigners buy an eSIM for China?', 'Yes. Foreign visitors can buy a travel eSIM that covers mainland China if their phone is unlocked and eSIM-compatible. Check whether the plan is data-only, when validity starts, which network it uses, and whether required international services work. Install it before departure and keep the activation details offline.'],
      ['Do I need a Chinese ID to buy a SIM card in China?', 'A foreign visitor normally uses an original passport instead of a Chinese national ID at an official staffed carrier counter. The carrier must complete real-name registration and may scan the passport and take a photo. Requirements, available prepaid plans, airport stock, and opening hours can vary by location.'],
      ['Can I keep my existing phone number while using a China SIM?', 'Usually yes if your phone supports dual SIM or eSIM plus a physical SIM. Keep the home line active for important verification messages, select the China line for mobile data, and disable home-line data roaming unless included. Check whether receiving calls or texts on the home line creates charges.'],
    ],
    sourceLinks: [
      ['China government: SIM cards for foreigners', 'https://english.www.gov.cn/2025special/bizexpatsinchina2025'],
      ['Beijing government: SIM card application locations', 'https://english.beijing.gov.cn/quickguideservices/purchasingsimcards/'],
      ['Shanghai government: Pudong international traveler services', 'https://english.shanghai.gov.cn/en-Latest-WhatsNew/20260424/88cde5e96ef242daa534102069450a03.html'],
      ['China Mobile official website', 'https://www.10086.cn/'],
      ['China Unicom official website', 'https://www.10010.com/'],
      ['China Telecom official website', 'https://www.189.cn/'],
      ['UK government China travel advice: internet access', 'https://www.gov.uk/foreign-travel-advice/china/safety-and-security#internet-access'],
    ],
  },
  'alipay-for-foreigners': {
    title: 'Alipay for Foreigners: Setup & Payment Guide (2026)',
    description:
      'Set up Alipay for China: register with an overseas number, link an eligible international card, pay by QR code, and fix common payment failures.',
    quickAnswer:
      'Yes. Foreign visitors can register Alipay with an overseas mobile number and add an eligible international debit or credit card for everyday purchases in mainland China. You do not normally need a Chinese bank account, but card-issuer approval, identity checks, merchant support, and payment limits can vary. Set it up before your flight and keep a second payment method.',
    lastReviewed: 'September 16, 2026',
    lastModified: '2026-09-16',
    article: true,
    contentSections: [
      {
        title: 'What you need before setup',
        items: [
          'A mobile number that can receive verification messages while you are abroad.',
          'An eligible credit or debit card issued outside the Chinese mainland.',
          'Your passport details if Alipay asks you to complete identity verification.',
          'Access to your bank app, SMS, or other card-verification method.',
          'A backup card and a small amount of RMB cash in case one payment route fails.',
        ],
      },
      {
        title: 'Set up Alipay before your flight',
        ordered: true,
        items: [
          'Download the standard Alipay app from your official app store. Do not choose AlipayHK or another regional version.',
          'Register with your home-country mobile number and enter the verification code.',
          'Choose the International Version if Alipay offers that option after registration.',
          'Tap Add Now or open Bank Cards, then enter or scan your international card details.',
          'Follow the in-app prompts for identity and card verification. Make sure your name and document details match.',
          'Keep access to your original phone number and bank verification method during the trip.',
        ],
      },
      {
        title: 'How to pay at a merchant',
        items: [
          'Merchant scans you: open Alipay, show your payment code, and let the merchant scan it.',
          'You scan the merchant: use Scan, check the merchant name, enter the amount if needed, and confirm payment.',
          'Personal transfer QR: an international card may not work because person-to-person transfers are not supported. Ask for a merchant payment code or another payment method.',
          'Check the merchant name and amount before confirming every payment.',
        ],
      },
      {
        title: 'What an international card can and cannot do',
        items: [
          'Pay for eligible daily purchases in mainland China through Alipay.',
          'Use merchant QR payment flows at shops, restaurants, taxis, and other supported services.',
          'International cards do not support person-to-person transfers, red packets, wealth-management products, insurance, or some other financial services.',
          'Supported networks, limits, verification, and merchant acceptance can change, so treat the card list shown inside Alipay as the current source of truth.',
        ],
      },
      {
        title: 'If your payment fails',
        ordered: true,
        items: [
          'Confirm that the card still appears under Bank Cards and that identity verification is complete.',
          'Check your bank app or SMS for a declined or pending verification request.',
          'Make sure the QR code is for a merchant payment rather than a personal transfer.',
          'Try the other payment flow: show your payment code instead of scanning, or scan the merchant code instead.',
          'Try another eligible card or WeChat Pay if you have already set it up.',
          'Ask the merchant whether a physical card or RMB cash is accepted.',
          'For account-specific problems, use Alipay customer support because ChinaEase Buddy cannot see or change your payment account.',
        ],
      },
      {
        title: 'Fees and exchange rates',
        items: [
          'Review the payment confirmation screen before approving a transaction.',
          'For payments funded by an international bank card, the exchange rate is provided by the card network and issuing bank.',
          'Your card issuer may add a foreign-transaction or currency-conversion fee. Check the final amount on your card statement.',
          'Do not rely on an old blog post for a fixed fee or limit; check the current information shown inside Alipay and by your bank.',
        ],
      },
      {
        title: 'Useful payment phrases',
        items: [
          '可以用支付宝吗？ — Can I pay with Alipay?',
          '请扫我的付款码。 — Please scan my payment code.',
          '支付失败了，可以换一种方式吗？ — My payment failed. Can I pay another way?',
        ],
      },
    ],
    faqs: [
      ['Can foreigners use Alipay in China?', 'Yes. Overseas visitors can register Alipay and add an eligible international bank card for daily purchases in mainland China. Card-issuer approval, verification, limits, and merchant support can vary.'],
      ['Do I need a Chinese bank account to use Alipay?', 'No Chinese bank account is normally required when you use an eligible international card issued outside the Chinese mainland.'],
      ['Can I set up Alipay before arriving in China?', 'Yes. Download the standard Alipay app, register with your overseas mobile number, and try adding your card before your flight so you have time to resolve verification problems.'],
      ['What if my Alipay payment fails?', 'Check that your card and identity verification are complete, look for a bank approval request, confirm the QR code is a merchant payment rather than a personal transfer, and try another prepared payment method.'],
      ['Can I transfer money to another person with my international card?', 'Alipay states that international cards do not support person-to-person transfers or red packets. Ask for a merchant payment code or use another suitable payment method.'],
      ['Should I carry cash in China?', 'Carry a modest amount of RMB as a backup rather than relying on a single app or card. You can also prepare WeChat Pay and a second international card.'],
    ],
    sourceLinks: [
      ['Alipay+ official guide for paying in the Chinese mainland', 'https://www.alipayplus.com/pay-in-the-chinese-mainland/'],
      ['Shanghai government guide to linking international cards to Alipay', 'https://english.shanghai.gov.cn/en-FAQs-StudyinShanghai/20231211/a58d4c15179f468fb2c5d72b393f1fd4.html'],
    ],
  },
  'wechat-pay-for-foreigners': {
    article: true,
    title: wechatPayGuide.metaTitle,
    heading: wechatPayGuide.heading,
    description: wechatPayGuide.metaDescription,
    quickAnswer: quickAnswerText(wechatPayGuide.quickAnswer),
    faqs: wechatPayGuide.faqs.map(({ question, answer }) => [question, plainText(answer)]),
    sourceLinks: wechatPayGuide.sources.map(({ label, href }) => [label, href]),
    lastReviewed: wechatPayGuide.reviewed,
    lastModified: wechatPayGuide.modified,
  },
  'china-payment-guide': {
    title: 'How to Pay in China as a Foreigner | ChinaEase Buddy',
    description:
      'To pay in China as a foreigner, set up Alipay or WeChat Pay with an eligible international card, and carry a Visa or Mastercard and some cash as backup.',
    faqs: [
      ['What is the best way for foreigners to pay in China?', 'There is no single best method for every traveler. Many visitors prepare Alipay or WeChat Pay, keep a foreign card, and carry a small cash backup.'],
      ['Can tourists use WeChat Pay in China?', 'Some tourists may be able to use WeChat Pay with supported cards and verification. Setup and availability may vary, so prepare alternatives.'],
      ['Are foreign credit cards accepted in China?', 'Foreign cards are more commonly accepted at hotels, large malls, and some international merchants. Smaller shops and restaurants may prefer QR payments or cash.'],
    ],
  },
  'china-travel-checklist': {
    article: true,
    title: checklistGuide.metaTitle,
    heading: checklistGuide.heading,
    description: checklistGuide.metaDescription,
    quickAnswer: quickAnswerText(checklistGuide.quickAnswer),
    faqs: checklistGuide.faqs.map(({ question, answer }) => [question, plainText(answer)]),
    sourceLinks: checklistGuide.sources.map(({ label, href }) => [label, href]),
    lastReviewed: checklistGuide.reviewed,
    lastModified: checklistGuide.modified,
  },
  'china-emergency-numbers': {
    title: 'Emergency Numbers in China for Travelers | ChinaEase Buddy',
    description:
      'Know China emergency numbers for travelers: 110 police, 120 ambulance, 119 fire, plus hospital phrases, police help, and lost passport reminders.',
    heading: 'Emergency Numbers in China for Travelers',
    quickAnswer: emergencyGuideContent.quickAnswer,
    contentSections: emergencyGuideContent.sections,
    faqs: emergencyGuideContent.faqs.map(({ question, answer }) => [question, answer]),
    sourceLinks: emergencyGuideContent.sources.map(({ label, href }) => [label, href]),
    lastReviewed: emergencyGuideContent.reviewed,
    lastModified: emergencyGuideContent.modified,
    article: true,
  },
  'china-itinerary-first-time-7-10-14-days': {
    heading: 'China Itinerary for First-Time Visitors: 7, 10 or 14 Days',
    title: 'China Itinerary for First-Timers: 7, 10 or 14 Days (2026)',
    description: "Compare practical 7-, 10- and 14-day China itineraries, including Beijing, Xi'an, Shanghai, Chengdu and Guilin, with realistic transfer advice.",
    lastReviewed: firstTimeItineraryContent.reviewed,
    lastModified: firstTimeItineraryContent.modified,
    quickAnswer: firstTimeItineraryContent.quickAnswer,
    sections: firstTimeItineraryContent.sections.map((section) => [section.title, section.summary, `#${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`]),
    contentSections: firstTimeItineraryContent.sections,
    faqs: firstTimeItineraryContent.faqs.map(({ question, answer }) => [question, answer]),
    sourceLinks: firstTimeItineraryContent.sources.map(({ label, href }) => [label, href]),
    article: true,
  },
  faq: {
    title: 'ChinaEase Buddy FAQ | China Travel Tools for Foreign Visitors',
    description:
      'Answers about ChinaEase Buddy, China travel apps, Alipay, WeChat Pay, Google Maps, taxis, emergency numbers, and service limitations.',
    faqs: [
      ['What is ChinaEase Buddy?', 'ChinaEase Buddy is a web-based digital China travel toolkit for foreign visitors. It helps with phrase cards, payments, food, transport, hotels, emergency references, and Buddy AI travel questions.'],
      ['Is ChinaEase Buddy free?', 'ChinaEase Buddy has a free starting plan with core tools and limited Buddy AI usage. Paid passes may unlock additional digital access, but checkout availability can vary during early access.'],
      ['How do paid passes work?', 'Paid passes are one-time digital travel passes purchased through Gumroad. Activate with the Order ID on your Gumroad receipt. Access is enabled only after server verification; returning from checkout does not activate a Pass.'],
      ['What emergency numbers should travelers know in China?', 'Travelers should know 110 for police, 120 for ambulance, and 119 for fire. In urgent situations, contact local emergency services directly.'],
    ],
  },
};

Object.assign(pageMeta, {
  'china-240-hour-visa-free-transit-2026': {
    title: transit240Guide.title,
    heading: transit240Guide.heading,
    description: transit240Guide.description,
    quickAnswer: transit240Guide.quickAnswer,
    lastReviewed: transit240Guide.lastReviewed,
    lastModified: transit240Guide.lastModified,
    article: true,
    featuredFaqCount: 3,
    ctaBeforeFeaturedFaqs: true,
    contentSections: transit240Guide.contentSections,
    faqs: transit240Guide.faqs,
    sourceLinks: transit240Guide.sourceLinks,
  },
  'nia-12367-online-accommodation-registration-guide': {
    ...pageMeta['china-hotels-for-foreigners'],
    title: 'NIA 12367 Online Accommodation Registration Guide for Foreigners (2026)',
    heading: 'How to Register a Non-Hotel Stay with NIA 12367',
    description: 'Learn how foreigners register a private or non-hotel stay through NIA 12367, where online registration is available, what documents you need, and when hotels register for you.',
    quickAnswer: 'Hotels register foreign guests as part of check-in. For a private home or other non-hotel stay, the guest or host generally registers within 24 hours. Nationwide online handling has been available through official NIA channels since September 21, 2026, while in-person registration remains available.',
    faqs: [
      ['Is NIA 12367 online accommodation registration available nationwide?', 'Yes. NIA announced nationwide online handling from September 21, 2026. Check the current official platform for your exact address, or call 12367 if the online process does not work.'],
      ['Do hotel guests need to register themselves?', 'Normally no. Hotels collect the passport details and submit the accommodation registration during check-in.'],
      ['How soon must a private stay be registered?', 'The general rule is within 24 hours after arrival at the non-hotel residence.'],
      ['Is online registration legally valid?', 'The NIA states that completed online registration has the same legal effect as on-site registration where the online service applies.'],
    ],
    lastReviewed: 'September 27, 2026',
    lastModified: '2026-09-27',
  },
  'amap-english-mode-guide-2026': {
    article: true,
    title: amapEnglishSetup.metaTitle,
    heading: amapEnglishSetup.heading,
    description: amapEnglishSetup.metaDescription,
    quickAnswer: amapEnglishSetup.quickAnswer.map(plainText).join(' '),
    // FAQPage JSON-LD takes the plain answer; the visible answer keeps its links.
    faqs: amapEnglishSetup.faqs.map(({ question, answer }) => [question, plainText(answer)]),
    sourceLinks: amapEnglishSetup.sources.map(({ label, href }) => [label, href]),
    lastReviewed: amapEnglishSetup.reviewed,
    lastModified: amapEnglishSetup.modified,
  },
  'alipay-metro-qr-transport-code-guide': {
    article: true,
    title: alipayMetroGuide.metaTitle,
    heading: alipayMetroGuide.heading,
    description: alipayMetroGuide.metaDescription,
    quickAnswer: quickAnswerText(alipayMetroGuide.quickAnswer),
    faqs: alipayMetroGuide.faqs.map(({ question, answer }) => [question, plainText(answer)]),
    sourceLinks: alipayMetroGuide.sources.map(({ label, href }) => [label, href]),
    lastReviewed: alipayMetroGuide.reviewed,
    lastModified: alipayMetroGuide.modified,
  },
  'china-travel-ai-itinerary-generator': {
    ...pageMeta['10-day-china-itinerary'],
    title: 'China Travel AI Itinerary Generator: Build a Personal Route in 30 Seconds (2026)',
    heading: 'Build a Personal China Itinerary with an AI Travel Assistant',
    description: 'Generate a personalized China itinerary with Buddy AI. Enter days, cities, interests, budget, pace, and mobility needs for a practical route and booking checklist.',
    quickAnswer: 'Tell Buddy your dates, arrival and departure cities, interests, budget, pace, and mobility needs. It can draft a route and booking checklist, but live schedules, prices, closures, and legal requirements still need verification with official providers.',
    faqs: [
      ['Can AI plan a complete China trip?', 'It can produce a strong planning draft and checklist, but live prices, schedules, closures, and legal requirements still need official verification.'],
      ['What information should I provide?', 'Provide dates, cities, interests, budget, pace, mobility needs, and fixed bookings. Do not provide passport numbers, card details, or other unnecessary sensitive data.'],
      ['Can Buddy create Chinese addresses and phrases?', 'Yes. Buddy can format destination names, hotel messages, pickup phrases, and planning notes for local apps.'],
    ],
    lastReviewed: 'September 27, 2026',
    lastModified: '2026-09-27',
  },
  'wechat-verification-without-friend-qr-2026': {
    article: true,
    title: wechatVerificationGuide.metaTitle,
    heading: wechatVerificationGuide.heading,
    description: wechatVerificationGuide.metaDescription,
    quickAnswer: quickAnswerText(wechatVerificationGuide.quickAnswer),
    faqs: wechatVerificationGuide.faqs.map(({ question, answer }) => [question, plainText(answer)]),
    sourceLinks: wechatVerificationGuide.sources.map(({ label, href }) => [label, href]),
    lastReviewed: wechatVerificationGuide.reviewed,
    lastModified: wechatVerificationGuide.modified,
  },
  'what-to-eat-in-china-first-time-guide': {
    ...pageMeta['china-food-ordering-guide'],
    title: 'What to Eat in China: 15 Must-Try Dishes for First-Time Visitors',
    heading: 'What to Eat in China: 15 Dishes for a First Visit',
    description: 'Discover 15 dishes to try in China, including jianbing, xiaolongbao, Peking duck, hot pot, biangbiang noodles, dumplings, and regional specialties.',
    quickAnswer: 'Choose regional strengths: Peking duck in Beijing, xiaolongbao in Shanghai, biangbiang noodles in Xi’an, hot pot in Sichuan or Chongqing, plus jianbing, dumplings, noodles, and seasonal vegetables.',
    // Its own questions; the spread above would otherwise copy the food-ordering guide's FAQs.
    faqs: [
      ["What food should I try first in China?", "Start with the regional specialties of your destination, such as Peking duck in Beijing, xiaolongbao in Shanghai, biangbiang noodles in Xi’an, or hot pot in Chengdu and Chongqing."],
      ["Is Chinese street food safe?", "Risk varies. Choose busy vendors with clean preparation areas, food cooked thoroughly and served hot, and safe water and ice practices."],
      ["Is it easy to eat vegetarian food in China?", "Vegetable dishes are common, but meat stock, lard, oyster sauce, or small meat pieces may be used. Show a precise Chinese request and confirm ingredients."],
      ["How do I communicate a food allergy?", "Carry a detailed Chinese allergy card naming the allergen and the need to avoid sauces, broths, oils, and cross-contact. Seek professional medical advice for severe allergies."],
    ],
  },
  'how-to-use-wechat-as-foreigner-2026': {
    ...legacyWechatHowToMeta,
    title: 'How to Use WeChat as a Foreigner (2026): Registration, Verification & Pay',
    heading: 'How to Use WeChat as a Foreigner in 2026',
    description: 'Set up WeChat before China using a foreign mobile number. Learn registration, possible security verification, WeChat Pay card linking, QR contacts, and mini-programs.',
    quickAnswer: 'Register with a reachable mobile number, complete the security verification shown for your account, add recovery options, and link an eligible international card to WeChat Pay when available.',
    lastReviewed: 'September 27, 2026',
    lastModified: '2026-09-27',
  },
  'beijing-shanghai-layover-240-hour-guide': {
    ...pageMeta['china-visa-free-travel-guide'],
    title: 'Beijing & Shanghai Layover Guide 2026: 240-Hour Visa-Free Transit Explained',
    heading: layoverAirportPlanning.heading,
    description: 'Plan a Beijing or Shanghai layover with China\'s 240-hour visa-free transit. Check the third-country route, 65 ports, allowed areas and realistic plans.',
    intro: layoverAirportPlanning.intro,
    quickAnswer: layoverAirportPlanning.quickAnswer,
    faqs: layoverAirportPlanning.faqs.map(({ question, answer }) => [question, answer]),
    sourceLinks: layoverAirportPlanning.sources.map(({ label, href }) => [label, href]),
    lastReviewed: layoverAirportPlanning.reviewed,
    lastModified: layoverAirportPlanning.modified,
  },
});

Object.assign(pageMeta['china-payment-guide'], {
  quickAnswer: 'Foreign visitors can prepare Alipay or WeChat Pay with an eligible international card, but card linking and merchant acceptance can vary. Set up the wallets before departure, carry a physical Visa or Mastercard and some RMB cash, and keep a Chinese payment-failure phrase available.',
  lastReviewed: 'September 30, 2026',
  lastModified: '2026-09-30',
  article: true,
  featuredFaqCount: 3,
  contentSections: [
    { title: 'Prepare before you fly', ordered: true, items: [
      'Install the standard Alipay and WeChat apps from an official app store. Register while you can receive messages on your usual phone number and follow the identity-verification instructions shown for your account.',
      'Add an eligible international card if the wallet offers that option. Your card issuer may require a one-time password or other confirmation. Card linking is not guaranteed, so do not travel with only one payment method.',
      'Tell your bank about the trip when appropriate and check foreign-transaction fees. Never share a payment PIN or one-time security code with a stranger offering to set up the wallet.',
      'Save a Chinese payment-failure phrase and test that you can open the wallet before departure. A tiny verification transaction does not prove every merchant payment will be accepted.',
    ] },
    { title: 'Alipay, WeChat Pay, cards, and cash', items: [
      'Alipay is a practical first wallet for many travelers because it combines QR payments with transport, ride-hailing, and mini-app services. WeChat Pay can be a useful backup, especially when a merchant displays its QR code. Setup requirements and supported cards can change.',
      'Foreign cards are more likely to be accepted directly at international hotels, larger malls, and major travel businesses than at a small restaurant or market stall. Look for the card network logo and ask before relying on it.',
      'RMB cash remains a useful backup. Carry smaller notes for taxis, ticket windows, rural stops, or a temporary app problem, and count change before leaving the counter.',
      'A merchant checkout QR and a personal transfer QR may follow different rules. If a foreign card cannot fund a transfer-style payment, ask for the merchant payment code or use another prepared method.',
    ] },
    { title: 'Transport and attraction payments', items: [
      'Metro and bus payment options are city-specific. Some visitors can activate a transport code inside Alipay, while others use a ticket machine, staffed counter, physical transit card, or a local app. Keep a backup for the first journey.',
      'DiDi, Railway 12306, Trip.com, hotels, and attraction platforms may each show different card or wallet choices. Read the checkout screen, confirm the amount and currency, and retain the receipt until the service is complete.',
      'For a large or timed purchase, review the refund route and cancellation terms before paying. A refund normally returns through the original channel, but processing time and exchange-rate differences depend on the provider and issuer.',
    ] },
    { title: 'When a payment fails', ordered: true, items: [
      'Stop repeated attempts if the same transaction is declined. Confirm the amount and merchant, then try the second wallet, another card, or cash.',
      'Check whether identity verification, issuer approval, the available balance, a transaction limit, or the merchant QR type is causing the problem.',
      'Contact the wallet provider or card issuer through an official channel for an account-specific problem. ChinaEase Buddy provides travel information, not financial advice or payment guarantees.',
      'Keep enough backup money and transport information to return to the hotel even when mobile data or a wallet is temporarily unavailable.',
    ] },
  ],
});
pageMeta['china-payment-guide'].faqs.unshift(
  [
    'Can foreigners use WeChat Pay without a Chinese bank account?',
    'Yes. Many foreign visitors can add an eligible Visa or Mastercard in WeChat by opening Me, then Services or Pay, Wallet, and Bank Cards. Complete any identity and issuer checks. Merchant support, card funding, fees, limits, and app labels can vary, so keep Alipay, a physical card, and RMB cash as backups.',
  ],
  [
    'Can foreigners use Alipay without a Chinese ID?',
    'Yes. Foreign visitors can register Alipay with an overseas mobile number and verify identity using a supported passport rather than a Chinese national ID. Add an eligible international Visa or Mastercard under Bank Cards. Approval, limits, merchant acceptance, and issuer verification vary, so prepare a second payment method.',
  ],
  [
    'Which is better for foreigners, Alipay or WeChat Pay?',
    'Alipay is often simpler as a dedicated payment and travel-services app, while WeChat Pay is convenient when you also use WeChat messaging and mini programs. Neither is universally better: set up both if possible, test them before relying on them, and carry a physical card and some RMB cash.',
  ],
);

pageMeta['3-day-guilin-yangshuo-itinerary'].contentSections.push({
  title: 'Foreigner essentials: transport, payment, and hotels',
  items: [
    'Guilin has no city Metro, so save each destination in Chinese and use a verified DiDi, the official taxi queue, a public bus, or a pre-arranged hotel transfer. For the Li River, confirm the exact pier rather than entering only “Li River” in the app. In Yangshuo, vehicle access can stop short of pedestrian lanes, so ask the hotel for its recommended drop-off point and a Chinese message for the driver.',
    'For Xingping or Yangshuo rail connections, check the station printed on the ticket and the onward road transfer. Yangshuo railway station is near Xingping, not central Yangshuo. Build a buffer for luggage, station security, passport checks, and a possible driver call about the pickup pin. Screenshot the car plate and destination before leaving reliable data coverage.',
    'Alipay and WeChat Pay are common at many restaurants, shops, ticket desks, and tourism businesses, but a linked foreign card may not work for every merchant QR code. Keep a physical card and RMB cash as backups. For cruises, rafting, shows, and attraction tickets, use the channel named by the authorised seller and retain the receipt and cancellation terms.',
    'For the Guilin night, a staffed hotel near the central lakes, Guilin railway station, or a practical pickup corridor can simplify transfers. In Yangshuo, West Street is convenient but noisy; the Yulong River countryside is quieter but more dependent on road transport. Confirm foreign-passport check-in directly before paying because operational familiarity varies by property.',
    'Ask the hotel for its Chinese name, full address, phone number, map pin, and vehicle-access instructions. A platform listing alone is not enough when a property uses self-check-in or limited reception hours. If registration is unclear, choose a staffed property with recent foreign-guest reviews and keep a refundable alternative until confirmation arrives.',
  ],
});
pageMeta['3-day-guilin-yangshuo-itinerary'].faqs.push([
  'Do I need reservations for Guilin and Yangshuo attractions as a foreigner?',
  'Reserve the Li River cruise and any dated show or regulated activity in advance when availability matters. Passport details may be required. Public viewpoints and neighbourhood walks often do not need a reservation, but rules, weather closures, and capacity controls can change, so check the official operator before travel.',
]);
pageMeta['3-day-guilin-yangshuo-itinerary'].faqs.unshift(
  [
    'Can foreign visitors pay with Alipay or WeChat Pay in Guilin and Yangshuo?',
    'Many foreign visitors can use Alipay or WeChat Pay after linking an eligible international card, but acceptance and card funding can vary. Keep a physical card and some RMB cash for small restaurants, countryside stops, or ticket sellers, and retain receipts for cruises, shows, and transport bookings.',
  ],
  [
    'How can I use DiDi in Guilin and Yangshuo without speaking Chinese?',
    'Guilin has no city Metro, so save every destination and the exact Li River pier in Chinese before booking DiDi. In Yangshuo, ask your hotel for the correct vehicle-access point because pedestrian lanes may block door-to-door pickup. Verify the licence plate and keep an official taxi backup.',
  ],
  [
    'What should foreign visitors confirm with hotels in Guilin or Yangshuo?',
    'Travelers do not need a special foreign-guest licence filter. Choose staffed accommodation that confirms foreign-passport registration and late-arrival arrangements. Bring the original passport used for booking, and save the Chinese hotel name, address, phone number, vehicle-access instructions, and written check-in confirmation offline before arrival.',
  ],
);
Object.assign(pageMeta['3-day-guilin-yangshuo-itinerary'], {
  featuredFaqCount: 3,
  lastReviewed: 'October 19, 2026',
  lastModified: '2026-10-19',
});

pageMeta['3-day-shenzhen-itinerary'].contentSections.push({
  title: 'Foreigner essentials: Metro, DiDi, payment, and hotels',
  items: [
    'Shenzhen Metro is usually the simplest way to move between Futian, Luohu, and much of Nanshan. Save both the station name and exit number in Chinese because an attraction can be a long walk from the wrong exit. Ticket machines and staffed counters provide alternatives if a phone-based transport code is unavailable. Keep your passport accessible when identity verification is required.',
    'Use DiDi for airport arrivals, late evenings, luggage transfers, or places beyond the central Metro network. Enter the exact attraction entrance or hotel lobby instead of a broad district. At Bao’an Airport, a large mall, or Shenzhen North station, follow the marked ride-hailing pickup zone and send the bay or level to the driver. Verify the licence plate before entering.',
    'Alipay and WeChat Pay are widely used at shops, restaurants, malls, and many attractions, but foreign-card funding can still fail for a particular merchant or transaction type. Carry a physical bank card and some RMB cash. Confirm whether a timed attraction, exhibition, or theme park requires an online reservation before crossing the city, and keep the booking QR code available.',
    'Futian is the easiest general base for central sights and transport; Nanshan suits OCT, Nantou, Shenzhen Bay, and Shekou; Luohu can suit Dongmen and Shenzhen Railway Station. There is not a special “foreign guest licence” travelers need as a booking filter. Choose a staffed hotel that confirms foreign-passport registration and supplies a Chinese address and reception contact.',
    'Before paying a non-refundable rate, message the property with the passport nationality, arrival time, and number of guests. Ask whether reception will be open and whether every guest must be present for registration. Save the reply offline. For a Hong Kong transfer, confirm the exact border checkpoint rather than selecting a hotel only because it is advertised as close to Hong Kong.',
  ],
});
pageMeta['3-day-shenzhen-itinerary'].faqs.push([
  'Do I need reservations for Shenzhen attractions as a foreigner?',
  'Some museums, special exhibitions, observation decks, and theme parks use dated or timed reservations and may request passport details. Parks, waterfronts, and neighbourhood walks often do not. Check the official venue shortly before visiting because booking channels, closure days, and passport-entry procedures can change.',
]);
pageMeta['3-day-shenzhen-itinerary'].faqs.unshift(
  [
    'Can foreign visitors pay with Alipay or WeChat Pay in Shenzhen?',
    'Many foreign visitors can use Alipay or WeChat Pay after linking an eligible international card, but acceptance and card funding can vary by merchant. Carry a physical card and some RMB cash, keep payment receipts, and confirm timed-attraction checkout requirements before travelling across the city.',
  ],
  [
    'How can I use DiDi in Shenzhen without speaking Chinese?',
    'Save the destination, entrance, and hotel address in Chinese, then place the pickup pin at the marked ride-hailing zone. At the airport, malls, and Shenzhen North station, send the bay or level to the driver and verify the licence plate before entering. Keep an official taxi backup.',
  ],
  [
    'What should foreign visitors confirm with Shenzhen hotels?',
    'Travelers do not need to search for a special foreign-guest licence as a booking filter. Choose a staffed hotel that confirms foreign-passport registration, reception hours, and the Chinese address before payment. Bring the physical passport used for booking and save the hotel\'s written confirmation offline.',
  ],
);
Object.assign(pageMeta['3-day-shenzhen-itinerary'], {
  featuredFaqCount: 3,
  lastReviewed: 'September 30, 2026',
  lastModified: shenzhenItineraryPlanning.modified,
});

pageMeta['tenpaygo-for-tourists'] = {
  article: true,
  title: tenPayGoGuide.metaTitle,
  heading: tenPayGoGuide.heading,
  description: tenPayGoGuide.metaDescription,
  quickAnswer: quickAnswerText(tenPayGoGuide.quickAnswer),
  faqs: tenPayGoGuide.faqs.map(({ question, answer }) => [question, plainText(answer)]),
  sourceLinks: tenPayGoGuide.sources.map(({ label, href }) => [label, href]),
  lastReviewed: tenPayGoGuide.reviewed,
  lastModified: tenPayGoGuide.modified,
};

pageMeta['nia-12367-online-accommodation-registration-guide'] = {
  ...accommodationRegistrationGuide,
  article: true,
  featuredFaqCount: 3,
  ctaBeforeFeaturedFaqs: true,
  buddyPrompt: undefined,
};

pageMeta['china-visa-free-checker'] = {
  ...visaFreeCheckerGuide,
  application: true,
};

const transit240PortRows = transit240Guide.contentSections.find((section) => section.table && section.title.includes('ports')).table.rows;
const transit240CountryCount = transit240Guide.contentSections
  .find((section) => section.countryGroups)
  .countryGroups.reduce((total, group) => total + group.countries.length, 0);
const transit240ProvinceCount = new Set(transit240PortRows.map((row) => row[0])).size;
const transitAnswerLinks = transitAnswers.pages.map((page) => [page.question, `/${page.slug}/`]);

pageMeta['china-240-hour-transit-calculator'] = {
  heading: 'China 240-Hour Visa-Free Transit Calculator',
  title: 'China 240-Hour Visa-Free Transit Calculator | Exit Deadline',
  description: 'China\'s 240-hour transit clock starts at midnight after your entry date. Use this free calculator to work out your exit deadline in China time.',
  quickAnswer: 'China’s 240-hour visa-free transit clock starts at 00:00 on the day after entry, in China Standard Time (UTC+8). Enter your expected or recorded entry date and route to calculate the exit deadline and check the basic passport and route pattern. Final eligibility and the permitted stay are decided by border inspection authorities.',
  lastReviewed: transitAnswers.lastUpdated,
  lastModified: calculatorContent.modified,
  lastUpdatedFooter: true,
  application: true,
  contentSections: [
    {
      title: 'Current policy at a glance',
      items: [
        `${transit240CountryCount} eligible countries, including Vietnam and Kyrgyzstan (added August 2026).`,
        `${transit240PortRows.length} designated ports in ${transit240ProvinceCount} provincial-level regions.`,
        'The 240-hour clock starts at 00:00 on the day after entry, in China Standard Time.',
      ],
    },
    {
      title: calculatorContent.heading,
      items: [calculatorContent.intro, calculatorContent.note],
      table: {
        headers: ['Recorded entry (China time)', '240-hour clock starts', 'Planning label', 'Exact boundary'],
        rows: calculatorContent.examples.map((example) => [example.arrivalLocal, example.clockStartChina, example.planningLatestChina, example.deadlineExclusiveChina].map((value) => value.replace('T', ' '))),
      },
    },
    {
      title: 'Worked example',
      items: [
        transitAnswers.workedExample.text,
        transitAnswers.workedExample.note,
        transitAnswers.clockInputCopy.help,
      ],
    },
    {
      title: 'Common route examples',
      items: [
        'UK → Mainland China → Japan',
        'US → Mainland China → Hong Kong',
        'Singapore → Mainland China → South Korea',
        'Australia → Mainland China → Thailand',
        'These are route-pattern examples only. They do not confirm eligibility, a designated port or a permitted stay area.',
      ],
    },
    {
      title: 'How the calculator works',
      items: [
        transitAnswers.clockInputCopy.firstStep,
        'The calculator starts the official 240-hour clock at 00:00 China Standard Time on the day after entry and adds 240 hours.',
        'The displayed planning time is one minute before the exact boundary. Travelers should leave a practical buffer for transport, check-in, security and exit inspection.',
      ],
    },
    {
      title: 'What the result cannot confirm',
      items: [
        'A city name does not prove that the exact airport, railway port or seaport is a designated port under the current policy.',
        'Eligibility also depends on nationality, ordinary-passport status, a confirmed onward ticket, a different-country-or-region route, permitted stay area and the policy in force on the travel date.',
        'Chinese border inspection authorities make the final temporary-entry and admission decision. The actual immigration entry record controls if it differs from the scheduled arrival.',
      ],
    },
    {
      title: 'Checks to complete before booking',
      items: [
        'Confirm that the passport nationality appears on the current official list and that the passport is an ordinary passport.',
        'Confirm the exact entry port, exit port and permitted area using the latest National Immigration Administration information.',
        'Keep a confirmed onward ticket with a departure date and seat, and avoid a simple return to the same country or region of origin.',
      ],
    },
  ],
  faqs: [
    ...calculatorContent.faqs,
    ['When does the 240-hour clock start?', 'Under the current National Immigration Administration rule, the 240-hour period is calculated from 00:00 on the day after entry. This calculator uses China Standard Time. Your immigration record and the border authority’s calculation control, so leave a practical buffer before the displayed boundary.'],
    ['Does this calculator confirm that I qualify?', 'No. It calculates the time window only. Eligibility also depends on your passport nationality, ordinary-passport status, confirmed onward ticket, third-country or region route, designated entry and exit ports, permitted stay area, purpose of travel and the policy in force on your travel date.'],
    ['Can I return to the same country or region I departed from?', 'A simple route such as United States to Mainland China to United States does not meet the third-country or region transit pattern. The origin and onward destination normally need to be different. Airlines and border authorities should confirm complex routes before travel.'],
    ['Does every airport or port qualify?', 'No. The policy applies through designated ports and within permitted areas. Selecting an entry city here does not verify a particular terminal, airport, railway port or seaport. Check the latest official port list and confirm your planned entry and exit points.'],
    ['Which time zone does the calculator use?', transitAnswers.clockInputCopy.timeZoneAnswer],
  ],
  sourceLinks: [
    [transitAnswers.officialSource.label, transitAnswers.officialSource.href],
    ['National Immigration Administration: 240-hour visa-free transit policy', 'https://en.nia.gov.cn/n147418/n147463/c183412/content.html'],
  ],
};

// ---- 240-hour transit answer pages: one question each, answer in the first two sentences ----
function transitAnswerBody(page) {
  const related = guideRelatedLinks[page.slug];
  const sources = page.sources.map((key) => transitAnswers[key]);
  const lastUpdated = page.lastUpdated || transitAnswers.lastUpdated;
  const linkStyle = 'color: #155e63; font-weight: 700; text-underline-offset: 4px;';
  const cta = `<p style="margin: 20px 0;"><a href="${escapeAttr(transitAnswers.calculatorPath)}" style="display: flex; justify-content: space-between; gap: 12px; border-radius: 18px; background: #155e63; color: #fffdf8; padding: 16px 20px; font-weight: 700; text-decoration: none;">Calculate your exact 240-hour deadline <span aria-hidden="true">&rarr;</span></a></p>`;
  const table = (headers, rows, minWidth = 520) => `
        <div style="overflow-x: auto;">
          <table style="width: 100%; min-width: ${minWidth}px; border-collapse: collapse; background: #fff; color: #536365; font-size: 0.92rem;">
            <thead><tr>${headers.map((header) => `<th scope="col" style="border-bottom: 2px solid rgba(21, 94, 99, 0.2); padding: 10px; text-align: left; color: #122022;">${escapeHtml(header)}</th>`).join('')}</tr></thead>
            <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td style="border-bottom: 1px solid rgba(21, 94, 99, 0.1); padding: 10px; vertical-align: top;">${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>`;
  const portGroups = new Map();
  for (const [province, port, area] of transit240PortRows) {
    const group = portGroups.get(province) || { ports: [], area };
    group.ports.push(port);
    portGroups.set(province, group);
  }
  return `
    <main id="static-seo-content" style="max-width: 768px; margin: 0 auto; padding: 32px 20px 48px; color: #122022; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <article>
        <p style="margin: 0 0 18px;"><a href="${escapeAttr(transitAnswers.calculatorPath)}" style="${linkStyle}">&larr; 240-hour transit calculator</a></p>
        <p style="margin: 0 0 10px; color: #155e63; font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;">China 240-hour visa-free transit &middot; Updated ${escapeHtml(lastUpdated)}</p>
        <h1 style="margin: 0 0 20px; font-size: clamp(1.9rem, 5vw, 3rem); line-height: 1.1; letter-spacing: -0.02em;">${escapeHtml(page.question)}</h1>
        <p><a href="#lin-help" style="${linkStyle}">${escapeHtml(planningHelp.byline)}</a></p>
        <section aria-labelledby="short-answer" style="padding: 22px; border: 1px solid rgba(21, 94, 99, 0.2); border-radius: 22px; background: #fffdf8;">
          <h2 id="short-answer" style="margin: 0; color: #155e63; font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase;">Short answer</h2>
          ${page.answer.map((sentence) => `<p style="margin: 12px 0 0; font-size: 1.12rem; line-height: 1.7;">${escapeHtml(sentence)}</p>`).join('')}
        </section>
        ${cta}
        <section aria-labelledby="worked-example" style="margin: 28px 0; padding: 22px; border-radius: 22px; background: #edf5f2;">
          <h2 id="worked-example" style="margin: 0 0 8px; font-size: 1.4rem;">${escapeHtml(page.example.title)}</h2>
          <p style="margin: 0 0 14px; color: #536365; line-height: 1.6;">${escapeHtml(page.example.intro)}</p>
          ${table(page.example.headers, page.example.rows)}
          <p style="margin: 14px 0 0; color: #536365; line-height: 1.6;">${escapeHtml(page.example.note)}</p>
        </section>
        ${page.sections.map((section, index) => `
        <section aria-labelledby="answer-section-${index}" style="margin: 28px 0;">
          <h2 id="answer-section-${index}" style="margin: 0 0 10px; font-size: 1.4rem;">${escapeHtml(section.title)}</h2>
          <${section.ordered ? 'ol' : 'ul'} style="margin: 0; padding-left: 20px; color: #536365; line-height: 1.8;">${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${section.ordered ? 'ol' : 'ul'}>
        </section>`).join('')}
        ${page.portsTable ? `
        <section aria-labelledby="ports-table" style="margin: 28px 0;">
          <h2 id="ports-table" style="margin: 0 0 12px; font-size: 1.4rem;">All ${transit240PortRows.length} designated ports by region</h2>
          ${table(['Province or region', 'Designated ports', 'Where you may travel in this region'], [...portGroups.entries()].map(([province, group]) => [province, group.ports.join('; '), group.area]), 640)}
        </section>` : ''}
        <section aria-labelledby="answer-faq" style="margin: 32px 0;">
          <h2 id="answer-faq" style="margin: 0 0 12px; font-size: 1.4rem;">Related questions</h2>
          ${page.faqs.map(([question, answer]) => `
          <div style="margin: 0 0 12px; padding: 18px; border: 1px solid rgba(21, 94, 99, 0.12); border-radius: 18px; background: #fff;">
            <h3 style="margin: 0 0 8px; font-size: 1rem;">${escapeHtml(question)}</h3>
            <p style="margin: 0; color: #536365; line-height: 1.7;">${escapeHtml(answer)}</p>
          </div>`).join('')}
        </section>
        ${cta}
        ${renderPlanningHelp(planningHelp, 'guide')}
        <nav aria-labelledby="more-answers" aria-label="Related China travel guides" style="margin: 32px 0;">
          <h2 id="more-answers" style="margin: 0 0 10px; font-size: 1.2rem;">More 240-hour transit answers</h2>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.9;">
            ${related.map(({ label, href }) => `<li><a href="${escapeAttr(href)}" style="${linkStyle}">${escapeHtml(label)}</a></li>`).join('')}
          </ul>
        </nav>
        <footer style="margin: 32px 0 0; padding-top: 20px; border-top: 1px solid rgba(18, 32, 34, 0.15); color: #536365; line-height: 1.7; font-size: 0.92rem;">
          <h2 style="margin: 0 0 8px; color: #122022; font-size: 1rem;">Official sources</h2>
          <ul style="margin: 0 0 12px; padding-left: 20px;">${sources.map((source) => `<li><a href="${escapeAttr(source.href)}" rel="noopener noreferrer" style="${linkStyle}">${escapeHtml(source.label)}</a></li>`).join('')}</ul>
          <p style="margin: 0;">Last updated: ${escapeHtml(lastUpdated)}. Rules can change; Chinese border inspection makes the final decision on entry.</p>
        </footer>
      </article>
    </main>
  `;
}

for (const page of transitAnswers.pages) {
  pageMeta[page.slug] = {
    heading: page.question,
    title: page.title,
    description: page.description,
    lastReviewed: page.lastUpdated || transitAnswers.lastUpdated,
    lastModified: page.lastModified || transitAnswers.lastModified,
    // FAQPage JSON-LD: the page's own question with its two-sentence answer, then the related questions
    faqs: [[page.question, page.answer.join(' ')], ...page.faqs],
    customBody: transitAnswerBody(page),
  };
}


// Give focused search pages their own answer instead of reusing a broader guide's sections.
const focusedPageContent = {
  "china-travel-ai-itinerary-generator": {
    "contentSections": [
      {
        "title": "What to enter",
        "items": [
          "Provide travel dates, arrival and departure cities, group size and preferred pace.",
          "Add fixed flights, train tickets, hotels and attractions before asking for a route.",
          "Flag mobility, diet and budget needs so the itinerary can account for them."
        ]
      },
      {
        "title": "Check the generated plan",
        "items": [
          "Verify travel times and station names using the transport provider.",
          "Confirm opening hours, reservations and entry rules at each attraction.",
          "Leave spare time on transfer days and change anything that depends on unavailable tickets."
        ]
      }
    ],
    "lastReviewed": "October 5, 2026",
    "lastModified": "2026-10-05",
    "article": true
  },
  "what-to-eat-in-china-first-time-guide": {
    "contentSections": [
      {
        "title": "A first-timer tasting list",
        "items": [
          "Try jianbing for breakfast, dumplings or noodles for a simple lunch, and a regional dinner.",
          "Choose Peking duck in Beijing, xiaolongbao around Shanghai, or hot pot in Sichuan and Chongqing when they fit your route.",
          "Ask about spice, peanuts, pork and shellfish before ordering if relevant to your diet."
        ]
      },
      {
        "title": "Order without guessing",
        "items": [
          "Save dish names in Chinese and show them to the server.",
          "Check whether portions are shared and whether a menu price is per item or by weight.",
          "Choose a busy, clearly priced restaurant and keep a translation fallback."
        ],
        "links": [{ "label": "How to order food in China", "description": "QR menus, dietary needs, serious allergies and paying at the table.", "href": "/china-food-ordering-guide/" }, { "label": "Amap's menu translation", "description": "Turn a photo of a Chinese menu into English dish names, tags and prices.", "href": "/amap-english-mode-guide-2026/#menu-translation" }]
      }
    ],
    "lastReviewed": "October 23, 2026",
    "lastModified": "2026-10-23",
    "article": true
  },
  "how-to-use-wechat-as-foreigner-2026": {
    "contentSections": [
      {
        "title": "Set up the messaging app",
        "items": [
          "Install the official WeChat app and register with a phone number you can keep using.",
          "Complete only the identity or security steps shown inside your own account.",
          "Add recovery details and test a contact message before departure."
        ]
      },
      {
        "title": "Use features as available",
        "items": [
          "Scan a contact QR code to add a person, and check permissions before using a mini program.",
          "WeChat Pay has separate card and identity requirements; a messaging account alone does not guarantee payment access.",
          "Keep another payment and communication option in case a feature is restricted."
        ]
      }
    ],
    "lastReviewed": "October 5, 2026",
    "lastModified": "2026-10-05",
    "article": true
  },
  "beijing-shanghai-layover-240-hour-guide": {
    contentSections: layoverAirportPlanning.sections,
    lastReviewed: layoverAirportPlanning.reviewed,
    lastModified: layoverAirportPlanning.modified,
    article: true,
  },
};
for (const [slug, content] of Object.entries(focusedPageContent)) {
  Object.assign(pageMeta[slug], content);
}

function requireIndex(index, label) {
  if (index === -1) throw new Error(`guideContentAdditions: "${label}" not found`);
  return index;
}

function insertAfter(list, index, item, label) {
  list.splice(requireIndex(index, label) + 1, 0, item);
}

pageMeta['china-online-arrival-card-2026'] = {
  ...arrivalCardGuide,
  article: true,
  featuredFaqCount: 3,
  ctaBeforeFeaturedFaqs: true,
};

for (const [slug, additions] of Object.entries(guideContentAdditions)) {
  const meta = pageMeta[slug];
  // Copy first: other pages spread these arrays from the same meta object.
  Object.assign(meta, { contentSections: [...meta.contentSections], faqs: [...meta.faqs] });
  for (const { after, ...section } of additions.sections) {
    insertAfter(meta.contentSections, meta.contentSections.findIndex(({ title }) => title === after), section, `${slug} / ${after}`);
  }
  for (const { after, question, answer } of additions.faqs) {
    insertAfter(meta.faqs, meta.faqs.findIndex(([existing]) => existing === after), [question, answer], `${slug} / ${after}`);
  }
  for (const question of additions.removeFaqs) {
    requireIndex(meta.faqs.findIndex(([existing]) => existing === question), `${slug} / ${question}`);
  }
  meta.faqs = meta.faqs.filter(([question]) => !additions.removeFaqs.includes(question));
  // `section` may list several titles when the static page and the app name the same section differently.
  for (const { section: title, links } of additions.sectionLinks) {
    const titles = [title].flat();
    const index = requireIndex(meta.contentSections.findIndex((section) => titles.includes(section.title)), `${slug} / ${titles.join(' | ')}`);
    meta.contentSections[index] = { ...meta.contentSections[index], links: [...(meta.contentSections[index].links || []), ...links] };
  }
  // A one-sentence note with inline links, shown at the end of the section.
  for (const { section: title, text } of additions.sectionNotes || []) {
    const titles = [title].flat();
    const index = requireIndex(meta.contentSections.findIndex((section) => titles.includes(section.title)), `${slug} / ${titles.join(' | ')}`);
    meta.contentSections[index] = { ...meta.contentSections[index], notes: [...(meta.contentSections[index].notes || []), text] };
  }
  // No added sources: keep the page's own list (or its default one).
  if (additions.sources.length) meta.sourceLinks = [...(meta.sourceLinks || []), ...additions.sources.map(({ label, href }) => [label, href])];
  // Link-only additions leave the page's dates alone.
  if (additions.reviewed) Object.assign(meta, { lastReviewed: additions.reviewed, lastModified: additions.modified });
}

const pages = Object.keys(pageMeta);
const noindexPages = new Set(['about', 'plan', 'pricing', 'refund', 'unsubscribe']);

function pagePath(page) {
  return `/${page}/`;
}

function pageUrl(page) {
  return `${siteUrl}${pagePath(page)}`;
}

function escapeAttr(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const staticCtas = {
  guides: ['Open the free toolkit', '/'],
  pricing: ['View travel passes', '/pricing/'],
  terms: ['Read the terms', '/terms/'],
  privacy: ['Read the privacy policy', '/privacy/'],
  refund: ['Read the refund policy', '/refund/'],
  contact: ['Contact support', '/contact/'],
  about: ['Learn about ChinaEase Buddy', '/about/'],
  unsubscribe: ['Contact support', '/contact/'],
  'china-travel-apps': ['Get my free China itinerary', '/#trip-plan'],
  'china-visa-free-travel-guide': ['Get my free China itinerary', '/#trip-plan'],
  'china-online-arrival-card-2026': ['Plan my arrival and first China days', '/#trip-plan'],
  'china-hotels-for-foreigners': ['Get my free China itinerary', '/#trip-plan'],
  'china-food-ordering-guide': ['Get my free China itinerary', '/#trip-plan'],
  'chinese-travel-phrases': ['Open the free phrase tools', '/?journey=china'],
  'china-travel-safety-guide': ['Get my free China itinerary', '/#trip-plan'],
  'china-travel-budget': ['Get my free China itinerary', '/#trip-plan'],
  'china-metro-guide': ['Get my free China itinerary', '/#trip-plan'],
  '7-day-china-itinerary': ['Get my personalised 7-day itinerary', '/#trip-plan'],
  '10-day-china-itinerary': ['Get my personalised 10-day itinerary', '/#trip-plan'],
  '14-day-china-itinerary': ['Get my personalised 14-day itinerary', '/#trip-plan'],
  'beijing-vs-shanghai': ['Get my personalised China itinerary', '/#trip-plan'],
  '3-day-beijing-itinerary': ['Get my personalised Beijing itinerary', '/#trip-plan'],
  '3-day-shanghai-itinerary': ['Get my personalised Shanghai itinerary', '/#trip-plan'],
  '3-day-xian-itinerary': ['Get my personalised Xi\'an itinerary', '/#trip-plan'],
  '3-day-chongqing-itinerary': ['Get my personalised Chongqing itinerary', '/#trip-plan'],
  '3-day-chengdu-itinerary': ['Get my personalised Chengdu itinerary', '/#trip-plan'],
  '3-day-guilin-yangshuo-itinerary': ['Get this as custom itinerary', '/#trip-plan'],
  '3-day-zhangjiajie-itinerary': ['Get my personalised Zhangjiajie itinerary', '/#trip-plan'],
  '3-day-shenzhen-itinerary': ['Get this as custom itinerary', '/#trip-plan'],
  '3-day-guangzhou-itinerary': ['Get my personalised Guangzhou itinerary', '/#trip-plan'],
  '3-day-hangzhou-itinerary': ['Get my personalised Hangzhou itinerary', '/#trip-plan'],
  '3-day-suzhou-itinerary': ['Get my personalised Suzhou itinerary', '/#trip-plan'],
  '3-day-nanjing-itinerary': ['Get my personalised Nanjing itinerary', '/#trip-plan'],
  '3-day-dali-itinerary': ['Get my personalised Dali itinerary', '/#trip-plan'],
  'china-golden-week-2026-travel-guide': ['Get my Golden Week China itinerary', '/#trip-plan'],
  'great-wall-of-china-day-trip-from-beijing': ['Get my Beijing itinerary', '/#trip-plan'],
  'chengdu-panda-base-guide': ['Get my Chengdu itinerary', '/#trip-plan'],
  'beijing-airport-to-city-guide': ['Get my Beijing itinerary', '/#trip-plan'],
  'amap-vs-google-maps-china': ['Get my China itinerary', '/#trip-plan'],
  'best-time-to-visit-china': ['Get my itinerary for the right season', '/#trip-plan'],
  'china-esim-internet-guide': ['Get my free China itinerary', '/#trip-plan'],
  'china-sim-card-for-foreigners': ['Get my free China itinerary', '/#trip-plan'],
  'china-240-hour-visa-free-transit-2026': ['Check my visa-free transit itinerary', '/#trip-plan'],
  'china-240-hour-transit-calculator': ['Get my free China trip plan', '/plan/'],
  'china-visa-free-checker': ['Get my free trip starter', '/#trip-plan'],
  'alipay-for-foreigners': ['Get my free China itinerary', '/#trip-plan'],
  'wechat-pay-for-foreigners': ['Get my free China itinerary', '/#trip-plan'],
  'china-payment-guide': ['Get my free China itinerary', '/#trip-plan'],
  'china-travel-checklist': ['Get my free China itinerary', '/#trip-plan'],
  'china-emergency-numbers': ['View emergency help', '/?journey=emergency'],
  'china-itinerary-first-time-7-10-14-days': ['Get my free itinerary', '/plan/'],
  'beijing-shanghai-layover-240-hour-guide': ['Plan my layover with Buddy', '/'],
  'what-to-eat-in-china-first-time-guide': ['Ask Buddy what to order', '/'],
  'how-to-use-wechat-as-foreigner-2026': ['Build my WeChat setup checklist', '/'],
  'nia-12367-online-accommodation-registration-guide': ['Get your free personalized trip starter', '/#trip-plan'],
  'china-travel-ai-itinerary-generator': ['Get my free itinerary', '/plan/'],
  faq: ['Open the free toolkit', '/'],
};

const relatedLinks = [
  ['All guides', '/guides/'],
  ['China visa-free checker', '/china-visa-free-checker/'],
  ['How to Use TenPayGo in China: Sign Up, Link a Card, Pay', '/tenpaygo-for-tourists/'],
  ['China eSIM & internet guide', '/china-esim-internet-guide/'],
  ['China visa-free travel guide', '/china-visa-free-travel-guide/'],
  ['China online arrival card', '/china-online-arrival-card-2026/'],
  ['China airport arrival guide', '/china-airport-arrival-guide/'],
  ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
  ['How to order food in China', '/china-food-ordering-guide/'],
  ['Essential Chinese travel phrases', '/chinese-travel-phrases/'],
  ['China travel safety guide', '/china-travel-safety-guide/'],
  ['China travel budget', '/china-travel-budget/'],
  ['China travel apps', '/china-travel-apps/'],
  ['NIA 12367 accommodation registration', '/nia-12367-online-accommodation-registration-guide/'],
  ['Amap English mode guide', '/amap-english-mode-guide-2026/'],
  ['Alipay metro QR guide', '/alipay-metro-qr-transport-code-guide/'],
  ['China travel AI itinerary generator', '/china-travel-ai-itinerary-generator/'],
  ['WeChat verification without a friend', '/wechat-verification-without-friend-qr-2026/'],
  ['China metro guide', '/china-metro-guide/'],
  ['DiDi in China for foreigners', '/didi-in-china-for-foreigners/'],
  ['China train travel guide', '/china-train-travel-guide/'],
  ['7-day China itinerary', '/7-day-china-itinerary/'],
  ['10-day China itinerary', '/10-day-china-itinerary/'],
  ['14-day China itinerary', '/14-day-china-itinerary/'],
  ['Beijing vs Shanghai', '/beijing-vs-shanghai/'],
  ['3-day Beijing itinerary', '/3-day-beijing-itinerary/'],
  ['3-day Shanghai itinerary', '/3-day-shanghai-itinerary/'],
  ['3-day Xi\'an itinerary', '/3-day-xian-itinerary/'],
  ['3-day Chongqing itinerary', '/3-day-chongqing-itinerary/'],
  ['3-day Chengdu itinerary', '/3-day-chengdu-itinerary/'],
  ['3-day Guilin and Yangshuo itinerary', '/3-day-guilin-yangshuo-itinerary/'],
  ['3-day Zhangjiajie itinerary', '/3-day-zhangjiajie-itinerary/'],
  ['3-day Shenzhen itinerary', '/3-day-shenzhen-itinerary/'],
  ['3-day Guangzhou itinerary', '/3-day-guangzhou-itinerary/'],
  ['3-day Hangzhou itinerary', '/3-day-hangzhou-itinerary/'],
  ['3-day Suzhou itinerary', '/3-day-suzhou-itinerary/'],
  ['3-day Nanjing itinerary', '/3-day-nanjing-itinerary/'],
  ['3-day Dali itinerary', '/3-day-dali-itinerary/'],
  ['China Golden Week 2026 travel guide', '/china-golden-week-2026-travel-guide/'],
  ['Great Wall day trip from Beijing', '/great-wall-of-china-day-trip-from-beijing/'],
  ['Chengdu Panda Base guide', '/chengdu-panda-base-guide/'],
  ['DiDi Payment for Foreigners', '/didi-payment-for-foreigners/'],
  ['Beijing Airport to City Guide', '/beijing-airport-to-city-guide/'],
  ['AMap vs Google Maps in China', '/amap-vs-google-maps-china/'],
  ['Best time to visit China', '/best-time-to-visit-china/'],
  ['WeChat Pay for foreigners', '/wechat-pay-for-foreigners/'],
  ['China payment guide', '/china-payment-guide/'],
  ['China travel checklist', '/china-travel-checklist/'],
  ['China emergency numbers', '/china-emergency-numbers/'],
  ['China 240-hour visa-free transit guide', '/china-240-hour-visa-free-transit-2026/'],
  ['China eSIM guide', '/china-esim-internet-guide/'],
  ['China itineraries', '/china-itinerary-first-time-7-10-14-days/'],
  ['China tourist safety 2026', '/china-travel-safety-guide/'],
  ['Best apps for China travel', '/china-travel-apps/'],
  ['DiDi for foreigners', '/didi-in-china-for-foreigners/'],
  ['Beijing and Shanghai layover guide', '/beijing-shanghai-layover-240-hour-guide/'],
  ['China travel budget', '/china-travel-budget/'],
  ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
  ['Google Maps and Amap guide', '/amap-vs-google-maps-china/'],
  ['Great Wall from Beijing', '/great-wall-of-china-day-trip-from-beijing/'],
  ['What to eat in China', '/what-to-eat-in-china-first-time-guide/'],
  ['WeChat for foreigners', '/how-to-use-wechat-as-foreigner-2026/'],
  ['FAQ', '/faq/'],
];

const pageRelatedLinks = {
  'china-240-hour-visa-free-transit-2026': [
    ['240-hour transit calculator', '/china-240-hour-transit-calculator/'],
    ['China visa-free checker', '/china-visa-free-checker/'],
    ['7-day China itinerary', '/7-day-china-itinerary/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['14-day China itinerary', '/14-day-china-itinerary/'],
    ['3-day Beijing itinerary', '/3-day-beijing-itinerary/'],
    ['3-day Shanghai itinerary', '/3-day-shanghai-itinerary/'],
    ['3-day Xi\'an itinerary', '/3-day-xian-itinerary/'],
    ['3-day Chongqing itinerary', '/3-day-chongqing-itinerary/'],
    ['3-day Chengdu itinerary', '/3-day-chengdu-itinerary/'],
    ['3-day Guilin and Yangshuo itinerary', '/3-day-guilin-yangshuo-itinerary/'],
    ['3-day Zhangjiajie itinerary', '/3-day-zhangjiajie-itinerary/'],
    ['3-day Shenzhen itinerary', '/3-day-shenzhen-itinerary/'],
    ['3-day Guangzhou itinerary', '/3-day-guangzhou-itinerary/'],
    ['3-day Hangzhou itinerary', '/3-day-hangzhou-itinerary/'],
    ['3-day Suzhou itinerary', '/3-day-suzhou-itinerary/'],
    ['3-day Nanjing itinerary', '/3-day-nanjing-itinerary/'],
    ['3-day Dali itinerary', '/3-day-dali-itinerary/'],
    ['First-time China itinerary guide', '/china-itinerary-first-time-7-10-14-days/'],
    ['China SIM card for foreigners', '/china-sim-card-for-foreigners/'],
    ['China payment guide', '/china-payment-guide/'],
  ],
  'didi-payment-for-foreigners': [
    ['Didi In China For Foreigners', '/didi-in-china-for-foreigners/'],
    ['Alipay For Foreigners', '/alipay-for-foreigners/'],
    ['Wechat Pay For Foreigners', '/wechat-pay-for-foreigners/'],
    ['China Payment Guide', '/china-payment-guide/'],
    ['Beijing Airport to City Guide', '/beijing-airport-to-city-guide/'],
    ['Get my free China itinerary', '/#trip-plan'],
  ],
  'beijing-airport-to-city-guide': [
    ['China Airport Arrival Guide', '/china-airport-arrival-guide/'],
    ['DiDi Payment for Foreigners', '/didi-payment-for-foreigners/'],
    ['China Metro Guide', '/china-metro-guide/'],
    ['3 Day Beijing Itinerary', '/3-day-beijing-itinerary/'],
    ['China Esim Internet Guide', '/china-esim-internet-guide/'],
    ['Get my free China itinerary', '/#trip-plan'],
  ],
  'amap-vs-google-maps-china': [
    ['Amap In English', '/amap-english-mode-guide-2026/'],
    ['China Travel Apps', '/china-travel-apps/'],
    ['China Metro Guide', '/china-metro-guide/'],
    ['Didi In China For Foreigners', '/didi-in-china-for-foreigners/'],
    ['China Esim Internet Guide', '/china-esim-internet-guide/'],
    ['Get my free China itinerary', '/#trip-plan'],
  ],
  'china-visa-free-travel-guide': [
    ['China visa-free checker', '/china-visa-free-checker/'],
    ['240-hour visa-free transit guide', '/china-240-hour-visa-free-transit-2026/'],
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['China travel checklist', '/china-travel-checklist/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'china-travel-apps': [
    ['First trip to China', '/first-trip-to-china/'],
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
    ['AMap in English', '/amap-english-mode-guide-2026/'],
    ['China metro guide', '/china-metro-guide/'],
    ['DiDi without Chinese', '/didi-in-china-for-foreigners/'],
    ['How to pay for DiDi in China', '/didi-payment-for-foreigners/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China eSIM & internet guide', '/china-esim-internet-guide/'],
    ['Alipay for foreigners', '/alipay-for-foreigners/'],
    ['WeChat Pay without Chinese bank', '/china-payment-guide/'],
    ['3-day Shenzhen itinerary', '/3-day-shenzhen-itinerary/'],
    ['3-day Guilin and Yangshuo itinerary', '/3-day-guilin-yangshuo-itinerary/'],
    ['How to order food in China', '/china-food-ordering-guide/'],
    ['Essential Chinese travel phrases', '/chinese-travel-phrases/'],
    ['China travel safety guide', '/china-travel-safety-guide/'],
    ['China travel budget', '/china-travel-budget/'],
    ['China travel checklist', '/china-travel-checklist/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'didi-in-china-for-foreigners': [
    ['How to pay for DiDi in China', '/didi-payment-for-foreigners/'],
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['AMap in English', '/amap-english-mode-guide-2026/'],
    ['China metro guide', '/china-metro-guide/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['China payment guide', '/china-payment-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'china-metro-guide': [
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['AMap in English', '/amap-english-mode-guide-2026/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['DiDi in China for foreigners', '/didi-in-china-for-foreigners/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China payment guide', '/china-payment-guide/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'china-train-travel-guide': [
    ['First trip to China', '/first-trip-to-china/'],
    ['7-day China itinerary', '/7-day-china-itinerary/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['14-day China itinerary', '/14-day-china-itinerary/'],
    ['Beijing vs Shanghai', '/beijing-vs-shanghai/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['China metro guide', '/china-metro-guide/'],
    ['China eSIM & internet guide', '/china-esim-internet-guide/'],
    ['China payment guide', '/china-payment-guide/'],
    ['China travel checklist', '/china-travel-checklist/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'china-itinerary-first-time-7-10-14-days': [
    ['7-day China itinerary', '/7-day-china-itinerary/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['14-day China itinerary', '/14-day-china-itinerary/'],
    ['First trip to China guide', '/first-trip-to-china/'],
    ['China train booking guide', '/china-train-travel-guide/'],
    ['China travel budget', '/china-travel-budget/'],
    ['China visa-free travel guide', '/china-visa-free-travel-guide/'],
    ['China eSIM guide', '/china-esim-internet-guide/'],
    ['Get my free personalised China itinerary', '/#trip-plan'],
  ],
  '7-day-china-itinerary': [
    ['3-day Beijing itinerary', '/3-day-beijing-itinerary/'],
    ['3-day Shanghai itinerary', '/3-day-shanghai-itinerary/'],
    ['Compare 7, 10 and 14-day China itineraries', '/china-itinerary-first-time-7-10-14-days/'],
    ['3-day Xi\'an itinerary', '/3-day-xian-itinerary/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['14-day China itinerary', '/14-day-china-itinerary/'],
    ['Beijing vs Shanghai', '/beijing-vs-shanghai/'],
    ['Best time to visit China', '/best-time-to-visit-china/'],
    ['China travel budget', '/china-travel-budget/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['China travel apps', '/china-travel-apps/'],
    ['China eSIM & internet guide', '/china-esim-internet-guide/'],
    ['China payment guide', '/china-payment-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get a personalised China itinerary', '/#trip-plan'],
  ],
  '10-day-china-itinerary': [
    ["3-day Shanghai itinerary", "/3-day-shanghai-itinerary/"],
    ["3-day Beijing itinerary", "/3-day-beijing-itinerary/"],
    ['Compare 7, 10 and 14-day China itineraries', '/china-itinerary-first-time-7-10-14-days/'],
    ['3-day Xi\'an itinerary', '/3-day-xian-itinerary/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['7-day China itinerary', '/7-day-china-itinerary/'],
    ['14-day China itinerary', '/14-day-china-itinerary/'],
    ['Beijing vs Shanghai', '/beijing-vs-shanghai/'],
    ['Best time to visit China', '/best-time-to-visit-china/'],
    ['China travel budget', '/china-travel-budget/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['China eSIM & internet guide', '/china-esim-internet-guide/'],
    ['China travel checklist', '/china-travel-checklist/'],
    ['Get a personalised China itinerary', '/#trip-plan'],
  ],
  '14-day-china-itinerary': [
    ['Compare 7, 10 and 14-day China itineraries', '/china-itinerary-first-time-7-10-14-days/'],
    ['3-day Xi\'an itinerary', '/3-day-xian-itinerary/'],
    ['7-day China itinerary', '/7-day-china-itinerary/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['Beijing vs Shanghai', '/beijing-vs-shanghai/'],
    ['Best time to visit China', '/best-time-to-visit-china/'],
    ['China travel budget', '/china-travel-budget/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['How to order food in China', '/china-food-ordering-guide/'],
    ['China travel apps', '/china-travel-apps/'],
    ['China eSIM & internet guide', '/china-esim-internet-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get a personalised China itinerary', '/#trip-plan'],
  ],
  'beijing-vs-shanghai': [
    ['3-day Beijing itinerary', '/3-day-beijing-itinerary/'],
    ['3-day Shanghai itinerary', '/3-day-shanghai-itinerary/'],
    ['7-day China itinerary', '/7-day-china-itinerary/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['14-day China itinerary', '/14-day-china-itinerary/'],
    ['Best time to visit China', '/best-time-to-visit-china/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China travel budget', '/china-travel-budget/'],
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['China metro guide', '/china-metro-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get a personalised China itinerary', '/#trip-plan'],
  ],
  '3-day-beijing-itinerary': [
    ['Great Wall day trip from Beijing', '/great-wall-of-china-day-trip-from-beijing/'],
    ['3-day Shanghai itinerary', '/3-day-shanghai-itinerary/'],
    ['Beijing vs Shanghai', '/beijing-vs-shanghai/'],
    ['7-day China itinerary', '/7-day-china-itinerary/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['14-day China itinerary', '/14-day-china-itinerary/'],
    ['Best time to visit China', '/best-time-to-visit-china/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China metro guide', '/china-metro-guide/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get a personalised Beijing itinerary', '/#trip-plan'],
  ],
  '3-day-shanghai-itinerary': [
    ['3-day Nanjing itinerary', '/3-day-nanjing-itinerary/'],
    ['3-day Suzhou itinerary', '/3-day-suzhou-itinerary/'],
    ['3-day Xi\'an itinerary', '/3-day-xian-itinerary/'],
    ['3-day Beijing itinerary', '/3-day-beijing-itinerary/'],
    ['Beijing vs Shanghai', '/beijing-vs-shanghai/'],
    ['7-day China itinerary', '/7-day-china-itinerary/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['14-day China itinerary', '/14-day-china-itinerary/'],
    ['Best time to visit China', '/best-time-to-visit-china/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China metro guide', '/china-metro-guide/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get a personalised Shanghai itinerary', '/#trip-plan'],
  ],
  '3-day-xian-itinerary': [
    ['3-day Beijing itinerary', '/3-day-beijing-itinerary/'],
    ['3-day Shanghai itinerary', '/3-day-shanghai-itinerary/'],
    ['7-day China itinerary', '/7-day-china-itinerary/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['14-day China itinerary', '/14-day-china-itinerary/'],
    ['Best time to visit China', '/best-time-to-visit-china/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China metro guide', '/china-metro-guide/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get a personalised Xi\'an itinerary', '/#trip-plan'],
  ],
  '3-day-chongqing-itinerary': [
    ['3-day Xi\'an itinerary', '/3-day-xian-itinerary/'],
    ['3-day Beijing itinerary', '/3-day-beijing-itinerary/'],
    ['3-day Shanghai itinerary', '/3-day-shanghai-itinerary/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['14-day China itinerary', '/14-day-china-itinerary/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China metro guide', '/china-metro-guide/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['Best time to visit China', '/best-time-to-visit-china/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get a personalised Chongqing itinerary', '/#trip-plan'],
  ],
  '3-day-chengdu-itinerary': [
    ['Chengdu Panda Base guide', '/chengdu-panda-base-guide/'],
    ['3-day Chongqing itinerary', '/3-day-chongqing-itinerary/'],
    ['3-day Xi\'an itinerary', '/3-day-xian-itinerary/'],
    ['14-day China itinerary', '/14-day-china-itinerary/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['How to order food in China', '/china-food-ordering-guide/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['Best time to visit China', '/best-time-to-visit-china/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get a personalised Chengdu itinerary', '/#trip-plan'],
  ],
  '3-day-guilin-yangshuo-itinerary': [
    ['3-day Dali itinerary', '/3-day-dali-itinerary/'],
    ['14-day China itinerary', '/14-day-china-itinerary/'], ['10-day China itinerary', '/10-day-china-itinerary/'], ['3-day Chengdu itinerary', '/3-day-chengdu-itinerary/'], ['3-day Chongqing itinerary', '/3-day-chongqing-itinerary/'], ['China train travel guide', '/china-train-travel-guide/'], ['DiDi in China for foreigners', '/didi-in-china-for-foreigners/'], ['China hotels for foreigners', '/china-hotels-for-foreigners/'], ['Apps to download before China', '/china-travel-apps/'], ['Best time to visit China', '/best-time-to-visit-china/'], ['First trip to China', '/first-trip-to-china/'], ['Get this as custom itinerary', '/#trip-plan'],
  ],
  '3-day-zhangjiajie-itinerary': [
    ['3-day Guilin and Yangshuo itinerary', '/3-day-guilin-yangshuo-itinerary/'], ['3-day Chengdu itinerary', '/3-day-chengdu-itinerary/'], ['14-day China itinerary', '/14-day-china-itinerary/'], ['10-day China itinerary', '/10-day-china-itinerary/'], ['China train travel guide', '/china-train-travel-guide/'], ['China hotels for foreigners', '/china-hotels-for-foreigners/'], ['Apps to download before China', '/china-travel-apps/'], ['Best time to visit China', '/best-time-to-visit-china/'], ['First trip to China', '/first-trip-to-china/'], ['Get a personalised Zhangjiajie itinerary', '/#trip-plan'],
  ],
  '3-day-shenzhen-itinerary': [
    ['3-day Guilin and Yangshuo itinerary', '/3-day-guilin-yangshuo-itinerary/'], ['3-day Shanghai itinerary', '/3-day-shanghai-itinerary/'], ['10-day China itinerary', '/10-day-china-itinerary/'], ['14-day China itinerary', '/14-day-china-itinerary/'], ['China airport arrival guide', '/china-airport-arrival-guide/'], ['China metro guide', '/china-metro-guide/'], ['China train travel guide', '/china-train-travel-guide/'], ['How to order food in China', '/china-food-ordering-guide/'], ['DiDi in China for foreigners', '/didi-in-china-for-foreigners/'], ['China hotels for foreigners', '/china-hotels-for-foreigners/'], ['Apps to download before China', '/china-travel-apps/'], ['First trip to China', '/first-trip-to-china/'], ['Get this as custom itinerary', '/#trip-plan'],
  ],
  '3-day-guangzhou-itinerary': [
    ['3-day Shenzhen itinerary', '/3-day-shenzhen-itinerary/'], ['3-day Guilin and Yangshuo itinerary', '/3-day-guilin-yangshuo-itinerary/'], ['10-day China itinerary', '/10-day-china-itinerary/'], ['14-day China itinerary', '/14-day-china-itinerary/'], ['China airport arrival guide', '/china-airport-arrival-guide/'], ['China metro guide', '/china-metro-guide/'], ['China train travel guide', '/china-train-travel-guide/'], ['How to order food in China', '/china-food-ordering-guide/'], ['China hotels for foreigners', '/china-hotels-for-foreigners/'], ['Best time to visit China', '/best-time-to-visit-china/'], ['First trip to China', '/first-trip-to-china/'], ['Get a personalised Guangzhou itinerary', '/#trip-plan'],
  ],
  '3-day-hangzhou-itinerary': [
    ['3-day Suzhou itinerary', '/3-day-suzhou-itinerary/'],
    ['3-day Shanghai itinerary', '/3-day-shanghai-itinerary/'], ['3-day Guangzhou itinerary', '/3-day-guangzhou-itinerary/'], ['10-day China itinerary', '/10-day-china-itinerary/'], ['14-day China itinerary', '/14-day-china-itinerary/'], ['China train travel guide', '/china-train-travel-guide/'], ['China metro guide', '/china-metro-guide/'], ['China hotels for foreigners', '/china-hotels-for-foreigners/'], ['How to order food in China', '/china-food-ordering-guide/'], ['Apps to download before China', '/china-travel-apps/'], ['Best time to visit China', '/best-time-to-visit-china/'], ['First trip to China', '/first-trip-to-china/'], ['Get a personalised Hangzhou itinerary', '/#trip-plan'],
  ],
  '3-day-suzhou-itinerary': [
    ['3-day Nanjing itinerary', '/3-day-nanjing-itinerary/'],
    ['3-day Shanghai itinerary', '/3-day-shanghai-itinerary/'],
    ['3-day Hangzhou itinerary', '/3-day-hangzhou-itinerary/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['China metro guide', '/china-metro-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get my personalised Suzhou itinerary', '/#trip-plan'],
  ],
  '3-day-nanjing-itinerary': [
    ['3-day Shanghai itinerary', '/3-day-shanghai-itinerary/'],
    ['3-day Suzhou itinerary', '/3-day-suzhou-itinerary/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['China metro guide', '/china-metro-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get my personalised Nanjing itinerary', '/#trip-plan'],
  ],
  '3-day-dali-itinerary': [
    ['3-day Guilin and Yangshuo itinerary', '/3-day-guilin-yangshuo-itinerary/'],
    ['3-day Zhangjiajie itinerary', '/3-day-zhangjiajie-itinerary/'],
    ['14-day China itinerary', '/14-day-china-itinerary/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['Best time to visit China', '/best-time-to-visit-china/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get my personalised Dali itinerary', '/#trip-plan'],
  ],
  'china-golden-week-2026-travel-guide': [
    ['Best time to visit China', '/best-time-to-visit-china/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['China travel budget', '/china-travel-budget/'],
    ['7-day China itinerary', '/7-day-china-itinerary/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get my Golden Week China itinerary', '/#trip-plan'],
  ],
  'great-wall-of-china-day-trip-from-beijing': [
    ['3-day Beijing itinerary', '/3-day-beijing-itinerary/'],
    ['7-day China itinerary', '/7-day-china-itinerary/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China travel safety guide', '/china-travel-safety-guide/'],
    ['China Golden Week 2026 travel guide', '/china-golden-week-2026-travel-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get my Beijing itinerary', '/#trip-plan'],
  ],
  'chengdu-panda-base-guide': [
    ['3-day Chengdu itinerary', '/3-day-chengdu-itinerary/'],
    ['14-day China itinerary', '/14-day-china-itinerary/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['China Golden Week 2026 travel guide', '/china-golden-week-2026-travel-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get my Chengdu itinerary', '/#trip-plan'],
  ],
  'best-time-to-visit-china': [
    ['China Golden Week 2026 travel guide', '/china-golden-week-2026-travel-guide/'],
    ['3-day Zhangjiajie itinerary', '/3-day-zhangjiajie-itinerary/'],
    ['3-day Guilin and Yangshuo itinerary', '/3-day-guilin-yangshuo-itinerary/'],
    ['3-day Chengdu itinerary', '/3-day-chengdu-itinerary/'],
    ['3-day Chongqing itinerary', '/3-day-chongqing-itinerary/'],
    ['3-day Xi\'an itinerary', '/3-day-xian-itinerary/'],
    ['3-day Beijing itinerary', '/3-day-beijing-itinerary/'],
    ['3-day Shanghai itinerary', '/3-day-shanghai-itinerary/'],
    ['Beijing vs Shanghai', '/beijing-vs-shanghai/'],
    ['7-day China itinerary', '/7-day-china-itinerary/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['14-day China itinerary', '/14-day-china-itinerary/'],
    ['China travel budget', '/china-travel-budget/'],
    ['China visa-free travel guide', '/china-visa-free-travel-guide/'],
    ['China travel safety guide', '/china-travel-safety-guide/'],
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get a personalised China itinerary', '/#trip-plan'],
  ],
  'china-esim-internet-guide': [
    ['Physical China SIM card with a passport', '/china-sim-card-for-foreigners/'],
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['China travel checklist', '/china-travel-checklist/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'china-sim-card-for-foreigners': [
    ['China payment guide', '/china-payment-guide/'],
    ['China travel checklist', '/china-travel-checklist/'],
    ['China eSIM & internet guide', '/china-esim-internet-guide/'],
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
  ],
  'china-online-arrival-card-2026': [
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
    ['China visa-free checker', '/china-visa-free-checker/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get my free China itinerary', '/#trip-plan'],
  ],
  'china-airport-arrival-guide': [
    ['China online arrival card', '/china-online-arrival-card-2026/'],
    ['China visa-free checker', '/china-visa-free-checker/'],
    ['240-hour visa-free transit guide', '/china-240-hour-visa-free-transit-2026/'],
    ['Register a non-hotel stay with NIA 12367', '/nia-12367-online-accommodation-registration-guide/'],
    ['Beijing Airport to City Guide', '/beijing-airport-to-city-guide/'],
    ['China visa-free travel guide', '/china-visa-free-travel-guide/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['China eSIM & internet guide', '/china-esim-internet-guide/'],
    ['China payment guide', '/china-payment-guide/'],
    ['China metro guide', '/china-metro-guide/'],
    ['DiDi in China for foreigners', '/didi-in-china-for-foreigners/'],
    ['China travel apps', '/china-travel-apps/'],
    ['China travel checklist 2026', '/china-travel-checklist/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'china-hotels-for-foreigners': [
    ['Online accommodation registration', '/nia-12367-online-accommodation-registration-guide/'],
    ['China visa-free travel guide', '/china-visa-free-travel-guide/'],
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['China eSIM & internet guide', '/china-esim-internet-guide/'],
    ['China travel apps', '/china-travel-apps/'],
    ['China payment guide', '/china-payment-guide/'],
    ['China metro guide', '/china-metro-guide/'],
    ['DiDi without Chinese', '/didi-in-china-for-foreigners/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'alipay-for-foreigners': [
    ['China eSIM & internet guide', '/china-esim-internet-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['How to pay in China as a foreigner', '/china-payment-guide/'],
    ['WeChat Pay for foreigners', '/wechat-pay-for-foreigners/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['FAQ', '/faq/'],
  ],
  'wechat-pay-for-foreigners': [
    ['Alipay for foreigners', '/alipay-for-foreigners/'],
    ['How to pay in China as a foreigner', '/china-payment-guide/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'china-payment-guide': [
    ['How to Use TenPayGo in China: Sign Up, Link a Card, Pay', '/tenpaygo-for-tourists/'],
    ['Open payment phrases', '/?journey=china&tool=pay'],
    ['Alipay for Foreigners', '/alipay-for-foreigners/'],
    ['WeChat Pay for Foreigners', '/wechat-pay-for-foreigners/'],
    ['How to pay for DiDi in China', '/didi-payment-for-foreigners/'],
    ['China travel apps', '/china-travel-apps/'],
    ['How to order food in China', '/china-food-ordering-guide/'],
    ['FAQ', '/faq/'],
  ],
  'china-food-ordering-guide': [
    ['China travel apps', '/china-travel-apps/'],
    ['Essential Chinese travel phrases', '/chinese-travel-phrases/'],
    ['China payment guide', '/china-payment-guide/'],
    ['Alipay for foreigners', '/alipay-for-foreigners/'],
    ['WeChat Pay for foreigners', '/wechat-pay-for-foreigners/'],
    ['Emergency numbers in China', '/china-emergency-numbers/'],
    ['AMap in English', '/amap-english-mode-guide-2026/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'chinese-travel-phrases': [
    ['How to order food in China', '/china-food-ordering-guide/'],
    ['China travel safety guide', '/china-travel-safety-guide/'],
    ['China travel apps', '/china-travel-apps/'],
    ['DiDi in China for foreigners', '/didi-in-china-for-foreigners/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['China payment guide', '/china-payment-guide/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['Emergency numbers in China', '/china-emergency-numbers/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Open the free phrase tools', '/?journey=china'],
  ],
  'china-travel-safety-guide': [
    ['Is China safe for US citizens?', '/china-travel-safety-guide/'],
    ['Emergency numbers in China', '/china-emergency-numbers/'],
    ['Essential Chinese travel phrases', '/chinese-travel-phrases/'],
    ['China travel apps', '/china-travel-apps/'],
    ['DiDi in China for foreigners', '/didi-in-china-for-foreigners/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['How to order food in China', '/china-food-ordering-guide/'],
    ['China payment guide', '/china-payment-guide/'],
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'china-travel-budget': [
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['How to order food in China', '/china-food-ordering-guide/'],
    ['China payment guide', '/china-payment-guide/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China metro guide', '/china-metro-guide/'],
    ['DiDi in China for foreigners', '/didi-in-china-for-foreigners/'],
    ['China eSIM & internet guide', '/china-esim-internet-guide/'],
    ['China travel apps', '/china-travel-apps/'],
    ['7-day China itinerary', '/7-day-china-itinerary/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['14-day China itinerary', '/14-day-china-itinerary/'],
    ['Best time to visit China', '/best-time-to-visit-china/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'tenpaygo-for-tourists': [
    ['China payment guide', '/china-payment-guide/'],
    ['WeChat Pay for foreigners', '/wechat-pay-for-foreigners/'],
    ['Alipay for foreigners', '/alipay-for-foreigners/'],
    ['China travel checklist', '/china-travel-checklist/'],
  ],
  'nia-12367-online-accommodation-registration-guide': [
    ['China visa-free checker', '/china-visa-free-checker/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['China visa-free travel guide', '/china-visa-free-travel-guide/'],
    ['China payment guide', '/china-payment-guide/'],
  ],
  'china-visa-free-checker': [
    ['240-hour transit calculator', '/china-240-hour-transit-calculator/'],
    ['240-hour transit guide', '/china-240-hour-visa-free-transit-2026/'],
    ['China visa-free travel guide', '/china-visa-free-travel-guide/'],
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
    ['China travel checklist', '/china-travel-checklist/'],
    ['NIA 12367 accommodation registration', '/nia-12367-online-accommodation-registration-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
  ],
  'china-240-hour-transit-calculator': [
    ...transitAnswerLinks,
    ['Alipay for foreigners: set up before you land', '/alipay-for-foreigners/'],
    ['240-hour transit guide', '/china-240-hour-visa-free-transit-2026/'],
    ['China visa-free checker', '/china-visa-free-checker/'],
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
    ['China travel checklist', '/china-travel-checklist/'],
  ],
  pricing: [
    ['Home', '/'],
    ['Terms of Service', '/terms/'],
    ['Privacy Policy', '/privacy/'],
    ['Refund information', '/refund/'],
  ],
};

const standardDisclaimer =
  'ChinaEase Buddy is a digital travel toolkit. It is not an official travel authority, visa service, immigration service, medical service, legal service, financial service, hotel booking service, or flight booking service. Always confirm important travel, payment, health, and entry information with official sources or service providers.';

const relatedGuidesForForeigners = [
  ['China payment guide', '/china-payment-guide/'],
  ['China SIM card for foreigners', '/china-sim-card-for-foreigners/'],
  ['China travel checklist', '/china-travel-checklist/'],
  ['3-day Beijing itinerary', '/3-day-beijing-itinerary/'],
];

function isItineraryPage(page) {
  return page.includes('itinerary') && page !== 'china-travel-ai-itinerary-generator';
}

function staticRelatedGuidesForForeigners(page) {
  return `
    <nav aria-label="Related guides for foreign visitors" style="margin: 0 0 24px; padding: 20px; border: 1px solid rgba(21, 94, 99, 0.14); border-radius: 20px; background: rgba(21, 94, 99, 0.05);">
      <h2 style="margin: 0 0 12px; font-size: 1.25rem;">Related guides for foreign visitors</h2>
      <div style="display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
        ${relatedGuidesForForeigners.filter(([, href]) => href !== `/${page}/`).map(([label, href]) => `<a href="${escapeAttr(href)}" style="display: flex; align-items: center; justify-content: space-between; min-height: 44px; border: 1px solid rgba(21, 94, 99, 0.12); border-radius: 14px; background: #fff; color: #155e63; padding: 10px 12px; font-weight: 700; text-decoration: none;"><span>${escapeHtml(label)}</span><span aria-hidden="true">&rarr;</span></a>`).join('')}
      </div>
    </nav>
  `;
}

function groupGuideHubSections(sections) {
  const groups = [
    { title: 'Entry rules and arrival', pattern: /(visa|arrival|12367|travel-checklist|240-hour-transit-calculator)/, items: [] },
    { title: 'Payments and daily essentials', pattern: /(payment|alipay|wechat|tenpay|esim|sim-card|travel-apps|food|phrases|emergency|safety|hotels)/, items: [] },
    { title: 'Transport and navigation', pattern: /(amap|maps|metro|didi|train|airport-to-city)/, items: [] },
    { title: 'Routes, timing and itineraries', pattern: /(itinerary|beijing-vs|golden-week|great-wall|panda|best-time|budget|layover|trip-cost)/, items: [] },
    { title: 'More China travel help', pattern: /.*/, items: [] },
  ];

  for (const item of sections) {
    const href = item[2].toLowerCase();
    const group = groups.find(({ pattern }) => pattern.test(href));
    group.items.push(item);
  }

  return groups.filter((group) => group.items.length > 0);
}

function staticTripCostEstimator() {
  const content = tripCostEstimatorContent;
  const styles = Object.entries(TRIP_COST_STYLES);
  const result = estimateTripCost(10, 1, 'mid-range');
  return `
    <nav aria-label="Budget calculator" style="margin: 0 0 16px;"><a href="#cost-estimator" style="color: #155e63; font-weight: 700;">Cost calculator and 7, 10, 14-day examples</a></nav>
    <section id="cost-estimator" aria-labelledby="cost-estimator-title" style="margin: 0 0 24px; padding: 20px; border: 1px solid rgba(21,94,99,0.2); border-radius: 20px; background: #fffdf8;">
      <h2 id="cost-estimator-title" style="margin: 0 0 12px; font-size: 1.25rem;">${escapeHtml(content.heading)}</h2>
      <p style="color: #536365; line-height: 1.7;">${escapeHtml(content.intro)}</p>
      <p>Use the interactive calculator to change days, travelers and style. The examples below are a planning reference.</p>
      <div style="padding: 16px; background: rgba(21,94,99,0.05); border-radius: 12px;">
        <p>Mid-range: ${escapeHtml(formatTripCostRange(result.dailyMinimum, result.dailyMaximum))} per person per day</p>
        <p><strong>Per person for 10 days: ${escapeHtml(formatTripCostRange(result.perPersonMinimum, result.perPersonMaximum))}</strong></p>
        <p><strong>All 1 traveler for 10 days: ${escapeHtml(formatTripCostRange(result.groupMinimum, result.groupMaximum))}</strong></p>
        <p>Daily-cost subtotals. Add separate trip costs below.</p>
      </div>
      <p style="color: #536365; line-height: 1.7;">${escapeHtml(content.assumptions)}</p>
      <p style="color: #536365; line-height: 1.7;">${escapeHtml(content.excludedCosts)}</p>
      <p style="color: #536365; line-height: 1.7;">${escapeHtml(content.roomNote)}</p>
      <h3>${escapeHtml(content.examplesHeading)}</h3>
      <p style="color: #536365; line-height: 1.7;">${escapeHtml(content.examplesNote)}</p>
      <div style="overflow-x: auto;">
        <table style="width: 100%; min-width: 520px; border-collapse: collapse;">
          <thead><tr><th scope="col" style="padding: 10px; text-align: left;">Days / one person</th>${styles.map(([, range]) => `<th scope="col" style="padding: 10px; text-align: left;">${escapeHtml(range.label)}</th>`).join('')}</tr></thead>
          <tbody>${content.exampleDays.map((days) => `<tr><th scope="row" style="padding: 10px; text-align: left;">${days} days</th>${styles.map(([style]) => { const example = estimateTripCost(days, 1, style); return `<td style="padding: 10px;">${escapeHtml(formatTripCostRange(example.perPersonMinimum, example.perPersonMaximum, example.openEnded))}</td>`; }).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>
    </section>`;
}

const richGuides = {
  'amap-english-mode-guide-2026': amapEnglishSetup,
  'alipay-metro-qr-transport-code-guide': alipayMetroGuide,
  'didi-payment-for-foreigners': didiPaymentGuide,
  'wechat-pay-for-foreigners': wechatPayGuide,
  'tenpaygo-for-tourists': tenPayGoGuide,
  'didi-in-china-for-foreigners': didiGuide,
  'wechat-verification-without-friend-qr-2026': wechatVerificationGuide,
  'china-airport-arrival-guide': airportArrivalGuide,
  'china-train-travel-guide': trainGuide,
  'china-travel-budget': budgetGuide,
  'chengdu-panda-base-guide': pandaBaseGuide,
  'amap-vs-google-maps-china': mapsComparisonGuide,
  'china-travel-apps': appsHubGuide,
  'china-hotels-for-foreigners': hotelsGuide,
  'china-travel-checklist': checklistGuide,
  '3-day-suzhou-itinerary': suzhouGuide,
  '3-day-beijing-itinerary': beijingGuide,
  '3-day-nanjing-itinerary': nanjingGuide,
};

function staticPageContent(page, meta) {
  if (meta.customBody) return page === 'plan' ? meta.customBody.replace('      <p style="margin: 0; color: #6b7678;', `${renderPlanningHelp(planningHelp, 'plan')}      <p style="margin: 0; color: #6b7678;`) : meta.customBody;
  const heading = meta.heading || meta.title.split('|')[0].trim();
  const [ctaLabel, ctaHref] = staticCtas[page] || ['Open ChinaEase Buddy', '/'];
  const faqItems = meta.faqs || [
    ['What is this page about?', meta.description],
    ['How can ChinaEase Buddy help?', 'Use the free toolkit to find practical China travel help for apps, payments, food, transport, hotels, and emergency situations.'],
  ];
  const featuredFaqCount = meta.featuredFaqCount || 0;
  const featuredFaqItems = faqItems.slice(0, featuredFaqCount);
  const remainingFaqItems = featuredFaqCount > 0 ? faqItems.slice(featuredFaqCount) : faqItems;
  // Pages written to a spec render their own byline, quick answer, CTA card, body and linked FAQ answers.
  const guideContent = richGuides[page];
  const amapGuide = guideContent ? createAmapGuideRenderer(guideContent) : null;
  const amapAnswers = new Map((guideContent?.faqs || []).map(({ question, answer }) => [question, answer]));
  const renderFaqItems = (items) => items.map(([question, answer]) => `
          <article style="margin: 0 0 14px; padding: 18px; border: 1px solid rgba(21, 94, 99, 0.12); border-radius: 18px; background: rgba(248, 243, 234, 0.72);">
            <h3 style="margin: 0 0 8px; font-size: 1rem;">${escapeHtml(question)}</h3>
            <p style="margin: 0; color: #536365; line-height: 1.7;">${amapGuide ? renderAmapInline(amapAnswers.get(question)) : escapeHtml(answer)}</p>
          </article>
        `).join('');
  const primaryCta = (amapGuide && !guideContent.keepPageCta) || ctaHref === `/${page}/` ? '' : `<p style="margin: 0 0 28px;"><a href="${escapeAttr(ctaHref)}" style="display: inline-flex; border-radius: 999px; background: #155e63; color: #fffdf8; padding: 12px 18px; font-weight: 700; text-decoration: none;">${escapeHtml(ctaLabel)}</a></p>`;

  return `
    <main id="static-seo-content" style="max-width: 960px; margin: 0 auto; padding: 48px 20px; color: #122022; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <p style="margin: 0 0 10px; color: #155e63; font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;">ChinaEase Buddy</p>
      ${page !== 'guides' && !noindexPages.has(page) ? `
        <nav aria-label="Breadcrumb" style="margin: 0 0 18px; font-size: 0.9rem;">
          <a href="/" style="color: #536365; text-decoration: none;">Home</a>
          <span aria-hidden="true" style="margin: 0 8px; color: #9aa5a6;">/</span>
          <a href="/guides/" style="color: #155e63; font-weight: 700; text-underline-offset: 4px;">China travel guides</a>
        </nav>
      ` : ''}
      <h1 style="margin: 0 0 18px; font-size: clamp(2rem, 6vw, 3.75rem); line-height: 1.05; letter-spacing: -0.03em;">${escapeHtml(heading)}</h1>
      ${amapGuide ? amapGuide.byline('#lin-help') : !['guides', 'pricing', 'terms', 'privacy', 'refund', 'contact', 'about', 'unsubscribe'].includes(page) ? `<p style="margin:0 0 20px;"><a href="#lin-help" style="color:#155e63;font-weight:600;">${escapeHtml(planningHelp.byline)}</a></p>` : ''}
      ${page === 'pricing' ? `${renderPlanningHelp(planningHelp, 'pricing')}<section aria-labelledby="digital-pass-scope"><h2 id="digital-pass-scope">${escapeHtml(planningHelp.digitalHeading)}</h2><p>${escapeHtml(planningHelp.digitalScope)}</p><p>${escapeHtml(passCopy.pay.checkout.separatePassNotice)}</p><p><a href="/?activate=1">${escapeHtml(passCopy.pass.claim.title)}</a></p><p>${escapeHtml(passCopy.pass.claim.receiptHint)}</p></section>` : ''}
      <section aria-labelledby="quick-answer" style="margin: 0 0 24px; padding: 22px; border: 1px solid rgba(21, 94, 99, 0.14); border-radius: 22px; background: #fffdf8;">
        <h2 id="quick-answer" style="margin: 0 0 10px; font-size: 1.25rem;">Quick answer</h2>
        ${amapGuide ? amapGuide.quickAnswer() : `<p style="margin: 0; color: #536365; line-height: 1.7;">${escapeHtml(meta.quickAnswer || meta.description)}</p>`}
      </section>
      ${amapGuide ? amapGuide.cta() : ''}
      <p style="margin: 0 0 20px; color: #6b7678; font-size: 0.9rem;">Last reviewed: ${escapeHtml(meta.lastReviewed || 'June 12, 2026')}</p>
      ${page === 'china-travel-budget' ? staticTripCostEstimator() : ''}
      ${meta.sections && page === 'guides' ? `
        <nav aria-label="China travel guide categories" style="margin: 0 0 24px;">
          ${groupGuideHubSections(meta.sections).map((group, groupIndex) => `
            <section aria-labelledby="guide-group-${groupIndex}" style="margin: 0 0 28px;">
              <h2 id="guide-group-${groupIndex}" style="margin: 0 0 12px; font-size: 1.35rem;">${escapeHtml(group.title)}</h2>
              <div style="display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
                ${group.items.map(([title, summary, href]) => `
                  <a href="${escapeAttr(href)}" style="display: block; min-height: 120px; border: 1px solid rgba(21, 94, 99, 0.14); border-radius: 20px; background: #fffdf8; padding: 18px; text-decoration: none;">
                    <h3 style="margin: 0 0 8px; color: #122022; font-size: 1rem;">${escapeHtml(title)}</h3>
                    <p style="margin: 0; color: #536365; line-height: 1.6; font-size: 0.92rem;">${escapeHtml(summary)}</p>
                  </a>
                `).join('')}
              </div>
            </section>
          `).join('')}
        </nav>
      ` : meta.sections ? `
        <section aria-labelledby="guide-list" style="margin: 0 0 24px;">
          <h2 id="guide-list" style="margin: 0 0 12px; font-size: 1.25rem;">Available guides</h2>
          <div style="display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
            ${meta.sections.map(([title, summary, href]) => `
              <a href="${escapeAttr(href)}" style="display: block; min-height: 120px; border: 1px solid rgba(21, 94, 99, 0.14); border-radius: 20px; background: #fffdf8; padding: 18px; text-decoration: none;">
                <h3 style="margin: 0 0 8px; color: #122022; font-size: 1rem;">${escapeHtml(title)}</h3>
                <p style="margin: 0; color: #536365; line-height: 1.6; font-size: 0.92rem;">${escapeHtml(summary)}</p>
              </a>
            `).join('')}
          </div>
        </section>
      ` : ''}
      ${amapGuide ? amapGuide.body() : meta.contentSections ? meta.contentSections.map((section, sectionIndex) => `
        <section aria-labelledby="${escapeAttr(section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}" style="margin: 0 0 24px; padding: 20px; border: 1px solid rgba(21, 94, 99, 0.12); border-radius: 20px; background: rgba(255, 253, 248, 0.72);">
          ${!['china-itinerary-first-time-7-10-14-days'].includes(page) ? `<span id="guide-section-${sectionIndex}" aria-hidden="true"></span>` : ''}
          <h2 id="${escapeAttr(section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}" style="margin: 0 0 12px; font-size: 1.25rem;">${escapeHtml(section.title)}</h2>
          ${((page === 'china-visa-free-travel-guide' && section.title === '240-hour visa-free transit: the route is essential') || (page === 'china-240-hour-visa-free-transit-2026' && section.title === 'How the 10-day clock is calculated')) ? `<p style="color: #536365; line-height: 1.7;">To work out your departure date, use the <a href="/china-240-hour-transit-calculator/" style="color: #155e63; font-weight: 700; text-underline-offset: 4px;">China 240-hour visa-free transit calculator</a>. It calculates the next-day midnight clock in China time and checks the basic passport and route pattern; confirm the final permitted stay with border inspection.</p>` : ''}
          ${page === '14-day-china-itinerary' && section.title === 'Estimated budget for two weeks' ? `<p style="color: #536365; line-height: 1.7;"><a href="/china-travel-budget/#cost-estimator" style="color: #155e63; font-weight: 700;">${escapeHtml(tripCostEstimatorContent.itineraryLinkLabel)}</a>. ${escapeHtml(tripCostEstimatorContent.itineraryLinkText)}</p>` : ''}
          ${section.countryGroups ? `
            <div aria-label="Eligible nationalities" style="display: grid; gap: 16px; margin: 0 0 16px;">
              ${section.countryGroups.map((group) => `
                <section>
                  <h3 style="margin: 0 0 8px; font-size: 1rem;">${escapeHtml(group.region)}</h3>
                  <ul style="display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; list-style: none;">
                    ${group.countries.map((country) => `<li style="border: 1px solid rgba(21, 94, 99, 0.15); border-radius: 999px; background: rgba(21, 94, 99, 0.05); color: #155e63; padding: 6px 10px; font-size: 0.82rem; font-weight: 600;">${escapeHtml(country)}</li>`).join('')}
                  </ul>
                </section>
              `).join('')}
            </div>
          ` : ''}
          ${section.table ? `
            <div style="margin: 0 0 16px; overflow-x: auto;">
              <table style="width: 100%; min-width: 560px; border-collapse: collapse; color: #536365;">
                <thead><tr>${section.table.headers.map((header) => `<th scope="col" style="border-bottom: 2px solid rgba(21, 94, 99, 0.18); padding: 10px; text-align: left; color: #122022;">${escapeHtml(header)}</th>`).join('')}</tr></thead>
                <tbody>${section.table.rows.map((row) => `<tr>${row.map((cell) => `<td style="border-bottom: 1px solid rgba(21, 94, 99, 0.12); padding: 10px; vertical-align: top;">${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
              </table>
            </div>
          ` : ''}
          ${section.items ? `
            <${section.ordered ? 'ol' : 'ul'} style="margin: 0; padding-left: 20px; color: #536365; line-height: 1.8;">
              ${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
            </${section.ordered ? 'ol' : 'ul'}>
          ` : ''}
          ${['china-travel-checklist', 'china-online-arrival-card-2026', 'wechat-verification-without-friend-qr-2026', 'wechat-pay-for-foreigners', 'beijing-airport-to-city-guide', 'china-travel-apps', '7-day-china-itinerary', '14-day-china-itinerary', '10-day-china-itinerary', 'china-travel-budget', 'china-train-travel-guide', '3-day-suzhou-itinerary', 'amap-vs-google-maps-china', 'china-metro-guide', 'alipay-for-foreigners', 'china-payment-guide', '3-day-shenzhen-itinerary', '3-day-guangzhou-itinerary', 'beijing-shanghai-layover-240-hour-guide', 'didi-in-china-for-foreigners', 'china-emergency-numbers', '3-day-beijing-itinerary', '7-day-china-itinerary', '10-day-china-itinerary', '3-day-shanghai-itinerary', '3-day-chongqing-itinerary', 'china-airport-arrival-guide', 'china-food-ordering-guide', 'what-to-eat-in-china-first-time-guide'].includes(page) && section.links ? `
            <ul style="margin: 12px 0 0; padding-left: 20px; color: #536365; line-height: 1.8;">
              ${section.links.map(({ label, description, href }) => `<li><a href="${escapeAttr(href)}"${href.startsWith('http') ? ' rel="noopener noreferrer"' : ''} style="color: #155e63; text-underline-offset: 4px;">${escapeHtml(label)}</a>: ${escapeHtml(description)}</li>`).join('')}
            </ul>
          ` : ''}
          ${(section.notes || []).map((note) => `<p style="margin: 12px 0 0; color: #536365; line-height: 1.7;">${renderAmapInline(note)}</p>`).join('')}
        </section>
      `).join('') : `
        <section aria-labelledby="practical-tips" style="margin: 0 0 24px;">
          <h2 id="practical-tips" style="margin: 0 0 12px; font-size: 1.25rem;">Practical tips</h2>
          <ul style="margin: 0; padding-left: 20px; color: #536365; line-height: 1.8;">
            <li>Prepare core China travel tools before arrival when possible.</li>
            <li>Keep backup options for payments, transport, and communication.</li>
            <li>Use bilingual phrases when you need to show clear Chinese text to local staff.</li>
          </ul>
        </section>
      `}
      ${meta.ctaBeforeFeaturedFaqs ? primaryCta : ''}
      ${featuredFaqItems.length > 0 ? `
        <section aria-labelledby="faq" style="margin: 0 0 24px;">
          <h2 id="faq" style="margin: 0 0 12px; font-size: 1.25rem;">FAQ</h2>
          ${renderFaqItems(featuredFaqItems)}
        </section>
      ` : ''}
      ${isItineraryPage(page) ? staticRelatedGuidesForForeigners(page) : ''}
      ${meta.ctaBeforeFeaturedFaqs ? '' : primaryCta}
      ${remainingFaqItems.length > 0 ? `
        <section aria-labelledby="${featuredFaqItems.length > 0 ? 'more-faq' : 'faq'}" style="margin: 0 0 24px;">
          <h2 id="${featuredFaqItems.length > 0 ? 'more-faq' : 'faq'}" style="margin: 0 0 12px; font-size: 1.25rem;">FAQ</h2>
          ${renderFaqItems(remainingFaqItems)}
        </section>
      ` : ''}
      ${!['pricing', 'terms', 'privacy', 'refund', 'contact', 'about', 'unsubscribe'].includes(page) ? renderPlanningHelp(planningHelp, 'guide') : ''}
      <nav aria-label="Related China travel guides" style="margin: 0 0 24px;">
        <h2 style="margin: 0 0 12px; font-size: 1.25rem;">Related guides</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          ${(guideRelatedLinks[page]?.map(({ label, href }) => [label, href]) || (pageRelatedLinks[page] || relatedLinks).slice(0, 8)).map(([label, href]) => `<a href="${escapeAttr(href)}" style="border: 1px solid rgba(21, 94, 99, 0.18); border-radius: 999px; color: #155e63; padding: 9px 12px; text-decoration: none;">${escapeHtml(label)}</a>`).join('')}
        </div>
      </nav>
      <section aria-labelledby="sources" style="margin: 0 0 24px;">
        <h2 id="sources" style="margin: 0 0 12px; font-size: 1.25rem;">Official or primary sources to verify</h2>
        <ul style="margin: 0; padding-left: 20px; color: #536365; line-height: 1.8;">
          ${meta.sourceLinks
            ? meta.sourceLinks.map(([label, href]) => `<li><a href="${escapeAttr(href)}" style="color: #155e63;">${escapeHtml(label)}</a></li>`).join('')
            : '<li>Official app instructions from Alipay, WeChat, Didi, Amap, and Trip.com.</li><li>Your airline, hotel, card issuer, embassy, consulate, or relevant official authority for time-sensitive requirements.</li>'}
        </ul>
      </section>
      <p style="margin: 0; color: #6b7678; font-size: 0.9rem; line-height: 1.7;">${escapeHtml(standardDisclaimer)}</p>
      ${meta.lastUpdatedFooter && meta.sourceLinks ? `<p style="margin: 16px 0 0; color: #536365; font-size: 0.9rem; line-height: 1.7;">Last updated: ${escapeHtml(meta.lastReviewed)}. Official source: <a href="${escapeAttr(meta.sourceLinks[0][1])}" style="color: #155e63;">${escapeHtml(meta.sourceLinks[0][0])}</a></p>` : ''}
    </main>
  `;
}

function schemaFor(page, meta) {
  if (!meta.faqs && page !== 'guides') return '';

  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${pageUrl(page)}#webpage`,
      url: pageUrl(page),
      name: meta.title,
      description: meta.description,
      ...(meta.lastModified ? { dateModified: meta.lastModified } : {}),
      isPartOf: {
        '@type': 'WebSite',
        name: 'ChinaEase Buddy',
        url: `${siteUrl}/`,
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl(page)}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `${siteUrl}/guides/` },
        { '@type': 'ListItem', position: 3, name: meta.heading || meta.title.split('|')[0].trim(), item: pageUrl(page) },
      ],
    },
  ];

  if (meta.application) {
    graph.push({
      '@type': 'WebApplication',
      '@id': `${pageUrl(page)}#application`,
      name: meta.heading || meta.title.split('|')[0].trim(),
      url: pageUrl(page),
      applicationCategory: 'TravelApplication',
      operatingSystem: 'Web',
      description: meta.description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    });
  }

  if (meta.article) {
    graph.push({
      '@type': 'Article',
      '@id': `${pageUrl(page)}#article`,
      headline: meta.heading || meta.title.split('|')[0].trim(),
      description: meta.description,
      dateModified: meta.lastModified,
      mainEntityOfPage: { '@id': `${pageUrl(page)}#webpage` },
      author: { '@id': `${siteUrl}/#organization` },
      publisher: { '@id': `${siteUrl}/#organization` },
    });
  }

  if (meta.faqs) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl(page)}#faq`,
      mainEntity: meta.faqs.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      })),
    });
  }

  if (meta.howTo) {
    graph.push({
      '@type': 'HowTo',
      '@id': `${pageUrl(page)}#howto`,
      name: meta.howTo.name,
      description: meta.howTo.description,
      step: meta.howTo.steps.map(([name, text], index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name,
        text,
      })),
    });
  }

  return `<script id="chinaease-guide-schema" type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph,
  })}</script>`;
}

function removeHomepageFaqSchema(html) {
  return html.replace(
    /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    (block, json) => {
      try {
        const parsed = JSON.parse(json);
        return parsed?.['@type'] === 'FAQPage' ? '' : block;
      } catch {
        return block;
      }
    },
  );
}

function withPageMeta(html, page, meta) {
  const canonical = pageUrl(page);
  let next = removeHomepageFaqSchema(html)
    .replace(/<title>.*?<\/title>/, `<title>${escapeAttr(meta.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeAttr(meta.description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeAttr(meta.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeAttr(meta.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`);

  if (noindexPages.has(page)) {
    if (/<meta name="robots"[^>]*>/i.test(next)) {
      next = next.replace(/<meta name="robots"[^>]*>/i, '<meta name="robots" content="noindex, follow" />');
    } else {
      next = next.replace('</head>', '    <meta name="robots" content="noindex, follow" />\n  </head>');
    }
  }

  const schema = schemaFor(page, meta);
  if (schema) {
    next = next.replace('</head>', `    ${schema}\n  </head>`);
  }
  next = next.replace(
    /<div id="root">[\s\S]*<\/div>\s*<\/body>/,
    `<div id="root">${staticPageContent(page, meta)}</div>\n  </body>`,
  );
  return next;
}

let html = await readFile(source, 'utf8');
html = html.replace('<section aria-labelledby="itinerary-static"', `${renderPlanningHelp(planningHelp, 'home')}<section aria-labelledby="itinerary-static"`);
await writeFile(source, html);

await Promise.all(
  pages.map(async (page) => {
    const targetDir = join(distDir, page);
    await mkdir(targetDir, { recursive: true });
    await writeFile(join(targetDir, 'index.html'), withPageMeta(html, page, pageMeta[page]));
  }),
);

const redirectsSource = await readFile('public/_redirects', 'utf8');
const permanentRedirectSources = new Set(
  redirectsSource
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split(/\s+/))
    .filter((parts) => parts.length >= 3 && parts.at(-1) === '301')
    .map(([sourcePath, targetPath]) => [sourcePath, targetPath].map((path) => path.replace(/^\//, '').replace(/\/$/, '')))
    // A trailing-slash rule (/page -> /page/) keeps the page itself in the sitemap.
    .filter(([sourcePage, targetPage]) => sourcePage !== targetPage)
    .map(([sourcePage]) => sourcePage),
);
const indexableCampaignPages = ['partners/china-visa-checker'];
const sitemapPages = [''].concat(
  pages.filter((page) => !noindexPages.has(page) && !permanentRedirectSources.has(page)),
  indexableCampaignPages,
);
const homepageLastmod = '2026-10-23';
const defaultLastmod = '2026-09-26';
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPages.map((page) => `  <url>
    <loc>${page ? pageUrl(page) : `${siteUrl}/`}</loc>
    <lastmod>${page ? pageMeta[page]?.lastModified || (indexableCampaignPages.includes(page) ? '2026-10-11' : defaultLastmod) : homepageLastmod}</lastmod>
  </url>`).join('\n')}
</urlset>
`;

await writeFile(join(distDir, 'sitemap.xml'), sitemap);
await copyFile(source, join(distDir, '404.html'));

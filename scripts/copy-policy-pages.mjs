import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const siteUrl = 'https://chinaeasebuddy.com';
const distDir = 'dist';
const source = join(distDir, 'index.html');

const pageMeta = {
  plan: {
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
    title: 'China Travel Guides | ChinaEase Buddy',
    description:
      'Practical China travel guides for foreign visitors: essential apps, Alipay, payments, checklists, emergency numbers, and frequently asked questions.',
    sections: [
      ['China eSIM & Internet Guide', 'Choose, install, activate, and troubleshoot mobile data for a trip to mainland China.', '/china-esim-internet-guide/'],
      ['China Travel Apps', 'Prepare Alipay, WeChat, Amap, Didi, and Trip.com before arrival.', '/china-travel-apps/'],
      ['Alipay for Foreigners', 'What foreign visitors should know before trying Alipay in China.', '/alipay-for-foreigners/'],
      ['China Payment Guide', 'Practical payment reminders for Alipay, WeChat Pay, cards, and cash backup.', '/china-payment-guide/'],
      ['China Travel Checklist', 'A first-time visitor checklist for apps, payments, hotels, phrases, and emergency basics.', '/china-travel-checklist/'],
      ['Emergency Numbers in China', 'Know 110, 120, and 119, plus simple phrases for urgent situations.', '/china-emergency-numbers/'],
      ['FAQ', 'Short answers about ChinaEase Buddy, paid passes, travel tools, and service limits.', '/faq/'],
    ],
  },
  pricing: {
    title: 'Pricing | ChinaEase Buddy',
    description: 'ChinaEase Buddy pricing: Free, Trip Pass, and Group Pass for digital China travel tools.',
    sections: [
      ['Free', 'Basic toolkit for apps, payments, transport, food, hotels, emergency help, and limited Buddy AI access.', '/?journey=china&tool=food'],
      ['Trip Pass', 'USD 9.90 one-time travel pass with 50 Buddy AI messages for 7 days.', '/pricing/'],
      ['Group Pass', 'USD 29.90 one-time travel pass with 200 Buddy AI messages for 14 days on one shared account.', '/pricing/'],
    ],
    faqs: [
      ['How do paid passes work?', 'Paid passes are one-time digital travel passes processed through PayPal checkout when enabled. Access begins after verified payment capture.'],
      ['How is payment processed?', 'Payments are processed securely by PayPal when paid checkout is enabled. ChinaEase Buddy never sees or stores your card details.'],
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
    title: '5 Essential Apps to Download Before Visiting China | ChinaEase Buddy',
    description:
      'Download and prepare Alipay, WeChat, Amap, Didi, and Trip.com before visiting China. Practical app tips for foreign travelers.',
    faqs: [
      ['What apps should I download before visiting China?', 'Most first-time visitors should prepare Alipay, WeChat, Amap, Didi, and Trip.com before arrival. Availability and setup requirements can change, so verify details inside each app.'],
      ['Should I set up Alipay before arriving in China?', 'It is usually helpful to try setting up Alipay before arrival, especially if you plan to use taxis, shops, restaurants, or metro systems. Keep backup payment options in case setup or card verification fails.'],
      ['Does Google Maps work well in China?', 'Google services may be limited in mainland China. Amap is often more practical for local navigation, public transport routes, and Chinese addresses.'],
    ],
  },
  'china-esim-internet-guide': {
    title: 'China eSIM & Internet Guide for Tourists (2026)',
    description:
      'Choose and set up a China travel eSIM, avoid roaming charges, understand internet restrictions, and fix mobile data problems after arrival.',
    quickAnswer:
      'For most short trips, an international travel eSIM is the simplest way to get mobile data in mainland China if your phone is unlocked and eSIM-compatible. Buy and install it on reliable Wi-Fi before your flight, follow the provider\'s activation timing, select it for cellular data after landing, and keep your home line from using roaming data. Do not assume every China eSIM gives access to Google or other restricted services: routing, phone-number support, hotspot rules, speed limits, and activation policies differ by plan.',
    lastReviewed: 'September 17, 2026',
    lastModified: '2026-09-17',
    article: true,
    contentSections: [
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
      ['Does eSIM work in mainland China?', 'Yes, if your phone is unlocked and eSIM-compatible and the plan explicitly includes mainland China. Apple also lists worldwide providers offering prepaid travel eSIM plans for visitors to mainland China.'],
      ['Will a China eSIM let me use Google, WhatsApp, or Instagram?', 'Sometimes, but not because it is an eSIM. Access depends on how that specific provider routes traffic. Confirm each required service with the provider before purchase and keep an offline backup.'],
      ['Should I install the eSIM before arriving in China?', 'Usually yes. Install it on reliable Wi-Fi before departure, but follow the provider\'s instructions about when validity starts and whether the line should remain off until arrival.'],
      ['Do I need to turn on data roaming?', 'Many travel eSIMs require data roaming because they connect through partner networks. Enable it only for the travel line and follow the provider\'s setup instructions.'],
      ['Will I get a Chinese phone number?', 'Most short-term travel eSIMs are data-only. Check the plan details if you need traditional calls, SMS, or a local number.'],
      ['What should I do if the eSIM does not connect?', 'Check the selected data line, roaming setting, network selection, APN, activation status, validity, and remaining data. Contact the provider before deleting the eSIM.'],
    ],
    sourceLinks: [
      ['Apple: use eSIM while travelling internationally', 'https://support.apple.com/en-us/118227'],
      ['Apple: carriers and worldwide eSIM service providers', 'https://support.apple.com/en-us/101569'],
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
  'china-payment-guide': {
    title: 'How to Pay in China as a Foreigner | ChinaEase Buddy',
    description:
      'Practical guide to paying in China as a foreign visitor: Alipay, WeChat Pay, foreign cards, cash backup, and payment failure phrases.',
    faqs: [
      ['What is the best way for foreigners to pay in China?', 'There is no single best method for every traveler. Many visitors prepare Alipay or WeChat Pay, keep a foreign card, and carry a small cash backup.'],
      ['Can tourists use WeChat Pay in China?', 'Some tourists may be able to use WeChat Pay with supported cards and verification. Setup and availability may vary, so prepare alternatives.'],
      ['Are foreign credit cards accepted in China?', 'Foreign cards are more commonly accepted at hotels, large malls, and some international merchants. Smaller shops and restaurants may prefer QR payments or cash.'],
    ],
  },
  'china-travel-checklist': {
    title: 'China Travel Checklist for First-Time Visitors | ChinaEase Buddy',
    description:
      'Prepare for China with this first-time visitor checklist: apps, payment setup, Chinese hotel address, emergency numbers, offline phrases, passport, and train reminders.',
    faqs: [
      ['What should first-time visitors prepare before going to China?', 'Prepare local apps, payment methods, Chinese hotel addresses, emergency numbers, offline phrases, passport details, and transport bookings.'],
      ['Should I save my hotel address in Chinese?', 'Yes. A Chinese hotel address is helpful for taxis, ride-hailing pickups, hotel returns, and asking locals for directions.'],
      ['Do I need offline phrases in China?', 'Offline phrases are useful when mobile data is weak, apps are unavailable, or you need to show a clear Chinese sentence quickly.'],
    ],
  },
  'china-emergency-numbers': {
    title: 'Emergency Numbers in China for Travelers | ChinaEase Buddy',
    description:
      'Know China emergency numbers for travelers: 110 police, 120 ambulance, 119 fire, plus hospital phrases, police help, and lost passport reminders.',
    faqs: [
      ['What are the emergency numbers in China?', 'Travelers should know 110 for police, 120 for ambulance, and 119 for fire. These are reference numbers and should be used according to the situation.'],
      ['What should I do if I need a hospital in China?', 'For urgent medical emergencies, call 120 or ask nearby staff to help. ChinaEase Buddy can show simple Chinese phrases, but it does not provide medical advice.'],
      ['What should I do if I lose my passport in China?', 'First handle immediate safety needs. Then contact local police if needed and reach your embassy or consulate for passport replacement guidance.'],
    ],
  },
  faq: {
    title: 'ChinaEase Buddy FAQ | China Travel Tools for Foreign Visitors',
    description:
      'Answers about ChinaEase Buddy, China travel apps, Alipay, WeChat Pay, Google Maps, taxis, emergency numbers, and service limitations.',
    faqs: [
      ['What is ChinaEase Buddy?', 'ChinaEase Buddy is a web-based digital China travel toolkit for foreign visitors. It helps with phrase cards, payments, food, transport, hotels, emergency references, and Buddy AI travel questions.'],
      ['Is ChinaEase Buddy free?', 'ChinaEase Buddy has a free starting plan with core tools and limited Buddy AI usage. Paid passes may unlock additional digital access, but checkout availability can vary during early access.'],
      ['How do paid passes work?', 'Paid passes are one-time digital travel passes processed through PayPal checkout when enabled. Access begins after verified payment capture.'],
      ['What emergency numbers should travelers know in China?', 'Travelers should know 110 for police, 120 for ambulance, and 119 for fire. In urgent situations, contact local emergency services directly.'],
    ],
  },
};

const pages = Object.keys(pageMeta);

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
  'china-travel-apps': ['Open the app checklist', '/?journey=before&tool=apps'],
  'china-esim-internet-guide': ['Get my free China itinerary', '/#trip-plan'],
  'alipay-for-foreigners': ['Get my free China itinerary', '/#trip-plan'],
  'china-payment-guide': ['Open payment phrases', '/?journey=china&tool=pay'],
  'china-travel-checklist': ['View the trip checklist', '/?journey=before&tool=checklist'],
  'china-emergency-numbers': ['View emergency help', '/?journey=emergency'],
  faq: ['Open the free toolkit', '/'],
};

const relatedLinks = [
  ['All guides', '/guides/'],
  ['China eSIM & internet guide', '/china-esim-internet-guide/'],
  ['China travel apps', '/china-travel-apps/'],
  ['China payment guide', '/china-payment-guide/'],
  ['China travel checklist', '/china-travel-checklist/'],
  ['China emergency numbers', '/china-emergency-numbers/'],
  ['FAQ', '/faq/'],
];

const pageRelatedLinks = {
  'china-esim-internet-guide': [
    ['First trip to China', '/first-trip-to-china/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['China travel checklist', '/china-travel-checklist/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'alipay-for-foreigners': [
    ['China eSIM & internet guide', '/china-esim-internet-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['How to pay in China as a foreigner', '/china-payment-guide/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['FAQ', '/faq/'],
  ],
  'china-payment-guide': [
    ['Open payment phrases', '/?journey=china&tool=pay'],
    ['Alipay for Foreigners', '/alipay-for-foreigners/'],
    ['China travel apps', '/china-travel-apps/'],
    ['FAQ', '/faq/'],
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

function staticPageContent(page, meta) {
  if (meta.customBody) return meta.customBody;
  const heading = meta.title.split('|')[0].trim();
  const [ctaLabel, ctaHref] = staticCtas[page] || ['Open ChinaEase Buddy', '/'];
  const faqItems = meta.faqs || [
    ['What is this page about?', meta.description],
    ['How can ChinaEase Buddy help?', 'Use the free toolkit to find practical China travel help for apps, payments, food, transport, hotels, and emergency situations.'],
  ];

  return `
    <main id="static-seo-content" style="max-width: 960px; margin: 0 auto; padding: 48px 20px; color: #122022; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <p style="margin: 0 0 10px; color: #155e63; font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;">ChinaEase Buddy</p>
      <h1 style="margin: 0 0 18px; font-size: clamp(2rem, 6vw, 3.75rem); line-height: 1.05; letter-spacing: -0.03em;">${escapeHtml(heading)}</h1>
      <section aria-labelledby="quick-answer" style="margin: 0 0 24px; padding: 22px; border: 1px solid rgba(21, 94, 99, 0.14); border-radius: 22px; background: #fffdf8;">
        <h2 id="quick-answer" style="margin: 0 0 10px; font-size: 1.25rem;">Quick answer</h2>
        <p style="margin: 0; color: #536365; line-height: 1.7;">${escapeHtml(meta.quickAnswer || meta.description)}</p>
      </section>
      <p style="margin: 0 0 20px; color: #6b7678; font-size: 0.9rem;">Last reviewed: ${escapeHtml(meta.lastReviewed || 'June 12, 2026')}</p>
      ${meta.sections ? `
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
      ${meta.contentSections ? meta.contentSections.map((section, sectionIndex) => `
        <section aria-labelledby="guide-section-${sectionIndex}" style="margin: 0 0 24px; padding: 20px; border: 1px solid rgba(21, 94, 99, 0.12); border-radius: 20px; background: rgba(255, 253, 248, 0.72);">
          <h2 id="guide-section-${sectionIndex}" style="margin: 0 0 12px; font-size: 1.25rem;">${escapeHtml(section.title)}</h2>
          <${section.ordered ? 'ol' : 'ul'} style="margin: 0; padding-left: 20px; color: #536365; line-height: 1.8;">
            ${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
          </${section.ordered ? 'ol' : 'ul'}>
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
      <p style="margin: 0 0 28px;"><a href="${escapeAttr(ctaHref)}" style="display: inline-flex; border-radius: 999px; background: #155e63; color: #fffdf8; padding: 12px 18px; font-weight: 700; text-decoration: none;">${escapeHtml(ctaLabel)}</a></p>
      <section aria-labelledby="faq" style="margin: 0 0 24px;">
        <h2 id="faq" style="margin: 0 0 12px; font-size: 1.25rem;">FAQ</h2>
        ${faqItems.map(([question, answer]) => `
          <article style="margin: 0 0 14px; padding: 18px; border: 1px solid rgba(21, 94, 99, 0.12); border-radius: 18px; background: rgba(248, 243, 234, 0.72);">
            <h3 style="margin: 0 0 8px; font-size: 1rem;">${escapeHtml(question)}</h3>
            <p style="margin: 0; color: #536365; line-height: 1.7;">${escapeHtml(answer)}</p>
          </article>
        `).join('')}
      </section>
      <nav aria-label="Related China travel guides" style="margin: 0 0 24px;">
        <h2 style="margin: 0 0 12px; font-size: 1.25rem;">Related guides</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          ${(pageRelatedLinks[page] || relatedLinks).map(([label, href]) => `<a href="${escapeAttr(href)}" style="border: 1px solid rgba(21, 94, 99, 0.18); border-radius: 999px; color: #155e63; padding: 9px 12px; text-decoration: none;">${escapeHtml(label)}</a>`).join('')}
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
      isPartOf: {
        '@type': 'WebSite',
        name: 'ChinaEase Buddy',
        url: `${siteUrl}/`,
      },
    },
  ];

  if (meta.article) {
    graph.push({
      '@type': 'Article',
      '@id': `${pageUrl(page)}#article`,
      headline: meta.title.split('|')[0].trim(),
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

const html = await readFile(source, 'utf8');

await Promise.all(
  pages.map(async (page) => {
    const targetDir = join(distDir, page);
    await mkdir(targetDir, { recursive: true });
    await writeFile(join(targetDir, 'index.html'), withPageMeta(html, page, pageMeta[page]));
  }),
);

const sitemapPages = [''].concat(pages);
const lastmod = '2026-06-20';
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPages.map((page) => `  <url>
    <loc>${page ? pageUrl(page) : `${siteUrl}/`}</loc>
    <lastmod>${page && pageMeta[page]?.lastModified ? pageMeta[page].lastModified : lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>
`;

await writeFile(join(distDir, 'sitemap.xml'), sitemap);
await copyFile(source, join(distDir, '404.html'));

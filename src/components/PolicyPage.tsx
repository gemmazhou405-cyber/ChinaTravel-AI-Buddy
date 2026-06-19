import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { initAttribution, trackEvent, trackEventOnce } from '../lib/analytics';
import { unsubscribeNewsletter } from '../lib/newsletter';

type LegalPageType = 'terms' | 'privacy' | 'refund' | 'contact' | 'about' | 'unsubscribe';
type GuidePageType =
  | 'guides'
  | 'china-travel-apps'
  | 'alipay-for-foreigners'
  | 'china-payment-guide'
  | 'china-travel-checklist'
  | 'china-emergency-numbers'
  | 'faq';
type PageType = 'pricing' | LegalPageType | GuidePageType;

interface Props {
  type: PageType;
  userId?: string | null;
}

interface GuidePageData {
  path: string;
  title: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  quickAnswer: string;
  ctaLabel: string;
  ctaHref: string;
  sections: Array<{
    title: string;
    items?: string[];
    ordered?: boolean;
    table?: {
      headers: string[];
      rows: string[][];
    };
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  related: Array<{
    label: string;
    href: string;
  }>;
}

const contactEmail = 'gemmazhou405@gmail.com';
const siteUrl = 'https://chinaeasebuddy.com';
const paypalLinks = {
  trip: 'https://www.paypal.com/ncp/payment/863ZKSY6RJ64J',
  group: 'https://www.paypal.com/ncp/payment/CL8J5WJVK3TAJ',
} as const;
const standardDisclaimer =
  'ChinaEase Buddy is a digital travel toolkit. It is not an official travel authority, visa service, immigration service, medical service, legal service, financial service, hotel booking service, or flight booking service. Always confirm important travel, payment, health, and entry information with official sources or service providers.';

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    note: 'Basic China travel toolkit for common travel situations',
    features: [
      'Essential apps, payments, transport, food, hotel and emergency tools',
      'Basic phrase cards and travel guides',
      '5 Buddy AI messages',
      'No payment required',
    ],
    cta: 'Start Free',
    href: '/',
    plan: 'free',
  },
  {
    name: 'Trip Pass',
    price: '$9.90',
    note: 'One-time payment',
    features: [
      '50 Buddy AI messages',
      'Valid for 7 days',
      'Extra travel help for one traveler',
      'One-time payment',
      'Access after verified PayPal payment confirmation',
    ],
    cta: 'Get Trip Pass',
    href: paypalLinks.trip,
    plan: 'trip_pass',
    featured: true,
  },
  {
    name: 'Group Pass',
    price: '$29.90',
    note: 'One-time payment',
    features: [
      '200 Buddy AI messages',
      'Valid for 14 days',
      'One account and one shared allowance for couples, families or small travel groups',
      'One-time payment',
      'Access after verified PayPal payment confirmation',
    ],
    cta: 'Get Group Pass',
    href: paypalLinks.group,
    plan: 'group_pass',
  },
];

const legalCopy = {
  terms: {
    title: 'Terms of Service',
    intro:
      'ChinaEase Buddy is a digital travel toolkit designed to help visitors understand practical travel situations in China.',
    sections: [
      {
        title: 'Service Scope',
        body:
          'ChinaEase Buddy provides travel information, bilingual phrase cards, menu references, payment setup guidance, and AI-assisted travel support for convenience only.',
      },
      {
        title: 'No Professional Services',
        body:
          'ChinaEase Buddy does not provide visa, immigration, medical, legal, financial, hotel booking, flight booking, or travel agency services. Users should make their own decisions and verify important information independently.',
      },
      {
        title: 'Emergencies',
        body:
          'In emergency situations, users should contact local emergency numbers, hospitals, police, embassies, consulates, or other qualified local professionals immediately.',
      },
      {
        title: 'Refunds',
        body:
          'ChinaEase Buddy passes are one-time purchases and are generally non-refundable once access is activated. This does not affect any statutory consumer rights you may have under your local laws.',
      },
      {
        title: 'Contact',
        body: `For support or legal questions, contact ${contactEmail}.`,
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro:
      'ChinaEase Buddy collects only the information needed to provide account access, travel tools, and usage-limited digital services.',
    sections: [
      {
        title: 'Information We Collect',
        body:
          'We may collect your email address, account plan, entitlement status, usage quotas, basic app usage data, anonymous session ID, UTM attribution, newsletter email, and information required to operate Buddy AI conversations and food reference tools.',
      },
      {
        title: 'Authentication and Storage',
        body:
          'ChinaEase Buddy uses Firebase Authentication for sign-in and Firebase Firestore to store account plan, quota, and related account data.',
      },
      {
        title: 'Buddy AI Conversations',
        body:
          'Buddy AI conversation content may be processed by ChinaEase Buddy service providers, including Coze, Cloudflare, Firebase, and Firestore, to provide the requested travel assistance, maintain service quality, and troubleshoot the service. Menu photo help is in private testing and is not sold as an active entitlement.',
      },
      {
        title: 'Payments and Entitlements',
        body:
          'For paid passes, we may store PayPal order identifiers, capture identifiers, payer email if returned by PayPal, plan, expiry, quota, and payment status. We do not collect card details directly on this website.',
      },
      {
        title: 'Newsletter',
        body:
          'If you subscribe to travel updates, we store your email address, consent version, source path, UTM attribution, subscription status, and unsubscribe information. You can unsubscribe at any time.',
      },
      {
        title: 'Retention and Deletion',
        body:
          'We keep account, entitlement, payment, support, analytics, and newsletter records as needed to operate the service, investigate issues, meet legal obligations, and handle support requests. Contact us to request account deletion or privacy assistance.',
      },
      {
        title: 'No Sale of Data',
        body:
          'We do not sell user data to third parties. We use data only to operate, secure, and improve ChinaEase Buddy.',
      },
      {
        title: 'Contact',
        body: `For privacy requests, account deletion, or questions, contact ${contactEmail}.`,
      },
    ],
  },
  refund: {
    title: 'Refund Policy',
    intro: 'ChinaEase Buddy sells one-time digital travel passes for visitors traveling in China.',
    sections: [
      {
        title: 'Refund Approach',
        body:
          'All passes are one-time purchases and are generally non-refundable once access is activated. This does not affect any statutory consumer rights you may have under your local laws.',
      },
      {
        title: 'When to Contact Support',
        body:
          'Please contact support if the service was not provided, was materially different from its description, or you experienced a payment problem.',
      },
      {
        title: 'Payment Method',
        body:
          'If a refund is required under applicable law or after support review, processing times and method may depend on the payment provider.',
      },
      {
        title: 'No Auto-Renewal',
        body:
          'ChinaEase Buddy passes are one-time payments only. There is no auto-renewal and no subscription cancellation is needed.',
      },
      {
        title: 'Contact',
        body: `For payment problems or questions about your pass, contact ${contactEmail}.`,
      },
    ],
  },
  contact: {
    title: 'Contact',
    intro: 'Contact ChinaEase Buddy for account, refund, privacy, or product support.',
    sections: [
      {
        title: 'Email Support',
        body: `For all support requests, contact ${contactEmail}.`,
      },
      {
        title: 'What to Include',
        body:
          'Please include your account email, the issue you are experiencing, and any relevant purchase or account details. Do not send passwords, passport numbers, or sensitive medical information.',
      },
      {
        title: 'Important Note',
        body:
          'ChinaEase Buddy is a web-based digital China travel toolkit. It is not a visa, immigration, medical, financial, legal, hotel booking, flight booking, or travel agency service.',
      },
    ],
  },
  about: {
    title: 'About ChinaEase Buddy',
    intro:
      'ChinaEase Buddy is a web-based digital China travel toolkit built for foreign visitors in China.',
    sections: [
      {
        title: 'Use ChinaEase Buddy When You Need To',
        body:
          'Show useful Chinese phrases to locals; understand food, payment, transport, and hotel situations; get emergency help fast; and ask Buddy when you are stuck.',
      },
      {
        title: 'What It Does',
        body:
          'ChinaEase Buddy helps travelers access bilingual phrase cards, city survival guides, payment setup information, local transport tips, menu references, emergency guidance, and Buddy AI travel assistance.',
      },
      {
        title: 'What It Is Not',
        body:
          'ChinaEase Buddy is not a visa, immigration, medical, financial, legal, hotel booking, flight booking, or travel agency service. It does not replace local professionals or official authorities.',
      },
      {
        title: 'Traveler Responsibility',
        body:
          'Travelers should verify important information independently and contact local professional institutions, emergency services, embassies, consulates, hospitals, police, or payment providers when needed.',
      },
      {
        title: 'Contact',
        body: `Questions about ChinaEase Buddy can be sent to ${contactEmail}.`,
      },
    ],
  },
  unsubscribe: {
    title: 'Unsubscribe',
    intro: 'Stop receiving occasional China travel updates from ChinaEase Buddy.',
    sections: [
      {
        title: 'Newsletter',
        body:
          'Enter the email address you used for newsletter updates. This does not delete your ChinaEase Buddy account.',
      },
    ],
  },
};

const guidePages: Record<GuidePageType, GuidePageData> = {
  guides: {
    path: '/guides',
    title: 'China Travel Guides',
    intro: 'Practical guide pages for foreign visitors preparing for or traveling in China.',
    metaTitle: 'China Travel Guides | ChinaEase Buddy',
    metaDescription:
      'Practical China travel guides for foreign visitors: essential apps, Alipay, payments, checklists, emergency numbers, and frequently asked questions.',
    quickAnswer:
      'Start with the guide that matches your immediate travel question: apps before arrival, Alipay setup, payments in China, first-time checklist, emergency numbers, or common FAQ.',
    ctaLabel: 'Open the free toolkit',
    ctaHref: '/',
    sections: [
      {
        title: 'Current guide pages',
        items: [
          'China Travel Apps: prepare Alipay, WeChat, Amap, Didi, and Trip.com.',
          'Alipay for Foreigners: understand setup reminders and backup options.',
          'China Payment Guide: practical notes for Alipay, WeChat Pay, cards, and cash.',
          'China Travel Checklist: first-time visitor preparation before arrival.',
          'China Emergency Numbers: 110, 120, 119, and simple emergency phrases.',
          'FAQ: concise answers about ChinaEase Buddy and service limitations.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What guide should I read first?',
        answer:
          'If you are preparing before arrival, start with China Travel Apps and China Travel Checklist. If you are already in China, open the payment guide or emergency numbers page based on your situation.',
      },
      {
        question: 'Are these official travel instructions?',
        answer:
          'No. These guides are practical travel references from ChinaEase Buddy. Confirm important entry, health, payment, and travel requirements with official sources or service providers.',
      },
    ],
    related: [
      { label: 'China travel apps', href: '/china-travel-apps' },
      { label: 'Alipay for foreigners', href: '/alipay-for-foreigners' },
      { label: 'China payment guide', href: '/china-payment-guide' },
      { label: 'China travel checklist', href: '/china-travel-checklist' },
      { label: 'Emergency numbers in China', href: '/china-emergency-numbers' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  'china-travel-apps': {
    path: '/china-travel-apps',
    title: 'Essential Apps for Foreign Tourists in China (2026)',
    intro:
      'A category-by-category guide to the apps that actually work in China — payments, maps, rides, trains, translation, and what to do about blocked services.',
    metaTitle: 'Essential Apps for Foreign Tourists in China 2026 | ChinaEase Buddy',
    metaDescription:
      'Which apps do foreign tourists need in China in 2026? Alipay, WeChat Pay, Amap, DiDi, Trip.com, translation tools — plus what to know about VPNs and Google Maps.',
    quickAnswer:
      'Install before you land: Alipay (payments — link your card at home), Amap or Apple Maps (navigation — Google Maps is unreliable in China), DiDi (ride-hailing), and Trip.com (trains and hotels). Some overseas apps are not directly accessible in China; travelers commonly prepare a VPN or international eSIM before arriving. Do all setup at home while you have your regular SIM and unblocked internet.',
    ctaLabel: 'Open the app checklist',
    ctaHref: '/?journey=before&tool=apps',
    sections: [
      {
        title: 'Which apps should I install before landing?',
        items: [
          'Alipay — link your Visa or Mastercard before you fly. Needed for QR payments at shops, restaurants, metro, and taxis.',
          'WeChat — messaging and payments. Many locals will want to add you on WeChat; it also works as a backup payment method.',
          'Amap (高德地图 / Gaode) — the most reliable map for China. Download the offline map pack for your destination before arriving.',
          'DiDi — ride-hailing app for taxis and private cars across China, with an English in-app option.',
          'Trip.com — English-language booking for trains, flights, and hotels in China.',
          'Your VPN app of choice — install before arrival; VPN provider sites may also not be accessible in China.',
        ],
      },
      {
        title: 'Payments: Alipay and WeChat Pay',
        items: [
          'Alipay accepts foreign Visa, Mastercard, JCB, Discover, and Diners Club cards. Link yours before flying — you need your home SIM to receive the bank SMS verification.',
          'WeChat Pay also supports foreign cards and uses the same QR-code scan system. Set up Alipay first as your primary; add WeChat Pay as a backup.',
          'Cash is rarely used in Chinese cities. Small restaurants, market stalls, and local shops expect Alipay or WeChat QR codes — not foreign cards directly.',
          'Full setup walkthrough: see the China Payment Guide.',
        ],
      },
      {
        title: 'Maps and navigation: what actually works?',
        items: [
          'Google Maps — do not rely on it in China. Map data is intentionally offset due to government coordinate-system requirements, and Google services are blocked without a VPN. Street and satellite data can appear shifted by hundreds of metres.',
          'Amap (高德地图 / Gaode) — the standard navigation app used across China. Accurate roads, real-time traffic, and public transit directions. The interface is primarily in Chinese; foreign visitors often find Apple Maps easier for English navigation.',
          'Apple Maps — uses AutoNavi (Amap) data for mainland China. Walking and driving directions are reliable; transit routing is available but less consistent — double-check metro and bus routes locally.',
          'Save your hotel address in Chinese characters before leaving home and paste it directly into Amap or DiDi when you arrive.',
        ],
      },
      {
        title: 'Ride-hailing: DiDi',
        items: [
          'DiDi is the dominant ride-hailing app in China, covering most cities large and small.',
          'DiDi has an English-language option available in the app settings.',
          'Payment in DiDi is made via Alipay or WeChat Pay linked inside the app.',
          'Always check the car plate and driver photo in the app before getting in — drivers in China rarely speak English.',
          'Save your destination in Chinese characters and show it to the driver if needed; paste from your notes app.',
        ],
      },
      {
        title: 'Trains and travel booking: Trip.com and 12306',
        items: [
          'Trip.com (formerly Ctrip) is the easiest option for foreign tourists: full English interface, accepts foreign Visa and Mastercard, and covers trains, flights, and hotels across China.',
          '12306 is the official China Railway ticketing app and website. It is primarily in Chinese and requires registration with a foreign passport — many tourists use Trip.com instead as it draws from the same inventory and is simpler to navigate.',
          'Book popular routes (Beijing–Shanghai, Beijing–Xi\'an, Chengdu–Lhasa) several days in advance; during national holidays (Golden Week, Spring Festival), book weeks ahead.',
          'You must show your passport at the station gate or ticket window — the name must match the booking exactly.',
        ],
      },
      {
        title: 'Translation and menus',
        items: [
          'Google Translate — camera translation is very useful for menus and signs, but requires a VPN to work in China.',
          'Translation app availability in China can be inconsistent; a tool that works offline or is built for China travel is more dependable.',
          'ChinaEase Buddy — photograph a Chinese menu and get a translation with allergen alerts highlighted. No VPN needed. Also covers payment phrases, transport, emergency numbers, and the Buddy AI for travel questions.',
          'Offline tip: download the Chinese language pack inside any translation app before leaving home — camera translation then works without any internet connection.',
        ],
      },
      {
        title: 'VPN and eSIM: accessing blocked apps',
        items: [
          'Some overseas apps and websites aren\'t directly accessible in China — Google services, WhatsApp, Instagram, Facebook, and X are among those commonly affected.',
          'Travelers commonly prepare a VPN or an international eSIM before arriving.',
          'Some travelers use an international eSIM or roaming plan to access apps that may be restricted, but reliability varies — don\'t rely on it as your only option.',
        ],
      },
      {
        title: 'App comparison at a glance',
        table: {
          headers: ['App', 'Category', 'English interface', 'Key use'],
          rows: [
            ['Alipay', 'Payments', 'Yes', 'QR payments everywhere'],
            ['WeChat / WeChat Pay', 'Payments + messaging', 'Partial (Pay flows)', 'Payments, local contacts'],
            ['Amap (Gaode)', 'Maps', 'Primarily Chinese', 'Navigation, transit, offline maps'],
            ['Apple Maps', 'Maps', 'Yes', 'Navigation using Amap data'],
            ['DiDi', 'Ride-hailing', 'Yes (in-app setting)', 'Taxis and private cars'],
            ['Trip.com', 'Booking', 'Yes', 'Trains, flights, hotels'],
            ['12306', 'Rail tickets', 'Primarily Chinese', 'Official train booking'],
            ['ChinaEase Buddy', 'Translation + tools', 'Yes', 'Menu translation, allergen alerts, phrases'],
          ],
        },
      },
    ],
    faqs: [
      {
        question: 'Does Google Maps work in China?',
        answer:
          'Not reliably. Map data in China is intentionally offset due to government coordinate-system requirements, and Google services are blocked without a VPN. Use Amap (Gaode) or Apple Maps instead.',
      },
      {
        question: 'Do I need a VPN in China?',
        answer:
          'If you want to use Google, WhatsApp, Instagram, or other services that may not be directly accessible in China, yes. If you only need maps and payments, local apps work without one.',
      },
      {
        question: 'Can I book China train tickets without a Chinese account?',
        answer:
          'Yes — Trip.com lets you book in English with a foreign card and passport. The official 12306 app works but is primarily in Chinese and requires a foreign-passport registration that some travelers find unreliable.',
      },
      {
        question: 'Which translation app works in China without a VPN?',
        answer:
          'Google Translate requires a VPN in China. Translation app availability can be inconsistent; a tool that works offline or is built for China travel is more dependable. ChinaEase Buddy works without a VPN and is specifically built for menu translation and travel phrase situations.',
      },
      {
        question: 'Should I set these apps up before or after arriving?',
        answer:
          'Before. Alipay card linking needs your home SIM for bank SMS verification. Some apps and their download sites may not be accessible once you arrive. Downloading offline map packs is also much faster on home Wi-Fi.',
      },
    ],
    related: [
      { label: 'China payment guide', href: '/china-payment-guide' },
      { label: 'China travel checklist', href: '/china-travel-checklist' },
      { label: 'Emergency numbers in China', href: '/china-emergency-numbers' },
    ],
  },
  'alipay-for-foreigners': {
    path: '/alipay-for-foreigners',
    title: 'Can Foreigners Use Alipay in China?',
    intro: 'A conservative, practical overview of using Alipay as a foreign traveler in China.',
    metaTitle: 'Can Foreigners Use Alipay in China? | ChinaEase Buddy',
    metaDescription:
      'Learn what foreign visitors should know about using Alipay in China, including setup reminders, foreign cards, backup payments, and common issues.',
    quickAnswer:
      'Many foreign visitors can try using Alipay in China with supported international cards, but setup, verification, card acceptance, and merchant support may vary. Prepare Alipay before arrival and keep backup options.',
    ctaLabel: 'Open payment setup help',
    ctaHref: '/?journey=before&tool=payment',
    sections: [
      {
        title: 'What Alipay is used for',
        items: [
          'Paying at restaurants, shops, convenience stores, taxis, and some tourist sites.',
          'Scanning QR codes for merchant payments.',
          'Accessing services such as transport or mini apps, depending on availability.',
        ],
      },
      {
        title: 'Before arrival',
        items: [
          'Download Alipay and check whether your card can be linked.',
          'Use accurate passport and card information.',
          'Keep your card issuer informed if international payments may be flagged.',
          'Save backup payment phrases in Chinese.',
        ],
      },
      {
        title: 'Foreign card reminders',
        items: [
          'Supported card types and verification can vary by user, card issuer, and current platform rules.',
          'Some merchants may prefer local QR payment flows.',
          'Do not rely on one payment method for every situation.',
        ],
      },
      {
        title: 'Backup payment options',
        items: [
          'Try WeChat Pay if available for your account.',
          'Carry a small amount of RMB cash for backup.',
          'Use hotel desks, malls, or bank ATMs when you need safer in-person help.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can foreigners use Alipay in China?',
        answer:
          'Many foreign visitors can try using Alipay with supported international cards, but successful setup and payment acceptance can vary. Prepare a backup payment option.',
      },
      {
        question: 'Do I need a Chinese bank account to use Alipay?',
        answer:
          'Some foreign travelers may be able to link supported international cards. Rules and supported cards can change, so check Alipay’s current instructions.',
      },
      {
        question: 'What if my Alipay payment fails?',
        answer:
          'Ask whether you can use WeChat Pay, cash, or a card. ChinaEase Buddy includes short Chinese payment phrases you can show to staff.',
      },
      {
        question: 'Is Alipay financial advice?',
        answer:
          'No. This page is practical travel information only. Always confirm payment, fees, limits, and card support with Alipay, your bank, or the merchant.',
      },
    ],
    related: [
      { label: 'How to pay in China as a foreigner', href: '/china-payment-guide' },
      { label: 'Apps to download before China', href: '/china-travel-apps' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  'china-payment-guide': {
    path: '/china-payment-guide',
    title: 'How to Pay in China as a Foreigner',
    intro:
      'A quick-answer guide to paying in China with a foreign card, Alipay, and WeChat Pay — no Chinese bank account required.',
    metaTitle: 'How to Pay in China as a Foreigner | ChinaEase Buddy',
    metaDescription:
      'Learn how foreigners can pay in China using Alipay or WeChat Pay with an international Visa, Mastercard, or JCB card — no Chinese bank account needed.',
    quickAnswer:
      "Yes — foreigners can pay almost everywhere in China without a Chinese bank account. Since 2023 you can link an international Visa, Mastercard, JCB, Discover, or Diners Club card directly to Alipay or WeChat Pay and pay by scanning QR codes. Set it up before you fly, keep a little cash as backup, and tell your bank you'll be using your card in China so the verification charge isn't blocked.",
    ctaLabel: 'Open payment phrases',
    ctaHref: '/?journey=china&tool=pay',
    sections: [
      {
        title: 'Do I need a Chinese bank account or phone number?',
        items: [
          'No to both.',
          'Since 2023, the Chinese bank account requirement was removed for foreign visitors.',
          'You can register Alipay with your home-country mobile number — the SMS verification code goes to that number.',
          'A Chinese SIM is optional, not required.',
        ],
      },
      {
        title: 'Which cards work?',
        items: [
          'Visa, Mastercard, JCB, Discover, Diners Club, and Maestro are supported.',
          'American Express works inconsistently (lower limits, patchy acceptance) — bring a Visa or Mastercard as your main card.',
          'Cards with no foreign-transaction fee (such as Wise, Revolut, or travel credit cards) save you money over a longer trip.',
        ],
      },
      {
        title: 'How to set up Alipay before your trip',
        ordered: true,
        items: [
          'Download the standard Alipay app from the App Store or Google Play — not "Alipay HK" or other regional versions.',
          'Register with your home mobile number and enter the SMS code.',
          'Go to identity verification and upload your passport photo page (make sure the machine-readable strip at the bottom is clear). Verification is mostly automated and usually finishes in minutes.',
          "Add your card under Account → Bank Cards. You may be redirected to your bank's 3D-Secure (OTP) page.",
          'Alipay sends a small verification charge (usually under $1) — confirm it in the app to activate.',
        ],
      },
      {
        title: 'Alipay vs WeChat Pay — which should I use?',
        table: {
          headers: ['', 'Alipay', 'WeChat Pay'],
          rows: [
            ['Foreign card support', 'Strong, well-documented', 'Works, but setup varies more'],
            ['English interface', 'Full English', 'Partial'],
            ['Best for tourists', 'Recommended primary', 'Good as backup'],
            ['Also used for', 'Taxis, metro, shops, tickets', 'Same, plus messaging'],
          ],
        },
        items: [
          'Recommendation: set up Alipay first as your main payment method, and add WeChat Pay as a backup if you have time.',
        ],
      },
      {
        title: 'Fees and limits',
        items: [
          'Payments of ¥200 or less are usually fee-free; above that, expect roughly a 3% fee.',
          'Your own bank may also add a foreign-transaction fee.',
          'Alipay applies per-transaction and annual spending limits for foreign cards — check the current limit shown inside the Alipay app when you link your card.',
        ],
      },
      {
        title: 'What if my payment fails?',
        items: [
          "Call your bank before the trip and tell them you'll use the card in China; ask them to whitelist Alipay/China charges.",
          'Turn your VPN off while linking the card.',
          'Try a Mastercard if Visa fails, or vice versa.',
          'Last resort: cash top-up counters in the international arrival halls at major airports (Beijing, Shanghai, Guangzhou, Shenzhen, Chengdu, Hangzhou, and others) — show your passport, hand over RMB cash, and staff credit your Alipay balance.',
        ],
      },
      {
        title: 'Can I get a refund to my foreign card?',
        items: [
          'Yes. Refunds go back to the original card, typically within 3–10 business days.',
          "They're issued in RMB, so the final amount may differ slightly due to exchange-rate movement.",
        ],
      },
    ],
    faqs: [
      {
        question: 'Is China really cashless?',
        answer:
          'Mostly — in big cities the vast majority of payments are by QR code. Carry a small amount of cash for rural areas and edge cases.',
      },
      {
        question: 'Can I use Apple Pay or my foreign card directly?',
        answer:
          'At big hotels and malls sometimes; small shops and restaurants usually only take Alipay or WeChat QR codes.',
      },
      {
        question: 'Should I set up Alipay before or after arriving?',
        answer: "Before — you need your home SIM to receive your bank's verification SMS.",
      },
    ],
    related: [
      { label: 'Can foreigners use Alipay?', href: '/alipay-for-foreigners' },
      { label: 'China travel apps', href: '/china-travel-apps' },
      { label: 'China travel checklist', href: '/china-travel-checklist' },
    ],
  },
  'china-travel-checklist': {
    path: '/china-travel-checklist',
    title: 'China Travel Checklist for First-Time Visitors',
    intro: 'A practical pre-trip checklist for apps, payments, phrases, hotel addresses, and emergency basics.',
    metaTitle: 'China Travel Checklist for First-Time Visitors | ChinaEase Buddy',
    metaDescription:
      'Prepare for China with this first-time visitor checklist: apps, payment setup, Chinese hotel address, emergency numbers, offline phrases, passport, and train reminders.',
    quickAnswer:
      'Before traveling to China, prepare key apps, payment options, your hotel address in Chinese, emergency numbers, offline phrases, passport details, and train booking information.',
    ctaLabel: 'Open the free checklist',
    ctaHref: '/?journey=before&tool=checklist',
    sections: [
      {
        title: 'Before you fly',
        items: [
          'Download Alipay, WeChat, Amap, Didi, and Trip.com.',
          'Try payment setup before arrival and keep a backup option.',
          'Save your hotel address in Chinese.',
          'Save 110, 120, and 119 emergency numbers.',
          'Prepare offline translation phrases for taxis, hotels, food, and payment.',
        ],
      },
      {
        title: 'Documents and transport',
        items: [
          'Keep your passport accessible for hotel check-in and train travel.',
          'Use your passport name consistently when booking trains or hotels.',
          'Screenshot booking confirmations and addresses.',
          'Check airport transfer options before landing.',
        ],
      },
      {
        title: 'Food and health reminders',
        items: [
          'Prepare allergy phrases in Chinese if needed.',
          'Know how to ask about peanuts, shellfish, gluten, meat, or spicy food.',
          'Bring routine medication according to applicable rules and official guidance.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What should first-time visitors prepare before going to China?',
        answer:
          'Prepare local apps, payment methods, Chinese hotel addresses, emergency numbers, offline phrases, passport details, and transport bookings.',
      },
      {
        question: 'Should I save my hotel address in Chinese?',
        answer:
          'Yes. A Chinese hotel address is helpful for taxis, ride-hailing pickups, hotel returns, and asking locals for directions.',
      },
      {
        question: 'Do I need offline phrases in China?',
        answer:
          'Offline phrases are useful when mobile data is weak, apps are unavailable, or you need to show a clear Chinese sentence quickly.',
      },
      {
        question: 'Is this checklist visa advice?',
        answer:
          'No. This checklist is general travel preparation only. Confirm entry, visa, and document requirements with official sources.',
      },
    ],
    related: [
      { label: 'Apps to download before China', href: '/china-travel-apps' },
      { label: 'China payment guide', href: '/china-payment-guide' },
      { label: 'Emergency numbers in China', href: '/china-emergency-numbers' },
    ],
  },
  'china-emergency-numbers': {
    path: '/china-emergency-numbers',
    title: 'Emergency Numbers in China for Travelers',
    intro: 'Key emergency numbers and practical words to show locals when something goes wrong in China.',
    metaTitle: 'Emergency Numbers in China for Travelers | ChinaEase Buddy',
    metaDescription:
      'Know China emergency numbers for travelers: 110 police, 120 ambulance, 119 fire, plus hospital phrases, police help, and lost passport reminders.',
    quickAnswer:
      'The key emergency numbers in China are 110 for police, 120 for ambulance, and 119 for fire. In urgent situations, contact local emergency services and ask nearby staff, hotel reception, or authorities for help.',
    ctaLabel: 'View emergency help',
    ctaHref: '/?journey=emergency',
    sections: [
      {
        title: 'Numbers to know',
        items: ['110 Police', '120 Ambulance', '119 Fire'],
      },
      {
        title: 'What to show locals',
        items: [
          'Please help me call the police. / 请帮我报警。',
          'Please help me call an ambulance. / 请帮我叫救护车。',
          'I lost my passport. / 我的护照丢了。',
          'I lost my phone. / 我的手机丢了。',
        ],
      },
      {
        title: 'Hospital and police reminders',
        items: [
          'Use 120 for ambulance emergencies and ask hotel staff for nearby hospital help.',
          'For theft, loss, or immediate safety issues, contact police or local authorities.',
          'For lost passport issues, contact your embassy or consulate after urgent safety needs are handled.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What are the emergency numbers in China?',
        answer:
          'Travelers should know 110 for police, 120 for ambulance, and 119 for fire. These are reference numbers and should be used according to the situation.',
      },
      {
        question: 'What should I do if I need a hospital in China?',
        answer:
          'For urgent medical emergencies, call 120 or ask nearby staff to help. ChinaEase Buddy can show simple Chinese phrases, but it does not provide medical advice.',
      },
      {
        question: 'What should I do if I lose my passport in China?',
        answer:
          'First handle immediate safety needs. Then contact local police if needed and reach your embassy or consulate for passport replacement guidance.',
      },
      {
        question: 'Can ChinaEase Buddy contact emergency services for me?',
        answer:
          'No. ChinaEase Buddy provides reference numbers and phrases. Travelers must contact emergency services, local authorities, or qualified professionals directly.',
      },
    ],
    related: [
      { label: 'China travel checklist', href: '/china-travel-checklist' },
      { label: 'China travel apps', href: '/china-travel-apps' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  faq: {
    path: '/faq',
    title: 'ChinaEase Buddy FAQ',
    intro: 'Short answers for travelers using ChinaEase Buddy and preparing for practical travel situations in China.',
    metaTitle: 'ChinaEase Buddy FAQ | China Travel Tools for Foreign Visitors',
    metaDescription:
      'Answers about ChinaEase Buddy, China travel apps, Alipay, WeChat Pay, Google Maps, taxis, emergency numbers, and service limitations.',
    quickAnswer:
      'ChinaEase Buddy is a web-based digital travel toolkit for foreign visitors in China. It helps with phrase cards, payment situations, food, transport, hotels, emergency references, and Buddy AI travel questions.',
    ctaLabel: 'Open the free toolkit',
    ctaHref: '/',
    sections: [
      {
        title: 'Useful starting points',
        items: [
          'Use the app checklist before your trip.',
          'Open payment phrases when Alipay, WeChat Pay, cards, or cash become confusing.',
          'Use emergency help for reference numbers and simple Chinese phrases.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is ChinaEase Buddy?',
        answer:
          'ChinaEase Buddy is a web-based digital China travel toolkit for foreign visitors. It helps with phrase cards, payments, food, transport, hotels, emergency references, and Buddy AI travel questions.',
      },
      {
        question: 'Is ChinaEase Buddy free?',
        answer:
          'ChinaEase Buddy has a free starting plan with core tools and limited Buddy AI usage. Paid passes may unlock additional digital access, but checkout availability can vary during early access.',
      },
      {
        question: 'How do paid passes work?',
        answer:
          'Paid passes are currently processed through PayPal payment links. Access is activated manually after payment confirmation.',
      },
      {
        question: 'Is ChinaEase Buddy an official travel service?',
        answer:
          'No. ChinaEase Buddy is not an official travel authority or government service. It is a digital travel toolkit for convenience.',
      },
      {
        question: 'Does ChinaEase Buddy provide visa, immigration, medical, legal, or financial services?',
        answer:
          'No. ChinaEase Buddy does not provide visa, immigration, medical, legal, financial, hotel booking, flight booking, or official travel services.',
      },
      {
        question: 'What apps should I download before visiting China?',
        answer:
          'Commonly useful apps include Alipay, WeChat, Amap, Didi, and Trip.com. Setup and availability can vary, so check each app before traveling.',
      },
      {
        question: 'Can foreigners use Alipay in China?',
        answer:
          'Many foreign visitors can try using Alipay with supported cards, but setup and acceptance may vary. Keep backup payment options.',
      },
      {
        question: 'Can tourists use WeChat Pay in China?',
        answer:
          'Some tourists may be able to use WeChat Pay with supported cards and verification. Rules and availability can change.',
      },
      {
        question: 'Does Google Maps work in China?',
        answer:
          'Google services may be limited in mainland China. Amap is often more useful for local navigation and Chinese addresses.',
      },
      {
        question: 'How do I take a taxi in China without speaking Chinese?',
        answer:
          'Use Didi when possible, save your destination in Chinese, and show short driver phrase cards such as “Please take me to this address.”',
      },
      {
        question: 'What emergency numbers should travelers know in China?',
        answer:
          'Travelers should know 110 for police, 120 for ambulance, and 119 for fire. In urgent situations, contact local emergency services directly.',
      },
    ],
    related: [
      { label: 'China travel apps', href: '/china-travel-apps' },
      { label: 'Alipay for foreigners', href: '/alipay-for-foreigners' },
      { label: 'Emergency numbers in China', href: '/china-emergency-numbers' },
    ],
  },
};

function setMetaContent(selector: string, attr: 'content', value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    if (selector.includes('property=')) {
      const property = selector.match(/property="([^"]+)"/)?.[1];
      if (property) element.setAttribute('property', property);
    } else {
      const name = selector.match(/name="([^"]+)"/)?.[1];
      if (name) element.setAttribute('name', name);
    }
    document.head.appendChild(element);
  }
  element.setAttribute(attr, value);
}

function useGuideSeo(page: GuidePageData) {
  useEffect(() => {
    document.title = page.metaTitle;
    setMetaContent('meta[name="description"]', 'content', page.metaDescription);
    setMetaContent('meta[property="og:title"]', 'content', page.metaTitle);
    setMetaContent('meta[property="og:description"]', 'content', page.metaDescription);
    setMetaContent('meta[property="og:url"]', 'content', `${siteUrl}${page.path}`);
    setMetaContent('meta[name="twitter:title"]', 'content', page.metaTitle);
    setMetaContent('meta[name="twitter:description"]', 'content', page.metaDescription);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${siteUrl}${page.path}`;

    document.getElementById('chinaease-guide-schema')?.remove();
    const schema = document.createElement('script');
    schema.id = 'chinaease-guide-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `${siteUrl}${page.path}#webpage`,
          url: `${siteUrl}${page.path}`,
          name: page.metaTitle,
          description: page.metaDescription,
          isPartOf: {
            '@type': 'WebSite',
            name: 'ChinaEase Buddy',
            url: siteUrl,
          },
        },
        {
          '@type': 'FAQPage',
          '@id': `${siteUrl}${page.path}#faq`,
          mainEntity: page.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        },
      ],
    });
    document.head.appendChild(schema);

    return () => {
      document.getElementById('chinaease-guide-schema')?.remove();
    };
  }, [page]);
}

function PageShell({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  const assetBase = import.meta.env.BASE_URL;

  return (
    <main className="min-h-screen bg-[#f7f3ea] px-4 py-8 text-gray-900 md:px-6">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#155e63] hover:text-[#0e4a4e]">
          <ArrowLeft className="h-4 w-4" />
          Back to ChinaEase Buddy
        </a>

        <div className="rounded-3xl border border-[#155e63]/10 bg-white/85 p-5 shadow-sm backdrop-blur md:p-8">
          <div className="mb-6 flex items-start gap-3">
            <img src={`${assetBase}logo.png`} width="42" height="42" alt="ChinaEase Buddy" className="rounded-xl" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#155e63]">ChinaEase Buddy</p>
              <h1 className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">{title}</h1>
            </div>
          </div>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-gray-500 md:text-base">{intro}</p>
          {children}
        </div>
      </div>
    </main>
  );
}

function PricingPage() {
  return (
    <PageShell
      title="Pricing"
      intro="ChinaEase Buddy starts with a free toolkit. Paid passes are optional and currently use manual PayPal payment links."
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-5 shadow-sm ${
              plan.featured ? 'bg-[#155e63] text-white' : 'border border-gray-100 bg-white'
            }`}
          >
            <h2 className={`text-sm font-semibold ${plan.featured ? 'text-white' : 'text-gray-950'}`}>{plan.name}</h2>
            <p className={`mt-2 text-3xl font-bold ${plan.featured ? 'text-white' : 'text-gray-950'}`}>{plan.price}</p>
            <p className={`mt-1 text-xs ${plan.featured ? 'text-white/70' : 'text-gray-500'}`}>{plan.note}</p>
            <ul className="mt-5 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className={`flex items-start gap-2 text-xs ${plan.featured ? 'text-white/85' : 'text-gray-600'}`}>
                  <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${plan.featured ? 'text-[#7dd3d8]' : 'text-[#155e63]'}`} />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href={plan.href}
              target={plan.plan === 'free' ? undefined : '_blank'}
              rel={plan.plan === 'free' ? undefined : 'noopener noreferrer'}
              onClick={() => {
                void trackEvent('cta_clicked', {
                  ctaName: plan.cta,
                  destination: plan.plan === 'trip_pass' ? 'PayPal Trip Pass' : plan.plan === 'group_pass' ? 'PayPal Group Pass' : 'free-toolkit',
                  tool: 'pricing',
                  plan: plan.plan,
                });
              }}
              className={`mt-5 inline-flex w-full justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                plan.featured ? 'bg-white text-[#155e63] hover:bg-gray-50' : 'border border-[#155e63]/15 bg-[#155e63]/5 text-[#155e63] hover:bg-[#155e63]/10'
              }`}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-[#155e63]/10 bg-[#155e63]/5 p-4">
        <p className="text-sm font-semibold text-[#155e63]">One-time payment · No auto-renewal.</p>
        <p className="mt-2 text-xs leading-relaxed text-gray-600">
          PayPal Sandbox checkout and automatic activation are being tested. Live checkout will not be enabled until owner approval.
        </p>
        <p className="mt-2 text-xs font-semibold leading-relaxed text-[#155e63]">
          ChinaEase Buddy does not collect card details directly. PayPal handles the payment securely.
        </p>
      </div>
    </PageShell>
  );
}

function LegalPage({ type }: { type: LegalPageType }) {
  const page = legalCopy[type];
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleUnsubscribe = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus('loading');
    try {
      await unsubscribeNewsletter(trimmed, new URLSearchParams(window.location.search).get('token'));
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <PageShell title={page.title} intro={page.intro}>
      {type === 'unsubscribe' && (
        <section className="mb-6 rounded-2xl border border-[#155e63]/15 bg-white p-5 shadow-sm">
          <label htmlFor="unsubscribe-email" className="text-sm font-bold text-gray-900">Email address</label>
          <input
            id="unsubscribe-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#155e63]/40"
            placeholder="you@example.com"
          />
          <button
            onClick={handleUnsubscribe}
            disabled={status === 'loading'}
            className="mt-3 rounded-full bg-[#155e63] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {status === 'loading' ? 'Unsubscribing...' : 'Unsubscribe'}
          </button>
          {status === 'success' && <p className="mt-3 text-sm font-semibold text-[#155e63]">You have been unsubscribed.</p>}
          {status === 'error' && <p className="mt-3 text-sm font-semibold text-red-600">Could not unsubscribe. Please contact support.</p>}
        </section>
      )}
      <div className="space-y-4">
        {page.sections.map((section) => (
          <section key={section.title} className="rounded-2xl border border-gray-100 bg-white p-4">
            <h2 className="text-base font-semibold text-gray-950">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{section.body}</p>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

function GuidePage({ type, userId }: { type: GuidePageType; userId?: string | null }) {
  const page = guidePages[type];
  useGuideSeo(page);

  useEffect(() => {
    initAttribution();
    trackEventOnce(
      `guide:${type}:${window.location.search}`,
      'guide_page_viewed',
      {
        pageType: type,
        path: `${window.location.pathname}${window.location.search}`,
      },
      userId,
    );
  }, [type, userId]);

  return (
    <PageShell title={page.title} intro={page.intro}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-[#155e63]/15 bg-[#155e63]/5 p-4 md:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#155e63]">Quick answer</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700 md:text-base">{page.quickAnswer}</p>
          <p className="mt-3 text-xs font-semibold text-gray-500">Last reviewed: June 12, 2026</p>
          <a
            href={page.ctaHref}
            onClick={() => {
              void trackEvent('cta_clicked', {
                ctaName: page.ctaLabel,
                destination: page.ctaHref,
                tool: type,
              }, userId);
            }}
            className="mt-4 inline-flex rounded-full bg-[#155e63] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0e4a4e]"
          >
            {page.ctaLabel}
          </a>
        </section>

        <nav className="rounded-2xl border border-gray-100 bg-white/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">On this page</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {page.sections.map((section) => (
              <a key={section.title} href={`#${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="rounded-full border border-[#155e63]/15 bg-[#155e63]/5 px-3 py-1.5 text-xs font-semibold text-[#155e63]">
                {section.title}
              </a>
            ))}
            <a href="#faq" className="rounded-full border border-[#155e63]/15 bg-[#155e63]/5 px-3 py-1.5 text-xs font-semibold text-[#155e63]">
              FAQ
            </a>
          </div>
        </nav>

        <div className="grid gap-4 md:grid-cols-2">
          {page.sections.map((section) => (
            <section
              id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
              key={section.title}
              className={`rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm${section.table ? ' md:col-span-2' : ''}`}
            >
              <h2 className="text-lg font-bold text-gray-950">{section.title}</h2>
              {section.table && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {section.table.headers.map((h) => (
                          <th key={h} className="pb-2 pr-4 font-semibold text-gray-950 first:w-1/4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row[0]} className="border-b border-gray-50 last:border-0">
                          {row.map((cell, i) => (
                            <td key={i} className={`py-2 pr-4 leading-relaxed text-gray-600${i === 0 ? ' font-semibold text-gray-800' : ''}`}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {section.items && section.items.length > 0 && (
                section.ordered ? (
                  <ol className="mt-3 list-decimal list-outside space-y-2 pl-5">
                    {section.items.map((item) => (
                      <li key={item} className="pl-1 text-sm leading-relaxed text-gray-600">{item}</li>
                    ))}
                  </ol>
                ) : (
                  <ul className={`space-y-2 ${section.table ? 'mt-4 border-t border-gray-100 pt-4' : 'mt-3'}`}>
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-relaxed text-gray-600">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#155e63]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </section>
          ))}
        </div>

        <section id="faq" className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm md:p-5">
          <h2 className="text-xl font-bold text-gray-950">FAQ</h2>
          <div className="mt-4 divide-y divide-gray-100">
            {page.faqs.map((faq) => (
              <details key={faq.question} className="group py-3 first:pt-0 last:pb-0">
                <summary className="cursor-pointer list-none text-sm font-semibold text-gray-950">
                  {faq.question}
                  <span className="float-right text-[#155e63] group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white/70 p-4">
          <h2 className="text-base font-bold text-gray-950">Related guides</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {page.related.map((link) => (
              <a key={link.href} href={link.href} className="rounded-full border border-[#155e63]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#155e63] hover:bg-[#155e63]/5">
                {link.label}
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white/70 p-4">
          <h2 className="text-base font-bold text-gray-950">Official or primary sources to verify</h2>
          <ul className="mt-3 space-y-2">
            <li className="flex gap-2 text-sm leading-relaxed text-gray-600">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#155e63]" />
              <span>Official app instructions from Alipay, WeChat, Didi, Amap, and Trip.com.</span>
            </li>
            <li className="flex gap-2 text-sm leading-relaxed text-gray-600">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#155e63]" />
              <span>Your airline, hotel, card issuer, embassy, consulate, or relevant official authority for time-sensitive requirements.</span>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-amber-200/70 bg-amber-50/80 p-4">
          <h2 className="text-sm font-bold text-amber-900">Conservative travel note</h2>
          <p className="mt-2 text-xs leading-relaxed text-amber-900/80">{standardDisclaimer}</p>
        </section>
      </div>
    </PageShell>
  );
}

export function getPolicyPageType(pathname: string): PageType | null {
  const cleanPath = pathname.replace(/\/+$/, '');
  if (cleanPath.endsWith('/pricing')) return 'pricing';
  if (cleanPath.endsWith('/guides')) return 'guides';
  if (cleanPath.endsWith('/terms')) return 'terms';
  if (cleanPath.endsWith('/privacy')) return 'privacy';
  if (cleanPath.endsWith('/refund')) return 'refund';
  if (cleanPath.endsWith('/contact')) return 'contact';
  if (cleanPath.endsWith('/about')) return 'about';
  if (cleanPath.endsWith('/unsubscribe')) return 'unsubscribe';
  if (cleanPath.endsWith('/china-travel-apps')) return 'china-travel-apps';
  if (cleanPath.endsWith('/alipay-for-foreigners')) return 'alipay-for-foreigners';
  if (cleanPath.endsWith('/china-payment-guide')) return 'china-payment-guide';
  if (cleanPath.endsWith('/china-travel-checklist')) return 'china-travel-checklist';
  if (cleanPath.endsWith('/china-emergency-numbers')) return 'china-emergency-numbers';
  if (cleanPath.endsWith('/faq')) return 'faq';
  return null;
}

export default function PolicyPage({ type, userId }: Props) {
  if (type === 'pricing') return <PricingPage />;
  if (type in guidePages) return <GuidePage type={type as GuidePageType} userId={userId} />;
  return <LegalPage type={type as LegalPageType} />;
}

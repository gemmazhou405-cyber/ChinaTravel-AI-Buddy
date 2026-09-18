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
      ['AMap in English', 'Search places, plan walking and metro routes, and navigate stations and entrances.', '/amap-in-english/'],
      ['China Metro Guide', 'Buy tickets, pass security, transfer lines, and choose the correct station exit.', '/china-metro-guide/'],
      ['DiDi in China for Foreigners', 'Book rides, find the correct pickup point, verify the car, and handle payment.', '/didi-in-china-for-foreigners/'],
      ['China Train Travel Guide', 'Book high-speed train tickets with a foreign passport and board with confidence.', '/china-train-travel-guide/'],
      ['10-Day China Itinerary', 'Follow a practical first-trip route through Beijing, Xi\'an, and Shanghai.', '/10-day-china-itinerary/'],
      ['Alipay for Foreigners', 'What foreign visitors should know before trying Alipay in China.', '/alipay-for-foreigners/'],
      ['WeChat Pay for Foreigners', 'Set up an eligible international card, pay by QR code, and prepare a backup.', '/wechat-pay-for-foreigners/'],
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
    title: 'Best Apps for China Travel (2026) | ChinaEase Buddy',
    heading: '8 Essential Apps for China Travel in 2026',
    description:
      'Set up Alipay, WeChat, AMap Global, DiDi, Trip.com, 12306, translation and mobile data tools before your China trip.',
    quickAnswer:
      'Before flying to mainland China, prepare a small core stack: Alipay for payments, WeChat for communication and backup payments, AMap Global for maps and public transport, DiDi for rides, Trip.com or Railway 12306 for trains, and an offline translation tool. Arrange an eSIM or roaming plan separately. Install from official stores, keep access to your home number for verification, save your hotel address in Chinese, and do not rely on Google or any single app as your only option.',
    lastReviewed: 'September 17, 2026',
    lastModified: '2026-09-17',
    article: true,
    contentSections: [
      {
        title: 'Your China travel app stack at a glance',
        items: [
          'Alipay: QR payments and useful travel mini-programs; foreign visitors can link an eligible international card.',
          'WeChat: messaging, calls, location sharing, mini-programs, and a possible backup payment option where available.',
          'AMap Global (Gaode Maps): destination search, route planning, public transport, walking, driving, and ride-hailing in mainland China.',
          'DiDi: app-based taxi and ride-hailing; keep pickup and destination names in Chinese for easier driver communication.',
          'Trip.com: English-language booking for trains, flights, and hotels.',
          'Railway 12306: the official China Railway website and app, with an English website for registration and ticket services.',
          'An offline translation app: download Chinese language data and test camera or text translation without mobile data.',
          'ChinaEase Buddy: a web-based toolkit for itinerary planning, practical phrases, food references, payments, and emergencies.',
        ],
      },
      {
        title: 'Set everything up before your flight',
        ordered: true,
        items: [
          'Download each app from its official website or your phone\'s official app store, and check that you selected the correct regional version.',
          'Register with a phone number you can still access abroad, then complete any identity or card verification requested by the provider.',
          'Save your hotel name, full address, and phone number in Chinese in both your notes and screenshots.',
          'Arrange your eSIM or home-carrier roaming plan, but check the exact plan rules instead of assuming every international app will work.',
          'Test login, payments, routes, and offline translation before departure; keep a backup for every essential task.',
        ],
      },
      {
        title: 'Payments: prepare Alipay and a backup',
        items: [
          'Alipay states that foreign visitors can connect a credit card for payments at merchants across China. Eligibility, verification, limits, and fees can vary by account and transaction.',
          'WeChat includes payment features in supported regions, but availability and onboarding can differ. Treat it as a useful backup, not a guaranteed replacement for Alipay.',
          'Carry a physical bank card and some renminbi as backups. A linked card or wallet can still fail because of verification, issuer controls, merchant rules, or connectivity.',
          'For the full setup and troubleshooting steps, read Alipay for Foreigners and the China Payment Guide.',
        ],
      },
      {
        title: 'Maps: use AMap Global and save Chinese addresses',
        items: [
          'AMap Global currently advertises destination search, route planning, buses, subways, driving, walking, cycling, local places, and ride-hailing in mainland China.',
          'Language, login, and individual features can vary by phone, region, and app version. Install and test your exact version before travel.',
          'Google services are blocked on ordinary mainland internet connections, so do not make Google Maps your only navigation option.',
          'Save important destinations in Chinese characters. Searching a hotel, station, attraction, or business name is often more reliable than entering a translated street address.',
        ],
      },
      {
        title: 'Rides: prepare DiDi without assuming one payment flow',
        items: [
          'Use the standalone DiDi app or a supported mini-program path that is available on your device and account.',
          'Enter pickup and destination carefully, then match the car plate and driver details before entering the vehicle.',
          'Keep the destination name and address in Chinese in case you need to show the driver.',
          'Follow the payment choices shown in your version of the app. Availability can differ by region, account, card, and booking channel.',
        ],
      },
      {
        title: 'Trains: choose Trip.com or official Railway 12306',
        items: [
          'Trip.com offers an English booking route for China trains and other travel products.',
          'Railway 12306 is the official ticketing service and has an English website with registration, search, ticketing, refund, and travel guidance.',
          'Enter your passport name and document number exactly as shown on the passport. The passport used for the booking is also needed for travel.',
          'Check sales dates and availability for your route, especially around national holidays; do not depend on an arbitrary fixed number of days.',
        ],
      },
      {
        title: 'Translation and offline information',
        items: [
          'Choose a translation app that lets you download Chinese for offline use, and test it in airplane mode before departure.',
          'If the app supports camera translation, download any required language files and permissions in advance.',
          'Keep essential phrases, allergies, hotel details, tickets, and emergency information as screenshots as well as inside apps.',
          'ChinaEase Buddy can keep practical China travel references together in English, but it should not be your only offline backup.',
        ],
      },
      {
        title: 'Internet access changes which apps work',
        items: [
          'Ordinary mainland mobile networks and Wi-Fi are subject to local internet controls. Google, Facebook, YouTube, X, and some other services are blocked or restricted.',
          'International roaming and travel eSIM routing differ by provider and plan. Confirm access, hotspot support, data limits, and activation timing on the exact product page.',
          'A travel eSIM is not automatically a VPN, and online services such as VPNs are subject to Chinese licensing rules.',
          'Read the China eSIM & Internet Guide before choosing a connection plan.',
        ],
      },
      {
        title: 'Common setup mistakes to avoid',
        items: [
          'Downloading an unofficial clone or the wrong regional version of an app.',
          'Losing access to the phone number used for verification after changing SIM settings.',
          'Depending on one wallet, one map, or one internet connection without a backup.',
          'Arriving without the hotel address and first destination saved in Chinese.',
          'Deleting an eSIM while troubleshooting or storing all tickets only inside an online account.',
        ],
      },
    ],
    faqs: [
      ['What apps should I download before visiting China?', 'Most first-time visitors should prepare Alipay, WeChat, AMap Global, DiDi, Trip.com or Railway 12306, and an offline translation tool. Also arrange mobile data and keep offline copies of hotel, ticket, and emergency information.'],
      ['Is AMap Global available in English?', 'AMap now markets a global version with worldwide map and route-planning services. Language and features can still vary by region, phone, and app version, so install and test your exact version before travel.'],
      ['Does Google Maps work in mainland China?', 'Do not rely on it as your only map. Google services are blocked on ordinary mainland internet connections. Prepare AMap Global or another currently supported local navigation option and save key addresses in Chinese.'],
      ['Can I book China train tickets with a foreign passport?', 'Yes. Travelers can use an eligible passport through services such as Trip.com or the official Railway 12306 system. Enter the name and document number exactly as shown on the passport and carry that passport when traveling.'],
      ['Should I set these apps up before arriving in China?', 'Yes. Install, register, verify, and test them before departure while you have reliable internet and access to your usual phone number. Keep backup payment, navigation, and offline information in case one setup fails.'],
      ['Do I need a Chinese phone number for every app?', 'No, not for every app, but registration and individual features vary. Keep access to your home number for verification and check each provider\'s current requirements before departure.'],
    ],
    sourceLinks: [
      ['AMap Global official Google Play listing', 'https://play.google.com/store/apps/details?id=com.autonavi.minimap'],
      ['Alipay official Google Play listing', 'https://play.google.com/store/apps/details?id=com.eg.android.AlipayGphone'],
      ['WeChat official Google Play listing', 'https://play.google.com/store/apps/details?id=com.tencent.mm'],
      ['Railway 12306 English website', 'https://www.12306.cn/en/index.html'],
      ['Trip.com official website', 'https://www.trip.com/'],
      ['UK government China internet-access advice', 'https://www.gov.uk/foreign-travel-advice/china/safety-and-security#internet-access'],
    ],
  },
  'china-train-travel-guide': {
    title: 'China Train Guide for Foreigners (2026) | ChinaEase Buddy',
    heading: 'China Train Travel Guide for Foreigners (2026)',
    description:
      'Book China high-speed train tickets with a foreign passport. Compare 12306 and Trip.com, complete verification, board correctly, and fix common problems.',
    quickAnswer:
      'Foreign visitors can buy China train tickets with a valid passport through the official Railway 12306 system, an authorised booking service such as Trip.com, or a station ticket counter. Enter the passenger name and passport number exactly as shown on the passport, check the full station name because many cities have several stations, and carry the same original passport to enter, board, and exit. Most journeys use an e-ticket, so an itinerary sheet or screenshot is useful for reference but does not replace the passport used for booking.',
    lastReviewed: 'September 17, 2026',
    lastModified: '2026-09-17',
    article: true,
    contentSections: [
      {
        title: 'Choose where to book',
        items: [
          'Railway 12306: the official China Railway website and app. Its English website supports ticket purchase, change, refund, and change-of-destination services.',
          'Trip.com: an English-language third-party booking option that can be easier for some international visitors; compare the final price, service fees, support, and refund terms before paying.',
          'Station ticket counter: useful if online identity verification fails or you need staff help. Bring the original passport for every passenger.',
          'Use the same booking channel to manage an order when possible, because third-party support and Railway 12306 handle their own orders differently.',
        ],
      },
      {
        title: 'Prepare these details before searching',
        items: [
          'The exact passport name, passport number, nationality, and date of birth for every passenger.',
          'The full departure and arrival station names. Beijing, Shanghai, Guangzhou, Shenzhen, and many other cities have multiple major stations.',
          'A train and arrival time that still leaves enough time for hotel check-in, local transport, or a connecting flight.',
          'A payment method accepted by your chosen booking channel and access to the phone number or email used for verification.',
          'A backup train or travel time in case your preferred service sells out.',
        ],
      },
      {
        title: 'Book on the official Railway 12306 service',
        ordered: true,
        items: [
          'Use the official English website or official app, create an account, and add each traveler under the passenger list.',
          'Select passport as the identity-document type and copy every character carefully. Do not shorten, translate, or rearrange the name unless the system specifically instructs you.',
          'Complete the identity-verification steps shown for the account. If online verification does not complete, follow the current 12306 prompt or ask at a staffed station counter.',
          'Search by the exact stations and date, then compare departure time, journey length, arrival station, seat class, and transfer risk.',
          'Pay within the displayed time and save the order number, train number, carriage, seat, station names, and departure time offline.',
        ],
      },
      {
        title: 'Book through Trip.com or another sales agent',
        items: [
          'Check whether the result is an immediately issued ticket, a request to purchase when sales open, or a waitlist-style service.',
          'Review the final amount, currency, service fee, cancellation terms, and customer-support channel before payment.',
          'Enter passport details exactly as printed and check the confirmation again after the ticket is issued.',
          'For changes or refunds, begin with the company that issued the order. China Railway states that it does not handle ticketing problems caused by other websites.',
        ],
      },
      {
        title: 'Understand the ticket and train details',
        items: [
          'G, D, and C services are commonly shown for high-speed or intercity rail, while other letter prefixes and numbers can indicate conventional services. Compare journey time rather than relying only on the train letter.',
          'Second class is the standard high-speed-rail choice for most travelers; first class and business class offer more space at a higher price when available.',
          'Confirm both station names, not only the cities. A ticket to Shanghai Hongqiao is different from a ticket to Shanghai Station.',
          'Your confirmation should show the train number, date, departure and arrival stations, departure time, carriage, and seat after issuance.',
        ],
      },
      {
        title: 'Enter the station and board the train',
        ordered: true,
        items: [
          'Go to the exact station printed in the booking and allow generous time for finding the entrance, security, identity checks, and the correct waiting area.',
          'Use the original passport entered during booking. An itinerary sheet, reimbursement receipt, order screenshot, or passport copy does not replace it.',
          'At stations where the automatic gate does not read a foreign passport, use a staffed or manual verification lane and show the passport.',
          'Complete the security check, then find the waiting room or gate shown on the station displays. Gate information can appear closer to departure.',
          'When boarding opens, follow the platform and carriage signs, then match the carriage and seat number in your confirmation.',
          'Keep the passport available after arrival because it may be required again to exit the destination station.',
        ],
      },
      {
        title: 'Changes, refunds, and missed trains',
        items: [
          'Railway 12306 supports ticket changes and refunds, subject to seat availability, timing, ticket status, and the current fee rules shown for the order.',
          'A ticket can generally be changed only once under the official rules, and some destination changes must be requested before a stated deadline.',
          'If you booked through a third party, use that provider first and check whether its service fees are refundable.',
          'Do not assume a screenshot or an unused ticket lets you take a later train. Use the official change process or ask station staff immediately.',
          'Rules can be adjusted temporarily, so use the live order page and station announcements as the final authority.',
        ],
      },
      {
        title: 'Common problems and what to do',
        items: [
          'Passport will not scan: use the staffed gate or identity-verification lane rather than repeatedly trying the automatic gate.',
          'Name or passport number is wrong: contact the issuer before travel; do not assume staff can ignore a mismatch at the gate.',
          'Wrong station: check the Chinese and English station name before leaving the hotel and allow extra time when cities have multiple stations.',
          'No ticket available: check another departure time, seat class, nearby station, or route, but avoid unverified resellers.',
          'Lost passport: contact the relevant authority and station staff immediately. China Railway has specific procedures, but a phone photo alone is not a substitute for the required document.',
          'No mobile data: keep the order number, train details, hotel address, and booking-support information available offline.',
        ],
      },
    ],
    faqs: [
      ['Can foreigners buy China train tickets with a passport?', 'Yes. China Railway states that foreign passengers can purchase real-name tickets with a valid passport accepted under the applicable rules. The passport details must match the passenger and the original document should be carried for travel.'],
      ['Should I use Railway 12306 or Trip.com?', 'Use Railway 12306 if you want to book directly with the official operator and can complete its account setup. Trip.com can offer a more familiar English booking flow, but check the final price, service fees, support, and refund terms.'],
      ['Do I need to collect a paper train ticket?', 'Usually not for an e-ticket. The valid passport used to purchase the ticket is the key travel document. An itinerary sheet or reimbursement receipt cannot be used as the ticket.'],
      ['What if the station gate cannot scan my passport?', 'Use a staffed or manual verification lane and show the original passport. Arrive with enough time for security and identity checks rather than waiting until boarding closes.'],
      ['How early should I arrive at a China railway station?', 'China Railway advises passengers to reserve enough time because station entrances, security, identity checks, waiting rooms, and platforms can involve queues and walking. For an unfamiliar large station, arriving roughly 45 to 60 minutes early is a practical buffer, but follow local instructions.'],
      ['Can I change or refund a China train ticket?', 'Yes, subject to the current rules, timing, ticket status, fees, and seat availability. Manage the booking through the original issuer and read the live conditions before confirming.'],
      ['Why does the exact station name matter?', 'Large Chinese cities often have several railway stations located far apart. Check the complete departure and arrival station names before booking and again before leaving for the station.'],
    ],
    sourceLinks: [
      ['Railway 12306 English website', 'https://www.12306.cn/en/index.html'],
      ['Railway 12306 official English FAQ', 'https://www.12306.cn/en/faq.html'],
      ['Trip.com official website', 'https://www.trip.com/'],
    ],
  },
  'didi-in-china-for-foreigners': {
    title: 'DiDi in China for Foreigners (2026) | ChinaEase Buddy',
    heading: 'How to Use DiDi in China as a Foreigner (2026)',
    description:
      'Use DiDi in China with an international phone number. Learn app setup, pickup points, car verification, driver messages, payment, and problem solving.',
    quickAnswer:
      'Foreign visitors can use the DiDi China ride-hailing app with an international mobile number and an English interface, or access DiDi through supported WeChat and Alipay routes. Before requesting a car, save the exact destination in Chinese, confirm the pickup pin and meeting point, compare the service type and estimated fare, and prepare a payment method shown in your version. When the car arrives, match the licence plate and vehicle details before entering.',
    lastReviewed: 'September 18, 2026',
    lastModified: '2026-09-18',
    article: true,
    contentSections: [
      {
        title: 'Choose how you will open DiDi',
        items: [
          'DiDi China app: the official store listing advertises an English interface, global mobile-number login, bilingual driver messaging, and multiple payment methods for inbound visitors.',
          'Alipay: the English version can provide a DiDi ride-hailing entry, with payment handled through the options available in Alipay.',
          'WeChat: Ride Hailing may appear inside Services, with the fare paid through the available WeChat Pay route.',
          'Menus, services, and payment choices can vary by phone, region, account, and app version. Set up and test the route you plan to use before arrival.',
        ],
      },
      {
        title: 'Prepare before requesting your first ride',
        ordered: true,
        items: [
          'Install the official DiDi China app or confirm that the DiDi entry opens inside your prepared Alipay or WeChat account.',
          'Register with a mobile number you can access and switch to English if that option is available.',
          'Complete any identity or payment verification requested by the app or wallet.',
          'Save your hotel, airport terminal, railway station, and first destinations in Chinese as well as English.',
          'Allow location access only while using the app if that matches your preference, then check that the pickup pin follows your real position.',
          'Keep mobile data, a charged phone, and a backup payment and transport option.',
        ],
      },
      {
        title: 'Book a DiDi ride step by step',
        ordered: true,
        items: [
          'Enter the destination and select the correct branch, entrance, terminal, or station building rather than relying only on the general place name.',
          'Move or confirm the pickup pin and read the pickup description before choosing a car.',
          'Compare the service category, estimated price, passenger capacity, and pickup time shown in the app.',
          'Request the ride and wait for the driver and vehicle details to appear.',
          'Use the in-app translated message function when possible instead of moving the conversation to another channel.',
          'At pickup, match the licence plate, vehicle model or colour, and driver information before entering.',
          'Confirm the destination and follow the route in the app. After arrival, check the final fare and payment status.',
        ],
      },
      {
        title: 'Airport and railway-station pickup points',
        items: [
          'Large airports and stations can have separate ride-hailing zones, floors, gates, car parks, or numbered pickup areas.',
          'Do not place the order until you know the terminal or station exit and can reach the selected pickup area.',
          'Use the pickup instructions shown in the app and send the exact zone, floor, gate, or pillar number to the driver.',
          'If the location is confusing, ask airport, station, or hotel staff to confirm the official ride-hailing pickup point.',
          'Avoid accepting an unsolicited off-platform ride from someone approaching you inside the terminal.',
        ],
      },
      {
        title: 'Verify the car and ride safely',
        items: [
          'Match the licence plate shown in the app before opening the door. Do not enter a different car because the driver knows your destination.',
          'The driver may ask for the last four digits of the registered phone number as a pickup confirmation.',
          'Wear the seat belt and keep the trip visible in the app. Use the app\'s sharing or safety functions when available.',
          'Keep communication and payment inside the platform when possible, and do not share payment passwords or verification codes.',
          'For an immediate safety emergency, leave the vehicle when safe and contact local emergency services such as police on 110.',
        ],
      },
      {
        title: 'Payment, estimates, and receipts',
        items: [
          'The payment method depends on whether you booked through the DiDi app, Alipay, or WeChat and on the options available to your account.',
          'Review the estimated fare and service category before confirming; tolls, waiting, route changes, and other displayed charges can affect the final amount.',
          'Wait for the trip to end in the app before assuming payment is complete, and check whether any action is still required.',
          'Keep the digital trip record or request a receipt when you may need to identify the vehicle, challenge a charge, or report a lost item.',
          'Carry a second digital wallet, a physical card, and some RMB rather than relying on one payment route.',
        ],
      },
      {
        title: 'If the driver calls or cannot find you',
        items: [
          'Send a translated in-app message with the exact pickup zone, gate, floor, or nearby landmark.',
          'Share a photo only if it does not expose sensitive personal information and the platform provides an appropriate route.',
          'Ask nearby staff to speak briefly with the driver if communication is blocking the pickup.',
          'Before cancelling, review any cancellation warning or fee shown in the app and confirm that the driver has not already arrived.',
          'If no car accepts the request, try an official taxi queue, public transport, or another supported ride-hailing category.',
        ],
      },
      {
        title: 'Useful driver messages',
        items: [
          '我在网约车上车点。 — I am at the ride-hailing pickup point.',
          '我在二号门。 — I am at Gate 2.',
          '请问您的车牌号是多少？ — What is your licence plate number?',
          '请送我到这个地址。 — Please take me to this address.',
          '请在这里停车。 — Please stop here.',
          '我把东西落在车上了。 — I left something in the car.',
        ],
      },
      {
        title: 'If you have a fare, support, or lost-item problem',
        ordered: true,
        items: [
          'Open the completed trip in the same app or mini-program used to book it.',
          'Save the trip number, time, route, licence plate, charge, and relevant screenshots.',
          'Use the trip-specific help or in-app customer-service route rather than contacting an unrelated regional DiDi service.',
          'For a lost item, report it promptly without publishing the driver\'s personal information.',
          'If the issue involves an urgent safety risk or suspected crime, contact local authorities as well as the platform.',
        ],
      },
    ],
    faqs: [
      ['Can foreigners use DiDi in China?', 'Yes. The official DiDi China app advertises an English interface and global mobile-number login for inbound visitors. DiDi may also be available through supported Alipay and WeChat routes.'],
      ['Can I register for DiDi with a foreign phone number?', 'The official DiDi China store listings state that global mobile-number login is supported. Keep access to that number for verification and trip communication.'],
      ['Is DiDi available in English?', 'The DiDi China app offers an English interface for inbound users, and English availability may also depend on the Alipay or WeChat route and version you use.'],
      ['How do I pay for DiDi in China?', 'Follow the payment choices shown in the booking route you use. The DiDi app, Alipay, and WeChat can present different options, so prepare and verify your payment method before requesting a car.'],
      ['How do I find my DiDi at an airport or railway station?', 'Check the terminal or station exit first, then follow the app to the designated ride-hailing zone. Send the driver the floor, gate, zone, or pillar number and verify the licence plate at pickup.'],
      ['What if the DiDi driver calls me in Chinese?', 'Use the app\'s bilingual messaging where available, send a short pickup description, or ask nearby staff to help with a brief call. Save essential pickup phrases in Chinese before traveling.'],
      ['How do I report a lost item or incorrect charge?', 'Open the completed trip, save its details and screenshots, and use the trip-specific help or customer-service route inside the same app or mini-program used to book it.'],
    ],
    sourceLinks: [
      ['Shanghai government: How to use DiDi Chuxing', 'https://english.shanghai.gov.cn/en-UsefulApps/20240206/976515bc601f4803b9ce2f64ae9f0cd3.html'],
      ['DiDi China official Google Play listing', 'https://play.google.com/store/apps/details?id=com.sdu.didi.psnger'],
      ['DiDi China official Apple App Store listing', 'https://apps.apple.com/us/app/didi-china-ride-hailing/id554499054'],
      ['DiDi official customer-support direction', 'https://didiglobal.com/contact'],
    ],
  },
  'amap-in-english': {
    title: 'AMap in English: China Map Guide (2026) | ChinaEase Buddy',
    heading: 'How to Use AMap in English in China (2026)',
    description:
      'Use AMap in English for China travel. Learn setup, English place search, walking and metro routes, saved addresses, ride-hailing, and navigation fixes.',
    quickAnswer:
      'AMap, also called Gaode Maps, offers an English version for overseas users and can plan walking, public-transport, driving, and other routes in mainland China. Download it from an official app store, test the English interface before departure, and save the Chinese name and address of every important destination. When searching, select the exact hotel branch, station building, terminal, entrance, or metro exit rather than relying on a general place name. Keep screenshots and a second navigation option in case mobile data, GPS, or place search fails.',
    lastReviewed: 'September 18, 2026',
    lastModified: '2026-09-18',
    article: true,
    contentSections: [
      {
        title: 'Download and prepare AMap before your trip',
        ordered: true,
        items: [
          'Download AMap or AMap Global only from its official website or your phone\'s official app store. Check the publisher before installing.',
          'Open the language settings and select English if it is not already active. Names and menu locations can change by phone, region, and app version.',
          'Allow location access while using the app if you want live positioning and turn-by-turn guidance; review other permissions instead of accepting them automatically.',
          'Search your first hotel, airport terminal, railway station, and key attractions while you still have reliable internet.',
          'Save the destination name, Chinese address, phone number, and a screenshot outside the app so you can show them to staff or a driver.',
          'Arrange mobile data and keep a charged phone or power bank. Live traffic, search, and route updates depend on connectivity.',
        ],
      },
      {
        title: 'Search for the correct place',
        items: [
          'Start with the full English place name, but use the Chinese name or address when English search returns no result or the wrong result.',
          'For hotels, restaurants, shops, hospitals, and attractions with several branches, compare the district, street, phone number, photos, and distance.',
          'For a large attraction, search for the ticket entrance or visitor entrance rather than the centre point of the entire site.',
          'For a railway station or airport, confirm the complete station name, terminal, departure level, arrival level, or pickup area.',
          'Do not assume the first search result is correct. Save the verified place before starting the route.',
        ],
      },
      {
        title: 'Plan walking and public-transport routes',
        items: [
          'Choose the route mode you actually need: walking, public transport, driving, cycling, or another option shown in your version.',
          'For public transport, compare the departure time, total duration, number of transfers, walking distance, and last-service information shown in the app.',
          'Check the named metro station entrance when entering and the recommended station exit at your destination. The wrong exit can add a long surface walk.',
          'For walking routes, zoom in around large roads, elevated walkways, shopping centres, parks, and compounds to confirm the accessible entrance.',
          'Route details and service availability can change. Follow official signs and staff instructions when they differ from the map.',
        ],
      },
      {
        title: 'Use AMap at airports and railway stations',
        items: [
          'Confirm the airport terminal or the full railway-station name before leaving your hotel; major cities can have several distant stations and terminals.',
          'Search for the correct entrance, departure hall, metro connection, taxi queue, or ride-hailing pickup point instead of the general station pin.',
          'Leave extra time for security, walking inside the complex, and finding the correct gate or waiting area.',
          'Once inside, treat official signs, screens, tickets, and staff instructions as the final authority. Indoor routes and access controls may change faster than the map.',
        ],
      },
      {
        title: 'AMap maps and ride-hailing are different tasks',
        items: [
          'AMap is useful for place search, route planning, live traffic, and navigation. Some versions can also display ride-hailing services.',
          'A ride-hailing entry inside AMap does not guarantee the same English support, payment methods, identity checks, or customer service as the standalone DiDi route.',
          'Before ordering a car, confirm the pickup pin, destination, service category, estimated fare, payment method, and vehicle details shown on your screen.',
          'For a dedicated step-by-step ride guide, use the separate DiDi in China for Foreigners page.',
        ],
      },
      {
        title: 'What to save for weak or missing mobile data',
        items: [
          'Take screenshots of the full route, key turns, metro line and transfer stations, destination entrance, and return route.',
          'Keep your hotel name, Chinese address, phone number, and nearest metro station in your notes.',
          'Assume that live search, traffic, and route recalculation require internet unless your exact app version clearly confirms an offline feature.',
          'Carry a second data option or know where to find official station, hotel, or visitor-service help.',
        ],
      },
      {
        title: 'Common AMap problems and fixes',
        items: [
          'No English search result: paste the Chinese place name or full Chinese address from the hotel, booking, attraction, or official website.',
          'Wrong branch: compare the district, street, phone number, photos, opening information, and distance before choosing.',
          'Location appears wrong: check GPS and location permission, confirm mobile data, step outside dense buildings, and wait for the position to refresh.',
          'Walking route ends at the wrong side: look for the named gate or entrance and zoom in for footbridges, tunnels, compounds, or road barriers.',
          'Public-transport route is unavailable or no longer practical: check a later route, another station entrance, an official taxi queue, or DiDi.',
        ],
      },
      {
        title: 'Useful Chinese map phrases',
        items: [
          '这个地址在哪里？ — Where is this address?',
          '请问最近的地铁站入口在哪里？ — Where is the nearest metro entrance?',
          '我应该从哪个出口出去？ — Which exit should I use?',
          '这是正确的火车站吗？ — Is this the correct railway station?',
          '请带我到这个地址。 — Please take me to this address.',
        ],
      },
    ],
    faqs: [
      ['Is AMap available in English?', 'Yes. AMap launched an English map experience for overseas users, with English interface and place information. Exact language coverage and menus can vary by app version and location.'],
      ['Can foreigners use AMap in China?', 'Yes. Overseas users can download AMap from supported official app stores and use it for place search and route planning. Some account-based or transaction features may require additional setup.'],
      ['Do I need a Chinese phone number for AMap?', 'Basic map search and route planning may be available without a Chinese number, but login, saved data, ride-hailing, or other account features can vary. Follow the requirements shown in your current version and keep access to your travel phone number.'],
      ['Can AMap plan metro and walking routes?', 'Yes. AMap provides public-transport and walking route planning. Check the station entrance, destination exit, transfers, walking distance, and current service information before starting.'],
      ['Does Google Maps work in mainland China?', 'Do not rely on Google Maps as your only map on an ordinary mainland China connection. Access to some international services can be restricted, so prepare AMap and save essential addresses and screenshots before travel.'],
      ['Does AMap work offline?', 'Some capabilities can vary by device and version. Unless your version clearly confirms an offline feature, assume search, live traffic, and route recalculation need mobile data and save route screenshots as a backup.'],
      ['Should I use AMap or DiDi?', 'Use AMap mainly for maps, place search, walking and public-transport routes, and navigation. Use DiDi when you want a dedicated ride-hailing flow with pickup, vehicle, trip, payment, and support details.'],
    ],
    sourceLinks: [
      ['AMap official mobile website', 'https://mobile.amap.com/'],
      ['AMap official Google Play listing', 'https://play.google.com/store/apps/details?id=com.autonavi.minimap'],
      ['Shanghai city guide: AMap English launch', 'https://www.meet-in-shanghai.net/en/news/gaode-maps-launches-chinas-first-english-map-for-overseas-users-600989/'],
      ['Shanghai government: essential apps for visitors', 'https://english.shanghai.gov.cn/en-UsefulApps/20231214/3cac2d8cc7f847da92a72252bae06705.html'],
      ['UK travel advice: internet access in China', 'https://www.gov.uk/foreign-travel-advice/china/safety-and-security#internet-access'],
    ],
  },
  'china-metro-guide': {
    title: 'China Metro Guide for Foreigners (2026) | ChinaEase Buddy',
    heading: 'China Metro Guide for Foreigners (2026)',
    description:
      'Ride China metros with confidence. Learn tickets, overseas card and QR payment, security checks, transfers, station exits, luggage, and late-train tips.',
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
  '10-day-china-itinerary': {
    title: '10-Day China Itinerary for First-Time Visitors | ChinaEase Buddy',
    heading: '10-Day China Itinerary for First-Time Visitors',
    description:
      'Plan a classic 10-day China trip through Beijing, Xi\'an, and Shanghai with daily highlights, train advice, booking tips, and flexible alternatives.',
    quickAnswer:
      'For a first 10-day trip to China, use a simple three-city route: four nights in Beijing for imperial history and the Great Wall, three nights in Xi\'an for the Terracotta Warriors and Tang-era culture, and three nights in Shanghai for the old city, the Bund, and modern China. Travel from Beijing to Xi\'an by high-speed train, then choose a flight or longer train to Shanghai. Reserve the Palace Museum and Terracotta Warriors in advance, keep the first arrival day light, and avoid adding a fourth major city unless you are comfortable with a faster pace.',
    lastReviewed: 'September 18, 2026',
    lastModified: '2026-09-18',
    article: true,
    contentSections: [
      {
        title: 'The 10-day route at a glance',
        items: [
          'Day 1 — Beijing: arrive, check in, set up mobile data and payments, and take a short local walk.',
          'Day 2 — Beijing: Tiananmen area, the Palace Museum (Forbidden City), and Jingshan Park.',
          'Day 3 — Beijing: Great Wall day trip; choose a section and transport plan that match your fitness and crowd tolerance.',
          'Day 4 — Beijing: Temple of Heaven plus hutongs, or swap in the Summer Palace if gardens and architecture matter more to you.',
          'Day 5 — Beijing to Xi\'an: high-speed train, hotel check-in, City Wall or Bell and Drum Tower area in the evening.',
          'Day 6 — Xi\'an: Terracotta Warriors, then return to the city for an easy evening.',
          'Day 7 — Xi\'an: Shaanxi history or Tang-culture sights, Giant Wild Goose Pagoda area, then evening travel or one more night.',
          'Day 8 — Shanghai: old-city sights, Yu Garden area, the Bund, and the Pudong skyline after dark.',
          'Day 9 — Shanghai: French Concession-style streets and a museum, neighbourhood, or nearby water-town day trip.',
          'Day 10 — Shanghai: flexible final morning, shopping or a missed highlight, then airport transfer.',
        ],
      },
      {
        title: 'Days 1–4: Beijing',
        items: [
          'Day 1 should stay light. International arrival, immigration, airport transfer, payment setup, and jet lag can consume more time than expected.',
          'On Day 2, group the Tiananmen area, Palace Museum, and Jingshan because they form one logical central route. Check each site\'s current reservation and entry rules before travel.',
          'Give the Great Wall a full day. Transport time, security, walking, weather, and queues make it a poor fit for the same day as another major attraction.',
          'Use Day 4 for the Temple of Heaven and hutongs, or choose the Summer Palace instead. Trying to cover every famous Beijing sight reduces the quality of the trip.',
          'Stay near a useful metro line rather than choosing only by straight-line distance to one attraction.',
        ],
      },
      {
        title: 'Days 5–7: Xi\'an',
        items: [
          'Take a daytime high-speed train from Beijing to Xi\'an so you can experience China\'s rail system and avoid another airport transfer.',
          'After arrival, keep Day 5 flexible: walk a section of the City Wall or explore the Bell and Drum Tower area if energy allows.',
          'Reserve Day 6 for the Terracotta Warriors. The museum is outside central Xi\'an, so include the round-trip transport time and avoid stacking too many city attractions afterward.',
          'On Day 7, choose the Shaanxi History Museum or another Tang-history focus, then visit the Giant Wild Goose Pagoda area. Confirm current reservation requirements.',
          'Travel to Shanghai in the evening only if the schedule is comfortable. Otherwise leave the next morning and simplify Day 8.',
        ],
      },
      {
        title: 'Days 8–10: Shanghai',
        items: [
          'Use the first full day to contrast old and new Shanghai: Yu Garden or the old-city area, the Bund, and the Pudong skyline.',
          'Use Day 9 for slower neighbourhood exploration, a museum, contemporary architecture, or a nearby water town. Pick one theme rather than crossing the city repeatedly.',
          'Keep Day 10 partly open for weather changes, a missed attraction, shopping, or an unhurried airport transfer.',
          'Shanghai has multiple airports and railway stations. Confirm the exact departure point and allow a realistic transfer buffer.',
        ],
      },
      {
        title: 'Book these items before departure',
        ordered: true,
        items: [
          'International flights and hotels with clear foreign-guest policies, flexible cancellation, and addresses saved in Chinese.',
          'The Palace Museum through its official ticket channel, plus any other Beijing sites that currently require timed reservations.',
          'Terracotta Warriors admission through the official museum or a clearly authorised sales channel.',
          'Beijing–Xi\'an and Xi\'an–Shanghai transport when the relevant booking window opens; use the passport details exactly.',
          'A mainland China eSIM or roaming plan, Alipay, WeChat, AMap Global, and an offline translation option.',
          'Airport transfers or late-night arrival plans for any leg that ends after normal public-transport hours.',
        ],
      },
      {
        title: 'How to pace the trip well',
        items: [
          'Treat arrival and intercity travel as real itinerary time, not empty space between attractions.',
          'Plan one major anchor experience per day and add nearby optional stops only when energy, weather, and queues allow.',
          'Keep at least one flexible half-day. Weather, attraction closures, ticket availability, and fatigue can change the best plan.',
          'Avoid changing hotels inside the same city unless the location problem is severe; packing and check-in cost more time than expected.',
          'Use a personalised route if you have children, limited mobility, food allergies, a very early flight, or specialist interests.',
        ],
      },
      {
        title: 'Useful route alternatives',
        items: [
          'Nature priority: replace Shanghai with Guilin and Yangshuo, but allow for the additional transfer complexity.',
          'Food and pandas: replace Shanghai with Chengdu, especially if a slower western-China finish suits the trip.',
          'Modern cities: replace Xi\'an with Shenzhen and Hong Kong only if entry documents and cross-border plans are already clear.',
          'Slower travel: keep only Beijing and Shanghai and add day trips instead of moving through three cities.',
          'Open-jaw flights: arrive in Beijing and depart from Shanghai when fares and entry rules work, avoiding a return to the first city.',
        ],
      },
      {
        title: 'Common first-trip mistakes',
        items: [
          'Adding four or five major cities to a 10-day trip and spending too much of the holiday in transit.',
          'Booking the wrong railway station or airport because only the city name was checked.',
          'Leaving major attraction reservations until arrival during weekends or holiday periods.',
          'Planning every day from early morning to late night without accounting for jet lag, walking, heat, cold, or queues.',
          'Depending on one payment method, one map app, or constant internet access.',
          'Using a generic itinerary without adjusting it for flight times, hotel location, pace, interests, and mobility.',
        ],
      },
    ],
    faqs: [
      ['Is 10 days enough for a first trip to China?', 'Yes. Ten days is enough for a focused first trip through Beijing, Xi\'an, and Shanghai if you limit hotel changes and treat intercity travel as part of the itinerary. It is not enough to see every major region comfortably.'],
      ['What is the best 10-day China route for first-time visitors?', 'Beijing, Xi\'an, and Shanghai is the clearest classic route: imperial history and the Great Wall, the Terracotta Warriors and Tang culture, then historic and modern Shanghai.'],
      ['Should I take trains or flights between the cities?', 'A high-speed train works well from Beijing to Xi\'an. For Xi\'an to Shanghai, compare a longer train with a flight based on the live schedule, total door-to-door time, luggage, and your preferred pace.'],
      ['Do I need to reserve attractions in advance?', 'Yes for major timed or capacity-controlled attractions. The Palace Museum and the Terracotta Warriors should be checked through their official channels before travel, and requirements can change.'],
      ['How much should I plan to spend?', 'Costs depend heavily on season, hotel standard, room sharing, transport, and paid experiences. Build separate allowances for hotels, intercity travel, local transport, attractions, food, and mobile data rather than relying on one universal daily figure.'],
      ['Can I add Chengdu, Guilin, or Zhangjiajie to this route?', 'You can replace one core city, but adding another major city usually makes a 10-day trip rushed. For four cities, extend the trip or accept fewer full sightseeing days.'],
      ['How can ChinaEase Buddy personalise this itinerary?', 'Share your dates, arrival city, trip length, interests, group size, and practical concerns. ChinaEase Buddy can turn the sample route into a personalised plan that reflects your actual flights and priorities.'],
    ],
    sourceLinks: [
      ['The Palace Museum official international website', 'https://intl.dpm.org.cn/index.html'],
      ['Emperor Qinshihuang\'s Mausoleum Site Museum official website', 'https://www.bmy.com.cn/'],
      ['Railway 12306 English website', 'https://www.12306.cn/en/index.html'],
      ['Railway 12306 official English FAQ', 'https://www.12306.cn/en/faq.html'],
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
  'wechat-pay-for-foreigners': {
    title: 'WeChat Pay for Foreigners: Setup Guide (2026) | ChinaEase Buddy',
    heading: 'How to Use WeChat Pay in China as a Foreigner (2026)',
    description:
      'Set up WeChat Pay for China: register with an overseas number, add an eligible international card, pay by QR code, and troubleshoot common failures.',
    quickAnswer:
      'Foreign visitors can use WeChat Pay in mainland China when the payment feature is available on their account and an eligible international card passes identity and issuer checks. Register the standard WeChat app with a mobile number you can access, open the payment or wallet area shown in your version, add the card, and complete any requested verification. Set it up before departure and keep Alipay, a physical card, and some RMB as backups.',
    lastReviewed: 'September 18, 2026',
    lastModified: '2026-09-18',
    article: true,
    contentSections: [
      {
        title: 'What you need before setup',
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
        title: 'WeChat Pay, Weixin Pay, and regional wallets',
        items: [
          'Weixin Pay is the payment service inside the Weixin or WeChat ecosystem for the Chinese mainland.',
          'Regional products such as WeChat Pay HK follow their own eligibility, funding, and cross-border rules.',
          'Do not assume instructions for a regional wallet match the standard international WeChat account on your phone.',
          'Follow the payment menu and terms shown in your exact app version and region.',
        ],
      },
      {
        title: 'Fees, limits, and exchange rates',
        items: [
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
      ['Do I need a Chinese bank account for WeChat Pay?', 'Foreign visitors may be able to fund eligible merchant payments with a supported international card, so a Chinese bank account is not always required. Follow the options shown in your account.'],
      ['Can I set up WeChat Pay before arriving in China?', 'Yes. Install the standard WeChat app, register, look for the payment or wallet area, add your card, and complete verification before departure if the feature is available.'],
      ['Why can I not see Wallet or Pay and Services?', 'Menu names and payment availability can differ by region, account, identity status, and app version. Update the official app and use WeChat support if the payment feature is unavailable.'],
      ['Can I send money to a person with an international card?', 'Do not assume that you can. Merchant purchases may work while personal transfers, red packets, and balance features remain restricted for an international-card setup.'],
      ['What should I do if WeChat Pay is declined?', 'Check verification and issuer approval, confirm that the QR code is for a merchant, then use another prepared payment method rather than repeatedly retrying an uncertain transaction.'],
      ['Should I choose WeChat Pay or Alipay for China?', 'Prepare both if possible. Many first-time visitors use Alipay as the primary wallet and WeChat Pay as a backup, while also carrying a physical card and some RMB.'],
    ],
    sourceLinks: [
      ['Tencent: cross-border payment support through Weixin Pay', 'https://www.tencent.com/tencent-showcases-future-of-finance-at-hong-kong-fintech-week-2025/'],
      ['WeChat official Google Play listing', 'https://play.google.com/store/apps/details?id=com.tencent.mm'],
      ['China government: Guide to Payment Services in China', 'https://english.www.gov.cn/news/202403/15/content_WS65f3b5d9c6d0868f4e8e52ea.html'],
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
  'china-travel-apps': ['Get my free China itinerary', '/#trip-plan'],
  'amap-in-english': ['Get my free China itinerary', '/#trip-plan'],
  'china-metro-guide': ['Get my free China itinerary', '/#trip-plan'],
  'didi-in-china-for-foreigners': ['Get my free China itinerary', '/#trip-plan'],
  'china-train-travel-guide': ['Get my free China itinerary', '/#trip-plan'],
  '10-day-china-itinerary': ['Get my personalised 10-day itinerary', '/#trip-plan'],
  'china-esim-internet-guide': ['Get my free China itinerary', '/#trip-plan'],
  'alipay-for-foreigners': ['Get my free China itinerary', '/#trip-plan'],
  'wechat-pay-for-foreigners': ['Get my free China itinerary', '/#trip-plan'],
  'china-payment-guide': ['Open payment phrases', '/?journey=china&tool=pay'],
  'china-travel-checklist': ['View the trip checklist', '/?journey=before&tool=checklist'],
  'china-emergency-numbers': ['View emergency help', '/?journey=emergency'],
  faq: ['Open the free toolkit', '/'],
};

const relatedLinks = [
  ['All guides', '/guides/'],
  ['China eSIM & internet guide', '/china-esim-internet-guide/'],
  ['China travel apps', '/china-travel-apps/'],
  ['AMap in English', '/amap-in-english/'],
  ['China metro guide', '/china-metro-guide/'],
  ['DiDi in China for foreigners', '/didi-in-china-for-foreigners/'],
  ['China train travel guide', '/china-train-travel-guide/'],
  ['10-day China itinerary', '/10-day-china-itinerary/'],
  ['WeChat Pay for foreigners', '/wechat-pay-for-foreigners/'],
  ['China payment guide', '/china-payment-guide/'],
  ['China travel checklist', '/china-travel-checklist/'],
  ['China emergency numbers', '/china-emergency-numbers/'],
  ['FAQ', '/faq/'],
];

const pageRelatedLinks = {
  'china-travel-apps': [
    ['First trip to China', '/first-trip-to-china/'],
    ['AMap in English', '/amap-in-english/'],
    ['China metro guide', '/china-metro-guide/'],
    ['DiDi in China for foreigners', '/didi-in-china-for-foreigners/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China eSIM & internet guide', '/china-esim-internet-guide/'],
    ['Alipay for foreigners', '/alipay-for-foreigners/'],
    ['China payment guide', '/china-payment-guide/'],
    ['China travel checklist', '/china-travel-checklist/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'didi-in-china-for-foreigners': [
    ['Apps to download before China', '/china-travel-apps/'],
    ['AMap in English', '/amap-in-english/'],
    ['China metro guide', '/china-metro-guide/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['China payment guide', '/china-payment-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'amap-in-english': [
    ['First trip to China', '/first-trip-to-china/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['China metro guide', '/china-metro-guide/'],
    ['DiDi in China for foreigners', '/didi-in-china-for-foreigners/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China eSIM & internet guide', '/china-esim-internet-guide/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'china-metro-guide': [
    ['First trip to China', '/first-trip-to-china/'],
    ['AMap in English', '/amap-in-english/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['DiDi in China for foreigners', '/didi-in-china-for-foreigners/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China payment guide', '/china-payment-guide/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'china-train-travel-guide': [
    ['First trip to China', '/first-trip-to-china/'],
    ['10-day China itinerary', '/10-day-china-itinerary/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['China metro guide', '/china-metro-guide/'],
    ['China eSIM & internet guide', '/china-esim-internet-guide/'],
    ['China payment guide', '/china-payment-guide/'],
    ['China travel checklist', '/china-travel-checklist/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  '10-day-china-itinerary': [
    ['First trip to China', '/first-trip-to-china/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['China eSIM & internet guide', '/china-esim-internet-guide/'],
    ['China travel checklist', '/china-travel-checklist/'],
    ['Get a personalised China itinerary', '/#trip-plan'],
  ],
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
    ['Open payment phrases', '/?journey=china&tool=pay'],
    ['Alipay for Foreigners', '/alipay-for-foreigners/'],
    ['WeChat Pay for Foreigners', '/wechat-pay-for-foreigners/'],
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
  const heading = meta.heading || meta.title.split('|')[0].trim();
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

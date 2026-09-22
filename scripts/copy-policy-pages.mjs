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
      ['China Visa-Free Travel Guide', 'Compare 30-day visa-free entry, 240-hour visa-free transit, and the documents each route requires.', '/china-visa-free-travel-guide/'],
      ['China Airport Arrival Guide', 'Follow immigration, baggage, customs, mobile data, payment, and airport-transfer steps after landing.', '/china-airport-arrival-guide/'],
      ['China Hotels for Foreigners', 'Book with a foreign passport, check in smoothly, understand registration, and handle common hotel problems.', '/china-hotels-for-foreigners/'],
      ['China Food Ordering Guide', 'Use QR and photo menus, explain dietary needs, handle serious food allergies, and pay.', '/china-food-ordering-guide/'],
      ['Chinese Travel Phrases', 'Save practical Mandarin for transport, hotels, food, payment, and emergencies.', '/chinese-travel-phrases/'],
      ['China Travel Safety Guide', 'Understand crime, scams, transport, local laws, health, weather, and emergency planning.', '/china-travel-safety-guide/'],
      ['China Travel Budget', 'Estimate daily costs, trip totals, transport, food, hotels, and seasonal price changes.', '/china-travel-budget/'],
      ['China Travel Apps', 'Prepare Alipay, WeChat, Amap, Didi, and Trip.com before arrival.', '/china-travel-apps/'],
      ['AMap in English', 'Search places, plan walking and metro routes, and navigate stations and entrances.', '/amap-in-english/'],
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
      ['Best Time to Visit China', 'Compare seasons, months, regions, crowds, public holidays, and weather risks.', '/best-time-to-visit-china/'],
      ['Alipay for Foreigners', 'What foreign visitors should know before trying Alipay in China.', '/alipay-for-foreigners/'],
      ['WeChat Pay for Foreigners', 'Set up an eligible international card, pay by QR code, and prepare a backup.', '/wechat-pay-for-foreigners/'],
      ['China Payment Guide', 'Practical payment reminders for Alipay, WeChat Pay, cards, and cash backup.', '/china-payment-guide/'],
      ['China Travel Checklist', 'A first-time visitor checklist for apps, payments, hotels, phrases, and emergency basics.', '/china-travel-checklist/'],
      ['Emergency Numbers in China', 'Know 110, 120, and 119, plus simple phrases for urgent situations.', '/china-emergency-numbers/'],
      ['FAQ', 'Short answers about ChinaEase Buddy, paid passes, travel tools, and service limits.', '/faq/'],
    ],
  },
  'china-visa-free-travel-guide': {
    title: 'China Visa-Free Travel Guide (2026) | ChinaEase Buddy',
    heading: 'China Visa-Free Travel Guide for Tourists (2026)',
    description:
      'Compare China\'s 30-day visa-free entry and 240-hour transit rules. Check passport, route, purpose, ports, documents, and common mistakes.',
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
    title: 'China Airport Arrival Guide (2026) | ChinaEase Buddy',
    heading: 'China Airport Arrival Guide for First-Time Visitors (2026)',
    description:
      'Arrive in China with confidence. Follow immigration, baggage, customs, eSIM, payment, airport transfer, hotel check-in, and late-arrival steps.',
    quickAnswer:
      'Before flying, confirm the entry rules for your exact passport, route, purpose, and travel dates, then complete China\'s free official online arrival card if it applies to you. Keep your passport, visa or other entry basis, accommodation details, and onward booking accessible offline. After landing, follow the airport signs through immigration, baggage claim, and Customs; connect your phone, test a payment backup, and use an official airport train, metro, taxi queue, or verified ride-hailing pickup. The arrival card is not a visa or permission to enter, and the final entry decision belongs to the immigration authorities.',
    lastReviewed: 'September 20, 2026',
    lastModified: '2026-09-20',
    article: true,
    contentSections: [
      {
        title: 'Before your flight: prepare the arrival file',
        ordered: true,
        items: [
          'Confirm your visa, visa-free, or transit eligibility for your exact passport, route, purpose, and dates through an official Chinese embassy, consulate, or immigration source. Do not treat a general travel guide as an entry decision.',
          'Complete the free official National Immigration Administration online arrival card if required. The official form is available at s.nia.gov.cn/ArrivalCardFillingPC/. Beware of unofficial websites that charge a fee.',
          'Save your passport details, accommodation name, full address and phone number in both English and Chinese. Keep the first-night booking and any relevant onward ticket available offline.',
          'Install your eSIM before departure when the provider instructs you to, prepare Alipay or WeChat Pay, and carry a physical bank card plus some backup cash.',
          'Screenshot the airport terminal, hotel address, airport-transfer plan, and a backup route in case mobile data or an app fails after landing.',
        ],
      },
      {
        title: 'China arrival card: use the official free service',
        items: [
          'China\'s National Immigration Administration introduced online arrival-card submission for foreign travelers from 20 November 2025.',
          'The official service is free. It is available through the NIA website and official government channels; the direct web form is linked in the sources below.',
          'If you have not completed it before travel, the NIA says you can normally submit it at the arrival port using a mobile phone, airport device, official QR code, or paper card.',
          'Some traveler categories are exempt. Check the current NIA instructions rather than assuming the form applies to everyone.',
          'An arrival card does not replace a visa, visa-free eligibility, transit permission, passport inspection, or an immigration officer\'s entry decision.',
        ],
      },
      {
        title: 'Immigration after landing',
        ordered: true,
        items: [
          'Follow signs for International Arrivals, Immigration, or Border Inspection. Use the transit route only when you are actually remaining in or following the airport\'s international-transfer process.',
          'Keep your passport and applicable visa or entry documents ready, along with the arrival-card confirmation and accommodation or onward details when relevant.',
          'Answer questions clearly and consistently. If you do not understand a request, politely ask the officer to repeat it or request language help.',
          'Follow the instructions shown at that airport for photographs, fingerprints, inspection lanes, or additional checks; the process can differ by traveler and port.',
          'If a document or eligibility issue arises, speak with immigration or airline staff. China\'s NIA service hotline is 12367 within China.',
        ],
      },
      {
        title: 'Baggage claim and Customs',
        items: [
          'Check the airport screen for your flight\'s baggage belt and keep the baggage receipt until you have collected and inspected every checked bag.',
          'Report missing or damaged baggage to the airline or baggage-service desk before leaving the controlled claim area, and keep the written report or reference number.',
          'At Customs, follow the current declaration signs and declare goods when required. Personal-use and duty-free rules depend on the goods, quantity, value, and current Customs rules.',
          'If you are uncertain whether something must be declared, ask a Customs officer before choosing an exit channel. Do not rely on an old allowance screenshot or a social-media post.',
          'Keep medicines in their original packaging and carry supporting documents when relevant; restricted goods and medicine rules should be checked before departure.',
        ],
      },
      {
        title: 'Connect your phone and test payment',
        items: [
          'Turn on the travel eSIM or roaming line exactly as your provider instructs, select it for mobile data, and prevent the home line from using unintended roaming data.',
          'Airport Wi-Fi can be a temporary bridge, but login or verification requirements vary. Save essential information offline before flying.',
          'If an eSIM does not connect, check the selected data line, data-roaming setting, APN instructions, phone restart, and provider support. Do not delete the eSIM unless the provider tells you to.',
          'Open Alipay or WeChat Pay only after you have a stable connection and test a small purchase when practical.',
          'Keep a second wallet, physical card, and some RMB as backups. A linked international card can still fail because of verification, issuer, network, or merchant rules.',
        ],
      },
      {
        title: 'Choose a verified airport transfer',
        items: [
          'Airport rail or metro: usually clear and economical, but confirm the terminal, operating hours, destination station, transfers, luggage route, and final station exit.',
          'Official taxi queue: follow airport signs to the staffed or marked taxi rank. Show the hotel name and address in Chinese and ask for a receipt.',
          'DiDi or another approved ride-hailing service: confirm the numbered pickup zone, terminal, car model, licence plate, and driver details before entering.',
          'Hotel transfer: confirm the meeting point, driver contact, flight-number tracking, and late-arrival policy directly with the hotel.',
          'Avoid unsolicited drivers who approach you inside the terminal. When confused, return to an official transport desk, taxi queue, or clearly marked pickup area.',
        ],
      },
      {
        title: 'Hotel check-in and late-night arrivals',
        items: [
          'Keep the passport for every guest and the booking name ready. Tell the hotel in advance when your flight lands late or after the normal reception hours.',
          'Save the hotel name, Chinese address, phone number, nearest entrance, and a screenshot of the booking confirmation.',
          'Check whether the airport train or metro will still operate after immigration and baggage claim, not merely at the scheduled landing time.',
          'If the planned transport has stopped, use the official taxi queue or a verified ride-hailing pickup instead of accepting an unmarked ride.',
          'Hotels normally handle the accommodation registration process for their guests. For a private or non-hotel stay, confirm the current local registration steps with the host and local authorities.',
        ],
      },
      {
        title: 'Your first-hour backup plan',
        items: [
          'No mobile data: connect to official airport Wi-Fi or visit the information or telecom desk, then contact the eSIM or roaming provider.',
          'Payment failure: try the second wallet, a physical card, or cash; do not keep repeating a blocked transaction without checking the message.',
          'Cannot find the ride: verify the terminal and pickup-zone number, then use the in-app bilingual message or return to the official taxi queue.',
          'Missing baggage: report it before leaving baggage claim and give the airline a reachable phone number and hotel address.',
          'Entry or document problem: speak with immigration, the airline, or airport staff and use official channels such as the NIA 12367 service.',
        ],
      },
      {
        title: 'Useful airport phrases',
        items: [
          '国际到达在哪里？ — Where are international arrivals?',
          '入境检查在哪里？ — Where is immigration?',
          '我的行李没有到。 — My baggage did not arrive.',
          '海关申报在哪里？ — Where is the Customs declaration area?',
          '官方出租车上车点在哪里？ — Where is the official taxi pickup?',
          '请带我到这个地址。 — Please take me to this address.',
          '请帮我联系这家酒店。 — Please help me contact this hotel.',
        ],
      },
    ],
    faqs: [
      ['Do I need to complete a China arrival card?', 'Many foreign travelers entering China need an arrival card, but the National Immigration Administration lists exemptions for specific traveler categories. Check the current official instructions for your exact journey.'],
      ['Is the China online arrival card free?', 'Yes. The National Immigration Administration states that the official online arrival-card service is free and warns travelers about unofficial websites that charge fees.'],
      ['Can I fill in the arrival card after landing?', 'Yes. The NIA says travelers who have not completed it before travel can normally submit it at the port through official mobile or QR channels, on-site devices, or a paper card.'],
      ['What documents should I keep ready at immigration?', 'Keep your passport and applicable visa or entry documents ready. It is also sensible to have your arrival-card confirmation, first accommodation details, and onward booking available when relevant to your route.'],
      ['Should I wait until the airport to set up mobile data and payments?', 'No. Install and prepare your eSIM or roaming plan and payment apps before departure. After landing, activate them according to the provider instructions and test them while you still have airport help and Wi-Fi available.'],
      ['What is the safest way to travel from a China airport to the city?', 'Use the official airport rail or metro, the marked taxi queue, a confirmed hotel transfer, or a verified ride-hailing pickup. Choose based on operating hours, terminal, luggage, destination, and arrival time.'],
      ['What should I do for a late-night arrival?', 'Notify the hotel, save its Chinese address and phone number, check transport operating hours against your realistic exit time, and keep the official taxi queue or verified ride-hailing service as a backup.'],
    ],
    sourceLinks: [
      ['National Immigration Administration: warning about fake arrival-card websites', 'https://en.nia.gov.cn/n147418/n147463/c191530/content.html'],
      ['Official China online arrival card form', 'https://s.nia.gov.cn/ArrivalCardFillingPC/'],
      ['Chinese Embassy in the United States: online arrival card guidance', 'https://us.china-embassy.gov.cn/eng/lsfw/zj/qz2021/202512/t20251203_11765346.htm'],
      ['General Administration of Customs of China', 'https://english.customs.gov.cn/'],
      ['People\'s Bank of China: payment guide for visitors', 'https://english.www.gov.cn/news/202403/15/content_WS65f3b5d9c6d0868f4e8e52ea.html'],
    ],
  },
  'china-hotels-for-foreigners': {
    title: 'China Hotels for Foreigners: Booking Guide (2026) | ChinaEase Buddy',
    heading: 'China Hotels for Foreigners: Booking and Check-In Guide (2026)',
    description:
      'Book and check in to hotels in China with a foreign passport. Learn guest rules, registration, late arrival, payment, deposits, and what to do if refused.',
    quickAnswer:
      'Foreign visitors can book and stay in hotels in China using a valid passport. In 2024, China\'s public security, commerce, and immigration authorities said hotels must not refuse overseas guests merely because the property claims to lack a special foreign-guest qualification. In practice, some front desks may still be unfamiliar with passport registration, especially at small or newly opened properties. Before a non-refundable booking, confirm the exact property can register your passport, save the written confirmation, enter every guest\'s name exactly as shown on the passport, and notify the hotel if you will arrive late. A hotel normally completes the accommodation registration for its guests; a private or non-hotel stay follows separate local registration procedures.',
    lastReviewed: 'September 20, 2026',
    lastModified: '2026-09-20',
    article: true,
    contentSections: [
      {
        title: 'Can foreigners stay in any hotel in China?',
        items: [
          'China\'s public security, commerce, and immigration authorities stated in 2024 that hotels must not refuse overseas travelers merely on the basis that they lack a so-called foreign-related qualification.',
          'Hotels still need to verify each guest\'s identity and report the required accommodation information to the local public security authority.',
          'A property may still be unavailable for ordinary reasons such as no rooms, renovation, age restrictions, or a booking problem. The policy does not guarantee a room at every property on every date.',
          'Operational mistakes can still occur when staff are unfamiliar with foreign passports or the registration system. Confirming directly before a restrictive booking reduces arrival risk.',
          'Special locations, controlled areas, or unusual accommodation types may have additional local requirements. Check the exact property and destination rather than relying on a general statement.',
        ],
      },
      {
        title: 'Check these details before booking',
        ordered: true,
        items: [
          'Confirm the exact hotel name, branch, street address, and city. Chinese chains can have several properties with almost identical English names.',
          'Ask in writing whether the property can check in guests using your passport nationality and document type. Save the reply in the booking app and as a screenshot.',
          'Choose free cancellation or pay-at-property terms when the hotel is small, remote, newly listed, or has few recent international reviews.',
          'Check the reception hours and late-arrival rule. A confirmed reservation can still be released when the property is not told about a post-midnight arrival.',
          'Review room occupancy, breakfast, window type, smoking status, lift access, deposit, tax, cancellation deadline, and whether every guest is included in the booking.',
        ],
      },
      {
        title: 'Use the passport name correctly',
        items: [
          'Enter the surname and given names as the booking form instructs and as they appear in the machine-readable passport. Avoid nicknames and translated names.',
          'Bring the original valid passport for every foreign guest, including children. A photo or photocopy may not be sufficient for identity verification and registration.',
          'If the booking is under one traveler but a different person arrives first, add the arriving guest to the reservation or contact the property in advance.',
          'For a recently renewed passport, make sure the booking and any visa or entry details use the current document number where required.',
          'Keep the reservation number, payment receipt, cancellation terms, and the hotel\'s written confirmation accessible offline.',
        ],
      },
      {
        title: 'Choose a useful location, not just a cheap room',
        items: [
          'Search the hotel\'s Chinese address in AMap and confirm the distance to the correct metro station exit, railway station, airport route, or attraction entrance.',
          'Check the full railway-station or airport name. A low room price can be poor value if it creates long transfers or an expensive late-night ride.',
          'Read recent reviews for noise, construction, smoke, heating or air-conditioning, lift access, reception service, and foreign-passport check-in experiences.',
          'Save the hotel name, address, phone number, nearest landmark, and entrance photo in Chinese for taxi and DiDi drivers.',
          'For the first night, prioritize a 24-hour reception and a straightforward airport transfer over a difficult apartment or unstaffed self-check-in.',
        ],
      },
      {
        title: 'Payment, deposits, and receipts',
        items: [
          'Check whether the booking is prepaid, guaranteed by card, or payable at the property. A card used to guarantee a room may not be the final payment method.',
          'International-card acceptance varies. Prepare Alipay or WeChat Pay where available, a physical card, and some RMB as backups.',
          'Hotels may request a refundable deposit for the room or incidental charges. Confirm the amount, payment route, release timing, and receipt before paying.',
          'Do not assume the price includes every tax, breakfast, extra bed, or child charge. Review the final booking summary and property policy.',
          'If you need a formal invoice, ask the property before checkout what information and payment evidence it requires.',
        ],
      },
      {
        title: 'What happens at hotel check-in?',
        ordered: true,
        items: [
          'Show the original passport for every guest and the reservation confirmation. Staff may scan or manually enter passport and entry information.',
          'Confirm the room type, number of nights, breakfast, deposit, checkout time, and payment status before accepting the key.',
          'The hotel normally completes the required accommodation registration and submits the guest information to the local public security authority.',
          'Ask for the Wi-Fi name and password, hotel card or Chinese address, breakfast location, and the best entrance for taxis or ride-hailing.',
          'Inspect the room promptly and report a wrong room type, smoke smell, damage, missing item, or safety problem before settling in.',
        ],
      },
      {
        title: 'Late-night arrival plan',
        items: [
          'Message or call the hotel with the booking number, flight or train number, and realistic arrival time. Ask the property to hold the room for late arrival.',
          'Confirm that reception is staffed at your arrival time; self-check-in instructions designed for a Chinese ID card may not work with a foreign passport.',
          'Save the hotel\'s Chinese name, address, phone number, entrance image, and a screenshot of the late-arrival confirmation.',
          'Check airport rail and metro operating hours against the time you are likely to leave baggage claim, not the scheduled landing time.',
          'Keep an official taxi queue or verified DiDi pickup as the transport backup and one alternative hotel with 24-hour reception as an emergency option.',
        ],
      },
      {
        title: 'If a hotel refuses your passport at the desk',
        ordered: true,
        items: [
          'Stay calm and ask whether a manager or experienced staff member can complete the foreign-passport registration.',
          'Show the written booking confirmation and politely explain that national authorities have said hotels should not refuse overseas guests merely for lacking foreign-guest qualification.',
          'Ask the property to state the exact reason for refusal in the booking platform message. Save the reservation, payment, chat, and front-desk details.',
          'Contact the booking platform while you are still at the property and request a penalty-free cancellation, refund, and immediate alternative accommodation.',
          'If the issue cannot be resolved quickly, prioritize a safe replacement hotel. Later complaints can be directed through the platform or relevant local service channels with documentation.',
        ],
      },
      {
        title: 'Hotels versus private or non-hotel stays',
        items: [
          'When you stay in a hotel, the hotel is responsible for completing and reporting the accommodation registration required for its guests.',
          'When a foreign visitor stays in a home, apartment, friend\'s residence, or another non-hotel address, the foreign visitor or host generally must register with the local public security authority within 24 hours of arrival.',
          'From 20 March 2026, the National Immigration Administration began an online pilot for non-hotel accommodation registration in Hebei, Liaoning, Zhejiang, Hubei, Guangxi, Chongqing, and Sichuan.',
          'The pilot can be accessed through the NIA government-service website, the Immigration 12367 app, or official WeChat and Alipay mini-programs; in-person registration remains available.',
          'Outside the pilot areas, or when the online service does not cover the address, ask the host and local public security authority for the current local procedure.',
        ],
      },
      {
        title: 'Useful Chinese hotel phrases',
        items: [
          '请确认可以用外国护照入住。 — Please confirm that I can check in with a foreign passport.',
          '这是我的预订确认。 — This is my booking confirmation.',
          '我会很晚到，请帮我保留房间。 — I will arrive late; please hold the room.',
          '请帮我办理住宿登记。 — Please help me complete the accommodation registration.',
          '押金是多少？什么时候退？ — How much is the deposit, and when will it be returned?',
          '请告诉我不能入住的具体原因。 — Please tell me the exact reason I cannot check in.',
          '请在预订平台上确认退款。 — Please confirm the refund in the booking platform.',
        ],
      },
    ],
    faqs: [
      ['Can foreigners stay in any hotel in China?', 'National authorities have said hotels must not refuse overseas guests merely because they lack a special foreign-guest qualification. However, room availability, property policy, local conditions, and staff familiarity can still affect a specific stay, so confirm before a restrictive booking.'],
      ['Do Chinese hotels need a special licence to accept foreigners?', 'In 2024, public security, commerce, and immigration authorities stated that hotels must not use a lack of foreign-related qualification as the reason to refuse overseas guests. Hotels still have identity-checking and guest-registration duties.'],
      ['Do I need my passport to check in?', 'Yes. Bring the original valid passport for every foreign guest. The hotel needs identity and travel-document information for check-in and accommodation registration.'],
      ['Do I need to register with the police if I stay in a hotel?', 'The hotel normally handles and reports the accommodation registration for its guests. A private home, apartment, or other non-hotel stay follows a separate process and generally requires registration within 24 hours.'],
      ['Can I book a China hotel through an international booking website?', 'Yes, but verify the exact property, passport check-in, guest names, cancellation terms, payment route, and late-arrival policy. A platform listing does not replace direct confirmation when the booking risk is high.'],
      ['Can I pay a China hotel with a foreign credit card?', 'Some hotels accept international cards, while others use Alipay, WeChat Pay, cash, or domestic payment routes. Confirm the property\'s current options and keep more than one payment method.'],
      ['What should I do if a hotel refuses me at check-in?', 'Ask for a manager, show the written confirmation, request the exact reason in writing, and contact the booking platform for a refund and replacement. Prioritize safe alternative accommodation instead of prolonging a late-night dispute.'],
    ],
    sourceLinks: [
      ['Gansu government: official response on hotel access for overseas travelers', 'https://www.gansu.gov.cn/gsszf/c100199/202406/173933391.shtml'],
      ['National Immigration Administration: 2026 non-hotel registration online pilot', 'https://s.nia.gov.cn/mps/tztg/202601/t20261010_1010.html'],
      ['People\'s Bank of China: payment guide for visitors', 'https://english.www.gov.cn/news/202403/15/content_WS65f3b5d9c6d0868f4e8e52ea.html'],
    ],
  },
  'china-food-ordering-guide': {
    title: 'How to Order Food in China (2026) | ChinaEase Buddy',
    heading: 'How to Order Food in China: Menu and Allergy Guide (2026)',
    description:
      'Order food in China with confidence. Use photo and QR menus, explain allergies or dietary needs, pay, avoid common mistakes, and save useful Chinese phrases.',
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
    title: 'Essential Chinese Travel Phrases (2026) | ChinaEase Buddy',
    heading: 'Essential Chinese Phrases for Travel in China (2026)',
    description:
      'Save essential Chinese phrases for travel in China, with characters, pinyin, and English for taxis, hotels, food, payments, trains, directions, and emergencies.',
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
    title: 'Is China Safe to Travel? Tourist Safety Guide (2026)',
    heading: 'Is China Safe to Travel? Safety Guide for Tourists (2026)',
    description:
      'Plan a safer China trip. Understand crime, tourist scams, solo and female travel, taxis, local laws, health, weather, emergency numbers, and what to prepare.',
    quickAnswer:
      'Many tourists visit mainland China without serious safety problems, and official UK and US guidance says serious or violent crime against foreign visitors is relatively uncommon. That does not make any trip risk-free. The most practical concerns are protecting belongings in crowded places, avoiding tea-house and bar scams, using verified transport, following local laws, preparing mobile data and payment backups, monitoring weather, and knowing how to get medical or police help. Government advisories also highlight broad national-security laws, possible exit bans, and restrictions in sensitive areas, so check the current advice issued for your own nationality and itinerary before departure.',
    lastReviewed: 'September 20, 2026',
    lastModified: '2026-09-20',
    article: true,
    contentSections: [
      {
        title: 'Understand the risk picture',
        items: [
          'Separate everyday tourist safety from legal and geopolitical risk. Street crime may be relatively uncommon while laws, restricted areas, business disputes, or a traveler\'s professional background can create different risks.',
          'As reviewed on 20 September 2026, the US Department of State rates mainland China Level 2, “Exercise increased caution,” citing enforcement of local laws, exit bans, and detention risks.',
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
      ['Is China safe for tourists in 2026?', 'Many tourists travel without serious incidents, and official UK and US guidance describes serious or violent crime against foreign visitors as relatively uncommon. Travelers should still protect belongings, avoid scams, use verified transport, follow local laws, and check current government advice for their nationality and route.'],
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
    title: 'China Travel Budget: Trip Costs for 2026 | ChinaEase Buddy',
    heading: 'China Travel Budget: How Much Does a Trip Cost? (2026)',
    description:
      'Estimate your China travel budget in RMB. Compare budget, mid-range, and comfortable daily costs plus realistic 5-, 10-, and 14-day trip totals.',
    quickAnswer:
      'For planning, allow roughly RMB 350–650 per person per day for a budget trip, RMB 800–1,500 for a mid-range trip, or RMB 1,800–3,000+ for a comfortable trip. These are ChinaEase planning ranges, not official averages or fixed prices. They exclude international flights and assume normal travel dates; your route, room-sharing, city, booking date, exchange rate, and holiday demand can change the total substantially. Check exact hotel, attraction, airline, and China Railway 12306 prices before booking.',
    lastReviewed: 'September 20, 2026',
    lastModified: '2026-09-20',
    article: true,
    contentSections: [
      {
        title: 'Daily China travel budget at a glance',
        table: {
          headers: ['Travel style', 'Planning range per person/day', 'Typical approach'],
          rows: [
            ['Budget', 'RMB 350–650', 'Hostel or simple room, local meals, metro and bus, selective paid sights'],
            ['Mid-range', 'RMB 800–1,500', 'Comfortable hotel, mixed dining, metro plus some DiDi, several paid sights'],
            ['Comfortable', 'RMB 1,800–3,000+', 'Higher-grade hotel, frequent taxis, premium meals, tours or shows'],
          ],
        },
        items: [
          'Use these figures as a first planning envelope, not a quotation. Exact prices change by destination, date, room type, booking channel, and availability.',
          'Daily ranges exclude international flights and major intercity transport. The longer-trip examples below add a broad domestic transport allowance.',
          'Solo travelers usually pay the full hotel-room price. Two people sharing one room may have a lower per-person accommodation cost.',
        ],
      },
      {
        title: 'What the estimates include — and exclude',
        items: [
          'Included in the daily estimate: accommodation, ordinary meals, city transport, common attraction tickets, and a modest allowance for small travel expenses.',
          'Excluded: flights to and from China, visas where required, travel insurance, shopping, nightlife, medical care, luxury experiences, private guides, and large exchange or card fees.',
          'Price exact intercity high-speed rail and domestic flights separately using the official Railway 12306 service or the airline.',
          'All figures are in renminbi (RMB). Convert them using the live rate offered by your card, bank, or regulated payment provider.',
        ],
      },
      {
        title: 'Accommodation: usually the biggest variable',
        items: [
          'Hostel bed or very basic room: plan around RMB 100–250 per night where available.',
          'Simple chain hotel or typical three-star room: often budget around RMB 250–600 per room per night.',
          'Comfortable four-star room: a useful planning range is RMB 600–1,200+ per room per night.',
          'Luxury and landmark hotels can start above RMB 1,200 and rise far beyond it. Central business and tourist districts often cost more.',
          'Compare the final price, taxes, breakfast, cancellation, deposit, and room type—not only the search result headline.',
        ],
      },
      {
        title: 'Food: inexpensive locally, but easy to scale up',
        items: [
          'Simple breakfast, bakery item, or snack: roughly RMB 10–30.',
          'Local noodle, rice, dumpling, or canteen-style meal: roughly RMB 25–60 per person.',
          'Casual sit-down restaurant: roughly RMB 60–150 per person before premium drinks or special dishes.',
          'Hotpot, specialty restaurants, imported food, cocktails, and fine dining can reach RMB 120–300+ per person.',
          'Check menu units, portion size, tea charges, service charges, and seafood prices before confirming.',
        ],
      },
      {
        title: 'Local and intercity transport',
        items: [
          'A metro-and-bus day can often fit within roughly RMB 10–30, depending on city and distance.',
          'For a day mixing public transport with one or two app-booked rides, allow roughly RMB 80–250.',
          'There is no useful single China train price. Distance, route, train type, seat class, and date determine the fare.',
          'Search the exact origin, destination, date, and class on the official Railway 12306 English website.',
          'Domestic flights can beat rail on very long routes, but include airport transfers, baggage rules, check-in time, and disruption risk.',
        ],
      },
      {
        title: 'Attractions, mobile data, payment, and extras',
        items: [
          'Many public spaces are free, while common major paid sights may fall around RMB 40–200. Theme parks, shows, cable cars, and private tours can cost much more.',
          'For an eSIM, roaming package, or local connectivity plan, a broad trip allowance of RMB 50–300 may be reasonable, but provider and data volume vary.',
          'Keep at least two payment methods. The People’s Bank of China visitor guide explains mobile payment, bank card, and cash options for overseas visitors.',
          'Your card issuer or payment provider may add foreign-exchange or cross-border fees. Those charges are separate from the merchant price.',
          'Also budget for luggage storage, laundry, bottled water, delivery, hotel deposits, and occasional booking-platform fees.',
        ],
      },
      {
        title: 'Estimated total for 5, 10, or 14 days',
        table: {
          headers: ['Trip length', 'Budget', 'Mid-range', 'Comfortable'],
          rows: [
            ['5 days', 'RMB 2,500–4,500', 'RMB 5,000–9,000', 'RMB 10,000–18,000+'],
            ['10 days', 'RMB 4,500–8,000', 'RMB 9,000–18,000', 'RMB 20,000–36,000+'],
            ['14 days', 'RMB 6,500–11,000', 'RMB 13,000–25,000', 'RMB 28,000–50,000+'],
          ],
        },
        items: [
          'These totals are planning envelopes for one person and include a broad allowance for domestic intercity travel. International flights remain excluded.',
          'A fast multi-city route generally costs more than a slower stay in one or two places. A couple sharing rooms may spend less per person than two solo travelers.',
          'Price hotels, long-distance transport, and must-see tickets first, then add a daily allowance for food, local transport, and flexible activities.',
        ],
      },
      {
        title: 'When and where China costs more',
        items: [
          'Chinese New Year, the Labor Day holiday, the National Day holiday, school holidays, major trade fairs, and peak summer dates can tighten availability and raise costs.',
          'Central districts in Beijing, Shanghai, Shenzhen, Guangzhou, Hangzhou, and popular resort destinations usually need a higher hotel allowance.',
          'Remote natural areas may have inexpensive rooms but costly transfers, guides, cable cars, or limited alternatives.',
          'Book critical transport and accommodation earlier for peak dates, but compare cancellation rules before paying a non-refundable rate.',
        ],
      },
      {
        title: 'Reduce cost without weakening the trip',
        ordered: true,
        items: [
          'Choose fewer bases and stay longer in each city to reduce transfers and repeated one-night bookings.',
          'Stay near a useful metro interchange rather than paying the highest premium for a famous landmark address.',
          'Use public transport for predictable journeys, then reserve DiDi for luggage, late arrivals, or poorly connected places.',
          'Mix free neighborhoods, parks, markets, and museums with a small number of paid priority sights.',
          'Track spending in RMB every two or three days so a recurring overspend does not surprise you at the end.',
        ],
      },
      {
        title: 'Build your personal China budget',
        ordered: true,
        items: [
          'List the cities, nights, room arrangement, and travel dates. Mark any Chinese public holiday or major event.',
          'Add live hotel prices and the exact 12306 or airline fares for every intercity leg.',
          'Add must-see attraction prices from official booking channels and any private tour or performance.',
          'Choose a realistic daily amount for meals and city transport based on your travel style.',
          'Add mobile data, insurance, visa costs if applicable, payment fees, shopping, and a contingency of roughly 10–15 percent.',
          'Keep international flights separate so you can compare the cost of the China portion clearly.',
        ],
      },
      {
        title: 'Budget mistakes to avoid',
        items: [
          'Treating a national daily average as a guaranteed price for a major city, remote scenic area, or public holiday.',
          'Forgetting that a solo traveler pays for the whole room while a couple can split it.',
          'Comparing a rail fare with a flight headline price without airport transfers, baggage, and time.',
          'Using an old fixed USD conversion instead of the live rate and fees that apply to your payment method.',
          'Relying on one wallet or card and leaving no contingency for rebooking, illness, weather, or lost items.',
        ],
      },
    ],
    faqs: [
      ['How much money do I need per day in China?', 'As a planning range, allow about RMB 350–650 for budget travel, RMB 800–1,500 for mid-range travel, or RMB 1,800–3,000+ for comfortable travel per person per day. These are not official averages or fixed prices.'],
      ['Is China cheap for tourists?', 'Local food and public transport can be inexpensive, while central hotels, premium attractions, private tours, nightlife, and fast multi-city travel can raise the total quickly.'],
      ['How much should I budget for 10 days in China?', 'A useful planning envelope is RMB 4,500–8,000 for a budget trip, RMB 9,000–18,000 for mid-range travel, or RMB 20,000–36,000+ for a comfortable trip. This excludes international flights.'],
      ['Are high-speed trains expensive in China?', 'The fare depends on distance, route, train type, seat class, and date. Search the exact journey on the official Railway 12306 service instead of relying on one national average.'],
      ['Do I need cash in China?', 'Mobile payment is widely used, but foreign visitors should keep a backup. Official visitor guidance covers mobile payment, bank cards, and cash; prepare at least two usable methods.'],
      ['Does the budget include international flights?', 'No. The daily and trip ranges exclude international flights. The trip totals include only a broad domestic intercity travel allowance, which you should replace with live route prices.'],
      ['When is travel in China most expensive?', 'Demand is often higher around Chinese New Year, Labor Day, National Day, school holidays, major events, and peak summer dates. Exact effects vary by city, route, and booking date.'],
    ],
    sourceLinks: [
      ['China Railway 12306 English website', 'https://www.12306.cn/en/'],
      ['People\'s Bank of China: payment guide for visitors', 'https://english.www.gov.cn/news/202403/15/content_WS65f3b5d9c6d0868f4e8e52ea.html'],
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
  '7-day-china-itinerary': {
    title: '7-Day China Itinerary for First-Time Visitors (2026)',
    heading: '7-Day China Itinerary for First-Time Visitors (2026)',
    description:
      'Plan 7 days in China with realistic Beijing, Xi\'an, and Shanghai routes, day-by-day timing, train advice, booking priorities, costs, and slower alternatives.',
    quickAnswer:
      'Seven days is enough for a focused first trip to China, but not for a relaxed tour of many regions. If you want the classic highlights and accept a fast pace, use an open-jaw route: three nights in Beijing, two in Xi\'an, and two in Shanghai, arriving in Beijing and departing from Shanghai. For a more comfortable trip, skip Xi\'an and divide the week between Beijing and Shanghai. Do not add Chengdu, Guilin, or Zhangjiajie on top of the three-city route; replace a city instead.',
    lastReviewed: 'September 20, 2026',
    lastModified: '2026-09-20',
    article: true,
    contentSections: [
      {
        title: 'Choose the right 7-day route',
        table: {
          headers: ['Route', 'Best for', 'Trade-off'],
          rows: [
            ['Beijing–Xi\'an–Shanghai', 'First-time visitors who want the classic three-city highlights', 'Fast pace, two intercity moves, little recovery time'],
            ['Beijing–Shanghai', 'Couples, families, jet lag, slower travel, or a later arrival', 'Misses the Terracotta Warriors but gives each city proper time'],
            ['One city plus nearby trips', 'Food, photography, repeat visitors, or minimal packing', 'Less national variety, much lower transport friction'],
          ],
        },
        items: [
          'The three-city route only works well with an open-jaw flight, sensible transport times, and no extra city. If you must return to the arrival city, choose the two-city route.',
          'Count arrival and departure as real travel days. A seven-night trip is materially easier than seven calendar days including both long-haul flights.',
          'Check visa or visa-free eligibility against your passport, route, purpose, ports, and dates before buying non-refundable transport.',
        ],
      },
      {
        title: 'Fast route: Beijing, Xi\'an, and Shanghai',
        table: {
          headers: ['Day', 'Base', 'Main plan'],
          rows: [
            ['1', 'Beijing', 'Arrive, check in, activate data and payments, then take a short neighborhood walk'],
            ['2', 'Beijing', 'Tiananmen area, Palace Museum, and Jingshan Park'],
            ['3', 'Beijing', 'Full-day Great Wall trip; pack for Xi\'an in the evening'],
            ['4', 'Xi\'an', 'Morning high-speed train, hotel check-in, City Wall or Bell and Drum Tower area'],
            ['5', 'Xi\'an → Shanghai', 'Terracotta Warriors, then an evening flight or late onward journey'],
            ['6', 'Shanghai', 'Old city or Yu Garden area, the Bund, and Pudong skyline'],
            ['7', 'Shanghai', 'One neighborhood or museum, then airport transfer'],
          ],
        },
        items: [
          'This is a highlights route, not a slow holiday. A delayed arrival, early departure, young children, limited mobility, or strong jet lag is a reason to remove Xi\'an.',
          'Do not place the Great Wall and a long train on the same day. Keep Day 3 for the Wall and travel on Day 4.',
          'If no practical evening journey leaves Xi\'an after the Terracotta Warriors, sleep in Xi\'an and accept that Shanghai becomes a one-day stop.',
        ],
      },
      {
        title: 'Calmer route: Beijing and Shanghai',
        table: {
          headers: ['Day', 'Base', 'Main plan'],
          rows: [
            ['1', 'Beijing', 'Arrival, practical setup, and an easy local walk'],
            ['2', 'Beijing', 'Tiananmen area, Palace Museum, and Jingshan Park'],
            ['3', 'Beijing', 'Great Wall day trip'],
            ['4', 'Beijing → Shanghai', 'Temple of Heaven or hutongs, then a later high-speed train or flight'],
            ['5', 'Shanghai', 'Old city, Yu Garden area, the Bund, and skyline after dark'],
            ['6', 'Shanghai', 'Neighborhoods, museum, architecture, food, or a focused day trip'],
            ['7', 'Shanghai', 'Flexible final half-day and airport transfer'],
          ],
        },
        items: [
          'This version preserves the strongest Beijing and Shanghai experiences while reducing one hotel change and one long transfer.',
          'If your flight arrives late on Day 1 or leaves early on Day 7, this is normally the better first-trip plan.',
          'You can add a nearby day trip only when it matches your interests; do not add one merely to make the itinerary look fuller.',
        ],
      },
      {
        title: 'Days 1–3: Beijing essentials',
        items: [
          'Keep arrival day light. Immigration, luggage, airport transfer, hotel registration, mobile data, and payment setup can take longer than expected.',
          'Group the Tiananmen area, Palace Museum, and Jingshan because they form one practical central route. Verify each site\'s current reservation rules.',
          'Give the Great Wall a full day. Choose the section, transport, walking difficulty, and return time before departure.',
          'Stay near a useful metro connection, not simply the hotel with the shortest straight-line distance to one attraction.',
          'If the Palace Museum reservation is unavailable, do not buy a suspicious resale ticket; use another imperial-history day and keep checking official information.',
        ],
      },
      {
        title: 'Days 4–5: Xi\'an without wasted time',
        items: [
          'Use the exact Beijing and Xi\'an railway-station names when booking. Both cities have multiple stations and transfer times differ.',
          'A daytime high-speed train is usually the clearest route because it avoids airport transfers and shows how China\'s rail system works.',
          'Keep the first Xi\'an evening flexible. Choose the City Wall or Bell and Drum Tower area based on hotel location and energy.',
          'The Terracotta Warriors are outside central Xi\'an. Include round-trip transport, security, entry, and walking time rather than treating the museum as a quick stop.',
          'Before committing to evening travel, check the live schedule and the time needed to collect luggage and reach the airport or station.',
        ],
      },
      {
        title: 'Days 6–7: a focused Shanghai finish',
        items: [
          'Use one day for the contrast between older streets, the Bund, and Pudong rather than crossing the city repeatedly.',
          'On the final day, choose one neighborhood, museum, food area, or missed highlight near a convenient transport route.',
          'Shanghai has two major airports and several railway stations. Confirm the full departure point, terminal, and transfer time.',
          'Do not schedule a distant water town on departure day. Weather, traffic, and return transport can put an international flight at risk.',
        ],
      },
      {
        title: 'Book these before the trip',
        ordered: true,
        items: [
          'Open-jaw international flights when possible: arrive in Beijing and depart from Shanghai, or reverse the route if live schedules work better.',
          'Hotels that clearly accept your passport, with the address saved in Chinese and flexible cancellation where practical.',
          'The Palace Museum through its official channel and any other timed Beijing attractions on your final plan.',
          'Terracotta Warriors admission through the official museum or a clearly authorized channel.',
          'Intercity rail or flights when the relevant booking window opens, using the passport name and number exactly.',
          'A working eSIM or roaming plan, Alipay, WeChat, AMap, an offline translation option, and payment backups.',
        ],
      },
      {
        title: 'Intercity transport decisions',
        items: [
          'Beijing to Xi\'an is well suited to high-speed rail. Check the exact live timetable, station, seat class, passport rules, and fare on Railway 12306.',
          'For Xi\'an to Shanghai, compare train and flight by door-to-door time—not only the scheduled journey. Include airport transfer, check-in, baggage, and disruption risk.',
          'For Beijing to Shanghai, high-speed rail is often attractive because both city terminals connect to urban transport, but a flight may suit a specific schedule.',
          'Arrive at stations and airports with a realistic buffer. Foreign passports may require a staffed route or additional verification even when e-tickets are used.',
          'Never plan the final long-distance transfer immediately before an international departure without recovery time.',
        ],
      },
      {
        title: 'What a 7-day China trip may cost',
        items: [
          'Use roughly RMB 350–650 per person per day for a budget planning range, RMB 800–1,500 for mid-range travel, or RMB 1,800–3,000+ for a comfortable style.',
          'These are planning ranges, not fixed prices. International flights and major intercity transport are separate, and peak holidays can change the total substantially.',
          'The three-city itinerary usually costs more than the two-city version because it adds another long journey, hotel change, and local transfer.',
          'Price hotels, 12306 rail tickets or flights, and must-see attractions first; then add food, local transport, data, fees, and a contingency.',
        ],
      },
      {
        title: 'How to adapt the route',
        items: [
          'History priority: keep Beijing and Xi\'an, then fly home from Xi\'an instead of adding Shanghai.',
          'Modern cities and easier pacing: use Beijing and Shanghai only, with an optional day trip based on weather and energy.',
          'Food and pandas: replace Shanghai with Chengdu; do not add Chengdu as a fourth city.',
          'Scenery: replace Xi\'an or Shanghai with Guilin and Yangshuo, but calculate flight or rail connections before booking.',
          'Limited mobility or children: reduce daily anchors, stay near transport, and preserve a flexible half-day in each base.',
        ],
      },
      {
        title: 'Common one-week itinerary mistakes',
        items: [
          'Counting arrival and departure as two full sightseeing days after long-haul flights.',
          'Adding four major cities and spending the trip checking out, transferring, and checking in.',
          'Booking a round trip to one city when an open-jaw ticket would remove a costly return journey.',
          'Ignoring exact airport and railway-station names until travel day.',
          'Leaving the Palace Museum, Terracotta Warriors, and peak-date rail bookings until arrival.',
          'Depending on one wallet, one bank card, one map app, or constant internet access.',
        ],
      },
    ],
    faqs: [
      ['Is 7 days enough for a trip to China?', 'Yes, for a focused route. Seven days can cover Beijing and Shanghai comfortably or Beijing, Xi\'an, and Shanghai at a fast pace. It is not enough for a relaxed multi-region tour.'],
      ['What is the best 7-day China itinerary for first-time visitors?', 'For classic highlights, arrive in Beijing, continue to Xi\'an, and depart from Shanghai. For better pacing, choose only Beijing and Shanghai. Your flight times determine which version is realistic.'],
      ['Can I visit Beijing, Xi\'an, and Shanghai in one week?', 'Yes, but expect a fast itinerary with two intercity transfers and limited flexibility. Use an open-jaw flight and remove Xi\'an if arrival is late, departure is early, or slower pacing matters.'],
      ['Should I take trains or flights on this route?', 'High-speed rail works well from Beijing to Xi\'an. Compare rail and air for Xi\'an to Shanghai using live door-to-door times, station or airport locations, baggage, and your travel date.'],
      ['How much does a 7-day China trip cost?', 'A useful daily planning range is RMB 350–650 for budget travel, RMB 800–1,500 for mid-range travel, or RMB 1,800–3,000+ for comfortable travel, excluding international flights and major intercity journeys.'],
      ['Do I need to book attractions in advance?', 'Check and reserve capacity-controlled attractions before travel. The Palace Museum and Terracotta Warriors should be verified through official channels, especially for weekends and peak periods.'],
      ['Can ChinaEase Buddy adjust this route to my flights?', 'Yes. Share your dates, arrival and departure cities, flight times, group size, interests, pace, and practical concerns to receive a route built around your real trip.'],
    ],
    sourceLinks: [
      ['The Palace Museum official international website', 'https://intl.dpm.org.cn/index.html'],
      ['Emperor Qinshihuang\'s Mausoleum Site Museum official website', 'https://www.bmy.com.cn/'],
      ['China Railway 12306 English website', 'https://www.12306.cn/en/'],
      ['Railway 12306 official English FAQ', 'https://www.12306.cn/en/faq.html'],
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
  '14-day-china-itinerary': {
    title: '14-Day China Itinerary for First-Time Visitors (2026)',
    heading: '14-Day China Itinerary for First-Time Visitors (2026)',
    description:
      'Plan two weeks in China with a realistic Beijing, Xi\'an, Chengdu, and Shanghai route, transport advice, booking priorities, costs, and a Guilin alternative.',
    quickAnswer:
      'For a first 14-day trip to China, limit the route to four bases: four nights in Beijing, three in Xi\'an, three in Chengdu, and three in Shanghai, with the final day reserved for departure. This gives you imperial history and the Great Wall, the Terracotta Warriors, Sichuan food and pandas, then historic and modern Shanghai. If landscapes matter more than pandas and food, replace Chengdu with Guilin and Yangshuo rather than adding a fifth destination. Use an open-jaw international ticket so you arrive in Beijing and depart from Shanghai, and verify every long-distance leg against the live 12306 or airline schedule before booking.',
    lastReviewed: 'September 21, 2026',
    lastModified: '2026-09-21',
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
    title: 'Beijing vs Shanghai: Which Should You Visit? (2026)',
    heading: 'Beijing vs Shanghai: Which City Should You Visit First? (2026)',
    description:
      'Compare Beijing and Shanghai for a first China trip: history, sights, food, pace, weather, airports, costs, trip length, and how to visit both.',
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
    title: '3-Day Beijing Itinerary for First-Time Visitors (2026)',
    heading: '3-Day Beijing Itinerary for First-Time Visitors (2026)',
    description: 'Plan three days in Beijing with the Palace Museum, Great Wall, Temple of Heaven, hutongs, hotel areas, bookings, transport, costs, and alternatives.',
    quickAnswer: 'With three full days in Beijing, use one day for Tiananmen and the Palace Museum, one separate day for the Great Wall, and one flexible city day for the Temple of Heaven plus hutongs or another major sight. Book identity-controlled attractions before travel, keep the Great Wall day separate from the imperial centre, and do not count a late arrival or early departure as one of the three days. The Palace Museum publishes official opening, ticket, map, and visitor-trail information; check its live rules and the official Great Wall information again before fixing each day.',
    lastReviewed: 'September 21, 2026',
    lastModified: '2026-09-21',
    article: true,
    contentSections: [
      {
        title: 'Three days in Beijing at a glance',
        table: {
          headers: ['Day', 'Main plan', 'Why this grouping works'],
          rows: [
            ['Day 1', 'Tiananmen area, Palace Museum, Jingshan or nearby hutongs', 'Keeps the imperial core together and avoids unnecessary cross-city travel'],
            ['Day 2', 'Great Wall day trip', 'Protects enough time for the transfer, security, walking, weather, and return'],
            ['Day 3', 'Temple of Heaven, hutongs, and one flexible afternoon choice', 'Balances a major landmark with neighbourhood time and a weather-resistant option'],
          ],
        },
        items: [
          'This plan assumes three complete sightseeing days after arrival and before departure.',
          'Reserve the hardest-to-book attraction first, then place the Great Wall on the better weather day and adjust the remaining city day around it.',
          'Do not add the Summer Palace, multiple museums, and a second Great Wall section unless you remove something else.',
        ],
      },
      {
        title: 'Day 1: Beijing imperial centre',
        ordered: true,
        items: [
          'Start with the Tiananmen area only after checking the current reservation, identity-document, security, access, and restricted-item rules.',
          'Enter the Palace Museum with the same passport details used for the booking. Allow several hours and follow a northbound route instead of trying to see every side hall.',
          'After the north exit, choose Jingshan for a city view when conditions and opening arrangements permit, or use the extra time for a slower nearby walk.',
          'Finish with an early dinner or a short hutong visit. Avoid crossing the city for another headline attraction after a long museum day.',
          'The Palace Museum is normally the fixed point. Its official website provides live ticket, opening-hour, map, and visitor-trail information, so recheck it shortly before the visit.',
        ],
      },
      {
        title: 'Day 2: Great Wall day trip',
        items: [
          'Choose the wall section according to transport, walking ability, crowd tolerance, season, and return-time certainty—not only photographs.',
          'Badaling has an official visitor website and established transport options; other sections may suit travellers seeking a different walking experience but can require more complex transfers.',
          'Confirm the exact gate, ticket, passport requirement, transport departure point, cable-car operation, last return, and weather before leaving Beijing.',
          'Carry water, sun or cold-weather protection, shoes with reliable grip, a charged phone, and the hotel address in Chinese.',
          'Keep the evening flexible. Delays, heat, cold, rain, wind, and walking fatigue can make a fixed night activity unrealistic.',
        ],
      },
      {
        title: 'Day 3: Temple of Heaven and local Beijing',
        ordered: true,
        items: [
          'Visit the Temple of Heaven earlier in the day and allow time for both the monumental complex and the surrounding park experience.',
          'Continue to a hutong area or a food-focused neighbourhood, using a map app and saved Chinese place names rather than relying on English-name search alone.',
          'Choose one afternoon priority: the Summer Palace for another major historic landscape, a museum for poor weather, or a slower neighbourhood walk for a less rushed trip.',
          'Keep the final evening close to the hotel when departing early the next day, and prepare the complete airport or railway-station name and terminal in advance.',
        ],
      },
      {
        title: 'Book these before the trip',
        table: {
          headers: ['Item', 'What to confirm', 'When to act'],
          rows: [
            ['Palace Museum', 'Live opening calendar, ticket release, passport details, entry gate, prohibited items', 'As soon as the official booking window opens'],
            ['Tiananmen-area access', 'Current reservation and identity rules for the exact places you plan to enter', 'Before building Day 1 around a fixed time'],
            ['Great Wall', 'Section, entrance, transport, ticket, cable car, last return, weather', 'Before departure; recheck the day before'],
            ['Hotel', 'Foreign-passport check-in, address in Chinese, nearest useful metro station', 'Before paying a non-refundable rate'],
            ['Onward train', 'Complete station, passport name, departure time, change and refund rules', 'Check and book through the official Railway 12306 service'],
          ],
        },
        items: [
          'Use the exact passport spelling consistently. A nickname, missing middle name, or wrong document number can cause avoidable booking problems.',
          'Opening hours, ticket-release procedures, closures, and security arrangements can change. Treat this page as a route framework, not a replacement for live official notices.',
        ],
      },
      {
        title: 'Where to stay for a three-day visit',
        items: [
          'Choose a hotel for daily transport rather than the lowest city-wide price. Being near a useful metro connection can save more time than staying near one attraction.',
          'Wangfujing and the central east side work well for many first-time visitors who want convenient access to the imperial core, restaurants, and transport.',
          'Qianmen can suit travellers prioritising the historic centre and Temple of Heaven, while areas farther east may suit nightlife or business-focused stays.',
          'Confirm foreign-passport check-in, late-arrival arrangements, deposit method, breakfast time, and the hotel name and address in Chinese.',
        ],
      },
      {
        title: 'Transport and daily pace',
        items: [
          'Use the metro for predictable cross-city journeys, but allow time for security, long station corridors, transfers, and choosing the correct exit.',
          'Use licensed taxis or in-app ride-hailing for awkward connections, late returns, or travellers with mobility limits. Save the destination in Chinese and verify the licence plate.',
          'Beijing attractions are large. A day with two nearby major sights can still involve substantial walking and standing.',
          'Build at least one flexible block into every day. Security queues, timed entry, traffic, weather, and meal waits can shift the schedule.',
        ],
      },
      {
        title: 'Adjust the itinerary for your trip',
        table: {
          headers: ['Situation', 'Best adjustment'],
          rows: [
            ['Only two full days', 'Keep the imperial centre and Great Wall; remove Day 3 rather than compressing all three'],
            ['Four full days', 'Add the Summer Palace, a deeper museum visit, or a slower neighbourhood day'],
            ['Poor Great Wall weather', 'Swap Days 2 and 3 when reservations permit; never ignore closure or safety notices'],
            ['Travelling with children', 'Shorten museum time, protect meal breaks, and choose a manageable Great Wall route'],
            ['Limited mobility', 'Reduce daily stops, verify step-free access, and budget for more point-to-point transport'],
            ['Monday or closure conflict', 'Check live calendars first and rebuild the sequence around closed attractions'],
          ],
        },
        items: [
          'If Beijing is part of a longer China trip, connect it with the 7-day, 10-day, or 14-day itinerary rather than planning each city independently.',
          'For a Beijing–Shanghai route, compare an open-jaw flight plan with the live Railway 12306 schedule and the complete station locations.',
        ],
      },
    ],
    faqs: [
      ['Are three days enough for Beijing?', 'Three full days are enough for a focused first visit: one imperial-centre day, one Great Wall day, and one Temple of Heaven plus hutong or flexible-sight day. Three hotel nights with a late arrival and early departure are not the same as three full days.'],
      ['Which Great Wall section is best for a first visit?', 'Choose according to transport, walking ability, season, crowd tolerance, and live operations. Badaling has established visitor infrastructure and an official website; other sections can offer a different experience but may need more planning.'],
      ['Do I need to book the Palace Museum in advance?', 'Plan on using the official reservation process and matching the booking to your passport. Check the Palace Museum website for the live ticket window, opening calendar, entry process, and current visitor rules.'],
      ['Can I visit the Forbidden City and Great Wall on the same day?', 'It is not a good first-trip plan. Both need meaningful time, and combining them creates a fragile schedule with transport, security, ticket, weather, and walking risks.'],
      ['Where should a first-time visitor stay in Beijing?', 'A central area near a useful metro connection is usually the safest choice. Wangfujing, the central east side, and Qianmen can work, but check the exact hotel location, passport check-in, and daily routes before booking.'],
      ['How should I get around Beijing?', 'Combine the metro for predictable cross-city journeys with licensed taxis or app-based rides for awkward connections. Save Chinese addresses, allow for security and long station walks, and verify the car before entering.'],
      ['Can ChinaEase Buddy personalise this Beijing itinerary?', 'Yes. Share your dates, arrival and departure points, group, interests, walking ability, hotel, budget, and fixed bookings to receive a route adapted to the actual trip.'],
    ],
    sourceLinks: [
      ['The Palace Museum official international website', 'https://intl.dpm.org.cn/index.html'],
      ['Palace Museum official ticket service', 'https://bookingticket.dpm.org.cn/'],
      ['Badaling Great Wall official website', 'https://www.badaling.cn/website/pc/index.html'],
      ['Beijing Municipal Government English website', 'https://english.beijing.gov.cn/'],
      ['China Railway 12306 English website', 'https://www.12306.cn/en/index.html'],
    ],
  },
  '3-day-shanghai-itinerary': {
    title: '3-Day Shanghai Itinerary for First-Time Visitors (2026)',
    heading: '3-Day Shanghai Itinerary for First-Time Visitors (2026)',
    description: 'Plan three days in Shanghai with the Bund, Yuyuan Garden, Wukang Road, Pudong, museums, hotel areas, transport, food, costs, and alternatives.',
    quickAnswer: 'With three full days in Shanghai, group the old-city sights and the Bund on Day 1, walk the former French Concession and central neighbourhoods on Day 2, then use Day 3 for Pudong plus a museum, riverfront, or carefully chosen day trip. Shanghai is compact compared with Beijing, but transfers, queues, heat, rain, and large museums can still make an overfilled plan tiring. Check live opening hours and reservation rules, save every destination in Chinese, and keep one indoor alternative for poor weather.',
    lastReviewed: 'September 21, 2026',
    lastModified: '2026-09-21',
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
      {
        title: 'Day 1: Yuyuan Garden, old Shanghai, and the Bund',
        ordered: true,
        items: [
          'Start in the Yuyuan Garden and City God Temple area after checking the garden\'s live opening, ticket, and entry arrangements. Go earlier if you prefer quieter lanes.',
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
          'Add one nearby museum, riverside walk, or indoor attraction instead of moving repeatedly between both sides of the Huangpu River.',
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
      ['Are three days enough for Shanghai?', 'Yes. Three full days are enough for the Bund and old city, central historic neighbourhoods, and Pudong or a major museum. Three hotel nights with a late arrival and early departure are not the same as three full sightseeing days.'],
      ['What should I not miss on a first Shanghai trip?', 'Prioritise the Bund, one old-city or traditional sight such as Yuyuan Garden, one historic neighbourhood walk, and the Pudong skyline contrast. Add museums, food, shopping, or nightlife according to your interests.'],
      ['Should I stay near the Bund or in the former French Concession?', 'Stay near the Bund or People\'s Square for classic sights and central connections; choose the former French Concession area for neighbourhood walks and cafés. The exact hotel-to-metro distance and passport check-in matter more than the label.'],
      ['Can I visit Suzhou or Hangzhou during a three-day Shanghai trip?', 'You can, but it replaces a Shanghai day. For a first visit, add a fourth day if Suzhou or Hangzhou is important rather than compressing the Bund, neighbourhoods, Pudong, and a regional excursion.'],
      ['Which Shanghai airport is closer to the city?', 'Hongqiao is generally closer to central Shanghai, while Pudong handles many international flights. Always plan from the actual airport, terminal, arrival time, hotel, and live transport options.'],
      ['How should I get around Shanghai?', 'Use the metro for predictable cross-city journeys, walk within compact neighbourhood clusters, and use licensed taxis or app-based rides for awkward connections. Save Chinese addresses and verify the vehicle before entering.'],
      ['Can ChinaEase Buddy personalise this Shanghai itinerary?', 'Yes. Share your dates, flights or trains, hotel, group, interests, walking ability, budget, and fixed bookings to receive a route adapted to the real trip.'],
    ],
    sourceLinks: [
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
  'best-time-to-visit-china': {
    title: 'Best Time to Visit China: Month-by-Month Guide (2026)',
    heading: 'Best Time to Visit China: Weather and Crowds by Month (2026)',
    description:
      'Choose the best time to visit China in 2026. Compare months, seasons, regions, weather risks, crowds, public holidays, prices, and route ideas.',
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
  'china-visa-free-travel-guide': ['Get my free China itinerary', '/#trip-plan'],
  'china-airport-arrival-guide': ['Get my free China itinerary', '/#trip-plan'],
  'china-hotels-for-foreigners': ['Get my free China itinerary', '/#trip-plan'],
  'china-food-ordering-guide': ['Get my free China itinerary', '/#trip-plan'],
  'chinese-travel-phrases': ['Open the free phrase tools', '/?journey=china'],
  'china-travel-safety-guide': ['Get my free China itinerary', '/#trip-plan'],
  'china-travel-budget': ['Get my free China itinerary', '/#trip-plan'],
  'amap-in-english': ['Get my free China itinerary', '/#trip-plan'],
  'china-metro-guide': ['Get my free China itinerary', '/#trip-plan'],
  'didi-in-china-for-foreigners': ['Get my free China itinerary', '/#trip-plan'],
  'china-train-travel-guide': ['Get my free China itinerary', '/#trip-plan'],
  '7-day-china-itinerary': ['Get my personalised 7-day itinerary', '/#trip-plan'],
  '10-day-china-itinerary': ['Get my personalised 10-day itinerary', '/#trip-plan'],
  '14-day-china-itinerary': ['Get my personalised 14-day itinerary', '/#trip-plan'],
  'beijing-vs-shanghai': ['Get my personalised China itinerary', '/#trip-plan'],
  '3-day-beijing-itinerary': ['Get my personalised Beijing itinerary', '/#trip-plan'],
  '3-day-shanghai-itinerary': ['Get my personalised Shanghai itinerary', '/#trip-plan'],
  '3-day-xian-itinerary': ['Get my personalised Xi\'an itinerary', '/#trip-plan'],
  'best-time-to-visit-china': ['Get my itinerary for the right season', '/#trip-plan'],
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
  ['China visa-free travel guide', '/china-visa-free-travel-guide/'],
  ['China airport arrival guide', '/china-airport-arrival-guide/'],
  ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
  ['How to order food in China', '/china-food-ordering-guide/'],
  ['Essential Chinese travel phrases', '/chinese-travel-phrases/'],
  ['China travel safety guide', '/china-travel-safety-guide/'],
  ['China travel budget', '/china-travel-budget/'],
  ['China travel apps', '/china-travel-apps/'],
  ['AMap in English', '/amap-in-english/'],
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
  ['Best time to visit China', '/best-time-to-visit-china/'],
  ['WeChat Pay for foreigners', '/wechat-pay-for-foreigners/'],
  ['China payment guide', '/china-payment-guide/'],
  ['China travel checklist', '/china-travel-checklist/'],
  ['China emergency numbers', '/china-emergency-numbers/'],
  ['FAQ', '/faq/'],
];

const pageRelatedLinks = {
  'china-visa-free-travel-guide': [
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
    ['AMap in English', '/amap-in-english/'],
    ['China metro guide', '/china-metro-guide/'],
    ['DiDi in China for foreigners', '/didi-in-china-for-foreigners/'],
    ['China train travel guide', '/china-train-travel-guide/'],
    ['China eSIM & internet guide', '/china-esim-internet-guide/'],
    ['Alipay for foreigners', '/alipay-for-foreigners/'],
    ['China payment guide', '/china-payment-guide/'],
    ['How to order food in China', '/china-food-ordering-guide/'],
    ['Essential Chinese travel phrases', '/chinese-travel-phrases/'],
    ['China travel safety guide', '/china-travel-safety-guide/'],
    ['China travel budget', '/china-travel-budget/'],
    ['China travel checklist', '/china-travel-checklist/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'didi-in-china-for-foreigners': [
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
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
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
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
  '7-day-china-itinerary': [
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
  'best-time-to-visit-china': [
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
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['Apps to download before China', '/china-travel-apps/'],
    ['China travel checklist', '/china-travel-checklist/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'china-airport-arrival-guide': [
    ['China visa-free travel guide', '/china-visa-free-travel-guide/'],
    ['China hotels for foreigners', '/china-hotels-for-foreigners/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['China eSIM & internet guide', '/china-esim-internet-guide/'],
    ['China payment guide', '/china-payment-guide/'],
    ['China metro guide', '/china-metro-guide/'],
    ['DiDi in China for foreigners', '/didi-in-china-for-foreigners/'],
    ['China travel apps', '/china-travel-apps/'],
    ['Get a free China itinerary', '/#trip-plan'],
  ],
  'china-hotels-for-foreigners': [
    ['China visa-free travel guide', '/china-visa-free-travel-guide/'],
    ['China airport arrival guide', '/china-airport-arrival-guide/'],
    ['First trip to China', '/first-trip-to-china/'],
    ['China eSIM & internet guide', '/china-esim-internet-guide/'],
    ['China travel apps', '/china-travel-apps/'],
    ['China payment guide', '/china-payment-guide/'],
    ['China metro guide', '/china-metro-guide/'],
    ['DiDi in China for foreigners', '/didi-in-china-for-foreigners/'],
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
    ['Open payment phrases', '/?journey=china&tool=pay'],
    ['Alipay for Foreigners', '/alipay-for-foreigners/'],
    ['WeChat Pay for Foreigners', '/wechat-pay-for-foreigners/'],
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
    ['AMap in English', '/amap-in-english/'],
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

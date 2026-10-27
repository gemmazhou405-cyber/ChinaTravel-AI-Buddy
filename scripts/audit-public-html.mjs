import { readFileSync } from 'node:fs';

const transitAnswers = JSON.parse(readFileSync(new URL('../src/data/transitAnswers.json', import.meta.url), 'utf8'));

const ORIGIN = 'https://chinaeasebuddy.com';
const REQUEST_ORIGIN = process.env.AUDIT_ORIGIN || ORIGIN;

const pages = [
  {
    path: '/china-240-hour-transit-calculator/',
    h1: /China 240-Hour Visa-Free Transit Calculator/i,
    keywords: [transitAnswers.clockInputCopy.firstStep, 'China Standard Time', '240-hour TWOV expiry examples'],
    forbiddenPhrases: ['Enter the scheduled local arrival date and time'],
    links: ["/guides/", "/china-240-hour-visa-free-transit-2026/", "/china-visa-free-checker/", "/china-online-arrival-card-2026/", "/china-airport-arrival-guide/", "/nia-12367-online-accommodation-registration-guide/", "/first-trip-to-china/", "/china-travel-checklist/"],
  },
  {
    path: '/',
    h1: /Plan your first China trip with local help/i,
    keywords: ['ChinaEase Buddy', 'Travel Passes', 'itinerary', 'Free tools for planning your China trip'],
    links: ['/guides/', '/pricing/', '/china-visa-free-checker/', '/china-240-hour-visa-free-transit-2026/', '/nia-12367-online-accommodation-registration-guide/', '/tenpaygo-for-tourists/'],
  },
  {
    path: '/guides/',
    h1: /China Travel Guides/i,
    keywords: ['Entry rules and arrival', 'Payments and daily essentials', 'Transport and navigation', 'Routes, timing and itineraries', 'China Visa-Free Travel Guide', 'China Airport Arrival Guide', 'China Food Ordering Guide', 'China Travel Apps', 'DiDi in China for Foreigners', 'China Train Travel Guide', '7-Day China Itinerary', '10-Day China Itinerary', '14-Day China Itinerary', '3-Day Dali Itinerary', 'China Golden Week 2026 Travel Guide'],
    links: ["/china-visa-free-checker/", "/china-visa-free-travel-guide/", "/china-240-hour-visa-free-transit-2026/", "/china-airport-arrival-guide/", "/beijing-airport-to-city-guide/", "/nia-12367-online-accommodation-registration-guide/", "/china-hotels-for-foreigners/", "/china-food-ordering-guide/", "/china-travel-safety-guide/", "/china-travel-apps/", "/china-esim-internet-guide/", "/amap-english-mode-guide-2026/", "/china-metro-guide/", "/didi-in-china-for-foreigners/", "/china-train-travel-guide/", "/china-itinerary-first-time-7-10-14-days/", "/7-day-china-itinerary/", "/10-day-china-itinerary/", "/14-day-china-itinerary/", "/3-day-dali-itinerary/", "/china-golden-week-2026-travel-guide/", "/faq/", "/china-travel-budget/", "/china-travel-checklist/", "/best-time-to-visit-china/", "/first-trip-to-china/"],
  },
  {
    path: '/didi-payment-for-foreigners/',
    h1: /DiDi Pay for Foreigners.*How to Pay for DiDi in China/i,
    keywords: ['foreign bank card', 'Alipay', 'WeChat Pay', '¥200', 'pending authorization', 'backup'],
    forbiddenPhrases: ['real-device test', 'Payment problem now', 'tested', "don't plan on cash", "doesn't name the card networks"],
    links: ["/didi-in-china-for-foreigners/", "/amap-english-mode-guide-2026/#taxi", "/alipay-for-foreigners/", "/china-payment-guide/", "/wechat-pay-for-foreigners/", "/tenpaygo-for-tourists/", "/alipay-metro-qr-transport-code-guide/", "/first-trip-to-china/"],
  },
  {
    path: '/beijing-airport-to-city-guide/',
    h1: /Beijing Airport to City Centre.*PEK vs PKX.*2026/i,
    keywords: ['PEK', 'PKX', 'Caoqiao', 'Dongzhimen'],
    links: ["/china-airport-arrival-guide/", "/#trip-plan", "/china-train-travel-guide/", "/china-metro-guide/", "/didi-in-china-for-foreigners/", "/great-wall-of-china-day-trip-from-beijing/", "/first-trip-to-china/"],
  },
  {
    path: '/amap-vs-google-maps-china/',
    h1: /AMap vs Google Maps in China.*2026/i,
    keywords: ['Google Maps', 'VPN', 'No route found', '5.7 km', 'Canton Tower', 'Ruixing Coffee', 'Before you fly'],
    links: ["/amap-english-mode-guide-2026/", "/china-travel-apps/", "/#trip-plan", "/didi-in-china-for-foreigners/", "/china-esim-internet-guide/", "/china-metro-guide/", "/first-trip-to-china/"],
  },
  {
    path: '/china-payment-guide/',
    h1: /How to Pay in China as a Foreigner/i,
    keywords: ['Alipay', 'WeChat Pay', 'foreign card', 'payment fails'],
    links: ["/alipay-for-foreigners/", "/wechat-pay-for-foreigners/", "/didi-payment-for-foreigners/", "/tenpaygo-for-tourists/", "/alipay-metro-qr-transport-code-guide/", "/china-travel-budget/", "/first-trip-to-china/"],
  },
  {
    path: '/china-visa-free-travel-guide/',
    h1: /China Visa-Free Travel Guide for Tourists.*2026/i,
    keywords: ['Ordinary visa-free entry', '240-hour visa-free transit', 'third country or region', 'approved port', 'confirmed onward', 'border inspection'],
    links: ["/#trip-plan", "/china-240-hour-visa-free-transit-2026/", "/china-airport-arrival-guide/", "/first-trip-to-china/", "/china-travel-checklist/", "/china-240-hour-transit-calculator/", "/china-visa-free-checker/", "/china-online-arrival-card-2026/", "/nia-12367-online-accommodation-registration-guide/"],
  },
  {
    path: '/china-airport-arrival-guide/',
    h1: /China Airport Arrival: From Immigration to Your Hotel/i,
    keywords: ['arrival card', 'fingerprints', '¥20,000', 'green channel', 'ride-hailing pickup area', 'Last reviewed'],
    links: ["/china-online-arrival-card-2026/", "/china-240-hour-visa-free-transit-2026/", "/china-esim-internet-guide/", "/alipay-metro-qr-transport-code-guide/", "/didi-in-china-for-foreigners/", "/tenpaygo-for-tourists/", "/beijing-airport-to-city-guide/", "/first-trip-to-china/"],
  },
  {
    path: '/china-hotels-for-foreigners/',
    h1: /Can Foreigners Stay in Any Hotel in China.*2026 Guide/i,
    keywords: ['foreign passport', 'foreign-related qualification', 'Which hotels in China accept foreigners', 'accommodation registration', 'late arrival', 'deposit', '24 hours', 'Guests Accepted', '外宾适用', 'Do I need my passport number to book a hotel in China?'],
    links: ["/#trip-plan", "/china-airport-arrival-guide/", "/first-trip-to-china/", "/china-payment-guide/", "/nia-12367-online-accommodation-registration-guide/", "/china-esim-internet-guide/", "/china-travel-checklist/", "/china-travel-apps/"],
  },
  {
    path: '/china-food-ordering-guide/',
    h1: /How to Order Food in China.*Menu and Allergy Guide.*2026/i,
    keywords: ['QR menu', 'photo menu', 'food allergy', 'cross-contamination', 'steaming hot', '120', 'white rice'],
    links: ["/#trip-plan", "/first-trip-to-china/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-budget/", "/china-travel-checklist/", "/best-time-to-visit-china/", "/7-day-china-itinerary/", "/10-day-china-itinerary/", "/14-day-china-itinerary/"],
  },
  {
    path: '/chinese-travel-phrases/',
    h1: /Essential Chinese Phrases for Travel in China.*2026/i,
    keywords: ['nǐ hǎo', 'Please take me to this address', 'Alipay', 'platform', 'Wi-Fi', '110 police', '120 ambulance', 'pinyin'],
    links: ["/?journey=china", "/first-trip-to-china/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-budget/", "/china-travel-checklist/", "/best-time-to-visit-china/", "/7-day-china-itinerary/", "/10-day-china-itinerary/", "/14-day-china-itinerary/"],
  },
  {
    path: '/china-travel-safety-guide/',
    h1: /Is It Safe to Travel to China.*2026/i,
    keywords: ['Level 2', 'September 4, 2026', 'Smart Traveler Enrollment Program', 'tea-house', 'unmarked', 'original passport', 'tap water', 'Typhoons', '110', '120', '119'],
    links: ["/#trip-plan", "/china-emergency-numbers/", "/china-hotels-for-foreigners/", "/china-payment-guide/", "/china-airport-arrival-guide/", "/first-trip-to-china/", "/china-esim-internet-guide/", "/china-travel-checklist/"],
  },
  {
    path: '/china-travel-budget/',
    h1: /How Much Does a Trip to China Cost.*2026 Budget Guide/i,
    keywords: ['RMB 350', 'RMB 800', 'RMB 1,800', 'international flights', '12306', 'peak', 'solo travelers', 'China trip cost calculator: 7, 10 and 14-day estimates', 'Per person for 10 days', 'All 1 traveler for 10 days', 'RMB 2,450–4,550', 'RMB 25,200–42,000+', 'Real prices I checked in October 2026', '¥553–667', '¥6.72 to the US dollar'],
    checkLocalAnchors: true,
    links: ["#cost-estimator", "#real-prices", "/#trip-plan", "/7-day-china-itinerary/", "/10-day-china-itinerary/", "/14-day-china-itinerary/", "/best-time-to-visit-china/", "/first-trip-to-china/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-checklist/"],
  },
  {
    path: '/china-travel-apps/',
    h1: /Essential China Travel Apps to Set Up Before Arrival/i,
    keywords: ['Alipay', 'WeChat', 'TenPayGo', 'Amap', 'DiDi', 'Trip.com', '12306', 'offline translation app'],
    // The site's own web tool is no longer listed as a China app.
    forbiddenPhrases: ['ChinaEase Buddy: a web-based toolkit'],
    links: ["/#trip-plan", "/amap-english-mode-guide-2026/", "/china-metro-guide/", "/didi-in-china-for-foreigners/", "/china-esim-internet-guide/", "/amap-vs-google-maps-china/", "/first-trip-to-china/"],
  },
  {
    path: '/amap-english-mode-guide-2026/',
    h1: /How to Use Amap in English: Switch the Language, Book a Taxi, Ride the Metro/i,
    keywords: ['AMap Global', 'English grayed out', 'Discount Express', 'get-off reminder', 'Menu Translation', 'LOCAL NOTE', 'Phrases to show drivers and staff'],
    links: ["/amap-vs-google-maps-china/", "/china-esim-internet-guide/", "/china-metro-guide/", "/didi-in-china-for-foreigners/", "/alipay-for-foreigners/", "/china-food-ordering-guide/", "/china-airport-arrival-guide/"],
  },
  {
    path: '/alipay-metro-qr-transport-code-guide/',
    h1: /How to Pay for the Metro in China: Alipay Ride Code or Tap Your Card/i,
    keywords: ['Tap your bank card at the gate', 'Suburban Line S2', 'Tap to Ride', 'October 12, 2025', 'June 30, 2026', 'Ride code vs payment code', 'single-journey ticket'],
    links: ["/alipay-for-foreigners/", "/china-metro-guide/", "/amap-english-mode-guide-2026/#metro", "/amap-english-mode-guide-2026/", "/china-payment-guide/", "/first-trip-to-china/"],
  },
  {
    path: '/china-metro-guide/',
    h1: /China Metro Guide for Foreigners.*2026/i,
    keywords: ['single-journey ticket', 'overseas bank card', 'security', 'transfer', 'station exit', 'last train'],
    links: ["/#trip-plan", "/china-airport-arrival-guide/", "/first-trip-to-china/", "/didi-in-china-for-foreigners/", "/china-train-travel-guide/", "/beijing-airport-to-city-guide/", "/great-wall-of-china-day-trip-from-beijing/"],
  },
  {
    path: '/didi-in-china-for-foreigners/',
    h1: /How to Use DiDi in China as a Foreigner/i,
    keywords: ['global mobile number login', 'Upfront Fare', 'pickup point', 'last digits', 'Safety Hotline', 'lost item'],
    links: ["/didi-payment-for-foreigners/", "/amap-english-mode-guide-2026/#taxi", "/alipay-for-foreigners/", "/china-airport-arrival-guide/", "/beijing-airport-to-city-guide/", "/china-train-travel-guide/", "/china-metro-guide/", "/first-trip-to-china/"],
  },
  {
    path: '/china-train-travel-guide/',
    h1: /How to Book China High-Speed Trains Without Chinese ID/i,
    keywords: ['12306', 'email address', '15 days before departure', 'Change fees', 'Refund fees', 'child ticket'],
    // The merged 12306 page's headline must not come back here.
    forbiddenPhrases: ['350 km/h'],
    links: ["/didi-in-china-for-foreigners/", "/amap-english-mode-guide-2026/#metro", "/china-metro-guide/", "/alipay-metro-qr-transport-code-guide/", "/china-airport-arrival-guide/", "/beijing-airport-to-city-guide/", "/great-wall-of-china-day-trip-from-beijing/", "/first-trip-to-china/"],
  },
  {
    path: '/china-itinerary-first-time-7-10-14-days/',
    h1: /China Itinerary for First-Time Visitors.*7.*10.*14 Days/i,
    keywords: ['Quick Picker', 'Golden Triangle', 'Culture Plus Nature', 'Pandas and Mountains', 'Train or Flight?'],
    links: ["/7-day-china-itinerary/", "/10-day-china-itinerary/", "/14-day-china-itinerary/", "/first-trip-to-china/", "/china-travel-budget/", "/china-travel-checklist/", "/best-time-to-visit-china/"],
    checkLocalAnchors: true,
  },
  {
    path: '/7-day-china-itinerary/',
    h1: /7-Day China Itinerary for First-Time Visitors.*2026/i,
    keywords: ['open-jaw', 'Beijing', 'Xi\'an', 'Shanghai', 'Palace Museum', 'Terracotta Warriors', 'RMB 350', '12306', '7 days in China means 6 hotel nights', 'Recommended 7-day China itinerary: Beijing and Shanghai', 'No hotel night included', 'Day 4 is an intercity travel day', 'normally closes on Mondays'],
    forbiddenPhrases: ['three nights in Beijing, two in Xi\'an, and two in Shanghai'],
    links: ["/3-day-beijing-itinerary/", "/3-day-shanghai-itinerary/", "/china-travel-budget/#cost-estimator", "/china-train-travel-guide/", "https://young.dpm.org.cn/en/category/279", "/#trip-plan", "/china-itinerary-first-time-7-10-14-days/", "/10-day-china-itinerary/", "/14-day-china-itinerary/", "/best-time-to-visit-china/", "/china-travel-budget/", "/china-payment-guide/", "/first-trip-to-china/", "/china-travel-checklist/"],
  },
  {
    path: '/10-day-china-itinerary/',
    h1: /10-Day China Itinerary for First-Time Visitors/i,
    keywords: ['Beijing', 'Xi\'an', 'Shanghai', 'Palace Museum', 'Terracotta Warriors', 'high-speed train', '10 days in China: 9 hotel nights and 2 transfer days', 'No hotel night included', 'Day 7 is the Shanghai transfer', 'six main full sightseeing days'],
    forbiddenPhrases: ['three nights in Xi\'an for the Terracotta Warriors and Tang-era culture'],
    links: ["/3-day-beijing-itinerary/", "/3-day-xian-itinerary/", "/3-day-shanghai-itinerary/", "/china-train-travel-guide/", "/china-travel-budget/#cost-estimator", "/#trip-plan", "/china-itinerary-first-time-7-10-14-days/", "/first-trip-to-china/", "/7-day-china-itinerary/", "/14-day-china-itinerary/", "/best-time-to-visit-china/", "/china-travel-budget/", "/china-travel-checklist/"],
  },
  {
    path: '/14-day-china-itinerary/',
    h1: /14-Day China Itinerary for First-Time Visitors.*2026/i,
    keywords: ['two-week', 'Beijing', 'Xi\'an', 'Chengdu', 'Shanghai', 'Guilin', 'Panda Base', 'RMB 6,500', '12306'],
    links: ["/china-travel-budget/#cost-estimator", "/#trip-plan", "/china-itinerary-first-time-7-10-14-days/", "/7-day-china-itinerary/", "/10-day-china-itinerary/", "/best-time-to-visit-china/", "/china-travel-budget/", "/first-trip-to-china/", "/china-travel-checklist/"],
  },
  {
    path: '/beijing-vs-shanghai/',
    h1: /Beijing vs Shanghai.*Which City Should You Visit First.*2026/i,
    keywords: ['imperial history', 'Great Wall', 'The Bund', '3–5 full days', '2–4 full days', 'open-jaw', '12306', 'Suzhou', 'Hangzhou'],
    links: ["/#trip-plan", "/7-day-china-itinerary/", "/10-day-china-itinerary/", "/14-day-china-itinerary/", "/best-time-to-visit-china/", "/china-travel-budget/", "/first-trip-to-china/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-checklist/"],
  },
  {
    path: '/3-day-beijing-itinerary/',
    h1: /3-Day Beijing Itinerary for First-Time Visitors.*2026/i,
    keywords: ['Palace Museum', 'Great Wall', 'Temple of Heaven', 'Tiananmen', 'Wangfujing', 'Qianmen', 'Railway 12306', 'If your three days include a Monday', '20:00 China time', 'seven days ahead', 'separately charged attractions', 'Wumen', 'Dashilan'],
    links: ["/beijing-airport-to-city-guide/", "/great-wall-of-china-day-trip-from-beijing/", "/china-travel-budget/#cost-estimator", "/#trip-plan", "/3-day-shanghai-itinerary/", "/best-time-to-visit-china/", "/china-hotels-for-foreigners/", "/first-trip-to-china/", "/3-day-xian-itinerary/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-budget/", "/china-train-travel-guide/"],
  },
  {
    path: '/3-day-shanghai-itinerary/',
    h1: /3-Day Shanghai Itinerary for First-Time Visitors.*2026/i,
    keywords: ['The Bund', 'Yuyuan Garden', 'Wukang Road', 'Pudong', 'People\'s Square', 'Hongqiao', 'Railway 12306', 'A Monday–Wednesday Shanghai itinerary alternative', 'Shanghai Museum East vs People\'s Square: choose the right venue', 'July 9, 2026 to November 14, 2027', 'Tuesday, except national holidays'],
    links: ["https://www.yugarden.com.cn/page/articleview/message.html", "https://www.shanghaimuseum.net/mu/frontend/pg/en/service/visit-east", "https://www.shanghaimuseum.net/mu/frontend/pg/en/service/visit-west", "/#trip-plan", "/3-day-suzhou-itinerary/", "/3-day-beijing-itinerary/", "/best-time-to-visit-china/", "/china-hotels-for-foreigners/", "/first-trip-to-china/", "/3-day-suzhou-itinerary/", "/3-day-hangzhou-itinerary/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-budget/", "/china-train-travel-guide/"],
  },
  {
    path: '/3-day-xian-itinerary/',
    h1: /3-Day Xi'an Itinerary for First-Time Visitors.*2026/i,
    keywords: ['Terracotta Army', 'city wall', 'Muslim Quarter', 'Shaanxi History Museum', 'Big Wild Goose Pagoda', 'Xi\'an North', 'Railway 12306'],
    links: ["/#trip-plan", "/3-day-beijing-itinerary/", "/3-day-shanghai-itinerary/", "/best-time-to-visit-china/", "/china-hotels-for-foreigners/", "/first-trip-to-china/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-budget/", "/china-train-travel-guide/"],
  },
  {
    path: '/3-day-chongqing-itinerary/',
    h1: /3-Day Chongqing Itinerary for First-Time Visitors.*2026/i,
    keywords: ['Hongya Cave', 'Liziba', 'Three Gorges Museum', 'Jiefangbei', 'Ciqikou', 'Dazu Rock Carvings', 'Railway 12306', 'Three Gorges Museum: entry rules and a Monday alternative', 'Monday, except national statutory holidays', 'November 3, 2025', 'Sunday–Tuesday', 'Zengjiayan', '236 Renmin Road'],
    links: ["https://whlyw.cq.gov.cn/zwxx_221/bmdt/tzgg/202511/t20251103_15136009.html", "https://www.cq.gov.cn/zjcq/cycq/jplyxl/dsy/dsjp/202608/t20260826_15982331.html", "https://english.cq.gov.cn/specials/explore/PhotoPerfectSpots/202608/t20260810_15912642.html", "/#trip-plan", "/3-day-xian-itinerary/", "/3-day-beijing-itinerary/", "/best-time-to-visit-china/", "/china-metro-guide/", "/china-hotels-for-foreigners/", "/first-trip-to-china/", "/3-day-chengdu-itinerary/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-budget/", "/china-train-travel-guide/"],
  },
  {
    path: '/3-day-chengdu-itinerary/',
    h1: /3-Day Chengdu Itinerary for First-Time Visitors.*2026/i,
    keywords: ['Panda Base', 'People\'s Park', 'Sichuan food', 'Leshan', 'Sanxingdui', 'Tianfu International Airport', 'Railway 12306'],
    links: ["/#trip-plan", "/3-day-chongqing-itinerary/", "/best-time-to-visit-china/", "/china-hotels-for-foreigners/", "/first-trip-to-china/", "/chengdu-panda-base-guide/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-budget/", "/china-train-travel-guide/"],
  },
  {
    path: '/3-day-guilin-yangshuo-itinerary/',
    h1: /3-Day Guilin and Yangshuo Itinerary.*2026/i,
    keywords: ['Li River', 'Yulong River', 'Xingping', 'Longji', 'Yangshuo railway station', 'Guilin West', 'Railway 12306'],
    links: ["/#trip-plan", "/10-day-china-itinerary/", "/14-day-china-itinerary/", "/best-time-to-visit-china/", "/china-hotels-for-foreigners/", "/first-trip-to-china/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-budget/", "/china-train-travel-guide/"],
  },
  {
    path: '/3-day-zhangjiajie-itinerary/',
    h1: /3-Day Zhangjiajie Itinerary for First-Time Visitors.*2026/i,
    keywords: ['Wulingyuan', 'Zhangjiajie National Forest Park', 'Tianmen Mountain', 'Yuanjiajie', 'Tianzi Mountain', 'Zhangjiajie West', 'Railway 12306', 'Tianmen Mountain cable car closure: October 2026 route update', 'Tianmen Cave Express Cableway', 'October 13', 'Route sources checked October 22, 2026'],
    links: ["https://hunan.voc.com.cn/news/202610/33962893.html", "https://feng.ifeng.com/c/8x6kU0WWUpE", "/#trip-plan", "/10-day-china-itinerary/", "/14-day-china-itinerary/", "/best-time-to-visit-china/", "/china-hotels-for-foreigners/", "/first-trip-to-china/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-budget/", "/china-train-travel-guide/"],
  },
  {
    path: '/3-day-shenzhen-itinerary/',
    h1: /3-Day Shenzhen Itinerary for First-Time Visitors.*2026/i,
    keywords: ['Shenzhen Museum', 'Lianhuashan Park', 'OCT-LOFT', 'Nantou Ancient Town', 'Shenzhen Bay', 'Dapeng', 'Huaqiangbei', 'Line 11', 'Railway 12306'],
    links: ["/#trip-plan", "/3-day-shanghai-itinerary/", "/china-hotels-for-foreigners/", "/first-trip-to-china/", "/3-day-guangzhou-itinerary/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-budget/", "/china-train-travel-guide/", "/best-time-to-visit-china/"],
  },
  {
    path: '/3-day-guangzhou-itinerary/',
    h1: /3-Day Guangzhou Itinerary for First-Time Visitors.*2026/i,
    keywords: ['Chen Clan Ancestral Hall', 'Yongqingfang', 'Shamian Island', 'Canton Tower', 'Pearl River', 'dim sum', 'Baiyun International Airport', 'Guangzhou South', 'Railway 12306'],
    links: ["/#trip-plan", "/3-day-shenzhen-itinerary/", "/china-hotels-for-foreigners/", "/best-time-to-visit-china/", "/first-trip-to-china/", "/3-day-shanghai-itinerary/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-budget/", "/china-train-travel-guide/"],
  },
  {
    path: '/3-day-hangzhou-itinerary/',
    h1: /3-Day Hangzhou Itinerary for First-Time Visitors.*2026/i,
    keywords: ['West Lake', 'Lingyin', 'Feilai Peak', 'Longjing', 'Grand Canal', 'Hefang Street', 'Xixi Wetland', 'Hangzhou East', 'Railway 12306'],
    links: ["/#trip-plan", "/3-day-suzhou-itinerary/", "/3-day-shanghai-itinerary/", "/china-hotels-for-foreigners/", "/best-time-to-visit-china/", "/first-trip-to-china/", "/3-day-suzhou-itinerary/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-budget/", "/china-train-travel-guide/"],
  },
  {
    path: '/3-day-suzhou-itinerary/',
    h1: /3-Day Suzhou Itinerary for First-Time Visitors.*2026/i,
    keywords: ["Humble Administrator's Garden", 'Pingjiang Road', 'Lingering Garden', 'Suzhou Museum', 'Suzhou North', '12306', '¥80 / ¥70', '苏州园林旅游', 'Suzhou Museum West', 'closed Mondays'],
    // The page now gives the official prices and hours.
    forbiddenPhrases: ['Avoid quoting an old ticket price'],
    links: ["/#trip-plan", "/china-payment-guide/", "/china-hotels-for-foreigners/#check-before-booking", "/3-day-nanjing-itinerary/", "/3-day-shanghai-itinerary/", "/3-day-hangzhou-itinerary/", "/china-hotels-for-foreigners/", "/first-trip-to-china/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-budget/", "/china-train-travel-guide/", "/best-time-to-visit-china/"],
  },
  {
    path: '/3-day-nanjing-itinerary/',
    h1: /3-Day Nanjing Itinerary for First-Time Visitors.*2026/i,
    keywords: ['Sun Yat-sen Mausoleum', 'Ming Xiaoling', 'Nanjing Museum', 'Nanjing Massacre Memorial Hall', 'Qinhuai River', 'Nanjing South', '12306', 'Nanjing Museum and the Memorial Hall: separate reservations', 'service centre green-channel window', 'A Monday–Wednesday Nanjing itinerary alternative', 'Yunjin Road', 'Daxinggong'],
    links: ["https://www.njmuseum.com/zh/visitIndex", "https://www.19371213.com.cn/guide/how/", "https://www.19371213.com.cn/information/notices/202610/t20261008_5921665.html", "/#trip-plan", "/3-day-suzhou-itinerary/", "/3-day-shanghai-itinerary/", "/3-day-suzhou-itinerary/", "/china-hotels-for-foreigners/", "/first-trip-to-china/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-budget/", "/china-train-travel-guide/", "/best-time-to-visit-china/"],
  },
  {
    path: '/3-day-dali-itinerary/',
    h1: /3-Day Dali Itinerary for First-Time Visitors.*2026/i,
    keywords: ['Dali Old Town', 'Three Pagodas', 'Erhai', 'Xizhou', 'Cangshan', 'Xiaguan', '12306'],
    links: ["/#trip-plan", "/14-day-china-itinerary/", "/china-hotels-for-foreigners/", "/best-time-to-visit-china/", "/first-trip-to-china/", "/10-day-china-itinerary/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-budget/", "/china-train-travel-guide/"],
  },
  {
    path: '/china-golden-week-2026-travel-guide/',
    h1: /China Golden Week 2026.*October 1.*7 Dates.*Travel Tips/i,
    keywords: ['October 1', 'October 7', 'Mid-Autumn Festival', '12306', 'hotel', 'National Day'],
    links: ["/#trip-plan", "/best-time-to-visit-china/", "/china-travel-budget/", "/7-day-china-itinerary/", "/10-day-china-itinerary/", "/first-trip-to-china/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-checklist/", "/14-day-china-itinerary/"],
  },
  {
    path: '/great-wall-of-china-day-trip-from-beijing/',
    h1: /Great Wall Day Trip from Beijing.*Mutianyu or Badaling.*2026/i,
    keywords: ['Mutianyu', 'Badaling', 'cableway', 'shuttle', '12306', 'Forbidden City'],
    links: ["/#trip-plan", "/china-train-travel-guide/", "/first-trip-to-china/", "/china-metro-guide/", "/didi-in-china-for-foreigners/", "/beijing-airport-to-city-guide/", "/china-airport-arrival-guide/"],
  },
  {
    path: '/chengdu-panda-base-guide/',
    h1: /Chengdu Panda Base Guide.*Tickets.*Route.*Visiting Tips.*2026/i,
    keywords: ['¥55', '¥30', 'real-name', '14 days', 'passport', 'South Gate', 'West Gate', 'sightseeing bus', 'Sun Giant Panda Nursery House', 'Bamboo Tower', 'Junqu General Hospital', 'Trip.com', 'original ID documents'],
    // The January notice's entry-lane wording conflicts with the official ticket page.
    forbiddenPhrases: ['without a Chinese ID card'],
    links: ["/#trip-plan", "/china-train-travel-guide/", "/first-trip-to-china/", "/china-metro-guide/", "/didi-in-china-for-foreigners/", "/beijing-airport-to-city-guide/", "/great-wall-of-china-day-trip-from-beijing/", "/china-airport-arrival-guide/"],
  },
  {
    path: '/best-time-to-visit-china/',
    h1: /Best Time to Visit China.*Weather and Crowds by Month.*2026/i,
    keywords: ['April', 'September', 'Spring Festival', 'National Day', 'typhoons', 'Tibet', 'Hainan', 'China Meteorological Administration'],
    links: ["/#trip-plan", "/7-day-china-itinerary/", "/10-day-china-itinerary/", "/14-day-china-itinerary/", "/china-travel-budget/", "/first-trip-to-china/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-checklist/"],
  },
  {
    path: '/china-esim-internet-guide/',
    h1: /How to Get an eSIM in China.*2026 Internet Guide/i,
    keywords: ['How do I get an eSIM in China?', 'travel eSIM', 'data roaming', 'mainland China', 'Google', 'APN'],
    links: ["/#trip-plan", "/first-trip-to-china/", "/china-travel-apps/", "/amap-english-mode-guide-2026/", "/amap-vs-google-maps-china/", "/didi-in-china-for-foreigners/", "/china-metro-guide/"],
  },
  {
    path: '/alipay-for-foreigners/',
    h1: /Alipay for Foreigners.*2026/i,
    keywords: ['Alipay', 'international card', 'person-to-person transfers', 'payment fails'],
    links: ["/#trip-plan", "/first-trip-to-china/", "/china-payment-guide/", "/wechat-pay-for-foreigners/", "/didi-payment-for-foreigners/", "/tenpaygo-for-tourists/", "/alipay-metro-qr-transport-code-guide/", "/china-travel-budget/"],
  },
  {
    path: '/wechat-pay-for-foreigners/',
    h1: /WeChat Pay for Foreigners.*Setup and Payment Guide.*2026/i,
    keywords: ['international card', 'QR code', 'Chinese bank account', 'person-to-person transfers', 'US citizens', 'charging standards', 'cross-border', 'Weixin Pay', 'payment failed'],
    links: ["/#trip-plan", "/first-trip-to-china/", "/alipay-for-foreigners/", "/china-payment-guide/", "/didi-payment-for-foreigners/", "/tenpaygo-for-tourists/", "/alipay-metro-qr-transport-code-guide/", "/china-travel-budget/"],
  },
  {
    path: '/china-travel-checklist/',
    h1: /China Travel Checklist/i,
    keywords: ['Alipay', 'Amap', 'DiDi', 'arrival card', 'Guests Accepted', '110', '¥200', '15 days before departure'],
    // The old title suffix is gone.
    forbiddenPhrases: ['| ChinaEase Buddy'],
    links: ["/#trip-plan", "https://www.fiverr.com/s/p3dZbQR", "/china-airport-arrival-guide/", "/china-online-arrival-card-2026/", "/china-visa-free-travel-guide/", "/china-travel-apps/", "/alipay-metro-qr-transport-code-guide/#card", "/china-hotels-for-foreigners/#check-before-booking", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-budget/", "/best-time-to-visit-china/", "/7-day-china-itinerary/", "/10-day-china-itinerary/", "/14-day-china-itinerary/", "/first-trip-to-china/"],
  },
  {
    path: '/china-emergency-numbers/',
    h1: /Emergency Numbers in China/i,
    keywords: ['Mainland China emergency numbers', 'What to show locals', 'Details to give when calling', '请帮我报警。', '请帮我叫救护车。'],
    links: ["/?journey=emergency", "tel:110", "tel:120", "tel:119", "tel:122", "/china-travel-safety-guide/", "/china-hotels-for-foreigners/", "/china-airport-arrival-guide/", "/china-esim-internet-guide/", "/china-payment-guide/", "/first-trip-to-china/", "/china-travel-checklist/"],
  },
  {
    path: '/faq/',
    h1: /FAQ|Frequently Asked Questions/i,
    keywords: ['What is ChinaEase Buddy?', 'Is ChinaEase Buddy free?', 'How do paid passes work?'],
    links: ["/", "/china-itinerary-first-time-7-10-14-days/", "/china-travel-budget/", "/china-travel-checklist/", "/best-time-to-visit-china/", "/7-day-china-itinerary/", "/10-day-china-itinerary/", "/14-day-china-itinerary/", "/first-trip-to-china/"],
  },
  {
    path: '/tenpaygo-for-tourists/',
    h1: /How to Use TenPayGo in China: Sign Up, Link a Card, Pay/i,
    keywords: ['September 24, 2026', 'Weixin Firefly', 'Apple Pay', 'WeChat Pay', 'Shenzhen Transit Card', 'International Card Fee', 'My test, October 25, 2026', 'Last reviewed'],
    // Sections removed in the October 24, 2026 rebuild must not come back.
    forbiddenPhrases: ['What Early TenPayGo Users Are Reporting', 'Known limitations and unconfirmed details', 'Payment limits explained', 'Setup checklist', 'Troubleshooting'],
    links: ["/china-payment-guide/", "/alipay-for-foreigners/", "/wechat-pay-for-foreigners/", "/wechat-verification-without-friend-qr-2026/", "/alipay-metro-qr-transport-code-guide/", "/didi-payment-for-foreigners/", "/3-day-shenzhen-itinerary/", "/first-trip-to-china/"],
  },
  {
    path: '/wechat-verification-without-friend-qr-2026/',
    h1: /WeChat Verification Without a Friend: Registration & QR Help/i,
    keywords: ['six months', 'three accounts a year', 'Eye Shenzhen', 'feedback form', 'TenPayGo', 'Last reviewed'],
    // The fake button and sections removed in the October 24, 2026 rebuild must not come back.
    forbiddenPhrases: ['Review my WeChat verification options', 'If registration is unfinished before departure'],
    links: ["/tenpaygo-for-tourists/", "/wechat-pay-for-foreigners/", "/alipay-for-foreigners/", "/china-payment-guide/", "/china-travel-apps/", "/china-esim-internet-guide/", "/didi-payment-for-foreigners/", "/first-trip-to-china/"],
  },
  {
    path: '/nia-12367-online-accommodation-registration-guide/',
    h1: /How Foreigners Can Register Accommodation Online in China/i,
    keywords: ['September 21, 2026', 'within 24 hours', 'NIA 12367', 'Hotel vs non-hotel stays'],
    links: ["/#trip-plan", "/china-hotels-for-foreigners/", "/china-airport-arrival-guide/", "/china-payment-guide/", "/china-esim-internet-guide/", "/china-travel-checklist/", "/first-trip-to-china/", "/china-travel-apps/"],
  },
  {
    path: '/china-visa-free-checker/',
    h1: /China Visa-Free Checker/i,
    keywords: ['ordinary passport', '240-hour visa-free transit', 'Hainan', 'Mutual visa exemption agreements', 'October 2, 2026'],
    links: ["/#trip-plan", "/china-240-hour-visa-free-transit-2026/", "/nia-12367-online-accommodation-registration-guide/", "/china-240-hour-transit-calculator/", "/china-online-arrival-card-2026/", "/china-airport-arrival-guide/", "/first-trip-to-china/", "/china-travel-checklist/"],
  },
  {
    path: '/pricing/',
    h1: /Pricing|Travel Passes/i,
    keywords: ['Free', 'Trip Pass', 'Group Pass'],
    links: ['/', '/terms/', '/privacy/'],
    noindex: true,
  },
];

function firstMatch(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || '';
}

function titleOf(html) {
  return firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
}

function metaDescriptionOf(html) {
  return firstMatch(html, /<meta\s+name=["']description["']\s+content="([^"]*)"[^>]*>/i)
    || firstMatch(html, /<meta\s+content="([^"]*)"\s+name=["']description["'][^>]*>/i)
    || firstMatch(html, /<meta\s+name=["']description["']\s+content='([^']*)'[^>]*>/i)
    || firstMatch(html, /<meta\s+content='([^']*)'\s+name=["']description["'][^>]*>/i);
}

function canonicalOf(html) {
  return firstMatch(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i)
    || firstMatch(html, /<link\s+href=["']([^"']+)["']\s+rel=["']canonical["'][^>]*>/i);
}

function h1sOf(html) {
  return [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map((match) => stripHtml(match[1]).trim())
    .filter(Boolean);
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#(?:39|x27);|&apos;/gi, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function textSignature(text) {
  return text.slice(0, 1200).replace(/\d+/g, '#');
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean);
}

async function fetchPage(path) {
  const res = await fetch(`${REQUEST_ORIGIN}${path}`, {
    headers: {
      'User-Agent': 'ChinaEaseBuddyLaunchAudit/1.0 (+https://chinaeasebuddy.com)',
      Accept: 'text/html,application/xhtml+xml',
    },
  });
  const html = await res.text();
  return { status: res.status, html };
}

const results = [];
const signatures = new Map();

for (const page of pages) {
  const checks = [];
  let html = '';
  try {
    const response = await fetchPage(page.path);
    html = response.html;
    checks.push(['HTTP 200', response.status === 200, `status ${response.status}`]);
  } catch (error) {
    checks.push(['HTTP 200', false, error instanceof Error ? error.message : 'fetch failed']);
  }

  const title = titleOf(html);
  const description = metaDescriptionOf(html);
  const canonical = canonicalOf(html);
  const h1s = h1sOf(html);
  const text = stripHtml(html);
  const scripts = jsonLdBlocks(html);

  checks.push(['title', title.length >= 10, title || 'missing']);
  checks.push(['description', description.length >= 40, description || 'missing']);
  checks.push(['canonical', canonical === `${ORIGIN}${page.path === '/' ? '/' : page.path}`, canonical || 'missing']);
  checks.push(['single H1', h1s.length === 1 && page.h1.test(h1s[0]), h1s.join(' | ') || 'missing']);
  checks.push(['unique body', text.length >= 900, `${text.length} chars`]);
  const hasNoindex = /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html);
  checks.push([page.noindex ? 'expected noindex' : 'no noindex', page.noindex ? hasNoindex : !hasNoindex, '']);

  const missingKeywords = page.keywords.filter((keyword) => !text.toLowerCase().includes(keyword.toLowerCase()));
  checks.push(['page keywords', missingKeywords.length === 0, missingKeywords.length ? `missing: ${missingKeywords.join(', ')}` : 'ok']);

  if (page.forbiddenPhrases) {
    const stalePhrases = page.forbiddenPhrases.filter((phrase) => text.toLowerCase().includes(phrase.toLowerCase()));
    checks.push(['no stale instructions', stalePhrases.length === 0, stalePhrases.length ? `found: ${stalePhrases.join(', ')}` : 'ok']);
  }

  const escapedLink = (link) => link.replace(/&/g, '&amp;');
  const missingLinks = page.links.filter((link) => {
    const encoded = escapedLink(link);
    return !html.includes(`href="${link}"`)
      && !html.includes(`href='${link}'`)
      && !html.includes(`href="${encoded}"`)
      && !html.includes(`href='${encoded}'`);
  });
  checks.push(['internal links', missingLinks.length === 0, missingLinks.length ? `missing: ${missingLinks.join(', ')}` : 'ok']);
  if (page.checkLocalAnchors) {
    const targets = [...html.matchAll(/<a\b[^>]*\bhref=["']#([^"']+)["']/gi)].map((match) => match[1]);
    const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]));
    const unresolved = targets.filter((target) => !ids.has(target));
    checks.push(['section anchors', targets.length > 0 && unresolved.length === 0, unresolved.length ? `missing targets: ${unresolved.join(', ')}` : `${targets.length} links resolve`]);
  }
  const requiresGuideHubLink = !page.noindex && page.path !== '/' && page.path !== '/guides/';
  if (requiresGuideHubLink) {
    checks.push(['guide hub backlink', html.includes('href="/guides/"') || html.includes("href='/guides/'"), '/guides/']);
  }

  let jsonLdOk = scripts.length > 0;
  let jsonLdDetail = scripts.length ? `${scripts.length} block(s)` : 'missing';
  for (const block of scripts) {
    try {
      JSON.parse(block);
    } catch (error) {
      jsonLdOk = false;
      jsonLdDetail = error instanceof Error ? error.message : 'JSON.parse failed';
      break;
    }
  }
  checks.push(['JSON-LD parse', jsonLdOk, jsonLdDetail]);

  const signature = textSignature(text);
  const duplicateOf = [...signatures.entries()].find(([, value]) => value === signature)?.[0];
  checks.push(['not fallback clone', !duplicateOf, duplicateOf ? `same as ${duplicateOf}` : 'ok']);
  signatures.set(page.path, signature);

  for (const [name, pass, detail] of checks) {
    results.push({ path: page.path, name, pass, detail });
  }
}

try {
  const sitemapResponse = await fetch(`${REQUEST_ORIGIN}/sitemap.xml`, {
    headers: { 'User-Agent': 'ChinaEaseBuddyLaunchAudit/1.0 (+https://chinaeasebuddy.com)' },
  });
  const sitemap = await sitemapResponse.text();
  const redirectSources = [
    '/how-much-does-china-trip-cost-2026-calculator/',
    '/how-to-pay-in-china-as-foreigner/',
    '/how-to-use-didi-in-china-foreigners/',
    '/china-esim-internet-vpn-guide/',
    '/china-visa-free-guide-2026/',
    '/amap-in-english/',
    '/does-google-maps-work-in-china-amap-guide/',
    '/how-to-visit-great-wall-from-beijing-2026/',
    '/is-china-safe-for-tourists-2026/',
    '/china-hotels-for-foreigners-no-rejection-guide/',
    '/best-apps-for-china-travel-2026/',
    '/240-hour-transit-zone-map-high-speed-rail/',
    '/china-train-booking-foreigners-12306/',
  ];
  const canonicalDestinations = ['/china-train-travel-guide/', '/china-travel-budget/', '/china-payment-guide/', '/didi-in-china-for-foreigners/', '/china-esim-internet-guide/', '/china-visa-free-travel-guide/', '/amap-english-mode-guide-2026/', '/amap-vs-google-maps-china/', '/great-wall-of-china-day-trip-from-beijing/', '/china-travel-safety-guide/', '/china-hotels-for-foreigners/', '/china-travel-apps/'];
  results.push({ path: '/sitemap.xml', name: 'HTTP 200', pass: sitemapResponse.status === 200, detail: `status ${sitemapResponse.status}` });
  for (const path of redirectSources) {
    results.push({ path: '/sitemap.xml', name: 'redirect excluded', pass: !sitemap.includes(`<loc>${ORIGIN}${path}</loc>`), detail: path });
  }
  for (const path of canonicalDestinations) {
    results.push({ path: '/sitemap.xml', name: 'canonical included', pass: sitemap.includes(`<loc>${ORIGIN}${path}</loc>`), detail: path });
  }
} catch (error) {
  results.push({ path: '/sitemap.xml', name: 'HTTP 200', pass: false, detail: error instanceof Error ? error.message : 'fetch failed' });
}

// Merged pages must answer with a single 301 to their destination.
for (const [source, destination] of [['/china-train-booking-foreigners-12306/', '/china-train-travel-guide/']]) {
  try {
    const response = await fetch(`${REQUEST_ORIGIN}${source}`, { redirect: 'manual', headers: { 'User-Agent': 'ChinaEaseBuddyLaunchAudit/1.0 (+https://chinaeasebuddy.com)' } });
    const location = new URL(response.headers.get('location') || '', `${REQUEST_ORIGIN}${source}`).pathname;
    results.push({ path: source, name: '301 redirect', pass: response.status === 301 && location === destination, detail: `${response.status} -> ${location}` });
  } catch (error) {
    results.push({ path: source, name: '301 redirect', pass: false, detail: error instanceof Error ? error.message : 'fetch failed' });
  }
}

const pad = (value, len) => String(value).padEnd(len, ' ');
console.log(`${pad('Page', 32)} ${pad('Check', 20)} ${pad('Result', 6)} Details`);
console.log('-'.repeat(96));
for (const result of results) {
  console.log(`${pad(result.path, 32)} ${pad(result.name, 20)} ${pad(result.pass ? 'PASS' : 'FAIL', 6)} ${result.detail || ''}`);
}

const failed = results.filter((result) => !result.pass);
if (failed.length) {
  console.error(`\n${failed.length} public HTML audit check(s) failed.`);
  process.exit(1);
}

console.log('\nAll public HTML audit checks passed.');

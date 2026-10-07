const ORIGIN = 'https://chinaeasebuddy.com';
const REQUEST_ORIGIN = process.env.AUDIT_ORIGIN || ORIGIN;

const pages = [
  {
    path: '/',
    h1: /AI Travel Assistant.*Works in China/i,
    keywords: ['ChinaEase Buddy', 'Travel Passes', 'itinerary', 'Free tools for planning your China trip'],
    links: ['/guides/', '/pricing/', '/china-visa-free-checker/', '/china-240-hour-visa-free-transit-2026/', '/nia-12367-online-accommodation-registration-guide/', '/tenpaygo-for-tourists/'],
  },
  {
    path: '/guides/',
    h1: /China Travel Guides/i,
    keywords: ['China Visa-Free Travel Guide', 'China Airport Arrival Guide', 'China Hotels for Foreigners', 'China Food Ordering Guide', 'Chinese Travel Phrases', 'China Travel Safety Guide', 'China Travel Budget', 'China Travel Apps', 'AMap in English', 'China Metro Guide', 'DiDi in China for Foreigners', 'China Train Travel Guide', '7-Day China Itinerary', '10-Day China Itinerary', '14-Day China Itinerary', 'Beijing vs Shanghai', '3-Day Beijing Itinerary', '3-Day Shanghai Itinerary', '3-Day Xi\'an Itinerary', '3-Day Chongqing Itinerary', '3-Day Chengdu Itinerary', '3-Day Guilin and Yangshuo Itinerary', '3-Day Zhangjiajie Itinerary', '3-Day Shenzhen Itinerary', '3-Day Guangzhou Itinerary', '3-Day Hangzhou Itinerary', '3-Day Suzhou Itinerary', '3-Day Nanjing Itinerary', '3-Day Dali Itinerary', 'China Golden Week 2026 Travel Guide', 'Great Wall Day Trip from Beijing', 'Chengdu Panda Base Guide', 'DiDi Payment for Foreigners', 'Beijing Airport to City Guide', 'AMap vs Google Maps in China', 'Best Time to Visit China', 'Alipay for Foreigners', 'WeChat Pay for Foreigners', 'China Payment Guide', 'China Emergency Numbers'],
    links: ['/china-visa-free-travel-guide/', '/china-airport-arrival-guide/', '/china-hotels-for-foreigners/', '/china-food-ordering-guide/', '/chinese-travel-phrases/', '/china-travel-safety-guide/', '/china-travel-budget/', '/china-travel-apps/', '/amap-in-english/', '/china-metro-guide/', '/didi-in-china-for-foreigners/', '/china-train-travel-guide/', '/7-day-china-itinerary/', '/10-day-china-itinerary/', '/14-day-china-itinerary/', '/beijing-vs-shanghai/', '/3-day-beijing-itinerary/', '/3-day-shanghai-itinerary/', '/3-day-xian-itinerary/', '/3-day-chongqing-itinerary/', '/3-day-chengdu-itinerary/', '/3-day-guilin-yangshuo-itinerary/', '/3-day-zhangjiajie-itinerary/', '/3-day-shenzhen-itinerary/', '/3-day-guangzhou-itinerary/', '/3-day-hangzhou-itinerary/', '/3-day-suzhou-itinerary/', '/3-day-nanjing-itinerary/', '/3-day-dali-itinerary/', '/china-golden-week-2026-travel-guide/', '/great-wall-of-china-day-trip-from-beijing/', '/chengdu-panda-base-guide/', '/didi-payment-for-foreigners/', '/beijing-airport-to-city-guide/', '/amap-vs-google-maps-china/', '/best-time-to-visit-china/', '/wechat-pay-for-foreigners/', '/china-payment-guide/', '/faq/'],
  },
  {
    path: '/didi-payment-for-foreigners/',
    h1: /How to Pay for DiDi in China as a Foreigner.*2026/i,
    keywords: ['foreign bank card', 'payment', 'trip receipt', 'backup'],
    links: ['/didi-in-china-for-foreigners/', '/alipay-for-foreigners/', '/#trip-plan'],
  },
  {
    path: '/beijing-airport-to-city-guide/',
    h1: /Beijing Airport to City Centre.*PEK vs PKX.*2026/i,
    keywords: ['PEK', 'PKX', 'Caoqiao', 'Dongzhimen'],
    links: ['/china-airport-arrival-guide/', '/3-day-beijing-itinerary/', '/#trip-plan'],
  },
  {
    path: '/amap-vs-google-maps-china/',
    h1: /AMap vs Google Maps in China.*2026/i,
    keywords: ['Chinese', 'metro exit', 'offline', 'Google Maps'],
    links: ['/amap-in-english/', '/china-travel-apps/', '/#trip-plan'],
  },
  {
    path: '/china-payment-guide/',
    h1: /How to Pay in China as a Foreigner/i,
    keywords: ['Alipay', 'WeChat Pay', 'foreign card', 'payment fails'],
    links: ['/?journey=china&tool=pay', '/alipay-for-foreigners/', '/wechat-pay-for-foreigners/', '/china-food-ordering-guide/'],
  },
  {
    path: '/china-visa-free-travel-guide/',
    h1: /China Visa-Free Travel Guide for Tourists.*2026/i,
    keywords: ['Ordinary visa-free entry', '240-hour visa-free transit', 'third country or region', 'approved port', 'confirmed onward', 'border inspection'],
    links: ['/#trip-plan', '/china-airport-arrival-guide/', '/china-hotels-for-foreigners/', '/first-trip-to-china/', '/china-travel-checklist/', '/china-train-travel-guide/', '/10-day-china-itinerary/'],
  },
  {
    path: '/china-airport-arrival-guide/',
    h1: /China Airport Arrival.*Entry.*Baggage.*Payment.*Transfer/i,
    keywords: ['arrival card', 'Immigration', 'Baggage', 'Customs', 'eSIM', 'airport transfer'],
    links: ['/#trip-plan', '/china-visa-free-travel-guide/', '/china-hotels-for-foreigners/', '/first-trip-to-china/', '/china-esim-internet-guide/', '/china-payment-guide/', '/china-metro-guide/', '/didi-in-china-for-foreigners/'],
  },
  {
    path: '/china-hotels-for-foreigners/',
    h1: /Can Foreigners Stay in Any Hotel in China.*2026 Guide/i,
    keywords: ['foreign passport', 'foreign-related qualification', 'Which hotels in China accept foreigners', 'accommodation registration', 'late arrival', 'deposit', '24 hours'],
    links: ['/#trip-plan', '/china-visa-free-travel-guide/', '/china-airport-arrival-guide/', '/first-trip-to-china/', '/china-payment-guide/', '/china-metro-guide/', '/didi-in-china-for-foreigners/', '/10-day-china-itinerary/'],
  },
  {
    path: '/china-food-ordering-guide/',
    h1: /How to Order Food in China.*Menu and Allergy Guide.*2026/i,
    keywords: ['QR menu', 'photo menu', 'food allergy', 'cross-contamination', 'steaming hot', '120', 'white rice'],
    links: ['/#trip-plan', '/china-travel-apps/', '/chinese-travel-phrases/', '/china-payment-guide/', '/alipay-for-foreigners/', '/wechat-pay-for-foreigners/', '/china-emergency-numbers/', '/amap-in-english/', '/first-trip-to-china/'],
  },
  {
    path: '/chinese-travel-phrases/',
    h1: /Essential Chinese Phrases for Travel in China.*2026/i,
    keywords: ['nǐ hǎo', 'Please take me to this address', 'Alipay', 'platform', 'Wi-Fi', '110 police', '120 ambulance', 'pinyin'],
    links: ['/?journey=china', '/china-food-ordering-guide/', '/china-travel-safety-guide/', '/china-travel-apps/', '/didi-in-china-for-foreigners/', '/china-hotels-for-foreigners/', '/china-payment-guide/', '/china-train-travel-guide/', '/china-emergency-numbers/', '/first-trip-to-china/'],
  },
  {
    path: '/china-travel-safety-guide/',
    h1: /Is It Safe to Travel to China.*2026/i,
    keywords: ['Level 2', 'tea-house', 'unmarked', 'original passport', 'tap water', 'Typhoons', '110', '120', '119'],
    links: ['/#trip-plan', '/is-china-safe-for-tourists-2026/', '/china-emergency-numbers/', '/chinese-travel-phrases/', '/china-travel-apps/', '/didi-in-china-for-foreigners/', '/china-hotels-for-foreigners/', '/china-food-ordering-guide/', '/china-payment-guide/', '/china-airport-arrival-guide/', '/first-trip-to-china/'],
  },
  {
    path: '/is-china-safe-for-tourists-2026/',
    h1: /Is China Safe for US Citizens.*2026/i,
    keywords: ['US citizens', 'Level 2', 'exit bans', '110', '120', '119'],
    links: ['/china-travel-safety-guide/', '/china-emergency-numbers/', '/best-apps-for-china-travel-2026/'],
  },
  {
    path: '/china-travel-budget/',
    h1: /How Much Does a Trip to China Cost.*2026 Budget Guide/i,
    keywords: ['RMB 350', 'RMB 800', 'RMB 1,800', 'international flights', '12306', 'peak', 'solo travelers'],
    links: ['/#trip-plan', '/china-hotels-for-foreigners/', '/china-food-ordering-guide/', '/china-payment-guide/', '/china-train-travel-guide/', '/china-metro-guide/', '/didi-in-china-for-foreigners/', '/china-esim-internet-guide/', '/china-travel-apps/', '/7-day-china-itinerary/', '/10-day-china-itinerary/', '/14-day-china-itinerary/', '/best-time-to-visit-china/', '/first-trip-to-china/'],
  },
  {
    path: '/china-travel-apps/',
    h1: /Essential China Travel Apps to Set Up Before Arrival/i,
    keywords: ['Alipay', 'WeChat', 'AMap Global', 'DiDi', 'Trip.com', 'Railway 12306', 'offline translation'],
    links: ['/#trip-plan', '/china-airport-arrival-guide/', '/amap-in-english/', '/china-metro-guide/', '/didi-in-china-for-foreigners/', '/china-train-travel-guide/', '/china-esim-internet-guide/', '/alipay-for-foreigners/', '/china-food-ordering-guide/', '/chinese-travel-phrases/', '/china-travel-safety-guide/', '/china-travel-budget/', '/china-travel-checklist/'],
  },
  {
    path: '/amap-in-english/',
    h1: /AMap in English in China.*2026/i,
    keywords: ['English', 'place search', 'walking', 'public transport', 'Chinese address', 'station exit'],
    links: ['/#trip-plan', '/first-trip-to-china/', '/china-travel-apps/', '/china-metro-guide/', '/didi-in-china-for-foreigners/', '/china-train-travel-guide/'],
  },
  {
    path: '/china-metro-guide/',
    h1: /China Metro Guide for Foreigners.*2026/i,
    keywords: ['single-journey ticket', 'overseas bank card', 'security', 'transfer', 'station exit', 'last train'],
    links: ['/#trip-plan', '/china-airport-arrival-guide/', '/first-trip-to-china/', '/amap-in-english/', '/china-travel-apps/', '/didi-in-china-for-foreigners/', '/china-train-travel-guide/', '/china-payment-guide/'],
  },
  {
    path: '/didi-in-china-for-foreigners/',
    h1: /How to Use DiDi in China as a Foreigner/i,
    keywords: ['international mobile number', 'English interface', 'licence plate', 'ride-hailing pickup point', 'bilingual', 'lost item'],
    links: ['/#trip-plan', '/china-airport-arrival-guide/', '/first-trip-to-china/', '/china-travel-apps/', '/amap-in-english/', '/china-metro-guide/', '/china-train-travel-guide/', '/10-day-china-itinerary/', '/china-payment-guide/'],
  },
  {
    path: '/china-train-travel-guide/',
    h1: /How to Book China High-Speed Trains Without Chinese ID/i,
    keywords: ['foreign passport', 'Railway 12306', 'Trip.com', 'e-ticket', 'station', 'refund'],
    links: ['/#trip-plan', '/first-trip-to-china/', '/7-day-china-itinerary/', '/10-day-china-itinerary/', '/14-day-china-itinerary/', '/beijing-vs-shanghai/', '/china-travel-apps/', '/china-metro-guide/', '/china-esim-internet-guide/'],
  },
  {
    path: '/7-day-china-itinerary/',
    h1: /7-Day China Itinerary for First-Time Visitors.*2026/i,
    keywords: ['open-jaw', 'Beijing', 'Xi\'an', 'Shanghai', 'Palace Museum', 'Terracotta Warriors', 'RMB 350', '12306'],
    links: ['/#trip-plan', '/10-day-china-itinerary/', '/14-day-china-itinerary/', '/beijing-vs-shanghai/', '/best-time-to-visit-china/', '/china-travel-budget/', '/china-train-travel-guide/', '/china-airport-arrival-guide/', '/china-hotels-for-foreigners/', '/china-travel-apps/', '/china-esim-internet-guide/', '/china-payment-guide/', '/first-trip-to-china/'],
  },
  {
    path: '/10-day-china-itinerary/',
    h1: /10-Day China Itinerary for First-Time Visitors/i,
    keywords: ['Beijing', 'Xi\'an', 'Shanghai', 'Palace Museum', 'Terracotta Warriors', 'high-speed train'],
    links: ['/#trip-plan', '/first-trip-to-china/', '/7-day-china-itinerary/', '/14-day-china-itinerary/', '/beijing-vs-shanghai/', '/best-time-to-visit-china/', '/china-travel-budget/', '/china-train-travel-guide/', '/china-travel-apps/'],
  },
  {
    path: '/14-day-china-itinerary/',
    h1: /14-Day China Itinerary for First-Time Visitors.*2026/i,
    keywords: ['two-week', 'Beijing', 'Xi\'an', 'Chengdu', 'Shanghai', 'Guilin', 'Panda Base', 'RMB 6,500', '12306'],
    links: ['/#trip-plan', '/7-day-china-itinerary/', '/10-day-china-itinerary/', '/beijing-vs-shanghai/', '/best-time-to-visit-china/', '/china-travel-budget/', '/china-train-travel-guide/', '/china-airport-arrival-guide/', '/china-hotels-for-foreigners/', '/china-food-ordering-guide/', '/china-travel-apps/', '/china-esim-internet-guide/', '/first-trip-to-china/'],
  },
  {
    path: '/beijing-vs-shanghai/',
    h1: /Beijing vs Shanghai.*Which City Should You Visit First.*2026/i,
    keywords: ['imperial history', 'Great Wall', 'The Bund', '3–5 full days', '2–4 full days', 'open-jaw', '12306', 'Suzhou', 'Hangzhou'],
    links: ['/#trip-plan', '/3-day-beijing-itinerary/', '/3-day-shanghai-itinerary/', '/7-day-china-itinerary/', '/10-day-china-itinerary/', '/14-day-china-itinerary/', '/best-time-to-visit-china/', '/china-train-travel-guide/', '/china-travel-budget/', '/china-airport-arrival-guide/', '/china-hotels-for-foreigners/', '/china-travel-apps/', '/china-metro-guide/', '/first-trip-to-china/'],
  },
  {
    path: '/3-day-beijing-itinerary/',
    h1: /3-Day Beijing Itinerary for First-Time Visitors.*2026/i,
    keywords: ['Palace Museum', 'Great Wall', 'Temple of Heaven', 'Tiananmen', 'Wangfujing', 'Qianmen', 'Railway 12306'],
    links: ['/#trip-plan', '/3-day-shanghai-itinerary/', '/beijing-vs-shanghai/', '/7-day-china-itinerary/', '/10-day-china-itinerary/', '/14-day-china-itinerary/', '/best-time-to-visit-china/', '/china-train-travel-guide/', '/china-metro-guide/', '/china-hotels-for-foreigners/', '/china-travel-apps/', '/first-trip-to-china/'],
  },
  {
    path: '/3-day-shanghai-itinerary/',
    h1: /3-Day Shanghai Itinerary for First-Time Visitors.*2026/i,
    keywords: ['The Bund', 'Yuyuan Garden', 'Wukang Road', 'Pudong', 'People\'s Square', 'Hongqiao', 'Railway 12306'],
    links: ['/#trip-plan', '/3-day-beijing-itinerary/', '/beijing-vs-shanghai/', '/7-day-china-itinerary/', '/10-day-china-itinerary/', '/14-day-china-itinerary/', '/best-time-to-visit-china/', '/china-train-travel-guide/', '/china-metro-guide/', '/china-hotels-for-foreigners/', '/china-travel-apps/', '/first-trip-to-china/'],
  },
  {
    path: '/3-day-xian-itinerary/',
    h1: /3-Day Xi'an Itinerary for First-Time Visitors.*2026/i,
    keywords: ['Terracotta Army', 'city wall', 'Muslim Quarter', 'Shaanxi History Museum', 'Big Wild Goose Pagoda', 'Xi\'an North', 'Railway 12306'],
    links: ['/#trip-plan', '/3-day-beijing-itinerary/', '/3-day-shanghai-itinerary/', '/7-day-china-itinerary/', '/10-day-china-itinerary/', '/14-day-china-itinerary/', '/best-time-to-visit-china/', '/china-train-travel-guide/', '/china-metro-guide/', '/china-hotels-for-foreigners/', '/china-travel-apps/', '/first-trip-to-china/'],
  },
  {
    path: '/3-day-chongqing-itinerary/',
    h1: /3-Day Chongqing Itinerary for First-Time Visitors.*2026/i,
    keywords: ['Hongya Cave', 'Liziba', 'Three Gorges Museum', 'Jiefangbei', 'Ciqikou', 'Dazu Rock Carvings', 'Railway 12306'],
    links: ['/#trip-plan', '/3-day-xian-itinerary/', '/3-day-beijing-itinerary/', '/3-day-shanghai-itinerary/', '/10-day-china-itinerary/', '/14-day-china-itinerary/', '/best-time-to-visit-china/', '/china-train-travel-guide/', '/china-metro-guide/', '/china-hotels-for-foreigners/', '/china-travel-apps/', '/first-trip-to-china/'],
  },
  {
    path: '/3-day-chengdu-itinerary/',
    h1: /3-Day Chengdu Itinerary for First-Time Visitors.*2026/i,
    keywords: ['Panda Base', 'People\'s Park', 'Sichuan food', 'Leshan', 'Sanxingdui', 'Tianfu International Airport', 'Railway 12306'],
    links: ['/#trip-plan', '/3-day-chongqing-itinerary/', '/3-day-xian-itinerary/', '/10-day-china-itinerary/', '/14-day-china-itinerary/', '/best-time-to-visit-china/', '/china-train-travel-guide/', '/china-food-ordering-guide/', '/china-hotels-for-foreigners/', '/china-travel-apps/', '/first-trip-to-china/'],
  },
  {
    path: '/3-day-guilin-yangshuo-itinerary/',
    h1: /3-Day Guilin and Yangshuo Itinerary.*2026/i,
    keywords: ['Li River', 'Yulong River', 'Xingping', 'Longji', 'Yangshuo railway station', 'Guilin West', 'Railway 12306'],
    links: ['/#trip-plan', '/3-day-chengdu-itinerary/', '/3-day-chongqing-itinerary/', '/10-day-china-itinerary/', '/14-day-china-itinerary/', '/best-time-to-visit-china/', '/china-train-travel-guide/', '/china-hotels-for-foreigners/', '/china-travel-apps/', '/first-trip-to-china/'],
  },
  {
    path: '/3-day-zhangjiajie-itinerary/',
    h1: /3-Day Zhangjiajie Itinerary for First-Time Visitors.*2026/i,
    keywords: ['Wulingyuan', 'Zhangjiajie National Forest Park', 'Tianmen Mountain', 'Yuanjiajie', 'Tianzi Mountain', 'Zhangjiajie West', 'Railway 12306'],
    links: ['/#trip-plan', '/3-day-guilin-yangshuo-itinerary/', '/3-day-chengdu-itinerary/', '/10-day-china-itinerary/', '/14-day-china-itinerary/', '/best-time-to-visit-china/', '/china-train-travel-guide/', '/china-hotels-for-foreigners/', '/china-travel-apps/', '/first-trip-to-china/'],
  },
  {
    path: '/3-day-shenzhen-itinerary/',
    h1: /3-Day Shenzhen Itinerary for First-Time Visitors.*2026/i,
    keywords: ['Shenzhen Museum', 'Lianhuashan Park', 'OCT-LOFT', 'Nantou Ancient Town', 'Shenzhen Bay', 'Dapeng', 'Huaqiangbei', 'Line 11', 'Railway 12306'],
    links: ['/#trip-plan', '/3-day-guilin-yangshuo-itinerary/', '/3-day-shanghai-itinerary/', '/10-day-china-itinerary/', '/14-day-china-itinerary/', '/china-airport-arrival-guide/', '/china-metro-guide/', '/china-train-travel-guide/', '/china-food-ordering-guide/', '/china-hotels-for-foreigners/', '/china-travel-apps/', '/first-trip-to-china/'],
  },
  {
    path: '/3-day-guangzhou-itinerary/',
    h1: /3-Day Guangzhou Itinerary for First-Time Visitors.*2026/i,
    keywords: ['Chen Clan Ancestral Hall', 'Yongqingfang', 'Shamian Island', 'Canton Tower', 'Pearl River', 'dim sum', 'Baiyun International Airport', 'Guangzhou South', 'Railway 12306'],
    links: ['/#trip-plan', '/3-day-shenzhen-itinerary/', '/3-day-guilin-yangshuo-itinerary/', '/10-day-china-itinerary/', '/14-day-china-itinerary/', '/china-airport-arrival-guide/', '/china-metro-guide/', '/china-train-travel-guide/', '/china-food-ordering-guide/', '/china-hotels-for-foreigners/', '/best-time-to-visit-china/', '/first-trip-to-china/'],
  },
  {
    path: '/3-day-hangzhou-itinerary/',
    h1: /3-Day Hangzhou Itinerary for First-Time Visitors.*2026/i,
    keywords: ['West Lake', 'Lingyin', 'Feilai Peak', 'Longjing', 'Grand Canal', 'Hefang Street', 'Xixi Wetland', 'Hangzhou East', 'Railway 12306'],
    links: ['/#trip-plan', '/3-day-shanghai-itinerary/', '/3-day-guangzhou-itinerary/', '/10-day-china-itinerary/', '/14-day-china-itinerary/', '/china-train-travel-guide/', '/china-metro-guide/', '/china-hotels-for-foreigners/', '/china-food-ordering-guide/', '/china-travel-apps/', '/best-time-to-visit-china/', '/first-trip-to-china/'],
  },
  {
    path: '/3-day-suzhou-itinerary/',
    h1: /3-Day Suzhou Itinerary for First-Time Visitors.*2026/i,
    keywords: ["Humble Administrator's Garden", 'Pingjiang Road', 'Lingering Garden', 'Suzhou Museum', 'Suzhou North', '12306'],
    links: ['/#trip-plan', '/3-day-shanghai-itinerary/', '/3-day-hangzhou-itinerary/', '/10-day-china-itinerary/', '/china-train-travel-guide/', '/china-hotels-for-foreigners/', '/china-metro-guide/', '/first-trip-to-china/'],
  },
  {
    path: '/3-day-nanjing-itinerary/',
    h1: /3-Day Nanjing Itinerary for First-Time Visitors.*2026/i,
    keywords: ['Sun Yat-sen Mausoleum', 'Ming Xiaoling', 'Nanjing Museum', 'Nanjing Massacre Memorial Hall', 'Qinhuai River', 'Nanjing South', '12306'],
    links: ['/#trip-plan', '/3-day-shanghai-itinerary/', '/3-day-suzhou-itinerary/', '/10-day-china-itinerary/', '/china-train-travel-guide/', '/china-hotels-for-foreigners/', '/china-metro-guide/', '/first-trip-to-china/'],
  },
  {
    path: '/3-day-dali-itinerary/',
    h1: /3-Day Dali Itinerary for First-Time Visitors.*2026/i,
    keywords: ['Dali Old Town', 'Three Pagodas', 'Erhai', 'Xizhou', 'Cangshan', 'Xiaguan', '12306'],
    links: ['/#trip-plan', '/3-day-guilin-yangshuo-itinerary/', '/3-day-zhangjiajie-itinerary/', '/14-day-china-itinerary/', '/china-train-travel-guide/', '/china-hotels-for-foreigners/', '/best-time-to-visit-china/', '/first-trip-to-china/'],
  },
  {
    path: '/china-golden-week-2026-travel-guide/',
    h1: /China Golden Week 2026.*Dates.*Crowds.*Travel Tips/i,
    keywords: ['October 1', 'October 7', 'Mid-Autumn Festival', '12306', 'hotel', 'National Day'],
    links: ['/#trip-plan', '/best-time-to-visit-china/', '/china-train-travel-guide/', '/china-hotels-for-foreigners/', '/china-travel-budget/', '/7-day-china-itinerary/', '/10-day-china-itinerary/', '/first-trip-to-china/'],
  },
  {
    path: '/great-wall-of-china-day-trip-from-beijing/',
    h1: /Great Wall Day Trip from Beijing.*Mutianyu or Badaling.*2026/i,
    keywords: ['Mutianyu', 'Badaling', 'cableway', 'shuttle', '12306', 'Forbidden City'],
    links: ['/#trip-plan', '/3-day-beijing-itinerary/', '/7-day-china-itinerary/', '/china-train-travel-guide/', '/china-travel-safety-guide/', '/china-golden-week-2026-travel-guide/', '/first-trip-to-china/'],
  },
  {
    path: '/chengdu-panda-base-guide/',
    h1: /How to See Baby Pandas Without Waiting 3 Hours/i,
    keywords: ['real-name', 'passport', 'South Gate', 'West Gate', 'sightseeing bus', 'pandas'],
    links: ['/#trip-plan', '/3-day-chengdu-itinerary/', '/14-day-china-itinerary/', '/china-train-travel-guide/', '/china-hotels-for-foreigners/', '/china-golden-week-2026-travel-guide/', '/first-trip-to-china/'],
  },
  {
    path: '/best-time-to-visit-china/',
    h1: /Best Time to Visit China.*Weather and Crowds by Month.*2026/i,
    keywords: ['April', 'September', 'Spring Festival', 'National Day', 'typhoons', 'Tibet', 'Hainan', 'China Meteorological Administration'],
    links: ['/#trip-plan', '/beijing-vs-shanghai/', '/7-day-china-itinerary/', '/10-day-china-itinerary/', '/14-day-china-itinerary/', '/china-travel-budget/', '/china-visa-free-travel-guide/', '/china-travel-safety-guide/', '/china-airport-arrival-guide/', '/china-hotels-for-foreigners/', '/first-trip-to-china/'],
  },
  {
    path: '/china-esim-internet-guide/',
    h1: /China eSIM.*Internet Guide.*2026/i,
    keywords: ['travel eSIM', 'data roaming', 'mainland China', 'Google', 'APN'],
    links: ['/#trip-plan', '/china-airport-arrival-guide/', '/first-trip-to-china/', '/china-travel-apps/'],
  },
  {
    path: '/alipay-for-foreigners/',
    h1: /Alipay for Foreigners.*2026/i,
    keywords: ['Alipay', 'international card', 'person-to-person transfers', 'payment fails'],
    links: ['/#trip-plan', '/first-trip-to-china/', '/china-payment-guide/', '/wechat-pay-for-foreigners/'],
  },
  {
    path: '/wechat-pay-for-foreigners/',
    h1: /WeChat Pay in China as a Foreigner.*2026/i,
    keywords: ['international card', 'QR code', 'Chinese bank account', 'person-to-person transfers', 'payment feature', 'Weixin Pay', 'payment failed'],
    links: ['/#trip-plan', '/first-trip-to-china/', '/alipay-for-foreigners/', '/china-payment-guide/', '/china-travel-apps/'],
  },
  {
    path: '/china-travel-checklist/',
    h1: /China Travel Checklist/i,
    keywords: ['apps', 'payment methods', 'Hotel address', 'Emergency numbers'],
    links: ['/#trip-plan', '/china-travel-apps/'],
  },
  {
    path: '/china-emergency-numbers/',
    h1: /Emergency Numbers in China/i,
    keywords: ['110 Police', '120 Ambulance', '119 Fire', 'Hospital phrases'],
    links: ['/?journey=emergency', '/faq/'],
  },
  {
    path: '/faq/',
    h1: /FAQ|Frequently Asked Questions/i,
    keywords: ['What is ChinaEase Buddy?', 'Is ChinaEase Buddy free?', 'How do paid passes work?'],
    links: ['/', '/china-travel-apps/'],
  },
  {
    path: '/tenpaygo-for-tourists/',
    h1: /TenPayGo for Tourists Visiting China/i,
    keywords: ['September 24, 2026', 'international bank card', 'Apple Pay', 'WeChat Pay', 'Last reviewed'],
    links: ['/#trip-plan', '/china-payment-guide/', '/wechat-pay-for-foreigners/', '/alipay-for-foreigners/'],
  },
  {
    path: '/nia-12367-online-accommodation-registration-guide/',
    h1: /How Foreigners Can Register Accommodation Online in China/i,
    keywords: ['September 21, 2026', 'within 24 hours', 'NIA 12367', 'Hotel vs non-hotel stays'],
    links: ['/#trip-plan', '/china-hotels-for-foreigners/', '/china-airport-arrival-guide/', '/china-visa-free-travel-guide/'],
  },
  {
    path: '/china-visa-free-checker/',
    h1: /China Visa-Free Checker/i,
    keywords: ['ordinary passport', '240-hour visa-free transit', 'Hainan', 'Mutual visa exemption agreements', 'October 2, 2026'],
    links: ['/#trip-plan', '/china-240-hour-visa-free-transit-2026/', '/china-visa-free-travel-guide/', '/nia-12367-online-accommodation-registration-guide/'],
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

  const escapedLink = (link) => link.replace(/&/g, '&amp;');
  const missingLinks = page.links.filter((link) => {
    const encoded = escapedLink(link);
    return !html.includes(`href="${link}"`)
      && !html.includes(`href='${link}'`)
      && !html.includes(`href="${encoded}"`)
      && !html.includes(`href='${encoded}'`);
  });
  checks.push(['internal links', missingLinks.length === 0, missingLinks.length ? `missing: ${missingLinks.join(', ')}` : 'ok']);

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
  ];
  const canonicalDestinations = ['/china-travel-budget/', '/china-payment-guide/', '/didi-in-china-for-foreigners/'];
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

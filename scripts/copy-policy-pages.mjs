import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const siteUrl = 'https://chinaeasebuddy.com';
const distDir = 'dist';
const source = join(distDir, 'index.html');

const pageMeta = {
  guides: {
    title: 'China Travel Guides | ChinaEase Buddy',
    description:
      'Practical China travel guides for foreign visitors: essential apps, Alipay, payments, checklists, emergency numbers, and frequently asked questions.',
    sections: [
      ['China Travel Apps', 'Prepare Alipay, WeChat, Amap, Didi, and Trip.com before arrival.', '/china-travel-apps'],
      ['Alipay for Foreigners', 'What foreign visitors should know before trying Alipay in China.', '/alipay-for-foreigners'],
      ['China Payment Guide', 'Practical payment reminders for Alipay, WeChat Pay, cards, and cash backup.', '/china-payment-guide'],
      ['China Travel Checklist', 'A first-time visitor checklist for apps, payments, hotels, phrases, and emergency basics.', '/china-travel-checklist'],
      ['Emergency Numbers in China', 'Know 110, 120, and 119, plus simple phrases for urgent situations.', '/china-emergency-numbers'],
      ['FAQ', 'Short answers about ChinaEase Buddy, paid passes, travel tools, and service limits.', '/faq'],
    ],
  },
  pricing: {
    title: 'Pricing | ChinaEase Buddy',
    description: 'ChinaEase Buddy pricing: Free, Trip Pass, and Group Pass for digital China travel tools.',
    sections: [
      ['Free', 'Basic toolkit for apps, payments, transport, food, hotels, emergency help, and limited Buddy AI access.', '/?journey=china&tool=food'],
      ['Trip Pass', 'USD 9.90 one-time travel pass with 50 Buddy AI messages for 7 days.', '/pricing'],
      ['Group Pass', 'USD 29.90 one-time travel pass with 200 Buddy AI messages for 14 days on one shared account.', '/pricing'],
    ],
    faqs: [
      ['How do paid passes work?', 'Paid passes are one-time digital travel passes. Sandbox automatic checkout is being tested, and live checkout will not be enabled until approved. Access is granted after verified payment confirmation.'],
      ['Are payments handled by PayPal?', 'PayPal is used for payment processing. ChinaEase Buddy does not collect card details directly on the website.'],
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
  'alipay-for-foreigners': {
    title: 'Can Foreigners Use Alipay in China? | ChinaEase Buddy',
    description:
      'Learn what foreign visitors should know about using Alipay in China, including setup reminders, foreign cards, backup payments, and common issues.',
    faqs: [
      ['Can foreigners use Alipay in China?', 'Many foreign visitors can try using Alipay with supported international cards, but successful setup and payment acceptance can vary. Prepare a backup payment option.'],
      ['Do I need a Chinese bank account to use Alipay?', 'Some foreign travelers may be able to link supported international cards. Rules and supported cards can change, so check Alipay’s current instructions.'],
      ['What if my Alipay payment fails?', 'Ask whether you can use WeChat Pay, cash, or a card. ChinaEase Buddy includes short Chinese payment phrases you can show to staff.'],
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
      ['How do paid passes work?', 'Paid passes are one-time digital travel passes. Sandbox automatic checkout is being tested, and live checkout will not be enabled until approved. Access is granted after verified payment confirmation.'],
      ['What emergency numbers should travelers know in China?', 'Travelers should know 110 for police, 120 for ambulance, and 119 for fire. In urgent situations, contact local emergency services directly.'],
    ],
  },
};

const pages = Object.keys(pageMeta);

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
  pricing: ['View travel passes', '/pricing'],
  terms: ['Read the terms', '/terms'],
  privacy: ['Read the privacy policy', '/privacy'],
  refund: ['Read the refund policy', '/refund'],
  contact: ['Contact support', '/contact'],
  about: ['Learn about ChinaEase Buddy', '/about'],
  unsubscribe: ['Contact support', '/contact'],
  'china-travel-apps': ['Open the app checklist', '/?journey=before&tool=apps'],
  'alipay-for-foreigners': ['Open payment setup tools', '/?journey=before&tool=payment'],
  'china-payment-guide': ['Open payment phrases', '/?journey=china&tool=pay'],
  'china-travel-checklist': ['View the trip checklist', '/?journey=before&tool=checklist'],
  'china-emergency-numbers': ['View emergency help', '/?journey=emergency'],
  faq: ['Open the free toolkit', '/'],
};

const relatedLinks = [
  ['All guides', '/guides'],
  ['China travel apps', '/china-travel-apps'],
  ['China payment guide', '/china-payment-guide'],
  ['China travel checklist', '/china-travel-checklist'],
  ['China emergency numbers', '/china-emergency-numbers'],
  ['FAQ', '/faq'],
];

const pageRelatedLinks = {
  'china-payment-guide': [
    ['Open payment phrases', '/?journey=china&tool=pay'],
    ['Alipay for Foreigners', '/alipay-for-foreigners'],
    ['China travel apps', '/china-travel-apps'],
    ['FAQ', '/faq'],
  ],
  pricing: [
    ['Home', '/'],
    ['Terms of Service', '/terms'],
    ['Privacy Policy', '/privacy'],
    ['Refund information', '/refund'],
  ],
};

const standardDisclaimer =
  'ChinaEase Buddy is a digital travel toolkit. It is not an official travel authority, visa service, immigration service, medical service, legal service, financial service, hotel booking service, or flight booking service. Always confirm important travel, payment, health, and entry information with official sources or service providers.';

function staticPageContent(page, meta) {
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
        <p style="margin: 0; color: #536365; line-height: 1.7;">${escapeHtml(meta.description)}</p>
      </section>
      <p style="margin: 0 0 20px; color: #6b7678; font-size: 0.9rem;">Last reviewed: June 12, 2026</p>
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
      <section aria-labelledby="practical-tips" style="margin: 0 0 24px;">
        <h2 id="practical-tips" style="margin: 0 0 12px; font-size: 1.25rem;">Practical tips</h2>
        <ul style="margin: 0; padding-left: 20px; color: #536365; line-height: 1.8;">
          <li>Prepare core China travel tools before arrival when possible.</li>
          <li>Keep backup options for payments, transport, and communication.</li>
          <li>Use bilingual phrases when you need to show clear Chinese text to local staff.</li>
        </ul>
      </section>
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
          <li>Official app instructions from Alipay, WeChat, Didi, Amap, and Trip.com.</li>
          <li>Your airline, hotel, card issuer, embassy, consulate, or relevant official authority for time-sensitive requirements.</li>
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
      '@id': `${siteUrl}/${page}#webpage`,
      url: `${siteUrl}/${page}`,
      name: meta.title,
      description: meta.description,
      isPartOf: {
        '@type': 'WebSite',
        name: 'ChinaEase Buddy',
        url: siteUrl,
      },
    },
  ];

  if (meta.faqs) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${siteUrl}/${page}#faq`,
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

  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph,
  })}</script>`;
}

function withPageMeta(html, page, meta) {
  const canonical = `${siteUrl}/${page}`;
  let next = html
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
    <loc>${siteUrl}${page ? `/${page}` : '/'}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>
`;

await writeFile(join(distDir, 'sitemap.xml'), sitemap);
await copyFile(source, join(distDir, '404.html'));

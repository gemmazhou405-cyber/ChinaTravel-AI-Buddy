import { ArrowLeft, Check } from 'lucide-react';

type PageType = 'pricing' | 'terms' | 'privacy' | 'refund';

interface Props {
  type: PageType;
}

const contactEmail = 'gemmazhou405@gmail.com';

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    note: 'Essential travel toolkit access',
    features: ['Basic phrase cards', 'Static travel guides', 'Limited Buddy AI quota'],
  },
  {
    name: 'Trip Pass',
    price: '$9.90',
    note: 'One-time payment',
    features: ['50 Buddy AI messages', '20 menu/photo scans', 'Unlocked travel phrase cards'],
    featured: true,
  },
  {
    name: 'Group Pass',
    price: '$39.90',
    note: 'One-time payment',
    features: ['200 Buddy AI messages', '100 menu/photo scans', 'Custom phrase helper access'],
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
          'Paid passes are covered by a 3-day refund policy. Refund eligibility may depend on usage of digital credits and service access.',
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
          'We may collect your email address, account plan, usage quota, basic app usage data, and information required to operate Buddy AI conversations and menu assistance.',
      },
      {
        title: 'Authentication and Storage',
        body:
          'ChinaEase Buddy uses Firebase Authentication for sign-in and Firebase Firestore to store account plan, quota, and related account data.',
      },
      {
        title: 'Buddy AI Conversations',
        body:
          'Buddy AI conversation content may be processed to provide the requested travel assistance, maintain service quality, and troubleshoot the service.',
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
        title: 'Eligibility',
        body:
          'Paid passes are eligible for a refund within 3 days of purchase. Refunds are only available if the pass has not been heavily used.',
      },
      {
        title: 'Usage-Based Review',
        body:
          'If a user has used a large portion of Buddy AI messages, menu scans, or custom phrase generation credits, the refund may be declined.',
      },
      {
        title: 'Payment Method',
        body:
          'Refunds are processed back to the original payment method. Processing times may depend on the payment provider.',
      },
      {
        title: 'No Auto-Renewal',
        body:
          'ChinaEase Buddy passes are one-time payments only. There is no auto-renewal and no subscription cancellation is needed.',
      },
      {
        title: 'Contact',
        body: `To request a refund, contact ${contactEmail}.`,
      },
    ],
  },
};

function PageShell({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  const assetBase = import.meta.env.BASE_URL;

  return (
    <main className="min-h-screen bg-[#f7f3ea] px-4 py-8 text-gray-900 md:px-6">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#155e63] hover:text-[#0e4a4e]">
          <ArrowLeft className="h-4 w-4" />
          Back to ChinaEase Buddy
        </a>

        <div className="rounded-3xl border border-[#155e63]/10 bg-white/85 p-5 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <img src={`${assetBase}logo.png`} width="42" height="42" alt="ChinaEase Buddy" className="rounded-xl" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#155e63]">ChinaEase Buddy</p>
              <h1 className="text-3xl font-bold tracking-tight text-gray-950">{title}</h1>
            </div>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-gray-500">{intro}</p>
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
      intro="ChinaEase Buddy offers one free plan and two one-time digital travel passes. No subscriptions, no auto-renewal."
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
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-[#155e63]/10 bg-[#155e63]/5 p-4">
        <p className="text-sm font-semibold text-[#155e63]">One-time payment, no auto-renewal, 3-day refund policy.</p>
      </div>
    </PageShell>
  );
}

function LegalPage({ type }: { type: 'terms' | 'privacy' | 'refund' }) {
  const page = legalCopy[type];
  return (
    <PageShell title={page.title} intro={page.intro}>
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

export function getPolicyPageType(pathname: string): PageType | null {
  const cleanPath = pathname.replace(/\/+$/, '');
  if (cleanPath.endsWith('/pricing')) return 'pricing';
  if (cleanPath.endsWith('/terms')) return 'terms';
  if (cleanPath.endsWith('/privacy')) return 'privacy';
  if (cleanPath.endsWith('/refund')) return 'refund';
  return null;
}

export default function PolicyPage({ type }: Props) {
  if (type === 'pricing') return <PricingPage />;
  return <LegalPage type={type} />;
}

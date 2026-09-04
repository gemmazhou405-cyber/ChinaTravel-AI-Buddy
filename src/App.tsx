import { useEffect, useState } from 'react';
import Hero from './components/Hero';
import LeadCaptureSection from './components/LeadCaptureSection';
import SiteHeader from './components/SiteHeader';
import TabNav from './components/TabNav';
import TabContent from './components/TabContent';
import Scenarios from './components/home/Scenarios';
import ToolkitGrid from './components/home/ToolkitGrid';
import BuddyDemo from './components/home/BuddyDemo';
import HomePasses from './components/home/HomePasses';
import ChatButton from './components/ChatButton';
import ChatModal from './components/ChatModal';
import Footer from './components/Footer';
import Toast from './components/Toast';
import PolicyPage, { getPolicyPageType } from './components/PolicyPage';
import ClaimModal from './components/ClaimModal';
import PassDashboard from './components/PassDashboard';
import { usePass } from './hooks/usePass';
import { useTranslation } from 'react-i18next';
import { initAttribution, trackEvent, trackEventOnce, markFunnelOnce } from './lib/analytics';

export type TabId = 'before' | 'stay' | 'food' | 'transport' | 'emergency' | 'pay';
export type JourneyId = 'before' | 'now' | 'emergency';

function parseLandingParams(): { journey: JourneyId; tab: TabId | null; tool: string | null } {
  const params = new URLSearchParams(window.location.search);
  const journeyParam = params.get('journey');
  const tool = params.get('tool');
  if (journeyParam === 'before') {
    const beforeTools: Record<string, string> = { apps: 'apps', payment: 'payment', checklist: 'checklist', city: 'city', transport: 'transport' };
    return { journey: 'before', tab: tool && beforeTools[tool] ? 'before' : null, tool: tool && beforeTools[tool] ? beforeTools[tool] : null };
  }
  if (journeyParam === 'emergency') return { journey: 'emergency', tab: 'emergency', tool: 'numbers' };
  if (journeyParam === 'china') {
    const chinaTabs: Record<string, TabId> = { transport: 'transport', stay: 'stay', food: 'food', pay: 'pay' };
    return { journey: 'now', tab: tool && chinaTabs[tool] ? chinaTabs[tool] : null, tool: tool && chinaTabs[tool] ? tool : null };
  }
  return { journey: 'now', tab: null, tool: null };
}

function analyticsJourney(journey: JourneyId) {
  return journey === 'now' ? 'china' : journey;
}

function deepLinkTargetId(landing: { journey: JourneyId; tab: TabId | null; tool: string | null }) {
  if (landing.journey === 'before') {
    const beforeTargets: Record<string, string> = { checklist: 'tool-checklist', apps: 'tool-apps', payment: 'tool-payment', transport: 'tool-transport', city: 'tool-city' };
    return landing.tool ? beforeTargets[landing.tool] : null;
  }
  if (landing.journey === 'now') {
    const nowTargets: Record<string, string> = { transport: 'phrase-category-taxi', stay: 'phrase-category-hotel', food: 'tool-food', pay: 'tool-pay' };
    return landing.tool ? nowTargets[landing.tool] : null;
  }
  if (landing.journey === 'emergency') return 'tool-emergency-numbers';
  return null;
}

function scrollToElementId(id: string) {
  const element = document.getElementById(id);
  if (!element) return false;
  const top = Math.max(element.getBoundingClientRect().top + window.scrollY - 76, 0);
  const scrollOptions: ScrollToOptions = { top, behavior: 'auto' };
  window.scrollTo(scrollOptions);
  document.documentElement.scrollTo(scrollOptions);
  document.body.scrollTo(scrollOptions);
  return true;
}

export default function App() {
  const { t } = useTranslation();
  const policyPageType = getPolicyPageType(window.location.pathname);
  const landing = parseLandingParams();
  const [activeTab, setActiveTab] = useState<TabId>(landing.tab ?? 'food');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPrefill, setChatPrefill] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toolOpen, setToolOpen] = useState(Boolean(landing.tab));
  const [deepTool, setDeepTool] = useState<string | null>(landing.tool);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimInitialTab, setClaimInitialTab] = useState<'claim' | 'recover'>('claim');
  const [dashOpen, setDashOpen] = useState(false);
  const { passState, refreshPassState } = usePass();
  const showToast = (msg: string) => setToast(msg);

  const handleUpgradeClick = (message = t('pay.upgradePrompt')) => {
    setActiveTab('pay');
    setToolOpen(true);
    showToast(message);
    window.setTimeout(() => {
      document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  useEffect(() => { initAttribution(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const journeyParam = params.get('journey');
    const toolParam = params.get('tool');
    if (journeyParam || toolParam) {
      trackEventOnce(
        `landing:${window.location.pathname}${window.location.search}`,
        'landing_deeplink_loaded',
        {
          journey: journeyParam || analyticsJourney(landing.journey),
          tool: toolParam || landing.tool || '',
          path: `${window.location.pathname}${window.location.search}`,
        },
      );
    }
  // Initial landing event only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (landing.tab) {
      const targetId = deepLinkTargetId(landing);
      const scrollTarget = () => {
        if (targetId && scrollToElementId(targetId)) return;
        scrollToElementId('tabs');
      };
      [250, 650, 1100, 1800, 2600].forEach((delay) => window.setTimeout(scrollTarget, delay));
    }
  // Run only for initial URL landing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openToolkit = (tab?: TabId, tool?: string) => {
    if (tab) setActiveTab(tab);
    setToolOpen(true);
    setDeepTool(tool ?? null);
    if (tab) {
      const params = new URLSearchParams();
      if (tab === 'before') { params.set('journey', 'before'); if (tool) params.set('tool', tool); }
      else if (tab === 'emergency') { params.set('journey', 'emergency'); }
      else { params.set('journey', 'china'); params.set('tool', tab); }
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    }
    void trackEvent('tool_category_opened', { journey: analyticsJourney(landing.journey), tool: tool ?? tab ?? activeTab, category: tool ?? tab ?? activeTab });
    window.setTimeout(() => {
      document.getElementById('tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const openBuddy = (prefill?: string) => {
    if (markFunnelOnce('buddy_opened')) {
      void trackEvent('buddy_opened', { journey: analyticsJourney(landing.journey), tool: deepTool || activeTab });
    }
    setChatPrefill(prefill ?? null);
    setChatOpen(true);
  };

  if (policyPageType) {
    return (
      <div className="min-h-screen bg-canvas pb-[env(safe-area-inset-bottom)] font-sans">
        <PolicyPage type={policyPageType} userId={undefined} />
        <Footer onOpenEmergency={() => { window.location.href = '/?journey=emergency'; }} />
      </div>
    );
  }

  const handlePrimaryCta = () => {
    void trackEvent('cta_clicked', { ctaName: 'Open Free Toolkit', destination: 'Tools', journey: analyticsJourney(landing.journey) });
    openToolkit();
  };

  const navigateToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openLeadCapture = () => {
    void trackEvent('lead_form_opened', { trigger: 'hero_cta', location: 'homepage_free_trip_plan' });
    window.setTimeout(() => scrollToElementId('free-trip-plan'), 0);
  };

  return (
    <div className="min-h-screen bg-canvas pb-[env(safe-area-inset-bottom)] font-sans">
      <SiteHeader
        passState={passState}
        onAskBuddy={() => openBuddy()}
        onOpenToolkit={handlePrimaryCta}
        onNavigate={navigateToSection}
        onViewPass={() => {
          if (passState && passState.tier !== 'free') {
            setDashOpen(true);
          } else {
            setClaimInitialTab('claim');
            setClaimOpen(true);
          }
        }}
      />

      <Hero onOpenToolkit={handlePrimaryCta} onAskBuddy={() => openBuddy()} onOpenLead={openLeadCapture} />

      <LeadCaptureSection />

      {toolOpen && (
        <div className="relative">
          <div id="tabs" className="sticky top-16 z-40 bg-white shadow-sm">
            <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          <TabContent
            activeTab={activeTab}
            passState={passState}
            showToast={showToast}
            onAskBuddy={() => openBuddy()}
            onUpgradeClick={handleUpgradeClick}
            deepTool={deepTool}
            onToolOpened={(category) => {
              void trackEvent('tool_category_opened', { journey: analyticsJourney(landing.journey), tool: deepTool || activeTab, category });
            }}
          />
        </div>
      )}

      <Scenarios onOpenTool={(tab, tool) => openToolkit(tab, tool)} />
      <ToolkitGrid onOpen={(tab, tool) => openToolkit(tab, tool)} />
      <BuddyDemo onAsk={(question) => openBuddy(question)} />

      <HomePasses
        passState={passState}
        showToast={showToast}
        onOpenToolkit={() => openToolkit()}
      />

      <Footer onOpenEmergency={() => openToolkit('emergency')} />

      <ChatButton onClick={() => openBuddy()} />
      {chatOpen && (
        <ChatModal
          onClose={() => setChatOpen(false)}
          passState={passState}
          refreshPassState={refreshPassState}
          initialPrompt={chatPrefill ?? undefined}
          onOpenToolkit={() => openToolkit()}
          onViewPricing={() => { setChatOpen(false); setClaimInitialTab('claim'); setClaimOpen(true); }}
        />
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      {claimOpen && (
        <ClaimModal
          initialTab={claimInitialTab}
          onClose={() => setClaimOpen(false)}
          onPassActivated={refreshPassState}
        />
      )}
      {dashOpen && passState && passState.tier !== 'free' && (
        <PassDashboard
          passState={passState}
          onClose={() => setDashOpen(false)}
          onAddDevice={() => { setDashOpen(false); setClaimInitialTab('recover'); setClaimOpen(true); }}
        />
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import Hero from './components/Hero';
import TabNav from './components/TabNav';
import TabContent from './components/TabContent';
import QuickActions from './components/QuickActions';
import ChatButton from './components/ChatButton';
import ChatModal from './components/ChatModal';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import PolicyPage, { getPolicyPageType } from './components/PolicyPage';
import { useAuth } from './hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { initAttribution, trackEvent, trackEventOnce } from './lib/analytics';

export type TabId = 'before' | 'stay' | 'food' | 'transport' | 'emergency' | 'pay';
export type JourneyId = 'before' | 'now' | 'emergency';

function parseLandingParams(): { journey: JourneyId; tab: TabId | null; tool: string | null } {
  const params = new URLSearchParams(window.location.search);
  const journeyParam = params.get('journey');
  const tool = params.get('tool');
  if (journeyParam === 'before') {
    const beforeTools: Record<string, string> = {
      apps: 'apps',
      payment: 'payment',
      checklist: 'checklist',
      city: 'city',
    };
    return { journey: 'before', tab: tool && beforeTools[tool] ? 'before' : null, tool: tool && beforeTools[tool] ? beforeTools[tool] : null };
  }
  if (journeyParam === 'emergency') {
    return { journey: 'emergency', tab: 'emergency', tool: 'numbers' };
  }
  if (journeyParam === 'china') {
    const chinaTabs: Record<string, TabId> = {
      transport: 'transport',
      stay: 'stay',
      food: 'food',
      pay: 'pay',
    };
    return { journey: 'now', tab: tool && chinaTabs[tool] ? chinaTabs[tool] : null, tool: tool && chinaTabs[tool] ? tool : null };
  }
  return { journey: 'now', tab: null, tool: null };
}

function analyticsJourney(journey: JourneyId) {
  return journey === 'now' ? 'china' : journey;
}

function deepLinkTargetId(landing: { journey: JourneyId; tab: TabId | null; tool: string | null }) {
  if (landing.journey === 'before') {
    const beforeTargets: Record<string, string> = {
      checklist: 'tool-checklist',
      apps: 'tool-apps',
      payment: 'tool-payment',
      transport: 'tool-transport',
      city: 'tool-city',
    };
    return landing.tool ? beforeTargets[landing.tool] : null;
  }
  if (landing.journey === 'now') {
    const nowTargets: Record<string, string> = {
      transport: 'phrase-category-taxi',
      stay: 'phrase-category-hotel',
      food: 'tool-food',
      pay: 'tool-pay',
    };
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
  const [authOpen, setAuthOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toolOpen, setToolOpen] = useState(Boolean(landing.tab));
  const [journey, setJourney] = useState<JourneyId>(landing.journey);
  const [deepTool, setDeepTool] = useState<string | null>(landing.tool);
  const { user, userState, logout, signup, login, loginWithGoogle, incrementAiUsed, resendVerificationEmail, resetPassword } = useAuth();
  const showToast = (msg: string) => setToast(msg);
  const handleUpgradeClick = (message = 'Unlock all phrase cards with Trip Pass.') => {
    setActiveTab('pay');
    setToolOpen(true);
    showToast(message);
    window.setTimeout(() => {
      document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };
  useEffect(() => {
    initAttribution();
  }, []);

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
        user?.uid,
      );
    }
  // Initial landing event only. User id may be absent for anonymous visitors.
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
  // Run only for initial URL landing.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickTabSelect = (tab: TabId, tool?: string) => {
    setActiveTab(tab);
    setToolOpen(true);
    setDeepTool(tool ?? null);
    void trackEvent('tool_category_opened', {
      journey: analyticsJourney(journey),
      tool: tool ?? tab,
      category: tool ?? tab,
    }, user?.uid);
    window.setTimeout(() => {
      document.getElementById('tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };
  const handleJourneyChange = (nextJourney: JourneyId) => {
    const previousJourney = journey;
    setJourney(nextJourney);
    void trackEvent('journey_selected', {
      selectedJourney: analyticsJourney(nextJourney),
      previousJourney: analyticsJourney(previousJourney),
    }, user?.uid);
  };
  const openBuddy = () => {
    void trackEvent('cta_clicked', {
      ctaName: 'Ask Buddy',
      destination: 'chat',
      journey: analyticsJourney(journey),
      tool: deepTool || activeTab,
    }, user?.uid);
    setChatOpen(true);
  };

  if (policyPageType) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] pb-[env(safe-area-inset-bottom)] font-sans">
        <PolicyPage type={policyPageType} userId={user?.uid} />
        <Footer onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ea] pb-[env(safe-area-inset-bottom)] font-sans">
      <Hero
        user={user}
        userState={userState}
        onAuthClick={() => {
          void trackEvent('cta_clicked', {
            ctaName: 'Start Free',
            destination: 'auth',
            journey: analyticsJourney(journey),
          }, user?.uid);
          setAuthOpen(true);
        }}
        onAskBuddy={openBuddy}
        onLogout={logout}
        onResendVerification={async () => {
          await resendVerificationEmail();
          showToast(t('auth.verificationSent'));
        }}
      />
      <QuickActions journey={journey} onJourneyChange={handleJourneyChange} onTabSelect={handleQuickTabSelect} onAskBuddy={openBuddy} />
      {toolOpen && (
        <>
          <div id="tabs" className="sticky top-0 z-40 bg-white shadow-sm">
            <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          <TabContent
            activeTab={activeTab}
            userState={userState}
            showToast={showToast}
            onAskBuddy={openBuddy}
            onUpgradeClick={handleUpgradeClick}
            deepTool={deepTool}
            onToolOpened={(category) => {
              void trackEvent('tool_category_opened', {
                journey: analyticsJourney(journey),
                tool: deepTool || activeTab,
                category,
              }, user?.uid);
            }}
          />
        </>
      )}
      <Footer
        onTabChange={(tab) => {
          setActiveTab(tab);
          setToolOpen(true);
          setDeepTool(null);
          void trackEvent('tool_category_opened', {
            journey: tab === 'before' || tab === 'emergency' ? tab : 'china',
            tool: tab,
            category: tab,
          }, user?.uid);
        }}
      />
      <ChatButton onClick={openBuddy} />
      {chatOpen && (
        <ChatModal
          onClose={() => setChatOpen(false)}
          user={user}
          userState={userState}
          onNeedAuth={() => {
            setChatOpen(false);
            setAuthOpen(true);
          }}
          onResendVerification={async () => {
            await resendVerificationEmail();
            showToast(t('auth.verificationSent'));
          }}
          onIncrementUsed={incrementAiUsed}
        />
      )}
      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onSignup={async (email, password) => {
            const result = await signup(email, password);
            showToast(t('auth.verifyBeforeBuddy'));
            return result;
          }}
          onLogin={login}
          onGoogleLogin={loginWithGoogle}
          onPasswordReset={resetPassword}
        />
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

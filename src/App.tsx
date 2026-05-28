import { useState } from 'react';
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

export type TabId = 'before' | 'stay' | 'food' | 'transport' | 'emergency' | 'pay';

export default function App() {
  const { t } = useTranslation();
  const policyPageType = getPolicyPageType(window.location.pathname);
  const [activeTab, setActiveTab] = useState<TabId>('food');
  const [chatOpen, setChatOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toolOpen, setToolOpen] = useState(false);
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
  const handleQuickTabSelect = (tab: TabId) => {
    setActiveTab(tab);
    setToolOpen(true);
    window.setTimeout(() => {
      document.getElementById('tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };
  const openBuddy = () => setChatOpen(true);

  if (policyPageType) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] font-sans">
        <PolicyPage type={policyPageType} />
        <Footer onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ea] font-sans">
      <Hero
        user={user}
        userState={userState}
        onAuthClick={() => setAuthOpen(true)}
        onAskBuddy={openBuddy}
        onLogout={logout}
        onResendVerification={async () => {
          await resendVerificationEmail();
          showToast(t('auth.verificationSent'));
        }}
      />
      <QuickActions onTabSelect={handleQuickTabSelect} onAskBuddy={openBuddy} />
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
          />
        </>
      )}
      <Footer
        onTabChange={(tab) => {
          setActiveTab(tab);
          setToolOpen(true);
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

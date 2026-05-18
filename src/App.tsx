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
import { useAuth } from './hooks/useAuth';

export type TabId = 'before' | 'stay' | 'food' | 'transport' | 'emergency' | 'pay';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('food');
  const [chatOpen, setChatOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { user, userState, logout, signup, login, incrementAiUsed, resendVerificationEmail } = useAuth();
  const showToast = (msg: string) => setToast(msg);
  const handleUpgradeClick = (message = 'Unlock all phrase cards with Trip Pass.') => {
    setActiveTab('pay');
    showToast(message);
    window.setTimeout(() => {
      document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };
  const handleQuickTabSelect = (tab: TabId) => {
    setActiveTab(tab);
    window.setTimeout(() => {
      document.getElementById('tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };
  const openBuddy = () => setChatOpen(true);

  return (
    <div className="min-h-screen bg-[#f7f3ea] font-sans">
      <Hero
        user={user}
        userState={userState}
        onAuthClick={() => setAuthOpen(true)}
        onAskBuddy={openBuddy}
        onLogout={logout}
      />
      <QuickActions onTabSelect={handleQuickTabSelect} onAskBuddy={openBuddy} />
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
      <Footer onTabChange={setActiveTab} />
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
            showToast('Verification email sent.');
          }}
          onIncrementUsed={incrementAiUsed}
        />
      )}
      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onSignup={async (email, password) => {
            const result = await signup(email, password);
            showToast('Please verify your email before using Buddy AI.');
            return result;
          }}
          onLogin={login}
        />
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

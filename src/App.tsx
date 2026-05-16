import { useState } from 'react';
import Hero from './components/Hero';
import TabNav from './components/TabNav';
import TabContent from './components/TabContent';
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
  const { user, userState, logout, signup, login, incrementAiUsed } = useAuth();
  const showToast = (msg: string) => setToast(msg);

  return (
    <div className="min-h-screen bg-[#f7f3ea] font-sans">
      <Hero
        user={user}
        userState={userState}
        onAuthClick={() => setAuthOpen(true)}
        onLogout={logout}
      />
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <TabContent activeTab={activeTab} userState={userState} showToast={showToast} />
      <Footer />
      <ChatButton onClick={() => setChatOpen(true)} />
      {chatOpen && (
        <ChatModal
          onClose={() => setChatOpen(false)}
          userState={userState}
          onNeedAuth={() => {
            setChatOpen(false);
            setAuthOpen(true);
          }}
          onIncrementUsed={incrementAiUsed}
        />
      )}
      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onSignup={signup}
          onLogin={login}
        />
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

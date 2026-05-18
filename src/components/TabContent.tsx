import { TabId } from '../App';
import FoodTab from './tabs/FoodTab';
import EmergencyTab from './tabs/EmergencyTab';
import BeforeTab from './tabs/BeforeTab';
import StayTab from './tabs/StayTab';
import TransportTab from './tabs/TransportTab';
import PayTab from './tabs/PayTab';
import { UserState } from '../hooks/useAuth';

interface Props {
  activeTab: TabId;
  userState: UserState | null;
  showToast: (msg: string) => void;
  onAskBuddy: () => void;
  onUpgradeClick: (message?: string) => void;
}

export default function TabContent({ activeTab, userState, showToast, onAskBuddy, onUpgradeClick }: Props) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-6 md:px-6 pb-28">
      {activeTab === 'before' && <BeforeTab />}
      {activeTab === 'stay' && <StayTab userState={userState} showToast={showToast} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} />}
      {activeTab === 'food' && <FoodTab userState={userState} showToast={showToast} onAskBuddy={onAskBuddy} />}
      {activeTab === 'transport' && <TransportTab userState={userState} showToast={showToast} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} />}
      {activeTab === 'emergency' && <EmergencyTab userState={userState} showToast={showToast} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} />}
      {activeTab === 'pay' && <PayTab userState={userState} showToast={showToast} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} />}
    </main>
  );
}

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
  deepTool?: string | null;
}

export default function TabContent({ activeTab, userState, showToast, onAskBuddy, onUpgradeClick, deepTool }: Props) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-6 md:px-6 pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-28">
      {activeTab === 'before' && <BeforeTab userState={userState} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} deepTool={deepTool} />}
      {activeTab === 'stay' && <StayTab userState={userState} showToast={showToast} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} deepTool={deepTool} />}
      {activeTab === 'food' && <FoodTab userState={userState} showToast={showToast} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} deepTool={deepTool} />}
      {activeTab === 'transport' && <TransportTab userState={userState} showToast={showToast} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} deepTool={deepTool} />}
      {activeTab === 'emergency' && <EmergencyTab userState={userState} showToast={showToast} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} deepTool={deepTool} />}
      {activeTab === 'pay' && <PayTab userState={userState} showToast={showToast} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} deepTool={deepTool} />}
    </main>
  );
}

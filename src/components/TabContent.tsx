import { TabId } from '../App';
import FoodTab from './tabs/FoodTab';
import EmergencyTab from './tabs/EmergencyTab';
import BeforeTab from './tabs/BeforeTab';
import StayTab from './tabs/StayTab';
import TransportTab from './tabs/TransportTab';
import PayTab from './tabs/PayTab';
import { UserState } from '../hooks/useAuth';
import type { User } from 'firebase/auth';

interface Props {
  activeTab: TabId;
  user: User | null;
  userState: UserState | null;
  showToast: (msg: string) => void;
  onNeedAuth: () => void;
  onAskBuddy: () => void;
  onUpgradeClick: (message?: string) => void;
  onRefreshUserState?: () => Promise<UserState | null>;
  deepTool?: string | null;
  onToolOpened?: (category: string) => void;
}

export default function TabContent({ activeTab, user, userState, showToast, onNeedAuth, onAskBuddy, onUpgradeClick, onRefreshUserState, deepTool, onToolOpened }: Props) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-6 md:px-6 pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-28">
      {activeTab === 'before' && <BeforeTab userState={userState} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} deepTool={deepTool} onToolOpened={onToolOpened} />}
      {activeTab === 'stay' && <StayTab userState={userState} showToast={showToast} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} deepTool={deepTool} onToolOpened={onToolOpened} />}
      {activeTab === 'food' && <FoodTab userState={userState} showToast={showToast} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} deepTool={deepTool} onToolOpened={onToolOpened} />}
      {activeTab === 'transport' && <TransportTab userState={userState} showToast={showToast} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} deepTool={deepTool} onToolOpened={onToolOpened} />}
      {activeTab === 'emergency' && <EmergencyTab userState={userState} showToast={showToast} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} deepTool={deepTool} onToolOpened={onToolOpened} />}
      {activeTab === 'pay' && <PayTab user={user} userState={userState} showToast={showToast} onNeedAuth={onNeedAuth} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} onRefreshUserState={onRefreshUserState} deepTool={deepTool} onToolOpened={onToolOpened} />}
    </main>
  );
}

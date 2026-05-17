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
  onUpgradeClick: () => void;
}

export default function TabContent({ activeTab, userState, showToast, onUpgradeClick }: Props) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-6 md:px-6 pb-28">
      {activeTab === 'before' && <BeforeTab />}
      {activeTab === 'stay' && <StayTab showToast={showToast} onUpgradeClick={onUpgradeClick} />}
      {activeTab === 'food' && <FoodTab showToast={showToast} />}
      {activeTab === 'transport' && <TransportTab showToast={showToast} onUpgradeClick={onUpgradeClick} />}
      {activeTab === 'emergency' && <EmergencyTab showToast={showToast} onUpgradeClick={onUpgradeClick} />}
      {activeTab === 'pay' && <PayTab userState={userState} onUpgradeClick={onUpgradeClick} />}
    </main>
  );
}

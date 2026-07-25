import { TabId } from '../App';
import FoodTab from './tabs/FoodTab';
import EmergencyTab from './tabs/EmergencyTab';
import BeforeTab from './tabs/BeforeTab';
import StayTab from './tabs/StayTab';
import TransportTab from './tabs/TransportTab';
import PayTab from './tabs/PayTab';
import type { PassState } from '../hooks/usePass';

interface Props {
  activeTab: TabId;
  passState: PassState | null;
  showToast: (msg: string) => void;
  onAskBuddy: () => void;
  onUpgradeClick: (message?: string) => void;
  deepTool?: string | null;
  onToolOpened?: (category: string) => void;
}

export default function TabContent({ activeTab, passState, showToast, onAskBuddy, onUpgradeClick, deepTool, onToolOpened }: Props) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-6 md:px-6 pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-28">
      {activeTab === 'before' && <BeforeTab passState={passState} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} deepTool={deepTool} onToolOpened={onToolOpened} />}
      {activeTab === 'stay' && <StayTab passState={passState} showToast={showToast} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} deepTool={deepTool} onToolOpened={onToolOpened} />}
      {activeTab === 'food' && <FoodTab passState={passState} showToast={showToast} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} deepTool={deepTool} onToolOpened={onToolOpened} />}
      {activeTab === 'transport' && <TransportTab passState={passState} showToast={showToast} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} deepTool={deepTool} onToolOpened={onToolOpened} />}
      {activeTab === 'emergency' && <EmergencyTab passState={passState} showToast={showToast} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} deepTool={deepTool} onToolOpened={onToolOpened} />}
      {activeTab === 'pay' && <PayTab passState={passState} showToast={showToast} onAskBuddy={onAskBuddy} onUpgradeClick={onUpgradeClick} deepTool={deepTool} onToolOpened={onToolOpened} />}
    </main>
  );
}

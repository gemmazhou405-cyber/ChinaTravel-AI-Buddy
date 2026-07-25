import { useState, useEffect, useCallback } from 'react';

export interface PassState {
  tier: 'free' | 'trip' | 'group';
  expiresAt?: number | null;
  messagesUsed?: number;
  messageAllowance?: number;
  remaining?: number;
  expired?: boolean;
  deviceCount?: number;
  maxDevices?: number;
}

export function usePass() {
  const [passState, setPassState] = useState<PassState>({ tier: 'free' });
  const [loading, setLoading] = useState(true);

  const fetchPass = useCallback(async () => {
    try {
      const res = await fetch('/api/pass', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json() as PassState;
        setPassState(data);
      } else {
        setPassState({ tier: 'free' });
      }
    } catch {
      setPassState({ tier: 'free' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchPass(); }, [fetchPass]);

  const refreshPassState = useCallback(async () => {
    await fetchPass();
  }, [fetchPass]);

  return { passState, loading, refreshPassState };
}

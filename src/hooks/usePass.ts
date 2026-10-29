import { useState, useEffect, useCallback, useRef } from 'react';

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
  const latestRequest = useRef(0);

  const fetchPass = useCallback(async () => {
    const requestId = ++latestRequest.current;
    let nextState: PassState = { tier: 'free' };
    try {
      const res = await fetch('/api/pass', { credentials: 'include' });
      if (res.ok) {
        nextState = await res.json() as PassState;
      }
    } catch {
      // An unavailable entitlement check fails closed.
    } finally {
      if (requestId === latestRequest.current) {
        setPassState(nextState);
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const refresh = () => { void fetchPass(); };
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    refresh();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      latestRequest.current++;
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [fetchPass]);

  const refreshPassState = useCallback(async () => {
    await fetchPass();
  }, [fetchPass]);

  return { passState, loading, refreshPassState };
}

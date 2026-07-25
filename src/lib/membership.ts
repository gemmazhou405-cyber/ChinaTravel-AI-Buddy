import type { PassState } from '../hooks/usePass';

export function isTripOrGroup(passState: PassState | null): boolean {
  if (!passState || passState.tier === 'free' || passState.expired) return false;
  return passState.tier === 'trip' || passState.tier === 'group';
}

export function isGroup(passState: PassState | null): boolean {
  if (!passState || passState.expired) return false;
  return passState.tier === 'group';
}

export function getPlanTier(passState: PassState | null): 'free' | 'trip' | 'group' {
  if (!passState || passState.tier === 'free' || passState.expired) return 'free';
  return passState.tier;
}

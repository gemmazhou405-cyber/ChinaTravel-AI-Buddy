import type { UserState } from '../hooks/useAuth';

type Plan = 'free' | 'trip' | 'group';

export function isPlanActive(userState: UserState | null): boolean {
  if (!userState) return false;
  if (!userState.planExpiresAt) return true;
  return Date.now() < userState.planExpiresAt;
}

export function getPlan(userState: UserState | null): Plan {
  if (!userState || !isPlanActive(userState)) return 'free';
  return userState.plan;
}

export function isTripOrGroup(userState: UserState | null): boolean {
  const plan = getPlan(userState);
  return plan === 'trip' || plan === 'group';
}

export function isGroup(userState: UserState | null): boolean {
  return getPlan(userState) === 'group';
}

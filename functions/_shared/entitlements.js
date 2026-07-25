import { getDoc } from './firestore.js';

export async function activePassForId(env, passId) {
  const pass = await getDoc(env, `passes/${passId}`);
  if (!pass) return { active: false, pass: null };
  const now = Date.now();
  return {
    active: (!pass.expiresAt || pass.expiresAt > now) && (pass.messagesUsed ?? 0) < (pass.messageAllowance ?? 0),
    pass,
  };
}

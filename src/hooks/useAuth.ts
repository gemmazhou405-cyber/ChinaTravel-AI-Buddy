import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { PLAN_LIMITS, auth, db } from '../firebase-config';

export interface UserState {
  uid: string;
  email: string;
  plan: 'free' | 'trip' | 'group';
  planExpiresAt: number | null;
  buddyAiQuotaTotal: number;
  buddyAiQuotaUsed: number;
  menuScanQuotaTotal: number;
  menuScanQuotaUsed: number;
  dailyBuddyAiLimit: number;
  dailyBuddyAiUsed: number;
  dailyResetAt: number | null;
}

type StoredUserState = Partial<UserState> & {
  aiUsed?: number;
};

function normalizeUserState(data: StoredUserState, uid: string, email: string): UserState {
  const plan = data.plan && data.plan in PLAN_LIMITS ? data.plan : 'free';
  const limits = PLAN_LIMITS[plan];
  const legacyAiUsed = typeof data.aiUsed === 'number' ? data.aiUsed : 0;

  return {
    uid: data.uid || uid,
    email: data.email || email,
    plan,
    planExpiresAt: data.planExpiresAt ?? null,
    buddyAiQuotaTotal: data.buddyAiQuotaTotal ?? limits.buddyAi,
    buddyAiQuotaUsed: data.buddyAiQuotaUsed ?? legacyAiUsed,
    menuScanQuotaTotal: data.menuScanQuotaTotal ?? limits.menuScan,
    menuScanQuotaUsed: data.menuScanQuotaUsed ?? 0,
    dailyBuddyAiLimit: data.dailyBuddyAiLimit ?? limits.dailyBuddyAi,
    dailyBuddyAiUsed: data.dailyBuddyAiUsed ?? 0,
    dailyResetAt: data.dailyResetAt ?? null,
  };
}

async function sendWelcomeEmail(email: string) {
  try {
    await fetch('https://chinaease-proxy.gemmazhou405.workers.dev/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: 'Welcome to ChinaEase Buddy! Your China survival kit is inside',
        apiUser: 'sc_r79xzc_test_ukEDGD',
        from: 'noreply@r79xzc.sendcloud.org',
        fromName: 'ChinaEase Buddy',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <img src="https://gemmazhou405-cyber.github.io/ChinaTravel-AI-Buddy/email_header.jpg" 
                 style="width:100%;border-radius:12px;margin-bottom:24px">
            <h2 style="color:#155e63">Welcome to ChinaEase Buddy!</h2>
            <p>Your China survival kit is ready. Here's what to do next:</p>
            <ol>
              <li><strong>Add to home screen</strong> — save the app for offline use</li>
              <li><strong>Review Arrival Guide</strong> — set up Alipay before landing</li>
              <li><strong>Try Buddy AI</strong> — you have 5 free messages waiting</li>
            </ol>
            <a href="https://gemmazhou405-cyber.github.io/ChinaTravel-AI-Buddy/"
               style="display:inline-block;background:#155e63;color:white;
                      padding:12px 24px;border-radius:8px;text-decoration:none;
                      font-weight:bold;margin-top:16px">
              Open ChinaEase Buddy
            </a>
            <p style="color:#888;font-size:12px;margin-top:32px">
              ChinaEase Buddy · AI Travel Companion for China
            </p>
          </div>
        `,
      }),
    });
  } catch (e) {
    console.log('Email send skip:', e);
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setUserState(normalizeUserState(snap.data() as StoredUserState, u.uid, u.email || ''));
        }
      } else {
        setUserState(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signup = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const newUser: UserState = {
      uid: cred.user.uid,
      email,
      plan: 'free',
      planExpiresAt: null,
      buddyAiQuotaTotal: 5,
      buddyAiQuotaUsed: 0,
      menuScanQuotaTotal: 3,
      menuScanQuotaUsed: 0,
      dailyBuddyAiLimit: 5,
      dailyBuddyAiUsed: 0,
      dailyResetAt: null,
    };
    await setDoc(doc(db, 'users', cred.user.uid), newUser);
    sendWelcomeEmail(email);
    setUserState(newUser);
    return cred.user;
  };

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    if (snap.exists()) {
      setUserState(normalizeUserState(snap.data() as StoredUserState, cred.user.uid, cred.user.email || email));
    }
    return cred.user;
  };

  const logout = () => {
    setUserState(null);
    return signOut(auth);
  };

  const incrementAiUsed = async () => {
    if (!user || !userState) return;

    const now = Date.now();

    if (userState.planExpiresAt && now > userState.planExpiresAt) {
      return;
    }

    const oneDayMs = 24 * 60 * 60 * 1000;
    const shouldResetDaily = !userState.dailyResetAt || now - userState.dailyResetAt > oneDayMs;

    const newDailyUsed = shouldResetDaily ? 1 : userState.dailyBuddyAiUsed + 1;
    const newDailyResetAt = shouldResetDaily ? now : userState.dailyResetAt;
    const newTotalUsed = userState.buddyAiQuotaUsed + 1;

    const updates = {
      buddyAiQuotaUsed: newTotalUsed,
      dailyBuddyAiUsed: newDailyUsed,
      dailyResetAt: newDailyResetAt,
    };

    await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
    setUserState((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return { user, userState, loading, signup, login, logout, incrementAiUsed };
}

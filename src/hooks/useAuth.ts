import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
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
  void email;
  // Welcome email delivery should run through a server endpoint, not a public client-side worker URL.
}

function createFreeUserState(uid: string, email: string): UserState {
  return {
    uid,
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
        } else {
          setUserState(null);
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
    const newUser = createFreeUserState(cred.user.uid, email);
    await setDoc(doc(db, 'users', cred.user.uid), newUser);
    await sendEmailVerification(cred.user);
    sendWelcomeEmail(email);
    setUserState(newUser);
    return cred.user;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const signedInUser = auth.currentUser || cred.user;
    const email = signedInUser.email || cred.user.email || '';
    const userRef = doc(db, 'users', signedInUser.uid);
    const snap = await getDoc(userRef);
    let nextUserState: UserState;

    if (snap.exists()) {
      nextUserState = normalizeUserState(snap.data() as StoredUserState, signedInUser.uid, email);
    } else {
      nextUserState = createFreeUserState(signedInUser.uid, email);
      await setDoc(userRef, nextUserState);
      sendWelcomeEmail(email);
    }

    setUser(signedInUser);
    setUserState(nextUserState);
    setLoading(false);
    return signedInUser;
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

  const resendVerificationEmail = async () => {
    if (!user) return;
    await sendEmailVerification(user);
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const refreshUserState = async () => {
    const current = auth.currentUser;
    if (!current) {
      setUserState(null);
      return null;
    }
    const snap = await getDoc(doc(db, 'users', current.uid));
    if (!snap.exists()) {
      setUserState(null);
      return null;
    }
    const next = normalizeUserState(snap.data() as StoredUserState, current.uid, current.email || '');
    setUser(current);
    setUserState(next);
    return next;
  };

  return { user, userState, loading, signup, login, loginWithGoogle, logout, resendVerificationEmail, resetPassword, refreshUserState };
}

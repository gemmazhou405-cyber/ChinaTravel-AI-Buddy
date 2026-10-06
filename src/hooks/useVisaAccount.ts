import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';

async function loadFirebaseAuth() {
  const [{ firebaseAuth }, authApi] = await Promise.all([
    import('../firebase-client'),
    import('firebase/auth'),
  ]);
  return { firebaseAuth, authApi };
}

export function useVisaAccount() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let active = true;
    void loadFirebaseAuth()
      .then(({ firebaseAuth, authApi }) => {
        if (!active) return;
        unsubscribe = authApi.onAuthStateChanged(firebaseAuth, (nextUser) => {
          setUser(nextUser);
          setLoading(false);
        });
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const signup = async (email: string, password: string) => {
    const { firebaseAuth, authApi } = await loadFirebaseAuth();
    const credential = await authApi.createUserWithEmailAndPassword(firebaseAuth, email, password);
    await authApi.sendEmailVerification(credential.user).catch(() => undefined);
    return credential.user;
  };

  const login = async (email: string, password: string) => {
    const { firebaseAuth, authApi } = await loadFirebaseAuth();
    const credential = await authApi.signInWithEmailAndPassword(firebaseAuth, email, password);
    return credential.user;
  };

  const loginWithGoogle = async () => {
    const { firebaseAuth, authApi } = await loadFirebaseAuth();
    const credential = await authApi.signInWithPopup(firebaseAuth, new authApi.GoogleAuthProvider());
    return credential.user;
  };

  const resetPassword = async (email: string) => {
    const { firebaseAuth, authApi } = await loadFirebaseAuth();
    await authApi.sendPasswordResetEmail(firebaseAuth, email);
  };

  return { user, loading, signup, login, loginWithGoogle, resetPassword };
}

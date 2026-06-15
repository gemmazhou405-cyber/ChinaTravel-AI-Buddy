import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA_sXPJ0TPlRNCkNk2uIlNTItLSv2IUFPg',
  authDomain: 'chinaease-buddy.firebaseapp.com',
  projectId: 'chinaease-buddy',
  storageBucket: 'chinaease-buddy.appspot.com',
  messagingSenderId: '602892457766',
  appId: '1:602892457766:web:6bfadfbd18357582cbd3e7',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const PLAN_LIMITS = {
  free: { buddyAi: 5, menuScan: 3, dailyBuddyAi: 5, durationDays: null },
  trip: { buddyAi: 50, menuScan: 20, dailyBuddyAi: 20, durationDays: 7 },
  group: { buddyAi: 200, menuScan: 100, dailyBuddyAi: 50, durationDays: 14 },
} as const;

export const PAYPAL_USERNAME = '';

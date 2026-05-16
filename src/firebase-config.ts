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
  free: 2,
  trip: 50,
  group: 200,
} as const;

export const COZE_WORKER_URL = 'https://chinaease-proxy.gemmazhou405.workers.dev';
export const COZE_BOT_ID = '7635204351933497390';
export const PAYPAL_USERNAME = '';

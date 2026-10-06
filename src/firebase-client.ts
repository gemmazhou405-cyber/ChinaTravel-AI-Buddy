import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase web configuration identifies the public client app. It is not a
// service credential; privileged Firebase access remains server-only.
const firebaseConfig = {
  apiKey: 'AIzaSyA_sXPJ0TPlRNCkNk2uIlNTItLSv2IUFPg',
  authDomain: 'chinaease-buddy.firebaseapp.com',
  projectId: 'chinaease-buddy',
  storageBucket: 'chinaease-buddy.appspot.com',
  messagingSenderId: '602892457766',
  appId: '1:602892457766:web:6bfadfbd18357582cbd3e7',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);

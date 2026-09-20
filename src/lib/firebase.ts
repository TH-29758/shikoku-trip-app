import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyCa1FDH3JvVFEhzFknf5415Vjy6Dga4VJg",
  authDomain: "shikokutrip2026.firebaseapp.com",
  projectId: "shikokutrip2026",
  storageBucket: "shikokutrip2026.firebasestorage.app",
  messagingSenderId: "1082645374265",
  appId: "1:1082645374265:web:9e9eb53e182355db5d34e8"
};


export const db = initializeFirestore(initializeApp(firebaseConfig), { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });

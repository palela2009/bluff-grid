import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDb3h0IpXEu15WuCiAx_SkbKDrrKoawvbM",
  authDomain: "bluff-grid-8cdfa.firebaseapp.com",
  projectId: "bluff-grid-8cdfa",
  storageBucket: "bluff-grid-8cdfa.firebasestorage.app",
  messagingSenderId: "148747345875",
  appId: "1:148747345875:web:bd50ce478edd6435dc1926"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
const facebookProvider = new FacebookAuthProvider();

// Set persistence without top-level await for better mobile compatibility
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Failed to set persistence:', error);
});

export { auth, googleProvider, facebookProvider };

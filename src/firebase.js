// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyA-lPz7Ojjpv_o4EIFwbIUpV54ZCsPVeIE",
  authDomain: "dw-book-rental.firebaseapp.com",
  projectId: "dw-book-rental",
  storageBucket: "dw-book-rental.appspot.com",
  messagingSenderId: "191103254450",
  appId: "1:191103254450:web:038689a9bcac8e0cfb2eab",
};

const app = initializeApp(firebaseConfig);

// 개발 편의: dev에서 App Check 디버그 토큰
if (import.meta.env.DEV) {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

// App Check(reCAPTCHA v3) — 환경변수로 주입
const siteKey = import.meta.env.VITE_APPCHECK_SITE_KEY;
if (!siteKey) {
  console.error("[AppCheck] Missing VITE_APPCHECK_SITE_KEY env variable.");
}
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(siteKey),
  isTokenAutoRefreshEnabled: true,
});

export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ 로그인 퍼시스턴스 보장
export const authReady = setPersistence(auth, browserLocalPersistence)
  .then(() => true)
  .catch((e) => {
    console.error("[Auth] setPersistence failed:", e);
    return false;
  });

export default app;

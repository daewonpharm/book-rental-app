// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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

// 개발 편의(선택): dev에서 App Check 디버그 토큰 자동 등록
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-undef
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

// App Check(reCAPTCHA v3) — 환경변수로만 주입
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

// ✅ auth 퍼시스턴스를 보장시키기 위한 준비 Promise를 함께 export
//    (로그인 전에 반드시 완료되도록 사용)
import { setPersistence, browserLocalPersistence } from "firebase/auth";
export const authReady = setPersistence(getAuth(app), browserLocalPersistence)
  .then(() => true)
  .catch((e) => {
    console.error("[Auth] setPersistence failed:", e);
    return false;
  });

export default app;

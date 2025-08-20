// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// ✅ 너가 준 Firebase 웹앱 설정
const firebaseConfig = {
  apiKey: "AIzaSyA-lPz7Ojjpv_o4EIFwbIUpV54ZCsPVeIE",
  authDomain: "dw-book-rental.firebaseapp.com",
  projectId: "dw-book-rental",
  storageBucket: "dw-book-rental.firebasestorage.app",
  messagingSenderId: "191103254450",
  appId: "1:191103254450:web:038689a9bcac8e0cfb2eab",
};

// ✅ reCAPTCHA v3 Site Key (공개 가능, 너가 준 값)
const APPCHECK_SITE_KEY = "6Lfm9asrAAAAAHK4gXp-bWrQnzKLnC4qSbIgImkZ";

// --- 초기화 순서 중요: App → AppCheck → Firestore ---
const app = initializeApp(firebaseConfig);

// (선택) 로컬에서만 디버그 토큰 쓰고 싶으면 아래 주석 해제
// if (import.meta.env.DEV) self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(APPCHECK_SITE_KEY),
  isTokenAutoRefreshEnabled: true,
});

export const db = getFirestore(app);
// (필요하면) app도 export 가능
export { app };

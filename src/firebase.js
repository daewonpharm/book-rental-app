// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  getToken as getAppCheckToken,
} from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyA-lPz7Ojjpv_o4EIFwbIUpV54ZCsPVeIE",
  authDomain: "dw-book-rental.firebaseapp.com",
  projectId: "dw-book-rental",
  storageBucket: "dw-book-rental.appspot.com",
  messagingSenderId: "191103254450",
  appId: "1:191103254450:web:038689a9bcac8e0cfb2eab",
};

// -------------------- Firebase 기본 초기화 --------------------
const app = initializeApp(firebaseConfig);

// (선택) 개발 환경에서 App Check 디버그 토큰
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-undef
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

// -------------------- App Check(reCAPTCHA v3) --------------------
// 환경변수 우선, 없으면 네가 준 site key(공개 키라 하드코딩 가능)
const SITE_KEY =
  import.meta.env.VITE_APPCHECK_SITE_KEY ||
  "6Lc2OK0rAAAAAGtCAkm1HHjxXpZak6EvDXdMCffT";

if (!SITE_KEY) {
  console.error("[AppCheck] SITE_KEY가 비었습니다.");
}

// App Check 초기화
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(SITE_KEY),
  isTokenAutoRefreshEnabled: true,
});

// ✅ reCAPTCHA 콘솔 상태 '미완료' 해소용: 첫 로드 때 토큰 강제 1회 요청
getAppCheckToken(appCheck, /* forceRefresh */ true)
  .then(() => {
    // console.log("[AppCheck] token acquired");
  })
  .catch((e) => {
    console.error("[AppCheck] token request failed:", e);
  });

// -------------------- 내보내기 --------------------
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

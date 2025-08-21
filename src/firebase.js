// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
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

const app = initializeApp(firebaseConfig);

// ▼ 개발 중이면 디버그 토큰(선택)
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-undef
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

// ▼ App Check(reCAPTCHA v3) – 네가 발급한 키를 그대로 사용
const SITE_KEY = import.meta.env.VITE_APPCHECK_SITE_KEY || "6Lc2OK0rAAAAAGtCAkm1HHjxXpZak6EvDXdMCffT";
if (!SITE_KEY) console.error("[AppCheck] site key가 비었습니다.");

// App Check 초기화
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(SITE_KEY),
  isTokenAutoRefreshEnabled: true,
});

// ▼ 키 상태 “미완료” 해소용: 첫 로드 때 즉시 토큰을 한 번 요청
//    (이 호출이 성공하면 reCAPTCHA 콘솔에서 상태가 완료로 바뀜)
(async () => {
  try {
    const t = await getAppCheckToken(appCheck, /* forceRefresh */ true);
    console.log("[AppCheck] token acquired:", !!t.token);
  } catch (e) {
    console.error("[AppCheck] token request failed:", e);
  }
})();

// ▼ 로그인 유지(퍼시스턴스) 보장
const auth = getAuth(app);
await setPersistence(auth, browserLocalPersistence).catch((e) =>
  console.error("[Auth] setPersistence failed:", e)
);

export { app, auth };
export const db = getFirestore(app);
export default app;

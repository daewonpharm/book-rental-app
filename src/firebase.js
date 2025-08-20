// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  getToken, // ← getAppCheck 말고 getToken만 사용
} from "firebase/app-check";

// ✅ 네가 준 Firebase 웹앱 설정
const firebaseConfig = {
  apiKey: "AIzaSyA-lPz7Ojjpv_o4EIFwbIUpV54ZCsPVeIE",
  authDomain: "dw-book-rental.firebaseapp.com",
  projectId: "dw-book-rental",
  storageBucket: "dw-book-rental.firebasestorage.app",
  messagingSenderId: "191103254450",
  appId: "1:191103254450:web:038689a9bcac8e0cfb2eab",
};

// ✅ reCAPTCHA v3 Site Key
const APPCHECK_SITE_KEY = "6Lfm9asrAAAAAHK4gXp-bWrQnzKLnC4qSbIgImkZ";

// 중복 초기화 방지
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// (선택) 로컬에서 디버그 토큰 쓰려면 주석 해제 후, 콘솔에 나온 토큰을
// Firebase 콘솔(App Check) > 디버그 토큰에 등록
// if (import.meta.env.DEV) self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

// ✅ App Check는 Firestore보다 "먼저"
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(APPCHECK_SITE_KEY),
  isTokenAutoRefreshEnabled: true,
});

// ✅ Firestore
export const db = getFirestore(app);
export { app };

// -----------------------------
// 🔎 디버그: 토큰 발급/오류 콘솔 확인
// -----------------------------
if (import.meta.env.DEV) {
  getToken(appCheck, /* forceRefresh */ true)
    .then((res) => {
      console.log("✅ [AppCheck] token issued:", (res?.token || "").slice(0, 28) + "...");
    })
    .catch((err) => {
      console.error("❌ [AppCheck] getToken error:", err);
      console.warn(
        "체크 목록: (1) reCAPTCHA 도메인에 localhost/127.0.0.1 등록, " +
        "(2) main.jsx 최상단 import './firebase', " +
        "(3) App Check > API 탭에서 Cloud Firestore '강제' ON"
      );
    });
}

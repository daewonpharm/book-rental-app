// src/auth.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

// === Firebase config (from your console) ===
const firebaseConfig = {
  apiKey: "AIzaSyA-lPz7Ojjpv_o4EIFwbIUpV54ZCsPVeIE",
  authDomain: "dw-book-rental.firebaseapp.com",
  projectId: "dw-book-rental",
  storageBucket: "dw-book-rental.appspot.com", // ← 표준 버킷 도메인
  messagingSenderId: "191103254450",
  appId: "1:191103254450:web:038689a9bcac8e0cfb2eab",
};

// ---- Singleton App/Auth ----
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ---- Provider ----
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

// ---- 로그인: 팝업 우선 → 실패 시 Redirect 폴백 ----
export async function login() {
  // 세션 영속성: 로컬 (탭/창 닫아도 유지)
  await setPersistence(auth, browserLocalPersistence).catch((e) => {
    console.error("[Auth] setPersistence error:", e);
  });

  try {
    // iOS/사파리/팝업차단 의심 환경은 바로 redirect가 더 안전
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isIOS) {
      console.log("[Auth] using redirect (iOS suspected)");
      await signInWithRedirect(auth, provider);
      return;
    }

    console.log("[Auth] trying popup");
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error("[Auth] popup error:", e?.code, e);
    // 팝업 관련 오류는 즉시 redirect 폴백
    const popupErrors = new Set([
      "auth/popup-closed-by-user",
      "auth/popup-blocked",
      "auth/cancelled-popup-request",
      "auth/internal-error",
    ]);
    if (popupErrors.has(e?.code)) {
      console.log("[Auth] fallback to redirect");
      await signInWithRedirect(auth, provider);
      return;
    }
    alert(e?.message || String(e));
  }
}

// ---- 로그아웃 ----
export function logout() {
  return auth.signOut();
}

// ---- 상태 감시 ----
export function watchAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    console.log("[Auth] onAuthStateChanged:", user);
    callback(user);
  });
}

// ---- 리다이렉트 결과 1회 회수 (앱 진입 시) ----
export async function consumeRedirectOnce() {
  try {
    const res = await getRedirectResult(auth);
    if (res) {
      console.log("[Auth] getRedirectResult user:", res.user);
    } else {
      console.log("[Auth] no redirect result");
    }
  } catch (e) {
    console.error("[Auth] getRedirectResult error:", e);
  }
}

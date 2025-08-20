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

// ⬇️ 실제 프로젝트 설정으로 교체
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID",
};

// ---- Singleton App/Auth ----
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ---- Provider ----
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

// ---- 로그인 함수 (팝업 -> 실패 시 Redirect 폴백) ----
export async function login() {
  try {
    // 세션 영속성: 로컬 스토리지
    await setPersistence(auth, browserLocalPersistence);

    // iOS/사파리/팝업차단 의심 환경은 곧장 redirect가 더 안정적
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isIOS) {
      console.log("[Auth] using redirect (iOS suspected)");
      await signInWithRedirect(auth, provider);
      return;
    }

    // 1차: 팝업 시도
    console.log("[Auth] trying popup");
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error("[Auth] popup error:", e?.code, e);
    // 팝업 관련 오류는 바로 redirect 폴백
    const popupErrors = new Set([
      "auth/popup-closed-by-user",
      "auth/popup-blocked",
      "auth/cancelled-popup-request",
      "auth/internal-error", // 일부 브라우저 추적방지 시 이 코드가 팝업 이슈로 나올 때가 있음
    ]);
    if (popupErrors.has(e?.code)) {
      console.log("[Auth] fallback to redirect");
      await signInWithRedirect(auth, provider);
      return;
    }
    // 그 외는 사용자에게 알림
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

// ---- 리다이렉트 결과 1회 회수 ----
// (앱 진입 시 한 번 호출해 주면 redirect 경로에서 세션 완성)
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

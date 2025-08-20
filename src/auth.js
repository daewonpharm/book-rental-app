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

const firebaseConfig = {
  apiKey: "…",
  authDomain: "…",           // 꼭 프로젝트와 도메인 맞는지 확인
  projectId: "…",
  appId: "…",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

// 디바이스/브라우저 관계 없이 세션이 유지되도록 고정
setPersistence(auth, browserLocalPersistence).catch((e) =>
  console.error("[Auth] setPersistence error:", e)
);

// 로그인 진입 함수: iOS 사파리/팝업 차단 환경은 Redirect, 그 외 Popup
export async function login() {
  try {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const shouldRedirect =
      isIOS || typeof window === "undefined" || window?.outerWidth === 0;

    if (shouldRedirect) {
      console.log("[Auth] using redirect");
      await signInWithRedirect(auth, provider);
    } else {
      console.log("[Auth] using popup");
      await signInWithPopup(auth, provider);
    }
  } catch (e) {
    console.error("[Auth] login error:", e);
    alert(e.message || String(e));
  }
}

export function logout() {
  return auth.signOut();
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    console.log("[Auth] onAuthStateChanged:", user);
    callback(user);
  });
}

// 리다이렉트 결과는 앱 진입 시 한 번만 회수
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

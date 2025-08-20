// src/auth.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  setLogLevel,
} from "firebase/auth";

// === 네가 준 config 그대로 (storageBucket 표준값으로 교정) ===
const firebaseConfig = {
  apiKey: "AIzaSyA-lPz7Ojjpv_o4EIFwbIUpV54ZCsPVeIE",
  authDomain: "dw-book-rental.firebaseapp.com",
  projectId: "dw-book-rental",
  storageBucket: "dw-book-rental.appspot.com",
  messagingSenderId: "191103254450",
  appId: "1:191103254450:web:038689a9bcac8e0cfb2eab",
};

// ---- Singleton App/Auth ----
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// 디버그 로깅 강화
setLogLevel("debug");
console.log("[Auth] config check:", {
  authDomain: app.options.authDomain,
  origin: window.location.origin,
});

// ---- Provider ----
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

// ---- 로그인: '항상' Redirect만 사용 (팝업 경로 제거) ----
export async function login() {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (e) {
    console.error("[Auth] setPersistence error:", e);
  }
  console.log("[Auth] using redirect (forced)");
  await signInWithRedirect(auth, provider);
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
export async function consumeRedirectOnce() {
  try {
    const res = await getRedirectResult(auth);
    if (res?.user) {
      console.log("[Auth] getRedirectResult user:", {
        uid: res.user.uid,
        email: res.user.email,
      });
    } else {
      console.log("[Auth] no redirect result");
    }
  } catch (e) {
    console.error("[Auth] getRedirectResult error:", e);
  }
}

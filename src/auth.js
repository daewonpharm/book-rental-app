// src/auth.js
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { app } from "./firebase";

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

/** 퍼시스턴스 설정: local → 실패 시 session */
async function ensurePersistence() {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (e) {
    // 사파리/시크릿/ITP 등에서 localStorage가 막히면 session으로 폴백
    await setPersistence(auth, browserSessionPersistence);
  }
}

/** 로그인: 팝업 → 실패 시 리다이렉트 폴백 */
export async function login() {
  await ensurePersistence();
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    const fallback = new Set([
      "auth/popup-blocked",
      "auth/popup-closed-by-user",
      "auth/cancelled-popup-request",
      "auth/operation-not-supported-in-this-environment",
      "auth/cookie-policy-blocked",
    ]);
    if (fallback.has(e.code)) {
      // 팝업이 막히는 환경에서는 redirect가 더 안정적
      await signInWithRedirect(auth, provider);
    } else {
      throw e;
    }
  }
}

/** 리다이렉트 결과 수거 (돌아왔을 때 한 번 호출) */
export async function consumeRedirectResult() {
  try {
    await ensurePersistence(); // 돌아왔을 때도 보수적으로 세팅
    const res = await getRedirectResult(auth);
    return res?.user ?? null;
  } catch (e) {
    console.warn("[Auth] getRedirectResult error:", e);
    return null;
  }
}

export function watchAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

export function logout() {
  return signOut(auth);
}

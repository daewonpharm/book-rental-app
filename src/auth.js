import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { app } from "./firebase";

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 팝업 → 실패 시 redirect 폴백
export async function login() {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    // 팝업 차단/자동 종료/쿠키 정책 등 환경 문제는 redirect로 해결
    const fallbackCodes = new Set([
      "auth/popup-blocked",
      "auth/popup-closed-by-user",
      "auth/cancelled-popup-request",
      "auth/operation-not-supported-in-this-environment",
      "auth/cookie-policy-blocked",
    ]);
    if (fallbackCodes.has(e.code)) {
      await signInWithRedirect(auth, provider);
    } else {
      throw e;
    }
  }
}

// redirect로 돌아온 뒤 결과 수거
export async function consumeRedirectResult() {
  try {
    const res = await getRedirectResult(auth);
    return res?.user ?? null;
  } catch (e) {
    // 필요시 로깅
    console.warn("[Auth] getRedirectResult error:", e);
    return null;
  }
}

export function logout() {
  return signOut(auth);
}

export function watchAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

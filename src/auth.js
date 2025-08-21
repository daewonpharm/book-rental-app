// src/auth.js
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence, // ← 로컬 스토리지(탭/새로고침 유지)
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase.js";

// 하드코딩 관리자 UID
export const ADMIN_UIDS = new Set(["FPXqlof4M3V9kB80nMMkZNkDTn52"]);

export function watchAuth(setUser) {
  return onAuthStateChanged(auth, (user) => setUser(user));
}

export async function login() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  // ✅ 먼저 퍼시스턴스를 'local'로 고정 (리다이렉트/새로고침 후에도 유지)
  await setPersistence(auth, browserLocalPersistence);

  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    // ✅ 팝업 관련 오류는 전부 리다이렉트로 폴백
    const popupErrors = new Set([
      "auth/popup-blocked",
      "auth/cancelled-popup-request",
      "auth/popup-closed-by-user",
      "auth/operation-not-supported-in-this-environment",
    ]);
    if (popupErrors.has(e?.code)) {
      return signInWithRedirect(auth, provider);
    }
    throw e;
  }
}

export function logout() {
  return signOut(auth);
}

export function isHardcodedAdmin(user) {
  return !!user && ADMIN_UIDS.has(user.uid);
}

export async function fetchMyRole(user) {
  if (!user) return null;
  const ref = doc(db, "roles", user.uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function isFirestoreAdmin(user) {
  const role = await fetchMyRole(user);
  return role?.role === "admin" || role?.admin === true;
}

// src/auth.js
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase.js";

export const ADMIN_UIDS = new Set(["FPXqlof4M3V9kB80nMMkZNkDTn52"]);

export function watchAuth(setUser) {
  return onAuthStateChanged(auth, (user) => setUser(user));
}

export async function login() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    // 1) 우선 팝업 시도
    await signInWithPopup(auth, provider);
  } catch (e) {
    // 2) 팝업 실패 유형은 전부 리다이렉트로 폴백
    const popupErrors = new Set([
      "auth/popup-blocked",
      "auth/cancelled-popup-request",
      "auth/popup-closed-by-user",
      "auth/operation-not-supported-in-this-environment", // iOS/Safari 등
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

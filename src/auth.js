// src/auth.js
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// 1) 하드코딩 관리자 (빠른 가드)
export const ADMIN_UIDS = new Set([
  "FPXqlof4M3V9kB80nMMkZNkDTn52", // <- 당신 UID
]);

export function watchAuth(setUser) {
  // 컴포넌트에서 사용자 상태 구독
  return onAuthStateChanged(auth, (user) => setUser(user));
}

export async function login() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
}

export function logout() {
  return signOut(auth);
}

export function isHardcodedAdmin(user) {
  return !!user && ADMIN_UIDS.has(user.uid);
}

// 2) Firestore roles 기반(확장형)
export async function fetchMyRole(user) {
  if (!user) return null;
  const ref = doc(db, "roles", user.uid); // 문서 ID = uid
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null; // { role: 'admin', ... }
}

export async function isFirestoreAdmin(user) {
  const role = await fetchMyRole(user);
  return role?.role === "admin" || role?.admin === true;
}

// src/auth.js
import {
  GoogleAuthProvider,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, authReady } from "./firebase.js";

// 하드코딩 관리자 UID (필요 시 추가)
export const ADMIN_UIDS = new Set(["FPXqlof4M3V9kB80nMMkZNkDTn52"]);

// Google Provider 공통 설정
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

/** 로그인(리다이렉트) – 퍼시스턴스 보장 후 호출 */
export async function login() {
  await authReady; // ✅ 퍼시스턴스 보장
  return signInWithRedirect(auth, provider);
}

/** 로그아웃 */
export function logout() {
  return signOut(auth);
}

/** 전역 인증 상태 구독 */
export function watchAuth(setter) {
  return onAuthStateChanged(auth, (user) => setter(user));
}

/** 하드코딩 관리자 여부 */
export function isHardcodedAdmin(user) {
  return !!user && ADMIN_UIDS.has(user.uid);
}

/** Firestore roles/{uid} 문서 조회 */
export async function fetchMyRole(user) {
  if (!user) return null;
  const ref = doc(db, "roles", user.uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/** Firestore 기반 관리자 여부 */
export async function isFirestoreAdmin(user) {
  const role = await fetchMyRole(user);
  return role?.role === "admin" || role?.admin === true;
}

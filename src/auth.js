import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { app } from "./firebase";

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function login() {
  return signInWithPopup(auth, provider);
}
export function logout() {
  return signOut(auth);
}
export function watchAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

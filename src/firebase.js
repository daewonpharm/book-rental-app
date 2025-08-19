// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const cfg = {
  apiKey:            import.meta.env.VITE_FB_API_KEY,
  authDomain:        import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FB_APP_ID,
};

// 어떤 키가 비었는지 기록만 남긴다(던지지 않음)
export const FIREBASE_MISSING_KEYS =
  Object.entries(cfg).filter(([, v]) => !v).map(([k]) => k);

if (FIREBASE_MISSING_KEYS.length) {
  console.error("[firebase] Missing env keys:", FIREBASE_MISSING_KEYS.join(", "));
}

let app = null;
let db  = null;
try {
  app = initializeApp(cfg);
  db  = getFirestore(app);
} catch (e) {
  console.error("[firebase] initialize failed:", e);
}

// 필요에 따라 사용할 수 있게 그대로 export
export { db };

// 진단용(마스킹)
export function getSafeFirebaseConfig() {
  const mask = (v) => !v ? "" : (String(v).length > 8 ? `${String(v).slice(0,4)}…${String(v).slice(-3)}` : v);
  return Object.fromEntries(Object.entries(cfg).map(([k, v]) => [k, mask(v)]));
}

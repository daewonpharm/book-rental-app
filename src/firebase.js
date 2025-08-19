// Vite + Firebase Modular SDK
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

// 누락 점검 (배포에서 "빈화면" 방지)
const missing = Object.entries(cfg).filter(([,v]) => !v).map(([k]) => k);
if (missing.length) {
  const msg = `[firebase] Missing env keys: ${missing.join(", ")}`;
  // 콘솔에서 바로 보이게
  console.error(msg);
  // throw 해서 ErrorBoundary가 메시지 보여주도록 (없으면 콘솔만)
  throw new Error(msg);
}

const app = initializeApp(cfg);
export const db = getFirestore(app);

// /__env 진단에서 마스킹 출력용
export function getSafeFirebaseConfig() {
  const mask = (v) => !v ? "" : (String(v).length > 8 ? `${String(v).slice(0,4)}…${String(v).slice(-3)}` : v);
  return Object.fromEntries(Object.entries(cfg).map(([k,v]) => [k, mask(v)]));
}

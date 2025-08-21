// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ── ① .env(.local)/Vercel 환경변수 우선 사용
const cfg = {
  apiKey:           import.meta.env.VITE_FB_API_KEY,
  authDomain:       import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId:        import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket:    import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId:import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId:            import.meta.env.VITE_FB_APP_ID,
};

// ── ② 누락 시 기존 하드코드 값으로 안전한 fallback
const firebaseConfig = {
  apiKey:            cfg.apiKey            || "AIzaSyA-lPz7Ojjpv_o4EIFwbIUpV54ZCsPVeIE",
  authDomain:        cfg.authDomain        || "dw-book-rental.firebaseapp.com",
  projectId:         cfg.projectId         || "dw-book-rental",
  // ✅ 반드시 appspot.com 이어야 합니다
  storageBucket:     cfg.storageBucket     || "dw-book-rental.appspot.com",
  messagingSenderId: cfg.messagingSenderId || "191103254450",
  appId:             cfg.appId             || "1:191103254450:web:038689a9bcac8e0cfb2eab",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;

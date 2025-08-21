// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ 당신 프로젝트 설정으로 교체
const firebaseConfig = {
  apiKey: "AIzaSyA-lPz7Ojjpv_o4EIFwbIUpV54ZCsPVeIE",
  authDomain: "dw-book-rental.firebaseapp.com",
  projectId: "dw-book-rental",
  storageBucket: "dw-book-rental.firebasestorage.app",
  messagingSenderId: "191103254450",
  appId: "1:191103254450:web:038689a9bcac8e0cfb2eab"
};

// 초기화
const app = initializeApp(firebaseConfig);

// ✅ 이름있는 export로 반드시 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);

// (선택) 필요하면 기본 내보내기도 유지
export default app;

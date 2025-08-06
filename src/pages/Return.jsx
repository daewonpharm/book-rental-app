// src/pages/Return.jsx
import React, { useState } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import BarcodeScanner from "../components/BarcodeScanner";

export default function Return() {
  const [bookCode, setBookCode] = useState("");     // 내부 처리용
  const [title, setTitle] = useState("");           // 사용자 표시용
  const [employeeId, setEmployeeId] = useState(""); // 입력 사번
  const [rating, setRating] = useState("");         // 별점
  const [scanning, setScanning] = useState(false);

  const handleDetected = async (code) => {
    const normalized = code.toLowerCase();
    const bookRef = doc(db, "books", normalized);
    const bookSnap = await getDoc(bookRef);

    if (!bookSnap.exists()) {
      alert("해당 도서를 찾을 수 없습니다.");
      return;
    }

    const bookData = bookSnap.data();
    setBookCode(normalized);
    setTitle(bookData.title || "");
    setScanning(false);
  };

  const handleReturn = async () => {
    if (!bookCode || !employeeId) {
      alert("도서와 사번을 모두 입력하세요.");
      return;
    }

    const bookRef = doc(db, "books", bookCode);
    const bookSnap = await getDoc(bookRef);

    if (!bookSnap.exists()) {
      alert("도서를 찾을 수 없습니다.");
      return;
    }

    const bookData = bookSnap.data();
    if (bookData.rentedBy !== employeeId) {
      alert("이 도서를 대여한 사번이 아닙니다.");
      return;
    }

    const now = Timestamp.now();

    // 1. 도서 상태 업데이트
    await updateDoc(bookRef, {
      available: true,
      returnedAt: now,
    });

    // 2. rentLogs 업데이트
    const q = query(
      collection(db, "rentLogs"),
      where("bookId", "==", bookCode),
      where("rentedBy", "==", employeeId),
      where("returnedAt", "==", null)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const logRef = doc(db, "rentLogs", snapshot.docs[0].id);
      const updateData = { returnedAt: now };
      if (rating) {
        updateData.rating = parseFloat(rating);
      }
      await updateDoc(logRef, updateData);
    }

    // 3. 별점 평균 계산 및 저장
    const ratingSnap = await getDocs(
      query(collection(db, "rentLogs"), where("bookId", "==", bookCode), where("rating", "!=", null))
    );
    const ratings = ratingSnap.docs.map((doc) => doc.data().rating);
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

    await updateDoc(bookRef, {
      avgRating: parseFloat(avgRating.toFixed(2)),
    });

    alert("반납 완료!");
    setBookCode("");
    setTitle("");
    setEmployeeId("");
    setRating("");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">📤 도서 반납</h2>

      <button
        className="bg-gray-200 px-4 py-2 rounded"
        onClick={() => setScanning(!scanning)}
      >
        {scanning ? "📷 스캔 중지" : "📷 바코드 스캔"}
      </button>

      {scanning && (
        <>
          <BarcodeScanner
            onDetected={handleDetected}
            onClose={() => setScanning(false)}
          />
          <p className="text-sm text-red-500 mt-2">
            ⚠️ iOS에서는 두 번째 스캔부터 전면 카메라가 사용될 수 있어요. 작동이 안 되면 새로고침 해주세요.
          </p>
        </>
      )}

      {/* 📘 책 제목 (스캔 시 자동 표시) */}
      <label className="block text-sm font-semibold mt-4">
        📕 도서 제목 (스캔 시 자동 표시)
      </label>
      <input
        type="text"
        value={title}
        readOnly
        className="border p-2 w-full bg-gray-100 text-gray-800"
      />

      <label className="block text-sm font-semibold mt-4">👤 사번 6자리</label>
      <input
        type="text"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
        className="border p-2 w-full"
        maxLength={6}
      />

      <label className="block text-sm font-semibold mt-4">
        ⭐ 책에 대한 별점을 남겨주세요
      </label>
      <select
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        className="border p-2 w-full"
      >
        <option value="">선택 안 함</option>
        {[...Array(10)].map((_, i) => {
          const val = (10 - i) * 0.5;
          return (
            <option key={val} value={val}>
              {"⭐".repeat(Math.floor(val)) + (val % 1 === 0.5 ? "⯨" : "")} {val.toFixed(1)}
            </option>
          );
        })}
      </select>

      <button
        onClick={handleReturn}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-4"
      >
        반납하기
      </button>
    </div>
  );
}

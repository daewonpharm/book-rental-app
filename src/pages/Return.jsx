// src/pages/Return.jsx
import React, { useState } from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import BarcodeScanner from "../components/BarcodeScanner";

export default function Return() {
  const [bookCode, setBookCode] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [rating, setRating] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [title, setTitle] = useState("");

  const handleScan = async (code) => {
    setBookCode(code);

    // 📘 책 제목 표시
    const q = query(collection(db, "books"), where("bookCode", "==", code));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      setTitle(data.title || "");
    } else {
      setTitle("");
    }

    setShowScanner(false);
  };

  const handleReturn = async () => {
    if (!bookCode || !employeeId || !rating) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    const q = query(collection(db, "books"), where("bookCode", "==", bookCode));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      alert("책을 찾을 수 없습니다.");
      return;
    }

    const bookRef = doc(db, "books", snapshot.docs[0].id);
    const bookData = snapshot.docs[0].data();

    // ⭐ 평균 별점 계산
    const newRating = parseFloat(rating);
    const prevTotal = (bookData.avgRating || 0) * (bookData.ratingCount || 0);
    const newCount = (bookData.ratingCount || 0) + 1;
    const updatedAvg = (prevTotal + newRating) / newCount;

    await updateDoc(bookRef, {
      available: true,
      returnedAt: Timestamp.now(),
      avgRating: updatedAvg,
      ratingCount: newCount,
    });

    // 📜 rentLogs 업데이트
    const rentLogQuery = query(
      collection(db, "rentLogs"),
      where("bookCode", "==", bookCode),
      where("returnedAt", "==", null)
    );
    const rentLogSnap = await getDocs(rentLogQuery);
    if (!rentLogSnap.empty) {
      const logRef = doc(db, "rentLogs", rentLogSnap.docs[0].id);
      await updateDoc(logRef, {
        returnedAt: Timestamp.now(),
        rating: newRating,
      });
    }

    alert("반납이 완료되었습니다!");
    setBookCode("");
    setEmployeeId("");
    setRating("");
    setTitle("");
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold mb-4">📘 도서 반납</h2>

      <label className="block text-sm font-semibold mb-1">📷 바코드 스캔</label>
      <button
        onClick={() => setShowScanner(true)}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mb-2"
      >
        카메라로 스캔하기
      </button>

      {showScanner && <BarcodeScanner onDetected={handleScan} />}

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
        <option value="">선택하세요</option>
        {Array.from({ length: 10 }, (_, i) => 5 - i * 0.5).map((val) => (
          <option key={val} value={val}>
            ⭐ {val.toFixed(1)}
          </option>
        ))}
      </select>

      <button
        onClick={handleReturn}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-6"
      >
        반납하기
      </button>

      {/* iOS 카메라 안내문 (하단 배치) */}
      <div className="text-sm text-yellow-400 mt-6 bg-black/70 p-2 px-3 rounded">
        ⚠️ iOS에서는 두 번째 스캔부터 전면 카메라가 사용될 수 있어요. 작동이 안 되면 새로고침 해주세요.
      </div>
    </div>
  );
}

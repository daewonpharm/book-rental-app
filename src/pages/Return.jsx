import React, { useState } from "react";
import BarcodeScanner from "../components/BarcodeScanner";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

export default function Return() {
  const [bookTitle, setBookTitle] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [rating, setRating] = useState("");
  const [scanning, setScanning] = useState(false);

  const handleDetected = async (code) => {
    try {
      const booksRef = collection(db, "books");
      const q = query(booksRef, where("bookCode", "==", code));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const bookData = querySnapshot.docs[0].data();
        setBookTitle(bookData.title);
      } else {
        alert("책을 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("스캔 처리 중 오류:", error);
    }
  };

  const handleReturn = async () => {
    // 생략: 기존 handleReturn 로직
  };

  return (
    <div className="min-h-screen w-full px-4 flex justify-center">
      <div className="w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold mt-6">📤 도서 반납</h2>

        <label className="block text-sm font-semibold">📷 바코드 스캔</label>
        <button
          className="w-full bg-[#fca15f] text-white p-2 rounded hover:bg-[#f98b36]"
          onClick={() => setScanning(!scanning)}
        >
          {scanning ? "📷 스캔 중지" : "📷 카메라로 스캔하기"}
        </button>

        {scanning && (
          <>
            <BarcodeScanner
              onDetected={handleDetected}
              onClose={() => setScanning(false)}
            />
            <p className="text-sm text-red-500 mt-2">
              ⚠️ iOS에서는 두 번째 스캔부터 전면 카메라가 사용될 수 있어요.
            </p>
          </>
        )}

        <label className="block text-sm font-semibold mt-4">📕 도서 제목</label>
        <input
          type="text"
          placeholder="(스캔 시 자동 표시)"
          value={bookTitle}
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
          placeholder="사번을 입력해주세요"
          inputMode="numeric"
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
          <option value="5">⭐ 5.0</option>
          <option value="4.5">⭐ 4.5</option>
          <option value="4">⭐ 4.0</option>
          <option value="3.5">⭐ 3.5</option>
          <option value="3">⭐ 3.0</option>
          <option value="2.5">⭐ 2.5</option>
          <option value="2">⭐ 2.0</option>
          <option value="1.5">⭐ 1.5</option>
          <option value="1">⭐ 1.0</option>
          <option value="0.5">⭐ 0.5</option>
        </select>

        <button
          onClick={handleReturn}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 mt-4 mb-6"
        >
          반납하기
        </button>
      </div>
    </div>
  );
}

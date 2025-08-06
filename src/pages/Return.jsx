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
  const [bookCode, setBookCode] = useState("");       // 내부 처리용
  const [bookTitle, setBookTitle] = useState("");     // 사용자 표시용
  const [employeeId, setEmployeeId] = useState("");
  const [rating, setRating] = useState("");
  const [scanning, setScanning] = useState(false);

  const handleReturn = async () => {
    if (!bookCode || !employeeId) {
      alert("도서코드와 사번을 입력하세요.");
      return;
    }

    const bookRef = doc(db, "books", bookCode);
    const bookSnap = await getDoc(bookRef);

    if (!bookSnap.exists()) {
      alert("해당 도서가 존재하지 않습니다.");
      return;
    }

    const bookData = bookSnap.data();

    if (bookData.available !== false) {
      alert("이미 반납된 도서입니다.");
      return;
    }

    if (bookData.rentedBy !== employeeId) {
      alert("해당 도서를 대여한 사번이 아닙니다.");
      return;
    }

    const now = Timestamp.now();

    // 책 상태 업데이트
    await updateDoc(bookRef, {
      available: true,
      returnedAt: now,
      rentedBy: "",
    });

    // rentLogs 업데이트
    const q = query(
      collection(db, "rentLogs"),
      where("bookId", "==", bookCode),
      where("rentedBy", "==", employeeId),
      where("returnedAt", "==", null)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const logRef = doc(db, "rentLogs", snapshot.docs[0].id);
      await updateDoc(logRef, {
        returnedAt: now,
        rating: rating ? parseFloat(rating) : null,
      });
    }

    // 별점 업데이트
    if (rating) {
      const prevCount = bookData.ratingCount || 0;
      const prevSum = bookData.ratingSum || 0;
      const newCount = prevCount + 1;
      const newSum = prevSum + parseFloat(rating);
      const newAvg = newSum / newCount;

      await updateDoc(bookRef, {
        ratingCount: newCount,
        ratingSum: newSum,
        avgRating: newAvg,
      });
    }

    alert("도서가 반납되었습니다.");
    setBookCode("");
    setBookTitle("");
    setEmployeeId("");
    setRating("");
    setScanning(false);
  };

  const handleDetected = async (code) => {
    const normalizedCode = code.toLowerCase();
    const bookRef = doc(db, "books", normalizedCode);
    const bookSnap = await getDoc(bookRef);

    if (bookSnap.exists()) {
      const bookData = bookSnap.data();
      setBookCode(normalizedCode);
      setBookTitle(bookData.title);
    } else {
      alert("해당 도서를 찾을 수 없습니다.");
    }

    setScanning(false);
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
          <p className="text-sm text-gray-500">
            ⚠️ iOS에서는 두 번째 스캔부터 전면 카메라가 사용될 수 있어요. 작동이 안 되면 새로고침 해주세요.
          </p>
        </>
      )}

      {/* 도서 제목 표시 (수정 불가) */}
      <input
        type="text"
        placeholder="도서 제목 (스캔 시 자동 표시)"
        value={bookTitle}
        readOnly
        className="border p-2 w-full bg-gray-100 text-gray-700 cursor-not-allowed"
      />

      <input
        type="text"
        inputMode="numeric"
        pattern="\d{6}"
        maxLength={6}
        placeholder="사번 6자리"
        value={employeeId}
        onChange={(e) => {
          const value = e.target.value;
          if (/^\d{0,6}$/.test(value)) {
            setEmployeeId(value);
          }
        }}
        className="border p-2 w-full"
      />

      <label className="block text-sm font-medium text-gray-700">
        책에 대한 별점을 남겨주세요
      </label>
      <select
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        className="border p-2 w-full"
      >
        <option value="">– 선택 안 함 –</option>
        {[...Array(10)]
          .map((_, i) => (5 - i * 0.5).toFixed(1))
          .map((val) => (
            <option key={val} value={val}>
              ⭐ {val}
            </option>
          ))}
      </select>

      <button
        onClick={handleReturn}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        반납하기
      </button>
    </div>
  );
}

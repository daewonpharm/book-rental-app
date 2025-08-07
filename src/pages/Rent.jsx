// src/pages/Rent.jsx
import React, { useState } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import BarcodeScanner from "../components/BarcodeScanner";

export default function Rent() {
  const [bookCode, setBookCode] = useState("");      // 내부 처리용
  const [bookTitle, setBookTitle] = useState("");    // 사용자 표시용
  const [employeeId, setEmployeeId] = useState("");
  const [scanning, setScanning] = useState(false);

  const handleRent = async () => {
    if (!bookCode || !employeeId) {
      alert("도서와 사번을 모두 입력하세요.");
      return;
    }

    const bookRef = doc(db, "books", bookCode);
    const bookSnap = await getDoc(bookRef);

    if (!bookSnap.exists()) {
      alert("해당 도서가 존재하지 않습니다.");
      return;
    }

    const bookData = bookSnap.data();

    if (bookData.available === false) {
      alert("이미 대출 중인 도서입니다.");
      return;
    }

    const now = Timestamp.now();

    await updateDoc(bookRef, {
      available: false,
      rentedBy: employeeId,
      rentedAt: now,
      returnedAt: null,
    });

    await addDoc(collection(db, "rentLogs"), {
      bookId: bookCode,
      title: bookData.title,
      rentedBy: employeeId,
      rentedAt: now,
      returnedAt: null,
    });

    alert("도서가 대여되었습니다.");
    setBookCode("");
    setBookTitle("");
    setEmployeeId("");
    setScanning(false);
  };

  const handleDetected = async (code) => {
    const normalizedCode = code.toLowerCase();
    const bookRef = doc(db, "books", normalizedCode);
    const bookSnap = await getDoc(bookRef);

    if (bookSnap.exists()) {
      const bookData = bookSnap.data();
      setBookCode(normalizedCode);     // 내부용으로 저장
      setBookTitle(bookData.title);    // 사용자 표시용
    } else {
      alert("해당 도서를 찾을 수 없습니다.");
    }

    setScanning(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">📥 도서 대여</h2>

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
        placeholder="도서 제목 (스캔 시 자동 표시)"
        value={bookTitle}
        readOnly
        className="border p-2 w-full bg-gray-100 text-gray-800"
      />

      <label className="block text-sm font-semibold mt-4">👤 사번 6자리</label>
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

      <button
        onClick={handleRent}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-4"
      >
        대여하기
      </button>
    </div>
  );
}

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
  const [bookCode, setBookCode] = useState("");
  const [bookTitle, setBookTitle] = useState("");
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
      setBookCode(normalizedCode);
      setBookTitle(bookData.title);
    } else {
      alert("해당 도서를 찾을 수 없습니다.");
    }

    setScanning(false);
  };

  return (
    <div className="w-full max-w-screen-md px-4">
      <div className="text-center font-bold text-xl mb-6 mt-6 flex items-center gap-2">
        📥 도서 대여
      </div>

      <div className="mb-4">
        <label className="block mb-1">📷 바코드 스캔</label>
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
      </div>

      <div className="mb-4">
        <label className="block mb-1">📕 도서 제목</label>
        <input
          type="text"
          placeholder="(스캔 시 자동 표시)"
          value={bookTitle}
          readOnly
          className="w-full border rounded px-3 py-2 bg-gray-100"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">👤 사번 6자리</label>
        <input
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="w-full border rounded px-3 py-2"
          maxLength={6}
          placeholder="사번을 입력해주세요"
          inputMode="numeric"
        />
      </div>

      <button
        onClick={handleRent}
        className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        대여하기
      </button>
    </div>
  );
}

import React, { useState } from "react";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import BarcodeScanner from "../components/BarcodeScanner";

export default function Return() {
  const [bookCode, setBookCode] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [rating, setRating] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const handleScan = async (scannedCode) => {
    setBookCode(scannedCode);
    setShowScanner(false);
    const bookRef = doc(db, "books", scannedCode);
    const bookSnap = await getDoc(bookRef);
    if (bookSnap.exists()) {
      setBookTitle(bookSnap.data().title || "");
    } else {
      setBookTitle("책 정보 없음");
    }
  };

  const handleReturn = async () => {
    if (!bookCode || !employeeId) {
      alert("도서 제목과 사번을 모두 입력해주세요.");
      return;
    }

    // 사번 6자리 유효성 검사
    if (!/^\d{6}$/.test(employeeId)) {
      alert("사번은 숫자 6자리여야 합니다.");
      return;
    }

    const bookRef = doc(db, "books", bookCode);
    const bookSnap = await getDoc(bookRef);

    if (!bookSnap.exists()) {
      alert("해당 도서를 찾을 수 없습니다.");
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
    const logsRef = collection(db, "rentLogs");
    const q = query(
      logsRef,
      where("bookId", "==", bookCode),
      where("rentedBy", "==", employeeId),
      where("returnedAt", "==", null)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const logDoc = snapshot.docs[0];
      await updateDoc(logDoc.ref, {
        returnedAt: now,
        rating: parseFloat(rating) || null,
      });
    }

    alert("도서가 성공적으로 반납되었습니다.");
    setBookCode("");
    setBookTitle("");
    setEmployeeId("");
    setRating("");
  };

  return (
    <div className="w-full max-w-screen-md px-4">
      <div className="text-center font-bold text-xl mb-6 mt-6 flex items-center gap-2">
        📩 도서 반납
      </div>

      <div className="mb-4">
        <label className="block mb-1">📷 바코드 스캔</label>
        <button
          className="w-full bg-[#fca15f] text-white p-2 rounded hover:bg-[#f98b36]"
          onClick={() => setShowScanner(true)}
        >
          📷 카메라로 스캔하기
        </button>
        {showScanner && <BarcodeScanner onDetected={handleScan} />}
      </div>

      <div className="mb-4">
        <label className="block mb-1">📕 도서 제목</label>
        <input
          className="w-full border rounded px-3 py-2 bg-gray-100"
          value={bookTitle}
          readOnly
          placeholder="(스캔 시 자동 표시)"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">👤 사번 6자리</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={employeeId}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d{0,6}$/.test(value)) {
              setEmployeeId(value);
            }
          }}
          maxLength={6}
          placeholder="사번을 입력해주세요"
          inputMode="numeric"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">⭐ 책에 대한 별점을 남겨주세요</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value="">선택 안 함</option>
          {[...Array(10)].map((_, i) => {
            const score = (5 - i * 0.5).toFixed(1);
            return (
              <option key={score} value={score}>
                {`⭐ ${score}`}
              </option>
            );
          })}
        </select>
      </div>

      <button
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
        onClick={handleReturn}
      >
        반납하기
      </button>
    </div>
  );
}

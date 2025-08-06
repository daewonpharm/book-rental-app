import React, { useState } from "react";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  getDoc,
  Timestamp,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  updateDoc as updateLog,
} from "firebase/firestore";
import BarcodeScanner from "../components/BarcodeScanner";

export default function Return() {
  const [bookCode, setBookCode] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [rating, setRating] = useState(5);
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
    const updatedStars = [...(bookData.stars || []), rating];
    const avgRating =
      updatedStars.reduce((sum, val) => sum + val, 0) / updatedStars.length;

    await updateDoc(bookRef, {
      available: true,
      rentedBy: null,
      rentedAt: null,
      returnedAt: Timestamp.now(),
      stars: updatedStars,
      avgRating: parseFloat(avgRating.toFixed(2)),
    });

    // rentLogs 업데이트
    const logsRef = collection(db, "rentLogs");
    const q = query(
      logsRef,
      where("bookId", "==", bookCode),
      where("rentedBy", "==", employeeId),
      where("returnedAt", "==", null),
      orderBy("rentedAt", "desc"),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const logDoc = snapshot.docs[0];
      await updateLog(logDoc.ref, {
        returnedAt: Timestamp.now(),
      });
    }

    alert("도서가 반납되었습니다. 감사합니다!");
    setBookCode("");
    setEmployeeId("");
    setRating(5);
    setScanning(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">📤 도서 반납 + 별점</h2>

      <button
        className="bg-gray-200 px-4 py-2 rounded"
        onClick={() => setScanning(true)}
      >
        📷 바코드 스캔
      </button>

      {scanning && (
        <BarcodeScanner
          onDetected={(code) => {
            setBookCode(code);
            setScanning(false);
          }}
          onClose={() => setScanning(false)}
        />
      )}

      <input
        type="text"
        placeholder="도서 코드 (예: dw0001)"
        value={bookCode}
        onChange={(e) => setBookCode(e.target.value)}
        className="border p-2 w-full"
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

      <input
        type="number"
        min="0"
        max="5"
        step="0.5"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="border p-2 w-full"
      />

      <button
        onClick={handleReturn}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        반납하기
      </button>
    </div>
  );
}

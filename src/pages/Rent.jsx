import React, { useState, useEffect } from "react";
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
  const [employeeId, setEmployeeId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);

  useEffect(() => {
    // ✅ Step 2: 브라우저 카메라 지원 여부 확인
    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraSupported(false);
      alert("⚠️ 현재 브라우저는 카메라 기능을 지원하지 않습니다.");
    }
  }, []);

  const handleRent = async () => {
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
    setEmployeeId("");
    setScanning(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">📥 도서 대여</h2>

      {/* ✅ Step 1, 2, 3: 바코드 스캔 버튼 */}
      {cameraSupported && (
        <button
          className="bg-gray-200 px-4 py-2 rounded"
          onClick={() => setScanning(!scanning)}
        >
          {scanning ? "📷 스캔 중지" : "📷 바코드 스캔"}
        </button>
      )}

      {/* ✅ Step 3: 카메라 영역 스타일 조정 */}
      {scanning && (
        <div className="max-w-md w-full mx-auto">
<BarcodeScanner
  onDetected={(code) => {
    console.log("✅ 스캔된 코드:", code);
    setBookCode(code);       // ✅ 코드 입력
    setScanning(false);      // ✅ 스캔창 종료
            }}
          />
        </div>
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

      <button
        onClick={handleRent}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        대여하기
      </button>
    </div>
  );
}

@'
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection, query, where, getDocs, doc, updateDoc, addDoc,
  serverTimestamp, Timestamp
} from "firebase/firestore";
import BarcodeScanner from "../components/BarcodeScanner";

export default function Rent() {
  const [showScanner, setShowScanner] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [bookCode, setBookCode] = useState("");

  useEffect(() => {}, []);

  const handleScan = async (code) => {
    setShowScanner(false);
    const snap = await getDocs(query(collection(db, "books"), where("bookCode", "==", code)));
    if (snap.empty) {
      alert("해당 바코드의 책을 찾을 수 없습니다.");
      setBookTitle("");
      setBookCode("");
      return; // ← 여기서 종료, 여분의 `};` 금지!
    }
    const book = { id: snap.docs[0].id, ...snap.docs[0].data() };
    setBookTitle(book.title || "");
    setBookCode(code);
  };

  const onChangeEmp = (e) => {
    const onlyNum = e.target.value.replace(/\D/g, "").slice(0, 6);
    setEmployeeId(onlyNum);
  };

  const rent = async () => {
    if (!bookCode) return alert("도서를 스캔하세요.");
    if (employeeId.length !== 6) return alert("사번 6자리를 입력하세요.");

    const bsnap = await getDocs(query(collection(db, "books"), where("bookCode", "==", bookCode)));
    if (bsnap.empty) return alert("책 정보를 찾을 수 없습니다.");
    const bdoc = bsnap.docs[0];
    const bookRef = doc(db, "books", bdoc.id);
    const book = bdoc.data();

    if (book.status === "대출중") return alert("이미 대출 중인 도서입니다.");

    const now = new Date();
    const due = new Date(now);
    due.setDate(due.getDate() + 14);

    await updateDoc(bookRef, {
      status: "대출중",
      rentedBy: employeeId,
      rentedAt: serverTimestamp(),
      dueAt: Timestamp.fromDate(due),
    });

    await addDoc(collection(db, "rentLogs"), {
      bookId: bdoc.id,
      bookCode,
      title: book.title || "",
      employeeId,
      rentedAt: serverTimestamp(),
      returnedAt: null,
      rating: null,
    });

    alert("대여 처리되었습니다.");
    setEmployeeId("");
    setBookTitle("");
    setBookCode("");
  };

  return (
    <div className="w-screen px-4">
      <div className="mx-auto max-w-md py-6">
        <h1 className="text-center text-2xl font-bold">도서 대여</h1>

        <input
          className="mt-6 w-full rounded-xl border px-4 py-3 text-base"
          placeholder="도서 제목 (스캔 시 자동 표시)"
          value={bookTitle}
          readOnly
        />

        <input
          className="mt-4 w-full rounded-xl border px-4 py-3 text-base"
          placeholder="사번 6자리"
          inputMode="numeric"
          pattern="\\d{6}"
          maxLength={6}
          value={employeeId}
          onChange={onChangeEmp}
        />

        <label className="mt-4 block text-sm font-semibold">📷 바코드 스캔</label>
        <button
          className="mt-1 w-full rounded-xl border px-4 py-3"
          onClick={() => setShowScanner(true)}
        >
          카메라로 스캔하기
        </button>
        {showScanner && (
          <BarcodeScanner
            onDetected={handleScan}
            onClose={() => setShowScanner(false)}
          />
        )}

        <button
          className="mt-6 w-full rounded-xl bg-neutral-900 px-4 py-3 text-white"
          onClick={rent}
        >
          대여하기
        </button>
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding UTF8 src/pages/Rent.jsx

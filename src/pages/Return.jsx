import React, { useState } from "react";
import { db } from "../firebase";
import {
  collection, query, where, getDocs, doc, updateDoc, orderBy, limit as qLimit,
  serverTimestamp
} from "firebase/firestore";
import BarcodeScanner from "../components/BarcodeScanner";

const RATINGS_ENABLED = false; // 필요 시 true

export default function Return() {
  const [showScanner, setShowScanner] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [bookCode, setBookCode] = useState("");
  const [rating, setRating] = useState("5.0");

  const onChangeEmp = (e) => {
    const onlyNum = e.target.value.replace(/\D/g, "").slice(0, 6);
    setEmployeeId(onlyNum);
  };

  const handleScan = async (code) => {
    setShowScanner(false);
    const snap = await getDocs(query(collection(db, "books"), where("bookCode", "==", code)));
    if (snap.empty) {
      alert("해당 바코드의 책을 찾을 수 없습니다.");
      setBookTitle("");
      setBookCode("");
      return;
    }
    const book = { id: snap.docs[0].id, ...snap.docs[0].data() };
    setBookTitle(book.title || "");
    setBookCode(code);
  };

  const doReturn = async () => {
    if (!bookCode) return alert("도서를 스캔하세요.");
    if (employeeId.length !== 6) return alert("사번 6자리를 입력하세요.");

    // 최신 미반납 로그 1건
    const logSnap = await getDocs(
      query(
        collection(db, "rentLogs"),
        where("bookCode", "==", bookCode),
        where("returnedAt", "==", null),
        orderBy("rentedAt", "desc"),
        qLimit(1)
      )
    );
    if (logSnap.empty) return alert("대여 중인 기록이 없습니다.");
    const logRefId = logSnap.docs[0].id;
    const log = logSnap.docs[0].data();

    if (log.employeeId !== employeeId) return alert("다른 대여자의 책입니다. 반납할 수 없습니다.");

    // books 문서
    const bsnap = await getDocs(query(collection(db, "books"), where("bookCode", "==", bookCode)));
    const bdoc = bsnap.docs[0];
    const bookRef = doc(db, "books", bdoc.id);

    // books 상태 복구
    await updateDoc(bookRef, {
      status: "대출가능",
      rentedBy: null,
      rentedAt: null,
      dueAt: null,
      returnedAt: serverTimestamp(),
    });

    // rentLogs 반납 기록
    const logRef = doc(db, "rentLogs", logRefId);
    const updates = { returnedAt: serverTimestamp() };
    if (RATINGS_ENABLED) updates.rating = parseFloat(rating);
    await updateDoc(logRef, updates);

    // (옵션) 별점 평균 갱신
    if (RATINGS_ENABLED) {
      const allLogs = await getDocs(query(collection(db, "rentLogs"), where("bookCode", "==", bookCode)));
      const ratings = allLogs.docs.map(d => d.data().rating).filter(v => typeof v === "number");
      if (ratings.length) {
        const avg = Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
        await updateDoc(bookRef, { ratingAvg: avg, ratingCount: ratings.length });
      }
    }

    alert("반납 처리되었습니다.");
    setEmployeeId("");
    setBookTitle("");
    setBookCode("");
    setRating("5.0");
  };

  return (
    <div className="w-screen px-4">
      <div className="mx-auto max-w-md py-6">
        <h1 className="text-center text-2xl font-bold">도서 반납</h1>

        {/* 도서 제목(자동 표시) */}
        <input
          className="mt-6 w-full rounded-xl border px-4 py-3 text-base"
          placeholder="도서 제목 (스캔 시 자동 표시)"
          value={bookTitle}
          readOnly
        />

        {/* 사번 */}
        <input
          className="mt-4 w-full rounded-xl border px-4 py-3 text-base"
          placeholder="사번 6자리"
          inputMode="numeric"
          pattern="\\d{6}"
          maxLength={6}
          value={employeeId}
          onChange={onChangeEmp}
        />

        {/* 별점(옵션) */}
        {RATINGS_ENABLED && (
          <div className="mt-4">
            <label className="block text-sm font-semibold">⭐ 책에 대한 별점을 남겨주세요</label>
            <select
              className="mt-1 w-full rounded-xl border px-4 py-3"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              {[...Array(10)].map((_, i) => {
                const val = (5 - i * 0.5).toFixed(1);
                return <option key={val} value={val}>{`⭐ ${val}`}</option>;
              })}
            </select>
          </div>
        )}

        {/* 스캐너 */}
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
          onClick={doReturn}
        >
          반납하기
        </button>
      </div>
    </div>
  );
}

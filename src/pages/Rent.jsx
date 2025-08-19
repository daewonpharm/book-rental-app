import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import {
  collection, getDocs, doc, getDoc, serverTimestamp, setDoc, updateDoc
} from "firebase/firestore";
import Stepper from "../components/Stepper";
import Summary from "../components/Summary";
import ScannerModal from "../components/ScannerModal";
import SuccessOverlay from "../components/SuccessOverlay";
import BarcodeScanner from "../components/BarcodeScanner";

const isValidEmployeeId = (v) => /^\d{6}$/.test(String(v || ""));

export default function Rent() {
  const [step, setStep] = useState(1);
  const [employeeId, setEmployeeId] = useState("");
  const [bookCode, setBookCode] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [books, setBooks] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "books"));
      setBooks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    })().catch(console.error);
  }, []);

  const handleDetected = (code) => {
    const found = books.find((b) => b.id === code || b.bookCode === code);
    setBookCode(code);
    setBookTitle(found?.title || found?.name || "");
    setShowScanner(false);
    setStep(2);
  };

  const canSubmit = useMemo(() => isValidEmployeeId(employeeId) && !!bookCode, [employeeId, bookCode]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setLoading(true);
      const bookRef = doc(db, "books", bookCode);
      const bookSnap = await getDoc(bookRef);
      if (!bookSnap.exists()) throw new Error("존재하지 않는 도서 코드입니다.");
      const b = bookSnap.data();
      const status = b.status || (b.isAvailable === false ? "대출중" : "대출가능");
      if (status === "대출중") throw new Error("이미 대출 중인 도서입니다.");

      const logRef = doc(collection(db, "rentLogs"));
      await setDoc(logRef, {
        logId: logRef.id,
        bookCode,
        title: b.title || bookTitle || bookCode,
        renterId: employeeId,
        rentedAt: serverTimestamp(),
        returnedAt: null,
        rating: null,
      });

      await updateDoc(bookRef, { status: "대출중", isAvailable: false, dueDate: b.dueDate || null });

      setSuccess(true); // ✅ 오버레이로 완료 피드백
    } catch (err) {
      alert(err.message || "처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setEmployeeId(""); setBookCode(""); setBookTitle(""); setStep(1); setSuccess(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold">대여하기 📷</h1>
      <Stepper current={step} labels={["스캔","사번"]} />

      <form onSubmit={onSubmit} className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
        {step === 1 && (
          <>
            <label className="block text-sm font-semibold">📷 바코드 스캔</label>
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="w-full mt-1 rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm font-medium hover:bg-gray-50"
            >
              카메라로 스캔하기
            </button>
            {showScanner && (
              <ScannerModal onClose={() => setShowScanner(false)}>
                <BarcodeScanner onDetected={handleDetected} />
                <p className="mt-3 text-xs text-gray-500">⚠️ iOS에서는 후면 카메라 고정 등 이슈가 있을 수 있어요. 재시작해 주세요.</p>
              </ScannerModal>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Summary code={bookCode} title={bookTitle} onRescan={()=>{ setStep(1); }} />
            <input
              value={bookTitle}
              readOnly
              placeholder="도서 제목 (스캔 시 자동 표시)"
              className="block w-full mt-3 rounded-xl border border-gray-300 px-3 py-3 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
            />

            <label className="block mt-4 text-sm font-semibold">사번</label>
            <input
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              inputMode="numeric" maxLength={6} placeholder="6자리 숫자"
              className="block w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
            />

            <button
              type="submit" disabled={!canSubmit || loading}
              className="mt-6 w-full rounded-xl bg-gray-900 text-white py-3 text-sm font-semibold disabled:opacity-40"
            >
              {loading ? "처리 중..." : "대여 등록"}
            </button>
          </>
        )}
      </form>

      {success && (
        <SuccessOverlay
          mode="rent"
          title="대여가 완료되었습니다."
          desc="내 서가에 책이 추가되었어요."
          onClose={resetAll}
        />
      )}
    </div>
  );
}

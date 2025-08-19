import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import {
  collection, getDocs, doc, getDoc, serverTimestamp, setDoc, updateDoc,
  query, where, limit
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
      if (!db) return;
      try {
        const snap = await getDocs(collection(db, "books"));
        setBooks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("[Rent] Firestore error:", e);
      }
    })();
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
      if (!db) throw new Error("Firebase가 초기화되지 않았습니다. /__env를 확인하세요.");
      setLoading(true);

      // books 문서 찾기 (문서ID → bookCode 필드 역검색까지)
      let bookRef = doc(db, "books", bookCode);
      let bookSnap = await getDoc(bookRef);
      if (!bookSnap.exists()) {
        const qy = query(collection(db, "books"), where("bookCode", "==", bookCode), limit(1));
        const qs = await getDocs(qy);
        if (qs.empty) throw new Error("존재하지 않는 도서 코드입니다.");
        bookRef = qs.docs[0].ref;
        bookSnap = qs.docs[0];
      }

      const b = bookSnap.data();
      const isAvail = typeof b.isAvailable === "boolean" ? b.isAvailable
                    : typeof b.available === "boolean" ? b.available
                    : true;
      const status = b.status || (isAvail ? "대출가능" : "대출중");
      if (status === "대출중") throw new Error("이미 대출 중인 도서입니다.");

      // 대여 로그 생성
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

      // 책 상태 업데이트 (두 스키마 동시 반영)
      await updateDoc(bookRef, {
        status: "대출중",
        isAvailable: false,
        available: false,
        dueDate: b.dueDate || null,
      });

      setSuccess(true); // 완료 오버레이
    } catch (err) {
      console.error(err);
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
              className="w-full mt-1 rounded-xl border border-gray-300 bg-white px-3 py-3 text-base font-medium hover:bg-gray-50"
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
            <Summary title={bookTitle} onRescan={() => { setStep(1); }} />
            <input
              value={bookTitle}
              readOnly
              placeholder="도서 제목 (스캔 시 자동 표시)"
              className="block w-full mt-3 rounded-xl border border-gray-300 px-3 py-3 text-base focus:ring-2 focus:ring-gray-900 outline-none"
            />

            <label className="block mt-4 text-sm font-semibold">사번</label>
            <input
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              inputMode="numeric" maxLength={6} placeholder="6자리 숫자"
              className="block w-full rounded-xl border border-gray-300 px-3 py-3 text-base focus:ring-2 focus:ring-gray-900 outline-none"
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

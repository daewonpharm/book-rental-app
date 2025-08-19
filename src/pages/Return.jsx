import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import {
  collection, getDocs, doc, getDoc, serverTimestamp, updateDoc,
  query, where, orderBy, limit
} from "firebase/firestore";
import Stepper from "../components/Stepper";
import Summary from "../components/Summary";
import ScannerModal from "../components/ScannerModal";
import SuccessOverlay from "../components/SuccessOverlay";
import BarcodeScanner from "../components/BarcodeScanner";

const ratingOptions = ["5.0","4.5","4.0","3.5","3.0","2.5","2.0","1.5","1.0","0.5"];
const isValidEmployeeId = (v) => /^\d{6}$/.test(String(v || ""));

export default function Return() {
  const [step, setStep] = useState(1);
  const [employeeId, setEmployeeId] = useState("");
  const [bookCode, setBookCode] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [rating, setRating] = useState(""); // 필수
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
        console.error("[Return] Firestore error:", e);
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

  const canSubmit = useMemo(
    () => isValidEmployeeId(employeeId) && !!bookCode && !!rating,
    [employeeId, bookCode, rating]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      if (!db) throw new Error("Firebase가 초기화되지 않았습니다. /__env를 확인하세요.");
      setLoading(true);

      // 1) 대여 로그 조회 (미반납 건)
      const qy = query(
        collection(db, "rentLogs"),
        where("bookCode", "==", bookCode),
        where("returnedAt", "==", null),
        orderBy("rentedAt", "desc"),
        limit(1)
      );
      const snap = await getDocs(qy);
      if (snap.empty) throw new Error("반납 대상 대여 기록을 찾지 못했습니다.");
      const logDoc = snap.docs[0];
      const log = logDoc.data();

      // 2) 사번 일치 검증
      if (String(log.renterId) !== String(employeeId)) {
        throw new Error("대여자 사번과 일치하지 않습니다. 본인이 대여한 도서만 반납할 수 있어요.");
      }

      // 3) 로그 업데이트
      await updateDoc(logDoc.ref, { returnedAt: serverTimestamp(), rating: parseFloat(rating) });

      // 4) 책 상태/평점 업데이트 (문서ID ↔ bookCode 필드 역검색)
      let bookRef = doc(db, "books", bookCode);
      let bookSnap = await getDoc(bookRef);
      if (!bookSnap.exists()) {
        const qb = query(collection(db, "books"), where("bookCode", "==", bookCode), limit(1));
        const qbs = await getDocs(qb);
        if (qbs.empty) throw new Error("도서 문서를 찾지 못했습니다.");
        bookRef = qbs.docs[0].ref;
        bookSnap = qbs.docs[0];
      }

      if (bookSnap.exists()) {
        const b = bookSnap.data();
        const prevAvg = Number(b.avgRating || 0);
        const prevCnt = Number(b.ratingCount || 0);
        const newCnt = prevCnt + 1;
        const newAvg = ((prevAvg * prevCnt) + parseFloat(rating)) / newCnt;
        await updateDoc(bookRef, {
          status: "대출가능",
          isAvailable: true,   // 신 스키마
          available: true,     // 구 스키마 호환
          dueDate: null,
          avgRating: Number(newAvg.toFixed(2)),
          ratingCount: newCnt,
        });
      }

      setSuccess(true); // 완료 오버레이
    } catch (err) {
      console.error(err);
      alert(err.message || "처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setEmployeeId(""); setBookCode(""); setBookTitle(""); setRating(""); setStep(1); setSuccess(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold">반납하기 🔁</h1>
      <Stepper current={step} labels={["스캔","사번/평점"]} />

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

            <label className="block mt-4 text-sm font-semibold">⭐ 책에 대한 별점을 남겨주세요 (필수)</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="block w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
            >
              <option value="">별점 선택</option>
              {ratingOptions.map((r) => (<option key={r} value={r}>{r}</option>))}
            </select>

            <button
              type="submit" disabled={!canSubmit || loading}
              className="mt-6 w-full rounded-xl bg-gray-900 text-white py-3 text-sm font-semibold disabled:opacity-40"
            >
              {loading ? "처리 중..." : "반납 등록"}
            </button>
          </>
        )}
      </form>

      {success && (
        <SuccessOverlay
          mode="return"
          title="반납이 완료되었습니다."
          desc="고생하셨어요. 다음 독서도 응원할게요!"
          onClose={resetAll}
        />
      )}
    </div>
  );
}

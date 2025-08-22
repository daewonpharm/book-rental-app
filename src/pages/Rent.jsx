import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import {
  collection, getDocs, getDoc, doc, query, where, limit,
  serverTimestamp, updateDoc, addDoc
} from "firebase/firestore";
import Stepper from "../components/Stepper";
import Summary from "../components/Summary";
import ScannerModal from "../components/ScannerModal";
import SuccessOverlay from "../components/SuccessOverlay";
import BarcodeScanner from "../components/BarcodeScanner";
import { Icons } from "../constants/icons";

/** 6자리 사번 검사 */
const isValidEmployeeId = (v) => /^\d{6}$/.test(String(v || ""));

export default function Rent() {
  const [step, setStep] = useState(1);
  const [employeeId, setEmployeeId] = useState("");
  const [bookCode, setBookCode] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [bookDocId, setBookDocId] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerKey, setScannerKey] = useState(0); // 🔑 매 스캔마다 인스턴스 새로
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 책 정보 요약
  const summaryItems = useMemo(() => ([
    { label: "도서", value: bookTitle || "—" },
    { label: "사번", value: employeeId || "—" },
  ]), [bookTitle, employeeId]);

  // 스캔 성공
  const handleDetected = async (raw) => {
    const code = String(raw || "").trim().toLowerCase();
    if (!code) return;
    try {
      const q = query(collection(db, "books"), where("code", "==", code), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) {
        alert("해당 바코드의 책을 찾을 수 없어요. 관리자에게 문의해 주세요.");
        setShowScanner(false);
        return;
      }
      const docSnap = snap.docs[0];
      const data = docSnap.data();
      setBookDocId(docSnap.id);
      setBookCode(code);
      setBookTitle(data.title || "");
      setShowScanner(false);
      setStep(2);
    } catch (e) {
      console.error(e);
      alert("스캔 처리 중 오류가 발생했어요.");
      setShowScanner(false);
    }
  };

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    if (!bookDocId) return alert("책을 먼저 스캔해 주세요.");
    if (!isValidEmployeeId(employeeId)) return alert("사번 6자리를 입력해 주세요.");

    setLoading(true);
    try {
      const bookRef = doc(db, "books", bookDocId);
      const bookSnap = await getDoc(bookRef);
      if (!bookSnap.exists()) throw new Error("책 문서를 찾을 수 없습니다.");
      const book = bookSnap.data();

      if (book.status === "rented") {
        return alert("이미 대출 중인 도서입니다.");
      }

      // 반납 예정일 = 2주 후
      const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

      // 책 상태 업데이트
      await updateDoc(bookRef, {
        status: "rented",
        currentBorrowerId: employeeId,
        rentedAt: serverTimestamp(),
        dueAt: due,
      });

      // 누적 로그 추가
      await addDoc(collection(db, "rentLogs"), {
        bookId: bookDocId,
        bookCode: bookCode,
        title: book.title || bookTitle,
        employeeId: employeeId,
        rentedAt: serverTimestamp(),
        returnedAt: null,
      });

      setSuccess(true); // ✅ 책 애니메이션 오버레이 표시
    } catch (e) {
      console.error(e);
      alert("대여 처리 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setStep(1);
    setEmployeeId("");
    setBookCode("");
    setBookTitle("");
    setBookDocId(null);
    setSuccess(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold">
        <span aria-hidden className="mr-2">{Icons.rent}</span>대여하기
      </h1>
      <Stepper current={step} labels={["스캔","사번"]} />

      <form onSubmit={onSubmit} className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
        {step === 1 && (
          <>
            <label className="block text-sm font-semibold">{Icons.scan} 바코드 스캔</label>
            <button
              type="button"
              onClick={() => { setScannerKey(k => k + 1); setShowScanner(true); }}
              className="w-full mt-1 rounded-xl border border-gray-300 bg-white px-3 py-3 text-base font-medium hover:bg-gray-50"
            >
              <span className="mr-1">{Icons.scan}</span>카메라로 스캔하기
            </button>

            {showScanner && (
              <ScannerModal onClose={() => setShowScanner(false)}>
                <BarcodeScanner
                  key={scannerKey}
                  onDetected={handleDetected}
                  onClose={() => setShowScanner(false)}
                />
              </ScannerModal>
            )}

            <input
              type="text"
              value={bookTitle}
              readOnly
              placeholder="도서 제목 (스캔 시 자동 표시)"
              className="mt-4 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-base"
            />
          </>
        )}

        {step === 2 && (
          <>
            <Summary items={summaryItems} />

            <label className="block mt-4 text-sm font-semibold">사번</label>
            <input
              inputMode="numeric"
              pattern="\d*"
              maxLength={6}
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.replace(/\D/g, "").slice(0,6))}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-base"
              placeholder="사번 6자리"
            />

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-3 text-base"
              >
                이전
              </button>
              <button
                type="submit"
                disabled={loading || !isValidEmployeeId(employeeId)}
                className="flex-1 rounded-xl bg-black text-white px-3 py-3 text-base disabled:opacity-50"
              >
                {loading ? "처리 중..." : "대여 완료"}
              </button>
            </div>
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

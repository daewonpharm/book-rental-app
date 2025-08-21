import React, { useEffect, useState } from "react";


const now = new Date();
const due = new Date(now);
due.setDate(due.getDate() + 14);


// books 업데이트
await updateDoc(bookRef, {
status: "대출중",
rentedBy: employeeId,
rentedAt: serverTimestamp(),
dueAt: Timestamp.fromDate(due),
});


// rentLogs 생성
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
onClick={rent}
>
대여하기
</button>
</div>
</div>
);
}
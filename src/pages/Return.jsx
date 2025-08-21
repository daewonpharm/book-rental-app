import React, { useState } from "react";
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
return (
<option key={val} value={val}>{`⭐ ${val}`}</option>
);
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
import React, { useState } from "react";
import BarcodeScanner from "../components/BarcodeScanner";

export default function Rent() {
  const [scanning, setScanning] = useState(false);

  return (
    <div className="w-full flex justify-center px-4">
      <div className="w-full max-w-screen-sm space-y-4">
        <h2 className="text-xl font-bold mt-4">📥 도서 대여</h2>

        <label className="block text-sm font-semibold">📷 바코드 스캔</label>
        <button
          className="w-full bg-[#fca15f] text-white py-2 rounded hover:bg-orange-500"
          onClick={() => setScanning(!scanning)}
        >
          {scanning ? "📷 스캔 중지" : "📷 카메라로 스캔하기"}
        </button>

        {scanning && <BarcodeScanner setScanning={setScanning} />}

        <label className="block text-sm font-semibold">📕 도서 제목</label>
        <input
          type="text"
          className="w-full border p-2 rounded bg-gray-100"
          placeholder="(스캔 시 자동 표시)"
          disabled
        />

        <label className="block text-sm font-semibold">👤 사번 6자리</label>
        <input
          type="text"
          className="w-full border p-2 rounded bg-black text-white"
          placeholder="사번을 입력해주세요"
        />

        <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          대여하기
        </button>
      </div>
    </div>
  );
}

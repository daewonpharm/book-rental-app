import React from "react";
export default function ScannerModal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
        <button onClick={onClose} className="absolute right-3 top-3 text-sm text-gray-500">닫기</button>
        {children}
      </div>
    </div>
  );
}

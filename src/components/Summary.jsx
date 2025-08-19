import React from "react";

/**
 * 스캔 요약 카드
 * - 코드(code)는 내부적으로만 유지하고, 화면에는 노출하지 않음
 */
export default function Summary({ title, onRescan }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 flex items-center justify-between">
      <div className="min-w-0">
        <div className="text-base font-semibold text-gray-900 truncate">
          {title || "스캔한 도서"}
        </div>
        {/* 코드 표시는 하지 않습니다. */}
      </div>
      <button
        type="button"
        onClick={onRescan}
        className="shrink-0 text-sm font-medium text-gray-600 hover:text-gray-800 underline"
      >
        다시 스캔
      </button>
    </div>
  );
}

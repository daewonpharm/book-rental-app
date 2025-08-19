import React from "react";
export default function Summary({ code, title, onRescan }) {
  if (!code && !title) return null;
  return (
    <div className="rounded-xl border border-gray-200 p-3 bg-gray-50 flex items-center justify-between">
      <div className="text-sm">
        <div className="font-medium text-gray-900">{title || "(제목 미확인)"}</div>
        <div className="text-xs text-gray-500">{code}</div>
      </div>
      <button onClick={onRescan} type="button" className="text-xs rounded-lg border px-2 py-1">다시 스캔</button>
    </div>
  );
}

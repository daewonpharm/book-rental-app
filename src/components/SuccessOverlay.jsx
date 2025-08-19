import React, { useEffect } from "react";
import { Icons } from "../constants/icons";

export default function SuccessOverlay({
  mode = "rent",
  title = "완료되었습니다.",
  desc,
  durationMs = 2400,
  onClose,
}) {
  useEffect(() => {
    const t = setTimeout(() => onClose?.(), durationMs);
    return () => clearTimeout(t);
  }, [durationMs, onClose]);

  const flyClass = mode === "rent" ? "so-fly-in" : "so-fly-out";
  const delay = mode === "return" ? "200ms" : "0ms";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 so-allow-motion" aria-live="polite" role="status">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl text-center">
        <div
          className={`relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-6xl ${flyClass}`}
          style={{ ["--so-dur"]: "1600ms", ["--so-delay"]: delay, willChange: "transform, opacity" }}
        >
          <span aria-hidden="true">{Icons.books}</span>
          <span className="so-pop so-pop-1">✨</span>
          <span className="so-pop so-pop-2">✨</span>
          <span className="so-pop so-pop-3">✨</span>
        </div>
        <div className="text-lg font-semibold text-gray-900">{title}</div>
        {desc && <div className="mt-1 text-sm text-gray-500">{desc}</div>}
        <button type="button" onClick={() => onClose?.()} className="mt-4 inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
          닫기
        </button>
      </div>
    </div>
  );
}

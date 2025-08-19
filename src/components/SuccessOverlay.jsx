import React, { useEffect } from "react";

/**
 * 성공 오버레이
 * - mode: 'rent' | 'return'
 *   - rent  : 책이 위에서 중앙으로 "천천히" 날아옴
 *   - return: 중앙에서 위로 "천천히" 날아감(잠깐 보여준 뒤 이동)
 * - durationMs: 자동 닫힘까지 유지 시간 (기본 2400ms)
 */
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

  // 애니메이션 클래스 / 지연시간
  const flyClass = mode === "rent" ? "so-fly-in" : "so-fly-out";
  const delay = mode === "return" ? "200ms" : "0ms";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      aria-live="polite"
      role="status"
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl text-center">
        {/* 책 이모지 */}
        <div
          className={`relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-6xl ${flyClass}`}
          style={{
            // ⏱️ 여기서 속도를 한 번 더 조절할 수 있어요.
            // 1400ms: 느긋 / 1000ms: 보통 / 800ms: 빠름
            ["--so-dur"]: "1400ms",
            ["--so-delay"]: delay,
          }}
        >
          <span aria-hidden="true">📚</span>

          {/* 반짝 효과 (가벼운 포인트) */}
          <span className="so-pop so-pop-1">✨</span>
          <span className="so-pop so-pop-2">✨</span>
          <span className="so-pop so-pop-3">✨</span>
        </div>

        <div className="text-lg font-semibold text-gray-900">{title}</div>
        {desc && <div className="mt-1 text-sm text-gray-500">{desc}</div>}

        <button
          type="button"
          onClick={() => onClose?.()}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

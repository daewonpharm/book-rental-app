import React, { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);

  // 공통 정리 함수: 트랙 stop + srcObject 비우기 + 리더 reset
  const cleanup = () => {
    try { readerRef.current?.reset?.(); } catch {}
    const v = videoRef.current;
    if (v && v.srcObject) {
      try {
        v.srcObject.getTracks().forEach((t) => t.stop());
      } catch {}
      v.srcObject = null;
    }
  };

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();

    const start = async () => {
      const reader = readerRef.current;
      try {
        // 1차: 사파리에서 후면을 가장 안정적으로 강제하는 방식
        // decodeFromConstraints → facingMode: environment
        await reader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          videoRef.current,
          (result, err, controls) => {
            if (result) {
              const text = (result.getText() || "").trim().toLowerCase();
              cleanup();
              onDetected?.(text);
            }
          }
        );
      } catch (e1) {
        // 2차 폴백: 기기 나열 후 ‘back|rear|environment’ 우선 선택
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const cams = devices.filter((d) => d.kind === "videoinput");
          const back =
            cams.find((d) => /back|rear|environment/i.test(d.label)) ||
            cams[cams.length - 1] ||
            cams[0];

          await reader.decodeFromVideoDevice(
            back?.deviceId,
            videoRef.current,
            (result, err) => {
              if (result) {
                const text = (result.getText() || "").trim().toLowerCase();
                cleanup();
                onDetected?.(text);
              }
            }
          );
        } catch (e2) {
          console.error("[Scanner] camera start failed", e1, e2);
          cleanup();
          onClose?.(); // 모달 닫기
        }
      }
    };

    start();

    // 언마운트 시 완전 정리 (iOS에서 매우 중요)
    return cleanup;
  }, [onDetected, onClose]);

  return (
    <div className="relative w-full max-w-md aspect-video bg-black overflow-hidden rounded-2xl">
      {/* iOS는 playsInline 필수 */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
      />
      <div className="pointer-events-none absolute inset-0 border-4 border-green-500/90 rounded-xl" />
      {/* 스캔 중에만 보이는 안내문 */}
      <div className="absolute bottom-2 left-2 right-2 text-xs text-yellow-300 bg-black/70 p-2 rounded">
        ⚠️ iOS 사파리에서 후면 카메라가 고정되지 않거나 두 번째 스캔에서 전면으로 바뀌면
        스캐너를 닫았다가 다시 열어주세요. (이번 버전은 자동 정리/재요청을 적용했습니다)
      </div>
    </div>
  );
}

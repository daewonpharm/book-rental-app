// src/components/BarcodeScanner.jsx
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
        // 1차: 사파리에서 후면을 안정적으로 강제
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
          (result) => {
            if (result) {
              const text = (result.getText() || "").trim().toLowerCase();
              cleanup();
              onDetected?.(text);
            }
          }
        );
      } catch (e1) {
        // 2차 폴백: back/rear/environment 우선 선택
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
            (result) => {
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

    // 언마운트 시 완전 정리 (iOS에서 중요)
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
    </div>
  );
}

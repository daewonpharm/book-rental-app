import React, { useEffect, useRef } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();

    const startScanner = async () => {
      try {
        const constraints = isIOS
          ? {
              video: {
                facingMode: { exact: "environment" }, // ✅ iOS: 후면 카메라 강제
              },
            }
          : {
              video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
            };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", true); // iOS 용
          await videoRef.current.play();
        }

        codeReader.current.decodeFromVideoElement(videoRef.current, (result, err) => {
          if (result) {
            codeReader.current.reset();
            stream.getTracks().forEach((track) => track.stop()); // 카메라 종료
            onDetected(result.getText().toLowerCase()); // ✅ 대소문자
          } else if (err && !(err instanceof NotFoundException)) {
            console.error("📛 바코드 오류:", err);
          }
        });
      } catch (error) {
        console.error("❌ 카메라 접근 오류:", error);
        onClose();
      }
    };

    startScanner();

    return () => {
      codeReader.current?.reset();
      const tracks = videoRef.current?.srcObject?.getTracks?.();
      tracks?.forEach((track) => track.stop());
    };
  }, [onDetected, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md aspect-video bg-black overflow-hidden rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
        <div className="absolute inset-0 border-4 border-green-500 pointer-events-none" />
        <button
          className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded text-sm"
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

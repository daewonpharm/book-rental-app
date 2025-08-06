import React, { useEffect, useRef } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const streamRef = useRef(null);
  const scanningRef = useRef(true); // 중복 인식 방지

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();

    const startScanner = async () => {
      try {
        const constraints = {
          video: {
            facingMode: { exact: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", true);
          videoRef.current.play();
        }

        codeReader.current.decodeFromVideoElement(videoRef.current, (result, err) => {
          if (!scanningRef.current) return;

          if (result) {
            scanningRef.current = false; // 인식 중복 방지
            console.log("✅ 바코드 인식:", result.getText());

            // 앱 상태 충돌 방지를 위해 지연 처리
            setTimeout(() => {
              onDetected(result.getText());
              stopScanner();
            }, 100);
          } else if (err && !(err instanceof NotFoundException)) {
            console.error("📛 ZXing Error:", err);
          }
        });
      } catch (err) {
        console.error("❌ 카메라 접근 오류:", err);
        onClose();
      }
    };

    const stopScanner = () => {
      codeReader.current?.reset();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };

    startScanner();

    return () => {
      scanningRef.current = false;
      stopScanner();
    };
  }, [onDetected, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md aspect-video bg-black overflow-hidden rounded"
        onClick={(e) => e.stopPropagation()} // 모달 닫기 방지
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

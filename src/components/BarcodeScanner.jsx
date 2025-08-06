import React, { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();

    const startScanner = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        const backCamera =
          videoDevices.find((d) =>
            d.label.toLowerCase().includes("back")
          ) || videoDevices[0];

        await codeReader.current.decodeFromVideoDevice(
          backCamera.deviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              onDetected(result.getText().toLowerCase()); // 소문자 처리
              codeReader.current.reset();
            }
          }
        );
      } catch (error) {
        console.error("❌ 카메라 오류:", error);
        onClose();
      }
    };

    startScanner();

    return () => {
      codeReader.current?.reset();
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
        {/* 안내 문구 */}
<div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm text-yellow-300 bg-black/70 p-1 px-3 rounded">
          ⚠️ iOS에서는 두 번째 스캔부터 전면 카메라가 사용될 수 있어요. 작동이 안 되면 새로고침 해주세요.
        </div>

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

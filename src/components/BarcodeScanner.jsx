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

        // ✅ 항상 후면 카메라 다시 탐색
        const backCamera =
          videoDevices.find((d) =>
            d.label.toLowerCase().includes("back")
          ) || videoDevices[videoDevices.length - 1]; // 마지막 카메라 fallback

        if (!backCamera) {
          throw new Error("사용 가능한 카메라를 찾을 수 없습니다.");
        }

        // ✅ decodeFromVideoDevice에 명시적으로 후면 카메라 deviceId 전달
        await codeReader.current.decodeFromVideoDevice(
          backCamera.deviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              console.log("✅ 바코드 인식:", result.getText());
              onDetected(result.getText());
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

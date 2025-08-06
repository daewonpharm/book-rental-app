import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const [backCameraId, setBackCameraId] = useState(null); // ✅ 카메라 ID 저장

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();

    const startScanner = async () => {
      try {
        let deviceId = backCameraId;

        if (!deviceId) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter((d) => d.kind === "videoinput");

          const backCam =
            videoDevices.find((d) =>
              d.label.toLowerCase().includes("back")
            ) || videoDevices[0]; // fallback

          deviceId = backCam.deviceId;
          setBackCameraId(deviceId); // ✅ 저장
        }

        await codeReader.current.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              codeReader.current.reset();
              onDetected(result.getText().toLowerCase()); // ✅ 소문자 처리
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
  }, [onDetected, onClose, backCameraId]); // ✅ backCameraId 의존성 추가

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

import React, { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();

    const startScanner = async () => {
      try {
        // ✅ 1. 사용 가능한 카메라 찾기
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");

        const backCamera =
          videoDevices.find((d) =>
            d.label.toLowerCase().includes("back")
          ) || videoDevices[videoDevices.length - 1];

        if (!backCamera) throw new Error("후면 카메라를 찾을 수 없습니다.");

        // ✅ 2. 카메라 완전 초기화
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        // ✅ 3. 해상도 + 후면 카메라 명시
        const constraints = {
          video: {
            deviceId: backCamera.deviceId,
            facingMode: { exact: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          },
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", true);
          await videoRef.current.play();
        }

        // ✅ 4. 바코드 인식 시작
        await codeReader.current.decodeFromVideoElement(videoRef.current, (result, err) => {
          if (result) {
            onDetected(result.getText());
            stopScanner(); // 인식되면 정지
          }
        });
      } catch (error) {
        console.error("❌ 카메라 오류:", error);
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
    return () => stopScanner();
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

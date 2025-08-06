import React, { useEffect, useRef } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const streamRef = useRef(null);

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
          if (result) {
            console.log("✅ Barcode Detected:", result.getText());
            onDetected(result.getText());
            stopScanner(); // Stop scanning after detection
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

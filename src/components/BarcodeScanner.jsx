import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const streamRef = useRef(null);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const [videoKey, setVideoKey] = useState(Date.now()); // video 초기화용 key

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();

    const startScanner = async () => {
      try {
        const constraints = isIOS
          ? { video: { facingMode: { exact: "environment" } } }
          : { video: { facingMode: "environment", width: 1280, height: 720 } };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", true); // iOS
          videoRef.current.play();
        }

        codeReader.current.decodeFromVideoElement(videoRef.current, (result, err) => {
          if (result) {
            const code = result.getText().toLowerCase();
            console.log("✅ 인식 성공:", code);
            onDetected(code);
            stopScanner();
          } else if (err && !(err instanceof NotFoundException)) {
            console.error("📛 바코드 오류:", err);
          }
        });
      } catch (err) {
        console.error("❌ 카메라 접근 실패:", err);
        onClose();
      }
    };

    const stopScanner = () => {
      codeReader.current?.reset();

      const tracks = streamRef.current?.getTracks?.();
      tracks?.forEach((track) => track.stop());

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
        videoRef.current.load();
      }

      // iOS 재사용 방지를 위해 key를 재생성
      setVideoKey(Date.now());
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
          key={videoKey} // ✅ video DOM 자체 초기화
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

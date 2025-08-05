import React, { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({ onDetected }) {
  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 100 }, // 스캔 영역
      aspectRatio: 1.777, // 16:9 화면에 최적화
    };

    const html5QrCode = new Html5Qrcode("reader");

    html5QrCode
      .start(
        { facingMode: "environment" }, // 후면 카메라 우선
        config,
        (decodedText) => {
          html5QrCode.stop().then(() => {
            onDetected(decodedText);
          });
        },
        (error) => {
          // 인식 실패 시에도 아무 동작 안함 (에러 무시)
        }
      )
      .catch((err) => {
        console.error("Camera start error:", err);
      });

    return () => {
      html5QrCode
        .stop()
        .then(() => html5QrCode.clear())
        .catch((err) => console.error("Cleanup error:", err));
    };
  }, [onDetected]);

  return (
    <div
      id="reader"
      className="w-full max-w-md mx-auto border rounded overflow-hidden"
      style={{ height: "300px" }}
    />
  );
}

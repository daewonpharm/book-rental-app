// src/components/BarcodeScanner.jsx
import React, { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({ onDetected }) {
  useEffect(() => {
    const scanner = new Html5Qrcode("reader");

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" }, // 후면 카메라 사용
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText, decodedResult) => {
            const code = decodedText.trim().toLowerCase();
            onDetected(code); // 결과 전달
            scanner.stop(); // 스캔 종료
          },
          (errorMessage) => {
            // console.log("스캔 실패", errorMessage);
          }
        );
      } catch (err) {
        console.error("카메라 접근 오류:", err);
      }
    };

    startScanner();

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onDetected]);

  return (
    <div className="mt-4">
      <div id="reader" style={{ width: "100%" }}></div>
    </div>
  );
}

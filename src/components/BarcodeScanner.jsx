// src/components/BarcodeScanner.jsx
import React, { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({ onDetected }) {
  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");

    let isScanned = false;

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();

        if (!devices || devices.length === 0) {
          alert("카메라를 찾을 수 없습니다.");
          return;
        }

        const rearCamera = devices.find(
          (d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.includes("후면")
        ) || devices[0];

        await html5QrCode.start(
          rearCamera.id,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            if (isScanned) return;
            isScanned = true;

            await html5QrCode.stop(); // ✅ 먼저 스캔 중단
            document.getElementById("reader").innerHTML = ""; // ✅ 카메라 뷰 제거

            onDetected(decodedText); // ✅ 상태 업데이트는 그 다음
          },
          (errorMessage) => {
            // 필요시 무시
          }
        );
      } catch (err) {
        console.error("스캐너 시작 실패", err);
      }
    };

    startScanner();

    return () => {
      html5QrCode.stop().catch(() => {});
    };
  }, [onDetected]);

  return (
    <div id="reader" style={{ width: "100%", maxWidth: "400px", margin: "auto" }} />
  );
}

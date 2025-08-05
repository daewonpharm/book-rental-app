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

        const rearCamera = devices.find(
          (d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.includes("후면")
        ) || devices[0];

        await html5QrCode.start(
          rearCamera.id,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (isScanned) return;
            isScanned = true;

            console.log("✅ 스캔 성공:", decodedText);

            // 1️⃣ 0.5초 뒤에 종료 → 충돌 방지
            setTimeout(async () => {
              try {
                await html5QrCode.stop();
              } catch (e) {
                console.warn("❌ 스캐너 종료 중 오류:", e);
              }
              document.getElementById("reader").innerHTML = "";
              onDetected(decodedText); // 2️⃣ 종료 이후 전달
            }, 500);
          },
          () => {}
        );
      } catch (e) {
        console.error("❌ 카메라 시작 실패:", e);
      }
    };

    startScanner();

    return () => {
      html5QrCode.stop().catch(() => {});
    };
  }, [onDetected]);

  return (
    <div
      id="reader"
      style={{
        width: "100%",
        maxWidth: "400px",
        margin: "auto",
        aspectRatio: "1 / 1",
      }}
    />
  );
}

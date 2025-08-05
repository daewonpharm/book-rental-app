// src/components/BarcodeScanner.jsx
import React, { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({ onDetected }) {
  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");

    let isCancelled = false;

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();

        if (!devices || devices.length === 0) {
          alert("카메라를 찾을 수 없습니다.");
          return;
        }

        // ✅ 후면 카메라 찾기: label에 'back' 또는 '후면'이 포함된 카메라 선택
        const rearCamera = devices.find(
          (d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.includes("후면")
        ) || devices[0]; // 없으면 첫 번째 카메라

        await html5QrCode.start(
          rearCamera.id,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (isCancelled) return;

            onDetected(decodedText); // ✅ 도서 코드 전달
            isCancelled = true;

            html5QrCode.stop().then(() => {
              console.log("스캐너 종료");
            });
          },
          (errorMessage) => {
            // console.warn("스캔 실패", errorMessage); // 필요시 로그
          }
        );
      } catch (err) {
        console.error("스캐너 시작 실패", err);
      }
    };

    startScanner();

    return () => {
      isCancelled = true;
      html5QrCode.stop().catch(() => {});
    };
  }, [onDetected]);

  return (
    <div id="reader" style={{ width: "100%", maxWidth: "400px", margin: "auto" }} />
  );
}

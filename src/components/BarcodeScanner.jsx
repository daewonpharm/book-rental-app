// components/BarcodeScanner.jsx
import React, { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({ onDetected }) {
  useEffect(() => {
    const scanner = new Html5Qrcode("reader");

    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        const cameraId = devices[0].id;
        scanner.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onDetected(decodedText);
            scanner.stop();
          },
          (errorMessage) => {
            console.warn("Scan error", errorMessage);
          }
        );
      }
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onDetected]);

  return (
    <div id="reader" style={{ width: "100%", maxWidth: "400px", margin: "auto" }}></div>
  );
}

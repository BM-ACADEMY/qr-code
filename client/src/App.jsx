import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QrScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const qrCodeRegionId = "qr-reader";
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const startScanner = async () => {
      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: 250,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      };

      const constraints = {
        facingMode: { exact: "environment" }, // Force back camera
      };

      try {
        await html5QrCode.start(
          { video: constraints },
          config,
          (decodedText) => {
            setScanResult(decodedText);
            html5QrCode.stop();
          },
          (error) => {
            console.warn("Scan error:", error);
          }
        );
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    startScanner();

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current.clear();
        });
      }
    };
  }, []);

  return (
    <div>
      <div id={qrCodeRegionId} className="w-full h-[300px]" />
      {scanResult && <p>Scanned: {scanResult}</p>}
    </div>
  );
};

export default QrScanner;

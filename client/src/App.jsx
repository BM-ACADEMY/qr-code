// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import {
//   Html5QrcodeScanner,
//   Html5QrcodeScanType,
// } from "html5-qrcode";
// import { Button } from "@/components/ui/button";
// import {
//   ScanLine,
//   Copy,
//   Check,
//   ExternalLink,
// } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";

// const QrScanner = () => {
//   const [scanResult, setScanResult] = useState(null);
//   const [cameraStarted, setCameraStarted] = useState(false);
//   const [showDialog, setShowDialog] = useState(false);
//   const [copied, setCopied] = useState(false);
//   const scannerRef = useRef(null);

//   const startScanner = () => {
//     setCameraStarted(true);
//   };

//   const stopScanner = () => {
//     if (scannerRef.current) {
//       scannerRef.current
//         .clear()
//         .then(() => scannerRef.current = null)
//         .catch((error) => {
//           console.error("Failed to clear scanner", error);
//         });
//       setCameraStarted(false);
//     }
//   };

//   useEffect(() => {
//     if (!cameraStarted) return;

//     const html5QrcodeScanner = new Html5QrcodeScanner(
//       "qr-reader",
//       {
//         fps: 10,
//         qrbox: 250,
//         supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
//       },
//       false
//     );

//     scannerRef.current = html5QrcodeScanner;

//     html5QrcodeScanner.render(
//       (decodedText) => {
//         setScanResult(decodedText);
//         setShowDialog(true);
//         stopScanner();
//       },
//       (error) => {
//         console.warn("QR Scan error:", error);
//       }
//     );

//     return () => {
//       html5QrcodeScanner
//         .clear()
//         .then(() => (scannerRef.current = null))
//         .catch((error) =>
//           console.error("Error clearing scanner on unmount", error)
//         );
//     };
//   }, [cameraStarted]);

//   const copyToClipboard = async () => {
//     try {
//       await navigator.clipboard.writeText(scanResult);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch (error) {
//       console.error("Copy failed", error);
//     }
//   };

//   const openInNewTab = () => {
//     if (scanResult) {
//       window.open(scanResult, "_blank");
//     }
//   };

//   return (
//     <div className="max-w-xl mx-auto p-6 text-center pt-24">
//       {!cameraStarted && (
//         <ScanLine className="mx-auto mb-6 w-24 h-24 text-black" />
//       )}

//       <h1 className="text-2xl font-semibold mb-4">QR Code Scanner</h1>

//       {!cameraStarted ? (
//         <Button onClick={startScanner}>Start Scanner</Button>
//       ) : (
//         <>
//           <div id="qr-reader" className="w-full mx-auto mb-4 rounded-md overflow-hidden" />
//           <Button onClick={stopScanner}>Stop Scanner</Button>
//         </>
//       )}

//       {/* Scan Result Dialog */}
//       <Dialog open={showDialog} onOpenChange={setShowDialog}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Scan Result</DialogTitle>
//           </DialogHeader>
//           <p className="text-gray-700 whitespace-pre-wrap break-all">
//             {scanResult}
//           </p>
//           <DialogFooter className="flex gap-2 justify-end items-center">
//             <Button variant="outline" onClick={openInNewTab}>
//               <ExternalLink className="w-4 h-4 mr-2" />
//               Open
//             </Button>
//             <Button variant="outline" onClick={copyToClipboard}>
//               {copied ? (
//                 <>
//                   <Check className="w-4 h-4 mr-2 text-green-600" />
//                   Copied
//                 </>
//               ) : (
//                 <>
//                   <Copy className="w-4 h-4 mr-2" />
//                   Copy
//                 </>
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default QrScanner;


"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const QrScanner = () => {
  const qrRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const startScanner = async () => {
    const qrRegionId = "qr-reader";
    const html5QrCode = new Html5Qrcode(qrRegionId);
    html5QrCodeRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        { facingMode: "environment" }, // Force back camera
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          setResult(decodedText);
          setShowDialog(true);
          stopScanner();
        },
        (error) => {
          console.warn("QR scan error:", error);
        }
      );
      setScanning(true);
    } catch (err) {
      console.error("Camera start failed:", err);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        setScanning(false);
      } catch (err) {
        console.error("Stop failed:", err);
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const openInNewTab = () => {
    if (result) window.open(result, "_blank");
  };

  useEffect(() => {
    return () => {
      stopScanner(); // Cleanup on unmount
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto pt-24 text-center">
      <h1 className="text-2xl font-bold mb-4">QR Code Scanner</h1>

      {!scanning ? (
        <Button onClick={startScanner}>Start Scanner</Button>
      ) : (
        <Button onClick={stopScanner}>Stop Scanner</Button>
      )}

      <div
        id="qr-reader"
        ref={qrRef}
        className="w-full h-[300px] mx-auto mt-6 rounded-md overflow-hidden"
      />

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Result</DialogTitle>
          </DialogHeader>
          <p className="break-words text-gray-800">{result}</p>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={openInNewTab}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open
            </Button>
            <Button variant="outline" onClick={copyToClipboard}>
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QrScanner;

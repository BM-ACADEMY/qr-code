"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

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
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 300, height: 150 } },
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
      stopScanner();
    };
  }, []);

  return (
    <Card className="mt-10 w-full max-w-6xl p-8 rounded-2xl shadow-md bg-white mx-auto">
      <h2 className="text-2xl font-bold text-[#00004d] mb-6 text-center">
        QR Code Scanner
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: QR Scanner */}
        <div className="flex-1 flex flex-col items-center">
          <div className="relative w-full max-w-sm border-2 border-dashed border-[#000052] rounded-xl p-4 bg-[#f5f6fb] shadow-inner">
            <p className="absolute -top-4 left-4 text-xs font-medium bg-white px-2 py-0.5 rounded shadow text-[#000052]">
              Scan Live QR
            </p>

            <div className="w-full h-48 rounded-md overflow-hidden relative">
              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-[#00004d] opacity-20" />
                </div>
              )}
              <div id="qr-reader" ref={qrRef} className="w-full h-full" />
              {scanning && (
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500 animate-scan-beam" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-center">
            {!scanning ? (
              <Button
                onClick={startScanner}
                className="bg-[#000066] hover:bg-[#000080] text-white text-sm"
              >
                Start Scanner
              </Button>
            ) : (
              <Button
                onClick={stopScanner}
                className="bg-red-600 hover:bg-red-700 text-white text-sm"
              >
                Stop Scanner
              </Button>
            )}
          </div>
        </div>

        {/* Right: Info Box */}
        <div className="flex-1 bg-white/50 backdrop-blur-lg border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <QrCode className="w-6 h-6 text-[#00004d]" />
            <h3 className="text-lg font-semibold text-[#00004d]">
              Scan Any QR to Get Details
            </h3>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Use this QR scanner to instantly fetch links, transaction IDs, or
            wallet details. Works with UPI QR codes, payment links, and more.
          </p>

          <ul className="space-y-3 text-gray-700 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#000066] font-semibold">•</span>
              Ensure proper lighting and steady hand while scanning.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#000066] font-semibold">•</span>
              The scanner uses your rear camera (mobile devices only).
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#000066] font-semibold">•</span>
              Use the copy or open options once QR is detected.
            </li>
          </ul>
        </div>
      </div>

      {/* Dialog: Scan Result */}
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
    </Card>
  );
};

export default QrScanner;

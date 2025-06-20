"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { ScanLine, Play, Square } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function QrScanner() {
  const qrRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [customer, setCustomer] = useState({
    name: "",
    id: "",
    balance: 0,
  });
  const [amount, setAmount] = useState("");

  const startScanner = async () => {
    setCameraError("");
    
    try {
      // Clear any previous instance
      if (html5QrCodeRef.current) {
        await stopScanner();
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      const cameras = await Html5Qrcode.getCameras();
      if (cameras && cameras.length > 0) {
        const cameraId = cameras[0].id;
        
        await html5QrCode.start(
          cameraId,
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 } 
          },
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          (error) => {
            console.warn("QR scan error:", error);
          }
        );
        setScanning(true);
      } else {
        setCameraError("No cameras found");
      }
    } catch (err) {
      console.error("Camera start failed:", err);
      setCameraError("Failed to access camera. Please check permissions.");
      html5QrCodeRef.current = null;
    }
  };

  const handleScanSuccess = (decodedText) => {
    try {
      const data = JSON.parse(decodedText);
      if (!data.name || !data.id || typeof data.balance !== "number") {
        alert("Invalid QR code data. Please scan a valid customer QR.");
        return;
      }
      setCustomer({
        name: data.name,
        id: data.id,
        balance: data.balance,
      });
      stopScanner();
    } catch (err) {
      console.error("QR parse error:", err);
      alert("Failed to parse QR code. Please scan a valid customer QR.");
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        setScanning(false);
      } catch (err) {
        console.error("Stop failed:", err);
      } finally {
        html5QrCodeRef.current = null;
      }
    }
  };

  const handleDeduct = () => {
    const deductAmount = parseFloat(amount);
    if (isNaN(deductAmount) || deductAmount <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }

    if (deductAmount > customer.balance) {
      alert(`Insufficient balance. Current balance: ₹${customer.balance}`);
      return;
    }

    const newBalance = customer.balance - deductAmount;
    setCustomer(prev => ({
      ...prev,
      balance: newBalance,
    }));
    setAmount("");
    alert(`Payment successful! New balance: ₹${newBalance}`);
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        stopScanner();
      }
    };
  }, []);

  return (
    <Card className="mt-10 w-full max-w-6xl p-8 rounded-2xl shadow-md bg-white mx-auto">
      <h2 className="text-2xl font-bold text-[#00004d] mb-6 text-left">
        QR Code Scanner
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 flex flex-col items-center">
          <div className="relative w-full max-w-sm border-2 border-dashed border-[#000052] rounded-xl p-4 bg-[#f5f6fb] shadow-inner">
            <p className="absolute -top-4 left-4 text-xs font-medium bg-white px-2 py-0.5 rounded shadow text-[#000052]">
              Scan Live QR
            </p>

            <div className="w-full h-56 rounded-md overflow-hidden relative">
              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ScanLine className="w-40 h-40 text-[#00004d] opacity-90" />
                </div>
              )}
              <div id="qr-reader" ref={qrRef} className="w-full h-full" />
            </div>
            {cameraError && (
              <p className="text-red-500 text-sm mt-2 text-center">{cameraError}</p>
            )}
          </div>

          <div className="mt-6 w-full flex justify-center">
            {!scanning ? (
              <Button
                onClick={startScanner}
                className="bg-[#000066] hover:bg-[#000080] text-white text-sm flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Scanner
              </Button>
            ) : (
              <Button
                onClick={stopScanner}
                className="bg-red-600 hover:bg-red-700 text-white text-sm flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Stop Scanner
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>
                Scan QR to fetch customer details and deduct points.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">
                    Name: {customer.name || "Not scanned"}
                  </p>
                  <p className="text-sm text-gray-500">
                    ID: {customer.id || "Not scanned"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="text-xl font-bold text-blue-700">
                    ₹{customer.balance.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="deductAmount" className="text-sm">
                  Deduct Points
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-base pt-1">₹</span>
                  <Input
                    id="deductAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    className="h-8 px-3 text-sm"
                    placeholder="Amount to deduct"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={!customer.id}
                  />
                </div>
                <Button
                  onClick={handleDeduct}
                  disabled={!customer.id || !amount}
                  className="w-full mt-2 h-8 px-3 py-1 text-xs bg-[#1a2f87] text-white"
                >
                  Deduct Points
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Card>
  );
}
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanLine, Play, Square } from "lucide-react";

const Deduct = () => {
  const qrRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const [scanning, setScanning] = useState(false);
  const [amount, setAmount] = useState("");
  const [customer, setCustomer] = useState({
    name: "",
    id: "",
    balance: 0,
  });

  const startScanner = async () => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCodeRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 300, height: 150 } },
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            if (!data.name || !data.id || typeof data.balance !== "number") {
              alert("Invalid QR code data.");
              return;
            }
            setCustomer({
              name: data.name,
              id: data.id,
              balance: data.balance,
            });
            stopScanner();
          } catch (err) {
            console.error("QR parse error", err);
            alert("Failed to parse QR code.");
          }
        },
        (error) => console.warn("QR scan error:", error)
      );
      setScanning(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      await html5QrCodeRef.current.clear();
      setScanning(false);
    }
  };

  const handleDeduct = () => {
    const deductAmount = parseFloat(amount);
    if (isNaN(deductAmount) || deductAmount <= 0) return;

    if (deductAmount > customer.balance) {
      alert("Insufficient balance.");
      return;
    }

    setCustomer((prev) => ({
      ...prev,
      balance: prev.balance - deductAmount,
    }));
    setAmount("");
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10 flex flex-col lg:flex-row gap-6">
      {/* Left - QR Scanner */}
      <Card className="flex-1 p-6">
        <h2 className="text-xl font-semibold mb-4 text-[#0b1d4d]">
          Scan Customer QR Code
        </h2>
        <div
          id="qr-reader"
          ref={qrRef}
          className="w-full h-60 bg-gray-100 rounded relative"
        >
          {!scanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ScanLine className="text-[#000066] w-20 h-20 opacity-70" />
            </div>
          )}
        </div>

        <div className="mt-4">
          {!scanning ? (
            <Button
              onClick={startScanner}
              className="bg-[#000066] text-white flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> Start Scanner
            </Button>
          ) : (
            <Button
              onClick={stopScanner}
              className="bg-red-600 text-white flex items-center gap-2"
            >
              <Square className="w-4 h-4" /> Stop Scanner
            </Button>
          )}
        </div>
      </Card>

      {/* Right - Customer Info & Deduct */}
      <Card className="flex-1 p-6">
        <h2 className="text-xl font-semibold mb-4 text-[#0b1d4d]">
          Customer Details
        </h2>

        {customer.name ? (
          <div className="border p-4 rounded-lg bg-[#f9fafc]">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="font-bold text-lg">{customer.name}</p>
                <p className="text-sm text-gray-600">ID: {customer.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Balance</p>
                <p className="text-xl font-bold text-blue-700">
                  ₹{customer.balance}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">Deduct Points</label>
              <div className="flex gap-2 items-center">
                <span className="pt-2">₹</span>
                <Input
                  type="number"
                  placeholder="Amount to deduct"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button
                className="w-full mt-2 bg-[#1a2f87] text-white"
                onClick={handleDeduct}
              >
                Deduct Points
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            Please scan a QR code to load customer details.
          </p>
        )}
      </Card>
    </div>
  );
};

export default Deduct;

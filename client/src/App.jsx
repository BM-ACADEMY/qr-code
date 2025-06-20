"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Deduct = () => {
  const qrRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [customer, setCustomer] = useState({ name: "", id: "", balance: 0 });
  const [amount, setAmount] = useState("");

  const startScanner = async () => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCodeRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 300, height: 150 } },
        (decodedText) => {
          console.log("Scanned text:", decodedText); // ✅ Debugging

          try {
            let data = JSON.parse(decodedText);

            // If it's a string inside a string, parse again
            if (typeof data === "string") {
              data = JSON.parse(data);
            }

            setCustomer({
              name: data.name || "",
              id: data.id || "",
              balance: data.balance || 0,
            });
          } catch (err) {
            console.error("Invalid QR JSON:", err);
            setCustomer({ name: "", id: "", balance: 0 });
          }

          stopScanner();
        },
        (err) => console.warn("QR scan error:", err)
      );
      setScanning(true);
    } catch (err) {
      console.error("Camera start failed:", err);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      await html5QrCodeRef.current.clear();
      setScanning(false);
    }
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const handleDeduct = () => {
    if (!amount || isNaN(amount)) return;
    const deducted = parseFloat(amount);
    if (deducted > customer.balance) {
      alert("Insufficient balance");
      return;
    }
    setCustomer((prev) => ({
      ...prev,
      balance: prev.balance - deducted,
    }));
    setAmount("");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto mt-10">
      {/* Left: QR Scanner */}
      <Card className="flex-1 p-6">
        <h2 className="text-xl font-semibold mb-4">Scan Customer QR Code</h2>
        <div
          id="qr-reader"
          ref={qrRef}
          className="w-full h-60 bg-gray-100 rounded"
        />

        <div className="mt-4">
          {!scanning ? (
            <Button onClick={startScanner} className="bg-blue-600 text-white">
              Start Scanner
            </Button>
          ) : (
            <Button onClick={stopScanner} className="bg-red-600 text-white">
              Stop Scanner
            </Button>
          )}
        </div>
      </Card>

      {/* Right: Customer Info */}
      <Card className="flex-1 p-6">
        <h2 className="text-xl font-semibold mb-4">Customer Details</h2>

        {customer.name ? (
          <>
            <div className="mb-2">
              <p className="text-lg font-bold">{customer.name}</p>
              <p className="text-sm text-gray-600">ID: {customer.id}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">Balance</p>
              <p className="text-2xl font-bold text-blue-700">
                ₹{customer.balance}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deduct Points</label>
              <div className="flex gap-2">
                <span className="pt-2">₹</span>
                <Input
                  placeholder="Amount to deduct"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                />
              </div>
              <Button
                onClick={handleDeduct}
                className="w-full bg-blue-800 text-white mt-2"
              >
                Deduct Points
              </Button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">
            Scan a QR code to view customer details.
          </p>
        )}
      </Card>
    </div>
  );
};

export default Deduct;

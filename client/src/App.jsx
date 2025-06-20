"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanLine, Play, Square } from "lucide-react";

const Deduct = () => {
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [amount, setAmount] = useState("");
  const [customer, setCustomer] = useState({
    name: "",
    id: "",
    balance: 0,
  });

  const startScanner = async () => {
    const qrRegionId = "qr-reader";
    const html5QrCode = new Html5Qrcode(qrRegionId);
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
            console.error("QR parse error:", err);
            alert("Failed to parse QR code.");
          }
        },
        (error) => {
          console.warn("QR scan error:", error);
        }
      );
      setScanning(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Failed to start camera. Please allow camera access.");
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.error("Stop scanner failed:", err);
      }
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
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10 flex flex-col lg:flex-row gap-6">
      {/* Left: QR Scanner */}
      <Card className="flex-1 p-6">
        <h2 className="text-xl font-semibold mb-4 text-[#0b1d4d]">
          Scan Customer QR Code
        </h2>
        <div
          id="qr-reader"
          className="w-full h-60 bg-gray-100 rounded relative"
        >
          {!scanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ScanLine className="w-40 h-40 text-[#00004d] opacity-90" />
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

      {/* Right: Customer Info & Deduct */}
      <Card className="flex-1">
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
                Name: {customer.name || "null"}
              </p>
              <p className="text-sm text-gray-500">
                ID: {customer.id || "null"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Balance</p>
              <p className="text-xl font-bold text-blue-700">
                ₹{customer.balance ?? 0}
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
                className="h-8 px-3 text-sm"
                placeholder="Amount to deduct"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button
              onClick={handleDeduct}
              className="w-full mt-2 h-8 px-3 py-1 text-xs bg-[#1a2f87] text-white"
            >
              Deduct Points
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deduct;

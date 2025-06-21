// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { Html5Qrcode } from "html5-qrcode";
// import { Button } from "@/components/ui/button";
// import { ScanLine, Play, Square } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// export default function Refund() {
//   const qrRef = useRef(null);
//   const html5QrCodeRef = useRef(null);
//   const [scanning, setScanning] = useState(false);
//   const [cameraError, setCameraError] = useState("");
//   const [customer, setCustomer] = useState({
//     name: "",
//     id: "",
//     balance: 0,
//   });
//   const [amount, setAmount] = useState("");

//   const [showResultDialog, setShowResultDialog] = useState(false);
//   const [resultMessage, setResultMessage] = useState("");
//   const [isSuccess, setIsSuccess] = useState(true);

//   const getBackCamera = async () => {
//     try {
//       const devices = await navigator.mediaDevices.enumerateDevices();
//       const videoDevices = devices.filter(device => device.kind === "videoinput");
//       const backCamera = videoDevices.find(device =>
//         device.label.toLowerCase().includes("back") ||
//         device.label.toLowerCase().includes("rear")
//       );
//       return backCamera || videoDevices[0];
//     } catch (err) {
//       console.error("Camera enumeration failed:", err);
//       return null;
//     }
//   };

//   const startScanner = async () => {
//     setCameraError("");
//     try {
//       if (html5QrCodeRef.current) {
//         await stopScanner();
//       }

//       const html5QrCode = new Html5Qrcode("qr-reader");
//       html5QrCodeRef.current = html5QrCode;

//       const backCamera = await getBackCamera();
//       if (backCamera) {
//         await html5QrCode.start(
//           backCamera.deviceId,
//           {
//             fps: 10,
//             qrbox: { width: 300, height: 150 },
//           },
//           decodedText => handleScanSuccess(decodedText),
//           error => console.warn("QR scan error:", error)
//         );
//         setScanning(true);
//       } else {
//         await html5QrCode.start(
//           { facingMode: "environment" },
//           {
//             fps: 10,
//             qrbox: { width: 300, height: 150 },
//           },
//           decodedText => handleScanSuccess(decodedText),
//           error => console.warn("QR scan error:", error)
//         );
//         setScanning(true);
//       }
//     } catch (err) {
//       console.error("Camera start failed:", err);
//       setCameraError("Failed to access camera. Please check permissions.");
//       html5QrCodeRef.current = null;
//     }
//   };

//   const handleScanSuccess = decodedText => {
//     try {
//       const data = JSON.parse(decodedText);
//       if (!data.name || !data.id || typeof data.balance !== "number") {
//         setResultMessage("Invalid QR code data. Please scan a valid customer QR.");
//         setIsSuccess(false);
//         setShowResultDialog(true);
//         return;
//       }
//       setCustomer({
//         name: data.name,
//         id: data.id,
//         balance: data.balance,
//       });
//       stopScanner();
//     } catch (err) {
//       console.error("QR parse error:", err);
//       setResultMessage("Failed to parse QR code. Please scan a valid customer QR.");
//       setIsSuccess(false);
//       setShowResultDialog(true);
//     }
//   };

//   const stopScanner = async () => {
//     if (html5QrCodeRef.current) {
//       try {
//         await html5QrCodeRef.current.stop();
//         setScanning(false);
//       } catch (err) {
//         console.error("Stop failed:", err);
//       } finally {
//         html5QrCodeRef.current = null;
//       }
//     }
//   };

//   const handleRefund = () => {
//     const refundAmount = parseFloat(amount);
//     if (isNaN(refundAmount) || refundAmount <= 0) {
//       setResultMessage("Please enter a valid amount greater than 0.");
//       setIsSuccess(false);
//       setShowResultDialog(true);
//       return;
//     }

//     const newBalance = customer.balance + refundAmount;
//     setCustomer(prev => ({
//       ...prev,
//       balance: newBalance,
//     }));
//     setAmount("");
//     setResultMessage(`Refund successful! New balance: ₹${newBalance.toFixed(2)}`);
//     setIsSuccess(true);
//     setShowResultDialog(true);
//   };

//   useEffect(() => {
//     return () => {
//       if (html5QrCodeRef.current) {
//         stopScanner();
//       }
//     };
//   }, []);

//   return (
//     <>
//       <Card className="mt-10 w-full max-w-6xl p-8 rounded-2xl shadow-md bg-white mx-auto">
//         <h2 className="text-2xl font-bold text-[#00004d] mb-6 text-left">
//           Refund QRCode Scanner
//         </h2>

//         <div className="flex flex-col lg:flex-row gap-8">
//           <div className="flex-1 flex flex-col items-center">
//             <div className="relative w-full max-w-sm border-2 border-dashed border-[#000052] rounded-xl p-4 bg-[#f5f6fb] shadow-inner">
//               <p className="absolute -top-4 left-4 text-xs font-medium bg-white px-2 py-0.5 rounded shadow text-[#000052]">
//                 Scan Live QR
//               </p>

//               <div className="w-full h-56 rounded-md overflow-hidden relative">
//                 {!scanning && (
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <ScanLine className="w-40 h-40 text-[#00004d] opacity-90" />
//                   </div>
//                 )}
//                 <div
//                   id="qr-reader"
//                   ref={qrRef}
//                   className="w-full h-full bg-gray-100"
//                 />
//               </div>
//               {cameraError && (
//                 <p className="text-red-500 text-sm mt-2 text-center">{cameraError}</p>
//               )}
//             </div>

//             <div className="mt-6 w-full flex justify-center">
//               {!scanning ? (
//                 <Button
//                   onClick={startScanner}
//                   className="bg-[#000066] hover:bg-[#000080] text-white text-sm flex items-center gap-2"
//                 >
//                   <Play className="w-4 h-4" />
//                   Start Scanner
//                 </Button>
//               ) : (
//                 <Button
//                   onClick={stopScanner}
//                   className="bg-red-600 hover:bg-red-700 text-white text-sm flex items-center gap-2"
//                 >
//                   <Square className="w-4 h-4" />
//                   Stop Scanner
//                 </Button>
//               )}
//             </div>
//           </div>

//           <div className="flex-1">
//             <Card className="h-full">
//               <CardHeader>
//                 <CardTitle>Customer Details</CardTitle>
//                 <CardDescription>
//                   Scan QR to fetch customer details and Refund points.
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="mb-6 flex justify-between items-center">
//                   <div>
//                     <p className="font-semibold text-lg">
//                       Name: {customer.name || "Not scanned"}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       ID: {customer.id || "Not scanned"}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm text-gray-500">Balance</p>
//                     <p className="text-xl font-bold text-blue-700">
//                       ₹{customer.balance.toFixed(2)}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="space-y-1">
//                   <Label htmlFor="deductAmount" className="text-sm">
//                     Refund Amount
//                   </Label>
//                   <div className="flex items-center gap-2">
//                     <span className="text-base pt-1">₹</span>
//                     <Input
//                       id="deductAmount"
//                       type="number"
//                       min="0"
//                       step="0.01"
//                       className="h-8 px-3 text-sm"
//                       placeholder="Amount to Refund"
//                       value={amount}
//                       onChange={e => setAmount(e.target.value)}
//                       disabled={!customer.id}
//                     />
//                   </div>
//                   <Button
//                     onClick={handleRefund}
//                     disabled={!customer.id || !amount}
//                     className="w-full mt-2 h-8 px-3 py-1 text-xs bg-[#1a2f87] text-white"
//                   >
//                     Refund Points
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </Card>

//       {/* ✅ Result Dialog */}
//       <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle className={isSuccess ? "text-green-600" : "text-red-600"}>
//               {isSuccess ? "Success" : "Error"}
//             </DialogTitle>
//           </DialogHeader>
//           <p className="text-sm text-gray-700">{resultMessage}</p>
//           <DialogFooter>
//             <Button onClick={() => setShowResultDialog(false)}>OK</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QrCode, IndianRupee, ScanLine } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

function TopUpOnlineUser() {
  const [scannedData, setScannedData] = useState(null);
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const qrRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const paymentMethods = [
    { label: "Cash", icon: "💵" },
    { label: "GPay", icon: "📱" },
    { label: "Mess Bill", icon: "🛍" },
  ];

  const transactions = [
    {
      name: "John Doe",
      date: "15/6/2025 01:29 pm",
      method: "GPay",
      amount: "+₹500",
      balance: "₹2000",
      editable: true,
    },
  ];

  // 📷 QR Code Scanner Setup
  const startScanner = async () => {
    setCameraError("");
    try {
      if (html5QrCodeRef.current) await stopScanner();

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 300, height: 300 } },
        handleScanSuccess,
        (err) => console.warn("QR scan error:", err)
      );
    } catch (err) {
      console.error("Camera start failed:", err);
      setCameraError("Failed to access camera. Please check permissions.");
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error("Scanner stop error:", err);
      } finally {
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      }
    }
  };

  // ✅ QR Code Handler
  const handleScanSuccess = (decodedText) => {
    console.log("Scanned Text:", decodedText);
    try {
      let data;

      // Try JSON first
      try {
        data = JSON.parse(decodedText);
      } catch {
        // Fallback to key=value format
        const regex = /name[:=]\s*(.+?),\s*email[:=]\s*(.+?),\s*balance[:=]\s*(\d+)/i;
        const match = decodedText.match(regex);
        if (match) {
          data = {
            name: match[1].trim(),
            email: match[2].trim(),
            balance: parseFloat(match[3]),
          };
        } else {
          throw new Error("Invalid format");
        }
      }

      if (!data.name || !data.email || isNaN(data.balance)) {
        alert("Invalid QR Code data");
        return;
      }

      setScannedData(data);
      setScannerOpen(false);
      stopScanner();
    } catch (error) {
      console.error("QR Parse Error:", error);
      alert("Invalid QR Code format");
    }
  };

  useEffect(() => {
    if (scannerOpen) {
      const timeout = setTimeout(() => startScanner(), 300);
      return () => {
        clearTimeout(timeout);
        stopScanner();
      };
    }
  }, [scannerOpen]);

  const handleKeyClick = (key) => {
    if (key === "C") {
      setAmount("");
    } else {
      setAmount((prev) => prev + key);
    }
  };

  const handleTopUp = () => {
    if (!scannedData || !amount || !selectedMethod) return;
    const newBalance = scannedData.balance + parseFloat(amount);
    alert(`Top-up successful!\nNew Balance: ₹${newBalance}`);
    setAmount("");
    setSelectedMethod(null);
    setScannedData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-10 px-4">
      <Card className="w-full max-w-xl shadow-xl rounded-2xl">
        <CardHeader className="bg-[#070149] text-white p-4 rounded-t-2xl">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-green-400" />
            Top Up - Online User
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* SCANNER */}
          <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full h-12">
                <QrCode className="w-5 h-5 mr-2 text-blue-600" />
                Scan QR Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Scan QR Code</DialogTitle>
              </DialogHeader>
              <div className="relative w-full h-64 bg-gray-100 border border-dashed border-[#070149] rounded-lg overflow-hidden">
                {!html5QrCodeRef.current && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ScanLine className="w-16 h-16 text-[#070149]" />
                  </div>
                )}
                <div id="qr-reader" ref={qrRef} className="w-full h-full" />
              </div>
              {cameraError && (
                <p className="text-red-500 text-sm mt-2">{cameraError}</p>
              )}
              <Button
                onClick={() => setScannerOpen(false)}
                className="mt-4 bg-[#070149] text-white hover:opacity-90"
              >
                Close
              </Button>
            </DialogContent>
          </Dialog>

          {/* DISPLAY SCANNED USER */}
          {scannedData && (
            <div className="bg-gray-100 p-3 rounded-md text-sm space-y-1">
              <p><strong>Name:</strong> {scannedData.name}</p>
              <p><strong>Email:</strong> {scannedData.email}</p>
              <p><strong>Current Balance:</strong> ₹{scannedData.balance}</p>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium mb-1">Enter Amount</label>
            <Input
              value={amount}
              readOnly
              className="text-xl font-bold text-center h-12"
            />
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "C"].map((key) => (
              <Button
                key={key}
                onClick={() => handleKeyClick(key)}
                variant="secondary"
                className="h-12 text-lg"
              >
                {key}
              </Button>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-3 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.label}
                onClick={() => setSelectedMethod(method.label.toLowerCase())}
                className={`h-12 border rounded-md transition-all ${
                  selectedMethod === method.label.toLowerCase()
                    ? "border-[#070149] text-[#070149] font-semibold"
                    : "border-gray-300 text-gray-600"
                }`}
              >
                <span className="mr-1">{method.icon}</span>
                {method.label}
              </button>
            ))}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium mb-1">Remarks (optional)</label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="h-24"
              placeholder="Enter any remarks..."
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end px-6 pb-6">
          <Button
            disabled={!scannedData || !amount || !selectedMethod}
            onClick={handleTopUp}
            className="bg-[#070149] text-white h-12 w-full hover:opacity-90"
          >
            <IndianRupee className="w-5 h-5 mr-2" />
            Top Up
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default TopUpOnlineUser;
s
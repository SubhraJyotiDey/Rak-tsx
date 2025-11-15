import { useEffect, useRef } from "react";
import QRious from "qrious";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { BloodRequest } from "@/types/bloodRequest";
import { getQRDataPayload } from "@/utils/bloodRequest";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: BloodRequest | null;
}

export const QRModal = ({ isOpen, onClose, request }: QRModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && request && canvasRef.current) {
      const qrData = getQRDataPayload(request);
      new QRious({
        element: canvasRef.current,
        value: qrData,
        size: 256,
        foreground: "#8B0000",
        level: "H",
      });
    }
  }, [isOpen, request]);

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">
            QR Code — {request.rtid}
          </DialogTitle>
          <DialogDescription>
            Scan this code to view request details
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <canvas ref={canvasRef} className="border-4 border-primary rounded" />
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Patient: <span className="font-semibold">{request.patientName}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Blood Group: <span className="font-semibold">{request.bloodGroup}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Units: <span className="font-semibold">{request.unitsRequired}</span>
            </p>
          </div>
        </div>
        <Button onClick={onClose} className="w-full">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

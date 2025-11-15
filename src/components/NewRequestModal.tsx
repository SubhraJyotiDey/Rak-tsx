import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { BloodGroup } from "@/types/bloodRequest";

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    patientName: string;
    bloodGroup: BloodGroup;
    unitsRequired: number;
    requiredByDate: string;
    requiredByTime: string;
  }) => void;
}

export const NewRequestModal = ({
  isOpen,
  onClose,
  onSubmit,
}: NewRequestModalProps) => {
  const [patientName, setPatientName] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | "">("");
  const [unitsRequired, setUnitsRequired] = useState("");
  const [requiredByDate, setRequiredByDate] = useState("");
  const [requiredByTime, setRequiredByTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodGroup) return;

    onSubmit({
      patientName,
      bloodGroup,
      unitsRequired: parseInt(unitsRequired),
      requiredByDate,
      requiredByTime,
    });

    // Reset form
    setPatientName("");
    setBloodGroup("");
    setUnitsRequired("");
    setRequiredByDate("");
    setRequiredByTime("");
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">
            🩸 New Patient Blood Request — RTID
          </DialogTitle>
          <DialogDescription>
            Generate a unique, non-transferable RTID for immediate donation
            needs.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientName">Patient Name</Label>
            <Input
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodGroup">Blood Group</Label>
            <Select
              value={bloodGroup}
              onValueChange={(value) => setBloodGroup(value as BloodGroup)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitsRequired">Units Required</Label>
            <Input
              id="unitsRequired"
              type="number"
              min="1"
              value={unitsRequired}
              onChange={(e) => setUnitsRequired(e.target.value)}
              placeholder="Enter units"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requiredByDate">Required By (Date)</Label>
              <Input
                id="requiredByDate"
                type="date"
                min={today}
                value={requiredByDate}
                onChange={(e) => setRequiredByDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requiredByTime">Time</Label>
              <Input
                id="requiredByTime"
                type="time"
                value={requiredByTime}
                onChange={(e) => setRequiredByTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Generate RTID
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

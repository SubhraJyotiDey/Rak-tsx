import { useState, useMemo, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import QRious from "qrious";
import { Bell, LogOut, Plus, RotateCcw, QrCode, Copy, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

// ============= TYPES =============

type BloodGroup = "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
type RequestStatus = "PENDING" | "DONATED" | "REDEEMED" | "EXPIRED";

interface BloodRequest {
  rtid: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  requiredBy: Date;
  status: RequestStatus;
  city: string;
  createdAt: Date;
}

interface Notification {
  id: string;
  message: string;
  time: string;
  type: "new" | "update" | "alert";
}

// ============= MOCK DATA =============

const HOSPITAL_NAME = "AIIMS Delhi";

const initialRequests: BloodRequest[] = [
  {
    rtid: "RTID 1113 001A",
    patientName: "Raj Kumar",
    bloodGroup: "A+",
    unitsRequired: 2,
    requiredBy: new Date("2025-11-20T10:00:00"),
    status: "PENDING",
    city: "Delhi",
    createdAt: new Date("2025-11-13T08:30:00"),
  },
  {
    rtid: "RTID 1110 002B",
    patientName: "Priya Sharma",
    bloodGroup: "O+",
    unitsRequired: 1,
    requiredBy: new Date("2025-11-15T14:00:00"),
    status: "DONATED",
    city: "Delhi",
    createdAt: new Date("2025-11-10T09:15:00"),
  },
  {
    rtid: "RTID 1105 003C",
    patientName: "Amit Patel",
    bloodGroup: "B+",
    unitsRequired: 3,
    requiredBy: new Date("2025-11-05T16:00:00"),
    status: "REDEEMED",
    city: "Delhi",
    createdAt: new Date("2025-11-05T07:45:00"),
  },
  {
    rtid: "RTID 1101 004D",
    patientName: "Sneha Reddy",
    bloodGroup: "AB+",
    unitsRequired: 1,
    requiredBy: new Date("2025-11-01T12:00:00"),
    status: "EXPIRED",
    city: "Delhi",
    createdAt: new Date("2025-11-01T06:00:00"),
  },
  {
    rtid: "RTID 1210 005E",
    patientName: "Vikram Singh",
    bloodGroup: "A+",
    unitsRequired: 2,
    requiredBy: new Date("2025-12-10T11:00:00"),
    status: "PENDING",
    city: "Delhi",
    createdAt: new Date("2025-11-10T10:20:00"),
  },
];

const initialNotifications: Notification[] = [
  {
    id: "1",
    message: "New blood request created for A+ (2 units)",
    time: "2 hours ago",
    type: "new",
  },
  {
    id: "2",
    message: "Blood donation received for RTID 1110 002B",
    time: "5 hours ago",
    type: "update",
  },
  {
    id: "3",
    message: "Request RTID 1105 003C marked as REDEEMED",
    time: "1 day ago",
    type: "update",
  },
];

// ============= UTILITIES =============

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const generateRTID = (date: string): string => {
  const dateSegment = date.substring(5, 7) + date.substring(8, 10);
  const uniquePart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  const suffix = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `RTID ${dateSegment} ${uniquePart}${suffix}`;
};

const getQRDataPayload = (request: BloodRequest): string => {
  const dateStr = request.requiredBy
    .toISOString()
    .replace(/[-:]/g, "")
    .substring(0, 13);
  return `${request.rtid}|${request.bloodGroup}|${request.unitsRequired}|${request.city}|${dateStr}`;
};

const getStatusClasses = (status: RequestStatus): string => {
  switch (status) {
    case "PENDING":
      return "status-pending";
    case "DONATED":
      return "status-donated";
    case "REDEEMED":
      return "status-redeemed";
    case "EXPIRED":
      return "status-expired";
    default:
      return "";
  }
};

const getStatusIcon = (status: RequestStatus): string => {
  switch (status) {
    case "PENDING":
      return "🔴";
    case "DONATED":
      return "🔵";
    case "REDEEMED":
      return "🟢";
    case "EXPIRED":
      return "⚪";
    default:
      return "";
  }
};

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
};

// ============= COMPONENTS =============

// Header Component
interface HeaderProps {
  hospitalName: string;
  notificationCount: number;
  onNotificationClick: () => void;
  onLogout: () => void;
}

const Header = ({
  hospitalName,
  notificationCount,
  onNotificationClick,
  onLogout,
}: HeaderProps) => {
  return (
    <header className="bg-primary text-primary-foreground py-4 shadow-raktsetu relative z-50">
      <div className="container mx-auto px-4 flex justify-between items-center max-w-7xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-xl text-primary">
            RS
          </div>
          <div>
            <div className="text-xl font-bold">RaktSetu Hospital Panel</div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onNotificationClick}
            className="relative p-2 hover:bg-white/10 rounded-full transition"
          >
            <Bell className="w-6 h-6" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-warn text-xs">
                {notificationCount}
              </Badge>
            )}
          </button>
          <Button
            onClick={onLogout}
            variant="secondary"
            size="sm"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

// KPI Card Component
interface KPICardProps {
  label: string;
  value: number;
  icon?: string;
}

const KPICard = ({ label, value, icon }: KPICardProps) => {
  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold text-primary">{value}</p>
          </div>
          {icon && <span className="text-4xl">{icon}</span>}
        </div>
      </CardContent>
    </Card>
  );
};

// New Request Modal Component
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

const NewRequestModal = ({
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

// QR Modal Component
interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: BloodRequest | null;
}

const QRModal = ({ isOpen, onClose, request }: QRModalProps) => {
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

// Notification Drawer Component
interface NotificationDrawerProps {
  isOpen: boolean;
  notifications: Notification[];
  onClose: () => void;
}

const NotificationDrawer = ({
  isOpen,
  notifications,
  onClose,
}: NotificationDrawerProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      <Card className="fixed top-[68px] right-4 w-80 max-h-[80vh] overflow-y-auto z-50 transition-all duration-300 ease-out">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">Notifications</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="divide-y">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="p-4 hover:bg-muted/50 cursor-pointer">
                <p className="text-sm mb-1">{notif.message}</p>
                <p className="text-xs text-muted-foreground">{notif.time}</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </>
  );
};

// Requests Table Component
interface RequestsTableProps {
  requests: BloodRequest[];
  onViewQR: (request: BloodRequest) => void;
  onCopyRTID: (rtid: string) => void;
  onDelete: (rtid: string) => void;
}

const RequestsTable = ({
  requests,
  onViewQR,
  onCopyRTID,
  onDelete,
}: RequestsTableProps) => {
  const [filterBG, setFilterBG] = useState<string>("All");
  const [filterDate, setFilterDate] = useState<string>("All");

  const filteredRequests = requests.filter((req) => {
    const bgMatch = filterBG === "All" || req.bloodGroup === filterBG;
    const dateMatch =
      filterDate === "All" ||
      formatDate(req.requiredBy) === formatDate(new Date(filterDate));
    return bgMatch && dateMatch;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">
          Active Requests 📋
        </h2>
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">🩸 Group</span>
            <Select value={filterBG} onValueChange={setFilterBG}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
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
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">📅 Date</span>
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RTID (ID / PATIENT)</TableHead>
              <TableHead>GROUP</TableHead>
              <TableHead>UNITS</TableHead>
              <TableHead>REQUIRED BY</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead>ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.rtid}>
                <TableCell>
                  <div>
                    <div className="font-mono text-xs font-semibold">
                      🆔 {request.rtid}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {request.patientName}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-semibold">
                    {request.bloodGroup}
                  </Badge>
                </TableCell>
                <TableCell>{request.unitsRequired} units</TableCell>
                <TableCell>{formatDate(request.requiredBy)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`border ${getStatusClasses(request.status)}`}
                  >
                    {getStatusIcon(request.status)} {request.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewQR(request)}
                      title="View QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCopyRTID(request.rtid)}
                      title="Copy RTID"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(request.rtid)}
                      className="text-destructive hover:text-destructive"
                      title="Delete Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// ============= MAIN COMPONENT =============

const HospitalDashboard = () => {
  const [requests, setRequests] = useState<BloodRequest[]>(initialRequests);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] =
    useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(
    null
  );
  const { toast } = useToast();

  const kpis = useMemo(() => {
    const now = new Date();
    const updatedRequests = requests.map((req) => {
      if (req.requiredBy < now && req.status === "PENDING") {
        return { ...req, status: "EXPIRED" as const };
      }
      return req;
    });

    return {
      totalRequests: updatedRequests.length,
      activeRequests: updatedRequests.filter(
        (r) => r.status === "PENDING" || r.status === "DONATED"
      ).length,
      totalUnits: updatedRequests.reduce((sum, r) => sum + r.unitsRequired, 0),
      donationsReceived: updatedRequests.filter((r) => r.status === "DONATED")
        .length,
      requestsRedeemed: updatedRequests.filter((r) => r.status === "REDEEMED")
        .length,
    };
  }, [requests]);

  const handleNewRequest = (data: {
    patientName: string;
    bloodGroup: BloodGroup;
    unitsRequired: number;
    requiredByDate: string;
    requiredByTime: string;
  }) => {
    const newRTID = generateRTID(data.requiredByDate);
    const requiredByDateTime = new Date(
      `${data.requiredByDate}T${data.requiredByTime}:00`
    );

    const newRequest: BloodRequest = {
      rtid: newRTID,
      patientName: data.patientName,
      bloodGroup: data.bloodGroup,
      unitsRequired: data.unitsRequired,
      requiredBy: requiredByDateTime,
      status: "PENDING",
      city: "Delhi",
      createdAt: new Date(),
    };

    setRequests([newRequest, ...requests]);
    setIsRequestModalOpen(false);

    toast({
      title: "Request Created",
      description: `RTID ${newRTID} has been generated successfully.`,
    });
  };

  const handleViewQR = (request: BloodRequest) => {
    setSelectedRequest(request);
    setIsQRModalOpen(true);
  };

  const handleCopyRTID = async (rtid: string) => {
    const success = await copyToClipboard(rtid);
    if (success) {
      toast({
        title: "Copied!",
        description: `${rtid} copied to clipboard`,
      });
    }
  };

  const handleDelete = (rtid: string) => {
    Swal.fire({
      title: "Delete Request?",
      text: `Are you sure you want to delete ${rtid}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8B0000",
      cancelButtonColor: "#777777",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setRequests(requests.filter((r) => r.rtid !== rtid));
        Swal.fire({
          title: "Deleted!",
          text: `${rtid} has been removed.`,
          icon: "success",
          confirmButtonColor: "#8B0000",
        });
      }
    });
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout Confirmation",
      text: "Are you sure you want to log out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#8B0000",
      cancelButtonColor: "#777777",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Logged Out",
          text: "You have been successfully logged out.",
          icon: "success",
          confirmButtonColor: "#8B0000",
        });
      }
    });
  };

  const handleResetData = () => {
    Swal.fire({
      title: "Reset Mock Data?",
      text: "This will restore the original mock data.",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#8B0000",
      cancelButtonColor: "#777777",
      confirmButtonText: "Yes, reset",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setRequests(initialRequests);
        Swal.fire({
          title: "Data Reset",
          text: "Mock data has been restored.",
          icon: "success",
          confirmButtonColor: "#8B0000",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        hospitalName={HOSPITAL_NAME}
        notificationCount={notifications.length}
        onNotificationClick={() =>
          setIsNotificationDrawerOpen(!isNotificationDrawerOpen)
        }
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-primary">
            Welcome, {HOSPITAL_NAME} (Verified) 🏥
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard label="Total Requests" value={kpis.totalRequests} />
          <KPICard label="Active Requests" value={kpis.activeRequests} />
          <KPICard label="Total Units Required" value={kpis.totalUnits} />
          <KPICard label="Donations Received" value={kpis.donationsReceived} />
          <KPICard label="Requests Redeemed" value={kpis.requestsRedeemed} />
        </div>

        <div className="bg-card p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-primary mb-1">
                🩸 New Patient Blood Request — RTID
              </h2>
              <p className="text-sm text-muted-foreground">
                Generate a unique, non-transferable RTID for immediate donation
                needs.
              </p>
            </div>
            <Button
              onClick={() => setIsRequestModalOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Request
            </Button>
          </div>
        </div>

        <RequestsTable
          requests={requests}
          onViewQR={handleViewQR}
          onCopyRTID={handleCopyRTID}
          onDelete={handleDelete}
        />

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleResetData}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Mock Data
          </Button>
        </div>
      </main>

      <NewRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={handleNewRequest}
      />

      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        request={selectedRequest}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        notifications={notifications}
        onClose={() => setIsNotificationDrawerOpen(false)}
      />
    </div>
  );
};

export default HospitalDashboard;

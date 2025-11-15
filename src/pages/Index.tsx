import { useState, useMemo } from "react";
import Swal from "sweetalert2";
import { Header } from "@/components/Header";
import { KPICard } from "@/components/KPICard";
import { NewRequestModal } from "@/components/NewRequestModal";
import { QRModal } from "@/components/QRModal";
import { NotificationDrawer } from "@/components/NotificationDrawer";
import { RequestsTable } from "@/components/RequestsTable";
import { Button } from "@/components/ui/button";
import { Plus, RotateCcw } from "lucide-react";
import { BloodRequest, BloodGroup } from "@/types/bloodRequest";
import { generateRTID, copyToClipboard } from "@/utils/bloodRequest";
import {
  HOSPITAL_NAME,
  initialRequests,
  initialNotifications,
} from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
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

  // Calculate KPIs
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
        {/* Hospital Welcome */}
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-primary">
            Welcome, {HOSPITAL_NAME} (Verified) 🏥
          </h1>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard label="Total Requests" value={kpis.totalRequests} />
          <KPICard label="Active Requests" value={kpis.activeRequests} />
          <KPICard label="Total Units Required" value={kpis.totalUnits} />
          <KPICard label="Donations Received" value={kpis.donationsReceived} />
          <KPICard label="Requests Redeemed" value={kpis.requestsRedeemed} />
        </div>

        {/* New Request Button */}
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

        {/* Requests Table */}
        <RequestsTable
          requests={requests}
          onViewQR={handleViewQR}
          onCopyRTID={handleCopyRTID}
          onDelete={handleDelete}
        />

        {/* Reset Button */}
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

      {/* Modals and Drawers */}
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

export default Index;

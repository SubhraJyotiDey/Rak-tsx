import { BloodRequest, RequestStatus } from "@/types/bloodRequest";

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const generateRTID = (date: string): string => {
  const dateSegment = date.substring(5, 7) + date.substring(8, 10); // MM DD
  const uniquePart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  const suffix = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Random A-Z
  return `RTID ${dateSegment} ${uniquePart}${suffix}`;
};

export const getQRDataPayload = (request: BloodRequest): string => {
  // Format: RTID|BG|Units|City|RequiredBy(YYYYMMDD_HHMM)
  const dateStr = request.requiredBy
    .toISOString()
    .replace(/[-:]/g, "")
    .substring(0, 13);
  return `${request.rtid}|${request.bloodGroup}|${request.unitsRequired}|${request.city}|${dateStr}`;
};

export const getStatusClasses = (status: RequestStatus): string => {
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

export const getStatusIcon = (status: RequestStatus): string => {
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

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
};

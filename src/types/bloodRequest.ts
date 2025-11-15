export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";

export type RequestStatus = "PENDING" | "DONATED" | "REDEEMED" | "EXPIRED";

export interface BloodRequest {
  rtid: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  requiredBy: Date;
  status: RequestStatus;
  city: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  message: string;
  time: string;
  type: "new" | "update" | "alert";
}

export interface KPIData {
  totalRequests: number;
  activeRequests: number;
  totalUnits: number;
  donationsReceived: number;
  requestsRedeemed: number;
}

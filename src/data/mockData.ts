import { BloodRequest, Notification } from "@/types/bloodRequest";

export const HOSPITAL_NAME = "AIIMS Delhi";

export const initialRequests: BloodRequest[] = [
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

export const initialNotifications: Notification[] = [
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

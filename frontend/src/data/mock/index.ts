import type { Booking, ParkingActivity, ParkingSlot, User } from "@/types";

export const mockUser: User = {
  id: "user-001",
  name: "Aarav Mehta",
  email: "aarav@example.com",
  vehicleNumber: "MH 12 AB 4582",
  role: "user",
};

export const mockParkingSlots: ParkingSlot[] = [
  { id: "slot-p1", label: "P1", status: "available" },
  { id: "slot-p2", label: "P2", status: "occupied" },
  { id: "slot-p3", label: "P3", status: "reserved" },
  { id: "slot-p4", label: "P4", status: "available" },
  { id: "slot-p5", label: "P5", status: "available" },
  { id: "slot-p6", label: "P6", status: "occupied" },
];

export const mockBookings: Booking[] = [
  {
    id: "SP-1042",
    userId: "user-001",
    slotId: "slot-p3",
    vehicleNumber: "MH 12 AB 4582",
    startsAt: "2026-08-17T10:00:00+05:30",
    endsAt: "2026-08-17T12:00:00+05:30",
    status: "reserved",
  },
  {
    id: "BK-2026-0986",
    userId: "user-001",
    slotId: "slot-p4",
    vehicleNumber: "MH 12 AB 4582",
    startsAt: "2026-08-12T14:00:00+05:30",
    endsAt: "2026-08-12T16:00:00+05:30",
    status: "completed",
  },
  {
    id: "SP-0971",
    userId: "user-001",
    slotId: "slot-p1",
    vehicleNumber: "MH 12 AB 4582",
    startsAt: "2026-08-09T09:30:00+05:30",
    endsAt: "2026-08-09T10:30:00+05:30",
    status: "completed",
  },
  {
    id: "SP-0938",
    userId: "user-001",
    slotId: "slot-p4",
    vehicleNumber: "MH 12 AB 4582",
    startsAt: "2026-08-04T14:00:00+05:30",
    endsAt: "2026-08-04T15:00:00+05:30",
    status: "cancelled",
  },
];

export const mockParkingActivity: ParkingActivity[] = [
  {
    id: "activity-001",
    title: "Reservation confirmed",
    description: "Slot P3 reserved for vehicle MH 12 AB 4582.",
    occurredAt: "2026-08-16T18:45:00+05:30",
    status: "reserved",
  },
  {
    id: "activity-002",
    title: "Vehicle exited",
    description: "Completed parking session at slot P4.",
    occurredAt: "2026-08-12T15:52:00+05:30",
    status: "completed",
  },
  {
    id: "activity-003",
    title: "Sensor requires attention",
    description: "Slot P8 sensor is scheduled for maintenance.",
    occurredAt: "2026-08-11T10:15:00+05:30",
    status: "maintenance",
  },
];

export type ParkingSlotStatus =
  | "available"
  | "occupied"
  | "reserved"
  | "maintenance";

export type SmartParkStatus =
  | ParkingSlotStatus
  | "online"
  | "offline"
  | "completed"
  | "cancelled"
  | "expired"
  | "warning";

export interface ParkingSlot {
  id: string;
  label: string;
  status: ParkingSlotStatus;
}

export interface User {
  id: string;
  name: string;
  email: string;
  vehicleNumber?: string;
  role: "user" | "admin";
}

export interface Booking {
  id: string;
  userId: string;
  slotId: string;
  vehicleNumber: string;
  startsAt: string;
  endsAt: string;
  status: "reserved" | "completed" | "cancelled" | "expired";
}

export interface ParkingActivity {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
  status: SmartParkStatus;
}

export interface NavigationItem {
  label: string;
  href: string;
  active?: boolean;
}

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

export type LateReservationStatus =
  | "grace-period"
  | "extension-requested"
  | "extended"
  | "expired"
  | "released";

export interface LateReservation {
  id: string;
  userName: string;
  slotId: string;
  expectedAt: string;
  graceUntil: string;
  status: LateReservationStatus;
  requestedExtensionMinutes?: 5 | 10 | 15;
}

export interface AdminActivity {
  id: string;
  occurredAt: string;
  description: string;
}

export type ApiSlotStatus = "AVAILABLE" | "RESERVED" | "OCCUPIED";
export type ApiReservationStatus = "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";
export interface UserProfile { uid: string; name: string; email: string; vehicleNumber?: string; role: "user" | "admin"; createdAt: string; updatedAt: string }
export interface ApiParkingSlot { id: string; slotNumber: number; name: string; status: ApiSlotStatus; isActive: boolean; currentReservationId: string | null; createdAt: string; updatedAt: string }
export interface ApiReservation { id: string; userId: string; userName: string; userEmail: string; vehicleNumber: string; slotId: string; slotNumber: number; bookingDate: string; startTime: string; durationMinutes: number; status: ApiReservationStatus; qrToken: string; createdAt: string; updatedAt: string }
export interface ApiActivityLog { id: string; type: string; userId: string | null; reservationId: string | null; slotId: string | null; message: string; createdAt: string }
export interface QRVerificationResult { valid: boolean; reservationId?: string; slotId?: string; slotNumber?: number; status?: ApiReservationStatus; reason?: string }
export interface QRParkingAuthorization extends QRVerificationResult { command: { commandId: string; type: "PARK"; slotId: string; reservationId: string; status: "PENDING" | "ACKNOWLEDGED" | "COMPLETED"; expiresAt: string }; reused: boolean }
export interface AdminDashboardData { slots: ApiParkingSlot[]; reservations: Array<Omit<ApiReservation, "qrToken">>; activity: ApiActivityLog[]; summary: { total: number; available: number; reserved: number; occupied: number; activeReservations: number; cancelledReservations: number; expiredReservations: number } }

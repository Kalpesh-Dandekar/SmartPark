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
  | "parked"
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
export type ApiReservationStatus = "BOOKED" | "PARKED" | "COMPLETED" | "CANCELLED" | "EXPIRED" | "ACTIVE";
export interface UserProfile { uid: string; name: string; email: string; vehicleNumber?: string; role: "user" | "admin"; createdAt: string; updatedAt: string }
export interface ApiParkingSlot { id: string; slotNumber: number; name: string; status: ApiSlotStatus; isActive: boolean; currentReservationId: string | null; createdAt: string; updatedAt: string }
export interface ApiReservation { id: string; userId: string; userName: string; userEmail: string; vehicleNumber: string; bookingDate: string; startTime: string; durationMinutes: number; startAt: string; endAt: string; status: ApiReservationStatus; qrToken: string; bookedAt: string; parkedAt?: string; completedAt?: string; cancelledAt?: string; expiredAt?: string; createdAt: string; updatedAt: string; /** Legacy admin compatibility only; omitted by current user APIs. */ slotId: string; /** Legacy admin compatibility only; omitted by current user APIs. */ slotNumber: number }
export interface ParkingAvailability { totalCapacity: number; reserved: number; occupied: number; available: number; requestedStart: string; requestedEnd: string }
export interface ApiActivityLog { id: string; type: string; userId: string | null; reservationId: string | null; slotId: string | null; message: string; createdAt: string }
export interface QRVerificationResult { valid: boolean; reservationId?: string; slotId?: string; slotNumber?: number; status?: ApiReservationStatus; reason?: string }
export interface QRParkingAuthorization extends QRVerificationResult { command: { commandId: string; type: "PARK"; slotId: string; reservationId: string; status: "PENDING" | "ACKNOWLEDGED" | "COMPLETED"; expiresAt: string }; reused: boolean }
export interface AdminDashboardData { slots: ApiParkingSlot[]; reservations: Array<Omit<ApiReservation, "qrToken" | "slotId" | "slotNumber"> & { slotId: string; slotNumber: number }>; activity: ApiActivityLog[]; summary: { total: number; available: number; reserved: number; occupied: number; activeReservations: number; cancelledReservations: number; expiredReservations: number } }

import type { DecodedIdToken } from "firebase-admin/auth";

export type UserRole = "user" | "admin";
export type SlotStatus = "AVAILABLE" | "RESERVED" | "OCCUPIED";
export type ReservationStatus = "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";

export interface UserProfile { uid: string; name: string; email: string; vehicleNumber?: string; role: UserRole; createdAt: string; updatedAt: string }
export interface ParkingSlot { id: string; slotNumber: number; name: string; status: SlotStatus; isActive: boolean; currentReservationId: string | null; createdAt: string; updatedAt: string }
export interface Reservation { id: string; userId: string; userName: string; userEmail: string; vehicleNumber: string; slotId: string; slotNumber: number; bookingDate: string; startTime: string; durationMinutes: number; status: ReservationStatus; qrToken: string; createdAt: string; updatedAt: string }
export interface ActivityLog { id: string; type: string; userId: string | null; reservationId: string | null; slotId: string | null; message: string; createdAt: string }
export interface QRVerificationResult { valid: boolean; reservationId?: string; slotId?: string; slotNumber?: number; status?: ReservationStatus; reason?: "INVALID_TOKEN" | "CANCELLED" | "EXPIRED" | "INVALID_TIME" | "SLOT_MISMATCH" }

declare global {
  // Express requires namespace declaration merging for authenticated request context.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request { auth?: DecodedIdToken; profile?: UserProfile }
  }
}

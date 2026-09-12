import type { DecodedIdToken } from "firebase-admin/auth";

export type UserRole = "user" | "admin";
export type SlotStatus = "AVAILABLE" | "RESERVED" | "OCCUPIED";
export type ReservationStatus = "BOOKED" | "PARKED" | "COMPLETED" | "CANCELLED" | "EXPIRED";
export type StoredReservationStatus = ReservationStatus | "ACTIVE";
export type ArrivalState = "AWAITING_HARDWARE" | "PARKING_DETECTED" | "CONFIRMED";

export interface UserProfile { uid: string; name: string; email: string; vehicleNumber?: string; role: UserRole; createdAt: string; updatedAt: string }
export interface ParkingSlot { id: string; slotNumber: number; name: string; status: SlotStatus; isActive: boolean; currentReservationId: string | null; createdAt: string; updatedAt: string }
export interface Reservation { id: string; userId: string; userName: string; userEmail: string; vehicleNumber: string; bookingDate: string; startTime: string; durationMinutes: number; startAt: string; endAt: string; status: ReservationStatus; qrToken: string; bookedAt: string; arrivalFlowVersion?: number; arrivalState?: ArrivalState; arrivalVerifiedAt?: string; arrivalVerifiedBy?: string; parkingDetectedAt?: string; parkingTelemetryEventId?: string; parkedAt?: string; completedAt?: string; cancelledAt?: string; expiredAt?: string; createdAt: string; updatedAt: string; slotId?: string; slotNumber?: number }
export interface ActivityLog { id: string; type: string; userId: string | null; reservationId: string | null; slotId: string | null; message: string; createdAt: string }
export interface QRVerificationResult { valid: boolean; reservationId?: string; status?: ReservationStatus; reason?: "INVALID_TOKEN" | "CANCELLED" | "EXPIRED" | "COMPLETED" | "INVALID_TIME" }
export type DeviceCommandStatus = "PENDING" | "ACKNOWLEDGED" | "COMPLETED" | "FAILED" | "EXPIRED";
export type DeviceEventType = "COMMAND_ACKNOWLEDGED" | "GATE_OPENED" | "GATE_FAILED" | "PARKING_CONFIRMED" | "SLOT_VACATED";
export type TelemetryEventType = "PARKING_DETECTED" | "SYSTEM_READY";
export interface DeviceCommand { id: string; deviceId: string; type: "PARK"; reservationId: string; slotId: string; status: DeviceCommandStatus; createdAt: string; expiresAt: string; acknowledgedAt?: string; completedAt?: string; failureReason?: string }
export interface DeviceEventInput { eventId: string; type: DeviceEventType; commandId: string; slotId: string; failureReason?: string }
export interface TelemetryEventInput { eventId: string; type: TelemetryEventType }

declare global {
  // Express requires namespace declaration merging for authenticated request context.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request { auth?: DecodedIdToken; profile?: UserProfile; deviceId?: string }
  }
}

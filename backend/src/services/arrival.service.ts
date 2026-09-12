import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase.js";
import type { StoredReservationStatus } from "../types/index.js";
import { HttpError } from "../utils/http-error.js";
import { isBookedForArrival } from "../utils/arrival-state.js";
import { getArrivalVerificationWindow } from "../utils/reservation-time.js";

interface StoredArrivalReservation {
  status: StoredReservationStatus;
  userId: string;
  bookingDate: string;
  startTime: string;
  durationMinutes: number;
  startAt?: FirebaseFirestore.Timestamp;
  endAt?: FirebaseFirestore.Timestamp;
  arrivalState?: string;
}

interface ActiveArrival {
  reservationId: string;
  state: "AWAITING_HARDWARE";
  expiresAt?: FirebaseFirestore.Timestamp;
}

const reservations = db.collection("reservations");
const activeArrival = db.collection("system").doc("activeArrival");

function isStale(active: ActiveArrival, now: Date) {
  return !active.expiresAt || !(active.expiresAt.toMillis instanceof Function) || active.expiresAt.toMillis() <= now.getTime();
}

export async function verifyArrival(reservationId: string, adminUid: string, suppliedNow?: Date) {
  const now = suppliedNow ?? new Date();
  const reservationRef = reservations.doc(reservationId);
  let idempotent = false;

  await db.runTransaction(async (transaction) => {
    const [reservationSnap, activeSnap] = await Promise.all([
      transaction.get(reservationRef),
      transaction.get(activeArrival),
    ]);
    if (!reservationSnap.exists) throw new HttpError(404, "Reservation not found", "RESERVATION_NOT_FOUND");

    const reservation = reservationSnap.data() as StoredArrivalReservation;
    if (!isBookedForArrival(reservation.status)) throw new HttpError(409, "Only booked reservations can be verified for arrival", "INVALID_STATUS");
    const window = getArrivalVerificationWindow(reservation);
    const withinWindow = now >= window.earliest && now <= window.latest;
    if (!withinWindow) {
      throw new HttpError(409, "Arrival verification is outside the booking window", "INVALID_TIME");
    }

    const active = activeSnap.exists ? activeSnap.data() as ActiveArrival : null;
    if (active?.reservationId === reservationId && !isStale(active, now) && reservation.arrivalState === "AWAITING_HARDWARE") {
      idempotent = true;
      return;
    }

    if (active && active.reservationId !== reservationId && !isStale(active, now)) {
      const ownerSnap = await transaction.get(reservations.doc(active.reservationId));
      const owner = ownerSnap.exists ? ownerSnap.data() as StoredArrivalReservation : null;
      if (owner && isBookedForArrival(owner.status) && owner.arrivalState === "AWAITING_HARDWARE") {
        throw new HttpError(409, "Another reservation is already awaiting the parking hardware", "ARRIVAL_IN_PROGRESS");
      }
    }

    const expiresAt = window.latest;
    transaction.set(activeArrival, {
      reservationId,
      verifiedBy: adminUid,
      verifiedAt: FieldValue.serverTimestamp(),
      state: "AWAITING_HARDWARE",
      expiresAt: Timestamp.fromDate(expiresAt),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.update(reservationRef, {
      arrivalFlowVersion: 1,
      arrivalState: "AWAITING_HARDWARE",
      arrivalVerifiedAt: FieldValue.serverTimestamp(),
      arrivalVerifiedBy: adminUid,
      updatedAt: FieldValue.serverTimestamp(),
    });
    const activityRef = db.collection("activityLogs").doc();
    transaction.create(activityRef, {
      type: "ARRIVAL_VERIFIED",
      userId: reservation.userId,
      reservationId,
      slotId: null,
      message: `Arrival verified for reservation ${reservationId}`,
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  return { reservationId, arrivalState: "AWAITING_HARDWARE" as const, idempotent };
}

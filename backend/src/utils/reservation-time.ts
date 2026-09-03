import { HttpError } from "./http-error.js";

export const GRACE_PERIOD_MINUTES = 10;

export function reservationStart(bookingDate: string, startTime: string): Date {
  const value = new Date(`${bookingDate}T${startTime}:00+05:30`);
  if (Number.isNaN(value.getTime())) throw new HttpError(400, "Invalid reservation date or time", "INVALID_TIME");
  return value;
}

export function assertFutureReservation(bookingDate: string, startTime: string, now = new Date()) {
  if (reservationStart(bookingDate, startTime) <= now) throw new HttpError(400, "Reservation start time must be in the future", "PAST_RESERVATION");
}

export function isWithinVerificationWindow(bookingDate: string, startTime: string, durationMinutes: number, now = new Date()) {
  const start = reservationStart(bookingDate, startTime);
  const earliest = new Date(start.getTime() - 30 * 60_000);
  const latest = new Date(start.getTime() + (durationMinutes + GRACE_PERIOD_MINUTES) * 60_000);
  return now >= earliest && now <= latest;
}

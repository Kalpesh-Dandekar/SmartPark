import { HttpError } from "./http-error.js";

export const GRACE_PERIOD_MINUTES = 10;
const EARLY_ARRIVAL_MINUTES = 30;

interface ArrivalWindowInput {
  startAt?: unknown;
  endAt?: unknown;
  bookingDate: string;
  startTime: string;
  durationMinutes: number;
}

function firestoreDate(value: unknown) {
  if (!value || typeof value !== "object" || !("toDate" in value) || typeof value.toDate !== "function") return null;
  try {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  } catch {
    return null;
  }
}

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

export function getArrivalVerificationWindow(input: ArrivalWindowInput) {
  const canonicalStart = firestoreDate(input.startAt);
  const canonicalEnd = firestoreDate(input.endAt);
  const useCanonical = canonicalStart && canonicalEnd && canonicalEnd >= canonicalStart;
  const start = useCanonical ? canonicalStart : reservationStart(input.bookingDate, input.startTime);
  const end = useCanonical ? canonicalEnd : new Date(start.getTime() + input.durationMinutes * 60_000);
  return {
    earliest: new Date(start.getTime() - EARLY_ARRIVAL_MINUTES * 60_000),
    latest: new Date(end.getTime() + GRACE_PERIOD_MINUTES * 60_000),
  };
}

export function isWithinArrivalVerificationWindow(input: ArrivalWindowInput, now: Date) {
  const { earliest, latest } = getArrivalVerificationWindow(input);
  return now >= earliest && now <= latest;
}

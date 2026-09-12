import { z } from "zod";

export const telemetrySchema = z.object({
  eventId: z.string().trim().min(8).max(128).regex(/^[A-Za-z0-9_-]+$/),
  type: z.enum(["PARKING_DETECTED", "SYSTEM_READY"]),
}).strict();

export type TelemetryInput = z.infer<typeof telemetrySchema>;

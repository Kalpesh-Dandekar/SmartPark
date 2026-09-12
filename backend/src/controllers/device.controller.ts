import type { Request, Response } from "express";
import { z } from "zod";
import { getNextCommand, processDeviceEvent } from "../services/device.service.js";
import { recordTelemetry } from "../services/telemetry.service.js";
import { telemetrySchema } from "../utils/telemetry.js";

const eventSchema = z.object({
  eventId: z.string().trim().min(8).max(128).regex(/^[A-Za-z0-9_-]+$/),
  type: z.enum(["COMMAND_ACKNOWLEDGED", "GATE_OPENED", "GATE_FAILED", "PARKING_CONFIRMED", "SLOT_VACATED"]),
  commandId: z.string().trim().min(8).max(160),
  slotId: z.enum(["SLOT-1", "SLOT-2", "SLOT-3", "SLOT-4"]),
  failureReason: z.string().trim().min(1).max(120).optional(),
}).strict().superRefine((value, context) => {
  if (value.failureReason && value.type !== "GATE_FAILED") context.addIssue({ code: "custom", path: ["failureReason"], message: "failureReason is only valid for GATE_FAILED" });
});

export async function nextCommand(req: Request, res: Response) {
  const command = await getNextCommand(req.deviceId!);
  if (!command) return res.status(204).send();
  return res.json({ data: command });
}

export async function deviceEvent(req: Request, res: Response) {
  res.json({ data: await processDeviceEvent(req.deviceId!, eventSchema.parse(req.body)) });
}

export async function telemetry(req: Request, res: Response) {
  res.json({ data: await recordTelemetry(req.deviceId!, telemetrySchema.parse(req.body)) });
}

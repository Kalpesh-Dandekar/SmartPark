import { createHash, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/http-error.js";

function safeEqual(value: string, expected: string) {
  const left = createHash("sha256").update(value).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

export function createDeviceAuthMiddleware(expectedId: string, expectedSecret: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const deviceId = req.header("x-device-id") ?? "";
    const deviceSecret = req.header("x-device-secret") ?? "";
    if (!deviceId || !deviceSecret) return next(new HttpError(401, "Device authentication required", "DEVICE_UNAUTHENTICATED"));
    if (!safeEqual(deviceId, expectedId) || !safeEqual(deviceSecret, expectedSecret)) return next(new HttpError(401, "Invalid device credentials", "INVALID_DEVICE_CREDENTIALS"));
    req.deviceId = deviceId;
    next();
  };
}

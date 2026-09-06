import { Router } from "express";
import { env } from "../config/env.js";
import { deviceEvent, nextCommand } from "../controllers/device.controller.js";
import { createDeviceAuthMiddleware } from "../middleware/device-auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

export const deviceRouter = Router();
deviceRouter.use(createDeviceAuthMiddleware(env.IOT_DEVICE_ID, env.IOT_DEVICE_SECRET));
deviceRouter.get("/commands/next", asyncHandler(nextCommand));
deviceRouter.post("/events", asyncHandler(deviceEvent));

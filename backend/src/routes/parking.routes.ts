import { Router } from "express";
import { availability, status } from "../controllers/parking.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
export const parkingRouter=Router();
parkingRouter.get("/availability",asyncHandler(requireAuth),asyncHandler(availability));
parkingRouter.get("/status",asyncHandler(requireAuth),asyncHandler(status));

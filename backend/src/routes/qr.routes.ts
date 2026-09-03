import { Router } from "express";
import { verify } from "../controllers/qr.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
export const qrRouter = Router();
qrRouter.get("/verify/:token", asyncHandler(requireAuth), asyncHandler(verify));

import { Router } from "express";
import { currentProfile, recordLogin, registerProfile } from "../controllers/auth.controller.js";
import { requireAuth, verifyToken } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
export const authRouter = Router();
authRouter.post("/profile", asyncHandler(verifyToken), asyncHandler(registerProfile));
authRouter.get("/me", asyncHandler(requireAuth), asyncHandler(currentProfile));
authRouter.post("/login-event", asyncHandler(requireAuth), asyncHandler(recordLogin));

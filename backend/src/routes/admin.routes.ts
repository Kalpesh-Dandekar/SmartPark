import { Router } from "express";
import { dashboard, expire } from "../controllers/admin.controller.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
export const adminRouter = Router();
adminRouter.use(asyncHandler(requireAuth), requireAdmin);
adminRouter.get("/dashboard", asyncHandler(dashboard));
adminRouter.post("/reservations/:id/expire", asyncHandler(expire));

import { Router } from "express";
import { allSlots, slotById } from "../controllers/slots.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
export const slotsRouter = Router();
slotsRouter.use(asyncHandler(requireAuth));
slotsRouter.get("/", asyncHandler(allSlots));
slotsRouter.get("/:id", asyncHandler(slotById));

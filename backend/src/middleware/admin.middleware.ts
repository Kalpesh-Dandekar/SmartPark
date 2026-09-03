import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/http-error.js";

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.profile?.role !== "admin") return next(new HttpError(403, "Administrator access required", "ADMIN_REQUIRED"));
  next();
}

import type { NextFunction, Request, Response } from "express";
import { auth } from "../config/firebase.js";
import { getUserProfile } from "../services/auth.service.js";
import { HttpError } from "../utils/http-error.js";

export async function verifyToken(req: Request, _res: Response, next: NextFunction) {
  try {
    const [scheme, token] = req.headers.authorization?.split(" ") ?? [];
    if (scheme !== "Bearer" || !token) throw new HttpError(401, "Authentication required", "UNAUTHENTICATED");
    req.auth = await auth.verifyIdToken(token);
    next();
  } catch (error) { next(error instanceof HttpError ? error : new HttpError(401, "Invalid or expired authentication token", "INVALID_TOKEN")); }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  await verifyToken(req, res, async (error?: unknown) => {
    if (error) return next(error);
    try { req.profile = await getUserProfile(req.auth!.uid); next(); } catch (value) { next(value); }
  });
}

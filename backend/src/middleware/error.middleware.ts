import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

export function notFound(req: Request, _res: Response, next: NextFunction) { next(new HttpError(404, `Route not found: ${req.method} ${req.path}`, "NOT_FOUND")); }
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  void _next;
  if (error instanceof ZodError) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request", details: error.flatten().fieldErrors } });
  if (error instanceof HttpError) return res.status(error.status).json({ error: { code: error.code, message: error.message } });
  if (env.NODE_ENV !== "test") console.error(error);
  return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } });
}

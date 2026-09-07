import assert from "node:assert/strict";
import test from "node:test";
import type { NextFunction, Request, Response } from "express";
import { requireAdmin } from "./admin.middleware.js";
import { HttpError } from "../utils/http-error.js";

function authorize(profile?: Request["profile"]) {
  let result: unknown;
  requireAdmin({ profile } as Request, {} as Response, ((error?: unknown) => { result = error ?? "allowed"; }) as NextFunction);
  return result;
}

test("unauthenticated requests are denied by admin authorization", () => assert.equal((authorize() as HttpError).status, 403));
test("normal users are denied by admin authorization", () => assert.equal((authorize({ uid: "u1", name: "User", email: "u@example.com", role: "user", createdAt: "", updatedAt: "" }) as HttpError).status, 403));
test("administrators pass admin authorization", () => assert.equal(authorize({ uid: "a1", name: "Admin", email: "a@example.com", role: "admin", createdAt: "", updatedAt: "" }), "allowed"));

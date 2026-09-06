import assert from "node:assert/strict";
import test from "node:test";
import type { NextFunction, Request, Response } from "express";
import { createDeviceAuthMiddleware } from "./device-auth.middleware.js";
import { HttpError } from "../utils/http-error.js";

function authenticate(headers: Record<string, string> = {}) {
  const request = { header: (name: string) => headers[name], deviceId: undefined } as unknown as Request;
  let error: unknown;
  createDeviceAuthMiddleware("test-device", "test-secret-value")(
    request,
    {} as Response,
    ((value?: unknown) => { error = value; }) as NextFunction,
  );
  return { request, error };
}

test("device auth rejects missing credentials", () => assert.equal((authenticate().error as HttpError).code, "DEVICE_UNAUTHENTICATED"));
test("device auth rejects the wrong device id", () => assert.equal((authenticate({ "x-device-id": "wrong", "x-device-secret": "test-secret-value" }).error as HttpError).code, "INVALID_DEVICE_CREDENTIALS"));
test("device auth rejects the wrong device secret", () => assert.equal((authenticate({ "x-device-id": "test-device", "x-device-secret": "wrong" }).error as HttpError).code, "INVALID_DEVICE_CREDENTIALS"));
test("device auth accepts matching dedicated credentials", () => { const result = authenticate({ "x-device-id": "test-device", "x-device-secret": "test-secret-value" }); assert.equal(result.error, undefined); assert.equal(result.request.deviceId, "test-device"); });
test("Firebase user bearer token alone does not grant device access", () => assert.equal((authenticate({ authorization: "Bearer user-token-placeholder" }).error as HttpError).code, "DEVICE_UNAUTHENTICATED"));
test("Firebase admin bearer token alone does not grant device access", () => assert.equal((authenticate({ authorization: "Bearer admin-token-placeholder" }).error as HttpError).code, "DEVICE_UNAUTHENTICATED"));
test("device authentication does not create Firebase user or profile context", () => { const result = authenticate({ "x-device-id": "test-device", "x-device-secret": "test-secret-value" }); assert.equal(result.request.auth, undefined); assert.equal(result.request.profile, undefined); });

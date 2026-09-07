import assert from "node:assert/strict";
import test from "node:test";
import { profileSchema } from "./auth.controller.js";

test("public profile registration rejects an attempted admin role", () => {
  assert.equal(profileSchema.safeParse({ name: "User Name", vehicleNumber: "MH01AA0001", role: "admin" }).success, false);
});

test("public profile registration accepts only user-controlled profile fields", () => {
  assert.deepEqual(profileSchema.parse({ name: "User Name", vehicleNumber: "MH01AA0001" }), { name: "User Name", vehicleNumber: "MH01AA0001" });
});

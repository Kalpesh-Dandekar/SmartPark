import assert from "node:assert/strict";
import test from "node:test";
import { provisionExistingAdmin, type AdminProvisioningDependencies } from "./admin-provisioning.service.js";

function fixture(existing: Record<string, unknown> | null = { uid: "u1", email: "admin@example.com", name: "Existing Name", vehicleNumber: "MH01AA0001", createdAt: "created", role: "user" }) {
  let stored = existing;
  let writes = 0;
  const dependencies: AdminProvisioningDependencies = {
    findUserByEmail: async (email) => ({ uid: "u1", email }),
    readProfile: async () => stored,
    writeProfile: async (_uid, profile) => { stored = profile; writes += 1; },
    timestamp: () => "updated",
  };
  return { dependencies, value: () => stored!, writes: () => writes };
}

test("provisions only the specified existing account without a password", async () => {
  const state = fixture();
  const result = await provisionExistingAdmin("ADMIN@example.com", state.dependencies);
  assert.deepEqual(result, { email: "admin@example.com", role: "admin" });
  assert.equal(state.value().role, "admin");
  assert.equal("password" in state.value(), false);
});

test("provisioning is idempotent and keeps the canonical role", async () => {
  const state = fixture();
  await provisionExistingAdmin("admin@example.com", state.dependencies);
  await provisionExistingAdmin("admin@example.com", state.dependencies);
  assert.equal(state.value().role, "admin");
  assert.equal(state.writes(), 2);
});

test("provisioning preserves legitimate existing profile fields", async () => {
  const state = fixture();
  await provisionExistingAdmin("admin@example.com", state.dependencies);
  assert.equal(state.value().name, "Existing Name");
  assert.equal(state.value().vehicleNumber, "MH01AA0001");
  assert.equal(state.value().createdAt, "created");
  assert.equal(state.value().updatedAt, "updated");
});

test("unknown Firebase account fails safely without writing", async () => {
  const state = fixture();
  state.dependencies.findUserByEmail = async () => { throw Object.assign(new Error("not found"), { code: "auth/user-not-found" }); };
  await assert.rejects(() => provisionExistingAdmin("unknown@example.com", state.dependencies));
  assert.equal(state.writes(), 0);
});

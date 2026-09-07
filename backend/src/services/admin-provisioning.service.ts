export interface AdminAuthUser { uid: string; email?: string; displayName?: string }
export interface AdminProvisioningDependencies {
  findUserByEmail: (email: string) => Promise<AdminAuthUser>;
  readProfile: (uid: string) => Promise<Record<string, unknown> | null>;
  writeProfile: (uid: string, profile: Record<string, unknown>) => Promise<void>;
  timestamp: () => unknown;
}

export async function provisionExistingAdmin(emailInput: string, dependencies: AdminProvisioningDependencies) {
  const email = emailInput.trim().toLowerCase();
  if (!email) throw new Error("Administrator email is required.");
  const account = await dependencies.findUserByEmail(email);
  const existing = await dependencies.readProfile(account.uid);
  const timestamp = dependencies.timestamp();
  const profile: Record<string, unknown> = {
    ...(existing ?? {}),
    uid: account.uid,
    email: existing?.email ?? account.email ?? email,
    name: existing?.name ?? account.displayName ?? email.split("@")[0],
    role: "admin",
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  await dependencies.writeProfile(account.uid, profile);
  return { email, role: "admin" as const };
}

import { FieldValue } from "firebase-admin/firestore";
import { auth, db } from "../config/firebase.js";
import { provisionExistingAdmin } from "../services/admin-provisioning.service.js";

function emailArgument(args: string[]) {
  const flag = args.indexOf("--email");
  return flag >= 0 ? args[flag + 1] : undefined;
}

const email = emailArgument(process.argv.slice(2));
if (!email) throw new Error("Usage: npm run admin:provision -- --email <existing-account-email>");

try {
  const result = await provisionExistingAdmin(email, {
    findUserByEmail: (value) => auth.getUserByEmail(value),
    readProfile: async (uid) => { const snapshot = await db.collection("users").doc(uid).get(); return snapshot.exists ? snapshot.data() ?? null : null; },
    writeProfile: async (uid, profile) => { await db.collection("users").doc(uid).set(profile, { merge: true }); },
    timestamp: () => FieldValue.serverTimestamp(),
  });
  console.log(`Administrator profile provisioned for ${result.email} with role=${result.role}.`);
} catch (error) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "UNKNOWN";
  if (code === "auth/user-not-found") throw new Error("No existing Firebase Authentication account was found for the supplied email.");
  throw error;
}

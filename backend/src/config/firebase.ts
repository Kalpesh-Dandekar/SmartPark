import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { env } from "./env.js";

const credential = env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY
  ? cert({ projectId: env.FIREBASE_PROJECT_ID, clientEmail: env.FIREBASE_CLIENT_EMAIL, privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") })
  : applicationDefault();

export const firebaseAdmin = getApps()[0] ?? initializeApp({ credential, projectId: env.FIREBASE_PROJECT_ID });
export const auth = getAuth(firebaseAdmin);
export const db = getFirestore(firebaseAdmin);
db.settings({ ignoreUndefinedProperties: true });

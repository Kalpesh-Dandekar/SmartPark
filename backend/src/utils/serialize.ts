import type { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";

export function serializeDocument<T>(snapshot: QueryDocumentSnapshot<DocumentData>): T {
  const data = snapshot.data();
  return { id: snapshot.id, ...Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value?.toDate instanceof Function ? value.toDate().toISOString() : value])) } as T;
}

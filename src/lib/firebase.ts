import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Single, lazy Firebase initialisation for project `turtlewings-2eff1`.
 * Browser-only: the config (including the publishable web API key) is fetched
 * once from /api/public/firebase-config so no key is baked into the bundle.
 *
 * Only Firebase Authentication and Firestore are used. Firebase Cloud Storage is
 * deliberately not initialised — admin images are committed to `public/images`
 * through the server-side upload function instead.
 */
export type FirebaseBundle = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
};

let bundle: Promise<FirebaseBundle> | null = null;

export function getFirebase(): Promise<FirebaseBundle> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Firebase client is browser-only"));
  }
  bundle ??= (async () => {
    const res = await fetch("/api/public/firebase-config");
    if (!res.ok) throw new Error("Could not load Firebase configuration");
    const config = (await res.json()) as { apiKey: string; projectId: string };
    if (!config.apiKey) throw new Error("Firebase web API key is not configured");
    const app = getApps().length ? getApp() : initializeApp(config);
    return { app, auth: getAuth(app), db: getFirestore(app) };
  })();
  return bundle;
}

export async function getDb() {
  return (await getFirebase()).db;
}

export async function getFirebaseAuth() {
  return (await getFirebase()).auth;
}

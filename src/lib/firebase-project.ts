/**
 * Shared, non-secret Firebase project identifiers.
 * The web API key is a publishable identifier used by the browser SDK and by
 * the server-side ID-token verification call (identitytoolkit REST).
 */
export const FIREBASE_PROJECT_ID = "turtlewings-2eff1";
export const FIREBASE_WEB_API_KEY = "AIzaSyA_68xftxR1YAx8BxRNliP7Nr3m1gGP-Rc";

export const firebaseWebConfig = {
  apiKey: FIREBASE_WEB_API_KEY,
  authDomain: `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: `${FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: "611464015387",
  appId: "1:611464015387:web:d0f50c0a11b64797be92be",
  measurementId: "G-C86E7XECWB",
} as const;

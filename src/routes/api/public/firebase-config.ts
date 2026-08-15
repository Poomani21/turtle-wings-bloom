import { createFileRoute } from "@tanstack/react-router";

/**
 * Returns the Firebase *web* configuration for the browser client.
 * The web API key is a publishable identifier (not a secret), but it is stored
 * as a project secret here, so it is served at request time instead of being
 * inlined into the client bundle. All real protection lives in the Firestore
 * and Storage security rules plus Firebase Authentication.
 */
export const Route = createFileRoute("/api/public/firebase-config")({
  server: {
    handlers: {
      GET: () => {
        const apiKey = "AIzaSyA_68xftxR1YAx8BxRNliP7Nr3m1gGP-Rc";
        return new Response(
          JSON.stringify({
            apiKey,
            authDomain: "turtlewings-2eff1.firebaseapp.com",
            projectId: "turtlewings-2eff1",
            storageBucket: "turtlewings-2eff1.firebasestorage.app",
            messagingSenderId: "611464015387",
            appId: "1:611464015387:web:d0f50c0a11b64797be92be",
            measurementId: "G-C86E7XECWB",
          }),
          {
            headers: {
              "content-type": "application/json",
              "cache-control": "public, max-age=300",
            },
          },
        );
      },
    },
  },
});

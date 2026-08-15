import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { isAdminUser } from "@/lib/cms";

export type AdminAuthState = {
  user: User | null;
  /** True only when the signed-in UID exists in the Firestore admins allowlist. */
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
};

export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    isAdmin: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let active = true;
    getFirebaseAuth()
      .then((auth) => {
        if (!active) return;
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!user) {
            setState({ user: null, isAdmin: false, loading: false, error: null });
            return;
          }
          setState({ user, isAdmin: false, loading: true, error: null });
          void isAdminUser(user.uid).then((isAdmin) => {
            if (active) setState({ user, isAdmin, loading: false, error: null });
          });
        });
      })
      .catch((error: Error) =>
        setState({ user: null, isAdmin: false, loading: false, error: error.message }),
      );
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  return state;
}

export async function adminSignIn(email: string, password: string) {
  const auth = await getFirebaseAuth();
  await signInWithEmailAndPassword(auth, email, password);
}

export async function adminSignOut() {
  const auth = await getFirebaseAuth();
  await signOut(auth);
}

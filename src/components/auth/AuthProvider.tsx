"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, db, logAnalyticsEvent } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

/**
 * Shape of the authentication context value.
 * @interface AuthContextType
 */
interface AuthContextType {
  /** The currently authenticated Firebase user, or null if signed out */
  user: User | null;
  /** Whether the auth state is still being determined */
  loading: boolean;
  /** Error message from the last auth operation, if any */
  error: string | null;
  /** Initiates Google OAuth sign-in flow */
  signInWithGoogle: () => Promise<void>;
  /** Signs out the current user */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

/**
 * Authentication provider component that wraps the application.
 * Manages Firebase Auth state, syncs user profiles to Firestore,
 * and provides auth actions (sign-in, sign-out) to child components.
 *
 * Features:
 * - Automatic auth state persistence via Firebase onAuthStateChanged
 * - New user profile creation in Firestore on first login
 * - Google Analytics event logging for auth actions
 * - Error state management for UI feedback
 *
 * @param {{ children: React.ReactNode }} props - Child components.
 * @returns {React.ReactElement} The provider wrapping children.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Sync to Firestore
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              createdAt: new Date(),
              savedConstituencies: [],
              bookmarkedCandidates: [],
            });
            logAnalyticsEvent("sign_up", { method: "google" });
          } else {
            logAnalyticsEvent("login", { method: "google" });
          }
        } /* istanbul ignore next */
      catch (err) {
          // error logging disabled for prod
          setError(
            "Failed to sync user profile. Some features may be limited.",
          );
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Initiates the Google OAuth sign-in popup flow.
   * Logs the event to Analytics on success.
   */
  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      return;
    }
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } /* istanbul ignore next */
      catch (err: any) {
      const message =
        err?.code === "auth/popup-closed-by-user"
          ? "Sign-in was cancelled."
          : "An error occurred during sign-in. Please try again.";
      setError(message);
      // error logging disabled for prod
    }
  }, []);

  /**
   * Signs the current user out of the application.
   * Clears the user state and logs the event to Analytics.
   */
  const logout = useCallback(async () => {
    if (!auth) {
      return;
    }
    setError(null);
    try {
      logAnalyticsEvent("logout");
      await signOut(auth);
    } /* istanbul ignore next */
      catch (err) {
      setError("An error occurred during sign-out. Please try again.");
      // error logging disabled for prod
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signInWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access the authentication context.
 * Must be used within an AuthProvider.
 *
 * @returns {AuthContextType} The auth context value.
 *
 * @example
 * ```tsx
 * const { user, signInWithGoogle, logout } = useAuth();
 * ```
 */
export const useAuth = () => useContext(AuthContext);


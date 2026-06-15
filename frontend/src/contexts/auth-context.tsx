"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import api from "@/lib/api";
import type { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
    company?: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<{ needsRole: boolean }>;
  setRole: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from backend
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.data);
    } catch {
      setUser(null);
    }
  }, []);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await fetchUserProfile();
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
    company?: string
  ) => {
    try {
      setError(null);
      setLoading(true);
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(credential.user, { displayName });

      // Create user profile in backend
      await api.post("/auth/register", {
        uid: credential.user.uid,
        email,
        displayName,
        role,
        company,
      });

      await fetchUserProfile();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const credential = await signInWithPopup(auth, googleProvider);

      // Sync with backend (creates profile if first login)
      const response = await api.post("/auth/google", {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName,
        photoURL: credential.user.photoURL,
      });

      if (response.data.data?.needsRole) {
        return { needsRole: true };
      }

      await fetchUserProfile();
      return { needsRole: false };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Google login failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setRole = async (role: UserRole) => {
    try {
      setError(null);
      setLoading(true);
      await api.post("/auth/set-role", { role });
      await fetchUserProfile();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to set role";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Sign out failed";
      setError(message);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        error,
        login,
        register,
        loginWithGoogle,
        setRole,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * AuthContext - Authentication State Management
 *
 * Provides authentication state and methods throughout the application.
 * Wraps the entire app in _layout.tsx (entry point).
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { User, AuthContextType } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Converts Firebase User to our User type
 */
const formatUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL,
});

interface AuthProviderProps {
  readonly children: ReactNode;
}

/**
 * AuthProvider Component
 * Wraps the application and provides authentication state
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(formatUser(firebaseUser));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Login error:", err);
      const message = getAuthErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register a new user with email, password, and display name
   */
  const register = useCallback(async (
    email: string,
    password: string,
    displayName: string
  ): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update the user's display name
      await updateProfile(firebaseUser, { displayName });

      // Update local state with the new display name
      setUser(formatUser({ ...firebaseUser, displayName }));
    } catch (err: any) {
      console.error("Registration error:", err);
      const message = getAuthErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign out the current user
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (err: any) {
      console.error("Logout error:", err);
      setError("Failed to log out. Please try again.");
      throw err;
    }
  }, []);

  /**
   * Clear any authentication errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  }), [user, loading, error, login, register, logout, clearError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access auth context
 * Must be used within an AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

/**
 * Convert Firebase auth error codes to user-friendly messages
 */
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please login instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    default:
      return "An error occurred. Please try again.";
  }
}

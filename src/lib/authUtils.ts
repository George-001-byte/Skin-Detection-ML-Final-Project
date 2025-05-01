
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

// Save user authentication
export const loginUser = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("No user returned from authentication");
  }

  toast.success("Logged in successfully");
  return data.user;
};

// Register a new user
export const registerUser = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("No user returned from registration");
  }

  toast.success("Registration successful!");
  return data.user;
};

// Get the current user if logged in
export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user || null;
};

// Log out user
export const logoutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("Error logging out:", error);
    toast.error("Failed to log out");
    return;
  }
  
  toast.success("Logged out successfully");
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user !== null;
};

// Authentication hook for protected routes
export const requireAuth = async (): Promise<boolean> => {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    toast.error("Please log in to access this page");
  }
  return authenticated;
};

// React hook for authentication state
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, session, loading };
};

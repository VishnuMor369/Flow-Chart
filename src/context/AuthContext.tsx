import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGithub: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  devSignIn?: () => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    // If a secure server endpoint is configured, use it to create a confirmed user
    // The server should use the Supabase service role key to create users and mark them confirmed.
    const createUserUrl = import.meta.env.VITE_CREATE_USER_URL;
    if (createUserUrl) {
      try {
        const res = await fetch(createUserUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { error: data?.error || 'Could not create user via server.' };
        }

        // Try to sign in client-side to obtain a session
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) return { error: signInError.message };

        return { error: null };
      } catch (err: any) {
        return { error: err?.message || 'Server request failed.' };
      }
    }

    // Fallback: use Supabase client-side signUp (may require email confirmation depending on your Supabase settings)
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };

    // Attempt to sign in immediately after sign up to avoid separate verification step in UI.
    // Note: If your Supabase project requires email confirmations, this may fail.
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) return { error: signInError.message };

    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signInWithGithub = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin },
    });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // Dev-only: quick demo sign-in without credentials. Only enabled when VITE_DEV_AUTH is truthy.
  const devSignIn = useCallback(async () => {
    const enabled = import.meta.env.VITE_DEV_AUTH === 'true';
    if (!enabled) return { error: 'Dev auth disabled' };

    // Create a lightweight fake user for UI/testing only.
    const fakeUser: User = {
      id: 'dev-user',
      app_metadata: {},
      user_metadata: { full_name: 'Demo User', avatar_url: '' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'demo@example.com',
      phone: null,
      confirmed_at: new Date().toISOString(),
      role: 'authenticated',
    } as unknown as User;

    setUser(fakeUser);
    setSession(null);
    setLoading(false);
    return { error: null };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?mode=reset`,
    });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signInWithGithub, signOut, resetPassword, updatePassword, devSignIn }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

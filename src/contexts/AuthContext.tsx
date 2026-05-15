import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, meta: { full_name: string; phone?: string; county?: string }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  });

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data as Profile | null;
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      let profile: Profile | null = null;
      if (session?.user) {
        profile = await fetchProfile(session.user.id);
      }
      setState({ user: session?.user ?? null, session, profile, loading: false });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        let profile: Profile | null = null;
        if (session?.user) {
          profile = await fetchProfile(session.user.id);
        }
        setState({ user: session?.user ?? null, session, profile, loading: false });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(
    email: string,
    password: string,
    meta: { full_name: string; phone?: string; county?: string }
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: meta },
    });

    if (error) return { error: error.message };

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: meta.full_name,
        phone: meta.phone || null,
        county: meta.county || null,
        role: 'farmer',
      });
    }

    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setState({ user: null, profile: null, session: null, loading: false });
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error?.message ?? null };
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!state.user) return { error: 'Not authenticated' };
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', state.user.id);

    if (!error) {
      const profile = await fetchProfile(state.user.id);
      setState((prev) => ({ ...prev, profile }));
    }

    return { error: error?.message ?? null };
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, resetPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

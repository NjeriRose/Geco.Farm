import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useUser } from '@clerk/react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface AuthContextType {
  userId: string | null;
  profile: Profile | null;
  loading: boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data as Profile | null;
  }

  async function ensureProfile(userId: string) {
    let prof = await fetchProfile(userId);
    if (!prof) {
      const fullName = clerkUser?.fullName ?? clerkUser?.firstName ?? 'New User';
      const phone = clerkUser?.phoneNumbers?.[0]?.phoneNumber ?? null;

      await supabase.from('profiles').upsert({
        id: userId,
        full_name: fullName,
        phone,
        role: 'farmer',
      });
      prof = await fetchProfile(userId);
    }
    return prof;
  }

  useEffect(() => {
    if (!clerkLoaded) return;

    if (!clerkUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const userId = clerkUser.id;
    ensureProfile(userId).then((prof) => {
      setProfile(prof);
      setLoading(false);
    });
  }, [clerkLoaded, clerkUser?.id]);

  async function updateProfile(updates: Partial<Profile>) {
    if (!clerkUser) return { error: 'Not authenticated' };
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', clerkUser.id);

    if (!error) {
      const prof = await fetchProfile(clerkUser.id);
      setProfile(prof);
    }

    return { error: error?.message ?? null };
  }

  async function refreshProfile() {
    if (!clerkUser) return;
    const prof = await fetchProfile(clerkUser.id);
    setProfile(prof);
  }

  return (
    <AuthContext.Provider value={{
      userId: clerkUser?.id ?? null,
      profile,
      loading: !clerkLoaded || loading,
      updateProfile,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

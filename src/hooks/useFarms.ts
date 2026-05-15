import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Farm } from '../types';

export function useFarms() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function createFarm(farm: {
    name: string;
    county: string;
    location?: string;
    size_acres: number;
    farm_type: Farm['farm_type'];
    description?: string;
    latitude?: number;
    longitude?: number;
  }) {
    if (!user) return { data: null, error: 'Not authenticated' };
    setLoading(true);

    const { data, error } = await supabase
      .from('farms')
      .insert({ ...farm, owner_id: user.id })
      .select()
      .single();

    if (data && !error) {
      await supabase.from('farm_members').insert({
        farm_id: data.id,
        user_id: user.id,
        role: 'owner',
      });
    }

    setLoading(false);
    return { data: data as Farm | null, error: error?.message ?? null };
  }

  async function updateFarm(id: string, updates: Partial<Farm>) {
    setLoading(true);
    const { error } = await supabase
      .from('farms')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    setLoading(false);
    return { error: error?.message ?? null };
  }

  async function deleteFarm(id: string) {
    const { error } = await supabase.from('farms').delete().eq('id', id);
    return { error: error?.message ?? null };
  }

  return { createFarm, updateFarm, deleteFarm, loading };
}

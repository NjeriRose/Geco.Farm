import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useFarm } from '../contexts/FarmContext';
import type { Field } from '../types';

export function useFields() {
  const { activeFarm } = useFarm();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFields = useCallback(async () => {
    if (!activeFarm) return;
    setLoading(true);
    const { data } = await supabase
      .from('fields')
      .select('*')
      .eq('farm_id', activeFarm.id)
      .order('name');
    setFields((data as Field[]) ?? []);
    setLoading(false);
  }, [activeFarm]);

  useEffect(() => { fetchFields(); }, [fetchFields]);

  async function createField(field: Omit<Field, 'id' | 'farm_id' | 'created_at' | 'updated_at'>) {
    if (!activeFarm) return { error: 'No active farm' };
    const { error } = await supabase
      .from('fields')
      .insert({ ...field, farm_id: activeFarm.id });
    if (!error) await fetchFields();
    return { error: error?.message ?? null };
  }

  async function updateField(id: string, updates: Partial<Field>) {
    const { error } = await supabase
      .from('fields')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) await fetchFields();
    return { error: error?.message ?? null };
  }

  async function deleteField(id: string) {
    const { error } = await supabase.from('fields').delete().eq('id', id);
    if (!error) await fetchFields();
    return { error: error?.message ?? null };
  }

  return { fields, loading, createField, updateField, deleteField, refresh: fetchFields };
}

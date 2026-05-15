import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useFarm } from '../contexts/FarmContext';
import type { Livestock, LivestockType, LivestockHealthRecord, ProductionRecord } from '../types';

export function useLivestockTypes() {
  const [types, setTypes] = useState<LivestockType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('livestock_types')
      .select('*')
      .order('name')
      .then(({ data }) => {
        setTypes((data as LivestockType[]) ?? []);
        setLoading(false);
      });
  }, []);

  return { types, loading };
}

export function useLivestock() {
  const { activeFarm } = useFarm();
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLivestock = useCallback(async () => {
    if (!activeFarm) return;
    setLoading(true);
    const { data } = await supabase
      .from('livestock')
      .select('*, livestock_type:livestock_types(*)')
      .eq('farm_id', activeFarm.id)
      .order('created_at', { ascending: false });
    setLivestock((data as Livestock[]) ?? []);
    setLoading(false);
  }, [activeFarm]);

  useEffect(() => { fetchLivestock(); }, [fetchLivestock]);

  async function createLivestock(animal: {
    livestock_type_id: string;
    tag_number?: string;
    name?: string;
    date_of_birth?: string;
    date_acquired?: string;
    acquisition_cost_kes?: number;
    gender?: string;
    weight_kg?: number;
    notes?: string;
  }) {
    if (!activeFarm) return { error: 'No active farm' };
    const { error } = await supabase
      .from('livestock')
      .insert({ ...animal, farm_id: activeFarm.id });
    if (!error) await fetchLivestock();
    return { error: error?.message ?? null };
  }

  async function updateLivestock(id: string, updates: Partial<Livestock>) {
    const { error } = await supabase
      .from('livestock')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) await fetchLivestock();
    return { error: error?.message ?? null };
  }

  async function deleteLivestock(id: string) {
    const { error } = await supabase.from('livestock').delete().eq('id', id);
    if (!error) await fetchLivestock();
    return { error: error?.message ?? null };
  }

  return { livestock, loading, createLivestock, updateLivestock, deleteLivestock, refresh: fetchLivestock };
}

export function useHealthRecords(livestockId?: string) {
  const { activeFarm } = useFarm();
  const [records, setRecords] = useState<LivestockHealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    if (!activeFarm) return;
    setLoading(true);
    let query = supabase
      .from('livestock_health_records')
      .select('*')
      .eq('farm_id', activeFarm.id)
      .order('record_date', { ascending: false });

    if (livestockId) query = query.eq('livestock_id', livestockId);

    const { data } = await query;
    setRecords((data as LivestockHealthRecord[]) ?? []);
    setLoading(false);
  }, [activeFarm, livestockId]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  async function addHealthRecord(record: {
    livestock_id: string;
    record_date: string;
    record_type: string;
    description: string;
    medicine?: string;
    dosage?: string;
    veterinarian?: string;
    cost_kes?: number;
    next_due_date?: string;
    notes?: string;
  }) {
    if (!activeFarm) return { error: 'No active farm' };
    const { error } = await supabase
      .from('livestock_health_records')
      .insert({ ...record, farm_id: activeFarm.id });
    if (!error) await fetchRecords();
    return { error: error?.message ?? null };
  }

  return { records, loading, addHealthRecord, refresh: fetchRecords };
}

export function useProduction(livestockId?: string) {
  const { activeFarm } = useFarm();
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    if (!activeFarm) return;
    setLoading(true);
    let query = supabase
      .from('production_records')
      .select('*, livestock:livestock(*)')
      .eq('farm_id', activeFarm.id)
      .order('production_date', { ascending: false });

    if (livestockId) query = query.eq('livestock_id', livestockId);

    const { data } = await query;
    setRecords((data as ProductionRecord[]) ?? []);
    setLoading(false);
  }, [activeFarm, livestockId]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  async function addProduction(record: {
    livestock_id?: string;
    production_date: string;
    product_type: string;
    quantity: number;
    unit: string;
    quality_grade?: string;
    notes?: string;
  }) {
    if (!activeFarm) return { error: 'No active farm' };
    const { error } = await supabase
      .from('production_records')
      .insert({ ...record, farm_id: activeFarm.id });
    if (!error) await fetchRecords();
    return { error: error?.message ?? null };
  }

  return { records, loading, addProduction, refresh: fetchRecords };
}

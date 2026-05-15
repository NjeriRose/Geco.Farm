import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useFarm } from '../contexts/FarmContext';
import type { CropType, Planting, Harvest } from '../types';

export function useCropTypes() {
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('crop_types')
      .select('*')
      .order('name')
      .then(({ data }) => {
        setCropTypes((data as CropType[]) ?? []);
        setLoading(false);
      });
  }, []);

  return { cropTypes, loading };
}

export function usePlantings() {
  const { activeFarm } = useFarm();
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlantings = useCallback(async () => {
    if (!activeFarm) return;
    setLoading(true);
    const { data } = await supabase
      .from('plantings')
      .select('*, crop_type:crop_types(*), field:fields(*)')
      .eq('farm_id', activeFarm.id)
      .order('planting_date', { ascending: false });
    setPlantings((data as Planting[]) ?? []);
    setLoading(false);
  }, [activeFarm]);

  useEffect(() => { fetchPlantings(); }, [fetchPlantings]);

  async function createPlanting(planting: {
    field_id: string;
    crop_type_id: string;
    season?: string;
    planting_date: string;
    expected_harvest_date?: string;
    area_acres: number;
    seed_quantity?: number;
    seed_unit?: string;
    seed_cost_kes?: number;
    status?: string;
    notes?: string;
  }) {
    if (!activeFarm) return { error: 'No active farm' };
    const { error } = await supabase
      .from('plantings')
      .insert({ ...planting, farm_id: activeFarm.id });
    if (!error) await fetchPlantings();
    return { error: error?.message ?? null };
  }

  async function updatePlanting(id: string, updates: Partial<Planting>) {
    const { error } = await supabase
      .from('plantings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) await fetchPlantings();
    return { error: error?.message ?? null };
  }

  async function deletePlanting(id: string) {
    const { error } = await supabase.from('plantings').delete().eq('id', id);
    if (!error) await fetchPlantings();
    return { error: error?.message ?? null };
  }

  return { plantings, loading, createPlanting, updatePlanting, deletePlanting, refresh: fetchPlantings };
}

export function useHarvests(plantingId?: string) {
  const { activeFarm } = useFarm();
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHarvests = useCallback(async () => {
    if (!activeFarm) return;
    setLoading(true);
    let query = supabase
      .from('harvests')
      .select('*, planting:plantings(*, crop_type:crop_types(*))')
      .eq('farm_id', activeFarm.id)
      .order('harvest_date', { ascending: false });

    if (plantingId) query = query.eq('planting_id', plantingId);

    const { data } = await query;
    setHarvests((data as Harvest[]) ?? []);
    setLoading(false);
  }, [activeFarm, plantingId]);

  useEffect(() => { fetchHarvests(); }, [fetchHarvests]);

  async function recordHarvest(harvest: {
    planting_id: string;
    harvest_date: string;
    quantity: number;
    unit: string;
    quality_grade?: string;
    storage_location?: string;
    notes?: string;
  }) {
    if (!activeFarm) return { error: 'No active farm' };
    const { error } = await supabase
      .from('harvests')
      .insert({ ...harvest, farm_id: activeFarm.id });
    if (!error) await fetchHarvests();
    return { error: error?.message ?? null };
  }

  return { harvests, loading, recordHarvest, refresh: fetchHarvests };
}

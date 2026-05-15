import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Farm } from '../types';

interface FarmContextType {
  farms: Farm[];
  activeFarm: Farm | null;
  setActiveFarm: (farm: Farm) => void;
  loading: boolean;
  refreshFarms: () => Promise<void>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function FarmProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeFarm, setActiveFarmState] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadFarms() {
    if (!user) {
      setFarms([]);
      setActiveFarmState(null);
      setLoading(false);
      return;
    }

    const { data: memberRows } = await supabase
      .from('farm_members')
      .select('farm_id')
      .eq('user_id', user.id);

    const farmIds = memberRows?.map((r) => r.farm_id) ?? [];

    if (farmIds.length === 0) {
      const { data: ownedFarms } = await supabase
        .from('farms')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      const list = (ownedFarms as Farm[]) ?? [];
      setFarms(list);
      const savedId = localStorage.getItem('activeFarmId');
      setActiveFarmState(list.find((f) => f.id === savedId) ?? list[0] ?? null);
      setLoading(false);
      return;
    }

    const { data: farmData } = await supabase
      .from('farms')
      .select('*')
      .in('id', farmIds)
      .order('created_at', { ascending: false });

    const list = (farmData as Farm[]) ?? [];
    setFarms(list);

    const savedId = localStorage.getItem('activeFarmId');
    setActiveFarmState(list.find((f) => f.id === savedId) ?? list[0] ?? null);
    setLoading(false);
  }

  useEffect(() => {
    loadFarms();
  }, [user]);

  function setActiveFarm(farm: Farm) {
    setActiveFarmState(farm);
    localStorage.setItem('activeFarmId', farm.id);
  }

  return (
    <FarmContext.Provider value={{ farms, activeFarm, setActiveFarm, loading, refreshFarms: loadFarms }}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm(): FarmContextType {
  const context = useContext(FarmContext);
  if (!context) throw new Error('useFarm must be used within FarmProvider');
  return context;
}

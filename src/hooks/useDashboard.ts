import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useFarm } from '../contexts/FarmContext';
import type { DashboardStats, ActivityLog } from '../types';

export function useDashboard() {
  const { activeFarm } = useFarm();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    activeCrops: 0,
    totalLivestock: 0,
    pendingTasks: 0,
    lowStockItems: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!activeFarm) return;
    setLoading(true);

    const [salesRes, expensesRes, cropsRes, livestockRes, tasksRes, inventoryRes, activityRes] =
      await Promise.all([
        supabase.from('sales').select('total_amount_kes').eq('farm_id', activeFarm.id),
        supabase.from('expenses').select('amount_kes').eq('farm_id', activeFarm.id),
        supabase.from('plantings').select('id').eq('farm_id', activeFarm.id).in('status', ['planted', 'growing']),
        supabase.from('livestock').select('id').eq('farm_id', activeFarm.id).eq('status', 'active'),
        supabase.from('tasks').select('id').eq('farm_id', activeFarm.id).eq('status', 'pending'),
        supabase.from('inventory').select('quantity, reorder_level').eq('farm_id', activeFarm.id),
        supabase.from('activity_log').select('*').eq('farm_id', activeFarm.id).order('created_at', { ascending: false }).limit(10),
      ]);

    const totalRevenue = (salesRes.data ?? []).reduce((sum, s) => sum + (s.total_amount_kes || 0), 0);
    const totalExpenses = (expensesRes.data ?? []).reduce((sum, e) => sum + (e.amount_kes || 0), 0);
    const lowStockItems = (inventoryRes.data ?? []).filter(
      (i) => i.reorder_level > 0 && i.quantity <= i.reorder_level
    ).length;

    setStats({
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      activeCrops: cropsRes.data?.length ?? 0,
      totalLivestock: livestockRes.data?.length ?? 0,
      pendingTasks: tasksRes.data?.length ?? 0,
      lowStockItems,
      recentActivities: (activityRes.data as ActivityLog[]) ?? [],
    });

    setLoading(false);
  }, [activeFarm]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, refresh: fetchStats };
}

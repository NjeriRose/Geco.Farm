import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useFarm } from '../contexts/FarmContext';
import type { Expense, Sale } from '../types';

export function useExpenses() {
  const { activeFarm } = useFarm();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    if (!activeFarm) return;
    setLoading(true);
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('farm_id', activeFarm.id)
      .order('expense_date', { ascending: false });
    setExpenses((data as Expense[]) ?? []);
    setLoading(false);
  }, [activeFarm]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  async function createExpense(expense: {
    category: string;
    description: string;
    amount_kes: number;
    payment_method?: string;
    reference_number?: string;
    expense_date: string;
    notes?: string;
  }) {
    if (!activeFarm) return { error: 'No active farm' };
    const { error } = await supabase
      .from('expenses')
      .insert({ ...expense, farm_id: activeFarm.id });
    if (!error) await fetchExpenses();
    return { error: error?.message ?? null };
  }

  async function deleteExpense(id: string) {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) await fetchExpenses();
    return { error: error?.message ?? null };
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount_kes, 0);

  return { expenses, totalExpenses, loading, createExpense, deleteExpense, refresh: fetchExpenses };
}

export function useSales() {
  const { activeFarm } = useFarm();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = useCallback(async () => {
    if (!activeFarm) return;
    setLoading(true);
    const { data } = await supabase
      .from('sales')
      .select('*')
      .eq('farm_id', activeFarm.id)
      .order('sale_date', { ascending: false });
    setSales((data as Sale[]) ?? []);
    setLoading(false);
  }, [activeFarm]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  async function createSale(sale: {
    item_type: string;
    item_description: string;
    quantity?: number;
    unit?: string;
    unit_price_kes?: number;
    total_amount_kes: number;
    buyer_name?: string;
    buyer_phone?: string;
    payment_method?: string;
    payment_status?: string;
    reference_number?: string;
    sale_date: string;
    notes?: string;
  }) {
    if (!activeFarm) return { error: 'No active farm' };
    const { error } = await supabase
      .from('sales')
      .insert({ ...sale, farm_id: activeFarm.id });
    if (!error) await fetchSales();
    return { error: error?.message ?? null };
  }

  async function deleteSale(id: string) {
    const { error } = await supabase.from('sales').delete().eq('id', id);
    if (!error) await fetchSales();
    return { error: error?.message ?? null };
  }

  const totalRevenue = sales
    .filter((s) => s.payment_status !== 'overdue')
    .reduce((sum, s) => sum + s.total_amount_kes, 0);

  return { sales, totalRevenue, loading, createSale, deleteSale, refresh: fetchSales };
}

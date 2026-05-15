import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useFarm } from '../contexts/FarmContext';
import type { InventoryItem, InventoryCategory, InventoryTransaction } from '../types';

export function useInventoryCategories() {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('inventory_categories')
      .select('*')
      .order('name')
      .then(({ data }) => {
        setCategories((data as InventoryCategory[]) ?? []);
        setLoading(false);
      });
  }, []);

  return { categories, loading };
}

export function useInventory() {
  const { activeFarm } = useFarm();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!activeFarm) return;
    setLoading(true);
    const { data } = await supabase
      .from('inventory')
      .select('*, category:inventory_categories(*)')
      .eq('farm_id', activeFarm.id)
      .order('name');
    setItems((data as InventoryItem[]) ?? []);
    setLoading(false);
  }, [activeFarm]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const lowStockItems = items.filter(
    (item) => item.reorder_level > 0 && item.quantity <= item.reorder_level
  );

  async function createItem(item: {
    category_id: string;
    name: string;
    quantity: number;
    unit: string;
    unit_cost_kes?: number;
    reorder_level?: number;
    supplier?: string;
    storage_location?: string;
    expiry_date?: string;
    notes?: string;
  }) {
    if (!activeFarm) return { error: 'No active farm' };
    const { error } = await supabase
      .from('inventory')
      .insert({ ...item, farm_id: activeFarm.id });
    if (!error) await fetchItems();
    return { error: error?.message ?? null };
  }

  async function updateItem(id: string, updates: Partial<InventoryItem>) {
    const { error } = await supabase
      .from('inventory')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) await fetchItems();
    return { error: error?.message ?? null };
  }

  async function deleteItem(id: string) {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (!error) await fetchItems();
    return { error: error?.message ?? null };
  }

  async function recordTransaction(tx: {
    inventory_id: string;
    transaction_type: string;
    quantity: number;
    unit_cost_kes?: number;
    total_cost_kes?: number;
    reference?: string;
    notes?: string;
  }) {
    if (!activeFarm) return { error: 'No active farm' };
    const { error } = await supabase
      .from('inventory_transactions')
      .insert({ ...tx, farm_id: activeFarm.id });

    if (!error) {
      const item = items.find((i) => i.id === tx.inventory_id);
      if (item) {
        const delta = tx.transaction_type === 'purchase' || tx.transaction_type === 'return'
          ? tx.quantity
          : -tx.quantity;
        await supabase
          .from('inventory')
          .update({ quantity: item.quantity + delta, updated_at: new Date().toISOString() })
          .eq('id', tx.inventory_id);
      }
      await fetchItems();
    }
    return { error: error?.message ?? null };
  }

  return { items, lowStockItems, loading, createItem, updateItem, deleteItem, recordTransaction, refresh: fetchItems };
}

export function useInventoryTransactions(inventoryId?: string) {
  const { activeFarm } = useFarm();
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!activeFarm) return;
    setLoading(true);
    let query = supabase
      .from('inventory_transactions')
      .select('*')
      .eq('farm_id', activeFarm.id)
      .order('created_at', { ascending: false });

    if (inventoryId) query = query.eq('inventory_id', inventoryId);

    const { data } = await query;
    setTransactions((data as InventoryTransaction[]) ?? []);
    setLoading(false);
  }, [activeFarm, inventoryId]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  return { transactions, loading, refresh: fetchTransactions };
}

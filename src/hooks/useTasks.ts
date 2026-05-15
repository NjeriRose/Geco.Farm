import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useFarm } from '../contexts/FarmContext';
import type { Task } from '../types';

export function useTasks() {
  const { activeFarm } = useFarm();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!activeFarm) return;
    setLoading(true);
    const { data } = await supabase
      .from('tasks')
      .select('*, assignee:profiles!tasks_assigned_to_fkey(*)')
      .eq('farm_id', activeFarm.id)
      .order('due_date', { ascending: true });
    setTasks((data as Task[]) ?? []);
    setLoading(false);
  }, [activeFarm]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  async function createTask(task: {
    title: string;
    description?: string;
    assigned_to?: string;
    priority?: string;
    category?: string;
    due_date?: string;
    notes?: string;
  }) {
    if (!activeFarm) return { error: 'No active farm' };
    const { error } = await supabase
      .from('tasks')
      .insert({ ...task, farm_id: activeFarm.id });
    if (!error) await fetchTasks();
    return { error: error?.message ?? null };
  }

  async function updateTask(id: string, updates: Partial<Task>) {
    const payload: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
    if (updates.status === 'completed') {
      payload.completed_at = new Date().toISOString();
    }
    const { error } = await supabase.from('tasks').update(payload).eq('id', id);
    if (!error) await fetchTasks();
    return { error: error?.message ?? null };
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) await fetchTasks();
    return { error: error?.message ?? null };
  }

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const overdueTasks = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed' && t.status !== 'cancelled'
  );

  return { tasks, pendingTasks, overdueTasks, loading, createTask, updateTask, deleteTask, refresh: fetchTasks };
}

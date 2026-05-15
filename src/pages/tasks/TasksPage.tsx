import { useState } from 'react';
import { Plus, ClipboardList, CheckCircle2 } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { TASK_PRIORITIES, TASK_STATUSES, TASK_CATEGORIES } from '../../lib/constants';
import { formatDate, cn } from '../../lib/utils';
import type { Task } from '../../types';
import toast from 'react-hot-toast';

export function TasksPage() {
  const { tasks, pendingTasks, overdueTasks, loading, createTask, updateTask, deleteTask } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [editTask, setEditTask] = useState<Task | null>(null);

  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', category: 'general', due_date: '', notes: '',
  });

  if (loading) return <LoadingSpinner />;

  function resetForm() {
    setForm({ title: '', description: '', priority: 'medium', category: 'general', due_date: '', notes: '' });
    setEditTask(null);
  }

  function openEdit(t: Task) {
    setEditTask(t);
    setForm({
      title: t.title, description: t.description ?? '', priority: t.priority,
      category: t.category, due_date: t.due_date ?? '', notes: t.notes ?? '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      title: form.title,
      description: form.description || undefined,
      priority: form.priority,
      category: form.category,
      due_date: form.due_date || undefined,
      notes: form.notes || undefined,
    };

    const { error } = editTask
      ? await updateTask(editTask.id, data)
      : await createTask(data);

    if (error) { toast.error(error); return; }
    toast.success(editTask ? 'Task updated' : 'Task created');
    setShowForm(false);
    resetForm();
  }

  async function toggleComplete(task: Task) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const { error } = await updateTask(task.id, { status: newStatus } as Partial<Task>);
    if (error) toast.error(error);
  }

  const filtered = tasks.filter((t) =>
    activeTab === 'all' || t.status === activeTab || (activeTab === 'overdue' && overdueTasks.some((o) => o.id === t.id))
  );

  const tabs = [
    { key: 'all', label: 'All', count: tasks.length },
    { key: 'pending', label: 'Pending', count: pendingTasks.length },
    { key: 'in_progress', label: 'In Progress', count: tasks.filter((t) => t.status === 'in_progress').length },
    { key: 'completed', label: 'Completed', count: tasks.filter((t) => t.status === 'completed').length },
    { key: 'overdue', label: 'Overdue', count: overdueTasks.length },
  ];

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle={`${pendingTasks.length} pending, ${overdueTasks.length} overdue`}
        action={
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        }
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No tasks"
            description="Create tasks to organize your daily farm activities."
            actionLabel="Add Task"
            onAction={() => { resetForm(); setShowForm(true); }}
          />
        ) : (
          filtered.map((task) => {
            const priority = TASK_PRIORITIES.find((p) => p.value === task.priority);
            const status = TASK_STATUSES.find((s) => s.value === task.status);
            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

            return (
              <Card key={task.id} onClick={() => openEdit(task)} className="hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleComplete(task); }}
                    className={cn(
                      'mt-0.5 p-1 rounded-full transition-colors flex-shrink-0',
                      task.status === 'completed' ? 'text-green-600' : 'text-slate-300 hover:text-green-500'
                    )}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        'font-medium',
                        task.status === 'completed' && 'line-through text-slate-400'
                      )}>
                        {task.title}
                      </p>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <StatusBadge colorClass={priority?.color ?? ''}>{priority?.label ?? task.priority}</StatusBadge>
                        <StatusBadge colorClass={isOverdue ? 'bg-red-100 text-red-800' : (status?.color ?? '')}>{isOverdue ? 'Overdue' : (status?.label ?? task.status)}</StatusBadge>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      {task.due_date && <span className={isOverdue ? 'text-red-500 font-medium' : ''}>Due: {formatDate(task.due_date)}</span>}
                      <span className="capitalize">{task.category}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={editTask ? 'Edit Task' : 'New Task'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What needs to be done?" required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Details (optional)" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} options={[...TASK_PRIORITIES]} />
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={[...TASK_CATEGORIES]} />
          </div>
          <Input label="Due Date" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
            <Button type="submit" className="flex-1">{editTask ? 'Update' : 'Create Task'}</Button>
          </div>
          {editTask && (
            <Button type="button" variant="danger" className="w-full" onClick={async () => {
              await deleteTask(editTask.id);
              toast.success('Task deleted');
              setShowForm(false); resetForm();
            }}>Delete Task</Button>
          )}
        </form>
      </Modal>
    </>
  );
}

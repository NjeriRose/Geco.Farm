import {
  TrendingUp, TrendingDown, Sprout, Beef, AlertTriangle,
  ClipboardList, CloudSun, DollarSign,
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useWeather } from '../../hooks/useWeather';
import { useFarm } from '../../contexts/FarmContext';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { PageHeader } from '../../components/layout/PageHeader';
import { formatKES, timeAgo } from '../../lib/utils';

export function DashboardPage() {
  const { activeFarm } = useFarm();
  const { stats, loading } = useDashboard();
  const { current } = useWeather();

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <PageHeader
        title={`Welcome back`}
        subtitle={activeFarm ? `${activeFarm.name} — ${activeFarm.county} County` : undefined}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={formatKES(stats.totalRevenue)}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatCard
          icon={TrendingDown}
          label="Total Expenses"
          value={formatKES(stats.totalExpenses)}
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
        <StatCard
          icon={Sprout}
          label="Active Crops"
          value={stats.activeCrops}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
        />
        <StatCard
          icon={Beef}
          label="Livestock"
          value={stats.totalLivestock}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Net Profit */}
        <Card>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${stats.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`h-5 w-5 ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Net Profit</p>
              <p className={`text-xl font-bold ${stats.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatKES(stats.netProfit)}
              </p>
            </div>
          </div>
        </Card>

        {/* Pending tasks */}
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Tasks</p>
              <p className="text-xl font-bold text-slate-900">{stats.pendingTasks}</p>
            </div>
          </div>
        </Card>

        {/* Weather */}
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-100">
              <CloudSun className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Weather</p>
              {current ? (
                <p className="text-xl font-bold text-slate-900">
                  {current.temp}°C
                  <span className="text-sm font-normal text-slate-500 ml-1 capitalize">{current.description}</span>
                </p>
              ) : (
                <p className="text-sm text-slate-400">Set farm coordinates for weather</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockItems > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <p className="text-sm text-orange-800">
              <strong>{stats.lowStockItems} inventory item{stats.lowStockItems > 1 ? 's' : ''}</strong> below
              reorder level. Check your inventory.
            </p>
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
        {stats.recentActivities.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium capitalize">{activity.action}</span>{' '}
                    <span className="text-slate-500">{activity.entity_type}</span>
                  </p>
                  <p className="text-xs text-slate-400">{timeAgo(activity.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 py-4 text-center">
            No activity yet. Start by adding crops, livestock, or expenses.
          </p>
        )}
      </Card>
    </>
  );
}

import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { api } from '../api/axios';
import {
  Package,
  CheckCircle,
  Users,
  AlertCircle,
  ShieldCheck,
  Activity,
  Wrench,
  Clock,
  ArrowRightLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '../components/ui/Skeleton';

interface DashboardData {
  scope: 'GLOBAL' | 'PERSONAL';
  stats: any;
  activity: {
    allocations: any[];
    maintenance: any[];
  };
}

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard/kpis');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="animate-in fade-in space-y-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
            <Skeleton className="h-96 rounded-xl" />
          </div>
          <Skeleton className="h-full min-h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const renderGlobalDashboard = () => (
    <div className="space-y-6">
      {/* Row 1: Core Asset KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Assets"
          value={data.stats.totalAssets}
          icon={Package}
          color="indigo"
        />
        <StatCard
          title="Available"
          value={data.stats.assetStatusBreakdown?.AVAILABLE || 0}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Allocated"
          value={data.stats.assetStatusBreakdown?.ALLOCATED || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Under Maintenance"
          value={data.stats.assetStatusBreakdown?.UNDER_MAINTENANCE || 0}
          icon={Wrench}
          color="amber"
        />
      </div>

      {/* Row 2: Secondary KPIs & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Pending Maintenance"
              value={data.stats.pendingMaintenance}
              icon={AlertCircle}
              color="amber"
            />
            <StatCard
              title="Open Audits"
              value={data.stats.openAudits}
              icon={ShieldCheck}
              color="purple"
            />
            <StatCard
              title="Total Users"
              value={data.stats.totalUsers}
              icon={Users}
              color="zinc"
            />
          </div>
          
          {/* Recent Maintenance */}
          <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <Wrench className="w-5 h-5 mr-2 text-zinc-400" />
              Recent Maintenance Requests
            </h3>
            <div className="space-y-4">
              {data.activity.maintenance.length === 0 ? (
                <p className="text-zinc-500 text-sm">No recent maintenance requests.</p>
              ) : (
                data.activity.maintenance.map((req: any) => (
                  <div key={req.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
                    <div className="p-2 bg-zinc-800 rounded-lg shrink-0">
                      <Clock className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {req.asset.name}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Requested by {req.raisedBy.name} • {format(new Date(req.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Recent Allocations */}
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-zinc-400" />
            Recent Allocations
          </h3>
          <div className="space-y-4">
            {data.activity.allocations.length === 0 ? (
              <p className="text-zinc-500 text-sm">No recent allocations.</p>
            ) : (
              data.activity.allocations.map((alloc: any) => (
                <div key={alloc.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <p className="text-sm text-zinc-300">
                      <span className="font-medium text-white">{alloc.user.name}</span> received{' '}
                      <span className="font-medium text-zinc-400">{alloc.asset.name}</span>
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {format(new Date(alloc.allocatedAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonalDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          title="My Active Allocations"
          value={data.stats.activeAllocations}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="My Pending Maintenance"
          value={data.stats.pendingMaintenance}
          icon={AlertCircle}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-zinc-400" />
            My Recent Allocations
          </h3>
          <div className="space-y-4">
            {data.activity.allocations.length === 0 ? (
              <p className="text-zinc-500 text-sm">You have no recent allocations.</p>
            ) : (
              data.activity.allocations.map((alloc: any) => (
                <div key={alloc.id} className="flex items-start gap-4 p-3 rounded-lg bg-zinc-800/30">
                  <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                    <ArrowRightLeft className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{alloc.asset.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Allocated on {format(new Date(alloc.allocatedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <Wrench className="w-5 h-5 mr-2 text-zinc-400" />
            My Maintenance Requests
          </h3>
          <div className="space-y-4">
            {data.activity.maintenance.length === 0 ? (
              <p className="text-zinc-500 text-sm">You have no maintenance requests.</p>
            ) : (
              data.activity.maintenance.map((req: any) => (
                <div key={req.id} className="flex items-start gap-4 p-3 rounded-lg bg-zinc-800/30">
                  <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
                    <Wrench className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{req.asset.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {req.status} • {format(new Date(req.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, {user?.name}!</h1>
        <p className="text-zinc-400 text-sm mt-1">Here is a high-level overview of your workspace.</p>
      </div>

      {data.scope === 'GLOBAL' ? renderGlobalDashboard() : renderPersonalDashboard()}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-500/10 text-indigo-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    blue: 'bg-blue-500/10 text-blue-400',
    amber: 'bg-amber-500/10 text-amber-400',
    purple: 'bg-purple-500/10 text-purple-400',
    red: 'bg-red-500/10 text-red-400',
    zinc: 'bg-zinc-500/10 text-zinc-400',
  };

  const bgClass = colors[color] || colors.zinc;

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6 flex items-center hover:bg-zinc-800/50 transition-colors">
      <div className={`p-4 rounded-xl ${bgClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-zinc-400">{title}</p>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
};

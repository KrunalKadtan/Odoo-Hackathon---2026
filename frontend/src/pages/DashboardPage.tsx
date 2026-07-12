import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { api } from '../api/axios';
import {
  Package,
  CheckCircle,
  Users,
  AlertCircle,
  ShieldCheck,
  Wrench,
  Clock,
  ArrowRightLeft,
  CalendarDays,
  Activity,
  AlertTriangle,
  Plus,
  FileSearch
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '../components/ui/Skeleton';

interface DashboardData {
  scope: 'GLOBAL' | 'PERSONAL';
  stats: any;
  activity: {
    allocations: any[];
    maintenance: any[];
    overdue?: any[];
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
      <div className="animate-in fade-in space-y-4">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-80 mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-16 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <Skeleton className="lg:col-span-3 h-80 rounded-xl" />
          <Skeleton className="lg:col-span-2 h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const renderGlobalDashboard = () => {
    const pendingMaint = data.stats.pendingMaintenance ?? 0;
    const allocated = data.stats.assetStatusBreakdown?.ALLOCATED ?? 0;
    const available = data.stats.assetStatusBreakdown?.AVAILABLE ?? 0;
    const underMaintenance = data.stats.assetStatusBreakdown?.UNDER_MAINTENANCE ?? 0;
    const activebookings = data.stats.activeBookings ?? 0;
    const pendingTransfers = data.stats.pendingTransfers ?? 0;
    const overdueReturns = data.stats.overdueReturns ?? 0;

    return (
      <div className="space-y-5">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total Assets" value={data.stats.totalAssets ?? 0} icon={Package} accent="indigo" />
          <KpiCard label="Available" value={available} icon={CheckCircle} accent="emerald" />
          <KpiCard label="Allocated" value={allocated} icon={Users} accent="blue" />
          <KpiCard label="Overdue Returns" value={overdueReturns} icon={AlertTriangle} accent="red" />
          <KpiCard label="Active Bookings" value={activebookings} icon={CalendarDays} accent="purple" />
          <KpiCard label="Pending Transfers" value={pendingTransfers} icon={ArrowRightLeft} accent="amber" />
          <KpiCard label="Pending Maint." value={pendingMaint} icon={Wrench} accent="orange" />
          <KpiCard label="Open Audits" value={data.stats.openAudits ?? 0} icon={ShieldCheck} accent="violet" />
        </div>

        {overdueReturns > 0 && (
          <div className="flex items-center gap-4 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium flex-1">
              {overdueReturns} asset{overdueReturns > 1 ? 's are' : ' is'} overdue for return.
            </p>
            <a href="/allocations" className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-md hover:bg-red-500/20 transition-colors">
              View Allocations
            </a>
          </div>
        )}
        {pendingMaint > 0 && (
          <div className="flex items-center gap-4 px-5 py-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Wrench className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium flex-1">
              {pendingMaint} maintenance request{pendingMaint > 1 ? 's' : ''} pending
            </p>
            <a href="/maintenance" className="text-xs text-amber-500/70 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-md hover:bg-amber-500/20 transition-colors">
              Needs Attention
            </a>
          </div>
        )}
        {underMaintenance > 0 && (
          <div className="flex items-center gap-4 px-5 py-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Wrench className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{underMaintenance} asset{underMaintenance > 1 ? 's' : ''} currently under maintenance</p>
          </div>
        )}

        {/* Quick Actions Row */}
        <div className="flex flex-wrap gap-3">
          <QuickAction label="Register Asset" icon={Plus} href="/assets" />
          <QuickAction label="Book Resource" icon={CalendarDays} href="/bookings" />
          <QuickAction label="View Audits" icon={FileSearch} href="/audits" />
        </div>

        {/* Bottom Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Recent Maintenance */}
          <div className="lg:col-span-3 bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Wrench className="h-4 w-4 text-zinc-500" /> Recent Maintenance
            </h3>
            <div className="space-y-3">
              {data.activity.maintenance.length === 0 ? (
                <p className="text-zinc-600 text-sm py-4 text-center">No maintenance requests yet.</p>
              ) : data.activity.maintenance.map((req: any) => (
                <div key={req.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/40 transition-colors group">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Wrench className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{req.asset.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {req.raisedBy.name} · {format(new Date(req.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <StatusPill status={req.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Activity className="h-4 w-4 text-zinc-500" /> Recent Activity
            </h3>
            <div className="space-y-4">
              {data.activity.allocations.length === 0 ? (
                <p className="text-zinc-600 text-sm py-4 text-center">No recent allocations.</p>
              ) : data.activity.allocations.map((alloc: any) => (
                <div key={alloc.id} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 mt-2 rounded-full bg-indigo-500 shrink-0" />
                  <div>
                    <p className="text-sm text-zinc-300">
                      <span className="font-medium text-white">{alloc.user.name}</span>{' '}
                      received <span className="text-zinc-400">{alloc.asset.name}</span>
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      {format(new Date(alloc.allocatedAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPersonalDashboard = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="My Active Allocations" value={data.stats.activeAllocations ?? 0} icon={Package} accent="blue" />
        <KpiCard label="My Pending Maintenance" value={data.stats.pendingMaintenance ?? 0} icon={AlertCircle} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Package className="h-4 w-4 text-zinc-500" /> My Allocations
          </h3>
          <div className="space-y-3">
            {data.activity.allocations.length === 0 ? (
              <p className="text-zinc-600 text-sm py-4 text-center">You have no recent allocations.</p>
            ) : data.activity.allocations.map((alloc: any) => (
              <div key={alloc.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ArrowRightLeft className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{alloc.asset.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Allocated on {format(new Date(alloc.allocatedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Wrench className="h-4 w-4 text-zinc-500" /> My Maintenance
          </h3>
          <div className="space-y-3">
            {data.activity.maintenance.length === 0 ? (
              <p className="text-zinc-600 text-sm py-4 text-center">No maintenance requests.</p>
            ) : data.activity.maintenance.map((req: any) => (
              <div key={req.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Wrench className="h-4 w-4 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-200">{req.asset.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {format(new Date(req.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <StatusPill status={req.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Today's Overview
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Welcome back, <span className="text-indigo-400 font-medium">{user?.name}</span> · {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </div>

      {data.scope === 'GLOBAL' ? renderGlobalDashboard() : renderPersonalDashboard()}
    </div>
  );
};

const KpiCard = ({ label, value, icon: Icon, accent }: { label: string; value: number; icon: any; accent: string }) => {
  const accentMap: Record<string, string> = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    zinc: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  };
  const cls = accentMap[accent] || accentMap.zinc;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all duration-200 group">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
        <div className={`p-2 rounded-lg border ${cls}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    </div>
  );
};

const StatusPill = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    REQUESTED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    APPROVED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${map[status] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
      {status}
    </span>
  );
};

const QuickAction = ({ label, icon: Icon, href }: { label: string; icon: any; href: string }) => (
  <a
    href={href}
    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all duration-200"
  >
    <Icon className="h-4 w-4 text-indigo-400" />
    {label}
  </a>
);

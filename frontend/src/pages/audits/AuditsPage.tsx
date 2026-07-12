import { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { SlideOver } from '../../components/ui/SlideOver';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/auth.store';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, ChevronLeft, Plus, ClipboardList } from 'lucide-react';

interface AuditItem {
  id: string;
  status: string;
  asset: {
    id: string;
    name: string;
    serialNo: string | null;
    category: string;
    status: string;
    department: { name: string } | null;
  };
}

interface AuditCycle {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string | null;
  _count: { items: number };
  items: { status: string }[];
}

interface AuditCycleDetail extends Omit<AuditCycle, 'items'> {
  items: AuditItem[];
}

export const AuditsPage = () => {
  const [cycles, setCycles] = useState<AuditCycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<AuditCycleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCycleName, setNewCycleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const fetchCycles = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/audits');
      setCycles(res.data.data);
    } catch {
      toast.error('Failed to load audit cycles');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCycleDetail = async (id: string) => {
    setIsDetailLoading(true);
    try {
      const res = await api.get(`/audits/${id}`);
      setSelectedCycle(res.data.data);
    } catch {
      toast.error('Failed to load audit details');
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => { fetchCycles(); }, []);

  const handleMarkItem = async (itemId: string, status: 'VERIFIED' | 'MISSING') => {
    if (!selectedCycle) return;
    setActionLoadingId(itemId);
    try {
      await api.patch(`/audits/${selectedCycle.id}/items/${itemId}`, { status });
      toast.success(`Item marked as ${status.toLowerCase()}`);
      fetchCycleDetail(selectedCycle.id);
      fetchCycles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update item');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCloseCycle = async () => {
    if (!selectedCycle) return;
    setActionLoadingId('close');
    try {
      await api.patch(`/audits/${selectedCycle.id}/close`);
      toast.success('Audit cycle closed');
      setSelectedCycle(null);
      fetchCycles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to close cycle');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreate = async () => {
    if (!newCycleName.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post('/audits', { name: newCycleName });
      toast.success('Audit cycle created');
      setIsCreateOpen(false);
      setNewCycleName('');
      fetchCycles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create audit cycle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getItemStats = (items: { status: string }[]) => {
    const verified = items.filter(i => i.status === 'VERIFIED').length;
    const missing = items.filter(i => i.status === 'MISSING').length;
    const pending = items.filter(i => i.status === 'PENDING').length;
    return { verified, missing, pending };
  };

  // ─── Detail View ───────────────────────────────────────────────────────────
  if (selectedCycle) {
    const stats = getItemStats(selectedCycle.items);
    return (
      <div className="animate-in fade-in">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setSelectedCycle(null)}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Cycles
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{selectedCycle.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={selectedCycle.status} />
              <span className="text-zinc-500 text-sm">
                Started {new Date(selectedCycle.startDate).toLocaleDateString()}
                {selectedCycle.endDate && ` · Closed ${new Date(selectedCycle.endDate).toLocaleDateString()}`}
              </span>
            </div>
          </div>
          {isAdmin && selectedCycle.status === 'OPEN' && (
            <Button
              variant="danger"
              onClick={handleCloseCycle}
              isLoading={actionLoadingId === 'close'}
            >
              <XCircle className="h-4 w-4 mr-2" /> Close Cycle
            </Button>
          )}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Pending', value: stats.pending, color: 'text-zinc-400', bg: 'bg-zinc-800/50' },
            { label: 'Verified', value: stats.verified, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Missing', value: stats.missing, color: 'text-red-400', bg: 'bg-red-500/10' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border border-zinc-800 rounded-lg p-4`}>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {isDetailLoading ? (
          <div className="flex justify-center p-8"><span className="text-zinc-500">Loading items...</span></div>
        ) : (
          <div className="border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Asset</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Department</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                  {selectedCycle.status === 'OPEN' && (
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {selectedCycle.items.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-100">{item.asset.name}</div>
                      <div className="text-xs text-zinc-500">{item.asset.serialNo || 'No SN'}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{item.asset.category}</td>
                    <td className="px-4 py-3 text-zinc-400">{item.asset.department?.name || 'Global'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    {selectedCycle.status === 'OPEN' && (
                      <td className="px-4 py-3">
                        {item.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleMarkItem(item.id, 'VERIFIED')}
                              isLoading={actionLoadingId === item.id}
                              disabled={actionLoadingId !== null && actionLoadingId !== item.id}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verified
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleMarkItem(item.id, 'MISSING')}
                              disabled={actionLoadingId !== null && actionLoadingId !== item.id}
                            >
                              <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Missing
                            </Button>
                          </div>
                        )}
                        {item.status !== 'PENDING' && (
                          <span className="text-xs text-zinc-500 italic">Already marked</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {selectedCycle.items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ClipboardList className="h-10 w-10 text-zinc-700 mb-3" />
                <p className="text-zinc-500">No items in this audit cycle</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─── Cycles List View ───────────────────────────────────────────────────────
  return (
    <div className="animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Cycles</h1>
          <p className="text-zinc-400 text-sm mt-1">Verify assets and flag discrepancies across the organization.</p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Audit Cycle
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8"><span className="text-zinc-500">Loading...</span></div>
      ) : cycles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-zinc-800 rounded-lg">
          <ShieldCheck className="h-12 w-12 text-zinc-700 mb-4" />
          <p className="text-white font-medium">No audit cycles yet</p>
          <p className="text-zinc-500 text-sm mt-1">
            {isAdmin ? 'Create one to start tracking asset verification.' : 'No audit cycles have been created yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cycles.map((cycle) => {
            const stats = getItemStats(cycle.items);
            const total = cycle._count.items;
            const progress = total > 0 ? Math.round(((stats.verified + stats.missing) / total) * 100) : 0;

            return (
              <div
                key={cycle.id}
                onClick={() => fetchCycleDetail(cycle.id)}
                className="group border border-zinc-800 rounded-lg p-5 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-700 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0" />
                    <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">{cycle.name}</h3>
                    <StatusBadge status={cycle.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <span>Started {new Date(cycle.startDate).toLocaleDateString()}</span>
                    <span className="text-zinc-600">→</span>
                    <span className="text-indigo-400 group-hover:text-indigo-300 font-medium">View →</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-3">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex gap-6 text-xs text-zinc-500">
                  <span>{total} total</span>
                  <span className="text-emerald-400">{stats.verified} verified</span>
                  <span className="text-red-400">{stats.missing} missing</span>
                  <span>{stats.pending} pending</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Cycle SlideOver */}
      <SlideOver
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Audit Cycle"
        description="A new cycle will auto-populate all active and available assets as items to verify."
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">Cycle Name</label>
            <input
              type="text"
              value={newCycleName}
              onChange={(e) => setNewCycleName(e.target.value)}
              placeholder='e.g. "Q3 2026 Asset Audit"'
              className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
            <p className="text-sm text-indigo-300 font-medium mb-1">What happens when you create a cycle?</p>
            <p className="text-xs text-indigo-300/70">All assets with status AVAILABLE or ALLOCATED will be automatically added as items to this cycle for verification.</p>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={!newCycleName.trim()}
              isLoading={isSubmitting}
            >
              <ShieldCheck className="h-4 w-4 mr-1" /> Create Cycle
            </Button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { SlideOver } from '../../components/ui/SlideOver';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/auth.store';
import { CheckCircle2, XCircle, Wrench, PackageCheck, Plus, Clock, User } from 'lucide-react';

interface MaintenanceRequest {
  id: string;
  description: string;
  status: string;
  createdAt: string;
  asset: { id: string; name: string; serialNo: string | null; status: string };
  raisedBy: { id: string; name: string; department: { name: string } | null };
  approvedBy: { id: string; name: string } | null;
}

const COLUMNS: { status: string; label: string; color: string; headerColor: string }[] = [
  { status: 'REQUESTED',  label: 'Requested',  color: 'border-t-amber-500',  headerColor: 'text-amber-400 bg-amber-500/10' },
  { status: 'APPROVED',   label: 'Approved',   color: 'border-t-blue-500',   headerColor: 'text-blue-400 bg-blue-500/10' },
  { status: 'COMPLETED',  label: 'Completed',  color: 'border-t-emerald-500', headerColor: 'text-emerald-400 bg-emerald-500/10' },
  { status: 'REJECTED',   label: 'Rejected',   color: 'border-t-red-500',    headerColor: 'text-red-400 bg-red-500/10' },
];

export const MaintenancePage = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Raise Request slide-over
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [myAssets, setMyAssets] = useState<{ id: string; name: string; serialNo: string | null }[]>([]);
  const [newAssetId, setNewAssetId] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuthStore();
  const canManage = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/maintenance');
      setRequests(res.data.data);
    } catch {
      toast.error('Failed to load maintenance requests');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyAssets = async () => {
    try {
      const res = await api.get('/allocations?status=ACTIVE');
      const allocations = res.data.data as any[];
      setMyAssets(allocations.map((a: any) => a.asset));
    } catch {}
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'complete') => {
    setActionLoadingId(id);
    try {
      await api.patch(`/maintenance/${id}/${action}`);
      toast.success(`Request ${action}d successfully`);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreate = async () => {
    if (!newAssetId || newDescription.length < 10) return;
    setIsSubmitting(true);
    try {
      await api.post('/maintenance', { assetId: newAssetId, description: newDescription });
      toast.success('Maintenance request raised successfully');
      setIsCreateOpen(false);
      setNewAssetId('');
      setNewDescription('');
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateSlideOver = () => {
    fetchMyAssets();
    setIsCreateOpen(true);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Maintenance</h1>
          <p className="text-zinc-400 text-sm mt-1">Track asset repair requests and approvals.</p>
        </div>
        <Button variant="primary" onClick={openCreateSlideOver}>
          <Plus className="h-4 w-4 mr-2" /> Raise Request
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : (
        /* ── Kanban Board ──────────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map(col => {
            const cards = requests.filter(r => r.status === col.status);
            return (
              <div key={col.status} className={`bg-zinc-900/40 border border-zinc-800 border-t-2 ${col.color} rounded-xl flex flex-col min-h-[300px]`}>
                {/* Column Header */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-800">
                  <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${col.headerColor}`}>
                    {col.label}
                  </span>
                  <span className="text-xs text-zinc-600 font-medium">{cards.length}</span>
                </div>

                {/* Cards */}
                <div className="p-3 space-y-3 flex-1">
                  {cards.length === 0 ? (
                    <div className="flex items-center justify-center h-24 text-zinc-700 text-xs">
                      No requests
                    </div>
                  ) : cards.map(req => (
                    <div
                      key={req.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-all"
                    >
                      {/* Asset Name */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium text-zinc-100 leading-tight">{req.asset.name}</p>
                        <span className="text-[10px] text-zinc-600 shrink-0">
                          {req.asset.serialNo ? `#${req.asset.serialNo}` : ''}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{req.description}</p>

                      {/* Meta */}
                      <div className="flex items-center gap-3 text-[11px] text-zinc-600 mb-3">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {req.raisedBy.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Actions */}
                      {canManage && (
                        <div className="flex gap-1.5 flex-wrap">
                          {req.status === 'REQUESTED' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAction(req.id, 'approve')}
                                isLoading={actionLoadingId === req.id}
                                disabled={actionLoadingId !== null && actionLoadingId !== req.id}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleAction(req.id, 'reject')}
                                disabled={actionLoadingId !== null && actionLoadingId !== req.id}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          {req.status === 'APPROVED' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleAction(req.id, 'complete')}
                              isLoading={actionLoadingId === req.id}
                              disabled={actionLoadingId !== null && actionLoadingId !== req.id}
                            >
                              <PackageCheck className="h-3.5 w-3.5 mr-1" /> Complete
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Raise Maintenance Request SlideOver */}
      <SlideOver
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Raise Maintenance Request"
        description="Submit a repair or service request for one of your assets."
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">Asset</label>
            {myAssets.length === 0 ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <Wrench className="h-5 w-5 text-zinc-500 shrink-0" />
                <p className="text-sm text-zinc-400">You have no active asset allocations to request maintenance for.</p>
              </div>
            ) : (
              <select
                value={newAssetId}
                onChange={(e) => setNewAssetId(e.target.value)}
                className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select an asset...</option>
                {myAssets.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} {a.serialNo ? `(${a.serialNo})` : ''}</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">Description</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe the issue in detail (minimum 10 characters)..."
              rows={4}
              className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
            <p className="text-xs text-zinc-500">{newDescription.length} / 10 characters minimum</p>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={!newAssetId || newDescription.length < 10}
              isLoading={isSubmitting}
            >
              <Wrench className="h-4 w-4 mr-1" /> Submit Request
            </Button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
};

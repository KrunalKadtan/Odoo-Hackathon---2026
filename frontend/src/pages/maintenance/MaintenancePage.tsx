import { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { SlideOver } from '../../components/ui/SlideOver';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/auth.store';
import { CheckCircle2, XCircle, Wrench, PackageCheck, Plus } from 'lucide-react';

interface MaintenanceRequest {
  id: string;
  description: string;
  status: string;
  createdAt: string;
  asset: { id: string; name: string; serialNo: string | null; status: string };
  raisedBy: { id: string; name: string; department: { name: string } | null };
  approvedBy: { id: string; name: string } | null;
}

export const MaintenancePage = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

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
      // Get active allocations to find assets user can raise maintenance for
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

  const filtered = filterStatus === 'ALL' ? requests : requests.filter(r => r.status === filterStatus);

  const StatusFilter = (
    <div className="flex items-center gap-3">
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        <option value="ALL">All Status</option>
        <option value="REQUESTED">Requested</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
        <option value="COMPLETED">Completed</option>
      </select>
      <Button variant="primary" size="sm" onClick={openCreateSlideOver}>
        <Plus className="h-4 w-4 mr-1" /> Raise Request
      </Button>
    </div>
  );

  return (
    <div className="animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Maintenance</h1>
          <p className="text-zinc-400 text-sm mt-1">Track asset repair requests and approvals.</p>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : (
        <DataTable
          data={filtered}
          columns={[
            {
              header: 'Asset',
              accessor: (row) => (
                <div>
                  <div className="font-medium">{row.asset.name}</div>
                  <div className="text-xs text-zinc-500">{row.asset.serialNo || 'No SN'}</div>
                </div>
              ),
            },
            {
              header: 'Raised By',
              accessor: (row) => (
                <div>
                  <div className="font-medium">{row.raisedBy.name}</div>
                  <div className="text-xs text-zinc-500">{row.raisedBy.department?.name || 'Global'}</div>
                </div>
              ),
            },
            {
              header: 'Description',
              accessor: (row) => (
                <span className="text-sm text-zinc-300 line-clamp-2 max-w-xs">{row.description}</span>
              ),
            },
            {
              header: 'Date',
              accessor: (row) => new Date(row.createdAt).toLocaleDateString(),
            },
            {
              header: 'Status',
              accessor: (row) => <StatusBadge status={row.status} />,
            },
            ...(canManage ? [{
              header: 'Actions',
              accessor: (row: MaintenanceRequest) => (
                <div className="flex gap-2 flex-wrap">
                  {row.status === 'REQUESTED' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAction(row.id, 'approve')}
                        isLoading={actionLoadingId === row.id}
                        disabled={actionLoadingId !== null && actionLoadingId !== row.id}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleAction(row.id, 'reject')}
                        disabled={actionLoadingId !== null && actionLoadingId !== row.id}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  {row.status === 'APPROVED' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAction(row.id, 'complete')}
                      isLoading={actionLoadingId === row.id}
                      disabled={actionLoadingId !== null && actionLoadingId !== row.id}
                    >
                      <PackageCheck className="h-4 w-4 mr-1" /> Complete
                    </Button>
                  )}
                </div>
              ),
            }] : []),
          ]}
          filterComponent={StatusFilter}
        />
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

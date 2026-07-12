import { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { useAuthStore } from '../../store/auth.store';
import { Undo2, CheckCircle2 } from 'lucide-react';
import { SlideOver } from '../../components/ui/SlideOver';

interface Allocation {
  id: string;
  status: string;
  allocatedAt: string;
  returnedAt: string | null;
  asset: { id: string; name: string; serialNo: string | null };
  user: { id: string; name: string; department: { name: string } | null };
}

export const AllocationsPage = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ACTIVE');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  
  // Transfer Slideover State
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [allUsers, setAllUsers] = useState<{id: string, name: string}[]>([]);
  const [newUserId, setNewUserId] = useState('');

  const { user } = useAuthStore();
  const canManageAllocations = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';

  const fetchAllocations = async () => {
    setIsLoading(true);
    try {
      const query = filterStatus !== 'ALL' ? `?status=${filterStatus}` : '';
      const res = await api.get(`/allocations${query}`);
      setAllocations(res.data.data);
    } catch (error) {
      toast.error('Failed to load allocations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setAllUsers(res.data.data);
    } catch (error) {}
  };

  useEffect(() => {
    fetchAllocations();
  }, [filterStatus]);

  const handleReturn = async (id: string) => {
    setActionLoadingId(id);
    try {
      await api.patch(`/allocations/${id}/return`);
      toast.success('Asset returned successfully');
      fetchAllocations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to return asset');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openTransferModal = (allocation: Allocation) => {
    setSelectedAllocation(allocation);
    setNewUserId('');
    if (allUsers.length === 0) fetchUsers();
    setIsTransferOpen(true);
  };

  const handleApproveTransfer = async () => {
    if (!selectedAllocation || !newUserId) return;
    setActionLoadingId(selectedAllocation.id);
    try {
      await api.patch(`/allocations/${selectedAllocation.id}/approve-transfer`, { newUserId });
      toast.success('Transfer approved successfully');
      setIsTransferOpen(false);
      fetchAllocations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve transfer');
    } finally {
      setActionLoadingId(null);
    }
  };

  const StatusFilter = (
    <select
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
      className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
    >
      <option value="ALL">All Status</option>
      <option value="ACTIVE">Active</option>
      <option value="TRANSFER_PENDING">Transfer Pending</option>
      <option value="RETURNED">Returned</option>
    </select>
  );

  return (
    <div className="animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Allocations</h1>
          <p className="text-zinc-400 text-sm mt-1">Track and manage asset assignments across the organization.</p>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : (
        <DataTable
          data={allocations}
          columns={[
            { header: 'Asset', accessor: (row) => (
              <div>
                <div className="font-medium">{row.asset.name}</div>
                <div className="text-xs text-zinc-500">{row.asset.serialNo || 'No SN'}</div>
              </div>
            )},
            { header: 'Assigned To', accessor: (row) => (
              <div>
                <div className="font-medium">{row.user.name}</div>
                <div className="text-xs text-zinc-500">{row.user.department?.name || 'Global'}</div>
              </div>
            ) },
            { header: 'Date', accessor: (row) => new Date(row.allocatedAt).toLocaleDateString() },
            { header: 'Status', accessor: (row) => <StatusBadge status={row.status} /> },
            ...(canManageAllocations ? [{ 
              header: 'Actions', 
              accessor: (row: Allocation) => (
                <div className="flex gap-2">
                  {(row.status === 'ACTIVE' || row.status === 'TRANSFER_PENDING') && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleReturn(row.id)}
                      isLoading={actionLoadingId === row.id}
                      disabled={actionLoadingId !== null && actionLoadingId !== row.id}
                    >
                      <Undo2 className="h-4 w-4 mr-1" /> Return
                    </Button>
                  )}
                  {row.status === 'TRANSFER_PENDING' && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => openTransferModal(row)}
                      disabled={actionLoadingId !== null}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Transfer
                    </Button>
                  )}
                </div>
              )
            }] : []),
          ]}
          filterComponent={StatusFilter}
        />
      )}

      <SlideOver
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title="Approve Transfer"
        description="Select the new user for this asset."
      >
        {selectedAllocation && (
          <div className="space-y-6">
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Asset</span>
                <span className="text-sm text-zinc-200">{selectedAllocation.asset.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Current Holder</span>
                <span className="text-sm text-zinc-200">{selectedAllocation.user.name}</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-zinc-300">
                New Assignee
              </label>
              <select
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select Employee...</option>
                {allUsers.filter(u => u.id !== selectedAllocation.user.id).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsTransferOpen(false)}>Cancel</Button>
              <Button onClick={handleApproveTransfer} disabled={!newUserId} isLoading={actionLoadingId === selectedAllocation.id}>
                Approve Transfer
              </Button>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
};

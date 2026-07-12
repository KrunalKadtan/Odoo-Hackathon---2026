import { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { DateTimePicker } from '../../components/ui/DateTimePicker';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { useAuthStore } from '../../store/auth.store';
import { Undo2, CheckCircle2, Plus } from 'lucide-react';
import { SlideOver } from '../../components/ui/SlideOver';

interface Allocation {
  id: string;
  status: string;
  allocatedAt: string;
  expectedReturnDate: string | null;
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

  // Create Slideover State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<{id: string, name: string}[]>([]);
  const [newAllocationAssetId, setNewAllocationAssetId] = useState('');
  const [newAllocationUserId, setNewAllocationUserId] = useState('');
  const [newAllocationExpectedReturnDate, setNewAllocationExpectedReturnDate] = useState<Date | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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

  const fetchAvailableAssets = async () => {
    try {
      const res = await api.get('/assets?status=AVAILABLE');
      setAvailableAssets(res.data.data);
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

  const openCreateModal = () => {
    setNewAllocationAssetId('');
    setNewAllocationUserId('');
    setNewAllocationExpectedReturnDate(null);
    if (allUsers.length === 0) fetchUsers();
    fetchAvailableAssets();
    setIsCreateOpen(true);
  };

  const handleCreateAllocation = async () => {
    if (!newAllocationAssetId || !newAllocationUserId) return;
    setIsCreating(true);
    try {
      await api.post('/allocations', { 
        assetId: newAllocationAssetId, 
        userId: newAllocationUserId,
        expectedReturnDate: newAllocationExpectedReturnDate?.toISOString()
      });
      toast.success('Asset allocated successfully');
      setIsCreateOpen(false);
      fetchAllocations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to allocate asset');
    } finally {
      setIsCreating(false);
    }
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

  const STATUS_PILLS = [
    { value: 'ALL',              label: 'All' },
    { value: 'ACTIVE',           label: 'Active',           color: 'emerald' },
    { value: 'TRANSFER_PENDING', label: 'Transfer Pending', color: 'amber' },
    { value: 'RETURNED',         label: 'Returned',         color: 'violet' },
  ];

  const pillClass = (val: string, color?: string) => {
    if (filterStatus !== val) return 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700';
    const map: Record<string, string> = {
      emerald: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
      amber:   'bg-amber-500/15 border-amber-500/40 text-amber-400',
      violet: 'bg-violet-500/15 border-violet-500/40 text-violet-400',
    };
    return color ? map[color] : 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400';
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Allocations</h1>
          <p className="text-zinc-400 text-sm mt-1">Track and manage asset assignments across the organization.</p>
        </div>
        {canManageAllocations && (
          <Button variant="primary" onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" /> Allocate Asset
          </Button>
        )}
      </div>

      {/* Pill filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_PILLS.map(p => (
          <button
            key={p.value}
            onClick={() => setFilterStatus(p.value)}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 ${pillClass(p.value, p.color)}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : (
        <DataTable
          data={allocations}
          searchFn={(row, term) => {
            const t = term.toLowerCase();
            return (
              row.asset.name.toLowerCase().includes(t) ||
              row.user.name.toLowerCase().includes(t)
            );
          }}
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
            { header: 'Expected Return', accessor: (row) => {
              if (!row.expectedReturnDate) return <span className="text-zinc-600">-</span>;
              const isOverdue = new Date(row.expectedReturnDate) < new Date() && row.status === 'ACTIVE';
              return (
                <div className="flex flex-col">
                  <span className={isOverdue ? 'text-red-400 font-medium' : 'text-zinc-300'}>
                    {new Date(row.expectedReturnDate).toLocaleDateString()}
                  </span>
                  {isOverdue && <span className="text-[10px] text-red-500 uppercase tracking-wider font-bold">Overdue</span>}
                </div>
              );
            }},
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

      {/* Create Allocation SlideOver */}
      <SlideOver
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Allocate Asset"
        description="Assign an available asset to an employee."
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-zinc-300">
              Select Asset
            </label>
            <select
              value={newAllocationAssetId}
              onChange={(e) => setNewAllocationAssetId(e.target.value)}
              className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select Available Asset...</option>
              {availableAssets.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-zinc-300">
              Assign To Employee
            </label>
            <select
              value={newAllocationUserId}
              onChange={(e) => setNewAllocationUserId(e.target.value)}
              className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select Employee...</option>
              {allUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <DateTimePicker
            label="Expected Return Date (Optional)"
            selected={newAllocationExpectedReturnDate}
            onChange={setNewAllocationExpectedReturnDate}
            placeholderText="Select return date"
          />

          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateAllocation} disabled={!newAllocationAssetId || !newAllocationUserId} isLoading={isCreating}>
              Allocate Asset
            </Button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
};

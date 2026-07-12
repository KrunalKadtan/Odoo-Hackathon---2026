import { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { toast } from 'react-hot-toast';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SlideOver } from '../../components/ui/SlideOver';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Plus, CheckCircle2, ArrowRightLeft } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

interface Allocation {
  id: string;
  status: string;
  user: { id: string, name: string };
}

interface Asset {
  id: string;
  name: string;
  category: string;
  status: string;
  serialNo: string | null;
  department: { name: string } | null;
  allocations?: Allocation[];
}

export const AssetsPage = () => {
  const { user } = useAuthStore();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  const [isSlideOpen, setIsSlideOpen] = useState(false);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    serialNo: '',
    departmentId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail SlideOver State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<{id: string, name: string}[]>([]);
  const [allocateUserId, setAllocateUserId] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const canManageAssets = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';

  useEffect(() => {
    fetchAssets();
    if (canManageAssets) {
      fetchDepartments();
    }
  }, [filterStatus]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const url = filterStatus ? `/assets?status=${filterStatus}` : '/assets';
      const res = await api.get(url);
      setAssets(res.data.data);
    } catch (error) {
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data);
    } catch (error) {}
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setAllUsers(res.data.data);
    } catch (error) {}
  };

  const handleRowClick = async (row: Asset) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    setSelectedAsset(null); // Clear previous
    if (canManageAssets && allUsers.length === 0) {
      fetchUsers();
    }
    try {
      const res = await api.get(`/assets/${row.id}`);
      setSelectedAsset(res.data.data);
    } catch (error) {
      toast.error('Failed to load asset details');
      setIsDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/assets', {
        ...formData,
        departmentId: formData.departmentId || undefined,
        serialNo: formData.serialNo || undefined
      });
      toast.success('Asset registered successfully');
      setIsSlideOpen(false);
      setFormData({ name: '', category: '', serialNo: '', departmentId: '' });
      fetchAssets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to register asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAllocate = async () => {
    if (!selectedAsset || !allocateUserId) return;
    setIsActionLoading(true);
    try {
      await api.post('/allocations', { assetId: selectedAsset.id, userId: allocateUserId });
      toast.success('Asset allocated successfully');
      setAllocateUserId('');
      fetchAssets();
      handleRowClick(selectedAsset); // Refresh details
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to allocate asset');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRequestTransfer = async () => {
    if (!selectedAsset) return;
    const activeAllocation = selectedAsset.allocations?.find(a => a.status === 'ACTIVE');
    if (!activeAllocation) return;

    setIsActionLoading(true);
    try {
      await api.post(`/allocations/${activeAllocation.id}/request-transfer`);
      toast.success('Transfer requested successfully');
      fetchAssets();
      handleRowClick(selectedAsset);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request transfer');
    } finally {
      setIsActionLoading(false);
    }
  };

  const StatusFilter = (
    <select
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
      className="bg-zinc-900 border border-zinc-800 text-sm rounded-md px-3 py-2 text-zinc-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-10"
    >
      <option value="">All Statuses</option>
      <option value="AVAILABLE">Available</option>
      <option value="ALLOCATED">Allocated</option>
      <option value="UNDER_MAINTENANCE">Under Maintenance</option>
      <option value="LOST">Lost</option>
    </select>
  );

  return (
    <div className="animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Asset Directory</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage and track company assets globally.</p>
        </div>
        {canManageAssets && (
          <Button onClick={() => setIsSlideOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Register Asset
          </Button>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <DataTable
          data={assets}
          columns={[
            { header: 'Asset Name', accessor: 'name' },
            { header: 'Category', accessor: 'category' },
            { header: 'Serial No', accessor: (row) => row.serialNo || <span className="text-zinc-600">-</span> },
            { header: 'Department', accessor: (row) => row.department?.name || <span className="text-zinc-600">Global</span> },
            { header: 'Status', accessor: (row) => <StatusBadge status={row.status} /> },
          ]}
          searchField="name"
          filterComponent={StatusFilter}
          onRowClick={handleRowClick}
        />
      )}

      <SlideOver
        isOpen={isSlideOpen}
        onClose={() => setIsSlideOpen(false)}
        title="Register New Asset"
        description="Enter the details of the new physical or digital asset."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Asset Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="MacBook Pro 16''"
          />
          <Input
            label="Category"
            required
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            placeholder="Electronics"
          />
          <Input
            label="Serial Number (Optional)"
            value={formData.serialNo}
            onChange={(e) => setFormData({...formData, serialNo: e.target.value})}
            placeholder="C02XW... "
          />
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Assign to Department (Optional)
            </label>
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
              className="block w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Global / Unassigned</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsSlideOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Register
            </Button>
          </div>
        </form>
      </SlideOver>
      <SlideOver
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Asset Details"
        description="View and manage asset status and allocations."
      >
        {detailLoading ? (
          <div className="flex justify-center p-8"><span className="text-zinc-500">Loading details...</span></div>
        ) : selectedAsset ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">{selectedAsset.name}</h3>
              <p className="text-sm text-zinc-400">SN: {selectedAsset.serialNo || 'N/A'} • {selectedAsset.category}</p>
            </div>

            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Status</span>
                <StatusBadge status={selectedAsset.status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Department</span>
                <span className="text-sm text-zinc-200">{selectedAsset.department?.name || 'Global'}</span>
              </div>
            </div>

            {selectedAsset.status === 'AVAILABLE' && canManageAssets && (
              <div className="pt-4 border-t border-zinc-800 space-y-4">
                <h4 className="text-sm font-medium text-white">Allocate Asset</h4>
                <div className="flex gap-2">
                  <select
                    value={allocateUserId}
                    onChange={(e) => setAllocateUserId(e.target.value)}
                    className="flex-1 rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Select Employee...</option>
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <Button onClick={handleAllocate} isLoading={isActionLoading} disabled={!allocateUserId}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Allocate
                  </Button>
                </div>
              </div>
            )}

            {selectedAsset.status === 'ALLOCATED' && selectedAsset.allocations?.some(a => a.status === 'ACTIVE') && (
              <div className="pt-4 border-t border-zinc-800 space-y-4">
                <h4 className="text-sm font-medium text-white">Current Holder</h4>
                {selectedAsset.allocations?.filter(a => a.status === 'ACTIVE').map(allocation => (
                  <div key={allocation.id} className="flex justify-between items-center bg-zinc-900 p-3 rounded-md border border-zinc-800">
                    <span className="text-sm text-zinc-200">{allocation.user.name}</span>
                    <Button variant="ghost" size="sm" onClick={handleRequestTransfer} isLoading={isActionLoading}>
                      <ArrowRightLeft className="h-4 w-4 mr-2" /> Request Transfer
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {selectedAsset.status === 'ALLOCATED' && selectedAsset.allocations?.some(a => a.status === 'TRANSFER_PENDING') && (
               <div className="mt-4 p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm">
                 A transfer request is currently pending for this asset.
               </div>
            )}

          </div>
        ) : (
          <div className="text-zinc-500">Asset not found.</div>
        )}
      </SlideOver>
    </div>
  );
};

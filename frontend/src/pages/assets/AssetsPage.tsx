import { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { toast } from 'react-hot-toast';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SlideOver } from '../../components/ui/SlideOver';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Plus } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

interface Asset {
  id: string;
  name: string;
  category: string;
  status: string;
  serialNo: string | null;
  department: { name: string } | null;
}

export const AssetsPage = () => {
  const { user } = useAuthStore();
  const [assets, setAssets] = useState<Asset[]>([]);
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

  const canManageAssets = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';

  useEffect(() => {
    fetchAssets();
    if (canManageAssets) {
      fetchDepartments();
    }
  }, [filterStatus]);

  const fetchAssets = async () => {
    try {
      const url = filterStatus ? `/assets?status=${filterStatus}` : '/assets';
      const res = await api.get(url);
      setAssets(res.data.data);
    } catch (error) {
      toast.error('Failed to load assets');
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data);
    } catch (error) {}
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
      />

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
    </div>
  );
};

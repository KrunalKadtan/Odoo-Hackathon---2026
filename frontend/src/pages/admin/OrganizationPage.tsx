import { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { toast } from 'react-hot-toast';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SlideOver } from '../../components/ui/SlideOver';
import { Plus } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  head: { name: string; email: string } | null;
  _count: { members: number; assets: number };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: { id: string; name: string } | null;
}

export const OrganizationPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isDeptSlideOpen, setIsDeptSlideOpen] = useState(false);
  
  // Edit User State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserRole, setEditUserRole] = useState('');
  const [editUserDept, setEditUserDept] = useState('');
  const [isUserSubmitting, setIsUserSubmitting] = useState(false);

  // Department Form
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptHead, setNewDeptHead] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptRes, userRes] = await Promise.all([
        api.get('/departments'),
        api.get('/users')
      ]);
      setDepartments(deptRes.data.data);
      setUsers(userRes.data.data);
    } catch (error) {
      toast.error('Failed to load organization data');
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName) return;

    setIsSubmitting(true);
    try {
      await api.post('/departments', {
        name: newDeptName,
        headId: newDeptHead || undefined
      });
      toast.success('Department created');
      setIsDeptSlideOpen(false);
      setNewDeptName('');
      setNewDeptHead('');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUserClick = (user: User) => {
    setEditingUserId(user.id);
    setEditUserRole(user.role);
    setEditUserDept(user.department?.id || '');
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
  };

  const handleUpdateUser = async (userId: string) => {
    setIsUserSubmitting(true);
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      if (editUserRole !== user.role) {
        await api.patch(`/users/${userId}/role`, { role: editUserRole });
      }
      if (editUserDept !== (user.department?.id || '')) {
        await api.patch(`/users/${userId}/department`, { departmentId: editUserDept || null });
      }
      toast.success('User updated successfully');
      setEditingUserId(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setIsUserSubmitting(false);
    }
  };

  const handleUpdateHead = async (deptId: string, headId: string) => {
    try {
      await api.patch(`/departments/${deptId}`, { headId: headId || null });
      toast.success('Department head updated');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update department head');
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in">
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Departments</h1>
            <p className="text-zinc-400 text-sm mt-1">Manage organizational units and department heads.</p>
          </div>
          <Button onClick={() => setIsDeptSlideOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Department
          </Button>
        </div>
        
        <DataTable
          data={departments}
          columns={[
            { header: 'Department', accessor: 'name' },
            { 
              header: 'Head', 
              accessor: (row) => (
                <select
                  value={row.head?.email ? users.find(u => u.email === row.head?.email)?.id || '' : ''}
                  onChange={(e) => handleUpdateHead(row.id, e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 text-sm rounded-md px-2 py-1 text-zinc-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {users.filter(u => ['DEPT_HEAD', 'ADMIN'].includes(u.role)).map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              )
            },
            { header: 'Members', accessor: (row) => row._count.members },
            { header: 'Assets', accessor: (row) => row._count.assets },
          ]}
          searchField="name"
        />
      </div>

      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage employee roles and access permissions.</p>
        </div>
        
        <DataTable
          data={users}
          columns={[
            { header: 'Name', accessor: 'name' },
            { header: 'Email', accessor: 'email' },
            { 
              header: 'Department', 
              accessor: (row) => editingUserId === row.id ? (
                <select
                  value={editUserDept}
                  onChange={(e) => setEditUserDept(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 text-sm rounded-md px-2 py-1 text-zinc-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 max-w-[150px]"
                >
                  <option value="">-</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              ) : (row.department?.name || '-')
            },
            { 
              header: 'Role', 
              accessor: (row) => editingUserId === row.id ? (
                <select
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 text-sm rounded-md px-2 py-1 text-zinc-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="DEPT_HEAD">Dept Head</option>
                  <option value="ASSET_MANAGER">Asset Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              ) : row.role.replace('_', ' ') 
            },
            {
              header: 'Actions',
              accessor: (row) => editingUserId === row.id ? (
                <div className="flex gap-2">
                  <Button variant="primary" onClick={() => handleUpdateUser(row.id)} size="sm" isLoading={isUserSubmitting} className="h-8 text-xs px-3">
                    Save
                  </Button>
                  <Button variant="ghost" onClick={handleCancelEdit} size="sm" disabled={isUserSubmitting} className="h-8 text-xs px-3">
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="secondary" onClick={() => handleEditUserClick(row)} size="sm" className="border-zinc-700 hover:bg-zinc-700 h-8 text-xs px-3">
                  Edit
                </Button>
              )
            }
          ]}
          searchField="name"
        />
      </div>

      <SlideOver
        isOpen={isDeptSlideOpen}
        onClose={() => setIsDeptSlideOpen(false)}
        title="Create Department"
        description="Add a new department to the organization."
      >
        <form onSubmit={handleCreateDepartment} className="space-y-5">
          <Input
            label="Department Name"
            required
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            placeholder="e.g. Engineering"
          />
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Department Head (Optional)
            </label>
            <select
              value={newDeptHead}
              onChange={(e) => setNewDeptHead(e.target.value)}
              className="block w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select a user...</option>
              {users.filter(u => ['DEPT_HEAD', 'ADMIN'].includes(u.role)).map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsDeptSlideOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Create
            </Button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
};

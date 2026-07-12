import { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/auth.store';
import { Plus, XCircle } from 'lucide-react';
import { SlideOver } from '../../components/ui/SlideOver';
import { Input } from '../../components/ui/Input';
import { TableSkeleton } from '../../components/ui/Skeleton';

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  resource: { id: string; name: string; category: string };
  user: { id: string; name: string };
}

export const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create Slideover State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [bookableAssets, setBookableAssets] = useState<{id: string, name: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    resourceId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00'
  });

  const { user } = useAuthStore();

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // By default, fetch all active bookings
      const res = await api.get('/bookings');
      setBookings(res.data.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookableAssets = async () => {
    try {
      const res = await api.get('/assets');
      // Filter assets that are available and of category 'Room' or 'Resource'
      const assets = res.data.data.filter((a: any) => 
        a.status === 'AVAILABLE' && 
        (a.category.toLowerCase().includes('room') || a.category.toLowerCase().includes('resource'))
      );
      setBookableAssets(assets);
    } catch (error) {}
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.resourceId) return toast.error('Please select a resource');
    
    // Combine date and time
    const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`).toISOString();
    const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`).toISOString();
    
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      return toast.error('End time must be after start time');
    }

    setIsSubmitting(true);
    try {
      await api.post('/bookings', {
        resourceId: formData.resourceId,
        userId: user?.id,
        startTime: startDateTime,
        endTime: endDateTime
      });
      toast.success('Booking created successfully');
      setIsCreateOpen(false);
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create booking (time slot may be taken)');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    if (bookableAssets.length === 0) fetchBookableAssets();
    setIsCreateOpen(true);
  };

  return (
    <div className="animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="text-zinc-400 text-sm mt-1">Schedule meeting rooms and shared resources.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> New Booking
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : (
        <DataTable
          data={bookings}
          columns={[
            { header: 'Resource', accessor: (row) => (
              <div>
                <div className="font-medium">{row.resource.name}</div>
                <div className="text-xs text-zinc-500">{row.resource.category}</div>
              </div>
            )},
            { header: 'Booked By', accessor: (row) => row.user.name },
            { header: 'Start', accessor: (row) => new Date(row.startTime).toLocaleString() },
            { header: 'End', accessor: (row) => new Date(row.endTime).toLocaleString() },
            { header: 'Status', accessor: (row) => <StatusBadge status={row.status} /> },
            { 
              header: 'Actions', 
              accessor: (row: Booking) => (
                <div className="flex gap-2">
                  {(row.user.id === user?.id || user?.role === 'ADMIN') && row.status === 'CONFIRMED' && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleCancel(row.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                  )}
                </div>
              )
            },
          ]}
        />
      )}

      <SlideOver
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Booking"
        description="Select a resource and time slot to book."
      >
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Resource
              </label>
              <select
                required
                value={formData.resourceId}
                onChange={(e) => setFormData(prev => ({ ...prev, resourceId: e.target.value }))}
                className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select Resource...</option>
                {bookableAssets.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              {bookableAssets.length === 0 && (
                <p className="mt-1 text-xs text-zinc-500">No bookable resources available.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Date
              </label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Start Time
                </label>
                <Input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  End Time
                </label>
                <Input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Confirm Booking
            </Button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
};

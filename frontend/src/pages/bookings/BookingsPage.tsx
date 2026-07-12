import { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/auth.store';
import { Plus, XCircle, CalendarDays, Clock, User } from 'lucide-react';
import { SlideOver } from '../../components/ui/SlideOver';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { DateTimePicker } from '../../components/ui/DateTimePicker';

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  resource: { id: string; name: string; category: string };
  user: { id: string; name: string };
}

// Hour range displayed on the timeline (9am – 7pm)
const HOURS = Array.from({ length: 11 }, (_, i) => i + 9);

const COLOR_POOL = [
  'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
  'bg-purple-500/20 border-purple-500/40 text-purple-300',
  'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
  'bg-pink-500/20 border-pink-500/40 text-pink-300',
  'bg-amber-500/20 border-amber-500/40 text-amber-300',
];

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewDate, setViewDate] = useState<Date>(today());
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  // Create Slideover State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [bookableAssets, setBookableAssets] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedResource, setSelectedResource] = useState('');
  const [startDateTime, setStartDateTime] = useState<Date | null>(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [endDateTime, setEndDateTime] = useState<Date | null>(() => {
    const d = new Date();
    d.setHours(10, 0, 0, 0);
    return d;
  });

  const { user } = useAuthStore();

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookableAssets = async () => {
    try {
      const res = await api.get('/assets?status=AVAILABLE');
      setBookableAssets(res.data.data);
    } catch {}
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id: string) => {
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return toast.error('Please select a resource');
    if (!startDateTime || !endDateTime) return toast.error('Please select start and end times');
    if (endDateTime <= startDateTime) return toast.error('End time must be after start time');

    setIsSubmitting(true);
    try {
      await api.post('/bookings', {
        resourceId: selectedResource,
        userId: user?.id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });
      toast.success('Booking created successfully');
      setIsCreateOpen(false);
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Time slot may already be taken');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    if (bookableAssets.length === 0) fetchBookableAssets();
    setIsCreateOpen(true);
  };

  // Filter bookings for selected timeline date
  const viewDateStr = viewDate.toISOString().split('T')[0];
  const dayBookings = bookings.filter(b => {
    const d = new Date(b.startTime).toISOString().split('T')[0];
    return d === viewDateStr;
  });

  // Unique resources in all bookings
  const resources = Array.from(new Set(bookings.map(b => b.resource.id))).map(rid => {
    const b = bookings.find(b => b.resource.id === rid)!;
    return { id: rid, name: b.resource.name, category: b.resource.category };
  });

  const getPosition = (booking: Booking) => {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const startH = start.getHours() + start.getMinutes() / 60;
    const endH = end.getHours() + end.getMinutes() / 60;
    const gridStart = 9;
    const gridEnd = 20;
    const totalHours = gridEnd - gridStart;
    const left = Math.max(0, ((startH - gridStart) / totalHours) * 100);
    const width = Math.min(100 - left, ((endH - startH) / totalHours) * 100);
    return { left: `${left}%`, width: `${Math.max(width, 2)}%` };
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Resource Bookings</h1>
          <p className="text-zinc-400 text-sm mt-1">Schedule meeting rooms and shared resources.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle view */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1 gap-1">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'timeline' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              List
            </button>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" /> New Booking
          </Button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : viewMode === 'timeline' ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          {/* Date navigation using the DateTimePicker */}
          <div className="flex items-center gap-4 px-5 py-4 border-b border-zinc-800">
            <div className="w-52">
              <DateTimePicker
                selected={viewDate}
                onChange={(d) => d && setViewDate(d)}
                placeholderText="Select date"
                dateFormat="EEE, MMM d, yyyy"
              />
            </div>
            <span className="text-zinc-500 text-sm">{dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''} this day</span>
          </div>

          {/* Timeline grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[700px] p-4">
              {/* Hour labels */}
              <div className="flex mb-2 ml-36">
                {HOURS.map(h => (
                  <div key={h} className="flex-1 text-xs text-zinc-600 text-center">
                    {h === 12 ? '12pm' : h < 12 ? `${h}am` : `${h - 12}pm`}
                  </div>
                ))}
              </div>

              {/* Resource rows */}
              {resources.length === 0 ? (
                <div className="text-center py-16 text-zinc-600 text-sm">No bookings yet. Create one to see the timeline.</div>
              ) : resources.map((res, rIdx) => {
                const resBookings = dayBookings.filter(b => b.resource.id === res.id);
                return (
                  <div key={res.id} className="flex items-center mb-3">
                    <div className="w-36 shrink-0 pr-3">
                      <p className="text-xs font-medium text-zinc-300 truncate">{res.name}</p>
                      <p className="text-[10px] text-zinc-600 truncate">{res.category}</p>
                    </div>
                    <div className="flex-1 relative h-10 bg-zinc-800/30 rounded-lg border border-zinc-800">
                      <div className="absolute inset-0 flex">
                        {HOURS.map(h => (
                          <div key={h} className="flex-1 border-r border-zinc-800/50 last:border-r-0" />
                        ))}
                      </div>
                      {resBookings.map((b, bIdx) => {
                        const pos = getPosition(b);
                        const colorCls = COLOR_POOL[(rIdx + bIdx) % COLOR_POOL.length];
                        return (
                          <div
                            key={b.id}
                            className={`absolute top-1 bottom-1 rounded border ${colorCls} px-2 flex items-center text-[10px] font-medium overflow-hidden group/block cursor-default`}
                            style={pos}
                            title={`${b.user.name} · ${new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          >
                            <span className="truncate">{b.user.name}</span>
                            {(b.user.id === user?.id || user?.role === 'ADMIN') && b.status === 'CONFIRMED' && (
                              <button onClick={() => handleCancel(b.id)} className="ml-auto shrink-0 opacity-0 group-hover/block:opacity-100 transition-opacity">
                                <XCircle className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <div className="text-center py-20 text-zinc-600 border border-zinc-800 rounded-xl">No bookings found.</div>
          ) : bookings.map(b => (
            <div key={b.id} className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all">
              <div className="p-3 bg-indigo-500/10 rounded-lg">
                <CalendarDays className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{b.resource.name}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" />{b.user.name}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(b.startTime).toLocaleDateString()} · {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <StatusBadge status={b.status} />
              {(b.user.id === user?.id || user?.role === 'ADMIN') && b.status === 'CONFIRMED' && (
                <Button variant="secondary" size="sm" onClick={() => handleCancel(b.id)}>
                  <XCircle className="h-4 w-4 mr-1" /> Cancel
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── New Booking SlideOver ─────────────────────────────────── */}
      <SlideOver
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Booking"
        description="Pick a resource and a time window — we'll check availability automatically."
      >
        <form onSubmit={handleCreate} className="space-y-5">

          {/* Resource */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Resource</label>
            <select
              required
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none [color-scheme:dark]"
            >
              <option value="">Select Resource...</option>
              {bookableAssets.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            {bookableAssets.length === 0 && (
              <p className="mt-1.5 text-xs text-zinc-500">No available resources found.</p>
            )}
          </div>

          {/* Start DateTime */}
          <DateTimePicker
            label="Start Date & Time"
            selected={startDateTime}
            onChange={(d) => {
              setStartDateTime(d);
              if (d && endDateTime && d >= endDateTime) {
                const newEnd = new Date(d.getTime() + 60 * 60 * 1000);
                setEndDateTime(newEnd);
              }
            }}
            showTimeSelect
            timeIntervals={30}
            minDate={today()}
            dateFormat="EEE, MMM d · h:mm aa"
            placeholderText="Pick start date & time"
            required
          />

          {/* End DateTime */}
          <DateTimePicker
            label="End Date & Time"
            selected={endDateTime}
            onChange={setEndDateTime}
            showTimeSelect
            timeIntervals={30}
            minDate={startDateTime ?? today()}
            dateFormat="EEE, MMM d · h:mm aa"
            placeholderText="Pick end date & time"
            required
          />

          {/* Live summary */}
          {selectedResource && startDateTime && endDateTime && endDateTime > startDateTime && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 space-y-1">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Booking Summary</p>
              <p className="text-sm font-medium text-white">
                {bookableAssets.find(a => a.id === selectedResource)?.name}
              </p>
              <p className="text-xs text-indigo-300/80">
                {startDateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                {' · '}
                {startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {' → '}
                {endDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-zinc-500">
                Duration: {Math.round((endDateTime.getTime() - startDateTime.getTime()) / 60000)} minutes
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>
              <CalendarDays className="h-4 w-4 mr-1.5" /> Confirm Booking
            </Button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
};

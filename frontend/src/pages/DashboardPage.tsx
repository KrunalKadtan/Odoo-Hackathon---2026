import { useAuthStore } from '../store/auth.store';
import { PackageOpen } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuthStore();

  return (
    <div className="animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name}!</h1>
        <p className="text-zinc-400 text-sm mt-1">Here is a high-level overview of your workspace.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder Stat Card */}
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-500/10 rounded-lg">
              <PackageOpen className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-zinc-400">Total Assets</p>
              <p className="text-2xl font-semibold text-white">---</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Logo } from '../ui/Logo';
import {
  LayoutDashboard,
  Box,
  Building2,
  CalendarDays,
  Wrench,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ArrowRightLeft
} from 'lucide-react';

export const Layout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Assets', href: '/assets', icon: Box },
    { name: 'Allocations', href: '/allocations', icon: ArrowRightLeft },
    { name: 'Bookings', href: '/bookings', icon: CalendarDays },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  ];

  if (user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER') {
    navigation.push({ name: 'Audits', href: '/audits', icon: ShieldCheck });
  }

  if (user?.role === 'ADMIN') {
    navigation.push({ name: 'Organization', href: '/admin/organization', icon: Building2 });
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-zinc-900 pt-5 pb-4">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="flex shrink-0 items-center px-4">
              <Logo size="sm" />
            </div>
            <div className="mt-8 h-0 flex-1 overflow-y-auto px-4">
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`${
                        isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      } group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors`}
                    >
                      <item.icon className={`${isActive ? 'text-indigo-400' : 'text-zinc-500'} mr-3 shrink-0 h-5 w-5`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-zinc-800 bg-zinc-900/50 pt-5">
          <div className="flex shrink-0 items-center px-6 mb-8">
            <Logo size="md" />
          </div>
          <div className="flex flex-1 flex-col px-4">
            <nav className="flex-1 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive ? 'bg-zinc-800/80 text-white shadow-sm' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    } group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200`}
                  >
                    <item.icon className={`${isActive ? 'text-indigo-400' : 'text-zinc-500'} mr-3 shrink-0 h-5 w-5`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto pb-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center px-3 py-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {user?.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <LogOut className="mr-3 shrink-0 h-5 w-5 text-zinc-500" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-64">
        <div className="sticky top-0 z-10 flex h-16 shrink-0 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 md:hidden">
          <button
            type="button"
            className="border-r border-zinc-800 px-4 text-zinc-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex flex-1 items-center justify-between px-4">
            <Logo size="sm" />
            <div className="flex items-center">
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

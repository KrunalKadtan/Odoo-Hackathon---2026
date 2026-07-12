import { useAuthStore } from './store/auth.store';
import { Button } from './components/ui/Button';

function App() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-indigo-400 mb-6">AssetFlow Dashboard</h1>
      <div className="bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-2">Welcome, {user?.name}!</h2>
        <p className="text-zinc-400 mb-6 text-sm">Role: <span className="text-indigo-400 font-mono">{user?.role}</span></p>
        
        <p className="text-zinc-500 mb-8">This is a temporary dashboard placeholder. We will build the actual layout in Phase 3.</p>

        <Button variant="danger" className="w-full" onClick={logout}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default App;

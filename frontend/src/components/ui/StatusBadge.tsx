export const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'AVAILABLE':
      case 'CONFIRMED':
      case 'ACTIVE':
      case 'COMPLETED':
      case 'CLOSED':
      case 'VERIFIED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      
      case 'ALLOCATED':
      case 'OPEN':
      case 'APPROVED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      
      case 'UNDER_MAINTENANCE':
      case 'REQUESTED':
      case 'TRANSFER_PENDING':
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      
      case 'LOST':
      case 'DISPOSED':
      case 'CANCELLED':
      case 'REJECTED':
      case 'MISSING':
        return 'bg-red-500/10 text-red-400 border-red-500/20';

      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

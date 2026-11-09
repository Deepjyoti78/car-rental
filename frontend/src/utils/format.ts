export function formatINR(paise: number, showDecimals: boolean = false): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(rupees);
}

export function formatDate(dateStr: string | Date): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string | Date): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusBadgeClass(status: string): string {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border font-semibold';
  switch (status) {
    case 'CONFIRMED':
    case 'APPROVED':
    case 'SUCCESS':
    case 'COMPLETED':
    case 'PROCESSED':
    case 'RESOLVED':
      return `${base} bg-emerald-950/40 text-emerald-300 border-emerald-800/60`;
    case 'ACTIVE':
    case 'IN_PROGRESS':
    case 'PROCESSING':
      return `${base} bg-amber-950/40 text-amber-300 border-amber-800/60`;
    case 'PENDING':
    case 'PENDING_PAYMENT':
    case 'AWAITING_APPROVAL':
    case 'OPEN':
      return `${base} bg-amber-950/40 text-amber-300 border-amber-800/60`;
    case 'CANCELLED':
    case 'REJECTED':
    case 'FAILED':
    case 'SUSPENDED':
      return `${base} bg-rose-950/40 text-rose-300 border-rose-800/60`;
    case 'REFUND_PENDING':
    case 'REFUNDED':
      return `${base} bg-neutral-900 text-neutral-300 border-neutral-800`;
    default:
      return `${base} bg-neutral-900 text-neutral-400 border-neutral-800`;
  }
}

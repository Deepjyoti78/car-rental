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
      // Ocean Blue & Deep Teal
      return `${base} bg-[#0E4A6B]/40 text-[#FAF8F3] border-[#2D7DA6]/50 shadow-[0_0_10px_rgba(45,125,166,0.2)]`;
    case 'ACTIVE':
    case 'IN_PROGRESS':
    case 'PROCESSING':
      // Ocean Blue
      return `${base} bg-[#2D7DA6]/30 text-[#D5DBE1] border-[#2D7DA6]`;
    case 'PENDING':
    case 'PENDING_PAYMENT':
    case 'AWAITING_APPROVAL':
    case 'OPEN':
      // Sunset Orange
      return `${base} bg-[#E07A3F]/20 text-[#E07A3F] border-[#E07A3F]/50`;
    case 'CANCELLED':
    case 'REJECTED':
    case 'FAILED':
    case 'SUSPENDED':
      // Rose / Alert with Sunset Orange accent
      return `${base} bg-rose-950/40 text-rose-300 border-rose-800/60`;
    case 'REFUND_PENDING':
    case 'REFUNDED':
      // Deep Teal / Slate
      return `${base} bg-[#1A222B] text-[#D5DBE1] border-[#36424D]`;
    default:
      return `${base} bg-[#1A222B] text-[#6B7783] border-[#36424D]`;
  }
}

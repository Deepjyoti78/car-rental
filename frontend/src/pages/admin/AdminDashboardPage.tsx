import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminService } from '../../services/adminService';
import { Booking, Refund, SupportTicket, User, Vehicle, Vendor } from '../../types';
import { formatINR, formatDate, formatDateTime, getStatusBadgeClass } from '../../utils/format';
import {
  ShieldCheck,
  TrendingUp,
  Coins,
  Building2,
  Users,
  Car,
  AlertCircle,
  CheckCircle,
  FileText,
  Percent,
  MessageSquare,
  X,
  Check,
  Ban,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'vendors' | 'bookings' | 'refunds' | 'vehicles' | 'commission' | 'support'
  >('overview');

  const [stats, setStats] = useState<any>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Commission Edit
  const [commissionRate, setCommissionRate] = useState<number>(10.0);
  const [savingCommission, setSavingCommission] = useState(false);

  // Ticket Reply Modal
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('RESOLVED');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [s, v, b, r, veh, t] = await Promise.all([
        adminService.getStats(),
        adminService.getVendors(),
        adminService.getAllBookings(),
        adminService.getRefunds(),
        adminService.getAllVehicles(),
        adminService.getSupportTickets(),
      ]);
      setStats(s.overview);
      setVendors(v);
      setBookings(b);
      setRefunds(r);
      setVehicles(veh);
      setTickets(t);
      if (s.overview?.defaultCommissionRate) {
        setCommissionRate(s.overview.defaultCommissionRate);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateVendorStatus = async (vendorId: string, status: string) => {
    try {
      await adminService.updateVendorStatus(vendorId, status);
      alert(`Vendor status updated to ${status}.`);
      fetchAdminData();
    } catch (err: any) {
      alert(`Error updating vendor: ${err.message}`);
    }
  };

  const handleModerateVehicle = async (vehicleId: string, isApproved: boolean) => {
    try {
      await adminService.moderateVehicle(vehicleId, isApproved);
      alert(`Vehicle listing ${isApproved ? 'approved' : 'suspended'}.`);
      fetchAdminData();
    } catch (err: any) {
      alert(`Error updating vehicle: ${err.message}`);
    }
  };

  const handleProcessRefund = async (refundId: string) => {
    try {
      await adminService.processRefund(refundId);
      alert('Refund processed successfully via verified payment workflow.');
      fetchAdminData();
    } catch (err: any) {
      alert(`Refund processing error: ${err.message}`);
    }
  };

  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCommission(true);
    try {
      await adminService.updateCommission(Number(commissionRate));
      alert('Global platform commission percentage updated successfully.');
      fetchAdminData();
    } catch (err: any) {
      alert(`Failed to update commission: ${err.message}`);
    } finally {
      setSavingCommission(false);
    }
  };

  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;
    setSendingReply(true);
    try {
      await adminService.replySupportTicket(activeTicket.id, replyText, replyStatus);
      alert('Reply sent to customer.');
      setActiveTicket(null);
      setReplyText('');
      fetchAdminData();
    } catch (err: any) {
      alert(`Failed to reply: ${err.message}`);
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#000000] text-[#ffffff]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#18181b] via-[#0D0D0E] to-[#0D0D0E] text-white p-6 rounded-2xl shadow-card border border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#f59e0b]" />
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#ffffff]">
              DriveLoop Platform Administration
            </h1>
          </div>
          <p className="text-xs text-[#a3a3a3]">
            Marketplace oversight, vendor KYC approvals, financial settlements, and fleet moderation
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3.5 py-1.5 rounded-full font-mono text-[11px] text-[#f59e0b] bg-[#000000]/70 border border-[#262626]">
            Standard Platform Fee: {stats?.defaultCommissionRate ?? 10}%
          </span>
        </div>
      </div>

      {/* Global Analytics KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-[#0D0D0E] p-3.5 rounded-xl border border-[#262626] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
            Customers
          </span>
          <p className="text-lg font-bold font-display text-[#ffffff] tabular-nums">
            {stats?.totalCustomers ?? 0}
          </p>
        </div>

        <div className="bg-[#0D0D0E] p-3.5 rounded-xl border border-[#262626] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
            Vendors
          </span>
          <p className="text-lg font-bold font-display text-[#ffffff] tabular-nums">
            {stats?.totalVendors ?? 0}
          </p>
          <span className="text-[10px] font-mono text-[#f59e0b] font-semibold">
            {stats?.activeVendors ?? 0} Approved
          </span>
        </div>

        <div className="bg-[#0D0D0E] p-3.5 rounded-xl border border-[#262626] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
            Pending KYC
          </span>
          <p className="text-lg font-bold font-display text-[#f59e0b] tabular-nums">
            {stats?.pendingVendors ?? 0}
          </p>
          <span className="text-[10px] font-mono text-[#a3a3a3]">Needs review</span>
        </div>

        <div className="bg-[#0D0D0E] p-3.5 rounded-xl border border-[#262626] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
            Total Fleet
          </span>
          <p className="text-lg font-bold font-display text-[#ffffff] tabular-nums">
            {stats?.totalVehicles ?? 0}
          </p>
          <span className="text-[10px] font-mono text-[#f59e0b] font-semibold">
            {stats?.activeVehicles ?? 0} Active
          </span>
        </div>

        <div className="bg-[#0D0D0E] p-3.5 rounded-xl border border-[#262626] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
            All Bookings
          </span>
          <p className="text-lg font-bold font-display text-[#ffffff] tabular-nums">
            {stats?.totalBookings ?? 0}
          </p>
        </div>

        <div className="bg-[#0D0D0E] p-3.5 rounded-xl border border-[#262626] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
            Gross GMV
          </span>
          <p className="text-lg font-bold font-display text-[#ffffff] tabular-nums">
            {formatINR(stats?.grossBookingValue ?? 0)}
          </p>
        </div>

        <div className="bg-[#0D0D0E] p-3.5 rounded-xl border border-[#262626] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
            Platform Net
          </span>
          <p className="text-lg font-bold font-display text-[#f59e0b] tabular-nums">
            {formatINR(stats?.platformRevenue ?? 0)}
          </p>
        </div>

        <div className="bg-[#0D0D0E] p-3.5 rounded-xl border border-[#262626] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
            Cancel Rate
          </span>
          <p className="text-lg font-bold font-display text-[#ffffff] tabular-nums">
            {stats?.cancellationRate ?? 0}%
          </p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex space-x-1 border-b border-[#262626] overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Platform Overview' },
          { id: 'vendors', label: `Vendor Approvals (${vendors.length})` },
          { id: 'bookings', label: `All Bookings (${bookings.length})` },
          { id: 'refunds', label: `Disputes & Refunds (${refunds.length})` },
          { id: 'vehicles', label: `Fleet Moderation (${vehicles.length})` },
          { id: 'commission', label: 'Commission Rates' },
          { id: 'support', label: `Support Tickets (${tickets.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 text-xs font-semibold tracking-wide transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#f59e0b] text-[#f59e0b]'
                : 'border-transparent text-[#a3a3a3] hover:text-[#ffffff]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0D0D0E] p-6 rounded-2xl border border-[#262626] shadow-card space-y-4">
            <h3 className="font-display text-base font-bold text-[#ffffff]">
              Recent Platform Transactions
            </h3>
            <div className="divide-y divide-[#262626]">
              {bookings.slice(0, 5).map((b) => (
                <div key={b.id} className="py-3 first:pt-0 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono font-bold text-[#f59e0b]">{b.bookingCode}</span>
                    <p className="text-[#a3a3a3]">
                      {b.vehicle?.brand} {b.vehicle?.model} • {b.customer?.firstName} {b.customer?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#ffffff] tabular-nums">{formatINR(b.totalAmount)}</span>
                    <span className={`block mt-1 ${getStatusBadgeClass(b.status)}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0D0D0E] p-6 rounded-2xl border border-[#262626] shadow-card space-y-4">
            <h3 className="font-display text-base font-bold text-[#ffffff]">
              Pending Vendor Applications
            </h3>
            {vendors.filter((v) => v.status === 'PENDING').length === 0 ? (
              <p className="text-xs text-[#a3a3a3]">No vendor applications currently pending review.</p>
            ) : (
              <div className="divide-y divide-[#262626]">
                {vendors
                  .filter((v) => v.status === 'PENDING')
                  .map((pv) => (
                    <div key={pv.id} className="py-3 first:pt-0 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-[#ffffff]">{pv.businessName}</p>
                        <p className="text-[#a3a3a3]">{pv.city} • Contact: {pv.contactNumber}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateVendorStatus(pv.id, 'APPROVED')}
                          className="px-3 py-1 rounded-full bg-[#18181b] text-[#f59e0b] border border-[#f59e0b]/50 font-bold text-[11px] hover:bg-[#f59e0b] transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateVendorStatus(pv.id, 'REJECTED')}
                          className="px-3 py-1 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/50 font-bold text-[11px] hover:bg-[#f59e0b] hover:text-[#000000] transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VENDOR APPROVALS */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-[#ffffff]">
            Vendor Fleet Partners Management
          </h3>
          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#000000] text-[#737373] font-mono uppercase tracking-wider text-[10px] border-b border-[#262626]">
                  <tr>
                    <th className="p-3.5">Business Name</th>
                    <th className="p-3.5">Hub City</th>
                    <th className="p-3.5">Contact Person</th>
                    <th className="p-3.5">Commission</th>
                    <th className="p-3.5">KYC Status</th>
                    <th className="p-3.5">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-[#000000]/50">
                      <td className="p-3.5 font-bold text-[#ffffff]">
                        {v.businessName}
                        <span className="block text-[11px] text-[#a3a3a3] font-normal">{v.businessEmail}</span>
                      </td>
                      <td className="p-3.5 font-medium">{v.city}, {v.state}</td>
                      <td className="p-3.5">{v.authorizedPerson} ({v.contactNumber})</td>
                      <td className="p-3.5 font-mono font-semibold text-[#ffffff]">{v.commissionRate}%</td>
                      <td className="p-3.5">
                        <span className={getStatusBadgeClass(v.status)}>
                          {v.status}
                        </span>
                      </td>
                      <td className="p-3.5 space-x-2">
                        {v.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateVendorStatus(v.id, 'APPROVED')}
                            className="px-3 py-1 rounded-full bg-[#18181b] text-[#f59e0b] border border-[#f59e0b]/50 font-bold text-[11px] hover:bg-[#f59e0b] transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {v.status === 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateVendorStatus(v.id, 'SUSPENDED')}
                            className="px-3 py-1 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/50 font-bold text-[11px] hover:bg-[#f59e0b] hover:text-[#000000] transition-colors"
                          >
                            Suspend
                          </button>
                        )}
                        {v.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleUpdateVendorStatus(v.id, 'APPROVED')}
                            className="px-3 py-1 rounded-full bg-[#18181b] text-[#f59e0b] border border-[#f59e0b]/50 font-bold text-[11px] hover:bg-[#f59e0b] transition-colors"
                          >
                            Unsuspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PLATFORM BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-[#ffffff]">
            Global Platform Bookings Oversight
          </h3>
          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#000000] text-[#737373] font-mono uppercase tracking-wider text-[10px] border-b border-[#262626]">
                  <tr>
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">Vehicle</th>
                    <th className="p-3.5">Vendor</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Total Paid</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#000000]/50">
                      <td className="p-3.5 font-bold font-mono text-[#f59e0b]">{b.bookingCode}</td>
                      <td className="p-3.5 font-semibold text-[#ffffff]">{b.vehicle?.brand} {b.vehicle?.model}</td>
                      <td className="p-3.5">{b.vendor?.businessName}</td>
                      <td className="p-3.5">{b.customer?.firstName} {b.customer?.lastName}</td>
                      <td className="p-3.5 font-bold text-[#f59e0b] tabular-nums">{formatINR(b.totalAmount)}</td>
                      <td className="p-3.5">
                        <span className={getStatusBadgeClass(b.status)}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#a3a3a3] font-mono">{formatDate(b.startDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REFUNDS & DISPUTES */}
      {activeTab === 'refunds' && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-[#ffffff]">
            Refund Management & Cancellation Claims
          </h3>
          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#000000] text-[#737373] font-mono uppercase tracking-wider text-[10px] border-b border-[#262626]">
                  <tr>
                    <th className="p-3.5">Booking</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Refund Reason & Policy</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {refunds.map((r) => (
                    <tr key={r.id} className="hover:bg-[#000000]/50">
                      <td className="p-3.5 font-mono font-bold text-[#f59e0b]">{r.booking?.bookingCode}</td>
                      <td className="p-3.5">{r.booking?.customer?.firstName} {r.booking?.customer?.lastName}</td>
                      <td className="p-3.5 max-w-xs text-[#a3a3a3]">{r.reason}</td>
                      <td className="p-3.5 font-bold text-[#f59e0b] tabular-nums">{formatINR(r.amount)}</td>
                      <td className="p-3.5">
                        <span className={getStatusBadgeClass(r.status)}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {r.status === 'PENDING' && (
                          <button
                            onClick={() => handleProcessRefund(r.id)}
                            className="px-3.5 py-1.5 rounded-full bg-[#f59e0b] text-[#000000] font-bold text-[11px] hover:bg-white transition-colors"
                          >
                            Process Refund
                          </button>
                        )}
                        {r.status === 'PROCESSED' && (
                          <span className="text-[11px] text-[#f59e0b] font-semibold">
                            Disbursed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FLEET MODERATION */}
      {activeTab === 'vehicles' && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-[#ffffff]">
            Marketplace Vehicle Listings Moderation
          </h3>
          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#000000] text-[#737373] font-mono uppercase tracking-wider text-[10px] border-b border-[#262626]">
                  <tr>
                    <th className="p-3.5">Vehicle</th>
                    <th className="p-3.5">Host</th>
                    <th className="p-3.5">City</th>
                    <th className="p-3.5">Daily Rate</th>
                    <th className="p-3.5">Listing Status</th>
                    <th className="p-3.5">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-[#000000]/50">
                      <td className="p-3.5 font-bold text-[#ffffff]">{v.brand} {v.model} ({v.year})</td>
                      <td className="p-3.5">{v.vendor?.businessName}</td>
                      <td className="p-3.5">{v.city}</td>
                      <td className="p-3.5 font-bold tabular-nums text-[#ffffff]">{formatINR(v.dailyRate)}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold border ${
                            v.isApproved
                              ? 'bg-[#18181b]/50 text-[#f59e0b] border-[#f59e0b]/50'
                              : 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30'
                          }`}
                        >
                          {v.isApproved ? 'Approved' : 'Suspended'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleModerateVehicle(v.id, !v.isApproved)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                            v.isApproved
                              ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40 hover:bg-[#f59e0b] hover:text-[#000000]'
                              : 'bg-[#18181b] text-[#f59e0b] border border-[#f59e0b]/50 hover:bg-[#f59e0b]'
                          }`}
                        >
                          {v.isApproved ? 'Suspend Listing' : 'Approve Listing'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: COMMISSION CONFIGURATION */}
      {activeTab === 'commission' && (
        <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] shadow-card p-6 max-w-md space-y-4 text-[#ffffff]">
          <h3 className="font-display text-base font-bold text-[#ffffff]">
            Marketplace Platform Commission Settings
          </h3>
          <p className="text-xs text-[#a3a3a3]">
            This controls the default commission deducted from vendor gross base rentals on new bookings.
          </p>

          <form onSubmit={handleUpdateCommission} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#ffffff] mb-1">
                Standard Commission Rate (%) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  required
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-xs font-semibold text-[#ffffff] focus:outline-none focus:border-[#f59e0b]"
                />
                <Percent className="w-4 h-4 text-[#737373] absolute right-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingCommission}
              className="px-5 py-2.5 rounded-full bg-[#f59e0b] hover:bg-white text-[#000000] text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {savingCommission ? 'Saving...' : 'Update Platform Commission'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: SUPPORT TICKETS */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-[#ffffff]">
            Support & Resolution Desk
          </h3>
          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#000000] text-[#737373] font-mono uppercase tracking-wider text-[10px] border-b border-[#262626]">
                  <tr>
                    <th className="p-3.5">Ticket #</th>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Subject</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-[#000000]/50">
                      <td className="p-3.5 font-mono font-bold text-[#f59e0b]">{t.ticketNumber}</td>
                      <td className="p-3.5">{t.user?.firstName} {t.user?.lastName} ({t.user?.role})</td>
                      <td className="p-3.5 font-medium text-[#ffffff]">{t.subject}</td>
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-[10px]">{t.priority}</span>
                      </td>
                      <td className="p-3.5">
                        <span className={getStatusBadgeClass(t.status)}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => {
                            setActiveTicket(t);
                            setReplyText(t.response || '');
                          }}
                          className="px-3 py-1 rounded-full bg-[#f59e0b] text-[#000000] font-bold text-[11px] hover:bg-white transition-colors"
                        >
                          Respond
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TICKET REPLY MODAL */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/85 backdrop-blur-md">
          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] max-w-md w-full p-6 space-y-4 shadow-2xl text-[#ffffff]">
            <h3 className="font-display text-base font-bold text-[#ffffff]">
              Reply to Ticket {activeTicket.ticketNumber}
            </h3>
            <p className="text-xs text-[#a3a3a3]">
              User: <strong className="text-[#ffffff]">{activeTicket.user?.firstName} {activeTicket.user?.lastName}</strong> ({activeTicket.user?.email})
            </p>
            <div className="p-3 rounded-xl bg-[#000000] border border-[#262626] text-xs text-[#ffffff]">
              <span className="font-mono text-[9px] text-[#737373] uppercase block">Query:</span>
              <p className="font-semibold text-[#ffffff]">{activeTicket.subject}</p>
              <p className="text-[#a3a3a3] mt-1">{activeTicket.message}</p>
            </div>
            <form onSubmit={handleSendTicketReply} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#ffffff]">Status</label>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] font-semibold text-xs text-[#ffffff] focus:outline-none focus:border-[#f59e0b]"
                >
                  <option value="IN_PROGRESS" className="bg-[#0D0D0E]">In Progress</option>
                  <option value="RESOLVED" className="bg-[#0D0D0E]">Resolved</option>
                  <option value="CLOSED" className="bg-[#0D0D0E]">Closed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#ffffff]">Official Response *</label>
                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your resolution instructions here..."
                  className="w-full p-2.5 rounded-lg border border-[#262626] bg-[#000000] font-semibold text-xs text-[#ffffff] focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setActiveTicket(null)}
                  className="px-4 py-2 rounded-full border border-[#262626] text-xs font-semibold text-[#a3a3a3] hover:text-[#ffffff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingReply}
                  className="px-5 py-2.5 rounded-full bg-[#f59e0b] hover:bg-white text-[#000000] text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {sendingReply ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
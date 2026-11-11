import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { vendorService } from '../../services/vendorService';
import { Vehicle, Booking, Payout } from '../../types';
import { formatINR, formatDate, formatDateTime, getStatusBadgeClass } from '../../utils/format';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import {
  Car,
  TrendingUp,
  Coins,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
  AlertTriangle,
  X,
  FileText,
  Wrench,
  ArrowRight,
  Upload,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';

export const VendorDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'bookings' | 'payouts' | 'profile'>('overview');

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [financials, setFinancials] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [addVehicleModalOpen, setAddVehicleModalOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [selectedVehicleForMaint, setSelectedVehicleForMaint] = useState<string>('');
  const [maintReason, setMaintReason] = useState('');
  const [maintStart, setMaintStart] = useState('');
  const [maintEnd, setMaintEnd] = useState('');

  // Booking lifecycle state modal
  const [transitionBooking, setTransitionBooking] = useState<Booking | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('');
  const [startOdometer, setStartOdometer] = useState<number>(0);
  const [returnOdometer, setReturnOdometer] = useState<number>(0);
  const [damageReport, setDamageReport] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState<string>('');
  const [transitioning, setTransitioning] = useState(false);

  // Payout Modal
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<string>('50000'); // in rupees
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('HDFC0001234');
  const [requestingPayout, setRequestingPayout] = useState(false);

  // New Vehicle Form State
  const [vBrand, setVBrand] = useState('Toyota');
  const [vModel, setVModel] = useState('Innova Hycross');
  const [vYear, setVYear] = useState(2024);
  const [vReg, setVReg] = useState(`DL01${Date.now().toString().slice(-6)}`);
  const [vCategory, setVCategory] = useState<'SUV' | 'SEDAN' | 'LUXURY' | 'ELECTRIC' | 'HATCHBACK'>('SUV');
  const [vTrans, setVTrans] = useState<'AUTOMATIC' | 'MANUAL'>('AUTOMATIC');
  const [vFuel, setVFuel] = useState<'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID'>('HYBRID');
  const [vSeats, setVSeats] = useState(7);
  const [vDailyRate, setVDailyRate] = useState(4500); // ₹4,500
  const [vDeposit, setVDeposit] = useState(10000); // ₹10,000
  const [vMileage, setVMileage] = useState('Unlimited km');
  const [vCity, setVCity] = useState(user?.vendor?.city || 'Delhi');
  const [vState, setVState] = useState(user?.vendor?.state || 'Delhi');
  const [vPickup, setVPickup] = useState('Aerocity Terminal 3 Hub');
  const [vDesc, setVDesc] = useState('Premium 7-seater hybrid MPV with lounge Ottoman seats, JBL audio, and ADAS cruise control.');
  const [vImageUrl, setVImageUrl] = useState('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&q=80');
  const [vFeatures, setVFeatures] = useState('Captain Seats, Sunroof, ADAS, 360 Camera');
  const [creatingVehicle, setCreatingVehicle] = useState(false);

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      const [dash, vehs, bks, fins] = await Promise.all([
        vendorService.getDashboard(),
        vendorService.getVehicles(),
        vendorService.getBookings(),
        vendorService.getEarnings(),
      ]);
      setDashboardData(dash);
      setVehicles(vehs);
      setBookings(bks);
      setFinancials(fins);
    } catch (err) {
      console.error('Error loading vendor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, []);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingVehicle(true);
    try {
      await vendorService.createVehicle({
        brand: vBrand,
        model: vModel,
        year: Number(vYear),
        registrationNumber: vReg,
        category: vCategory,
        transmission: vTrans,
        fuelType: vFuel,
        seatingCapacity: Number(vSeats),
        dailyRate: vDailyRate * 100, // into paise
        securityDeposit: vDeposit * 100, // into paise
        mileagePolicy: vMileage,
        pickupAddress: vPickup,
        city: vCity,
        state: vState,
        description: vDesc,
        isActive: true,
        features: vFeatures.split(',').map((s) => s.trim()).filter(Boolean),
        images: [{ url: vImageUrl, isPrimary: true, order: 0 }],
      });

      alert('Vehicle successfully added to your fleet!');
      setAddVehicleModalOpen(false);
      fetchVendorData();
    } catch (err: any) {
      alert(`Failed to add vehicle: ${err.message}`);
    } finally {
      setCreatingVehicle(false);
    }
  };

  const handleToggleStatus = async (vehicleId: string) => {
    try {
      await vendorService.toggleVehicleStatus(vehicleId);
      fetchVendorData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vendorService.addMaintenance({
        vehicleId: selectedVehicleForMaint,
        startDate: new Date(maintStart).toISOString(),
        endDate: new Date(maintEnd).toISOString(),
        reason: maintReason,
      });
      alert('Maintenance period successfully scheduled.');
      setMaintenanceModalOpen(false);
      setMaintReason('');
      fetchVendorData();
    } catch (err: any) {
      alert(`Error scheduling maintenance: ${err.message}`);
    }
  };

  const handleStatusTransition = async () => {
    if (!transitionBooking || !targetStatus) return;
    setTransitioning(true);
    try {
      await vendorService.updateBookingStatus(transitionBooking.id, {
        status: targetStatus,
        notes: statusNotes,
        startOdometer: startOdometer || undefined,
        returnOdometer: returnOdometer || undefined,
        damageReport: damageReport || undefined,
      });
      alert(`Booking transitioned to ${targetStatus}!`);
      setTransitionBooking(null);
      fetchVendorData();
    } catch (err: any) {
      alert(`Status transition error: ${err.message}`);
    } finally {
      setTransitioning(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const paise = Number(payoutAmount) * 100;
    if (paise > (dashboardData?.stats?.availableBalance || 0)) {
      alert('Requested amount exceeds available balance.');
      return;
    }
    setRequestingPayout(true);
    try {
      await vendorService.requestPayout({
        amount: paise,
        accountNumber,
        ifscCode,
        bankName,
      });
      alert('Payout initiated. Accounting ledger updated.');
      setPayoutModalOpen(false);
      fetchVendorData();
    } catch (err: any) {
      alert(`Payout request error: ${err.message}`);
    } finally {
      setRequestingPayout(false);
    }
  };

  const stats = dashboardData?.stats;
  const vendorInfo = dashboardData?.vendor || user?.vendor;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#000000] text-[#ffffff]">
      {/* Vendor Profile & Status Banner */}
      <div className="bg-[#0D0D0E] p-6 rounded-2xl border border-[#262626] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <h1 className="font-display text-2xl font-bold text-[#ffffff]">
              {vendorInfo?.businessName || 'Vendor Fleet Portal'}
            </h1>
            <span className={getStatusBadgeClass(vendorInfo?.status || 'PENDING')}>
              {vendorInfo?.status || 'PENDING'}
            </span>
          </div>
          <p className="text-xs text-[#a3a3a3]">
            {vendorInfo?.city}, {vendorInfo?.state} • Contact: {vendorInfo?.contactNumber} • Platform Commission: {vendorInfo?.commissionRate ?? 10}%
          </p>
        </div>

        {vendorInfo?.status === 'APPROVED' ? (
          <button
            onClick={() => setAddVehicleModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#f59e0b] hover:bg-white text-[#000000] text-xs font-bold uppercase tracking-wider shadow-card transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-[#000000]" />
            <span>Add Vehicle to Fleet</span>
          </button>
        ) : (
          <div className="px-3.5 py-2 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-xs text-[#f59e0b] font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Account Pending Verification</span>
          </div>
        )}
      </div>

      {/* Pending Account Notice */}
      {vendorInfo?.status !== 'APPROVED' && (
        <div className="p-4 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-xs text-[#f59e0b] space-y-1">
          <p className="font-bold flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Compliance Verification Underway:
          </p>
          <p className="text-[#a3a3a3]">
            Your business documentation is currently being reviewed by DriveLoop compliance specialists.
            Public booking engine listings and vehicle addition will automatically unlock upon approval.
          </p>
        </div>
      )}

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0D0D0E] p-4 rounded-xl border border-[#262626] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
            Total Fleet
          </span>
          <p className="text-xl font-bold font-display text-[#ffffff] tabular-nums">
            <AnimatedCounter value={stats?.totalVehicles ?? 0} duration={1200} triggerKey={activeTab} />
          </p>
          <span className="text-[10px] font-mono text-[#f59e0b] font-semibold">
            {stats?.activeVehicles ?? 0} Active
          </span>
        </div>

        <div className="bg-[#0D0D0E] p-4 rounded-xl border border-[#262626] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
            Total Trips
          </span>
          <p className="text-xl font-bold font-display text-[#ffffff] tabular-nums">
            <AnimatedCounter value={stats?.totalBookings ?? 0} delay={60} duration={1200} triggerKey={activeTab} />
          </p>
          <span className="text-[10px] font-mono text-[#f59e0b] font-semibold">
            {stats?.activeRentals ?? 0} Currently Out
          </span>
        </div>

        <div className="bg-[#0D0D0E] p-4 rounded-xl border border-[#262626] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
            Fleet Utilization
          </span>
          <p className="text-xl font-bold font-display text-[#ffffff] tabular-nums">
            <AnimatedCounter value={stats?.utilizationRate ?? 0} suffix="%" delay={120} duration={1200} triggerKey={activeTab} />
          </p>
          <span className="text-[10px] font-mono text-[#a3a3a3]">Active/Total</span>
        </div>

        <div className="bg-[#0D0D0E] p-4 rounded-xl border border-[#262626] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
            Gross GMV
          </span>
          <p className="text-xl font-bold font-display text-[#ffffff] tabular-nums">
            <AnimatedCounter value={stats?.grossRevenue ?? 0} formatter={(v) => formatINR(v)} delay={180} duration={1200} triggerKey={activeTab} />
          </p>
          <span className="text-[10px] font-mono text-[#a3a3a3]">Before fee</span>
        </div>

        <div className="bg-[#0D0D0E] p-4 rounded-xl border border-[#262626] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
            Net Host Earnings
          </span>
          <p className="text-xl font-bold font-display text-[#f59e0b] tabular-nums">
            <AnimatedCounter value={stats?.netEarnings ?? 0} formatter={(v) => formatINR(v)} delay={240} duration={1200} triggerKey={activeTab} />
          </p>
          <span className="text-[10px] font-mono text-[#a3a3a3]">90% net payout</span>
        </div>

        <div className="bg-[#0D0D0E] p-4 rounded-xl border border-[#262626] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
            Available Payout
          </span>
          <p className="text-xl font-bold font-display text-[#f59e0b] tabular-nums">
            <AnimatedCounter value={stats?.availableBalance ?? 0} formatter={(v) => formatINR(v)} delay={300} duration={1200} triggerKey={activeTab} />
          </p>
          <button
            onClick={() => setPayoutModalOpen(true)}
            disabled={(stats?.availableBalance || 0) < 100000}
            className="text-[10px] text-[#f59e0b] font-bold uppercase tracking-wider hover:underline disabled:opacity-40"
          >
            Withdraw &rarr;
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex space-x-1 border-b border-[#262626] overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Overview & Activity' },
          { id: 'fleet', label: `Fleet Inventory (${vehicles.length})` },
          { id: 'bookings', label: `Booking Operations (${bookings.length})` },
          { id: 'payouts', label: 'Financials & Payouts' },
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

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] p-6 space-y-4 shadow-card">
            <h3 className="font-display text-base font-bold text-[#ffffff]">
              Recent Booking Feed
            </h3>
            {dashboardData?.recentBookings?.length === 0 ? (
              <p className="text-xs text-[#a3a3a3]">No booking requests received yet.</p>
            ) : (
              <div className="divide-y divide-[#262626]">
                {dashboardData?.recentBookings?.map((rb: any) => (
                  <div key={rb.id} className="py-3 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#ffffff]">
                        <span className="font-mono text-[#f59e0b]">{rb.bookingCode}</span> • {rb.vehicle?.brand} {rb.vehicle?.model}
                      </p>
                      <p className="text-[#a3a3a3] text-[11px]">
                        Customer: {rb.customer?.firstName} {rb.customer?.lastName} ({rb.customer?.phone})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={getStatusBadgeClass(rb.status)}>
                        {rb.status}
                      </span>
                      <p className="text-[#737373] font-mono text-[11px] mt-1">{formatDate(rb.startDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: FLEET MANAGEMENT */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-lg font-bold text-[#ffffff]">
              Your Managed Fleet
            </h3>
            {vendorInfo?.status === 'APPROVED' && (
              <button
                onClick={() => setAddVehicleModalOpen(true)}
                className="px-4 py-2 rounded-full bg-[#f59e0b] text-[#000000] text-xs font-bold hover:bg-white flex items-center space-x-1.5 transition-colors"
              >
                <Plus className="w-4 h-4 text-[#000000]" />
                <span>Add Vehicle</span>
              </button>
            )}
          </div>

          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#000000] text-[#737373] font-mono uppercase tracking-wider text-[10px] border-b border-[#262626]">
                  <tr>
                    <th className="p-3.5">Vehicle</th>
                    <th className="p-3.5">Registration</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Daily Rate</th>
                    <th className="p-3.5">Deposit</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-[#000000]/50">
                      <td className="p-3.5 font-bold text-[#ffffff] flex items-center space-x-2.5">
                        <img
                          src={v.images?.[0]?.url}
                          alt={v.model}
                          className="w-10 h-8 rounded-lg object-cover bg-[#000000] border border-[#262626]"
                        />
                        <span>{v.brand} {v.model} ({v.year})</span>
                      </td>
                      <td className="p-3.5 font-mono text-[#a3a3a3]">{v.registrationNumber}</td>
                      <td className="p-3.5 font-medium">{v.category}</td>
                      <td className="p-3.5 font-bold tabular-nums text-[#ffffff]">{formatINR(v.dailyRate)}</td>
                      <td className="p-3.5 tabular-nums text-[#a3a3a3]">{formatINR(v.securityDeposit)}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold border ${
                            v.isActive
                              ? 'bg-[#18181b]/50 text-[#f59e0b] border-[#f59e0b]/50'
                              : 'bg-[#000000] text-[#737373] border-[#262626]'
                          }`}
                        >
                          {v.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3.5 space-x-2">
                        <button
                          onClick={() => handleToggleStatus(v.id)}
                          className="text-[11px] font-semibold text-[#a3a3a3] hover:text-[#ffffff] underline"
                        >
                          {v.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <span className="text-[#262626]">•</span>
                        <button
                          onClick={() => {
                            setSelectedVehicleForMaint(v.id);
                            setMaintenanceModalOpen(true);
                          }}
                          className="text-[11px] font-semibold text-[#f59e0b] hover:text-[#f59e0b] hover:underline"
                        >
                          Maintenance
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

      {/* TAB: BOOKINGS OPERATIONS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-[#ffffff]">
            Booking Dispatch & Operations
          </h3>
          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#000000] text-[#737373] font-mono uppercase tracking-wider text-[10px] border-b border-[#262626]">
                  <tr>
                    <th className="p-3.5">Booking</th>
                    <th className="p-3.5">Vehicle</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Trip Dates</th>
                    <th className="p-3.5">Net Earnings</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Operation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#000000]/50">
                      <td className="p-3.5 font-bold font-mono text-[#f59e0b]">{b.bookingCode}</td>
                      <td className="p-3.5 font-semibold text-[#ffffff]">
                        {b.vehicle?.brand} {b.vehicle?.model}
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold block text-[#ffffff]">{b.customer?.firstName} {b.customer?.lastName}</span>
                        <span className="text-[#737373] font-mono text-[11px]">{b.customer?.phone}</span>
                      </td>
                      <td className="p-3.5 text-[#a3a3a3] font-mono">
                        {formatDate(b.startDate)} to {formatDate(b.endDate)}
                      </td>
                      <td className="p-3.5 font-bold text-[#f59e0b] tabular-nums">
                        {formatINR(b.vendorEarnings)}
                      </td>
                      <td className="p-3.5">
                        <span className={getStatusBadgeClass(b.status)}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {/* Status transition controls */}
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => {
                              setTransitionBooking(b);
                              setTargetStatus('ACTIVE');
                            }}
                            className="px-3 py-1 rounded-full bg-[#f59e0b] text-[#000000] font-bold text-[11px] hover:bg-white transition-colors"
                          >
                            Handover Vehicle
                          </button>
                        )}
                        {b.status === 'ACTIVE' && (
                          <button
                            onClick={() => {
                              setTransitionBooking(b);
                              setTargetStatus('COMPLETED');
                            }}
                            className="px-3 py-1 rounded-full bg-[#18181b] text-[#ffffff] border border-[#f59e0b]/50 font-bold text-[11px] hover:bg-[#f59e0b] transition-colors"
                          >
                            Mark Returned
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

      {/* TAB: FINANCIALS & PAYOUTS */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0D0D0E] p-5 rounded-2xl border border-[#262626] shadow-card space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
                Gross Booking Value
              </span>
              <p className="text-2xl font-bold font-display text-[#ffffff] tabular-nums">
                {formatINR(financials?.financials?.grossRevenue || 0)}
              </p>
              <p className="text-xs text-[#a3a3a3]">Total vehicle base rental volume</p>
            </div>

            <div className="bg-[#0D0D0E] p-5 rounded-2xl border border-[#262626] shadow-card space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
                Platform Commission (10%)
              </span>
              <p className="text-2xl font-bold font-display text-[#f59e0b] tabular-nums">
                {formatINR(financials?.financials?.platformCommission || 0)}
              </p>
              <p className="text-xs text-[#a3a3a3]">DriveLoop service & marketplace fee</p>
            </div>

            <div className="bg-[#0D0D0E] p-5 rounded-2xl border border-[#262626] shadow-card space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
                Available for Bank Payout
              </span>
              <p className="text-2xl font-bold font-display text-[#f59e0b] tabular-nums">
                {formatINR(financials?.financials?.availableBalance || 0)}
              </p>
              <button
                onClick={() => setPayoutModalOpen(true)}
                disabled={(financials?.financials?.availableBalance || 0) < 100000}
                className="mt-2 w-full py-2.5 rounded-full bg-[#f59e0b] hover:bg-white text-[#000000] text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
              >
                Withdraw Funds
              </button>
            </div>
          </div>

          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] p-6 space-y-4 shadow-card">
            <h3 className="font-display text-base font-bold text-[#ffffff]">
              Payout Transfer History
            </h3>
            {financials?.payouts?.length === 0 ? (
              <p className="text-xs text-[#a3a3a3]">No payout transfers requested yet.</p>
            ) : (
              <div className="divide-y divide-[#262626]">
                {financials?.payouts?.map((p: Payout) => (
                  <div key={p.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold font-mono text-[#ffffff]">
                        {p.referenceId || 'BANK-TRANSFER'}
                      </p>
                      <p className="text-[#a3a3a3]">{p.notes}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#ffffff] block tabular-nums">{formatINR(p.amount)}</span>
                      <span className={getStatusBadgeClass(p.status)}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD VEHICLE MODAL */}
      {addVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8 text-[#ffffff]">
            <div className="flex justify-between items-center border-b border-[#262626] pb-3">
              <h3 className="font-display text-base font-bold text-[#ffffff]">
                Add New Rental Vehicle to Fleet
              </h3>
              <button onClick={() => setAddVehicleModalOpen(false)}>
                <X className="w-5 h-5 text-[#737373] hover:text-[#ffffff]" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#ffffff]">Make / Brand *</label>
                  <input
                    type="text"
                    required
                    value={vBrand}
                    onChange={(e) => setVBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#ffffff]">Model Name *</label>
                  <input
                    type="text"
                    required
                    value={vModel}
                    onChange={(e) => setVModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#ffffff]">Mfg Year *</label>
                  <input
                    type="number"
                    required
                    value={vYear}
                    onChange={(e) => setVYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#ffffff]">Category *</label>
                  <select
                    value={vCategory}
                    onChange={(e) => setVCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                  >
                    <option value="SUV" className="bg-[#0D0D0E]">SUV</option>
                    <option value="SEDAN" className="bg-[#0D0D0E]">Sedan</option>
                    <option value="LUXURY" className="bg-[#0D0D0E]">Luxury</option>
                    <option value="ELECTRIC" className="bg-[#0D0D0E]">Electric</option>
                    <option value="HATCHBACK" className="bg-[#0D0D0E]">Hatchback</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#ffffff]">Registration # *</label>
                  <input
                    type="text"
                    required
                    value={vReg}
                    onChange={(e) => setVReg(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold uppercase font-mono focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#ffffff]">Transmission</label>
                  <select
                    value={vTrans}
                    onChange={(e) => setVTrans(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                  >
                    <option value="AUTOMATIC" className="bg-[#0D0D0E]">Automatic</option>
                    <option value="MANUAL" className="bg-[#0D0D0E]">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#ffffff]">Fuel Type</label>
                  <select
                    value={vFuel}
                    onChange={(e) => setVFuel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                  >
                    <option value="PETROL" className="bg-[#0D0D0E]">Petrol</option>
                    <option value="DIESEL" className="bg-[#0D0D0E]">Diesel</option>
                    <option value="ELECTRIC" className="bg-[#0D0D0E]">Electric</option>
                    <option value="HYBRID" className="bg-[#0D0D0E]">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#ffffff]">Seats</label>
                  <input
                    type="number"
                    value={vSeats}
                    onChange={(e) => setVSeats(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#ffffff]">Daily Rental Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={vDailyRate}
                    onChange={(e) => setVDailyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#ffffff]">Security Deposit (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={vDeposit}
                    onChange={(e) => setVDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#ffffff]">Hub City *</label>
                  <input
                    type="text"
                    required
                    value={vCity}
                    onChange={(e) => setVCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#ffffff]">Pickup Address *</label>
                  <input
                    type="text"
                    required
                    value={vPickup}
                    onChange={(e) => setVPickup(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#ffffff]">Image URL (High-res photo) *</label>
                <input
                  type="url"
                  required
                  value={vImageUrl}
                  onChange={(e) => setVImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#ffffff]">Features (comma-separated)</label>
                <input
                  type="text"
                  value={vFeatures}
                  onChange={(e) => setVFeatures(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#ffffff]">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={vDesc}
                  onChange={(e) => setVDesc(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setAddVehicleModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#262626] text-xs font-semibold text-[#a3a3a3] hover:text-[#ffffff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingVehicle}
                  className="px-6 py-2 rounded-full bg-[#f59e0b] hover:bg-white text-[#000000] text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {creatingVehicle ? 'Publishing...' : 'Publish Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HANDOVER & RETURN TRANSITION MODAL */}
      {transitionBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/85 backdrop-blur-md">
          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] max-w-md w-full p-6 space-y-4 shadow-2xl text-[#ffffff]">
            <h3 className="font-display text-base font-bold text-[#ffffff]">
              {targetStatus === 'ACTIVE' ? 'Vehicle Handover (Start Trip)' : 'Vehicle Return (Complete Trip)'}
            </h3>
            <p className="text-xs text-[#a3a3a3]">
              Booking: <strong className="text-[#f59e0b] font-mono">{transitionBooking.bookingCode}</strong> ({transitionBooking.vehicle?.brand} {transitionBooking.vehicle?.model})
            </p>

            {targetStatus === 'ACTIVE' && (
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#ffffff]">Starting Odometer Reading (km) *</label>
                <input
                  type="number"
                  value={startOdometer}
                  onChange={(e) => setStartOdometer(Number(e.target.value))}
                  placeholder="e.g. 24500"
                  className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-xs font-semibold text-[#ffffff] focus:outline-none focus:border-[#f59e0b]"
                />
              </div>
            )}

            {targetStatus === 'COMPLETED' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#ffffff]">Ending Odometer Reading (km) *</label>
                  <input
                    type="number"
                    value={returnOdometer}
                    onChange={(e) => setReturnOdometer(Number(e.target.value))}
                    placeholder="e.g. 25100"
                    className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-xs font-semibold text-[#ffffff] focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#ffffff]">Damage / Inspection Report (if any)</label>
                  <textarea
                    rows={2}
                    value={damageReport}
                    onChange={(e) => setDamageReport(e.target.value)}
                    placeholder="No damage observed, vehicle returned in pristine condition."
                    className="w-full p-2 rounded-lg border border-[#262626] bg-[#000000] text-xs font-semibold text-[#ffffff] focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1 text-[#ffffff]">Operator Notes</label>
              <input
                type="text"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Handover completed at designated airport hub"
                className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-xs font-semibold text-[#ffffff] focus:outline-none focus:border-[#f59e0b]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#262626]">
              <button
                type="button"
                onClick={() => setTransitionBooking(null)}
                className="px-4 py-2 rounded-full border border-[#262626] text-xs font-semibold text-[#a3a3a3] hover:text-[#ffffff]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={transitioning}
                onClick={handleStatusTransition}
                className="px-5 py-2 rounded-full bg-[#f59e0b] text-[#000000] text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-50"
              >
                {transitioning ? 'Saving...' : 'Confirm Status Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST PAYOUT MODAL */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/85 backdrop-blur-md">
          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] max-w-md w-full p-6 space-y-4 shadow-2xl text-[#ffffff]">
            <h3 className="font-display text-base font-bold text-[#ffffff]">
              Request Host Bank Payout
            </h3>
            <p className="text-xs text-[#a3a3a3]">
              Available Balance: <strong className="text-[#f59e0b] tabular-nums font-mono">{formatINR(stats?.availableBalance || 0)}</strong>
            </p>
            <form onSubmit={handleRequestPayout} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#ffffff]">Withdrawal Amount (₹ INR) *</label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#ffffff]">Bank Name *</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#ffffff]">Bank Account Number *</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="50100XXXXXXXXXX"
                  className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold font-mono focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#ffffff]">IFSC Code *</label>
                <input
                  type="text"
                  required
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  placeholder="HDFC0001234"
                  className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold uppercase font-mono focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#262626] text-xs font-semibold text-[#a3a3a3] hover:text-[#ffffff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestingPayout}
                  className="px-5 py-2 rounded-full bg-[#f59e0b] hover:bg-white text-[#000000] text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {requestingPayout ? 'Submitting...' : 'Request Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE MAINTENANCE MODAL */}
      {maintenanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/85 backdrop-blur-md">
          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] max-w-md w-full p-6 space-y-4 shadow-2xl text-[#ffffff]">
            <h3 className="font-display text-base font-bold text-[#ffffff]">
              Schedule Fleet Maintenance Period
            </h3>
            <p className="text-xs text-[#a3a3a3]">
              Block dates from public search and booking engine during vehicle servicing.
            </p>
            <form onSubmit={handleAddMaintenance} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#ffffff]">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={maintStart}
                  onChange={(e) => setMaintStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#ffffff]">End Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={maintEnd}
                  onChange={(e) => setMaintEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#ffffff]">Reason / Service Details *</label>
                <input
                  type="text"
                  required
                  value={maintReason}
                  onChange={(e) => setMaintReason(e.target.value)}
                  placeholder="e.g. 20,000 km general service & brake inspection"
                  className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-[#ffffff] font-semibold focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setMaintenanceModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#262626] text-xs font-semibold text-[#a3a3a3] hover:text-[#ffffff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#f59e0b] hover:bg-white text-[#000000] text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Schedule Maintenance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
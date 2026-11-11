import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { adminService } from '../../services/adminService';
import { Booking, Refund, SupportTicket, Vehicle, Vendor } from '../../types';
import { formatINR, formatDate, formatDateTime, getStatusBadgeClass } from '../../utils/format';
import { ChartAreaInteractive } from '../../components/chart-area-interactive';
import {
  LayoutDashboard,
  CalendarCheck,
  Car,
  Users,
  CreditCard,
  MapPin,
  Wrench,
  TrendingUp,
  Settings,
  Download,
  Share2,
  MoreVertical,
  Search,
  Star,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Crown,
  ShieldCheck,
  Percent,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  DollarSign,
  Filter,
  Check,
  Ban,
  X,
  SlidersHorizontal,
  Sun,
  Moon,
  FileText,
  Building2,
  Lock,
  Bell,
  LogOut,
  ExternalLink,
  Plus,
  RefreshCw,
  ArrowUpRight,
  Zap,
  Fuel,
  Layers,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const isLight = theme === 'light';

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'reservations' | 'fleet' | 'vendors' | 'payments' | 'locations' | 'maintenance' | 'commission' | 'support' | 'settings'
  >('dashboard');

  const [stats, setStats] = useState<any>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState('Monthly');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Commission Edit
  const [commissionRate, setCommissionRate] = useState<number>(10.0);
  const [savingCommission, setSavingCommission] = useState(false);
  // Profile Popup Modal State
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Tab Filter States
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'ESCROW' | 'COMPLETED' | 'REFUNDED'>('ALL');
  const [maintenanceFilter, setMaintenanceFilter] = useState<'ALL' | 'IN_SERVICE' | 'SCHEDULED' | 'COMPLETED'>('ALL');

  // Operational Settings State
  const [settingsState, setSettingsState] = useState({
    escrowRefundHours: 24,
    autoFastagDeduction: true,
    instantConfirmation: true,
    razorpayLiveMode: false,
    minFastagBalance: 1500,
    notifyOnNewBooking: true,
    autoModerateYellowPlates: true,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Maintenance & Locations state for interactivity
  const [maintenanceList, setMaintenanceList] = useState([
    {
      id: 'm-1',
      car: 'BMW X5 xDrive40i',
      plate: 'DL-01-AX-9921',
      serviceType: '15,000 km Scheduled Service & Brake Pad Inspection',
      facility: 'Deutsche Motoren BMW Authorized Service, Okhla',
      scheduledReturn: 'Tomorrow, 05:00 PM',
      priority: 'ROUTINE',
      cost: 18500,
      status: 'IN_SERVICE',
    },
    {
      id: 'm-2',
      car: 'Tesla Model 3 Long Range',
      plate: 'HR-26-EE-4102',
      serviceType: 'Cabin Air Filter & High-Speed Wheel Balancing',
      facility: 'DriveLoop EV SuperHub, Cyber City',
      scheduledReturn: 'Today, 07:00 PM',
      priority: 'NORMAL',
      cost: 4200,
      status: 'IN_SERVICE',
    },
    {
      id: 'm-3',
      car: 'Mahindra Thar 4x4 Hardtop',
      plate: 'DL-03-TC-8820',
      serviceType: 'Suspension Inspection & 4x4 Transfer Case Oil Renewal',
      facility: 'Mahindra Prime Workshop, Gurgaon',
      scheduledReturn: '11 Nov 2026',
      priority: 'URGENT',
      cost: 8900,
      status: 'IN_SERVICE',
    },
    {
      id: 'm-4',
      car: 'Toyota Fortuner Legender',
      plate: 'UP-16-BR-1100',
      serviceType: 'Annual Commercial Fitness Inspection & Yellow Plate Renewal',
      facility: 'Transport Authority Regional Testing Center',
      scheduledReturn: '12 Nov 2026',
      priority: 'SCHEDULED',
      cost: 6500,
      status: 'SCHEDULED',
    },
    {
      id: 'm-5',
      car: 'Hyundai Creta SX Turbo',
      plate: 'DL-09-CD-3344',
      serviceType: 'FASTag Balance Auto-Topup & Windshield Sensor Calibration',
      facility: 'DriveLoop Fleet Hub, Aerocity',
      scheduledReturn: 'Ready for Dispatch',
      priority: 'NORMAL',
      cost: 1500,
      status: 'COMPLETED',
    },
  ]);

  const [locationList, setLocationList] = useState([
    {
      id: 'hub-1',
      name: 'Delhi NCR — IGI Airport Terminal 3',
      city: 'Delhi',
      category: 'Primary Airport Hub',
      address: 'Terminal 3 Commercial Express Concourse, Aerocity, New Delhi',
      capacity: '65 / 80 Vehicles',
      percent: 81,
      supervisor: 'Rajat Sharma',
      phone: '+91 98110-23456',
      status: 'OPERATIONAL',
      fastagSync: 'Online',
    },
    {
      id: 'hub-2',
      name: 'Gurgaon — Cyber Hub DLF Phase 2',
      city: 'Gurgaon',
      category: 'Corporate Express Station',
      address: 'Building 10 Ground Concourse, Cyber City, Gurgaon',
      capacity: '42 / 50 Vehicles',
      percent: 84,
      supervisor: 'Priya Sen',
      phone: '+91 98110-34567',
      status: 'OPERATIONAL',
      fastagSync: 'Online',
    },
    {
      id: 'hub-3',
      name: 'Noida — Sector 18 Central Station',
      city: 'Noida',
      category: 'Urban Metro Hub',
      address: 'Atta Market Main Concourse, Sector 18, Noida',
      capacity: '35 / 45 Vehicles',
      percent: 77,
      supervisor: 'Amit Varma',
      phone: '+91 98110-45678',
      status: 'OPERATIONAL',
      fastagSync: 'Online',
    },
    {
      id: 'hub-4',
      name: 'Jaipur — Sanganer Airport Station',
      city: 'Jaipur',
      category: 'Heritage & Highway Hub',
      address: 'Airport Departure Ring Concourse, Sanganer, Jaipur',
      capacity: '28 / 40 Vehicles',
      percent: 70,
      supervisor: 'Vikram Rathore',
      phone: '+91 98110-56789',
      status: 'OPERATIONAL',
      fastagSync: 'Online',
    },
    {
      id: 'hub-5',
      name: 'Chandigarh — Sector 17 City Center',
      city: 'Chandigarh',
      category: 'Hills Gateway Concourse',
      address: 'Bridge Concourse, Sector 17-C, Chandigarh',
      capacity: '30 / 35 Vehicles',
      percent: 85,
      supervisor: 'Gurpreet Singh',
      phone: '+91 98110-67890',
      status: 'OPERATIONAL',
      fastagSync: 'Online',
    },
    {
      id: 'hub-6',
      name: 'Bengaluru — Kempegowda Airport T1',
      city: 'Bengaluru',
      category: 'Southern Tech Hub',
      address: 'P4 Commercial Parking Concourse, Devanahalli, Bengaluru',
      capacity: '40 / 50 Vehicles',
      percent: 80,
      supervisor: 'Karthik Menon',
      phone: '+91 98110-78901',
      status: 'OPERATIONAL',
      fastagSync: 'Online',
    },
  ]);

  const mockPayments = [
    {
      id: 'TXN-90124',
      bookingCode: 'DL-90124',
      customer: 'James Carter',
      email: 'james.carter@gmail.com',
      vehicle: 'Tesla Model 3 Electric',
      amount: 3200,
      escrowDeposit: 5000,
      gateway: 'Razorpay UPI (Axis)',
      status: 'ESCROW_HELD',
      date: 'Today, 10:45 AM',
    },
    {
      id: 'TXN-90123',
      bookingCode: 'DL-90123',
      customer: 'Sarah Mitchell',
      email: 'sarah.mitchell@example.com',
      vehicle: 'BMW X5 xDrive40i',
      amount: 5400,
      escrowDeposit: 10000,
      gateway: 'Visa Card •••• 4242',
      status: 'SETTLED',
      date: 'Yesterday, 04:20 PM',
    },
    {
      id: 'TXN-90122',
      bookingCode: 'DL-90122',
      customer: 'Daniel Thompson',
      email: 'daniel.t@example.com',
      vehicle: 'Toyota Camry Hybrid',
      amount: 2100,
      escrowDeposit: 5000,
      gateway: 'HDFC NetBanking',
      status: 'REFUNDED',
      date: '08 Nov 2026, 11:30 AM',
    },
    {
      id: 'TXN-90121',
      bookingCode: 'DL-90121',
      customer: 'Emily Roberts',
      email: 'emily.roberts@example.com',
      vehicle: 'Audi Q7 55 TFSI',
      amount: 4800,
      escrowDeposit: 10000,
      gateway: 'Razorpay UPI (Google Pay)',
      status: 'ESCROW_HELD',
      date: '08 Nov 2026, 09:15 AM',
    },
    {
      id: 'TXN-90120',
      bookingCode: 'DL-90120',
      customer: 'Michael Johnson',
      email: 'michael.j@example.com',
      vehicle: 'Hyundai Elantra Turbo',
      amount: 1800,
      escrowDeposit: 3000,
      gateway: 'Mastercard •••• 8821',
      status: 'SETTLED',
      date: '07 Nov 2026, 06:10 PM',
    },
    {
      id: 'TXN-90119',
      bookingCode: 'DL-90119',
      customer: 'Ananya Deshmukh',
      email: 'ananya.d@example.com',
      vehicle: 'Mahindra Thar 4x4',
      amount: 2900,
      escrowDeposit: 5000,
      gateway: 'PhonePe UPI',
      status: 'REFUNDED',
      date: '06 Nov 2026, 02:45 PM',
    },
  ];


  // Ticket Reply Modal
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('RESOLVED');
  const [sendingReply, setSendingReply] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getVehicleImage = (images?: any[]): string => {
    if (!images || images.length === 0) return 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80';
    const first = images[0];
    if (typeof first === 'string') return first;
    return first?.url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80';
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [s, v, b, r, veh, t] = await Promise.all([
        adminService.getStats().catch(() => ({ overview: null })),
        adminService.getVendors().catch(() => []),
        adminService.getAllBookings().catch(() => []),
        adminService.getRefunds().catch(() => []),
        adminService.getAllVehicles().catch(() => []),
        adminService.getSupportTickets().catch(() => []),
      ]);
      setStats(s?.overview || null);
      setVendors(v || []);
      setBookings(b || []);
      setRefunds(r || []);
      setVehicles(veh || []);
      setTickets(t || []);
      if (s?.overview?.defaultCommissionRate) {
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
      showToast(`Vendor status updated to ${status}.`);
      fetchAdminData();
    } catch (err: any) {
      alert(`Error updating vendor: ${err.message}`);
    }
  };

  const handleModerateVehicle = async (vehicleId: string, isApproved: boolean) => {
    try {
      await adminService.moderateVehicle(vehicleId, isApproved);
      showToast(`Vehicle listing ${isApproved ? 'approved' : 'suspended'}.`);
      fetchAdminData();
    } catch (err: any) {
      alert(`Error updating vehicle: ${err.message}`);
    }
  };

  const handleProcessRefund = async (refundId: string) => {
    try {
      await adminService.processRefund(refundId);
      showToast('Deposit refund processed successfully.');
      fetchAdminData();
    } catch (err: any) {
      alert(`Refund error: ${err.message}`);
    }
  };

  const handleSaveCommission = async () => {
    setSavingCommission(true);
    try {
      await adminService.updateCommission(commissionRate);
      showToast('Platform commission rate updated.');
      fetchAdminData();
    } catch (err: any) {
      alert(`Commission error: ${err.message}`);
    } finally {
      setSavingCommission(false);
    }
  };

  const handleExportData = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'BookingCode,Customer,Vehicle,PickupDate,Amount,Status\n' +
      bookings
        .map(
          (b) =>
            `"${b.bookingCode}","${b.customer?.firstName} ${b.customer?.lastName}","${b.vehicle?.brand} ${b.vehicle?.model}","${new Date(b.startDate).toLocaleDateString()}","${b.totalAmount}","${b.status}"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `drivelux_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report CSV exported successfully.');
  };

  const handleShareReport = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Dashboard report link copied to clipboard!');
    }
  };

  const handleEscrowRefund = (txnId: string) => {
    showToast(`Security deposit escrow refund initiated for ${txnId} via Razorpay Gateway.`);
  };

  const handleCompleteMaintenance = (mId: string) => {
    setMaintenanceList((prev) =>
      prev.map((item) => (item.id === mId ? { ...item, status: 'COMPLETED', scheduledReturn: 'Ready for Dispatch' } : item))
    );
    showToast('Vehicle maintenance verified & car released back to active fleet.');
  };

  const handleAddLocation = () => {
    showToast('New Regional Hub wizard initialized: Mumbai BKC Express Hub added to network.');
  };

  const handleSaveAllSettings = () => {
    setSavingSettings(true);
    setTimeout(() => {
      setSavingSettings(false);
      showToast('All marketplace operational parameters saved successfully.');
    }, 600);
  };


  // Sparkline generator helper
  const renderSparkline = (heights: number[], colorClass: string) => (
    <div className="flex items-end gap-[3px] h-6 pt-1">
      {heights.map((h, i) => (
        <div
          key={i}
          style={{ height: `${h}%` }}
          className={`w-[3px] rounded-full transition-all duration-300 hover:opacity-100 opacity-60 ${colorClass}`}
        />
      ))}
    </div>
  );

  // Monthly Overview bars
  const monthlyData = [
    { month: 'Jan', value: 38 },
    { month: 'Feb', value: 45 },
    { month: 'Mar', value: 58 },
    { month: 'Apr', value: 72 },
    { month: 'May', value: 85 },
    { month: 'Jun', value: 100, active: true, label: '212 bookings' },
    { month: 'Jul', value: 88 },
    { month: 'Aug', value: 50 },
    { month: 'Sep', value: 65 },
    { month: 'Oct', value: 92 },
    { month: 'Nov', value: 70 },
    { month: 'Dec', value: 78 },
  ];

  // Default fallback bookings if list is empty
  const displayBookings =
    bookings.length > 0
      ? bookings.filter((b) => {
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (
            b.bookingCode?.toLowerCase().includes(q) ||
            b.customer?.firstName?.toLowerCase().includes(q) ||
            b.customer?.lastName?.toLowerCase().includes(q) ||
            b.vehicle?.brand?.toLowerCase().includes(q) ||
            b.vehicle?.model?.toLowerCase().includes(q)
          );
        })
      : [
          {
            id: 'res-1',
            bookingCode: 'DRV-2026-T3LA',
            status: 'CONFIRMED',
            startDate: new Date('2026-06-16T10:00:00Z'),
            totalAmount: 376,
            customer: {
              firstName: 'James',
              lastName: 'Carter',
              email: 'james.carter@gmail.com',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
            },
            vehicle: {
              brand: 'Tesla',
              model: 'Model 3',
              category: 'Electric',
              images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=300&q=80'],
            },
          },
          {
            id: 'res-2',
            bookingCode: 'DRV-2026-BMWX',
            status: 'CONFIRMED',
            startDate: new Date('2026-06-17T09:30:00Z'),
            totalAmount: 540,
            customer: {
              firstName: 'Sarah',
              lastName: 'Mitchell',
              email: 'sarah.mitchell@example.com',
              avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
            },
            vehicle: {
              brand: 'BMW',
              model: 'X5',
              category: 'SUV',
              images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300&q=80'],
            },
          },
          {
            id: 'res-3',
            bookingCode: 'DRV-2026-TYCA',
            status: 'PENDING',
            startDate: new Date('2026-06-18T11:00:00Z'),
            totalAmount: 210,
            customer: {
              firstName: 'Daniel',
              lastName: 'Thompson',
              email: 'daniel.t@example.com',
              avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
            },
            vehicle: {
              brand: 'Toyota',
              model: 'Camry',
              category: 'Sedan',
              images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=300&q=80'],
            },
          },
          {
            id: 'res-4',
            bookingCode: 'DRV-2026-ADQ7',
            status: 'CONFIRMED',
            startDate: new Date('2026-06-18T14:00:00Z'),
            totalAmount: 480,
            customer: {
              firstName: 'Emily',
              lastName: 'Roberts',
              email: 'emily.roberts@example.com',
              avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
            },
            vehicle: {
              brand: 'Audi',
              model: 'Q7',
              category: 'SUV',
              images: ['https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?w=300&q=80'],
            },
          },
          {
            id: 'res-5',
            bookingCode: 'DRV-2026-HYEL',
            status: 'COMPLETED',
            startDate: new Date('2026-06-19T10:30:00Z'),
            totalAmount: 180,
            customer: {
              firstName: 'Michael',
              lastName: 'Johnson',
              email: 'michael.j@example.com',
              avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
            },
            vehicle: {
              brand: 'Hyundai',
              model: 'Elantra',
              category: 'Sedan',
              images: ['https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=300&q=80'],
            },
          },
        ];

  return (
    <div
      className={`h-screen w-screen overflow-hidden flex transition-colors duration-200 ${
        isLight ? 'bg-white text-slate-900' : 'bg-black text-white'
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold shadow-2xl border border-neutral-700 animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* ============================================================== */}
      {/* LEFT SIDEBAR (Matching reference layout) */}
      {/* ============================================================== */}
      <aside
        className={`w-72 shrink-0 border-r p-5 flex flex-col justify-between h-full hidden lg:flex select-none transition-colors ${
          isLight ? 'border-slate-200/80 bg-white' : 'border-neutral-800/80 bg-[#0A0A0B]'
        }`}
      >
        {/* Top Section: Brand, Search, Scrollable Menu */}
        <div className="flex flex-col min-h-0 flex-1 overflow-hidden space-y-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center justify-between px-1 shrink-0">
            <Link
              to="/"
              title="Return to DriveLoop Public Marketplace"
              className="flex items-center space-x-3 group cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-xs transition-colors ${
                  isLight ? 'bg-black text-white group-hover:bg-slate-800' : 'bg-white text-black group-hover:bg-neutral-200'
                }`}
              >
                <Car className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="font-display text-base font-bold tracking-tight leading-none group-hover:text-white transition-colors">
                  DriveLux Rentals
                </h1>
                <p
                  className={`text-xs mt-0.5 font-medium ${
                    isLight ? 'text-slate-400' : 'text-neutral-400'
                  }`}
                >
                  Car Rental Management
                </p>
              </div>
            </Link>
            <button
              type="button"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-neutral-500 hover:text-white hover:bg-neutral-800'
              }`}
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Global Search Input */}
          <div className="relative shrink-0">
            <Search
              className={`w-4 h-4 absolute left-3.5 top-2.5 ${
                isLight ? 'text-slate-400' : 'text-neutral-500'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything..."
              className={`w-full pl-9 pr-14 py-2 text-xs font-medium rounded-xl border focus:outline-none transition-all ${
                isLight
                  ? 'border-slate-200 bg-slate-50/70 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-400'
                  : 'border-neutral-800 bg-[#121316] text-white placeholder-neutral-500 focus:border-neutral-700'
              }`}
            />
            <span
              className={`absolute right-2.5 top-2 text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                isLight
                  ? 'border-slate-200 text-slate-400 bg-white'
                  : 'border-neutral-800 text-neutral-400 bg-neutral-900'
              }`}
            >
              Ctrl K
            </span>
          </div>

          {/* Navigation Menu (Grouped matching reference image) */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-0.5">
            {/* OVERVIEW */}
            <div>
              <span
                className={`block text-[11px] font-mono uppercase tracking-wider px-3 mb-1.5 font-bold ${
                  isLight ? 'text-slate-400' : 'text-neutral-500'
                }`}
              >
                Overview
              </span>
              <button
                data-tab="dashboard"
                aria-label="Tab Dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? isLight
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-[#F5E6D3] text-black shadow-xs font-bold'
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <LayoutDashboard className={`w-4.5 h-4.5 ${activeTab === 'dashboard' ? (isLight ? 'text-white' : 'text-black') : 'opacity-70'}`} />
                  <span>Dashboard</span>
                </div>
              </button>
            </div>

            {/* OPERATIONS */}
            <div>
              <span
                className={`block text-[11px] font-mono uppercase tracking-wider px-3 mb-1.5 font-bold ${
                  isLight ? 'text-slate-400' : 'text-neutral-500'
                }`}
              >
                Operations
              </span>
              <div className="space-y-1">
                {[
                  { id: 'reservations', label: 'Reservations', icon: CalendarCheck, count: '5' },
                  { id: 'fleet', label: 'Fleet', icon: Car, count: '16' },
                  { id: 'vendors', label: 'Customers', icon: Users, count: '2,450' },
                  { id: 'payments', label: 'Payments', icon: CreditCard },
                  { id: 'locations', label: 'Locations', icon: MapPin },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      data-tab={item.id}
                      aria-label={`Tab ${item.label}`}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        isActive
                          ? isLight
                            ? 'bg-black text-white shadow-xs font-bold'
                            : 'bg-white text-black shadow-xs font-bold'
                          : isLight
                          ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4.5 h-4.5 ${isActive ? (isLight ? 'text-white' : 'text-black') : 'opacity-70'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && (
                        <span
                          className={`text-xs font-mono px-2 py-0.5 rounded-md ${
                            isActive
                              ? isLight
                                ? 'bg-slate-800 text-white'
                                : 'bg-neutral-200 text-black'
                              : isLight
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MANAGEMENT */}
            <div>
              <span
                className={`block text-[11px] font-mono uppercase tracking-wider px-3 mb-1.5 font-bold ${
                  isLight ? 'text-slate-400' : 'text-neutral-500'
                }`}
              >
                Management
              </span>
              <div className="space-y-1">
                {[
                  { id: 'maintenance', label: 'Maintenance', icon: Wrench, count: '18' },
                  { id: 'commission', label: 'Analytics', icon: TrendingUp },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      data-tab={item.id}
                      aria-label={`Tab ${item.label}`}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        isActive
                          ? isLight
                            ? 'bg-black text-white shadow-xs font-bold'
                            : 'bg-white text-black shadow-xs font-bold'
                          : isLight
                          ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4.5 h-4.5 ${isActive ? (isLight ? 'text-white' : 'text-black') : 'opacity-70'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && (
                        <span
                          className={`text-xs font-mono px-2 py-0.5 rounded-md ${
                            isActive
                              ? isLight
                                ? 'bg-slate-800 text-white'
                                : 'bg-neutral-200 text-black'
                              : isLight
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Upgrade Card & Admin Profile - Pinned at bottom, always visible */}
        <div className="shrink-0 pt-3 border-t border-dashed border-neutral-200/60 dark:border-neutral-800 space-y-2.5">
          {/* Upgrade Card Banner */}
          <div
            className={`p-3 rounded-xl border relative overflow-hidden ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-900'
                : 'bg-neutral-900/60 border-neutral-800 text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1.5 text-amber-400">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold tracking-tight text-white dark:text-neutral-200">Upgrade to Pro</span>
              </div>
              <button
                onClick={() => showToast('Enterprise Pro tier features active on this instance.')}
                className="inline-flex items-center text-neutral-400 hover:text-white cursor-pointer"
                title="Upgrade"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
              Unlock advanced analytics, unlimited locations and priority support.
            </p>
          </div>

          {/* Administrator Profile Row with Interactive Popover */}
          <div className="relative">
            {/* Interactive Profile Popup Modal */}
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div
                  className={`absolute bottom-full left-0 mb-3 w-72 rounded-2xl border p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.14)]'
                      : 'bg-[#0A0A0A] border-neutral-800 text-white shadow-[0_25px_60px_rgba(0,0,0,0.95)]'
                  }`}
                >
                  {/* Profile Header */}
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-neutral-800/80">
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80"
                        alt="Admin Avatar"
                        className="w-10 h-10 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold truncate">Alex Morgan</p>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-white/10 text-white border border-white/20">
                          PRO
                        </span>
                      </div>
                      <p className={`text-[10px] truncate ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                        admin@drivio.com
                      </p>
                      <p className="text-[10px] text-neutral-400 font-semibold mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Super Administrator
                      </p>
                    </div>
                  </div>

                  {/* Actions & Settings List */}
                  <div className="py-2.5 space-y-1 text-xs font-medium">
                    {/* Theme Mode Toggle Button */}
                    <button
                      onClick={toggleTheme}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/5 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        {isLight ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-400" />}
                        <span>{isLight ? 'Switch to Black Mode' : 'Switch to Light Mode'}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-neutral-800 text-neutral-400'}`}>
                        {isLight ? 'Light' : 'OLED'}
                      </span>
                    </button>

                    {/* Quick Settings */}
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setIsProfileOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/5 text-neutral-300'
                      }`}
                    >
                      <Settings className="w-4 h-4 text-neutral-400" />
                      <span>Console Preferences</span>
                    </button>

                    {/* Return to Public Site */}
                    <Link
                      to="/"
                      onClick={() => setIsProfileOpen(false)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/5 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <ExternalLink className="w-4 h-4 text-emerald-500" />
                        <span>Public Marketplace</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                    </Link>
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-neutral-800/80">
                    <button
                      onClick={logout}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out of Console</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Administrator Profile Trigger Row */}
            <div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`flex items-center justify-between p-1.5 -mx-1 rounded-xl cursor-pointer transition-colors ${
                isLight ? 'hover:bg-slate-100' : 'hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80"
                    alt="Admin Avatar"
                    className="w-9 h-9 rounded-full object-cover border border-neutral-300 dark:border-neutral-700 shrink-0"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-white ring-1 ring-white dark:ring-black" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate leading-tight">Alex Morgan</p>
                  <p className={`text-xs truncate mt-0.5 ${isLight ? 'text-slate-400' : 'text-neutral-400'}`}>
                    Administrator
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                  isLight
                    ? 'border-slate-200 hover:bg-slate-200 text-slate-600'
                    : 'border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
                title="Account options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MAIN WORKSPACE CONTENT */}
      {/* ============================================================== */}
      <main className="flex-1 h-full p-5 sm:p-6 lg:p-8 min-w-0 overflow-y-auto space-y-6">
          {/* Header Row: Title & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className={`text-2xl sm:text-[28px] font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {activeTab === 'dashboard'
                  ? 'Dashboard'
                  : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
            </div>

            <div className="flex items-center space-x-2.5">
              {/* Fleet Ops (shadcn) Navigation */}
              <Link
                to="/fleet-ops"
                className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shadow-xs ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                    : 'bg-[#141416] border-neutral-800 text-neutral-200 hover:border-neutral-700 hover:bg-neutral-800/80'
                }`}
              >
                <Layers className="w-3.5 h-3.5 opacity-80" />
                <span>Fleet Ops Console</span>
              </Link>

              {/* Export Button */}
              <button
                onClick={handleExportData}
                className={`px-4 py-2 rounded-full border text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-sm ${
                  isLight
                    ? 'bg-black text-white hover:bg-slate-800 border-black'
                    : 'bg-white text-black hover:bg-neutral-200 border-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" strokeWidth={2.2} />
                <span>Export</span>
              </button>

              {/* Share Button */}
              <button
                onClick={handleShareReport}
                className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shadow-xs ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                    : 'bg-[#141416] border-neutral-800 text-neutral-200 hover:border-neutral-700 hover:bg-neutral-800/80'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 opacity-80" />
                <span>Share</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                className={`w-9 h-9 rounded-full border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    : 'bg-[#141416] border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
                }`}
              >
                {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              {/* More Actions Dropdown */}
              <button
                onClick={() => showToast('Refreshed live telemetry.')}
                className={`w-9 h-9 rounded-full border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    : 'bg-[#141416] border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
                }`}
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ========================================================== */}
          {/* TAB 1: MAIN DASHBOARD VIEW (MATCHING ATTACHED IMAGE) */}
          {/* ========================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* TOP 4 STAT CARDS WITH CURVED AREA SPARKLINE SPLINES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Revenue */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 shadow-xs relative overflow-hidden flex flex-col justify-between ${
                    isLight ? 'bg-white border-slate-200/80 hover:border-slate-300' : 'bg-[#0E0F12] border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                        isLight ? 'bg-amber-100/70 text-amber-900 border border-amber-200' : 'bg-[#2A241A] text-[#F5E6D3] border border-[#423826]'
                      }`}>
                        <DollarSign className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className={`text-xs font-semibold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          Total Revenue
                        </h3>
                        <p className={`text-[11px] font-normal ${isLight ? 'text-slate-400' : 'text-neutral-400'}`}>
                          vs last month
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span>↑</span> +12.4%
                    </span>
                  </div>

                  <div className="mt-4 mb-1">
                    <p className={`text-2xl sm:text-[28px] font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      ${((stats?.grossBookingValue || 12845000) / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                  </div>

                  <div className="w-full h-12 -mx-1 -mb-3 pt-1">
                    <svg viewBox="0 0 240 50" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#E5BA73" stopOpacity={0.45} />
                          <stop offset="60%" stopColor="#E5BA73" stopOpacity={0.12} />
                          <stop offset="100%" stopColor="#E5BA73" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 38 C 30 42, 60 22, 95 30 C 130 38, 160 14, 195 20 C 215 24, 230 18, 240 16 L 240 50 L 0 50 Z"
                        fill="url(#revenueGrad)"
                      />
                      <path
                        d="M 0 38 C 30 42, 60 22, 95 30 C 130 38, 160 14, 195 20 C 215 24, 230 18, 240 16"
                        fill="none"
                        stroke="#E5BA73"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* 2. Active Rentals */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 shadow-xs relative overflow-hidden flex flex-col justify-between ${
                    isLight ? 'bg-white border-slate-200/80 hover:border-slate-300' : 'bg-[#0E0F12] border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                        isLight ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-[#1C1D22] text-neutral-300 border border-neutral-800'
                      }`}>
                        <CalendarCheck className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className={`text-xs font-semibold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          Active Rentals
                        </h3>
                        <p className={`text-[11px] font-normal ${isLight ? 'text-slate-400' : 'text-neutral-400'}`}>
                          vs last month
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span>↑</span> +8.7%
                    </span>
                  </div>

                  <div className="mt-4 mb-1">
                    <p className={`text-2xl sm:text-[28px] font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {stats?.totalBookings ? Math.min(stats.totalBookings, 364) : 364}
                    </p>
                  </div>

                  <div className="w-full h-12 -mx-1 -mb-3 pt-1">
                    <svg viewBox="0 0 240 50" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={isLight ? '#475569' : '#FFFFFF'} stopOpacity={isLight ? 0.35 : 0.22} />
                          <stop offset="100%" stopColor={isLight ? '#475569' : '#FFFFFF'} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 42 C 35 44, 65 30, 100 34 C 135 38, 165 18, 195 24 C 215 28, 230 16, 240 20 L 240 50 L 0 50 Z"
                        fill="url(#activeGrad)"
                      />
                      <path
                        d="M 0 42 C 35 44, 65 30, 100 34 C 135 38, 165 18, 195 24 C 215 28, 230 16, 240 20"
                        fill="none"
                        stroke={isLight ? '#475569' : '#FFFFFF'}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* 3. Available Cars */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 shadow-xs relative overflow-hidden flex flex-col justify-between ${
                    isLight ? 'bg-white border-slate-200/80 hover:border-slate-300' : 'bg-[#0E0F12] border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                        isLight ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-[#1C1D22] text-neutral-300 border border-neutral-800'
                      }`}>
                        <Car className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className={`text-xs font-semibold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          Available Cars
                        </h3>
                        <p className={`text-[11px] font-normal ${isLight ? 'text-slate-400' : 'text-neutral-400'}`}>
                          vs last month
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span>↑</span> +5.3%
                    </span>
                  </div>

                  <div className="mt-4 mb-1">
                    <p className={`text-2xl sm:text-[28px] font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {stats?.activeVehicles || 112}
                    </p>
                  </div>

                  <div className="w-full h-12 -mx-1 -mb-3 pt-1">
                    <svg viewBox="0 0 240 50" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="availableGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={isLight ? '#475569' : '#FFFFFF'} stopOpacity={isLight ? 0.35 : 0.22} />
                          <stop offset="100%" stopColor={isLight ? '#475569' : '#FFFFFF'} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 38 C 30 40, 65 24, 105 30 C 145 36, 175 14, 205 18 C 220 20, 230 15, 240 17 L 240 50 L 0 50 Z"
                        fill="url(#availableGrad)"
                      />
                      <path
                        d="M 0 38 C 30 40, 65 24, 105 30 C 145 36, 175 14, 205 18 C 220 20, 230 15, 240 17"
                        fill="none"
                        stroke={isLight ? '#475569' : '#FFFFFF'}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* 4. Cars in Maintenance */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 shadow-xs relative overflow-hidden flex flex-col justify-between ${
                    isLight ? 'bg-white border-slate-200/80 hover:border-slate-300' : 'bg-[#0E0F12] border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                        isLight ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-[#1C1D22] text-neutral-300 border border-neutral-800'
                      }`}>
                        <Wrench className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className={`text-xs font-semibold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          Cars in Maintenance
                        </h3>
                        <p className={`text-[11px] font-normal ${isLight ? 'text-slate-400' : 'text-neutral-400'}`}>
                          vs last month
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span>↑</span> +2.1%
                    </span>
                  </div>

                  <div className="mt-4 mb-1">
                    <p className={`text-2xl sm:text-[28px] font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      18
                    </p>
                  </div>

                  <div className="w-full h-12 -mx-1 -mb-3 pt-1">
                    <svg viewBox="0 0 240 50" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="maintenanceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={isLight ? '#475569' : '#FFFFFF'} stopOpacity={isLight ? 0.35 : 0.22} />
                          <stop offset="100%" stopColor={isLight ? '#475569' : '#FFFFFF'} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 42 C 35 40, 70 20, 105 28 C 140 36, 175 14, 205 22 C 220 26, 235 18, 240 22 L 240 50 L 0 50 Z"
                        fill="url(#maintenanceGrad)"
                      />
                      <path
                        d="M 0 42 C 35 40, 70 20, 105 28 C 140 36, 175 14, 205 22 C 220 26, 235 18, 240 22"
                        fill="none"
                        stroke={isLight ? '#475569' : '#FFFFFF'}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* MAIN 2-COLUMN SECTION: Left (8 cols) & Right (4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* -------------------------------------------------------- */}
                {/* LEFT COLUMN: RENTAL OVERVIEW + RECENT RESERVATIONS (8 cols) */}
                {/* -------------------------------------------------------- */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Card 1: Replaced with exact Monochromatic Area Progress Chart */}
                  <ChartAreaInteractive title="Total Visitors" />

                  {/* Card 2: Recent Reservations Table */}
                  <div
                    className={`p-5 sm:p-6 rounded-2xl border shadow-xs space-y-4 ${
                      isLight ? 'bg-white border-slate-200/80' : 'bg-[#0E0F12] border-neutral-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs font-bold text-white">
                        <CalendarCheck className="w-4 h-4 text-neutral-300" />
                        <span>Recent Reservations</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('reservations')}
                        className={`text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                          isLight ? 'text-slate-600 hover:text-black' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <span>View all</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr
                            className={`border-b text-[10px] font-mono uppercase tracking-wider ${
                              isLight ? 'border-slate-100 text-slate-400' : 'border-neutral-800/80 text-neutral-500'
                            }`}
                          >
                            <th className="pb-3 font-medium">Customer</th>
                            <th className="pb-3 font-medium">Car</th>
                            <th className="pb-3 font-medium">Pickup Date</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/60">
                          {displayBookings.slice(0, 5).map((res) => (
                            <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                              {/* Customer */}
                              <td className="py-3.5 pr-3">
                                <div className="flex items-center space-x-2.5">
                                  <img
                                    src={
                                      (res.customer as any)?.avatarUrl ||
                                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'
                                    }
                                    alt="Customer"
                                    className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-neutral-700"
                                  />
                                  <span className="font-bold text-xs text-white">
                                    {res.customer?.firstName} {res.customer?.lastName}
                                  </span>
                                </div>
                              </td>

                              {/* Car */}
                              <td className="py-3.5 pr-3">
                                <div className="flex items-center space-x-2.5">
                                  <img
                                    src={getVehicleImage(res.vehicle?.images)}
                                    alt="Car"
                                    className="w-8 h-6 rounded object-cover shrink-0 border border-slate-200 dark:border-neutral-800 bg-neutral-900"
                                  />
                                  <span className="font-semibold text-xs text-white">
                                    {res.vehicle?.brand} {res.vehicle?.model}
                                  </span>
                                </div>
                              </td>

                              {/* Pickup Date */}
                              <td className="py-3.5 pr-3 text-xs text-neutral-300 font-medium">
                                {new Date(res.startDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </td>

                              {/* Status Badge */}
                              <td className="py-3.5 pr-3">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-neutral-900 border border-neutral-700 text-neutral-200">
                                  {(res.status || 'Confirmed').charAt(0).toUpperCase() + (res.status || 'Confirmed').slice(1).toLowerCase()}
                                </span>
                              </td>

                              {/* Amount */}
                              <td className="py-3.5 text-right font-bold tabular-nums text-xs text-white">
                                ${typeof res.totalAmount === 'number' && res.totalAmount > 1000 ? Math.round(res.totalAmount / 85) : res.totalAmount}.00 <span className="opacity-40 text-neutral-400">›</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------- */}
                {/* RIGHT COLUMN: FEATURED VEHICLE (4 cols) */}
                {/* -------------------------------------------------------- */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Featured Vehicle Card */}
                  <div
                    className={`p-5 rounded-2xl border shadow-xs space-y-4 ${
                      isLight ? 'bg-white border-slate-200/80' : 'bg-[#0E0F12] border-neutral-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center space-x-1.5 text-xs font-bold ${isLight ? 'text-slate-900' : 'text-neutral-200'}`}>
                        <Star className="w-3.5 h-3.5 fill-white text-white" />
                        <span>Featured Vehicle</span>
                      </div>
                      <MoreVertical className="w-4 h-4 text-neutral-400 cursor-pointer" />
                    </div>

                    <div>
                      <h4 className="font-bold text-base tracking-tight text-white">BMW X5 xDrive40i</h4>
                      <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-400' : 'text-neutral-400'}`}>
                        Luxury SUV
                      </p>
                    </div>

                    {/* High-res Vehicle Cutout / Photo */}
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gradient-to-b from-transparent to-black/10 flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80"
                        alt="BMW X5 Luxury SUV"
                        className="w-full h-full object-cover rounded-xl shadow-sm"
                      />
                    </div>

                    {/* Specs Pills */}
                    <div className="flex items-center justify-between text-[11px] font-medium text-neutral-300 py-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-neutral-400" /> 5 Seats
                      </span>
                      <span className="flex items-center gap-1">
                        <span>⚙</span> Automatic
                      </span>
                      <span className="flex items-center gap-1">
                        <span>◇</span> Premium
                      </span>
                      <span className="flex items-center gap-1">
                        <span>⛭</span> 4WD
                      </span>
                    </div>

                    {/* Stats List */}
                    <div className="space-y-2.5 text-xs font-medium pt-2 border-t border-neutral-800/80">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-neutral-400">
                          <span className="text-sm">☁</span> Total Fleet
                        </span>
                        <span className="font-bold text-white tabular-nums">250</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-neutral-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" /> Available
                        </span>
                        <span className="font-bold text-white tabular-nums">112</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-neutral-400">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" /> Rented Out
                        </span>
                        <span className="font-bold text-white tabular-nums">120</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-neutral-400">
                          <Wrench className="w-3.5 h-3.5 text-neutral-400" /> Maintenance
                        </span>
                        <span className="font-bold text-white tabular-nums">18</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => setActiveTab('fleet')}
                      className="w-full py-2.5 mt-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs bg-[#F5E6D3] hover:bg-[#ebd5bd] text-black"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>View Fleet</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: RESERVATIONS TAB */}
          {/* ========================================================== */}
          {activeTab === 'reservations' && (
            <div
              className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
                isLight ? 'bg-white border-slate-200/80' : 'bg-[#0A0A0B] border-neutral-800'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base">All Reservations Management</h3>
                <span className="text-xs text-neutral-400">{displayBookings.length} Total</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                {displayBookings.map((b) => (
                  <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        <Car className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{b.bookingCode}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'CONFIRMED'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : b.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-600'
                                : 'bg-white/10 text-white border border-white/20'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {b.vehicle?.brand} {b.vehicle?.model} • Renter: {b.customer?.firstName} {b.customer?.lastName} ({b.customer?.email})
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">{formatINR(b.totalAmount)}</span>
                      <p className="text-[11px] text-neutral-400">{new Date(b.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 3: FLEET MODERATION TAB */}
          {/* ========================================================== */}
          {activeTab === 'fleet' && (
            <div
              className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
                isLight ? 'bg-white border-slate-200/80' : 'bg-[#0A0A0B] border-neutral-800'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base">Fleet Inventory Moderation</h3>
                <span className="text-xs text-neutral-400">{vehicles.length} Active Vehicles</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className={`p-4 rounded-xl border space-y-3 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-black border-neutral-800'
                    }`}
                  >
                    <img
                      src={getVehicleImage(v.images)}
                      alt={v.model}
                      className="w-full h-36 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-bold text-sm">
                        {v.brand} {v.model}
                      </h4>
                      <p className="text-xs text-neutral-400">
                        {v.city} • {formatINR(v.dailyRate)}/day
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleModerateVehicle(v.id, true)}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleModerateVehicle(v.id, false)}
                        className="flex-1 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 font-bold text-xs hover:bg-neutral-700"
                      >
                        Suspend
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 4: VENDOR PARTNERS / KYC TAB */}
          {/* ========================================================== */}
          {activeTab === 'vendors' && (
            <div
              className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
                isLight ? 'bg-white border-slate-200/80' : 'bg-[#0A0A0B] border-neutral-800'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base">Fleet Host & Partner Applications</h3>
                <span className="text-xs text-neutral-400">{vendors.length} Hosts Registered</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                {vendors.map((ven) => (
                  <div key={ven.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{ven.businessName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ven.status === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {ven.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {ven.city}, {ven.state} • Rep: {ven.authorizedPerson} ({ven.contactNumber})
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateVendorStatus(ven.id, 'APPROVED')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                      >
                        Approve Partner
                      </button>
                      <button
                        onClick={() => handleUpdateVendorStatus(ven.id, 'REJECTED')}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600/10 text-rose-500 border border-rose-500/20 text-xs font-bold"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 5: COMMISSION RATES */}
          {/* ========================================================== */}
          {activeTab === 'commission' && (
            <div
              className={`p-6 rounded-2xl border shadow-xs space-y-6 max-w-xl ${
                isLight ? 'bg-white border-slate-200/80' : 'bg-[#0A0A0B] border-neutral-800'
              }`}
            >
              <div>
                <h3 className="font-bold text-base">Standard Platform Fee Configuration</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Configure default marketplace platform take-rate deducted from bookings.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Commission Percentage</span>
                  <span className="text-white font-mono text-lg">{commissionRate}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="0.5"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
                <button
                  onClick={handleSaveCommission}
                  disabled={savingCommission}
                  className="px-5 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  {savingCommission ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          )}
          {/* ========================================================== */}
          {/* TAB 6: PAYMENTS & ESCROW LEDGER */}
          {/* ========================================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              {/* Metric KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isLight ? 'bg-white border-slate-200/80 shadow-xs' : 'bg-[#0A0A0B] border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className={isLight ? 'text-slate-500' : 'text-neutral-400'}>Gross Rental Volume</span>
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold tracking-tight">{formatINR(stats?.totalRevenue || 128450)}</p>
                  <p className="text-[11px] text-emerald-500 font-semibold mt-1">↑ 14.2% settlement velocity</p>
                </div>

                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isLight ? 'bg-white border-slate-200/80 shadow-xs' : 'bg-[#0A0A0B] border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className={isLight ? 'text-slate-500' : 'text-neutral-400'}>Active Escrow Deposits</span>
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold tracking-tight">{formatINR(42500)}</p>
                  <p className="text-[11px] text-amber-500 font-semibold mt-1">Held in 24h refundable escrow</p>
                </div>

                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isLight ? 'bg-white border-slate-200/80 shadow-xs' : 'bg-[#0A0A0B] border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className={isLight ? 'text-slate-500' : 'text-neutral-400'}>Refunded to Renters</span>
                    <RefreshCw className="w-4 h-4 text-neutral-400" />
                  </div>
                  <p className="text-2xl font-bold tracking-tight">{formatINR(18900)}</p>
                  <p className="text-[11px] text-neutral-400 font-medium mt-1">100% 24h deposit compliance</p>
                </div>

                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isLight ? 'bg-white border-slate-200/80 shadow-xs' : 'bg-[#0A0A0B] border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className={isLight ? 'text-slate-500' : 'text-neutral-400'}>Payment Gateway</span>
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-sm">Razorpay UPI & Cards</span>
                  </div>
                  <p className="text-[11px] text-emerald-500 font-semibold mt-1">Zero downtime recorded</p>
                </div>
              </div>

              {/* Transactions Table */}
              <div
                className={`p-5 sm:p-6 rounded-2xl border shadow-xs space-y-4 ${
                  isLight ? 'bg-white border-slate-200/80' : 'bg-[#0A0A0B] border-neutral-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base">Transactions & Escrow Ledger</h3>
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                      Automated 24h security deposit escrow refunds and booking payment records
                    </p>
                  </div>
                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800 text-xs font-semibold">
                    {(['ALL', 'ESCROW', 'COMPLETED', 'REFUNDED'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setPaymentFilter(f)}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          paymentFilter === f
                            ? isLight
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'bg-neutral-800 text-white'
                            : isLight
                            ? 'text-slate-600 hover:text-slate-900'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {f === 'ALL' ? 'All Ledger' : f === 'ESCROW' ? 'Escrow Held' : f === 'COMPLETED' ? 'Settled' : 'Refunded'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ledger Items */}
                <div className="divide-y divide-slate-100 dark:divide-neutral-900">
                  {mockPayments
                    .filter((p) => {
                      if (paymentFilter === 'ESCROW') return p.status === 'ESCROW_HELD';
                      if (paymentFilter === 'COMPLETED') return p.status === 'SETTLED';
                      if (paymentFilter === 'REFUNDED') return p.status === 'REFUNDED';
                      return true;
                    })
                    .map((item) => (
                      <div key={item.id} className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isLight ? 'bg-slate-100 text-slate-800' : 'bg-neutral-900 text-white'
                            }`}
                          >
                            <CreditCard className="w-5 h-5 text-amber-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold">{item.id}</span>
                              <span className="text-neutral-400 text-xs">•</span>
                              <span className="font-semibold text-xs">{item.customer}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.status === 'SETTLED'
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                    : item.status === 'ESCROW_HELD'
                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                    : 'bg-white/10 text-white border border-white/20'
                                }`}
                              >
                                {item.status === 'SETTLED' ? 'Settled' : item.status === 'ESCROW_HELD' ? 'Escrow Deposit Held' : 'Deposit Refunded'}
                              </span>
                            </div>
                            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                              {item.vehicle} • Gateway: {item.gateway} • {item.date}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between lg:justify-end gap-5">
                          <div className="text-right">
                            <p className="font-bold text-sm leading-tight">{formatINR(item.amount)}</p>
                            <p className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                              + {formatINR(item.escrowDeposit)} Escrow
                            </p>
                          </div>
                          {item.status === 'ESCROW_HELD' && (
                            <button
                              onClick={() => handleEscrowRefund(item.id)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs transition-colors cursor-pointer shadow-xs"
                            >
                              Release Deposit
                            </button>
                          )}
                          <button
                            onClick={() => showToast(`Invoice PDF downloaded for ${item.id}`)}
                            className={`p-2 rounded-xl border text-xs cursor-pointer ${
                              isLight ? 'border-slate-200 hover:bg-slate-100 text-slate-700' : 'border-neutral-800 hover:bg-neutral-900 text-neutral-300'
                            }`}
                            title="Download Receipt"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 7: REGIONAL HUBS & LOCATIONS */}
          {/* ========================================================== */}
          {activeTab === 'locations' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base">Regional Hubs & Station Network</h3>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    Real-time capacity tracking, airport delivery bays, and dispatch supervisor contacts
                  </p>
                </div>
                <button
                  onClick={handleAddLocation}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm ${
                    isLight ? 'bg-black text-white hover:bg-slate-800' : 'bg-white text-black hover:bg-neutral-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Provision New Hub</span>
                </button>
              </div>

              {/* Hub Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locationList.map((hub) => (
                  <div
                    key={hub.id}
                    className={`p-5 rounded-2xl border transition-all space-y-4 ${
                      isLight ? 'bg-white border-slate-200/80 shadow-xs' : 'bg-[#0A0A0B] border-neutral-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isLight ? 'bg-slate-100 text-slate-900' : 'bg-neutral-900 text-white'
                          }`}
                        >
                          <Building2 className={`w-4 h-4 ${isLight ? 'text-slate-800' : 'text-white'}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm tracking-tight">{hub.name}</h4>
                          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                            {hub.category}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${isLight ? 'bg-slate-100 text-slate-800 border border-slate-300' : 'bg-white/10 text-white border border-white/20'}`}>
                        {hub.status}
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                      {hub.address}
                    </p>

                    {/* Capacity Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span className={isLight ? 'text-slate-500' : 'text-neutral-400'}>Bay Capacity</span>
                        <span className="font-mono">{hub.capacity} ({hub.percent}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-neutral-800">
                        <div
                          style={{ width: `${hub.percent}%` }}
                          className={`h-full rounded-full ${isLight ? 'bg-slate-900' : 'bg-white'}`}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-neutral-900 flex items-center justify-between text-xs">
                      <div>
                        <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>Supervisor</p>
                        <p className="font-semibold">{hub.supervisor}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>Helpline</p>
                        <p className="font-mono font-medium">{hub.phone}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 8: FLEET SERVICE & MAINTENANCE */}
          {/* ========================================================== */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base">Fleet Service & Maintenance Tracker</h3>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    Periodic service schedules, safety inspections, brake/tire replacements, and FASTag checks
                  </p>
                </div>
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800 text-xs font-semibold">
                  {(['ALL', 'IN_SERVICE', 'SCHEDULED', 'COMPLETED'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setMaintenanceFilter(f)}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        maintenanceFilter === f
                          ? isLight
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'bg-neutral-800 text-white'
                          : isLight
                          ? 'text-slate-600 hover:text-slate-900'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {f === 'ALL' ? 'All (18)' : f === 'IN_SERVICE' ? 'In Service' : f === 'SCHEDULED' ? 'Scheduled' : 'Completed'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Maintenance Cards */}
              <div className="space-y-3">
                {maintenanceList
                  .filter((m) => (maintenanceFilter === 'ALL' ? true : m.status === maintenanceFilter))
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isLight ? 'bg-white border-slate-200/80 shadow-xs' : 'bg-[#0A0A0B] border-neutral-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            item.priority === 'URGENT'
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              : isLight
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-neutral-900 text-white'
                          }`}
                        >
                          <Wrench className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm truncate">{item.car}</h4>
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 font-semibold">
                              {item.plate}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.priority === 'URGENT'
                                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                  : item.priority === 'ROUTINE'
                                  ? 'bg-white/10 text-white border border-white/20'
                                  : 'bg-neutral-500/10 text-neutral-400'
                              }`}
                            >
                              {item.priority}
                            </span>
                          </div>
                          <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                            {item.serviceType} • Authorized Partner: {item.facility}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-5 shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-semibold">{item.scheduledReturn}</p>
                          <p className={`text-[11px] font-mono mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                            Estimated: {formatINR(item.cost)}
                          </p>
                        </div>
                        {item.status !== 'COMPLETED' ? (
                          <button
                            onClick={() => handleCompleteMaintenance(item.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Completed</span>
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-xs flex items-center gap-1 border border-emerald-500/20">
                            <Check className="w-3.5 h-3.5" />
                            <span>Active in Fleet</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 9: PLATFORM SETTINGS */}
          {/* ========================================================== */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h3 className="font-bold text-base">Platform Operations & Policy Settings</h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  Configure automated escrow release timers, FASTag integrations, and listing verification rules
                </p>
              </div>

              {/* Group 1: Marketplace Escrow & Commission */}
              <div
                className={`p-6 rounded-2xl border shadow-xs space-y-5 ${
                  isLight ? 'bg-white border-slate-200/80' : 'bg-[#0A0A0B] border-neutral-800'
                }`}
              >
                <div className="flex items-center space-x-2 text-sm font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <h4>Escrow & Security Deposit Rules</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                      Automated Escrow Refund Window (Hours)
                    </label>
                    <input
                      type="number"
                      value={settingsState.escrowRefundHours}
                      onChange={(e) =>
                        setSettingsState({ ...settingsState, escrowRefundHours: parseInt(e.target.value) || 24 })
                      }
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border ${
                        isLight ? 'border-slate-200 bg-white text-black' : 'border-neutral-800 bg-neutral-900 text-white'
                      }`}
                    />
                    <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>
                      Default: 24h refundable deposit returned after vehicle return inspection.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                      Minimum Fleet FASTag Balance (₹)
                    </label>
                    <input
                      type="number"
                      value={settingsState.minFastagBalance}
                      onChange={(e) =>
                        setSettingsState({ ...settingsState, minFastagBalance: parseInt(e.target.value) || 1500 })
                      }
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border ${
                        isLight ? 'border-slate-200 bg-white text-black' : 'border-neutral-800 bg-neutral-900 text-white'
                      }`}
                    />
                    <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>
                      Vehicles below this threshold are routed for automated top-up.
                    </p>
                  </div>
                </div>

                {/* Toggles */}
                <div className="divide-y divide-slate-100 dark:divide-neutral-900 pt-2">
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold">Automated NHAI NETC FASTag Toll Reconciliation</p>
                      <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                        Transparently deduct actual highway toll charges upon trip completion
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsState({ ...settingsState, autoFastagDeduction: !settingsState.autoFastagDeduction })
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        settingsState.autoFastagDeduction ? 'bg-emerald-600' : 'bg-neutral-700'
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          settingsState.autoFastagDeduction ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold">Instant Booking Auto-Confirmation</p>
                      <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                        Skip manual host review for KYC-verified customers on instant-ready fleet
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsState({ ...settingsState, instantConfirmation: !settingsState.instantConfirmation })
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        settingsState.instantConfirmation ? 'bg-emerald-600' : 'bg-neutral-700'
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          settingsState.instantConfirmation ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold">Commercial Yellow Plate Compliance Check</p>
                      <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                        Strict verification preventing private white-plate cars from listing on marketplace
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsState({
                          ...settingsState,
                          autoModerateYellowPlates: !settingsState.autoModerateYellowPlates,
                        })
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        settingsState.autoModerateYellowPlates ? 'bg-emerald-600' : 'bg-neutral-700'
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          settingsState.autoModerateYellowPlates ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveAllSettings}
                    disabled={savingSettings}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                      isLight ? 'bg-black text-white hover:bg-slate-800' : 'bg-white text-black hover:bg-neutral-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{savingSettings ? 'Saving Policies...' : 'Save System Settings'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
    </div>
  );
};

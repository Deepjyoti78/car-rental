import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { bookingService } from '../../services/bookingService';
import { miscService } from '../../services/miscService';
import { authService } from '../../services/authService';
import { Booking, Vehicle } from '../../types';
import { formatINR, formatDate, formatDateTime, getStatusBadgeClass } from '../../utils/format';
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  FileText,
  UserCheck,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Star,
  Printer,
  X,
  MessageSquare,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CustomerDashboardPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'bookings' | 'saved' | 'profile' | 'payments' | 'support'
  >('bookings');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'upcoming' | 'active' | 'completed' | 'cancelled'>('all');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Booking Modals
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);
  const [selectedCancelBooking, setSelectedCancelBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Review Modal
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // New Support Ticket Modal
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState('MEDIUM');

  // Profile Edit
  const [licenseNumber, setLicenseNumber] = useState(user?.customerProfile?.licenseNumber || '');
  const [address, setAddress] = useState(user?.customerProfile?.address || '');
  const [city, setCity] = useState(user?.customerProfile?.city || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.customerProfile?.emergencyContact || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [bData, wData, tData] = await Promise.all([
        bookingService.getMyBookings(),
        miscService.getWishlist(),
        miscService.getMyTickets(),
      ]);
      setBookings(bData);
      setWishlist(wData);
      setTickets(tData);
    } catch (err) {
      console.error('Error fetching customer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelBooking = async () => {
    if (!selectedCancelBooking || !cancelReason.trim()) {
      alert('Please state a reason for cancellation.');
      return;
    }
    setCancelling(true);
    try {
      await bookingService.cancelBooking(selectedCancelBooking.id, cancelReason);
      alert('Booking cancelled according to policy.');
      setSelectedCancelBooking(null);
      setCancelReason('');
      fetchDashboardData();
    } catch (err: any) {
      alert(`Cancellation failed: ${err.message}`);
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewBooking || !reviewComment.trim()) {
      alert('Please enter your review feedback.');
      return;
    }
    setSubmittingReview(true);
    try {
      await miscService.submitReview({
        bookingId: reviewBooking.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      alert('Thank you! Your verified review has been published.');
      setReviewBooking(null);
      setReviewComment('');
      fetchDashboardData();
    } catch (err: any) {
      alert(`Review submission failed: ${err.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);
    try {
      const updated = await authService.updateProfile({
        licenseNumber,
        address,
        city,
        emergencyContact,
      });
      updateUser(updated);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      alert(`Failed to save profile: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await miscService.createTicket({
        subject: ticketSubject,
        message: ticketMessage,
        priority: ticketPriority,
      });
      alert('Support ticket created. Our team will review shortly.');
      setNewTicketModalOpen(false);
      setTicketSubject('');
      setTicketMessage('');
      fetchDashboardData();
    } catch (err: any) {
      alert(`Error creating ticket: ${err.message}`);
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'upcoming') return b.status === 'CONFIRMED';
    if (bookingFilter === 'active') return b.status === 'ACTIVE';
    if (bookingFilter === 'completed') return b.status === 'COMPLETED';
    if (bookingFilter === 'cancelled')
      return (
        b.status === 'CANCELLED' ||
        b.status === 'REFUNDED' ||
        b.status === 'REFUND_PENDING'
      );
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#000000] text-[#ffffff]">
      {/* User Greeting Header */}
      <div className="bg-[#0D0D0E] p-6 rounded-2xl border border-[#262626] shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-[#18181b] border border-[#f59e0b]/50 text-[#ffffff] flex items-center justify-center text-lg font-bold font-display shadow-card">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display text-2xl font-bold text-[#ffffff]">
                {user?.firstName} {user?.lastName}
              </h1>
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#000000] text-[#f59e0b] border border-[#262626]">
                CUSTOMER
              </span>
            </div>
            <p className="text-xs text-[#a3a3a3] mt-0.5">
              {user?.email} • {bookings.length} Registered Itineraries
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/explore')}
          className="px-5 py-2.5 rounded-full bg-[#f59e0b] hover:bg-white text-[#000000] text-xs font-bold uppercase tracking-wider transition-colors shadow-card"
        >
          Book Another Car
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex space-x-1 border-b border-[#262626] overflow-x-auto pb-px">
        {[
          { id: 'bookings', label: 'My Bookings', count: bookings.length },
          { id: 'saved', label: 'Saved Fleet', count: wishlist.length },
          { id: 'profile', label: 'Driver Verification' },
          { id: 'payments', label: 'Payment Ledger' },
          { id: 'support', label: 'Help Desk', count: tickets.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 text-xs font-semibold tracking-wide transition-all border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#f59e0b] text-[#f59e0b]'
                : 'border-transparent text-[#a3a3a3] hover:text-[#ffffff]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-[#000000] text-[#ffffff] border border-[#262626]">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Sub-filters */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {['all', 'upcoming', 'active', 'completed', 'cancelled'].map((f) => (
              <button
                key={f}
                onClick={() => setBookingFilter(f as any)}
                className={`px-3.5 py-1.5 rounded-full font-semibold capitalize transition-all ${
                  bookingFilter === f
                    ? 'bg-[#f59e0b] text-[#000000] shadow-subtle'
                    : 'bg-[#0D0D0E] border border-[#262626] text-[#a3a3a3] hover:text-[#ffffff] hover:border-[#f59e0b]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-36 rounded-2xl bg-[#0D0D0E] border border-[#262626] animate-pulse" />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-[#0D0D0E] rounded-2xl border border-[#262626] p-6">
              <Calendar className="w-10 h-10 text-[#737373] mx-auto mb-3 opacity-60" />
              <h3 className="font-display text-base font-bold text-[#ffffff]">
                No bookings found in this category
              </h3>
              <p className="text-xs text-[#a3a3a3] mt-1">
                When you reserve a car, your itinerary and voucher appear here.
              </p>
              <button
                onClick={() => navigate('/explore')}
                className="mt-4 px-5 py-2 rounded-full bg-[#f59e0b] text-[#000000] text-xs font-bold hover:bg-white transition-colors"
              >
                Explore Fleet
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#0D0D0E] rounded-2xl border border-[#262626] p-5 hover:border-[#f59e0b] hover:shadow-card transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={
                        b.vehicle?.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&q=80'
                      }
                      alt={b.vehicle?.model}
                      className="w-24 h-20 rounded-xl object-cover shrink-0 bg-[#000000] border border-[#262626]"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#f59e0b]">
                          {b.bookingCode}
                        </span>
                        <span className={getStatusBadgeClass(b.status)}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="font-display text-base font-bold text-[#ffffff]">
                        {b.vehicle?.brand} {b.vehicle?.model}
                      </h3>

                      <p className="text-xs text-[#a3a3a3] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#f59e0b]" />
                        <span>{b.pickupLocation}</span>
                      </p>

                      <p className="text-xs font-mono text-[#737373]">
                        {formatDate(b.startDate)} to {formatDate(b.endDate)} ({b.rentalDays} days)
                      </p>
                    </div>
                  </div>

                  {/* Right Actions & Amount */}
                  <div className="flex flex-col md:items-end justify-between pt-3 md:pt-0 border-t md:border-t-0 border-[#262626] space-y-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#737373] block md:text-right">
                        Total Amount Paid
                      </span>
                      <span className="text-lg font-bold font-display text-[#ffffff] tabular-nums">
                        {formatINR(b.totalAmount)}
                      </span>
                      <span className="text-[10px] font-mono text-[#f59e0b] block md:text-right">
                        Deposit: {formatINR(b.securityDeposit)} (Escrow)
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedInvoiceBooking(b)}
                        className="px-3.5 py-1.5 rounded-full border border-[#262626] bg-[#000000] text-xs font-semibold text-[#ffffff] hover:border-[#f59e0b] flex items-center space-x-1"
                        title="View invoice"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#f59e0b]" />
                        <span>Tax Invoice</span>
                      </button>

                      {/* Cancel Booking Action if pending or confirmed */}
                      {(b.status === 'CONFIRMED' || b.status === 'PENDING_PAYMENT') && (
                        <button
                          onClick={() => setSelectedCancelBooking(b)}
                          className="px-3.5 py-1.5 rounded-full border border-[#f59e0b]/50 text-xs font-semibold text-[#f59e0b] hover:bg-[#f59e0b]/10"
                        >
                          Cancel Trip
                        </button>
                      )}

                      {/* Leave Review Action if completed and not already reviewed */}
                      {b.status === 'COMPLETED' && !b.review && (
                        <button
                          onClick={() => setReviewBooking(b)}
                          className="px-3.5 py-1.5 rounded-full bg-[#f59e0b] text-[#000000] text-xs font-bold hover:bg-white flex items-center space-x-1"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Leave Review</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SAVED VEHICLES */}
      {activeTab === 'saved' && (
        <div>
          {wishlist.length === 0 ? (
            <div className="text-center py-16 bg-[#0D0D0E] rounded-2xl border border-[#262626] p-6">
              <Heart className="w-10 h-10 text-[#737373] mx-auto mb-3 opacity-60" />
              <h3 className="font-display text-base font-bold text-[#ffffff]">
                No saved vehicles
              </h3>
              <p className="text-xs text-[#a3a3a3] mt-1">
                Tap the heart on any vehicle card to save it for quick booking later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0D0D0E] rounded-2xl border border-[#262626] overflow-hidden p-4 flex flex-col justify-between hover:border-[#f59e0b] transition-colors"
                >
                  <div>
                    <img
                      src={
                        item.vehicle?.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&q=80'
                      }
                      alt={item.vehicle?.model}
                      className="w-full h-40 object-cover rounded-xl bg-[#000000]"
                    />
                    <h3 className="font-display text-base font-bold text-[#ffffff] mt-3">
                      {item.vehicle?.brand} {item.vehicle?.model}
                    </h3>
                    <p className="text-xs text-[#a3a3a3]">{item.vehicle?.city}</p>
                    <p className="text-sm font-bold text-[#ffffff] mt-2 tabular-nums">
                      {formatINR(item.vehicle?.dailyRate)} <span className="text-xs font-normal text-[#737373]">/day</span>
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#262626] mt-3 flex justify-between items-center">
                    <button
                      onClick={() => navigate(`/vehicles/${item.vehicleId}`)}
                      className="px-4 py-1.5 rounded-full bg-[#f59e0b] text-[#000000] text-xs font-bold hover:bg-white transition-colors"
                    >
                      View & Book
                    </button>
                    <button
                      onClick={async () => {
                        await miscService.toggleWishlist(item.vehicleId);
                        fetchDashboardData();
                      }}
                      className="text-xs text-[#f59e0b] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DRIVER PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-[#0D0D0E] p-6 rounded-2xl border border-[#262626] shadow-card space-y-6">
          <div>
            <h3 className="font-display text-lg font-bold text-[#ffffff]">
              Driver Verification & Identification
            </h3>
            <p className="text-xs text-[#a3a3a3] mt-0.5">
              Ensure your driving license and contact information are updated for seamless handovers.
            </p>
          </div>

          {profileSuccess && (
            <div className="p-3 rounded-xl bg-[#18181b]/50 border border-[#f59e0b]/50 text-xs text-[#f59e0b] flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-[#f59e0b] shrink-0" />
              <span>Profile information updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#ffffff] mb-1">
                Indian Driving License Number
              </label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="e.g. DL0420180098765"
                className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-xs font-semibold text-[#ffffff] focus:outline-none focus:border-[#f59e0b]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#ffffff] mb-1">City of Residence</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New Delhi"
                  className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-xs font-semibold text-[#ffffff] focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#ffffff] mb-1">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="+91 99XXXXXXXX"
                  className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-xs font-semibold text-[#ffffff] focus:outline-none focus:border-[#f59e0b]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#ffffff] mb-1">Residential Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address as per government ID"
                className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-xs font-semibold text-[#ffffff] focus:outline-none focus:border-[#f59e0b]"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-full bg-[#f59e0b] hover:bg-white text-[#000000] text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Update Driver Details'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: PAYMENT RECORDS */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] overflow-hidden shadow-card">
            <div className="p-4 bg-[#000000] border-b border-[#262626] flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-[#737373]">
                Payment Ledger & Escrow Statements
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#a3a3a3]">No payment records found.</div>
            ) : (
              <div className="divide-y divide-[#262626]">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[#ffffff]">
                        {b.vehicle?.brand} {b.vehicle?.model} • Booking #{b.bookingCode}
                      </p>
                      <p className="text-[#737373] font-mono text-[11px] mt-0.5">
                        {formatDateTime(b.createdAt)} • Razorpay Secured
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="font-bold text-[#ffffff] block tabular-nums">
                          {formatINR(b.totalAmount)}
                        </span>
                        <span className="text-[10px] font-mono text-[#f59e0b]">
                          Deposit {formatINR(b.securityDeposit)}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedInvoiceBooking(b)}
                        className="px-3.5 py-1.5 rounded-full border border-[#262626] bg-[#000000] text-xs font-semibold text-[#ffffff] hover:border-[#f59e0b]"
                      >
                        Voucher
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: HELP & SUPPORT TICKETS */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-[#ffffff]">
                Customer Help Desk
              </h3>
              <p className="text-xs text-[#a3a3a3]">
                Direct assistance for live bookings, vehicle swaps, toll queries, or deposit disputes.
              </p>
            </div>
            <button
              onClick={() => setNewTicketModalOpen(true)}
              className="px-5 py-2 rounded-full bg-[#f59e0b] text-[#000000] text-xs font-bold hover:bg-white transition-colors"
            >
              Open New Ticket
            </button>
          </div>

          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] overflow-hidden shadow-card">
            {tickets.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#a3a3a3]">
                No support tickets found. Click "Open New Ticket" if you need assistance.
              </div>
            ) : (
              <div className="divide-y divide-[#262626]">
                {tickets.map((t) => (
                  <div key={t.id} className="p-4 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#ffffff]">{t.subject}</span>
                      <span className={getStatusBadgeClass(t.status)}>{t.status}</span>
                    </div>
                    <p className="text-[#a3a3a3]">{t.message}</p>
                    {t.response && (
                      <div className="p-2.5 rounded-xl bg-[#000000] border border-[#262626] text-[11px] text-[#ffffff] mt-2">
                        <span className="font-bold text-[#f59e0b]">Support Desk Response: </span>
                        {t.response}
                      </div>
                    )}
                    <span className="text-[10px] font-mono text-[#737373] block pt-1">
                      Created on {formatDateTime(t.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      {selectedInvoiceBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] shadow-2xl max-w-lg w-full p-6 space-y-5 my-8 text-[#ffffff]">
            <div className="flex items-center justify-between border-b border-[#262626] pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-[#ffffff]">Tax Invoice & Voucher</h3>
                <p className="text-[10px] font-mono text-[#737373]">
                  INVOICE REF: INV-{selectedInvoiceBooking.bookingCode}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoiceBooking(null)}
                className="p-1.5 rounded-full text-[#737373] hover:text-[#ffffff] hover:bg-[#262626]/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[#a3a3a3] bg-[#000000] p-3 rounded-xl border border-[#262626]">
                <div>
                  <span className="font-mono text-[9px] uppercase text-[#737373] block">Vehicle</span>
                  <span className="font-bold text-[#ffffff]">
                    {selectedInvoiceBooking.vehicle?.brand} {selectedInvoiceBooking.vehicle?.model}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase text-[#737373] block">Fleet Host</span>
                  <span className="font-semibold text-[#ffffff]">
                    {selectedInvoiceBooking.vendor?.businessName || 'Verified Host'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[#a3a3a3]">
                  <span>Base Rental Fee</span>
                  <span className="tabular-nums font-semibold text-[#ffffff]">
                    {formatINR(selectedInvoiceBooking.baseAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-[#a3a3a3]">
                  <span>Statutory GST (18%)</span>
                  <span className="tabular-nums font-semibold text-[#ffffff]">
                    {formatINR(selectedInvoiceBooking.taxesAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-[#a3a3a3]">
                  <span>Marketplace Service Fee</span>
                  <span className="tabular-nums font-semibold text-[#ffffff]">
                    {formatINR(selectedInvoiceBooking.platformFee)}
                  </span>
                </div>
                <div className="flex justify-between text-[#f59e0b]">
                  <span>Refundable Security Deposit</span>
                  <span className="tabular-nums font-bold">
                    {formatINR(selectedInvoiceBooking.securityDeposit)}
                  </span>
                </div>
                <div className="border-t border-[#262626] pt-2 flex justify-between font-bold text-sm text-[#ffffff]">
                  <span>Total Paid (Razorpay)</span>
                  <span className="text-[#f59e0b] tabular-nums">
                    {formatINR(selectedInvoiceBooking.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2 border-t border-[#262626]">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-full border border-[#262626] text-xs font-semibold text-[#ffffff] hover:border-[#f59e0b] flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>Print Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoiceBooking(null)}
                className="px-5 py-2 rounded-full bg-[#f59e0b] text-[#000000] text-xs font-bold hover:bg-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCELLATION MODAL */}
      {selectedCancelBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] shadow-2xl max-w-md w-full p-6 space-y-4 my-8 text-[#ffffff]">
            <h3 className="font-display text-lg font-bold text-[#ffffff]">Cancel Rental Itinerary</h3>
            <p className="text-xs text-[#a3a3a3]">
              Booking #{selectedCancelBooking.bookingCode} • {selectedCancelBooking.vehicle?.brand}{' '}
              {selectedCancelBooking.vehicle?.model}
            </p>

            <div className="p-3.5 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-xs text-[#f59e0b]">
              Cancellation adheres strictly to DriveLoop's policy: 100% deposit is always returned. Rental fee refund is calculated based on hours to scheduled pickup.
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#ffffff] mb-1">
                Reason for Cancellation *
              </label>
              <textarea
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please state why you are cancelling this booking..."
                className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-xs text-[#ffffff] focus:outline-none focus:border-[#f59e0b]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#262626]">
              <button
                type="button"
                onClick={() => setSelectedCancelBooking(null)}
                className="px-4 py-2 rounded-full border border-[#262626] text-xs font-semibold text-[#a3a3a3] hover:text-[#ffffff]"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelBooking}
                className="px-5 py-2 rounded-full bg-[#f59e0b] text-[#ffffff] text-xs font-bold hover:bg-[#f59e0b]/80 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] shadow-2xl max-w-md w-full p-6 space-y-4 my-8 text-[#ffffff]">
            <h3 className="font-display text-lg font-bold text-[#ffffff]">Leave a Verified Review</h3>
            <p className="text-xs text-[#a3a3a3]">
              How was your trip with {reviewBooking.vehicle?.brand} {reviewBooking.vehicle?.model}?
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#ffffff] mb-2">Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewRating(s)}
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        s <= reviewRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-[#262626]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#ffffff] mb-1">Feedback & Comments</label>
              <textarea
                rows={3}
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Cleanliness, vehicle performance, host handover experience..."
                className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-xs text-[#ffffff] focus:outline-none focus:border-[#f59e0b]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#262626]">
              <button
                type="button"
                onClick={() => setReviewBooking(null)}
                className="px-4 py-2 rounded-full border border-[#262626] text-xs font-semibold text-[#a3a3a3] hover:text-[#ffffff]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingReview}
                onClick={handleSubmitReview}
                className="px-5 py-2 rounded-full bg-[#f59e0b] hover:bg-white text-[#000000] text-xs font-bold disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Post Verified Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW SUPPORT TICKET MODAL */}
      {newTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0D0D0E] rounded-2xl border border-[#262626] shadow-2xl max-w-md w-full p-6 space-y-4 my-8 text-[#ffffff]">
            <h3 className="font-display text-lg font-bold text-[#ffffff]">Contact Customer Support</h3>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#ffffff] mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Deposit return query or handover delay"
                  className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-xs font-semibold text-[#ffffff] focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#ffffff] mb-1">Priority</label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-xs font-semibold text-[#ffffff]"
                >
                  <option value="LOW" className="bg-[#0D0D0E]">Low - General Question</option>
                  <option value="MEDIUM" className="bg-[#0D0D0E]">Medium - Standard Request</option>
                  <option value="HIGH" className="bg-[#0D0D0E]">High - Urgent Active Trip Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#ffffff] mb-1">Detailed Message *</label>
                <textarea
                  rows={4}
                  required
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Explain your situation with booking code or hub details..."
                  className="w-full px-3 py-2 rounded-lg border border-[#262626] bg-[#000000] text-xs text-[#ffffff] focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setNewTicketModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#262626] text-xs font-semibold text-[#a3a3a3] hover:text-[#ffffff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#f59e0b] hover:bg-white text-[#000000] text-xs font-bold"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
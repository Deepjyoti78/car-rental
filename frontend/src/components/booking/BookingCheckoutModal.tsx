import React, { useState, useEffect } from 'react';
import { Vehicle, Booking } from '../../types';
import { bookingService } from '../../services/bookingService';
import { formatINR, formatDate } from '../../utils/format';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import {
  X,
  Calendar,
  MapPin,
  ShieldCheck,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  UserCheck,
  Lock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface BookingCheckoutModalProps {
  vehicle: Vehicle;
  initialStartDate: string;
  initialEndDate: string;
  onClose: () => void;
}

export const BookingCheckoutModal: React.FC<BookingCheckoutModalProps> = ({
  vehicle,
  initialStartDate,
  initialEndDate,
  onClose,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Dates & Price, 2: Driver Info, 3: Payment, 4: Confirmed
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [pickupLocation, setPickupLocation] = useState(vehicle.pickupAddress);
  const [returnLocation, setReturnLocation] = useState(vehicle.pickupAddress);

  // Driver details
  const [driverFullName, setDriverFullName] = useState(
    user ? `${user.firstName} ${user.lastName}` : ''
  );
  const [driverPhone, setDriverPhone] = useState(user?.phone || '');
  const [driverEmail, setDriverEmail] = useState(user?.email || '');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState(
    user?.customerProfile?.licenseNumber || ''
  );
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Server Price State
  const [priceData, setPriceData] = useState<any>(null);
  const [calculating, setCalculating] = useState(true);
  const [calcError, setCalcError] = useState<string | null>(null);

  // Booking Execution State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

  // Fetch verified price whenever dates change
  useEffect(() => {
    let active = true;
    const fetchPrice = async () => {
      try {
        setCalculating(true);
        setCalcError(null);
        const res = await bookingService.calculatePrice({
          vehicleId: vehicle.id,
          startDate,
          endDate,
        });
        if (active) {
          if (!res.availability.available) {
            setCalcError(res.availability.conflictReason || 'Vehicle unavailable for selected dates.');
          } else {
            setPriceData(res.priceBreakdown);
          }
        }
      } catch (err: any) {
        if (active) setCalcError(err.message || 'Error verifying pricing.');
      } finally {
        if (active) setCalculating(false);
      }
    };

    fetchPrice();
    return () => {
      active = false;
    };
  }, [vehicle.id, startDate, endDate]);

  const handleProceedToPayment = async () => {
    if (!isAuthenticated) {
      alert('Please sign in as a customer to complete your booking.');
      navigate('/login');
      return;
    }

    if (!driverFullName || !driverPhone || !driverEmail || !driverLicenseNumber) {
      alert('Please fill out all required driver information fields.');
      return;
    }

    if (!agreeToTerms) {
      alert('You must accept the rental terms and cancellation policy.');
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Create booking in PENDING state on backend (which initializes Razorpay order)
      const { booking, razorpayOrder } = await bookingService.createBooking({
        vehicleId: vehicle.id,
        startDate,
        endDate,
        pickupLocation,
        returnLocation,
        driverFullName,
        driverPhone,
        driverEmail,
        driverLicenseNumber,
        agreeToTerms: true,
      });

      // 2. Open Razorpay Checkout modal
      const options = {
        key: 'rzp_test_DriveLoopMockKey',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        name: 'DriveLoop Car Rental',
        description: `Rental reservation for ${vehicle.brand} ${vehicle.model}`,
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            // 3. Verify payment signature on backend
            const verifyRes = await bookingService.verifyPayment({
              bookingId: booking.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });

            setCompletedBooking(verifyRes.booking || booking);
            setStep(4);
          } catch (verErr: any) {
            alert('Payment verification failed: ' + (verErr.message || 'Please contact support.'));
          }
        },
        prefill: {
          name: driverFullName,
          email: driverEmail,
          contact: driverPhone,
        },
        theme: {
          color: '#2D7DA6',
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback for dev/mock mode
        console.warn('Razorpay SDK not loaded in browser, simulating confirmation for testing');
        setCompletedBooking(booking);
        setStep(4);
      }
    } catch (err: any) {
      alert('Booking creation failed: ' + (err.message || 'Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto ${
        isLight ? 'bg-black/35' : 'bg-[#0B0F14]/85'
      }`}
    >
      <div
        className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-8 transition-colors duration-200 ${
          isLight
            ? 'bg-white border-stone-200 text-slate-900'
            : 'bg-[#1A222B] border-[#36424D] text-[#FAF8F3]'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-stone-200' : 'bg-[#0B0F14] border-[#36424D]'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                isLight
                  ? 'bg-black text-white'
                  : 'bg-[#0E4A6B] border border-[#2D7DA6]/50 text-[#FAF8F3]'
              }`}
            >
              {step < 4 ? `0${step}` : '✓'}
            </div>
            <div>
              <h3
                className={`font-display text-base font-bold ${
                  isLight ? 'text-slate-900' : 'text-[#FAF8F3]'
                }`}
              >
                {step === 1 && 'Confirm Rental Dates & Pricing'}
                {step === 2 && 'Primary Driver & Contact Details'}
                {step === 3 && 'Review & Authorize Payment'}
                {step === 4 && 'Reservation Confirmed'}
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-[#D5DBE1]'}`}>
                {vehicle.brand} {vehicle.model} • {vehicle.city}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-400 hover:text-black hover:bg-slate-200'
                : 'text-[#6B7783] hover:text-[#FAF8F3] hover:bg-[#36424D]/60'
            }`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content by Step */}
        <div className="p-6">
          {/* STEP 1: Dates & Price Breakdown */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Pickup & Return Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className={`p-3.5 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-stone-200' : 'bg-[#0B0F14] border-[#36424D]'
                  }`}
                >
                  <label
                    className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${
                      isLight ? 'text-slate-400' : 'text-[#6B7783]'
                    }`}
                  >
                    Pickup Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate.slice(0, 16)}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setStartDate(new Date(e.target.value).toISOString())}
                    className={`w-full bg-transparent text-xs sm:text-sm font-semibold focus:outline-none tabular-nums ${
                      isLight ? 'text-slate-900' : 'text-[#FAF8F3]'
                    }`}
                  />
                </div>

                <div
                  className={`p-3.5 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-stone-200' : 'bg-[#0B0F14] border-[#36424D]'
                  }`}
                >
                  <label
                    className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${
                      isLight ? 'text-slate-400' : 'text-[#6B7783]'
                    }`}
                  >
                    Return Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate.slice(0, 16)}
                    min={startDate.slice(0, 16)}
                    onChange={(e) => setEndDate(new Date(e.target.value).toISOString())}
                    className={`w-full bg-transparent text-xs sm:text-sm font-semibold focus:outline-none tabular-nums ${
                      isLight ? 'text-slate-900' : 'text-[#FAF8F3]'
                    }`}
                  />
                </div>
              </div>

              {/* Pickup Location Info */}
              <div
                className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                  isLight
                    ? 'bg-slate-50 border-stone-200 text-slate-800'
                    : 'bg-[#0B0F14] border-[#36424D]'
                }`}
              >
                <MapPin
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    isLight ? 'text-[#C25E26]' : 'text-[#2D7DA6]'
                  }`}
                />
                <div className="text-xs">
                  <p className={`font-semibold ${isLight ? 'text-slate-900' : 'text-[#FAF8F3]'}`}>
                    Designated Fleet Hub
                  </p>
                  <p className={isLight ? 'text-slate-600' : 'text-[#D5DBE1]'}>
                    {vehicle.pickupAddress}, {vehicle.city}
                  </p>
                </div>
              </div>

              {/* Conflict Error if any */}
              {calcError && (
                <div className="p-3 rounded-lg bg-[#E07A3F]/10 border border-[#E07A3F]/30 text-xs text-[#E07A3F] flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{calcError}</span>
                </div>
              )}

              {/* Verified Pricing Breakdown Table */}
              {priceData && (
                <div
                  className={`rounded-xl border p-4 space-y-2.5 text-xs ${
                    isLight ? 'bg-slate-50 border-stone-200' : 'bg-[#0B0F14] border-[#36424D]'
                  }`}
                >
                  <p
                    className={`font-mono text-[10px] uppercase tracking-wider border-b pb-2 ${
                      isLight ? 'text-slate-400 border-stone-200' : 'text-[#6B7783] border-[#36424D]'
                    }`}
                  >
                    Verified Pricing Schedule
                  </p>

                  <div className={`flex justify-between ${isLight ? 'text-slate-600' : 'text-[#D5DBE1]'}`}>
                    <span>
                      Base Rental ({priceData.rentalDays}{' '}
                      {priceData.rentalDays === 1 ? 'day' : 'days'} × {formatINR(priceData.baseRate)}/day)
                    </span>
                    <span
                      className={`font-semibold tabular-nums ${
                        isLight ? 'text-slate-900' : 'text-[#FAF8F3]'
                      }`}
                    >
                      {formatINR(priceData.baseAmount)}
                    </span>
                  </div>

                  <div className={`flex justify-between ${isLight ? 'text-slate-600' : 'text-[#D5DBE1]'}`}>
                    <span>Applicable Statutory GST (18%)</span>
                    <span
                      className={`font-semibold tabular-nums ${
                        isLight ? 'text-slate-900' : 'text-[#FAF8F3]'
                      }`}
                    >
                      {formatINR(priceData.taxesAmount)}
                    </span>
                  </div>

                  <div className={`flex justify-between ${isLight ? 'text-slate-600' : 'text-[#D5DBE1]'}`}>
                    <span>Marketplace Booking & Insurance Escrow Fee</span>
                    <span
                      className={`font-semibold tabular-nums ${
                        isLight ? 'text-slate-900' : 'text-[#FAF8F3]'
                      }`}
                    >
                      {formatINR(priceData.platformFee)}
                    </span>
                  </div>

                  <div
                    className={`flex justify-between ${
                      isLight ? 'text-[#C25E26]' : 'text-[#2D7DA6]'
                    }`}
                  >
                    <span>Refundable Security Deposit (Returned in 24h)</span>
                    <span className="font-bold tabular-nums">
                      {formatINR(priceData.securityDeposit)}
                    </span>
                  </div>

                  <div
                    className={`pt-2 border-t flex justify-between text-sm font-bold ${
                      isLight ? 'border-stone-200 text-slate-900' : 'border-[#36424D] text-[#FAF8F3]'
                    }`}
                  >
                    <span>Total Amount Payable</span>
                    <span
                      className={`text-base font-display tabular-nums ${
                        isLight ? 'text-black' : 'text-[#F6E7D7]'
                      }`}
                    >
                      {formatINR(priceData.totalAmount)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={calculating || !!calcError}
                  onClick={() => setStep(2)}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer ${
                    isLight
                      ? 'bg-black text-white hover:bg-slate-800'
                      : 'bg-[#F6E7D7] hover:bg-white text-[#0B0F14]'
                  }`}
                >
                  <span>Continue to Driver Details</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isLight ? 'text-white' : 'text-[#0B0F14]'}`} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Driver Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      isLight ? 'text-slate-800' : 'text-[#FAF8F3]'
                    }`}
                  >
                    Primary Driver Full Name *
                  </label>
                  <input
                    type="text"
                    value={driverFullName}
                    onChange={(e) => setDriverFullName(e.target.value)}
                    placeholder="As shown on driver's license"
                    className={`w-full px-3 py-2 rounded-lg border text-xs font-semibold focus:outline-none transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-stone-200 text-slate-900 focus:border-black'
                        : 'bg-[#0B0F14] border-[#36424D] text-[#FAF8F3] focus:border-[#2D7DA6]'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      isLight ? 'text-slate-800' : 'text-[#FAF8F3]'
                    }`}
                  >
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    placeholder="+91 98XXXXXXXX"
                    className={`w-full px-3 py-2 rounded-lg border text-xs font-semibold focus:outline-none transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-stone-200 text-slate-900 focus:border-black'
                        : 'bg-[#0B0F14] border-[#36424D] text-[#FAF8F3] focus:border-[#2D7DA6]'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      isLight ? 'text-slate-800' : 'text-[#FAF8F3]'
                    }`}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={driverEmail}
                    onChange={(e) => setDriverEmail(e.target.value)}
                    placeholder="booking voucher will be sent here"
                    className={`w-full px-3 py-2 rounded-lg border text-xs font-semibold focus:outline-none transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-stone-200 text-slate-900 focus:border-black'
                        : 'bg-[#0B0F14] border-[#36424D] text-[#FAF8F3] focus:border-[#2D7DA6]'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      isLight ? 'text-slate-800' : 'text-[#FAF8F3]'
                    }`}
                  >
                    Driving License Number *
                  </label>
                  <input
                    type="text"
                    value={driverLicenseNumber}
                    onChange={(e) => setDriverLicenseNumber(e.target.value)}
                    placeholder="e.g. DL0420180098765"
                    className={`w-full px-3 py-2 rounded-lg border text-xs font-semibold focus:outline-none transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-stone-200 text-slate-900 focus:border-black'
                        : 'bg-[#0B0F14] border-[#36424D] text-[#FAF8F3] focus:border-[#2D7DA6]'
                    }`}
                  />
                </div>
              </div>

              {/* Cancellation Policy Disclosure */}
              <div
                className={`p-3.5 rounded-xl border text-[11px] space-y-1 ${
                  isLight
                    ? 'bg-amber-50/70 border-amber-200/80 text-amber-900'
                    : 'bg-[#0B0F14] border-[#36424D] text-[#D5DBE1]'
                }`}
              >
                <p
                  className={`font-semibold flex items-center gap-1 ${
                    isLight ? 'text-[#C25E26]' : 'text-[#E07A3F]'
                  }`}
                >
                  <ShieldCheck
                    className={`w-3.5 h-3.5 ${
                      isLight ? 'text-[#C25E26]' : 'text-[#2D7DA6]'
                    }`}
                  />
                  DriveLoop Cancellation & Refund Schedule:
                </p>
                <p>• Cancel &gt; 48 hours prior: 100% refund of rental fee + security deposit.</p>
                <p>• Cancel 24–48 hours prior: 75% refund of rental fee + 100% security deposit.</p>
                <p>• Cancel &lt; 24 hours prior: 50% refund of rental fee + 100% security deposit.</p>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start space-x-2.5 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className={`mt-0.5 rounded ${
                    isLight
                      ? 'border-stone-300 text-black focus:ring-black'
                      : 'border-[#36424D] bg-[#0B0F14] text-[#2D7DA6] focus:ring-0'
                  }`}
                />
                <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-[#D5DBE1]'}`}>
                  I certify that the driver holds an active valid driving license, and I agree to DriveLoop's{' '}
                  <span className={`font-semibold underline ${isLight ? 'text-black' : 'text-[#FAF8F3]'}`}>
                    Rental Agreement
                  </span>{' '}
                  and{' '}
                  <span className={`font-semibold underline ${isLight ? 'text-black' : 'text-[#FAF8F3]'}`}>
                    Cancellation Terms
                  </span>.
                </span>
              </label>

              <div
                className={`flex items-center justify-between pt-4 border-t ${
                  isLight ? 'border-stone-100' : 'border-[#36424D]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                    isLight
                      ? 'border-stone-200 text-slate-700 hover:text-black bg-white hover:bg-slate-50'
                      : 'border-[#36424D] text-[#D5DBE1] hover:text-[#FAF8F3]'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={!driverFullName || !driverPhone || !driverLicenseNumber || !agreeToTerms}
                  onClick={() => setStep(3)}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold flex items-center space-x-2 transition-colors disabled:opacity-50 cursor-pointer ${
                    isLight
                      ? 'bg-black text-white hover:bg-slate-800'
                      : 'bg-[#F6E7D7] hover:bg-white text-[#0B0F14]'
                  }`}
                >
                  <span>Review & Pay</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isLight ? 'text-white' : 'text-[#0B0F14]'}`} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Authorize Payment */}
          {step === 3 && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  isLight
                    ? 'bg-slate-50 border-stone-200 text-slate-800'
                    : 'bg-[#0B0F14] border-[#36424D]'
                }`}
              >
                <div
                  className={`flex items-center justify-between border-b pb-2 ${
                    isLight ? 'border-stone-200' : 'border-[#36424D]'
                  }`}
                >
                  <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-[#FAF8F3]'}`}>
                    Vehicle Reserved
                  </span>
                  <span className={`text-xs font-bold ${isLight ? 'text-black' : 'text-[#F6E7D7]'}`}>
                    {vehicle.brand} {vehicle.model}
                  </span>
                </div>

                <div className={`grid grid-cols-2 gap-2 text-xs ${isLight ? 'text-slate-600' : 'text-[#D5DBE1]'}`}>
                  <div>
                    <span
                      className={`block text-[10px] font-mono uppercase ${
                        isLight ? 'text-slate-400' : 'text-[#6B7783]'
                      }`}
                    >
                      Pickup
                    </span>
                    <span className={`font-medium ${isLight ? 'text-slate-900' : 'text-[#FAF8F3]'}`}>
                      {formatDate(startDate)}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`block text-[10px] font-mono uppercase ${
                        isLight ? 'text-slate-400' : 'text-[#6B7783]'
                      }`}
                    >
                      Return
                    </span>
                    <span className={`font-medium ${isLight ? 'text-slate-900' : 'text-[#FAF8F3]'}`}>
                      {formatDate(endDate)}
                    </span>
                  </div>
                </div>

                <div
                  className={`border-t pt-2 flex items-center justify-between text-xs ${
                    isLight ? 'border-stone-200' : 'border-[#36424D]'
                  }`}
                >
                  <span className={`font-medium ${isLight ? 'text-slate-600' : 'text-[#D5DBE1]'}`}>
                    Primary Driver
                  </span>
                  <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-[#FAF8F3]'}`}>
                    {driverFullName}
                  </span>
                </div>

                <div
                  className={`border-t pt-2 flex items-center justify-between text-sm font-bold ${
                    isLight ? 'border-stone-200 text-slate-900' : 'border-[#36424D] text-[#FAF8F3]'
                  }`}
                >
                  <span>Total Amount to Pay</span>
                  <span
                    className={`text-base font-display tabular-nums ${
                      isLight ? 'text-black font-extrabold' : 'text-[#F6E7D7]'
                    }`}
                  >
                    {priceData && formatINR(priceData.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Razorpay Secure Gateway Notice */}
              <div
                className={`p-3 rounded-xl border text-xs flex items-center space-x-2.5 ${
                  isLight
                    ? 'bg-slate-100 border-stone-200 text-slate-700'
                    : 'border-[#2D7DA6]/40 bg-[#0E4A6B]/30 text-[#D5DBE1]'
                }`}
              >
                <ShieldCheck
                  className={`w-5 h-5 shrink-0 ${
                    isLight ? 'text-slate-800' : 'text-[#2D7DA6]'
                  }`}
                />
                <span>
                  Payments encrypted and processed via{' '}
                  <strong className={isLight ? 'text-slate-900' : 'text-[#FAF8F3]'}>Razorpay</strong>. Cards,
                  UPI, Netbanking & Wallets supported.
                </span>
              </div>

              <div
                className={`flex items-center justify-between pt-4 border-t ${
                  isLight ? 'border-stone-100' : 'border-[#36424D]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                    isLight
                      ? 'border-stone-200 text-slate-700 hover:text-black bg-white hover:bg-slate-50'
                      : 'border-[#36424D] text-[#D5DBE1] hover:text-[#FAF8F3]'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleProceedToPayment}
                  className={`px-7 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-card transition-all disabled:opacity-50 cursor-pointer ${
                    isLight
                      ? 'bg-black text-white hover:bg-slate-800'
                      : 'bg-[#F6E7D7] hover:bg-white text-[#0B0F14]'
                  }`}
                >
                  <CreditCard className={`w-4 h-4 ${isLight ? 'text-white' : 'text-[#0B0F14]'}`} />
                  <span>{isSubmitting ? 'Processing Payment...' : 'Pay with Razorpay'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Booking Confirmed Success Screen */}
          {step === 4 && completedBooking && (
            <div className="text-center py-4 space-y-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto border ${
                  isLight
                    ? 'bg-slate-100 text-slate-900 border-slate-300'
                    : 'bg-[#0E4A6B] text-[#F6E7D7] border-[#2D7DA6]'
                }`}
              >
                <CheckCircle
                  className={`w-6 h-6 ${isLight ? 'text-emerald-600' : 'text-[#2D7DA6]'}`}
                />
              </div>

              <div>
                <h3
                  className={`font-display text-xl font-bold ${
                    isLight ? 'text-slate-900' : 'text-[#FAF8F3]'
                  }`}
                >
                  Reservation Successfully Confirmed!
                </h3>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-[#D5DBE1]'}`}>
                  Your trip is locked in. Booking Code:{' '}
                  <span
                    className={`font-mono font-bold ${
                      isLight ? 'text-[#C25E26]' : 'text-[#F6E7D7]'
                    }`}
                  >
                    {completedBooking.bookingCode}
                  </span>
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border text-left text-xs space-y-2 max-w-md mx-auto ${
                  isLight
                    ? 'bg-slate-50 border-stone-200 text-slate-700'
                    : 'border-[#36424D] bg-[#0B0F14]'
                }`}
              >
                <div className="flex justify-between">
                  <span className={isLight ? 'text-slate-500' : 'text-[#D5DBE1]'}>Vehicle:</span>
                  <span
                    className={`font-semibold ${
                      isLight ? 'text-slate-900' : 'text-[#FAF8F3]'
                    }`}
                  >
                    {vehicle.brand} {vehicle.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isLight ? 'text-slate-500' : 'text-[#D5DBE1]'}>Duration:</span>
                  <span
                    className={`font-semibold ${
                      isLight ? 'text-slate-900' : 'text-[#FAF8F3]'
                    }`}
                  >
                    {formatDate(completedBooking.startDate)} to {formatDate(completedBooking.endDate)} ({completedBooking.rentalDays} days)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isLight ? 'text-slate-500' : 'text-[#D5DBE1]'}>Total Paid:</span>
                  <span
                    className={`font-bold tabular-nums ${
                      isLight ? 'text-black' : 'text-[#F6E7D7]'
                    }`}
                  >
                    {formatINR(completedBooking.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isLight ? 'text-slate-500' : 'text-[#D5DBE1]'}>Security Deposit:</span>
                  <span
                    className={`font-medium tabular-nums ${
                      isLight ? 'text-slate-900' : 'text-[#FAF8F3]'
                    }`}
                  >
                    {formatINR(completedBooking.securityDeposit)} (Refundable on return)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/dashboard');
                  }}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-black text-white hover:bg-slate-800'
                      : 'bg-[#F6E7D7] text-[#0B0F14] hover:bg-white'
                  }`}
                >
                  Go to Customer Dashboard
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2.5 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
                    isLight
                      ? 'border-stone-200 text-slate-700 hover:text-black bg-white hover:bg-slate-50'
                      : 'border-[#36424D] text-[#D5DBE1] hover:text-[#FAF8F3]'
                  }`}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
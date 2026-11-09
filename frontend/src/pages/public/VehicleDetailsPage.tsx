import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import { bookingService } from '../../services/bookingService';
import { Vehicle } from '../../types';
import { formatINR, formatDate } from '../../utils/format';
import { BookingCheckoutModal } from '../../components/booking/BookingCheckoutModal';
import {
  Users,
  Fuel,
  Gauge,
  Star,
  MapPin,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  ChevronRight,
  Info,
  Car,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { miscService } from '../../services/miscService';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export const VehicleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Booking selection state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 4);

  const [startDate, setStartDate] = useState(tomorrow.toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(threeDaysLater.toISOString().slice(0, 16));
  const [calculatedPrice, setCalculatedPrice] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);

  // Modal checkout
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // Wishlist
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const data = await vehicleService.getById(id);
        setVehicle(data);
      } catch (err) {
        console.error('Failed to load vehicle:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  // Recalculate price when dates change
  useEffect(() => {
    if (!vehicle) return;
    let active = true;

    const calc = async () => {
      setCalculating(true);
      setAvailabilityMessage(null);
      try {
        const res = await bookingService.calculatePrice({
          vehicleId: vehicle.id,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        });
        if (active) {
          if (!res.availability.available) {
            setAvailabilityMessage(res.availability.conflictReason || 'Dates unavailable');
            setCalculatedPrice(null);
          } else {
            setCalculatedPrice(res.priceBreakdown);
          }
        }
      } catch (err: any) {
        if (active) setAvailabilityMessage(err.message || 'Pricing error');
      } finally {
        if (active) setCalculating(false);
      }
    };

    const timer = setTimeout(calc, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [vehicle, startDate, endDate]);

  const handleToggleWishlist = async () => {
    if (!vehicle || !isAuthenticated) {
      alert('Please sign in to save vehicles to your wishlist.');
      return;
    }
    try {
      const res = await miscService.toggleWishlist(vehicle.id);
      setIsWishlisted(res.saved);
    } catch (e) {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div
          className={`h-96 rounded-2xl border animate-pulse ${
            isLight ? 'bg-white border-stone-200' : 'bg-[#0D0D0E] border-neutral-800'
          }`}
        />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h2 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Vehicle not found
        </h2>
        <button
          onClick={() => navigate('/explore')}
          className={`mt-4 px-6 py-2.5 rounded-full text-xs font-bold transition-colors ${
            isLight
              ? 'bg-black text-white hover:bg-slate-800'
              : 'bg-white text-black hover:bg-neutral-200'
          }`}
        >
          Back to Explore Fleet
        </button>
      </div>
    );
  }

  const images = vehicle.images || [];
  const activeImage = images[selectedImageIndex]?.url || images[0]?.url || '';

  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200 ${
        isLight ? 'bg-[#F4EFEA] text-slate-900' : 'bg-black text-white'
      }`}
    >
      {/* Top Breadcrumb & Actions */}
      <div
        className={`flex items-center justify-between pb-6 border-b text-xs ${
          isLight ? 'border-stone-200/80 text-slate-600' : 'border-neutral-800 text-neutral-400'
        }`}
      >
        <div className="flex items-center space-x-2">
          <span
            className={`cursor-pointer font-medium ${
              isLight ? 'hover:text-black' : 'hover:text-white'
            }`}
            onClick={() => navigate('/explore')}
          >
            Fleet Inventory
          </span>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          <span>{vehicle.city}</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {vehicle.brand} {vehicle.model}
          </span>
        </div>

        <button
          onClick={handleToggleWishlist}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
            isLight
              ? 'border-stone-200 bg-white text-slate-800 shadow-xs hover:border-slate-400'
              : 'border-neutral-800 bg-[#0D0D0E] text-white hover:border-neutral-600'
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              isWishlisted
                ? 'fill-rose-500 text-rose-500'
                : isLight
                ? 'text-slate-400'
                : 'text-neutral-400'
            }`}
          />
          <span>{isWishlisted ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Main Grid: Gallery + Details Left, Sticky Booking Box Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
        {/* Left Column (8 cols): Gallery, Specs, Host, Features, Policies, Reviews */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Large Image Gallery */}
          <div className="space-y-3">
            <div
              className={`aspect-[16/10] rounded-2xl overflow-hidden relative border ${
                isLight ? 'bg-stone-100 border-stone-200/80 shadow-xs' : 'bg-black border-neutral-800'
              }`}
            >
              <img
                src={activeImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest backdrop-blur-md border ${
                  isLight
                    ? 'bg-white/90 text-slate-800 border-stone-200 shadow-xs'
                    : 'bg-black/80 text-white border-neutral-700'
                }`}
              >
                {vehicle.category}
              </span>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex space-x-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImageIndex === idx
                        ? isLight
                          ? 'border-black ring-1 ring-black'
                          : 'border-white ring-1 ring-white'
                        : isLight
                        ? 'border-stone-200 opacity-80 hover:opacity-100'
                        : 'border-neutral-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Vehicle Title & Highlights */}
          <div
            className={`rounded-2xl border p-6 space-y-5 transition-colors ${
              isLight
                ? 'bg-white border-stone-200/80 shadow-xs text-slate-900'
                : 'bg-[#0D0D0E] border-neutral-800 text-white'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <p
                  className={`text-[11px] font-mono tracking-wider uppercase ${
                    isLight ? 'text-slate-400' : 'text-neutral-500'
                  }`}
                >
                  {vehicle.brand} • Year {vehicle.year}
                </p>
                <h1
                  className={`font-display text-2xl sm:text-3xl font-bold mt-1 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {vehicle.brand} {vehicle.model}
                </h1>
                <p
                  className={`text-xs flex items-center gap-1.5 mt-2 ${
                    isLight ? 'text-slate-600' : 'text-neutral-300'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>
                    Pickup Hub: {vehicle.pickupAddress}, {vehicle.city}, {vehicle.state}
                  </span>
                </p>
              </div>

              <div
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shrink-0 ${
                  isLight
                    ? 'bg-slate-50 border-stone-200 text-slate-800'
                    : 'bg-black border-neutral-800 text-white'
                }`}
              >
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="tabular-nums">{vehicle.rating.toFixed(2)}</span>
                <span
                  className={`font-mono text-[11px] ${
                    isLight ? 'text-slate-400' : 'text-neutral-500'
                  }`}
                >
                  ({vehicle.totalTrips} verified trips)
                </span>
              </div>
            </div>

            {/* Technical Specifications Grid */}
            <div
              className={`grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t text-xs ${
                isLight ? 'border-stone-100' : 'border-neutral-800'
              }`}
            >
              <div
                className={`p-3.5 rounded-xl border ${
                  isLight
                    ? 'bg-slate-50 border-stone-200/80 text-slate-800'
                    : 'bg-black border-neutral-800 text-white'
                }`}
              >
                <span
                  className={`block text-[10px] font-mono uppercase tracking-wider ${
                    isLight ? 'text-slate-400' : 'text-neutral-500'
                  }`}
                >
                  Transmission
                </span>
                <span className="font-semibold capitalize mt-1 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  {vehicle.transmission.toLowerCase()}
                </span>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  isLight
                    ? 'bg-slate-50 border-stone-200/80 text-slate-800'
                    : 'bg-black border-neutral-800 text-white'
                }`}
              >
                <span
                  className={`block text-[10px] font-mono uppercase tracking-wider ${
                    isLight ? 'text-slate-400' : 'text-neutral-500'
                  }`}
                >
                  Fuel System
                </span>
                <span className="font-semibold capitalize mt-1 flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-amber-400" />
                  {vehicle.fuelType.toLowerCase()}
                </span>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  isLight
                    ? 'bg-slate-50 border-stone-200/80 text-slate-800'
                    : 'bg-black border-neutral-800 text-white'
                }`}
              >
                <span
                  className={`block text-[10px] font-mono uppercase tracking-wider ${
                    isLight ? 'text-slate-400' : 'text-neutral-500'
                  }`}
                >
                  Capacity
                </span>
                <span className="font-semibold mt-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  {vehicle.seatingCapacity} Passengers
                </span>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  isLight
                    ? 'bg-slate-50 border-stone-200/80 text-slate-800'
                    : 'bg-black border-neutral-800 text-white'
                }`}
              >
                <span
                  className={`block text-[10px] font-mono uppercase tracking-wider ${
                    isLight ? 'text-slate-400' : 'text-neutral-500'
                  }`}
                >
                  Mileage Policy
                </span>
                <span className="font-semibold mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {vehicle.mileagePolicy}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Description & Features */}
          <div
            className={`rounded-2xl border p-6 space-y-6 transition-colors ${
              isLight
                ? 'bg-white border-stone-200/80 shadow-xs text-slate-900'
                : 'bg-[#0D0D0E] border-neutral-800 text-white'
            }`}
          >
            <div>
              <span
                className={`text-[10px] font-mono uppercase tracking-widest block mb-1 font-semibold ${
                  isLight ? 'text-[#C25E26]' : 'text-amber-500'
                }`}
              >
                Vehicle Overview
              </span>
              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-neutral-300'
                }`}
              >
                {vehicle.description}
              </p>
            </div>

            {vehicle.features && vehicle.features.length > 0 && (
              <div
                className={`pt-4 border-t ${
                  isLight ? 'border-stone-100' : 'border-neutral-800'
                }`}
              >
                <span
                  className={`text-[10px] font-mono uppercase tracking-widest block mb-3 ${
                    isLight ? 'text-slate-400' : 'text-neutral-500'
                  }`}
                >
                  Included Amenities & Hardware
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {vehicle.features.map((feat) => (
                    <div
                      key={feat.id || feat.name}
                      className={`flex items-center space-x-2 text-xs font-medium p-2.5 rounded-lg border ${
                        isLight
                          ? 'bg-slate-50 border-stone-200/80 text-slate-800'
                          : 'bg-black border-neutral-800 text-white'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isLight ? 'text-emerald-600' : 'text-emerald-400'
                        }`}
                      />
                      <span>{feat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Host Profile Card */}
          {vehicle.vendor && (
            <div
              className={`rounded-2xl border p-6 space-y-4 transition-colors ${
                isLight
                  ? 'bg-white border-stone-200/80 shadow-xs text-slate-900'
                  : 'bg-[#0D0D0E] border-neutral-800 text-white'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-widest block ${
                      isLight ? 'text-[#C25E26]' : 'text-amber-500'
                    }`}
                  >
                    Fleet Operator
                  </span>
                  <h3
                    className={`font-display text-lg font-bold ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {vehicle.vendor.businessName}
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    Licensed commercial fleet operator based in {vehicle.vendor.city}
                  </p>
                </div>

                <div
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shrink-0 ${
                    isLight
                      ? 'bg-slate-100 text-slate-800 border-slate-200'
                      : 'bg-neutral-900 text-white border-neutral-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>DriveLoop Verified Host</span>
                </div>
              </div>

              {vehicle.vendor.description && (
                <p
                  className={`text-xs italic border-l-2 pl-3 py-0.5 ${
                    isLight
                      ? 'text-slate-600 border-slate-300'
                      : 'text-neutral-300 border-neutral-700'
                  }`}
                >
                  "{vehicle.vendor.description}"
                </p>
              )}
            </div>
          )}

          {/* 5. Rental Policies & Terms */}
          <div
            className={`rounded-2xl border p-6 space-y-4 transition-colors ${
              isLight
                ? 'bg-white border-stone-200/80 shadow-xs text-slate-900'
                : 'bg-[#0D0D0E] border-neutral-800 text-white'
            }`}
          >
            <span
              className={`text-[10px] font-mono uppercase tracking-widest block font-semibold ${
                isLight ? 'text-[#C25E26]' : 'text-amber-500'
              }`}
            >
              Marketplace Protection & Terms
            </span>
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs ${
                isLight ? 'text-slate-600' : 'text-neutral-300'
              }`}
            >
              <div className="space-y-1">
                <span
                  className={`font-bold block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  • Security Deposit Escrow
                </span>
                <p>
                  A 100% refundable security deposit of {formatINR(vehicle.securityDeposit)} is collected
                  prior to trip start and refunded within 24 hours of safe vehicle return.
                </p>
              </div>

              <div className="space-y-1">
                <span
                  className={`font-bold block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  • Tiered Cancellation
                </span>
                <p>
                  Full refund for cancellations &gt; 48h. 75% refund 24–48h. 50% refund &lt; 24h.
                  Security deposit is always 100% refunded in all scenarios.
                </p>
              </div>

              <div className="space-y-1">
                <span
                  className={`font-bold block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  • Driver Eligibility
                </span>
                <p>
                  Primary driver must be at least 21 years old and hold a valid Indian 4-wheeler driving license.
                </p>
              </div>

              <div className="space-y-1">
                <span
                  className={`font-bold block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  • FASTag & Fuel Policy
                </span>
                <p>
                  Equipped with commercial FASTag. Expressway tolls will be billed at actuals upon vehicle return.
                </p>
              </div>
            </div>
          </div>

          {/* 6. Verified Customer Reviews */}
          <div
            className={`rounded-2xl border p-6 space-y-4 transition-colors ${
              isLight
                ? 'bg-white border-stone-200/80 shadow-xs text-slate-900'
                : 'bg-[#0D0D0E] border-neutral-800 text-white'
            }`}
          >
            <h3
              className={`font-display text-base font-bold ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Customer Reviews ({vehicle.reviews?.length || 0})
            </h3>
            {vehicle.reviews && vehicle.reviews.length > 0 ? (
              <div
                className={`space-y-3 divide-y ${
                  isLight ? 'divide-stone-100' : 'divide-neutral-800'
                }`}
              >
                {vehicle.reviews.map((rev) => (
                  <div key={rev.id} className="pt-3 first:pt-0 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-bold ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {rev.customer?.firstName} {rev.customer?.lastName}
                      </span>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className={`leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-300'}`}>
                      {rev.comment}
                    </p>
                    <span
                      className={`text-[10px] font-mono block ${
                        isLight ? 'text-slate-400' : 'text-neutral-500'
                      }`}
                    >
                      {formatDate(rev.createdAt)} • Verified Rental Trip
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>
                No reviews yet for this vehicle.
              </p>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Sticky Booking Summary Panel */}
        <div className="lg:col-span-4">
          <div
            className={`sticky top-28 rounded-2xl border p-5 space-y-4 transition-colors ${
              isLight
                ? 'bg-white border-stone-200/80 shadow-lg text-slate-900'
                : 'bg-[#0D0D0E] border-neutral-800 shadow-2xl text-white'
            }`}
          >
            <div
              className={`flex items-baseline justify-between border-b pb-4 ${
                isLight ? 'border-stone-100' : 'border-neutral-800'
              }`}
            >
              <div>
                <span
                  className={`text-2xl font-bold font-display tabular-nums ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {formatINR(vehicle.dailyRate)}
                </span>
                <span
                  className={`text-xs ${
                    isLight ? 'text-slate-400' : 'text-neutral-400'
                  }`}
                >
                  {' '}
                  / day
                </span>
              </div>
              <span
                className={`text-[10px] font-mono uppercase font-semibold px-2.5 py-0.5 rounded-full border ${
                  isLight
                    ? 'bg-slate-100 text-slate-800 border-slate-200'
                    : 'bg-neutral-900 text-white border-neutral-700'
                }`}
              >
                Instant Confirmation
              </span>
            </div>

            {/* Date Pickers */}
            <div className="space-y-2.5">
              <div
                className={`p-3 rounded-xl border ${
                  isLight
                    ? 'bg-slate-50 border-stone-200'
                    : 'bg-black border-neutral-800'
                }`}
              >
                <label
                  className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${
                    isLight ? 'text-slate-400' : 'text-neutral-500'
                  }`}
                >
                  Pickup Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full bg-transparent text-xs font-semibold focus:outline-none tabular-nums ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                />
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  isLight
                    ? 'bg-slate-50 border-stone-200'
                    : 'bg-black border-neutral-800'
                }`}
              >
                <label
                  className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${
                    isLight ? 'text-slate-400' : 'text-neutral-500'
                  }`}
                >
                  Return Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full bg-transparent text-xs font-semibold focus:outline-none tabular-nums ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                />
              </div>
            </div>

            {/* Availability Warning */}
            {availabilityMessage && (
              <div
                className={`p-3 rounded-lg border text-xs ${
                  isLight
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}
              >
                {availabilityMessage}
              </div>
            )}

            {/* Verified Itemized Breakdown */}
            {calculatedPrice && (
              <div
                className={`rounded-xl border p-3.5 space-y-2 text-xs ${
                  isLight
                    ? 'bg-slate-50 border-stone-200 text-slate-600'
                    : 'bg-black border-neutral-800 text-neutral-300'
                }`}
              >
                <div className="flex justify-between">
                  <span>
                    Base ({calculatedPrice.rentalDays}{' '}
                    {calculatedPrice.rentalDays === 1 ? 'day' : 'days'})
                  </span>
                  <span
                    className={`font-semibold tabular-nums ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {formatINR(calculatedPrice.baseAmount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>GST (18% Statutory)</span>
                  <span
                    className={`font-semibold tabular-nums ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {formatINR(calculatedPrice.taxesAmount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span
                    className={`font-semibold tabular-nums ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {formatINR(calculatedPrice.platformFee)}
                  </span>
                </div>

                <div className="flex justify-between font-medium text-amber-400">
                  <span>Security Deposit (Refundable)</span>
                  <span className="font-bold tabular-nums">
                    {formatINR(calculatedPrice.securityDeposit)}
                  </span>
                </div>

                <div
                  className={`pt-2 border-t flex justify-between font-bold ${
                    isLight
                      ? 'border-stone-200 text-slate-900'
                      : 'border-neutral-800 text-white'
                  }`}
                >
                  <span>Total Payable</span>
                  <span
                    className={`text-base tabular-nums ${
                      isLight ? 'text-black' : 'text-white'
                    }`}
                  >
                    {formatINR(calculatedPrice.totalAmount)}
                  </span>
                </div>
              </div>
            )}

            {/* Reserve CTA: Black pill in light mode, White pill in dark mode */}
            <button
              type="button"
              disabled={calculating || !!availabilityMessage}
              onClick={() => setCheckoutModalOpen(true)}
              className={`w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer shadow-md ${
                isLight
                  ? 'bg-black text-white hover:bg-slate-800'
                  : 'bg-white hover:bg-neutral-200 text-black'
              }`}
            >
              <span>
                {calculating ? 'Verifying Availability...' : 'Reserve this Car Now'}
              </span>
              {!calculating && <ArrowRight className="w-3.5 h-3.5" />}
            </button>

            <p
              className={`text-[10px] font-mono text-center ${
                isLight ? 'text-slate-400' : 'text-neutral-500'
              }`}
            >
              Zero hidden fees • 24h Refundable Deposit Guarantee
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Step Checkout Modal */}
      {checkoutModalOpen && (
        <BookingCheckoutModal
          vehicle={vehicle}
          initialStartDate={new Date(startDate).toISOString()}
          initialEndDate={new Date(endDate).toISOString()}
          onClose={() => setCheckoutModalOpen(false)}
        />
      )}
    </div>
  );
};
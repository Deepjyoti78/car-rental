import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import { bookingService } from '../../services/bookingService';
import { Vehicle } from '../../types';
import { formatINR } from '../../utils/format';
import { BookingCheckoutModal } from '../../components/booking/BookingCheckoutModal';
import { MOCK_FLEET } from '../../services/mockFleet';
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
  ChevronLeft,
  ChevronDown,
  ArrowRight,
  Maximize2,
  RotateCcw,
  FileText,
  Zap,
  Camera,
  Sun,
  Volume2,
  Snowflake,
  Tv,
  Check,
  Quote,
  X,
  Sparkles,
  Share2,
  Home,
  LayoutGrid,
} from 'lucide-react';
import { miscService } from '../../services/miscService';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const VERIFIED_REVIEWS = [
  {
    id: 'rev-1',
    rating: 5,
    author: 'Aman Verma',
    tripTag: 'Verified Trip • Oct 2026',
    comment:
      'Smooth pickup and drop, car was in excellent condition. The ADAS and sunroof make it a great choice for long drives.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'rev-2',
    rating: 5,
    author: 'Priya Sharma',
    tripTag: 'Verified Trip • Sep 2026',
    comment:
      'Exceptional highway stability. Delivered on time at Noida Aerocity with a clean tank and zero paperwork friction.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'rev-3',
    rating: 5,
    author: 'Rohan Mehra',
    tripTag: 'Verified Trip • Aug 2026',
    comment:
      'Bose acoustics and ventilated front seats are game changers for summer trips. Full refund of security deposit within 12 hours.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  },
];

export const VehicleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [fullscreenImageOpen, setFullscreenImageOpen] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  // Booking selection state
  // Defaults to 11/11/2026 16:59 to 11/14/2026 16:59 (3 days) matching reference design
  const [startDate, setStartDate] = useState('2026-11-11T16:59');
  const [endDate, setEndDate] = useState('2026-11-14T16:59');
  const [calculatedPrice, setCalculatedPrice] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);

  // Modal checkout
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // Wishlist
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeContentTab, setActiveContentTab] = useState<'overview' | 'features' | 'policies' | 'reviews'>('overview');

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${vehicle?.brand} ${vehicle?.model} on DriveLoop`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const data = await vehicleService.getById(id);
        if (data) {
          setVehicle(data);
        } else {
          const fallback = MOCK_FLEET.find((v) => v.id === id) || MOCK_FLEET[0];
          setVehicle(fallback);
        }
      } catch (err) {
        console.error('Failed to load vehicle, using mock fleet fallback:', err);
        const fallback = MOCK_FLEET.find((v) => v.id === id) || MOCK_FLEET[0];
        setVehicle(fallback);
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
          if (!res.availability?.available) {
            setAvailabilityMessage(res.availability?.conflictReason || 'Selected dates are unavailable.');
            setCalculatedPrice(null);
          } else {
            setCalculatedPrice(res.priceBreakdown);
          }
        }
      } catch (err: any) {
        if (active) {
          // Accurate client-side calculation matching rental formula
          const start = new Date(startDate);
          const end = new Date(endDate);
          const diffMs = end.getTime() - start.getTime();
          if (diffMs > 0) {
            const days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
            const baseAmount = vehicle.dailyRate * days;
            const taxesAmount = Math.round(baseAmount * 0.18);
            const platformFee = 50000; // ₹500 in paise
            const totalAmount = baseAmount + taxesAmount + vehicle.securityDeposit + platformFee;
            setCalculatedPrice({
              rentalDays: days,
              baseRate: vehicle.dailyRate,
              baseAmount,
              taxesAmount,
              securityDeposit: vehicle.securityDeposit,
              platformFee,
              totalAmount,
            });
            setAvailabilityMessage(null);
          } else {
            setAvailabilityMessage('Return date must be after pickup date.');
            setCalculatedPrice(null);
          }
        }
      } finally {
        if (active) setCalculating(false);
      }
    };

    const timer = setTimeout(calc, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [vehicle, startDate, endDate]);

  const handleToggleWishlist = async () => {
    if (!vehicle) return;
    if (!isAuthenticated) {
      setIsWishlisted((prev) => !prev);
      return;
    }
    try {
      const res = await miscService.toggleWishlist(vehicle.id);
      setIsWishlisted(res.saved);
    } catch {
      setIsWishlisted((prev) => !prev);
    }
  };

  // Helper to format ISO datetime to clean "MM/DD/YYYY, hh:mm A" matching Image 1
  const formatDateTimeDisplay = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const strHours = String(hours).padStart(2, '0');
      return `${month}/${day}/${year}, ${strHours}:${minutes} ${ampm}`;
    } catch {
      return isoStr;
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div
          className={`h-96 rounded-2xl border animate-pulse ${
            isLight ? 'bg-white border-stone-200' : 'bg-[#101114] border-neutral-800'
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
          className={`mt-4 px-6 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
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

  // Fallback image pool ensuring at least 2 distinct photos for gallery
  const rawImages = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [];
  const defaultSecondUrl = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80';
  const images =
    rawImages.length >= 2
      ? rawImages
      : [
          ...(rawImages.length === 1 ? rawImages : [{ id: 'img-1', url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&auto=format&fit=crop&q=80' }]),
          { id: 'img-2', url: defaultSecondUrl },
        ];

  const activeImage = images[selectedImageIndex]?.url || images[0]?.url;

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Curate 3 similar cars from mock fleet matching design
  const similarCars = [
    {
      id: 'b1c698df-9252-4ebc-8b26-b4cb24d8ea15',
      brand: 'Kia',
      model: 'Seltos GTX+',
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
      dailyRate: 340000,
      rating: 4.79,
    },
    {
      id: 'b1c698df-9252-4ebc-8b26-b4cb24d8ea14',
      brand: 'Tata',
      model: 'Nexon EV',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
      dailyRate: 320000,
      rating: 4.75,
    },
    {
      id: 'b1c698df-9252-4ebc-8b26-b4cb24d8ea08',
      brand: 'Honda',
      model: 'Elevate ZX',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80',
      dailyRate: 350000,
      rating: 4.76,
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isLight ? 'bg-[#F8F6F1] text-slate-900' : 'bg-[#0a0b0d] text-white'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        {/* =========================================================================
            1. BREADCRUMB
           ========================================================================= */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <button
            type="button"
            onClick={() => navigate('/')}
            className={`hover:text-white transition-colors cursor-pointer flex items-center ${
              isLight ? 'text-stone-500 hover:text-black' : 'text-neutral-400 hover:text-white'
            }`}
            title="Home"
          >
            <Home className="w-3.5 h-3.5" />
          </button>
          <span className={isLight ? 'text-stone-400' : 'text-neutral-600'}>›</span>
          <span
            onClick={() => navigate('/explore')}
            className={`font-medium hover:underline cursor-pointer transition-colors ${
              isLight ? 'text-stone-600 hover:text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Fleet
          </span>
          <span className={isLight ? 'text-stone-400' : 'text-neutral-600'}>›</span>
          <span
            onClick={() => navigate(`/explore?city=${encodeURIComponent(vehicle.city)}`)}
            className={`font-medium hover:underline cursor-pointer transition-colors ${
              isLight ? 'text-stone-600 hover:text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {vehicle.city || 'Delhi'}
          </span>
          <span className={isLight ? 'text-stone-400' : 'text-neutral-600'}>›</span>
          <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {vehicle.brand} {vehicle.model}
          </span>
        </div>

        {/* =========================================================================
            2. TWO-COLUMN MAIN SHOWCASE
            - Left (8 cols): Hero Photo, Thumbnails, Action Bar, Title/Hub, Tabs & Content
            - Right (4 cols): Sticky Booking Calculator Card
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Main Hero Photo Container */}
            <div
              className={`rounded-2xl border overflow-hidden relative aspect-[16/9] sm:aspect-[2.1/1] max-h-[320px] sm:max-h-[350px] w-full shadow-md ${
                isLight ? 'border-stone-200 bg-stone-100' : 'border-neutral-800 bg-[#101114]'
              }`}
            >
              <img
                src={activeImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover transition-all duration-300 select-none"
              />

              {/* Category Badge top-left */}
              <span className="absolute top-4 left-4 px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/15 shadow-md">
                {vehicle.category}
              </span>

              {/* Expand to Fullscreen button top-right */}
              <button
                type="button"
                onClick={() => setFullscreenImageOpen(true)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer shadow-md"
                title="View Fullscreen"
                aria-label="View Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Previous Arrow overlay */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {/* Next Arrow overlay */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* Counter Badge bottom-right */}
              <span className="absolute bottom-4 right-4 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-black/60 backdrop-blur-md text-white border border-white/15 shadow-md">
                {selectedImageIndex + 1} / {images.length}
              </span>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img, idx) => {
                  const isActive = selectedImageIndex === idx;
                  return (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-14 sm:w-16 h-9 sm:h-10 rounded-lg overflow-hidden shrink-0 border transition-all cursor-pointer shadow-xs ${
                        isActive
                          ? isLight
                            ? 'border-2 border-black ring-2 ring-black/25 opacity-100'
                            : 'border-2 border-amber-400 ring-2 ring-amber-400/40 opacity-100'
                          : isLight
                          ? 'border-stone-200 opacity-60 hover:opacity-100'
                          : 'border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Action Row: Rating Pill on Left, Save & Share on Right */}
            <div className="flex items-center justify-between pt-1">
              <div
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-xs ${
                  isLight
                    ? 'bg-stone-50 border-stone-200 text-slate-900'
                    : 'bg-[#121316] border-neutral-800 text-white'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{vehicle.rating.toFixed(2)}</span>
                <span className={`font-normal ${isLight ? 'text-stone-500' : 'text-neutral-400'}`}>
                  ({vehicle.totalTrips || 20} verified trips)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 ${
                    isLight
                      ? 'border-stone-300 bg-white text-slate-800 hover:border-stone-400'
                      : 'border-neutral-800 bg-[#121316] hover:bg-[#18191e] text-white'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-colors ${
                      isWishlisted
                        ? 'fill-rose-500 text-rose-500'
                        : isLight
                        ? 'text-stone-500'
                        : 'text-neutral-300'
                    }`}
                  />
                  <span>{isWishlisted ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 ${
                    isLight
                      ? 'border-stone-300 bg-white text-slate-800 hover:border-stone-400'
                      : 'border-neutral-800 bg-[#121316] hover:bg-[#18191e] text-white'
                  }`}
                >
                  <Share2 className={`w-3.5 h-3.5 ${isLight ? 'text-stone-500' : 'text-neutral-300'}`} />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Vehicle Title & Location Details (Clean Typography directly on page) */}
            <div className="pt-2 space-y-1">
              <span
                className={`text-[11px] font-mono uppercase tracking-widest font-semibold ${
                  isLight ? 'text-stone-500' : 'text-neutral-400'
                }`}
              >
                {vehicle.brand} • YEAR {vehicle.year}
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {vehicle.brand} {vehicle.model}
              </h1>

              <p
                className={`text-xs flex items-center gap-1.5 pt-0.5 font-medium ${
                  isLight ? 'text-stone-600' : 'text-neutral-300'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  Pickup Hub: {vehicle.pickupAddress}, {vehicle.city}
                </span>
              </p>
            </div>

            {/* Tab Navigation Underline Bar */}
            <div
              className={`flex items-center gap-8 border-b pt-4 ${
                isLight ? 'border-stone-200' : 'border-neutral-800'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveContentTab('overview')}
                className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-colors cursor-pointer ${
                  activeContentTab === 'overview'
                    ? isLight
                      ? 'text-slate-950 border-b-2 border-slate-950 -mb-[1px]'
                      : 'text-white border-b-2 border-amber-400 -mb-[1px]'
                    : isLight
                    ? 'text-stone-500 hover:text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Overview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveContentTab('features')}
                className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-colors cursor-pointer ${
                  activeContentTab === 'features'
                    ? isLight
                      ? 'text-slate-950 border-b-2 border-slate-950 -mb-[1px]'
                      : 'text-white border-b-2 border-amber-400 -mb-[1px]'
                    : isLight
                    ? 'text-stone-500 hover:text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Features</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveContentTab('policies')}
                className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-colors cursor-pointer ${
                  activeContentTab === 'policies'
                    ? isLight
                      ? 'text-slate-950 border-b-2 border-slate-950 -mb-[1px]'
                      : 'text-white border-b-2 border-amber-400 -mb-[1px]'
                    : isLight
                    ? 'text-stone-500 hover:text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Policies</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveContentTab('reviews')}
                className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-colors cursor-pointer ${
                  activeContentTab === 'reviews'
                    ? isLight
                      ? 'text-slate-950 border-b-2 border-slate-950 -mb-[1px]'
                      : 'text-white border-b-2 border-amber-400 -mb-[1px]'
                    : isLight
                    ? 'text-stone-500 hover:text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Reviews</span>
              </button>
            </div>

            {/* TAB CONTENTS */}
            {activeContentTab === 'overview' && (
              <div className="space-y-4 pt-1">
                {/* Vehicle Overview Card with Interior Photo */}
                <div
                  className={`rounded-2xl border p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm ${
                    isLight
                      ? 'bg-white border-stone-200 text-slate-900'
                      : 'bg-[#121316] border-neutral-800 text-white'
                  }`}
                >
                  <div className="flex-1 space-y-2">
                    <h2 className="text-base sm:text-lg font-bold tracking-tight">
                      Vehicle Overview
                    </h2>
                    <p
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isLight ? 'text-stone-600' : 'text-neutral-300'
                      }`}
                    >
                      {vehicle.description}
                    </p>
                  </div>

                  <div
                    className={`w-full md:w-80 h-44 rounded-xl overflow-hidden shrink-0 border shadow-md ${
                      isLight ? 'border-stone-200 bg-stone-100' : 'border-neutral-800 bg-neutral-900'
                    }`}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1747254780213-b1022ad74f29?w=800&auto=format&fit=crop&q=80"
                      alt="Vehicle Executive Leather Interior"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Key Highlights Bar */}
                <div
                  className={`rounded-2xl border px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 shadow-xs ${
                    isLight
                      ? 'bg-white border-stone-200 text-slate-900'
                      : 'bg-[#121316] border-neutral-800 text-white'
                  }`}
                >
                  <h3 className="text-xs font-bold tracking-tight shrink-0">
                    Key Highlights
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Level 2 ADAS</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Panoramic Sunroof</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Ventilated Front Seats</span>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div
                    className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                      isLight ? 'bg-white border-stone-200' : 'bg-[#121316] border-neutral-800'
                    }`}
                  >
                    <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <span
                        className={`block text-[9px] font-mono uppercase tracking-wider ${
                          isLight ? 'text-stone-500' : 'text-neutral-400'
                        }`}
                      >
                        Transmission
                      </span>
                      <span className="font-bold text-xs capitalize truncate block">
                        {vehicle.transmission.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                      isLight ? 'bg-white border-stone-200' : 'bg-[#121316] border-neutral-800'
                    }`}
                  >
                    <Fuel className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <span
                        className={`block text-[9px] font-mono uppercase tracking-wider ${
                          isLight ? 'text-stone-500' : 'text-neutral-400'
                        }`}
                      >
                        Fuel System
                      </span>
                      <span className="font-bold text-xs capitalize truncate block">
                        {vehicle.fuelType.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                      isLight ? 'bg-white border-stone-200' : 'bg-[#121316] border-neutral-800'
                    }`}
                  >
                    <Users className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <span
                        className={`block text-[9px] font-mono uppercase tracking-wider ${
                          isLight ? 'text-stone-500' : 'text-neutral-400'
                        }`}
                      >
                        Capacity
                      </span>
                      <span className="font-bold text-xs truncate block">
                        {vehicle.seatingCapacity} Passengers
                      </span>
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                      isLight ? 'bg-white border-stone-200' : 'bg-[#121316] border-neutral-800'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <span
                        className={`block text-[9px] font-mono uppercase tracking-wider ${
                          isLight ? 'text-stone-500' : 'text-neutral-400'
                        }`}
                      >
                        Mileage Policy
                      </span>
                      <span className="font-bold text-xs truncate block">
                        {vehicle.mileagePolicy || 'Unlimited km'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeContentTab === 'features' && (
              <div
                className={`rounded-2xl border p-5 sm:p-6 space-y-4 shadow-xs ${
                  isLight
                    ? 'bg-white border-stone-200 text-slate-900'
                    : 'bg-[#121316] border-neutral-800 text-white'
                }`}
              >
                <h3 className="text-sm font-bold tracking-tight">Features & Comfort</h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 ${
                      isLight ? 'bg-stone-50 border-stone-200' : 'bg-[#17181c] border-neutral-800'
                    }`}
                  >
                    <Snowflake className="w-4 h-4 text-neutral-300" />
                    <span className="text-[11px] font-medium leading-tight">
                      Dual Zone Climate
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 ${
                      isLight ? 'bg-stone-50 border-stone-200' : 'bg-[#17181c] border-neutral-800'
                    }`}
                  >
                    <Users className="w-4 h-4 text-neutral-300" />
                    <span className="text-[11px] font-medium leading-tight">
                      Ventilated Seats
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 ${
                      isLight ? 'bg-stone-50 border-stone-200' : 'bg-[#17181c] border-neutral-800'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-neutral-300" />
                    <span className="text-[11px] font-medium leading-tight">
                      Panoramic Sunroof
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 ${
                      isLight ? 'bg-stone-50 border-stone-200' : 'bg-[#17181c] border-neutral-800'
                    }`}
                  >
                    <Camera className="w-4 h-4 text-neutral-300" />
                    <span className="text-[11px] font-medium leading-tight">
                      360° Camera
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 ${
                      isLight ? 'bg-stone-50 border-stone-200' : 'bg-[#17181c] border-neutral-800'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-neutral-300" />
                    <span className="text-[11px] font-medium leading-tight">
                      Level 2 ADAS
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 ${
                      isLight ? 'bg-stone-50 border-stone-200' : 'bg-[#17181c] border-neutral-800'
                    }`}
                  >
                    <Tv className="w-4 h-4 text-neutral-300" />
                    <span className="text-[11px] font-medium leading-tight">
                      12.3" MBUX Cockpit
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 ${
                      isLight ? 'bg-stone-50 border-stone-200' : 'bg-[#17181c] border-neutral-800'
                    }`}
                  >
                    <Volume2 className="w-4 h-4 text-neutral-300" />
                    <span className="text-[11px] font-medium leading-tight">
                      Burmester Audio
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 ${
                      isLight ? 'bg-stone-50 border-stone-200' : 'bg-[#17181c] border-neutral-800'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-neutral-300" />
                    <span className="text-[11px] font-medium leading-tight">
                      Wireless Charging
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeContentTab === 'policies' && (
              <div
                className={`rounded-2xl border p-5 sm:p-6 space-y-4 shadow-xs ${
                  isLight
                    ? 'bg-white border-stone-200 text-slate-900'
                    : 'bg-[#121316] border-neutral-800 text-white'
                }`}
              >
                <h3 className="text-sm font-bold tracking-tight">Policies & Protection</h3>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs">Security Deposit</h4>
                      <p
                        className={`text-xs leading-relaxed mt-0.5 ${
                          isLight ? 'text-stone-600' : 'text-neutral-400'
                        }`}
                      >
                        A refundable safety deposit of {formatINR(vehicle.securityDeposit)} is collected
                        prior to the rental and refunded within 24 hours of safe vehicle return.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <RotateCcw className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs">Free Cancellation</h4>
                      <p
                        className={`text-xs leading-relaxed mt-0.5 ${
                          isLight ? 'text-stone-600' : 'text-neutral-400'
                        }`}
                      >
                        Full refund for cancellations up to 24 hours prior to trip pickup.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs">Usage Terms</h4>
                      <p
                        className={`text-xs leading-relaxed mt-0.5 ${
                          isLight ? 'text-stone-600' : 'text-neutral-400'
                        }`}
                      >
                        For personal use only. FASTag tolls and fuel are billed at actuals upon vehicle return.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeContentTab === 'reviews' && (
              <div
                className={`rounded-2xl border p-5 sm:p-6 shadow-xs ${
                  isLight
                    ? 'bg-white border-stone-200 text-slate-900'
                    : 'bg-[#121316] border-neutral-800 text-white'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-4 space-y-1">
                    <h3 className="text-sm font-bold tracking-tight">Verified Reviews</h3>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <span className="text-xl sm:text-2xl font-extrabold tracking-tight">
                        {vehicle.rating.toFixed(2)}{' '}
                        <span className="text-sm font-medium opacity-60">/ 5</span>
                      </span>
                    </div>
                    <p className={`text-xs ${isLight ? 'text-stone-500' : 'text-neutral-400'}`}>
                      Based on {vehicle.totalTrips || 20} verified trips
                    </p>
                  </div>

                  <div
                    className={`hidden md:block w-px self-stretch ${
                      isLight ? 'bg-stone-200' : 'bg-neutral-800'
                    }`}
                  />

                  <div className="md:col-span-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-2">
                      <p
                        className={`text-xs leading-relaxed italic ${
                          isLight ? 'text-stone-700' : 'text-neutral-300'
                        }`}
                      >
                        "{VERIFIED_REVIEWS[reviewIndex].comment}"
                      </p>

                      <div className="flex items-center gap-2">
                        <img
                          src={VERIFIED_REVIEWS[reviewIndex].avatar}
                          alt={VERIFIED_REVIEWS[reviewIndex].author}
                          className="w-6 h-6 rounded-full object-cover border border-amber-400"
                        />
                        <div>
                          <h4 className="text-xs font-bold leading-tight">
                            {VERIFIED_REVIEWS[reviewIndex].author}
                          </h4>
                          <p
                            className={`text-[10px] font-mono ${
                              isLight ? 'text-stone-500' : 'text-neutral-400'
                            }`}
                          >
                            {VERIFIED_REVIEWS[reviewIndex].tripTag}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() =>
                          setReviewIndex(
                            (prev) => (prev - 1 + VERIFIED_REVIEWS.length) % VERIFIED_REVIEWS.length
                          )
                        }
                        className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                          isLight
                            ? 'border-stone-300 bg-white hover:border-black text-slate-700'
                            : 'border-neutral-700 bg-neutral-900 hover:border-white text-white'
                        }`}
                        aria-label="Previous Review"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setReviewIndex((prev) => (prev + 1) % VERIFIED_REVIEWS.length)
                        }
                        className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                          isLight
                            ? 'border-stone-300 bg-white hover:border-black text-slate-700'
                            : 'border-neutral-700 bg-neutral-900 hover:border-white text-white'
                        }`}
                        aria-label="Next Review"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (4 cols): Sticky Booking Calculator Card */}
          <div className="lg:col-span-4 w-full min-w-0 lg:sticky lg:top-20">
            <div
              className={`rounded-2xl border p-4 sm:p-5 space-y-3 shadow-xl ${
                isLight
                  ? 'bg-white border-stone-200 text-slate-900'
                  : 'bg-[#121316] border-neutral-800 text-white'
              }`}
            >
              {/* Price Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline">
                  <span className="text-xl sm:text-2xl font-sans font-extrabold tracking-tight">
                    {formatINR(vehicle.dailyRate)}
                  </span>
                  <span className={`text-xs ml-1 font-medium ${isLight ? 'text-stone-500' : 'text-neutral-400'}`}>
                    /day
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    isLight
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Instant Confirmation</span>
                </div>
              </div>

              {/* Date & Time Selectors */}
              <div className="space-y-2">
                {/* Pickup Date & Time Selector */}
                <div
                  className={`p-2.5 sm:p-3 rounded-xl border relative cursor-pointer group transition-colors ${
                    isLight
                      ? 'bg-stone-50 border-stone-200 hover:border-stone-400'
                      : 'bg-[#17181c] border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <label
                    className={`block text-[10px] font-mono uppercase tracking-wider mb-0.5 flex items-center gap-1.5 font-semibold ${
                      isLight ? 'text-stone-500' : 'text-neutral-400'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Pickup Date & Time</span>
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold tabular-nums">
                      {formatDateTimeDisplay(startDate)}
                    </span>
                    <ChevronDown className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                  </div>
                  {/* Transparent overlay for native picker accessibility */}
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                </div>

                {/* Return Date & Time Selector */}
                <div
                  className={`p-2.5 sm:p-3 rounded-xl border relative cursor-pointer group transition-colors ${
                    isLight
                      ? 'bg-stone-50 border-stone-200 hover:border-stone-400'
                      : 'bg-[#17181c] border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <label
                    className={`block text-[10px] font-mono uppercase tracking-wider mb-0.5 flex items-center gap-1.5 font-semibold ${
                      isLight ? 'text-stone-500' : 'text-neutral-400'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Return Date & Time</span>
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold tabular-nums">
                      {formatDateTimeDisplay(endDate)}
                    </span>
                    <ChevronDown className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                  </div>
                  {/* Transparent overlay for native picker accessibility */}
                  <input
                    type="datetime-local"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                </div>
              </div>

              {/* Availability Alert (if any) */}
              {availabilityMessage && (
                <div
                  className={`p-2 rounded-lg border text-xs ${
                    isLight
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}
                >
                  {availabilityMessage}
                </div>
              )}

              {/* Itemized Price Breakdown */}
              {calculatedPrice && (
                <div className="space-y-1.5 text-xs pt-0.5">
                  <div className="flex items-center justify-between py-0.5">
                    <span className={isLight ? 'text-stone-600' : 'text-neutral-400'}>
                      Base ({calculatedPrice.rentalDays}{' '}
                      {calculatedPrice.rentalDays === 1 ? 'day' : 'days'})
                    </span>
                    <span className="font-sans font-bold tabular-nums">
                      {formatINR(calculatedPrice.baseAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <span className={isLight ? 'text-stone-600' : 'text-neutral-400'}>
                      GST (18% Statutory)
                    </span>
                    <span className="font-sans font-bold tabular-nums">
                      {formatINR(calculatedPrice.taxesAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-0.5">
                    <span className={isLight ? 'text-stone-600' : 'text-neutral-400'}>
                      Platform Fee
                    </span>
                    <span className="font-sans font-bold tabular-nums">
                      {formatINR(calculatedPrice.platformFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-0.5 text-amber-400 font-medium">
                    <span>Security Deposit (Refundable)</span>
                    <span className="font-sans font-bold tabular-nums">
                      {formatINR(calculatedPrice.securityDeposit)}
                    </span>
                  </div>

                  {/* Total Payable Row */}
                  <div
                    className={`pt-2.5 border-t flex items-center justify-between ${
                      isLight ? 'border-stone-200 text-slate-900' : 'border-neutral-800 text-white'
                    }`}
                  >
                    <span className="text-sm font-bold">Total Payable</span>
                    <span className="text-xl sm:text-2xl font-sans font-extrabold tabular-nums">
                      {formatINR(calculatedPrice.totalAmount)}
                    </span>
                  </div>
                </div>
              )}

              {/* Reserve CTA Button: Luxurious Cream/Gold in Dark, Black in Light */}
              <button
                type="button"
                disabled={calculating || !!availabilityMessage}
                onClick={() => setCheckoutModalOpen(true)}
                className={`w-full py-3 px-5 rounded-full font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 ${
                  isLight
                    ? 'bg-[#1c1c1e] text-white hover:bg-black'
                    : 'bg-[#F5E6D3] hover:bg-[#ebd5bd] text-black'
                }`}
              >
                <span>Reserve This Car Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Trust Subtext Badge Box */}
              <div
                className={`rounded-xl border p-2 flex items-center justify-around text-[11px] font-semibold mt-1 ${
                  isLight
                    ? 'bg-stone-50 border-stone-200 text-stone-700'
                    : 'bg-[#17181c] border-neutral-800/80 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Zero hidden fees</span>
                </div>
                <span className={isLight ? 'text-stone-400' : 'text-neutral-600'}>•</span>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>24h Refundable Deposit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            7. SIMILAR CARS YOU MIGHT LIKE
           ========================================================================= */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold tracking-tight">
              Similar Cars You Might Like
            </h3>

            <button
              type="button"
              onClick={() => navigate('/explore')}
              className={`text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                isLight ? 'text-stone-600 hover:text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>View All Cars</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {similarCars.map((car) => (
              <div
                key={car.id}
                onClick={() => {
                  navigate(`/vehicles/${car.id}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`rounded-xl border p-2 transition-all duration-200 cursor-pointer group flex flex-col justify-between shadow-xs hover:shadow-md ${
                  isLight
                    ? 'border-stone-200/80 bg-white hover:border-stone-300'
                    : 'border-neutral-800/80 bg-[#101114] hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="aspect-[16/10] w-full rounded-lg overflow-hidden mb-1.5 border border-inherit">
                    <img
                      src={car.image}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  <h4 className="font-bold text-xs px-0.5">
                    {car.brand} {car.model}
                  </h4>
                </div>

                <div className="flex items-center justify-between px-0.5 pt-1.5 mt-0.5">
                  <span className="font-bold text-xs">
                    {formatINR(car.dailyRate)}{' '}
                    <span
                      className={`text-[9px] font-normal ${
                        isLight ? 'text-stone-500' : 'text-neutral-400'
                      }`}
                    >
                      /day
                    </span>
                  </span>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{car.rating.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Modal */}
      {fullscreenImageOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setFullscreenImageOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-neutral-900 border border-neutral-700 text-white hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={activeImage}
            alt="Fullscreen view"
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
          />
        </div>
      )}

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

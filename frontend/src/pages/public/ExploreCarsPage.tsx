import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { vehicleService, VehicleSearchParams } from '../../services/vehicleService';
import { Vehicle } from '../../types';
import { MOCK_FLEET } from '../../services/mockFleet';
import { BookingCheckoutModal } from '../../components/booking/BookingCheckoutModal';
import { useThemeStore } from '../../store/themeStore';
import {
  Car,
  Star,
  Users,
  Filter,
  X,
  RotateCcw,
  Heart,
  MapPin,
  Calendar,
  Zap,
  Fuel,
  Gauge,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Check,
  ShieldCheck,
  Navigation,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const ExploreCarsPage: React.FC = () => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state initialized from URL
  const [city, setCity] = useState(searchParams.get('city') || searchParams.get('search') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [rentalType, setRentalType] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [transmission, setTransmission] = useState(searchParams.get('transmission') || '');
  const [fuelType, setFuelType] = useState(searchParams.get('fuelType') || '');
  const [seatingCapacity, setSeatingCapacity] = useState(searchParams.get('seatingCapacity') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '2500000'); // ₹25,000 in paise
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'popular_desc');
  const [page, setPage] = useState(1);

  // Available metadata
  const [availableCities, setAvailableCities] = useState<any[]>([]);
  const [availableBrands, setAvailableBrands] = useState<any[]>([]);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Result state (pre-warmed for 0ms instantaneous first paint)
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => MOCK_FLEET.slice(0, 12));
  const [meta, setMeta] = useState<any>({ page: 1, limit: 12, total: MOCK_FLEET.length, totalPages: Math.ceil(MOCK_FLEET.length / 12) });
  const [loading, setLoading] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Active selected vehicle for Right Inspector Panel
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(() => MOCK_FLEET[0]);
  const [showPreviewPanel, setShowPreviewPanel] = useState(true);

  // Wishlist state
  const [wishlist, setWishlist] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('drivio_wishlist');
      return saved ? new Set(JSON.parse(saved)) : new Set(['1', '3']);
    } catch {
      return new Set();
    }
  });

  // Booking Checkout Modal state
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem('drivio_wishlist', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  // Load cities & brands metadata once
  useEffect(() => {
    vehicleService.getCities().then(setAvailableCities).catch(() => {});
    vehicleService.getBrands().then(setAvailableBrands).catch(() => {});
  }, []);

  // Sync state when URL params change
  useEffect(() => {
    setCity(searchParams.get('city') || searchParams.get('search') || '');
    setStartDate(searchParams.get('startDate') || '');
    setEndDate(searchParams.get('endDate') || '');
    setCategory(searchParams.get('category') || '');
    setTransmission(searchParams.get('transmission') || '');
    setFuelType(searchParams.get('fuelType') || '');
    setSeatingCapacity(searchParams.get('seatingCapacity') || '');
    setBrand(searchParams.get('brand') || '');
    if (searchParams.get('maxPrice')) setMaxPrice(searchParams.get('maxPrice')!);
    if (searchParams.get('sortBy')) setSortBy(searchParams.get('sortBy')!);
  }, [searchParams]);

  // Perform search query whenever filters change
  useEffect(() => {
    let active = true;
    const fetchFleet = async () => {
      // Only show full skeleton screen if no vehicles are currently rendered
      if (vehicles.length === 0) {
        setLoading(true);
      }
      try {
        const params: VehicleSearchParams = {
          page,
          limit: 12,
          sortBy,
          ...(city && { city }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
          ...(category && { category }),
          ...(transmission && { transmission }),
          ...(fuelType && { fuelType }),
          ...(seatingCapacity && { seatingCapacity: Number(seatingCapacity) }),
          ...(brand && { brand }),
          ...(maxPrice && { maxPrice: Number(maxPrice) }),
        };

        const res = await vehicleService.search(params);
        if (active) {
          setVehicles(res.data);
          setMeta(res.meta);
          if (res.data.length > 0) {
            setActiveVehicle((prev) => (prev && res.data.some((v) => v.id === prev.id) ? prev : res.data[0]));
          } else {
            setActiveVehicle(null);
          }
        }
      } catch (err) {
        console.error('Failed to query fleet:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchFleet();
    return () => {
      active = false;
    };
  }, [
    city,
    startDate,
    endDate,
    category,
    transmission,
    fuelType,
    seatingCapacity,
    brand,
    maxPrice,
    sortBy,
    page,
  ]);

  const handleResetFilters = () => {
    setCity('');
    setStartDate('');
    setEndDate('');
    setRentalType('Daily');
    setCategory('');
    setTransmission('');
    setFuelType('');
    setSeatingCapacity('');
    setBrand('');
    setMaxPrice('2500000');
    setSortBy('popular_desc');
    setPage(1);
    setSearchParams({});
  };

  const defaultBrands = [
    'BMW',
    'Mercedes-Benz',
    'Porsche',
    'Audi',
    'Land Rover',
    'Toyota',
    'Mahindra',
    'Tata',
    'Hyundai',
    'Kia',
  ];

  const brandOptions = availableBrands.length > 0 ? availableBrands.map((b) => b.brand) : defaultBrands;
  const visibleBrands = showAllBrands ? brandOptions : brandOptions.slice(0, 6);

  const categories = [
    { label: 'SUV', value: 'SUV' },
    { label: 'Sedan', value: 'SEDAN' },
    { label: 'Luxury', value: 'LUXURY' },
    { label: 'Electric', value: 'ELECTRIC' },
    { label: 'Hatchback', value: 'HATCHBACK' },
  ];

  const activeFilterCount = [
    city,
    category,
    transmission,
    fuelType,
    seatingCapacity,
    brand,
    maxPrice !== '2500000',
  ].filter(Boolean).length;

  const getDisplayPrice = (dailyRate: number) => {
    if (rentalType === 'Weekly') {
      return Math.round((dailyRate * 7 * 0.9) / 100);
    } else if (rentalType === 'Monthly') {
      return Math.round((dailyRate * 30 * 0.75) / 100);
    }
    return Math.round(dailyRate / 100);
  };

  const getPriceSuffix = () => {
    if (rentalType === 'Weekly') return '/week';
    if (rentalType === 'Monthly') return '/month';
    return '/day';
  };

  return (
    <div
      className={`max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen transition-colors duration-200 ${
        isLight ? 'bg-[#F4EFEA] text-slate-900' : 'bg-[#0B0F14] text-[#FAF8F3]'
      }`}
    >
      {/* 1. TOP HEADER & METRICS BAR (Matching Reference Image) */}
      <div
        className={`flex flex-col md:flex-row md:items-center justify-between pb-6 border-b gap-4 ${
          isLight ? 'border-stone-200/80' : 'border-white/10'
        }`}
      >
        {/* Left: Title & Count */}
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Available Cars
          </h1>
          <p
            className={`text-xs sm:text-sm mt-1 font-normal ${
              isLight ? 'text-slate-500' : 'text-[#AAB4BE]'
            }`}
          >
            {meta.total || vehicles.length} vehicles available for rent
            {city ? ` in ${city}` : ' across all verified hubs'}
          </p>
        </div>

        {/* Right: Three Metric Stat Cards (Matching Reference Image) */}
        <div className="grid grid-cols-3 gap-2 w-full md:w-auto md:flex md:items-center md:gap-3">
          {/* Card 1: Available Cars */}
          <div
            className={`flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow-xs border min-w-0 ${
              isLight
                ? 'bg-white border-stone-200/80 text-slate-900'
                : 'bg-[#161D26] border-white/10 text-white'
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isLight
                  ? 'bg-slate-100 text-slate-800'
                  : 'bg-[#0E4A6B]/50 border border-[#2D7DA6]/40 text-[#2D7DA6]'
              }`}
            >
              <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <span
                className={`text-[9px] sm:text-[10px] font-mono uppercase block leading-none truncate ${
                  isLight ? 'text-slate-400' : 'text-[#AAB4BE]'
                }`}
              >
                Available
              </span>
              <span
                className={`text-xs sm:text-sm font-bold mt-0.5 block leading-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {meta.total || vehicles.length || 16}
              </span>
            </div>
          </div>

          {/* Card 2: Average Rating */}
          <div
            className={`flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow-xs border min-w-0 ${
              isLight
                ? 'bg-white border-stone-200/80 text-slate-900'
                : 'bg-[#161D26] border-white/10 text-white'
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isLight
                  ? 'bg-amber-50 text-amber-500 border border-amber-200/60'
                  : 'bg-[#E07A3F]/20 border border-[#E07A3F]/40 text-[#E07A3F]'
              }`}
            >
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-500" />
            </div>
            <div className="min-w-0">
              <span
                className={`text-[9px] sm:text-[10px] font-mono uppercase block leading-none truncate ${
                  isLight ? 'text-slate-400' : 'text-[#AAB4BE]'
                }`}
              >
                Rating
              </span>
              <span
                className={`text-xs sm:text-sm font-bold mt-0.5 block leading-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                4.9/5
              </span>
            </div>
          </div>

          {/* Card 3: Happy Customers */}
          <div
            className={`flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow-xs border min-w-0 ${
              isLight
                ? 'bg-white border-stone-200/80 text-slate-900'
                : 'bg-[#161D26] border-white/10 text-white'
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isLight
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                  : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
              }`}
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <span
                className={`text-[9px] sm:text-[10px] font-mono uppercase block leading-none truncate ${
                  isLight ? 'text-slate-400' : 'text-[#AAB4BE]'
                }`}
              >
                Users
              </span>
              <span
                className={`text-xs sm:text-sm font-bold mt-0.5 block leading-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                2.4K+
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter & Sort Trigger Strip */}
      <div
        className={`md:hidden flex items-center justify-between py-3 border-b ${
          isLight ? 'border-stone-200' : 'border-white/10'
        }`}
      >
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
            isLight
              ? 'bg-white border-stone-200 text-slate-800 shadow-xs'
              : 'bg-[#161D26] border-white/15 text-white'
          }`}
        >
          <Filter className={`w-3.5 h-3.5 ${isLight ? 'text-black' : 'text-[#2D7DA6]'}`} />
          <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
        </button>

        <div className={`flex items-center gap-1.5 text-xs ${isLight ? 'text-slate-600' : 'text-[#AAB4BE]'}`}>
          <span className="font-mono text-[10px] uppercase">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`border rounded-lg px-2 py-1 text-xs ${
              isLight
                ? 'bg-white border-stone-200 text-slate-800 shadow-xs'
                : 'bg-[#161D26] border-white/10 text-white'
            }`}
          >
            <option value="popular_desc">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* 2. THREE-PANEL SHOWROOM LAYOUT (Matching Reference Image) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 items-start">
        {/* PANEL 1: LEFT FILTER SIDEBAR */}
        <div
          className={`${
            mobileFilterOpen
              ? isLight
                ? 'block fixed inset-0 z-50 bg-[#F4EFEA]/98 p-6 overflow-y-auto'
                : 'block fixed inset-0 z-50 bg-[#0B0F14]/95 p-6 overflow-y-auto'
              : 'hidden'
          } md:block md:col-span-3 space-y-5`}
        >
          <div
            className={`rounded-2xl border p-5 space-y-5 shadow-sm ${
              isLight
                ? 'bg-white border-stone-200/80 text-slate-900'
                : 'bg-[#161D26] border-white/10 text-white'
            }`}
          >
            {/* Header: Filter by & Reset all */}
            <div
              className={`flex items-center justify-between pb-3 border-b ${
                isLight ? 'border-stone-100' : 'border-white/10'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Filter by
                </span>
                {activeFilterCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isLight ? 'bg-black text-white' : 'bg-[#0E4A6B] text-white'
                    }`}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className={`text-xs font-semibold transition-colors cursor-pointer ${
                  isLight ? 'text-slate-500 hover:text-black' : 'text-[#E07A3F] hover:text-[#F6E7D7]'
                }`}
              >
                Reset all
              </button>
            </div>

            {/* 1. Rental Type Pill Switcher (Daily / Weekly / Monthly) */}
            <div>
              <label
                className={`block text-xs font-semibold mb-2 ${
                  isLight ? 'text-slate-800' : 'text-white/90'
                }`}
              >
                Rental Type
              </label>
              <div
                className={`grid grid-cols-3 gap-1 p-1 rounded-xl border ${
                  isLight
                    ? 'bg-slate-100 border-slate-200/70'
                    : 'bg-[#0B0F14] border-white/10'
                }`}
              >
                {(['Daily', 'Weekly', 'Monthly'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRentalType(type)}
                    className={`py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      rentalType === type
                        ? isLight
                          ? 'bg-black text-white font-semibold shadow-xs'
                          : 'bg-[#F6E7D7] text-[#0B0F14] font-semibold shadow-sm'
                        : isLight
                        ? 'text-slate-600 hover:text-black'
                        : 'text-[#AAB4BE] hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Price Range Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className={`font-semibold ${isLight ? 'text-slate-800' : 'text-white/90'}`}>
                  Price Range
                </label>
                <span
                  className={`text-[11px] font-mono font-semibold ${
                    isLight ? 'text-slate-900' : 'text-[#F6E7D7]'
                  }`}
                >
                  ₹1,500 - ₹{(Number(maxPrice) / 100).toLocaleString('en-IN')} /day
                </span>
              </div>
              <input
                type="range"
                min="200000"
                max="2500000"
                step="50000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
                  isLight ? 'bg-slate-200 accent-black' : 'bg-[#0B0F14] accent-[#F6E7D7]'
                }`}
              />
              <div
                className={`flex justify-between text-[10px] font-mono mt-1 ${
                  isLight ? 'text-slate-400' : 'text-[#6B7783]'
                }`}
              >
                <span>₹2,000</span>
                <span>₹25,000+</span>
              </div>
            </div>

            {/* 3. Brand Selection */}
            <div>
              <label
                className={`block text-xs font-semibold mb-2 ${
                  isLight ? 'text-slate-800' : 'text-white/90'
                }`}
              >
                Brand / Make
              </label>
              <div className="grid grid-cols-2 gap-2">
                {visibleBrands.map((b) => {
                  const isChecked = brand.toLowerCase() === b.toLowerCase();
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBrand(isChecked ? '' : b)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer truncate ${
                        isChecked
                          ? isLight
                            ? 'bg-black text-white font-medium shadow-xs border border-black'
                            : 'bg-[#0E4A6B]/50 border border-[#2D7DA6] text-white font-medium shadow-sm'
                          : isLight
                          ? 'bg-slate-50 border border-slate-200/80 text-slate-700 hover:border-slate-300 hover:text-black'
                          : 'bg-[#0B0F14]/50 border border-white/5 text-[#D5DBE1] hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{b}</span>
                      {isChecked && (
                        <Check
                          className={`w-3 h-3 shrink-0 ml-1 ${
                            isLight ? 'text-white' : 'text-[#2D7DA6]'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              {brandOptions.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllBrands(!showAllBrands)}
                  className={`mt-2 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    isLight ? 'text-slate-600 hover:text-black' : 'text-[#2D7DA6] hover:text-[#F6E7D7]'
                  }`}
                >
                  <span>{showAllBrands ? 'Show less' : 'Show more brands'}</span>
                  {showAllBrands ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>

            {/* 4. Vehicle Type (Category) */}
            <div>
              <label
                className={`block text-xs font-semibold mb-2 ${
                  isLight ? 'text-slate-800' : 'text-white/90'
                }`}
              >
                Vehicle Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const isChecked = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(isChecked ? '' : cat.value)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                        isChecked
                          ? isLight
                            ? 'bg-black text-white font-medium shadow-xs border border-black'
                            : 'bg-[#0E4A6B]/50 border border-[#2D7DA6] text-white font-medium shadow-sm'
                          : isLight
                          ? 'bg-slate-50 border border-slate-200/80 text-slate-700 hover:border-slate-300 hover:text-black'
                          : 'bg-[#0B0F14]/50 border border-white/5 text-[#D5DBE1] hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {isChecked && (
                        <Check
                          className={`w-3 h-3 shrink-0 ${isLight ? 'text-white' : 'text-[#2D7DA6]'}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Transmission */}
            <div>
              <label
                className={`block text-xs font-semibold mb-2 ${
                  isLight ? 'text-slate-800' : 'text-white/90'
                }`}
              >
                Transmission
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['AUTOMATIC', 'MANUAL'].map((t) => {
                  const isChecked = transmission === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTransmission(isChecked ? '' : t)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer capitalize ${
                        isChecked
                          ? isLight
                            ? 'bg-black text-white font-medium shadow-xs border border-black'
                            : 'bg-[#0E4A6B]/50 border border-[#2D7DA6] text-white font-medium shadow-sm'
                          : isLight
                          ? 'bg-slate-50 border border-slate-200/80 text-slate-700 hover:border-slate-300 hover:text-black'
                          : 'bg-[#0B0F14]/50 border border-white/5 text-[#D5DBE1] hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span>{t.toLowerCase()}</span>
                      {isChecked && (
                        <Check
                          className={`w-3 h-3 shrink-0 ${isLight ? 'text-white' : 'text-[#2D7DA6]'}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Fuel Type */}
            <div>
              <label
                className={`block text-xs font-semibold mb-2 ${
                  isLight ? 'text-slate-800' : 'text-white/90'
                }`}
              >
                Fuel Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'].map((f) => {
                  const isChecked = fuelType === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFuelType(isChecked ? '' : f)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer capitalize ${
                        isChecked
                          ? isLight
                            ? 'bg-black text-white font-medium shadow-xs border border-black'
                            : 'bg-[#0E4A6B]/50 border border-[#2D7DA6] text-white font-medium shadow-sm'
                          : isLight
                          ? 'bg-slate-50 border border-slate-200/80 text-slate-700 hover:border-slate-300 hover:text-black'
                          : 'bg-[#0B0F14]/50 border border-white/5 text-[#D5DBE1] hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span>{f.toLowerCase()}</span>
                      {isChecked && (
                        <Check
                          className={`w-3 h-3 shrink-0 ${isLight ? 'text-white' : 'text-[#2D7DA6]'}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile apply button */}
            {mobileFilterOpen && (
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className={`w-full py-2.5 rounded-full text-xs font-bold uppercase mt-4 cursor-pointer ${
                  isLight ? 'bg-black text-white' : 'bg-[#F6E7D7] text-[#0B0F14]'
                }`}
              >
                Apply Filters
              </button>
            )}
          </div>
        </div>

        {/* PANEL 2: CENTER VEHICLE GRID */}
        <div
          className={`${
            showPreviewPanel && activeVehicle
              ? 'md:col-span-9 lg:col-span-5'
              : 'md:col-span-9 lg:col-span-9'
          } space-y-4`}
        >
          {/* Quick Category Filter Pills Bar */}
          <div className="flex items-center justify-between gap-2 pb-1">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {['ALL', 'SUV', 'LUXURY', 'SEDAN', 'ELECTRIC', 'HATCHBACK'].map((cat) => {
                const isCatActive = cat === 'ALL' ? !category : category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat === 'ALL' ? '' : cat);
                      setPage(1);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isCatActive
                        ? isLight
                          ? 'bg-black text-white shadow-xs font-semibold'
                          : 'bg-[#2D7DA6] text-white shadow-sm font-semibold'
                        : isLight
                        ? 'bg-white border border-stone-200/80 text-slate-700 hover:text-black hover:border-slate-400 shadow-xs'
                        : 'bg-[#161D26] border border-white/10 text-[#AAB4BE] hover:text-white hover:border-white/20'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Fleet' : cat}
                  </button>
                );
              })}
            </div>

            {/* Inspector Toggle Button if user closed it */}
            {!showPreviewPanel && (
              <button
                type="button"
                onClick={() => setShowPreviewPanel(true)}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs transition-colors shrink-0 ${
                  isLight
                    ? 'bg-white border-stone-200 text-slate-800 shadow-xs hover:bg-slate-50'
                    : 'bg-[#161D26] border-white/15 text-[#2D7DA6] hover:text-[#F6E7D7]'
                }`}
              >
                <span>Inspector</span>
              </button>
            )}
          </div>

          {/* Subheader: Count & Sort */}
          <div
            className={`flex items-center justify-between text-xs px-1 pt-1 ${
              isLight ? 'text-slate-500' : 'text-[#AAB4BE]'
            }`}
          >
            <span
              className={`font-mono text-[11px] uppercase tracking-wider ${
                isLight ? 'text-slate-400' : 'text-[#6B7783]'
              }`}
            >
              Showing {vehicles.length} of {meta.total || vehicles.length} Vehicles
            </span>

            {/* Desktop Sort */}
            <div
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full border ${
                isLight
                  ? 'bg-white border-stone-200 shadow-xs text-slate-800'
                  : 'bg-[#161D26] border-white/10 text-white'
              }`}
            >
              <ArrowUpDown className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-[#2D7DA6]'}`} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`bg-transparent font-medium text-xs focus:outline-none cursor-pointer ${
                  isLight ? 'text-slate-800' : 'text-white'
                }`}
              >
                <option value="popular_desc" className={isLight ? 'bg-white text-slate-800' : 'bg-[#161D26]'}>
                  Most Popular
                </option>
                <option value="price_asc" className={isLight ? 'bg-white text-slate-800' : 'bg-[#161D26]'}>
                  Price: Low to High
                </option>
                <option value="price_desc" className={isLight ? 'bg-white text-slate-800' : 'bg-[#161D26]'}>
                  Price: High to Low
                </option>
                <option value="rating_desc" className={isLight ? 'bg-white text-slate-800' : 'bg-[#161D26]'}>
                  Highest Rated
                </option>
              </select>
            </div>
          </div>

          {/* Vehicle Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className={`h-72 rounded-2xl border animate-pulse ${
                    isLight ? 'bg-white border-stone-200/80 shadow-xs' : 'bg-[#161D26] border-white/10'
                  }`}
                />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div
              className={`p-12 text-center rounded-2xl border space-y-3 ${
                isLight ? 'bg-white border-stone-200 text-slate-900 shadow-xs' : 'bg-[#161D26] border-white/10 text-white'
              }`}
            >
              <Car className={`w-10 h-10 mx-auto ${isLight ? 'text-slate-400' : 'text-[#6B7783]'}`} />
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                No vehicles found
              </h3>
              <p className={`text-xs max-w-sm mx-auto ${isLight ? 'text-slate-500' : 'text-[#AAB4BE]'}`}>
                No vehicles matched your current filter selection. Try adjusting price, category, or city.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className={`px-5 py-2 rounded-full text-xs font-bold cursor-pointer ${
                  isLight ? 'bg-black text-white' : 'bg-[#F6E7D7] text-[#0B0F14]'
                }`}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 ${
                !showPreviewPanel ? 'lg:grid-cols-3' : ''
              } gap-4`}
            >
              {vehicles.map((car) => {
                const isSelected = activeVehicle?.id === car.id;
                const isLiked = wishlist.has(car.id);
                const primaryImage =
                  car.images?.find((img) => img.isPrimary)?.url ||
                  car.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop&q=75';

                return (
                  <div
                    key={car.id}
                    onClick={() => {
                      setActiveVehicle(car);
                      setShowPreviewPanel(true);
                    }}
                    className={`rounded-2xl p-4 border transition-all duration-200 cursor-pointer relative flex flex-col justify-between group ${
                      isSelected
                        ? isLight
                          ? 'border-black ring-2 ring-black/30 bg-white shadow-md'
                          : 'border-[#2D7DA6] ring-2 ring-[#2D7DA6]/50 bg-[#1D2733] shadow-md'
                        : isLight
                        ? 'border-stone-200/80 bg-white hover:border-stone-400 hover:shadow-md'
                        : 'border-white/10 bg-[#161D26] hover:border-white/25 hover:shadow-card'
                    }`}
                  >
                    {/* Card Top: Car Title, Rating & Wishlist Heart */}
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3
                            className={`font-semibold text-sm transition-colors leading-tight ${
                              isLight
                                ? 'text-slate-900 group-hover:text-black'
                                : 'text-white group-hover:text-[#F6E7D7]'
                            }`}
                          >
                            {car.brand} {car.model}
                          </h3>
                          <div
                            className={`flex items-center space-x-1 text-xs mt-1 ${
                              isLight ? 'text-slate-500' : 'text-[#AAB4BE]'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              {car.rating ? car.rating.toFixed(1) : '4.9'}
                            </span>
                            <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-[#6B7783]'}`}>
                              ({(car as any).totalReviews || (car as any).reviews?.length || 124})
                            </span>
                          </div>
                        </div>

                        {/* Heart wishlist button */}
                        <button
                          type="button"
                          onClick={(e) => toggleWishlist(car.id, e)}
                          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                            isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                          }`}
                          aria-label="Save to wishlist"
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors ${
                              isLiked
                                ? 'fill-rose-500 text-rose-500'
                                : isLight
                                ? 'text-slate-400 hover:text-slate-800'
                                : 'text-[#AAB4BE] hover:text-white'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Card Center: Wide Cinematic 16:10 Automotive Window */}
                      <div
                        className={`aspect-[16/10] w-full rounded-xl overflow-hidden relative my-2.5 border ${
                          isLight
                            ? 'bg-stone-100 border-stone-200/60'
                            : 'bg-[#0B0F14] border-white/5'
                        }`}
                      >
                        <img
                          src={primaryImage}
                          alt={`${car.brand} ${car.model}`}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                          decoding="async"
                        />
                        <div
                          className={`absolute inset-0 pointer-events-none ${
                            isLight
                              ? 'bg-gradient-to-t from-black/25 via-transparent to-transparent'
                              : 'bg-gradient-to-t from-[#161D26]/90 via-transparent to-black/20'
                          }`}
                        />
                        <div
                          className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono border backdrop-blur-sm ${
                            isLight
                              ? 'bg-white/90 border-stone-200 text-slate-800 shadow-xs'
                              : 'bg-[#0B0F14]/80 border-white/10 text-[#D5DBE1]'
                          }`}
                        >
                          {car.category}
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom: Specs & Daily Rate (Matching Reference Image) */}
                    <div
                      className={`pt-2 border-t flex items-center justify-between text-xs ${
                        isLight ? 'border-stone-100' : 'border-white/10'
                      }`}
                    >
                      {/* Left Specs */}
                      <div
                        className={`flex items-center space-x-2 text-[11px] ${
                          isLight ? 'text-slate-500' : 'text-[#AAB4BE]'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <Gauge className={`w-3.5 h-3.5 ${isLight ? 'text-slate-700' : 'text-[#2D7DA6]'}`} />
                          <span>{car.transmission === 'AUTOMATIC' ? 'Auto' : 'Manual'}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 opacity-70" />
                          <span>{car.seatingCapacity} seats</span>
                        </span>
                      </div>

                      {/* Right Price */}
                      <div className="text-right">
                        <span
                          className={`font-bold text-sm tabular-nums ${
                            isLight ? 'text-slate-900 font-extrabold' : 'text-white'
                          }`}
                        >
                          ₹{getDisplayPrice(car.dailyRate).toLocaleString('en-IN')}
                        </span>
                        <span
                          className={`text-[10px] ml-0.5 font-normal ${
                            isLight ? 'text-slate-400' : 'text-[#AAB4BE]'
                          }`}
                        >
                          {getPriceSuffix()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Bar */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold disabled:opacity-40 cursor-pointer ${
                  isLight
                    ? 'bg-white border-stone-200 text-slate-800 shadow-xs hover:bg-stone-50'
                    : 'bg-[#161D26] border-white/10 text-white'
                }`}
              >
                Previous
              </button>
              <span
                className={`text-xs font-mono px-2 ${
                  isLight ? 'text-slate-500' : 'text-[#AAB4BE]'
                }`}
              >
                Page {page} of {meta.totalPages}
              </span>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
                className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold disabled:opacity-40 cursor-pointer ${
                  isLight
                    ? 'bg-white border-stone-200 text-slate-800 shadow-xs hover:bg-stone-50'
                    : 'bg-[#161D26] border-white/10 text-white'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* PANEL 3: RIGHT SIDE VEHICLE PREVIEW / INSPECTOR PANEL (Matching Reference Image) */}
        {showPreviewPanel && activeVehicle && (
          <div className="hidden lg:block lg:col-span-4 sticky top-20">
            <div
              className={`rounded-2xl border p-5 space-y-4 shadow-xl ${
                isLight
                  ? 'bg-white border-stone-200/80 text-slate-900'
                  : 'bg-[#161D26] border-white/15 text-white'
              }`}
            >
              {/* Top Controls: Close X & Quick Inspector Tag */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowPreviewPanel(false)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      : 'bg-[#0B0F14]/70 border-white/10 hover:border-white/30 text-[#AAB4BE] hover:text-white'
                  }`}
                  title="Close preview panel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider ${
                      isLight ? 'text-slate-400' : 'text-[#AAB4BE]'
                    }`}
                  >
                    Quick Inspector
                  </span>
                </div>
              </div>

              {/* Large Cinematic Hero Car Preview */}
              <div
                className={`aspect-[16/10] w-full rounded-xl border relative overflow-hidden group ${
                  isLight
                    ? 'bg-stone-100 border-stone-200'
                    : 'bg-[#0B0F14] border-white/10'
                }`}
              >
                <img
                  src={
                    activeVehicle.images?.find((img) => img.isPrimary)?.url ||
                    activeVehicle.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop&q=75'
                  }
                  alt={`${activeVehicle.brand} ${activeVehicle.model}`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  decoding="async"
                />
                <div
                  className={`absolute inset-0 pointer-events-none ${
                    isLight
                      ? 'bg-gradient-to-t from-black/25 via-transparent to-transparent'
                      : 'bg-gradient-to-t from-[#161D26]/90 via-transparent to-black/20'
                  }`}
                />
                <span
                  className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md border text-[10px] font-mono ${
                    isLight
                      ? 'bg-white/90 border-stone-200 text-slate-800 shadow-xs'
                      : 'bg-[#0B0F14]/80 border-white/10 text-[#F6E7D7]'
                  }`}
                >
                  {activeVehicle.year} • {activeVehicle.category}
                </span>
              </div>

              {/* Title, Status & Price Header */}
              <div className="flex items-start justify-between pt-1">
                <div>
                  <h2
                    className={`text-base font-bold leading-tight ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {activeVehicle.brand} {activeVehicle.model}
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Available
                    </span>
                    <span className="opacity-30">•</span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        isLight ? 'text-slate-800' : 'text-white'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      {activeVehicle.rating ? activeVehicle.rating.toFixed(1) : '4.9'}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  <div
                    className={`text-lg font-extrabold tabular-nums leading-none ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    ₹{getDisplayPrice(activeVehicle.dailyRate).toLocaleString('en-IN')}
                  </div>
                  <span
                    className={`text-[10px] font-normal ${
                      isLight ? 'text-slate-400' : 'text-[#AAB4BE]'
                    }`}
                  >
                    {getPriceSuffix()}
                  </span>
                </div>
              </div>

              {/* Stylized Location Route Map Widget (Matching Reference Image) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Pickup Location
                  </span>
                  <span
                    className={`text-[10px] font-mono ${
                      isLight ? 'text-slate-500' : 'text-[#2D7DA6]'
                    }`}
                  >
                    Meet & Greet Hub
                  </span>
                </div>

                <div
                  className={`rounded-xl border p-2.5 relative overflow-hidden ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B0F14] border-white/10'
                  }`}
                >
                  {/* SVG Street Grid & Route Line */}
                  <div
                    className={`relative h-20 w-full rounded-lg border flex items-center justify-center overflow-hidden ${
                      isLight ? 'bg-[#EEF2F6] border-slate-200' : 'bg-[#111720] border-white/5'
                    }`}
                  >
                    <svg className="absolute inset-0 w-full h-full opacity-45" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="grid-map-insp" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path
                            d="M 20 0 L 0 0 0 20"
                            fill="none"
                            stroke={isLight ? '#CBD5E1' : '#36424D'}
                            strokeWidth="0.8"
                          />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid-map-insp)" />
                      <path
                        d="M 30,50 L 110,50 L 110,25 L 240,25 L 240,45 L 320,45"
                        fill="none"
                        stroke={isLight ? '#2563EB' : '#2D7DA6'}
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                      />
                    </svg>

                    {/* Start Pin */}
                    <div
                      className={`absolute left-4 top-9 flex items-center space-x-1 px-2 py-0.5 rounded-full border text-[9px] font-mono shadow-xs ${
                        isLight
                          ? 'bg-white border-slate-200 text-slate-800'
                          : 'bg-[#161D26] border-white/10 text-white'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E07A3F]" />
                      <span>Hub</span>
                    </div>

                    {/* Car Marker on Route */}
                    <div
                      className={`absolute right-12 top-7 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md animate-bounce ${
                        isLight ? 'bg-black text-white' : 'bg-[#2D7DA6] text-white'
                      }`}
                    >
                      <Car className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <p
                    className={`text-[11px] mt-2 flex items-center gap-1.5 truncate ${
                      isLight ? 'text-slate-700' : 'text-[#D5DBE1]'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#E07A3F] shrink-0" />
                    <span className="truncate">
                      {activeVehicle.pickupAddress || `${activeVehicle.city} Airport T3 Express Corridor`}
                    </span>
                  </p>
                </div>
              </div>

              {/* Quick Specs Grid (2x2 Matching Reference Image) */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Plate */}
                <div
                  className={`p-2.5 rounded-xl border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200/80 text-slate-900'
                      : 'bg-[#0B0F14]/70 border-white/10 text-white'
                  }`}
                >
                  <span
                    className={`text-[10px] font-mono uppercase block ${
                      isLight ? 'text-slate-400' : 'text-[#AAB4BE]'
                    }`}
                  >
                    Reg. Plate
                  </span>
                  <span className="font-semibold text-xs mt-0.5 block truncate">
                    {activeVehicle.registrationNumber || 'DL-01-AB-4521'}
                  </span>
                </div>

                {/* Transmission */}
                <div
                  className={`p-2.5 rounded-xl border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200/80 text-slate-900'
                      : 'bg-[#0B0F14]/70 border-white/10 text-white'
                  }`}
                >
                  <span
                    className={`text-[10px] font-mono uppercase block ${
                      isLight ? 'text-slate-400' : 'text-[#AAB4BE]'
                    }`}
                  >
                    Transmission
                  </span>
                  <span className="font-semibold text-xs mt-0.5 block capitalize truncate">
                    {activeVehicle.transmission.toLowerCase()}
                  </span>
                </div>

                {/* Fuel Type */}
                <div
                  className={`p-2.5 rounded-xl border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200/80 text-slate-900'
                      : 'bg-[#0B0F14]/70 border-white/10 text-white'
                  }`}
                >
                  <span
                    className={`text-[10px] font-mono uppercase block ${
                      isLight ? 'text-slate-400' : 'text-[#AAB4BE]'
                    }`}
                  >
                    Fuel Type
                  </span>
                  <span className="font-semibold text-xs mt-0.5 block capitalize truncate">
                    {activeVehicle.fuelType.toLowerCase()}
                  </span>
                </div>

                {/* Mileage Policy */}
                <div
                  className={`p-2.5 rounded-xl border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200/80 text-slate-900'
                      : 'bg-[#0B0F14]/70 border-white/10 text-white'
                  }`}
                >
                  <span
                    className={`text-[10px] font-mono uppercase block ${
                      isLight ? 'text-slate-400' : 'text-[#AAB4BE]'
                    }`}
                  >
                    Mileage
                  </span>
                  <span className="font-semibold text-xs mt-0.5 block truncate">
                    {activeVehicle.mileagePolicy || '250 km / day'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: View Details & Book Vehicle */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => navigate(`/vehicles/${activeVehicle.id}`)}
                  className={`w-full py-2.5 rounded-xl border text-xs font-semibold transition-all text-center cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200/80'
                      : 'bg-[#0B0F14] hover:bg-[#161D26] border-white/15 hover:border-white/30 text-white'
                  }`}
                >
                  View Details
                </button>

                <button
                  type="button"
                  onClick={() => setBookingVehicle(activeVehicle)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer text-center ${
                    isLight
                      ? 'bg-black hover:bg-slate-900 text-white'
                      : 'bg-[#F6E7D7] hover:bg-white text-[#0B0F14]'
                  }`}
                >
                  Book Vehicle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Checkout Modal (Triggered by Book Vehicle button) */}
      {bookingVehicle && (
        <BookingCheckoutModal
          vehicle={bookingVehicle}
          initialStartDate={startDate}
          initialEndDate={endDate}
          onClose={() => setBookingVehicle(null)}
        />
      )}
    </div>
  );
};

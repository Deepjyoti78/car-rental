import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import { Vehicle } from '../../types';
import { MOCK_FLEET } from '../../services/mockFleet';
import { BookingCheckoutModal } from '../../components/booking/BookingCheckoutModal';
import { useThemeStore } from '../../store/themeStore';
import {
  Car,
  Star,
  Heart,
  MapPin,
  Clock,
  ShieldCheck,
  Tag,
  ChevronDown,
  LayoutGrid,
  List,
  Check,
  ArrowRight,
  IndianRupee,
  Settings2,
  Fuel,
  SlidersHorizontal,
  X,
} from 'lucide-react';

export const ExploreCarsPage: React.FC = () => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary filters
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'ALL');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [selectedFuels, setSelectedFuels] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(1000);
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sortBy') || 'popular_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Result state (pre-warmed for 0ms instantaneous first paint)
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => MOCK_FLEET);
  const [loading, setLoading] = useState(false);

  // Wishlist state
  const [wishlist, setWishlist] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('drivio_wishlist');
      return saved ? new Set(JSON.parse(saved)) : new Set(['b1c698df-9252-4ebc-8b26-b4cb24d8ea13']);
    } catch {
      return new Set();
    }
  });

  // Booking Modal
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

  // Fetch or filter fleet
  useEffect(() => {
    let active = true;
    const fetchFleet = async () => {
      try {
        const res = await vehicleService.search({
          limit: 50,
          sortBy,
          maxPrice: maxPrice * 100, // to paise
          minPrice: minPrice * 100,
        });
        if (active && res && res.data && res.data.length > 0) {
          setVehicles(res.data);
        }
      } catch (err) {
        console.error('Failed to query fleet:', err);
      }
    };

    fetchFleet();
    return () => {
      active = false;
    };
  }, [sortBy, minPrice, maxPrice]);

  // Compute filtered cars based on checkboxes & category pills
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((car) => {
      // 1. Top category pill
      if (selectedCategory && selectedCategory !== 'ALL') {
        const catUpper = car.category.toUpperCase();
        if (selectedCategory === 'SUV' && !(catUpper === 'SUV' || (car.model && car.model.toLowerCase().includes('ertiga')))) {
          return false;
        } else if (selectedCategory !== 'SUV' && catUpper !== selectedCategory) {
          return false;
        }
      }

      // 2. Vehicle Type checkboxes (SUV, Sedan, Hatchback, Luxury)
      if (selectedTypes.length > 0) {
        const carCat = car.category.toUpperCase();
        const matchesType = selectedTypes.some((t) => {
          if (t === 'SUV') {
            return carCat === 'SUV' || car.model.toLowerCase().includes('ertiga');
          }
          return carCat === t;
        });
        if (!matchesType) return false;
      }

      // 3. Transmission checkboxes (Automatic, Manual)
      if (selectedTransmissions.length > 0) {
        if (!selectedTransmissions.includes(car.transmission.toUpperCase())) {
          return false;
        }
      }

      // 4. Fuel Type checkboxes (Petrol, Diesel, Electric)
      if (selectedFuels.length > 0) {
        if (!selectedFuels.includes(car.fuelType.toUpperCase())) {
          return false;
        }
      }

      // 5. Price Range (in Rupees)
      const dailyRupees = Math.round(car.dailyRate / 100);
      if (dailyRupees < minPrice || dailyRupees > maxPrice) {
        return false;
      }

      return true;
    });
  }, [vehicles, selectedCategory, selectedTypes, selectedTransmissions, selectedFuels, minPrice, maxPrice]);

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedTypes([]);
    setSelectedTransmissions([]);
    setSelectedFuels([]);
    setMinPrice(1000);
    setMaxPrice(20000);
    setSortBy('popular_desc');
    setSearchParams({});
  };

  const toggleVehicleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleTransmission = (t: string) => {
    setSelectedTransmissions((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const toggleFuel = (f: string) => {
    setSelectedFuels((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  // Helper to get formatted badge label (matching screenshot, e.g. Hatchback, Sedan, MPV, Luxury, SUV)
  const getBadgeLabel = (car: Vehicle) => {
    if (car.model.toLowerCase().includes('ertiga')) return 'MPV';
    if (car.category === 'HATCHBACK') return 'Hatchback';
    if (car.category === 'SEDAN') return 'Sedan';
    if (car.category === 'LUXURY') return 'Luxury';
    if (car.category === 'SUV') return 'SUV';
    if (car.category === 'ELECTRIC') return 'Electric';
    return car.category;
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isLight ? 'bg-[#F4EFEA] text-slate-900' : 'bg-[#0a0b0d] text-white'
      }`}
    >
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* =========================================================================
            HEADER & TRUST HIGHLIGHTS BAR (Matching Reference Image)
           ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
          {/* Left Title */}
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-[#d4af37] uppercase font-mono block mb-1">
              PREMIUM RENTAL CARS
            </span>
            <h1
              className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Available Cars
            </h1>
            <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
              Choose from our wide range of premium vehicles and hit the road.
            </p>
          </div>

          {/* Right Trust Badges (Exact match to reference image) */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium ${
                isLight
                  ? 'bg-white border-stone-200/90 text-slate-800 shadow-xs'
                  : 'bg-neutral-900/80 border-neutral-800 text-neutral-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>24/7 Pickup & Support</span>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium ${
                isLight
                  ? 'bg-white border-stone-200/90 text-slate-800 shadow-xs'
                  : 'bg-neutral-900/80 border-neutral-800 text-neutral-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span>Verified Vehicles</span>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium ${
                isLight
                  ? 'bg-white border-stone-200/90 text-slate-800 shadow-xs'
                  : 'bg-neutral-900/80 border-neutral-800 text-neutral-300'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-neutral-400" />
              <span>Best Price Guarantee</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CATEGORY PILLS & SORT CONTROLS BAR (Matching Reference Image)
           ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          {/* Category Filter Pills (All 16, SUV 5, Luxury 4, Sedan 4, Hatchback 3) */}
          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1">
            {[
              { label: 'All (16)', value: 'ALL' },
              { label: 'SUV (5)', value: 'SUV' },
              { label: 'Luxury (4)', value: 'LUXURY' },
              { label: 'Sedan (4)', value: 'SEDAN' },
              { label: 'Hatchback (3)', value: 'HATCHBACK' },
            ].map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? isLight
                        ? 'bg-black text-white font-semibold shadow-xs'
                        : 'bg-[#fbf5eb] text-neutral-950 font-semibold shadow-sm'
                      : isLight
                      ? 'bg-white border border-stone-200 text-slate-700 hover:text-black hover:border-slate-400 shadow-xs'
                      : 'bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Sort & View Switcher */}
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className={`lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${
                isLight ? 'bg-white border-stone-200 text-slate-800' : 'bg-neutral-900 border-neutral-800 text-neutral-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* Sort Pill Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`appearance-none text-xs font-medium pl-3.5 pr-8 py-1.5 rounded-full cursor-pointer focus:outline-none transition-colors border ${
                  isLight
                    ? 'bg-white border-stone-200 text-slate-800 shadow-xs hover:border-slate-400'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <option value="popular_desc" className={isLight ? 'bg-white text-slate-900' : 'bg-neutral-900 text-white'}>
                  Sort: Most Popular
                </option>
                <option value="price_asc" className={isLight ? 'bg-white text-slate-900' : 'bg-neutral-900 text-white'}>
                  Sort: Price (Low to High)
                </option>
                <option value="price_desc" className={isLight ? 'bg-white text-slate-900' : 'bg-neutral-900 text-white'}>
                  Sort: Price (High to Low)
                </option>
                <option value="rating_desc" className={isLight ? 'bg-white text-slate-900' : 'bg-neutral-900 text-white'}>
                  Sort: Highest Rated
                </option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Switcher Icons */}
            <div
              className={`flex items-center p-0.5 rounded-full border ${
                isLight ? 'bg-white border-stone-200 shadow-xs' : 'bg-neutral-900/80 border-neutral-800'
              }`}
            >
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? isLight
                      ? 'bg-slate-200 text-black'
                      : 'bg-neutral-800 text-white'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? isLight
                      ? 'bg-slate-200 text-black'
                      : 'bg-neutral-800 text-white'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MAIN SECTION: FIXED FILTER SIDEBAR + SCROLLING CARDS GRID
           ========================================================================= */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-7 items-start relative">
          {/* =========================================================================
              PANEL 1: LEFT FILTER BY SIDEBAR (FIXED / STICKY ON SCROLL)
             ========================================================================= */}
          <aside
            className={`${
              mobileFilterOpen
                ? 'fixed inset-0 z-50 bg-black/90 p-5 overflow-y-auto block'
                : 'hidden'
            } lg:block lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden z-20`}
          >
            <div
              className={`rounded-2xl border p-5 space-y-6 shadow-xl ${
                isLight
                  ? 'bg-white border-stone-200/90 text-slate-900'
                  : 'bg-[#121316] border-neutral-800/80 text-white'
              }`}
            >
              {/* Header: Filter by & Reset all */}
              <div
                className={`flex items-center justify-between pb-3 border-b ${
                  isLight ? 'border-stone-100' : 'border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold tracking-tight">Filter by</h2>
                  {mobileFilterOpen && (
                    <button
                      type="button"
                      onClick={() => setMobileFilterOpen(false)}
                      className="lg:hidden p-1 rounded-full text-neutral-400 hover:text-white ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className={`text-xs font-medium transition-colors cursor-pointer ${
                    isLight ? 'text-slate-500 hover:text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Reset all
                </button>
              </div>

              {/* 1. Price Range Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isLight ? 'border-slate-300 bg-slate-100' : 'border-neutral-700 bg-neutral-800/60'
                    }`}
                  >
                    <IndianRupee className="w-2.5 h-2.5 text-neutral-400" />
                  </div>
                  <span className={isLight ? 'text-slate-800' : 'text-neutral-300'}>Price Range</span>
                </div>

                <div className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  ₹{minPrice.toLocaleString('en-IN')} - ₹{maxPrice.toLocaleString('en-IN')}{' '}
                  <span className="text-xs text-neutral-400 font-normal">/day</span>
                </div>

                {/* Sleek Dual / Range Slider */}
                <div className="pt-2">
                  <input
                    type="range"
                    min="1000"
                    max="20000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
                      isLight ? 'bg-slate-200 accent-black' : 'bg-neutral-800 accent-[#fbf5eb]'
                    }`}
                  />
                  <div className="flex justify-between text-[11px] font-mono text-neutral-500 mt-1">
                    <span>₹1,000</span>
                    <span>₹20,000</span>
                  </div>
                </div>
              </div>

              {/* 2. Vehicle Type Checkboxes */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                  <Car className="w-4 h-4 text-neutral-400" />
                  <span className={isLight ? 'text-slate-800' : 'text-neutral-300'}>Vehicle Type</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: 'SUV', count: 5, value: 'SUV' },
                    { label: 'Sedan', count: 4, value: 'SEDAN' },
                    { label: 'Hatchback', count: 3, value: 'HATCHBACK' },
                    { label: 'Luxury', count: 4, value: 'LUXURY' },
                  ].map((item) => {
                    const isChecked = selectedTypes.includes(item.value);
                    return (
                      <div
                        key={item.value}
                        onClick={() => toggleVehicleType(item.value)}
                        className="flex items-center justify-between py-1 cursor-pointer group text-xs select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                              isChecked
                                ? isLight
                                  ? 'bg-black border-black text-white'
                                  : 'bg-[#fbf5eb] border-[#fbf5eb] text-neutral-900'
                                : isLight
                                ? 'border-slate-300 bg-white group-hover:border-slate-400'
                                : 'border-neutral-700 bg-neutral-900/90 group-hover:border-neutral-500'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span
                            className={`transition-colors ${
                              isChecked
                                ? isLight
                                  ? 'text-black font-semibold'
                                  : 'text-white font-medium'
                                : isLight
                                ? 'text-slate-700 group-hover:text-black'
                                : 'text-neutral-300 group-hover:text-white'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                        <span className="text-neutral-500 font-mono text-xs">({item.count})</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Transmission Checkboxes */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                  <Settings2 className="w-4 h-4 text-neutral-400" />
                  <span className={isLight ? 'text-slate-800' : 'text-neutral-300'}>Transmission</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: 'Automatic', count: 12, value: 'AUTOMATIC' },
                    { label: 'Manual', count: 4, value: 'MANUAL' },
                  ].map((item) => {
                    const isChecked = selectedTransmissions.includes(item.value);
                    return (
                      <div
                        key={item.value}
                        onClick={() => toggleTransmission(item.value)}
                        className="flex items-center justify-between py-1 cursor-pointer group text-xs select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                              isChecked
                                ? isLight
                                  ? 'bg-black border-black text-white'
                                  : 'bg-[#fbf5eb] border-[#fbf5eb] text-neutral-900'
                                : isLight
                                ? 'border-slate-300 bg-white group-hover:border-slate-400'
                                : 'border-neutral-700 bg-neutral-900/90 group-hover:border-neutral-500'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span
                            className={`transition-colors ${
                              isChecked
                                ? isLight
                                  ? 'text-black font-semibold'
                                  : 'text-white font-medium'
                                : isLight
                                ? 'text-slate-700 group-hover:text-black'
                                : 'text-neutral-300 group-hover:text-white'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                        <span className="text-neutral-500 font-mono text-xs">({item.count})</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Fuel Type Checkboxes */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                  <Fuel className="w-4 h-4 text-neutral-400" />
                  <span className={isLight ? 'text-slate-800' : 'text-neutral-300'}>Fuel Type</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: 'Petrol', count: 10, value: 'PETROL' },
                    { label: 'Diesel', count: 5, value: 'DIESEL' },
                    { label: 'Electric', count: 1, value: 'ELECTRIC' },
                  ].map((item) => {
                    const isChecked = selectedFuels.includes(item.value);
                    return (
                      <div
                        key={item.value}
                        onClick={() => toggleFuel(item.value)}
                        className="flex items-center justify-between py-1 cursor-pointer group text-xs select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                              isChecked
                                ? isLight
                                  ? 'bg-black border-black text-white'
                                  : 'bg-[#fbf5eb] border-[#fbf5eb] text-neutral-900'
                                : isLight
                                ? 'border-slate-300 bg-white group-hover:border-slate-400'
                                : 'border-neutral-700 bg-neutral-900/90 group-hover:border-neutral-500'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span
                            className={`transition-colors ${
                              isChecked
                                ? isLight
                                  ? 'text-black font-semibold'
                                  : 'text-white font-medium'
                                : isLight
                                ? 'text-slate-700 group-hover:text-black'
                                : 'text-neutral-300 group-hover:text-white'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                        <span className="text-neutral-500 font-mono text-xs">({item.count})</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Close / Apply Button */}
              {mobileFilterOpen && (
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#fbf5eb] text-neutral-900 font-semibold text-xs mt-2"
                >
                  Apply Filters ({filteredVehicles.length} Cars)
                </button>
              )}
            </div>
          </aside>

          {/* =========================================================================
              PANEL 2: SCROLLING CARDS GRID (4 columns matching reference image)
             ========================================================================= */}
          <main className="flex-1 min-w-0">
            {filteredVehicles.length === 0 ? (
              <div
                className={`p-12 text-center rounded-2xl border space-y-3 ${
                  isLight
                    ? 'bg-white border-stone-200 text-slate-900 shadow-xs'
                    : 'bg-[#121316] border-neutral-800 text-white'
                }`}
              >
                <Car className="w-10 h-10 mx-auto text-neutral-500" />
                <h3 className="text-base font-bold">No vehicles match your filters</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Try broadening your price range or unchecking specific transmission or fuel filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#fbf5eb] text-neutral-900 hover:bg-white cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5'
                    : 'space-y-4'
                }
              >
                {filteredVehicles.map((car) => {
                  const isLiked = wishlist.has(car.id);
                  const primaryImage =
                    car.images?.find((img) => img.isPrimary)?.url ||
                    car.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80';

                  const badgeLabel = getBadgeLabel(car);
                  const displayPrice = Math.round(car.dailyRate / 100);

                  return (
                    <div
                      key={car.id}
                      className={`rounded-2xl border p-3.5 transition-all duration-200 flex flex-col justify-between group relative ${
                        isLight
                          ? 'border-stone-200/90 bg-white hover:border-stone-400 hover:shadow-lg'
                          : 'border-neutral-800/80 bg-[#121316] hover:border-neutral-700 hover:shadow-2xl'
                      }`}
                    >
                      <div>
                        {/* 1. Vehicle Image Container with Badges */}
                        <div
                          className={`aspect-[16/10] w-full rounded-xl overflow-hidden relative mb-3 border ${
                            isLight ? 'bg-stone-100 border-stone-200' : 'bg-neutral-950 border-neutral-800/60'
                          }`}
                        >
                          <img
                            src={primaryImage}
                            alt={`${car.brand} ${car.model}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />

                          {/* Category Badge top-left over image (e.g. Hatchback, Sedan, MPV, Luxury, SUV) */}
                          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/65 backdrop-blur-md border border-white/10 text-white text-[10px] font-medium tracking-wide">
                            {badgeLabel}
                          </div>

                          {/* Heart Wishlist button top-right over image */}
                          <button
                            type="button"
                            onClick={(e) => toggleWishlist(car.id, e)}
                            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/10 text-white hover:text-rose-400 transition-colors cursor-pointer"
                            title="Save to wishlist"
                            aria-label="Save to wishlist"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 transition-colors ${
                                isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'
                              }`}
                            />
                          </button>
                        </div>

                        {/* 2. Car Title */}
                        <h3
                          className={`font-bold text-sm truncate leading-tight transition-colors ${
                            isLight ? 'text-slate-900 group-hover:text-black' : 'text-white group-hover:text-neutral-200'
                          }`}
                        >
                          {car.brand} {car.model}
                        </h3>

                        {/* 3. Rating & Daily Price Row */}
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              {car.rating ? car.rating.toFixed(1) : '4.7'}
                            </span>
                            <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                              ({(car as any).totalReviews || (car as any).reviews?.length || 124} reviews)
                            </span>
                          </div>

                          <div className="text-right">
                            <span
                              className={`font-bold text-sm sm:text-base tabular-nums ${
                                isLight ? 'text-slate-900 font-extrabold' : 'text-white'
                              }`}
                            >
                              ₹{displayPrice.toLocaleString('en-IN')}
                            </span>
                            <span className={`text-[11px] ml-0.5 font-normal ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                              /day
                            </span>
                          </div>
                        </div>

                        {/* 4. Specs Chips Row (Automatic, Petrol, 5 Seater) */}
                        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                              isLight
                                ? 'bg-slate-100 border-slate-200 text-slate-700'
                                : 'bg-neutral-800/70 border-neutral-700/50 text-neutral-300'
                            }`}
                          >
                            {car.transmission === 'AUTOMATIC' ? 'Automatic' : 'Manual'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium capitalize border ${
                              isLight
                                ? 'bg-slate-100 border-slate-200 text-slate-700'
                                : 'bg-neutral-800/70 border-neutral-700/50 text-neutral-300'
                            }`}
                          >
                            {car.fuelType.toLowerCase()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                              isLight
                                ? 'bg-slate-100 border-slate-200 text-slate-700'
                                : 'bg-neutral-800/70 border-neutral-700/50 text-neutral-300'
                            }`}
                          >
                            {car.seatingCapacity} Seater
                          </span>
                        </div>

                        {/* 5. Pickup Location Row */}
                        <div
                          className={`flex items-center gap-1 text-xs mt-2 truncate ${
                            isLight ? 'text-slate-500' : 'text-neutral-400'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{car.city || 'New Delhi'}</span>
                        </div>
                      </div>

                      {/* 6. View Details Button (Cream / Beige matching reference image) */}
                      <button
                        type="button"
                        onClick={() => navigate(`/vehicles/${car.id}`)}
                        className={`mt-3.5 w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.99] cursor-pointer ${
                          isLight
                            ? 'bg-black text-white hover:bg-slate-900'
                            : 'bg-[#fbf5eb] hover:bg-white text-neutral-900'
                        }`}
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Booking Checkout Modal (if initiated) */}
      {bookingVehicle && (
        <BookingCheckoutModal
          vehicle={bookingVehicle}
          initialStartDate=""
          initialEndDate=""
          onClose={() => setBookingVehicle(null)}
        />
      )}
    </div>
  );
};

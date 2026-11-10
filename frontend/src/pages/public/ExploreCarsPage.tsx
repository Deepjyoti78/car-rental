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
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Check,
  ArrowRight,
  IndianRupee,
  Settings2,
  Fuel,
  SlidersHorizontal,
  X,
  Users,
  Sparkles,
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
        isLight ? 'bg-[#F8F6F1] text-slate-900' : 'bg-[#0a0b0d] text-white'
      }`}
    >
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        {/* =========================================================================
            TWO-COLUMN MAIN SHOWROOM LAYOUT:
            - LEFT COLUMN: FIXED "Filter Cars" SIDEBAR (Aligned with Header Banner)
            - RIGHT COLUMN: HERO BANNER + CATEGORY PILLS + TIGHT SCROLLING CARDS GRID
           ========================================================================= */}
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start relative">
          {/* =========================================================================
              LEFT COLUMN: FIXED / STICKY "Filter Cars" SIDEBAR
             ========================================================================= */}
          <aside
            className={`${
              mobileFilterOpen
                ? 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-5 overflow-y-auto block'
                : 'hidden'
            } lg:block lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden z-20`}
          >
            <div
              className={`rounded-2xl sm:rounded-3xl border p-5 space-y-5 shadow-xs ${
                isLight
                  ? 'bg-white border-stone-200/80 text-slate-900'
                  : 'bg-[#121316] border-neutral-800/80 text-white'
              }`}
            >
              {/* Header: Filter Cars & Reset All */}
              <div
                className={`flex items-center justify-between pb-3 border-b ${
                  isLight ? 'border-stone-100' : 'border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold tracking-tight">Filter Cars</h2>
                  {mobileFilterOpen && (
                    <button
                      type="button"
                      onClick={() => setMobileFilterOpen(false)}
                      className="lg:hidden p-1 rounded-full text-neutral-400 hover:text-white ml-2 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className={`text-xs font-medium transition-colors cursor-pointer ${
                    isLight ? 'text-slate-400 hover:text-slate-800' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Reset All
                </button>
              </div>

              {/* 1. Price Range Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isLight ? 'border-stone-300 bg-stone-100' : 'border-neutral-700 bg-neutral-800/60'
                    }`}
                  >
                    <IndianRupee className="w-2.5 h-2.5 text-stone-600" />
                  </div>
                  <span className={isLight ? 'text-slate-800' : 'text-neutral-300'}>Price Range</span>
                  <span className="text-[10px] text-slate-400 font-normal">/day</span>
                </div>

                <div className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  ₹{minPrice.toLocaleString('en-IN')} - ₹{maxPrice.toLocaleString('en-IN')}
                </div>

                {/* Sleek Tan / Caramel Accent Range Slider */}
                <div className="pt-2">
                  <input
                    type="range"
                    min="1000"
                    max="20000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
                      isLight ? 'bg-[#E5D7C3] accent-[#1c1c1e]' : 'bg-neutral-800 accent-[#fbf5eb]'
                    }`}
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                    <span>₹1,000</span>
                    <span>₹20,000</span>
                  </div>
                </div>
              </div>

              {/* 2. Vehicle Type Checkboxes */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-slate-500" />
                    <span className={isLight ? 'text-slate-800' : 'text-neutral-300'}>Vehicle Type</span>
                  </div>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
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
                                  ? 'bg-[#1c1c1e] border-[#1c1c1e] text-white'
                                  : 'bg-[#fbf5eb] border-[#fbf5eb] text-neutral-900'
                                : isLight
                                ? 'border-stone-300 bg-white group-hover:border-stone-400'
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
                        <span className="text-slate-400 font-mono text-xs">({item.count})</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Transmission Checkboxes */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-slate-500" />
                    <span className={isLight ? 'text-slate-800' : 'text-neutral-300'}>Transmission</span>
                  </div>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
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
                                  ? 'bg-[#1c1c1e] border-[#1c1c1e] text-white'
                                  : 'bg-[#fbf5eb] border-[#fbf5eb] text-neutral-900'
                                : isLight
                                ? 'border-stone-300 bg-white group-hover:border-stone-400'
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
                        <span className="text-slate-400 font-mono text-xs">({item.count})</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Fuel Type Checkboxes */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-slate-500" />
                    <span className={isLight ? 'text-slate-800' : 'text-neutral-300'}>Fuel Type</span>
                  </div>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
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
                                  ? 'bg-[#1c1c1e] border-[#1c1c1e] text-white'
                                  : 'bg-[#fbf5eb] border-[#fbf5eb] text-neutral-900'
                                : isLight
                                ? 'border-stone-300 bg-white group-hover:border-stone-400'
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
                        <span className="text-slate-400 font-mono text-xs">({item.count})</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Apply Button */}
              {mobileFilterOpen && (
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#1c1c1e] text-white font-semibold text-xs mt-2 cursor-pointer"
                >
                  Apply Filters ({filteredVehicles.length} Cars)
                </button>
              )}
            </div>
          </aside>

          {/* =========================================================================
              RIGHT COLUMN:
              1. HERO BANNER WITH SCENIC MOUNTAIN PANORAMA (Exact match to reference image)
              2. CATEGORY PILLS & SORT CONTROLS
              3. COMPACT SCROLLING CARDS GRID (Reduced empty space, tight padding)
             ========================================================================= */}
          <main className="flex-1 min-w-0">
            {/* 1. Hero Scenic Banner (Available Cars + Panoramic Desert Mountain Landscape) */}
            <div
              className={`rounded-2xl sm:rounded-3xl border overflow-hidden relative mb-5 flex items-center justify-between min-h-[140px] px-6 sm:px-8 py-6 ${
                isLight
                  ? 'bg-gradient-to-r from-[#F0EAE1] via-[#EFE6DC] to-[#E3D9C9] border-stone-200/70'
                  : 'bg-gradient-to-r from-[#17181c] via-[#1a1b20] to-[#22242b] border-neutral-800'
              }`}
            >
              {/* Left Text Content */}
              <div className="relative z-10 max-w-lg">
                <span className="text-[11px] font-bold tracking-wider text-[#A27B48] uppercase font-mono block mb-1">
                  PREMIUM RENTAL CARS
                </span>
                <h1
                  className={`text-2xl sm:text-3xl lg:text-[2rem] font-extrabold tracking-tight leading-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Available Cars
                </h1>
                <p className={`text-xs sm:text-sm mt-1 font-normal ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  Choose from our wide range of premium vehicles and hit the road.
                </p>
              </div>

              {/* Right Panoramic Mountain Backdrop */}
              <div className="absolute right-0 top-0 bottom-0 w-3/5 pointer-events-none overflow-hidden hidden sm:block">
                <img
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop&q=80"
                  alt="Scenic mountain landscape"
                  className="w-full h-full object-cover object-center"
                  style={{
                    maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 30%, black 75%)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 30%, black 75%)',
                  }}
                  loading="eager"
                />
              </div>
            </div>

            {/* 2. Category Filter Pills & Sort Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              {/* Category Filter Pills (All 16, SUV 5, Sedan 4, Hatchback 3, Luxury 4) */}
              <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1">
                {[
                  { label: 'All (16)', value: 'ALL', icon: LayoutGrid },
                  { label: 'SUV (5)', value: 'SUV', icon: Car },
                  { label: 'Sedan (4)', value: 'SEDAN', icon: Car },
                  { label: 'Hatchback (3)', value: 'HATCHBACK', icon: Car },
                  { label: 'Luxury (4)', value: 'LUXURY', icon: Sparkles },
                ].map((cat) => {
                  const isActive = selectedCategory === cat.value;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? isLight
                            ? 'bg-[#1c1c1e] text-white font-semibold shadow-xs'
                            : 'bg-[#fbf5eb] text-neutral-950 font-semibold shadow-sm'
                          : isLight
                          ? 'bg-white border border-stone-200 text-slate-700 hover:text-black hover:border-slate-400 shadow-xs'
                          : 'bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
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
                  className={`lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer ${
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
                    className={`appearance-none text-xs font-medium pl-3.5 pr-8 py-1.5 rounded-full cursor-pointer focus:outline-none transition-colors border shadow-xs ${
                      isLight
                        ? 'bg-white border-stone-200 text-slate-800 hover:border-slate-400'
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
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* View Switcher Icons */}
                <div
                  className={`flex items-center p-0.5 rounded-full border shadow-xs ${
                    isLight ? 'bg-white border-stone-200' : 'bg-neutral-900/80 border-neutral-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? isLight
                          ? 'bg-[#1c1c1e] text-white'
                          : 'bg-neutral-800 text-white'
                        : 'text-slate-400 hover:text-slate-700'
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
                          ? 'bg-[#1c1c1e] text-white'
                          : 'bg-neutral-800 text-white'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title="List View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Compact Scrolling Cards Grid (Tight gaps & reduced margins around image) */}
            {filteredVehicles.length === 0 ? (
              <div
                className={`p-12 text-center rounded-2xl border space-y-3 ${
                  isLight
                    ? 'bg-white border-stone-200 text-slate-900 shadow-xs'
                    : 'bg-[#121316] border-neutral-800 text-white'
                }`}
              >
                <Car className="w-10 h-10 mx-auto text-neutral-400" />
                <h3 className="text-base font-bold">No vehicles match your filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try broadening your price range or unchecking specific transmission or fuel filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#1c1c1e] text-white hover:bg-black cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5'
                    : 'space-y-3'
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
                      className={`rounded-2xl border p-2 sm:p-2.5 transition-all duration-200 flex flex-col justify-between group relative shadow-xs hover:shadow-md ${
                        isLight
                          ? 'border-stone-200/80 bg-white hover:border-stone-300'
                          : 'border-neutral-800/80 bg-[#121316] hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        {/* 1. Vehicle Image Container with Snug Margins */}
                        <div
                          className={`aspect-[16/10] w-full rounded-xl overflow-hidden relative mb-2.5 border ${
                            isLight ? 'bg-stone-100 border-stone-200/60' : 'bg-neutral-950 border-neutral-800/60'
                          }`}
                        >
                          <img
                            src={primaryImage}
                            alt={`${car.brand} ${car.model}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />

                          {/* Category Badge top-left over image (e.g. Hatchback, Sedan, MPV, Luxury, SUV) */}
                          <div
                            className={`absolute top-2 left-2 px-2.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wide shadow-xs ${
                              isLight
                                ? 'bg-white/95 text-slate-800 backdrop-blur-md border border-stone-200/60'
                                : 'bg-black/65 backdrop-blur-md border border-white/10 text-white'
                            }`}
                          >
                            {badgeLabel}
                          </div>

                          {/* Heart Wishlist button top-right over image */}
                          <button
                            type="button"
                            onClick={(e) => toggleWishlist(car.id, e)}
                            className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors cursor-pointer shadow-xs ${
                              isLight
                                ? 'bg-white/85 backdrop-blur-md text-slate-700 hover:text-rose-500 border border-stone-200/60'
                                : 'bg-black/45 backdrop-blur-md border border-white/10 text-white hover:text-rose-400'
                            }`}
                            title="Save to wishlist"
                            aria-label="Save to wishlist"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 transition-colors ${
                                isLiked ? 'fill-rose-500 text-rose-500' : ''
                              }`}
                            />
                          </button>
                        </div>

                        {/* 2. Car Title */}
                        <div className="px-1">
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
                              <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-neutral-400'}`}>
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
                              <span className={`text-[10px] ml-0.5 font-normal ${isLight ? 'text-slate-400' : 'text-neutral-400'}`}>
                                /day
                              </span>
                            </div>
                          </div>

                          {/* 4. Specs Chips Row (Automatic, Petrol, 5 Seater with icons) */}
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium border flex items-center gap-1 ${
                                isLight
                                  ? 'bg-stone-100/90 border-stone-200/60 text-stone-600'
                                  : 'bg-neutral-800/70 border-neutral-700/50 text-neutral-300'
                              }`}
                            >
                              <Settings2 className="w-2.5 h-2.5 opacity-70" />
                              <span>{car.transmission === 'AUTOMATIC' ? 'Automatic' : 'Manual'}</span>
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium capitalize border flex items-center gap-1 ${
                                isLight
                                  ? 'bg-stone-100/90 border-stone-200/60 text-stone-600'
                                  : 'bg-neutral-800/70 border-neutral-700/50 text-neutral-300'
                              }`}
                            >
                              <Fuel className="w-2.5 h-2.5 opacity-70" />
                              <span>{car.fuelType.toLowerCase()}</span>
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium border flex items-center gap-1 ${
                                isLight
                                  ? 'bg-stone-100/90 border-stone-200/60 text-stone-600'
                                  : 'bg-neutral-800/70 border-neutral-700/50 text-neutral-300'
                              }`}
                            >
                              <Users className="w-2.5 h-2.5 opacity-70" />
                              <span>{car.seatingCapacity} Seater</span>
                            </span>
                          </div>

                          {/* 5. Pickup Location Row */}
                          <div
                            className={`flex items-center gap-1 text-[11px] mt-1.5 truncate ${
                              isLight ? 'text-slate-400' : 'text-neutral-400'
                            }`}
                          >
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{car.city || 'Delhi'}</span>
                          </div>
                        </div>
                      </div>

                      {/* 6. View Details Button (Solid Dark Button matching reference image) */}
                      <button
                        type="button"
                        onClick={() => navigate(`/vehicles/${car.id}`)}
                        className={`mt-2.5 w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.99] cursor-pointer ${
                          isLight
                            ? 'bg-[#1c1c1e] text-white hover:bg-black'
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

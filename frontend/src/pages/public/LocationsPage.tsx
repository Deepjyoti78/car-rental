import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';
import {
  MapPin,
  Search,
  ArrowRight,
  Car,
  Calendar,
  RotateCcw,
} from 'lucide-react';

interface LocationItem {
  id: string;
  name: string;
  region: 'North' | 'West' | 'South' | 'East';
  locationsCount: number;
  image: string;
  popularHubs: string[];
  lat: number;
  lng: number;
}

const ALL_LOCATIONS: LocationItem[] = [
  {
    id: 'delhi',
    name: 'Delhi',
    region: 'North',
    locationsCount: 5,
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80',
    popularHubs: ['IGI Airport Terminal 3', 'Aerocity Express', 'Connaught Place'],
    lat: 28.6139,
    lng: 77.2090,
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    region: 'West',
    locationsCount: 4,
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80',
    popularHubs: ['Chhatrapati Shivaji Terminal 2', 'BKC', 'Andheri East'],
    lat: 19.0760,
    lng: 72.8777,
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    region: 'South',
    locationsCount: 3,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    popularHubs: ['Kempegowda Airport T1', 'Indiranagar 100ft Rd', 'Whitefield ITPL'],
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    id: 'pune',
    name: 'Pune',
    region: 'West',
    locationsCount: 2,
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Pune_Palace.jpg',
    popularHubs: ['Pune International Airport', 'Koregaon Park', 'Hinjewadi Phase 1'],
    lat: 18.5204,
    lng: 73.8567,
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    region: 'South',
    locationsCount: 2,
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Charminar_Hyderabad_1.jpg',
    popularHubs: ['RGIA Shamshabad', 'Hitec City', 'Gachibowli'],
    lat: 17.3850,
    lng: 78.4867,
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh',
    region: 'North',
    locationsCount: 2,
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Chandigarh_Capitol_Complex_-_Le_Corbusier_-_Open_hand_monument.jpg',
    popularHubs: ['Chandigarh Airport Express', 'Sector 17 Plaza', 'Elante Mall'],
    lat: 30.7333,
    lng: 76.7794,
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    region: 'North',
    locationsCount: 2,
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop&q=80',
    popularHubs: ['Jaipur International Airport', 'MI Road', 'Vaishali Nagar'],
    lat: 26.9124,
    lng: 75.7873,
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    region: 'East',
    locationsCount: 2,
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&auto=format&fit=crop&q=80',
    popularHubs: ['Netaji Subhash Airport', 'Park Street', 'Salt Lake Sector V'],
    lat: 22.5726,
    lng: 88.3639,
  },
];

const MAP_PINS = [
  { name: 'Chandigarh', left: 47, top: 31, count: 2 },
  { name: 'Delhi', left: 49, top: 36, count: 5 },
  { name: 'Jaipur', left: 42, top: 42, count: 2 },
  { name: 'Mumbai', left: 32, top: 62, count: 4 },
  { name: 'Pune', left: 36, top: 66, count: 2 },
  { name: 'Hyderabad', left: 51, top: 66, count: 2 },
  { name: 'Bengaluru', left: 47, top: 81, count: 3 },
  { name: 'Kolkata', left: 77, top: 52, count: 2 },
];

export const LocationsPage: React.FC = () => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<'All' | 'North' | 'West' | 'South' | 'East'>('All');
  const [activeCity, setActiveCity] = useState<LocationItem>(ALL_LOCATIONS[0]);

  // Filter locations
  const filteredLocations = useMemo(() => {
    return ALL_LOCATIONS.filter((item) => {
      const matchesRegion = selectedRegion === 'All' || item.region === selectedRegion;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.popularHubs.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesRegion && matchesSearch;
    });
  }, [selectedRegion, searchQuery]);

  const handleCitySelect = (city: LocationItem) => {
    setActiveCity(city);
    navigate(`/explore?city=${encodeURIComponent(city.name)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?city=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isLight ? 'bg-[#F8F6F1] text-slate-900' : 'bg-[#0a0b0d] text-white'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* =========================================================================
            1. TOP HERO BANNER: Sleek & Expansive
           ========================================================================= */}
        <div
          className={`rounded-2xl border overflow-hidden relative mb-4 sm:mb-5 min-h-[160px] sm:min-h-[180px] flex items-center justify-between px-6 sm:px-8 py-4 sm:py-5 ${
            isLight
              ? 'bg-gradient-to-r from-[#F6F2EB] via-[#F3EEE5] to-[#EBE4D8] border-stone-200/80 shadow-xs'
              : 'bg-gradient-to-r from-[#15161a] via-[#1a1b20] to-[#202228] border-neutral-800'
          }`}
        >
          {/* Left Text Content & Search */}
          <div className="relative z-10 max-w-lg">
            <span className="text-[10px] font-bold tracking-widest text-stone-500 uppercase font-mono block">
              LOCATIONS
            </span>
            <h1
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mt-1 mb-1.5 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Our Rental Locations
            </h1>
            <p
              className={`text-xs sm:text-[13px] leading-relaxed font-normal ${
                isLight ? 'text-stone-600' : 'text-neutral-400'
              }`}
            >
              Find and book a car at a location near you. We're growing across India to keep you moving anywhere, anytime.
            </p>

            {/* Compact Pill Search Input */}
            <form onSubmit={handleSearchSubmit} className="mt-3 max-w-sm sm:max-w-md w-full">
              <div
                className={`rounded-full border py-1.5 pl-4 pr-1.5 flex items-center gap-2.5 shadow-xs transition-all ${
                  isLight
                    ? 'bg-white border-stone-300/80 focus-within:border-stone-500 focus-within:ring-2 focus-within:ring-stone-200'
                    : 'bg-neutral-900 border-neutral-700 focus-within:border-neutral-500'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Search city or area"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full text-xs sm:text-sm bg-transparent focus:outline-none ${
                    isLight ? 'text-slate-900 placeholder:text-stone-400' : 'text-white placeholder:text-neutral-500'
                  }`}
                />
                <button
                  type="submit"
                  className="w-7 h-7 rounded-full bg-[#1c1c1e] hover:bg-black text-white flex items-center justify-center shrink-0 transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Search"
                  aria-label="Search"
                >
                  <Search className="w-3 h-3" />
                </button>
              </div>
            </form>
          </div>

          {/* Right India Gate Panoramic Visual */}
          <div className="absolute right-0 top-0 bottom-0 w-[50%] lg:w-[48%] pointer-events-none overflow-hidden hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1000&auto=format&fit=crop&q=80"
              alt="India Gate National Landmark"
              className="w-full h-full object-cover object-center"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 15%, black 50%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 15%, black 50%)',
              }}
              loading="eager"
            />
          </div>
        </div>

        {/* =========================================================================
            2. MAIN SHOWROOM SECTION:
            - Left: Coverage Across India Card (Compact & Reduced Height)
            - Right: Popular Locations Header & Compact 3-Column City Cards Grid
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-4 items-stretch">
          {/* LEFT COLUMN (3 Cols): Coverage Across India with Map */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col">
            <div
              className={`rounded-xl border p-3 sm:p-3.5 shadow-xs flex-1 flex flex-col justify-between ${
                isLight
                  ? 'bg-[#FAF8F5] border-stone-200/80 text-slate-900'
                  : 'bg-[#101115] border-neutral-800/80 text-white'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-1.5">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm tracking-tight">Coverage Across India</h3>
                  <p className={`text-[11px] mt-0.5 font-medium ${isLight ? 'text-stone-500' : 'text-neutral-400'}`}>
                    12+ Cities
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRegion('All')}
                  className={`text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                    isLight ? 'text-stone-600 hover:text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Tightly-fitted India Map (Reduced Height, Snug Boundaries) */}
              <div className="relative w-full max-w-[260px] sm:max-w-[280px] max-h-[300px] aspect-[610/725] mx-auto my-auto flex items-center justify-center overflow-hidden rounded-lg">
                <img
                  src={isLight ? '/india-map-light.png' : '/india-map-dark.png'}
                  alt="Coverage Across India Map"
                  className="w-full h-full object-contain select-none transition-all duration-300"
                  draggable={false}
                />

                {/* Interactive Hotspots matching tightly-cropped map coordinates */}
                {[
                  { name: 'Delhi', left: 31, top: 32 },
                  { name: 'Jaipur', left: 24.5, top: 35.5 },
                  { name: 'Mumbai', left: 17, top: 56 },
                  { name: 'Pune', left: 20.5, top: 59 },
                  { name: 'Hyderabad', left: 36.5, top: 59 },
                  { name: 'Bengaluru', left: 31, top: 75 },
                  { name: 'Kolkata', left: 63, top: 51 },
                ].map((pin) => {
                  const isSelected = activeCity?.name.toLowerCase() === pin.name.toLowerCase();
                  return (
                    <button
                      key={pin.name}
                      type="button"
                      onClick={() => {
                        const found = ALL_LOCATIONS.find((l) => l.name === pin.name);
                        if (found) handleCitySelect(found);
                      }}
                      style={{ left: `${pin.left}%`, top: `${pin.top}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center group cursor-pointer z-10"
                      title={pin.name}
                      aria-label={`Select ${pin.name}`}
                    >
                      {/* Hover / selection pulse */}
                      <span
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          isSelected
                            ? 'bg-amber-400/50 ring-2 ring-amber-300 animate-pulse'
                            : 'opacity-0 group-hover:opacity-100 bg-amber-400/40 ring-1 ring-white/80'
                        }`}
                      />
                      {/* Hover Tooltip */}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-3.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-black/90 text-white shadow-md whitespace-nowrap pointer-events-none z-20">
                        {pin.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (9 Cols): Popular Locations Header + 3-Column City Cards Grid */}
          <div className="lg:col-span-9 xl:col-span-9 flex flex-col justify-between">
            {/* Header Row: Positioned directly above Delhi Card and Region Tabs on right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <h2
                className={`text-base sm:text-lg font-bold tracking-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Popular Locations
              </h2>

              {/* Region Filter Tabs */}
              <div
                className={`flex items-center gap-1 p-0.5 rounded-lg border ${
                  isLight
                    ? 'bg-[#ECE5DC]/70 border-stone-200/90'
                    : 'bg-neutral-900/90 border-neutral-800'
                }`}
              >
                {(['All', 'North', 'West', 'South', 'East'] as const).map((region) => {
                  const isActive = selectedRegion === region;
                  return (
                    <button
                      key={region}
                      type="button"
                      onClick={() => setSelectedRegion(region)}
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                        isActive
                          ? isLight
                            ? 'bg-[#1c1c1e] text-white font-semibold shadow-xs'
                            : 'bg-white text-black font-semibold shadow-xs'
                          : isLight
                          ? 'text-stone-600 hover:text-black'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {region}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City Cards 3-Column Grid */}
            <div className="flex-1 flex flex-col justify-center">
              {filteredLocations.length === 0 ? (
                <div
                  className={`p-6 text-center rounded-xl border space-y-2 h-full flex flex-col items-center justify-center ${
                    isLight ? 'bg-white border-stone-200 text-slate-900' : 'bg-[#121316] border-neutral-800 text-white'
                  }`}
                >
                  <MapPin className="w-7 h-7 text-stone-400 mx-auto" />
                  <h3 className="text-xs font-bold">No locations found</h3>
                  <p className="text-[11px] text-stone-500 max-w-xs">
                    No hubs matched "{searchQuery}" in {selectedRegion}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedRegion('All');
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#1c1c1e] text-white hover:bg-black cursor-pointer"
                  >
                    Show All Locations
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3">
                  {filteredLocations.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleCitySelect(item)}
                      className={`rounded-xl border p-2 transition-all duration-200 cursor-pointer group flex flex-col justify-between shadow-xs hover:shadow-md ${
                        isLight
                          ? 'border-stone-200/80 bg-white hover:border-stone-300'
                          : 'border-neutral-800/80 bg-[#121316] hover:border-neutral-700'
                      }`}
                    >
                      {/* Photo aspect ratio: Compact 16/8.5 for sleek height */}
                      <div
                        className={`aspect-[16/8.5] w-full rounded-lg overflow-hidden relative mb-1.5 border ${
                          isLight ? 'bg-stone-100 border-stone-200/60' : 'bg-neutral-950 border-neutral-800/60'
                        }`}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>

                      {/* City Name & Locations Count Footer */}
                      <div className="flex items-center justify-between px-1 py-0.5">
                        <div
                          className={`flex items-center gap-1.5 font-bold text-xs ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          <MapPin
                            className={`w-3 h-3 shrink-0 ${
                              isLight ? 'text-stone-700' : 'text-stone-300'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>

                        <div
                          className={`text-[11px] font-medium flex items-center gap-1 transition-colors ${
                            isLight
                              ? 'text-stone-500 group-hover:text-black'
                              : 'text-stone-400 group-hover:text-white'
                          }`}
                        >
                          <span>{item.locationsCount} Locations</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. BOTTOM VALUE PROPS BAR: Expansive & Refined
           ========================================================================= */}
        <div
          className={`rounded-xl border p-4 sm:p-5 mt-5 sm:mt-6 ${
            isLight
              ? 'bg-[#F1ECE4] border-stone-200/80 text-slate-900'
              : 'bg-[#15161a] border-neutral-800 text-white'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4 items-center">
            {/* Value Prop 1: Wide Coverage */}
            <div className="flex items-center gap-3.5 px-2">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                  isLight ? 'bg-white border-stone-300/80 text-slate-900' : 'bg-neutral-800 border-neutral-700 text-white'
                }`}
              >
                <Car className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-[13px] tracking-tight">Wide Coverage</h4>
                <p className={`text-[11px] sm:text-xs mt-0.5 ${isLight ? 'text-stone-600' : 'text-neutral-400'}`}>
                  Cars available across major Indian cities
                </p>
              </div>
            </div>

            {/* Value Prop 2: Flexible Pickups */}
            <div
              className={`flex items-center gap-3.5 px-2 md:border-l ${
                isLight ? 'md:border-stone-300/80' : 'md:border-neutral-800'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                  isLight ? 'bg-white border-stone-300/80 text-slate-900' : 'bg-neutral-800 border-neutral-700 text-white'
                }`}
              >
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-[13px] tracking-tight">Flexible Pickups</h4>
                <p className={`text-[11px] sm:text-xs mt-0.5 ${isLight ? 'text-stone-600' : 'text-neutral-400'}`}>
                  Choose from multiple pickup points
                </p>
              </div>
            </div>

            {/* Value Prop 3: Easy Returns */}
            <div
              className={`flex items-center gap-3.5 px-2 md:border-l ${
                isLight ? 'md:border-stone-300/80' : 'md:border-neutral-800'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                  isLight ? 'bg-white border-stone-300/80 text-slate-900' : 'bg-neutral-800 border-neutral-700 text-white'
                }`}
              >
                <RotateCcw className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-[13px] tracking-tight">Easy Returns</h4>
                <p className={`text-[11px] sm:text-xs mt-0.5 ${isLight ? 'text-stone-600' : 'text-neutral-400'}`}>
                  Drop off at a location that suits you
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

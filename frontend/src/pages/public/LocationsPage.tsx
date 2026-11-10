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
  CheckCircle2,
  ExternalLink,
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
    popularHubs: ['IGI Airport Terminal 3', 'Aerocity Express', 'Connaught Place Outer Circle', 'South Extension', 'Saket District Centre'],
    lat: 28.6139,
    lng: 77.2090,
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    region: 'West',
    locationsCount: 4,
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80',
    popularHubs: ['Chhatrapati Shivaji Terminal 2', 'Bandra Kurla Complex (BKC)', 'Andheri East Metro Hub', 'Juhu Beach Promenade'],
    lat: 19.0760,
    lng: 72.8777,
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    region: 'South',
    locationsCount: 3,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    popularHubs: ['Kempegowda Airport T1 Parking', 'Indiranagar 100ft Road', 'Whitefield ITPL Gateway', 'Koramangala 4th Block'],
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    id: 'pune',
    name: 'Pune',
    region: 'West',
    locationsCount: 2,
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Pune_Palace.jpg',
    popularHubs: ['Pune International Airport Lohegaon', 'Koregaon Park North Main Road', 'Hinjewadi Phase 1'],
    lat: 18.5204,
    lng: 73.8567,
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    region: 'South',
    locationsCount: 2,
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Charminar_Hyderabad_1.jpg',
    popularHubs: ['Rajiv Gandhi International Airport Shamshabad', 'Hitec City Mindspace', 'Gachibowli Stadium Concourse'],
    lat: 17.3850,
    lng: 78.4867,
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh',
    region: 'North',
    locationsCount: 2,
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Chandigarh_Capitol_Complex_-_Le_Corbusier_-_Open_hand_monument.jpg',
    popularHubs: ['Chandigarh Airport Express Bay', 'Sector 17 Plaza Corridor', 'Elante Mall Commercial Zone'],
    lat: 30.7333,
    lng: 76.7794,
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    region: 'North',
    locationsCount: 2,
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop&q=80',
    popularHubs: ['Jaipur International Airport Sanganer', 'MI Road Central Commercial', 'Vaishali Nagar Amrapali'],
    lat: 26.9124,
    lng: 75.7873,
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    region: 'East',
    locationsCount: 2,
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&auto=format&fit=crop&q=80',
    popularHubs: ['Netaji Subhash Chandra Bose Airport', 'Park Street Concourse', 'Salt Lake Sector V'],
    lat: 22.5726,
    lng: 88.3639,
  },
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
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        {/* =========================================================================
            1. TOP HERO BANNER: "Our Rental Locations" + India Gate Panoramic Visual
           ========================================================================= */}
        <div
          className={`rounded-2xl sm:rounded-3xl border overflow-hidden relative mb-7 min-h-[220px] sm:min-h-[270px] flex items-center justify-between px-6 sm:px-12 py-8 ${
            isLight
              ? 'bg-gradient-to-r from-[#F6F2EB] via-[#F3EEE5] to-[#EBE4D8] border-stone-200/70 shadow-xs'
              : 'bg-gradient-to-r from-[#17181c] via-[#1a1b20] to-[#22242b] border-neutral-800'
          }`}
        >
          {/* Left Text Content & Search */}
          <div className="relative z-10 max-w-xl">
            <span className="text-[11px] font-bold tracking-wider text-stone-500 uppercase font-mono block mb-1">
              LOCATIONS
            </span>
            <h1
              className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Our Rental Locations
            </h1>
            <p className={`text-xs sm:text-sm mt-2 font-normal ${isLight ? 'text-stone-600' : 'text-neutral-400'}`}>
              Find and book a car at a location near you. We're growing across India to keep you moving anywhere, anytime.
            </p>

            {/* Pill Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="mt-6 max-w-md w-full">
              <div
                className={`rounded-full border p-1.5 pl-4 flex items-center gap-2 shadow-xs transition-all ${
                  isLight
                    ? 'bg-white border-stone-300/80 focus-within:border-stone-500 focus-within:ring-2 focus-within:ring-stone-200'
                    : 'bg-neutral-900 border-neutral-700 focus-within:border-neutral-500'
                }`}
              >
                <MapPin className="w-4 h-4 text-stone-500 shrink-0" />
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
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1c1c1e] hover:bg-black text-white flex items-center justify-center shrink-0 transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Search"
                  aria-label="Search"
                >
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right India Gate Panoramic Visual with Seamless Fade */}
          <div className="absolute right-0 top-0 bottom-0 w-3/5 pointer-events-none overflow-hidden hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&auto=format&fit=crop&q=80"
              alt="India Gate National Landmark"
              className="w-full h-full object-cover object-center"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 25%, black 65%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 25%, black 65%)',
              }}
              loading="eager"
            />
          </div>
        </div>

        {/* =========================================================================
            2. MAIN SHOWROOM SECTION:
            - Left: Coverage Across India Card with Vector India Map
            - Right: Popular Locations Header & 3-Column City Cards Grid
           ========================================================================= */}
        <div className="space-y-4">
          {/* Header Row for Popular Locations and Region Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2
              className={`text-xl sm:text-2xl font-bold tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Popular Locations
            </h2>

            {/* Region Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1">
              {(['All', 'North', 'West', 'South', 'East'] as const).map((region) => {
                const isActive = selectedRegion === region;
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => setSelectedRegion(region)}
                    className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? isLight
                          ? 'bg-[#1c1c1e] text-white font-semibold shadow-xs'
                          : 'bg-[#fbf5eb] text-neutral-950 font-semibold shadow-sm'
                        : isLight
                        ? 'bg-white border border-stone-200 text-stone-600 hover:text-black hover:border-stone-400 shadow-xs'
                        : 'bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {region}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two-Column Grid: Map on Left (4 cols), Cards on Right (8 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* LEFT COLUMN (4 Cols): Coverage Across India with Map */}
            <div className="lg:col-span-4 xl:col-span-4">
              <div
                className={`rounded-2xl sm:rounded-3xl border p-5 sm:p-6 shadow-xs h-full flex flex-col justify-between ${
                  isLight
                    ? 'bg-white border-stone-200/80 text-slate-900'
                    : 'bg-[#121316] border-neutral-800/80 text-white'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base tracking-tight">Coverage Across India</h3>
                    <p className={`text-xs mt-0.5 font-medium ${isLight ? 'text-stone-500' : 'text-neutral-400'}`}>
                      12+ Cities
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRegion('All')}
                    className={`text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                      isLight ? 'text-stone-600 hover:text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Stylized Vector SVG Map of India with Interactive Pins */}
                <div className="py-6 flex items-center justify-center relative my-auto">
                  <svg
                    viewBox="0 0 400 450"
                    className="w-full max-w-[280px] sm:max-w-[310px] h-auto drop-shadow-xs select-none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Realistic Minimalist India Landmass Outline */}
                    <path
                      d="M 170 30 
                         C 180 15, 210 20, 215 40 
                         C 220 55, 205 70, 200 85 
                         C 215 95, 240 110, 260 120 
                         C 265 115, 275 110, 280 120 
                         C 285 125, 295 120, 305 115 
                         C 320 100, 350 95, 360 110 
                         C 370 125, 355 145, 340 155 
                         C 345 170, 335 190, 320 195 
                         C 305 200, 290 185, 285 175 
                         C 275 180, 260 190, 255 210 
                         C 250 230, 235 260, 220 290 
                         C 205 320, 190 360, 175 400 
                         C 170 415, 165 415, 160 405 
                         C 145 365, 130 315, 115 275 
                         C 105 255, 95 240, 85 230 
                         C 75 235, 55 240, 45 225 
                         C 38 215, 50 200, 68 200 
                         C 50 195, 40 185, 48 172 
                         C 60 165, 80 175, 95 175 
                         C 100 155, 115 130, 135 110 
                         C 145 95, 160 70, 170 30 
                         Z"
                      fill={isLight ? '#E5E0DB' : '#1e2025'}
                      stroke={isLight ? '#D6D0C7' : '#2d3139'}
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />

                    {/* Secondary Island Outlines (Andaman / Lakshadweep) */}
                    <circle cx="310" cy="350" r="2.5" fill={isLight ? '#C9C2B8' : '#333742'} />
                    <circle cx="315" cy="365" r="2" fill={isLight ? '#C9C2B8' : '#333742'} />
                    <circle cx="120" cy="360" r="2" fill={isLight ? '#C9C2B8' : '#333742'} />

                    {/* City Pins with Tooltip Rings */}
                    {[
                      { name: 'Delhi', cx: 175, cy: 125, count: 5 },
                      { name: 'Chandigarh', cx: 165, cy: 95, count: 2 },
                      { name: 'Jaipur', cx: 140, cy: 150, count: 2 },
                      { name: 'Mumbai', cx: 100, cy: 245, count: 4 },
                      { name: 'Pune', cx: 115, cy: 265, count: 2 },
                      { name: 'Hyderabad', cx: 175, cy: 275, count: 2 },
                      { name: 'Bengaluru', cx: 155, cy: 345, count: 3 },
                      { name: 'Kolkata', cx: 270, cy: 195, count: 2 },
                    ].map((pin) => {
                      const isSelected = activeCity?.name.toLowerCase() === pin.name.toLowerCase();
                      return (
                        <g
                          key={pin.name}
                          onClick={() => {
                            const found = ALL_LOCATIONS.find((l) => l.name === pin.name);
                            if (found) handleCitySelect(found);
                          }}
                          className="cursor-pointer group/pin"
                        >
                          {/* Pulsing ring on hover / select */}
                          <circle
                            cx={pin.cx}
                            cy={pin.cy}
                            r={isSelected ? 10 : 7}
                            className={`transition-all ${
                              isSelected
                                ? 'fill-black/15 stroke-black stroke-1 animate-ping'
                                : 'fill-transparent group-hover/pin:fill-black/10'
                            }`}
                          />
                          {/* Pin dot */}
                          <circle
                            cx={pin.cx}
                            cy={pin.cy}
                            r={isSelected ? 5.5 : 4}
                            className={`transition-all ${
                              isSelected
                                ? 'fill-black stroke-2 stroke-white'
                                : isLight
                                ? 'fill-[#1c1c1e] group-hover/pin:fill-black'
                                : 'fill-white group-hover/pin:fill-amber-400'
                            }`}
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Footer caption */}
                <div
                  className={`pt-3 border-t text-xs flex items-center justify-between ${
                    isLight ? 'border-stone-100 text-stone-500' : 'border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span>Select any hub to view available cars</span>
                  <span className="font-semibold text-slate-800">100% Commercial Yellow Plates</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (8 Cols): 3-Column City Cards Grid */}
            <div className="lg:col-span-8 xl:col-span-8">
              {filteredLocations.length === 0 ? (
                <div
                  className={`p-12 text-center rounded-2xl border space-y-3 h-full flex flex-col items-center justify-center ${
                    isLight ? 'bg-white border-stone-200 text-slate-900' : 'bg-[#121316] border-neutral-800 text-white'
                  }`}
                >
                  <MapPin className="w-10 h-10 text-stone-400 mx-auto" />
                  <h3 className="text-base font-bold">No locations found</h3>
                  <p className="text-xs text-stone-500 max-w-sm">
                    No hubs matched "{searchQuery}" in region {selectedRegion}. Try searching for another city like Delhi, Mumbai, or Bengaluru.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedRegion('All');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1c1c1e] text-white hover:bg-black cursor-pointer"
                  >
                    Show All Locations
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
                  {filteredLocations.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleCitySelect(item)}
                      className={`rounded-2xl border p-2 sm:p-2.5 transition-all duration-200 cursor-pointer group flex flex-col justify-between shadow-xs hover:shadow-md ${
                        isLight
                          ? 'border-stone-200/80 bg-white hover:border-stone-300'
                          : 'border-neutral-800/80 bg-[#121316] hover:border-neutral-700'
                      }`}
                    >
                      {/* Photo aspect ratio */}
                      <div
                        className={`aspect-[16/10] w-full rounded-xl overflow-hidden relative mb-2 border ${
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
                      <div className="flex items-center justify-between px-2 py-1">
                        <div
                          className={`flex items-center gap-1.5 font-bold text-sm ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          <MapPin
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isLight ? 'text-stone-700' : 'text-stone-300'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>

                        <div
                          className={`text-xs font-medium flex items-center gap-1 transition-colors ${
                            isLight
                              ? 'text-stone-500 group-hover:text-black'
                              : 'text-stone-400 group-hover:text-white'
                          }`}
                        >
                          <span>{item.locationsCount} Locations</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
            3. BOTTOM VALUE PROPS BAR (Wide Coverage, Flexible Pickups, Easy Returns)
           ========================================================================= */}
        <div
          className={`rounded-2xl border p-5 mt-7 ${
            isLight
              ? 'bg-[#F1ECE4] border-stone-200/70 text-slate-900'
              : 'bg-neutral-900/90 border-neutral-800 text-white'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 items-center">
            {/* Value Prop 1: Wide Coverage */}
            <div className="flex items-center gap-3.5 px-2">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isLight ? 'bg-white border-stone-300/70 text-slate-900' : 'bg-neutral-800 border-neutral-700 text-white'
                }`}
              >
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight">Wide Coverage</h4>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-stone-600' : 'text-neutral-400'}`}>
                  Cars available across major Indian cities
                </p>
              </div>
            </div>

            {/* Value Prop 2: Flexible Pickups */}
            <div
              className={`flex items-center gap-3.5 px-2 md:border-l ${
                isLight ? 'md:border-stone-300/70' : 'md:border-neutral-800'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isLight ? 'bg-white border-stone-300/70 text-slate-900' : 'bg-neutral-800 border-neutral-700 text-white'
                }`}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight">Flexible Pickups</h4>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-stone-600' : 'text-neutral-400'}`}>
                  Choose from multiple pickup points
                </p>
              </div>
            </div>

            {/* Value Prop 3: Easy Returns */}
            <div
              className={`flex items-center gap-3.5 px-2 md:border-l ${
                isLight ? 'md:border-stone-300/70' : 'md:border-neutral-800'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isLight ? 'bg-white border-stone-300/70 text-slate-900' : 'bg-neutral-800 border-neutral-700 text-white'
                }`}
              >
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight">Easy Returns</h4>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-stone-600' : 'text-neutral-400'}`}>
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

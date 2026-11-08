import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VehicleCard } from '../../components/cards/VehicleCard';
import { vehicleService } from '../../services/vehicleService';
import { useThemeStore } from '../../store/themeStore';
import { Vehicle } from '../../types';
import {
  ShieldCheck,
  Zap,
  Car,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle2,
  Search,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?city=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const cars = await vehicleService.getFeatured();
        setFeaturedCars(cars);
      } catch (e) {
        console.error('Failed to load featured cars:', e);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const categories = [
    {
      id: 'SUV',
      tag: 'EXPEDITION & HIGHWAY',
      title: 'Performance SUVs',
      desc: 'All-wheel drive, high ground clearance, 5 to 7 passenger capacity for long-distance highways and hill climbs.',
      lineup: 'Mahindra Thar, Toyota Fortuner, Scorpio-N, Creta',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
    },
    {
      id: 'LUXURY',
      tag: 'EXECUTIVE REFINEMENT',
      title: 'Luxury Saloons',
      desc: 'German engineering, acoustic glass, and prestigious styling for business summits and celebratory travel.',
      lineup: 'BMW 3/5 Series, Mercedes C-Class, Audi A4',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    },
    {
      id: 'ELECTRIC',
      tag: 'ZERO EMISSION',
      title: 'Electric Vehicles',
      desc: 'Instant peak torque, whisper-quiet cabin acoustics, and high-speed DC fast charging compatibility.',
      lineup: 'Tata Nexon EV Max, BYD Seal, MG ZS EV',
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80',
    },
    {
      id: 'SEDAN',
      tag: 'COMFORT CRUISING',
      title: 'Touring Sedans',
      desc: 'Smooth ride geometry, expansive rear legroom, and class-leading highway fuel efficiency.',
      lineup: 'Skoda Slavia, Honda City Hybrid, VW Virtus',
      image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80',
    },
  ];

  const hubs = [
    {
      name: 'Delhi NCR',
      tag: 'Indira Gandhi Int’l Airport (DEL) & Connaught Place',
      fleetCount: '150+ Cars',
      highlight: 'Terminal 3 & Aerocity Meet-and-Greet',
    },
    {
      name: 'Gurgaon',
      tag: 'Cyber Hub & Golf Course Extension Rd',
      fleetCount: '110+ Cars',
      highlight: 'Rapid Corporate & DLF Delivery',
    },
    {
      name: 'Noida',
      tag: 'Sector 62 & Yamuna Expressway Corridor',
      fleetCount: '80+ Cars',
      highlight: 'Gateway to Agra & Taj Expressway',
    },
    {
      name: 'Jaipur',
      tag: 'Sanganer Airport & MI Road',
      fleetCount: '65+ Cars',
      highlight: 'Heritage Circuit & Outstation Travel',
    },
    {
      name: 'Chandigarh',
      tag: 'Sector 17 & Mohali International Airport',
      fleetCount: '50+ Cars',
      highlight: 'Shivalik Foothills & Himachal Access',
    },
  ];

  const faqs = [
    {
      q: 'What credentials are required to rent and drive a DriveLoop vehicle?',
      a: 'Renters must possess an original Indian Driving License (valid for a minimum of 1 year, commercial or non-transport) and a verified government photo identity document (Aadhaar or Passport). Verification is securely authorized before physical vehicle handover.',
    },
    {
      q: 'How does the refundable security deposit escrow operate?',
      a: 'Unlike traditional rental agencies that hold money for weeks, DriveLoop places deposits in transparent escrow. Following your trip, once the vehicle is inspected with no unreported body damage or unpaid municipal e-challans, 100% of the deposit is released to your original payment method within 24 hours.',
    },
    {
      q: 'What is the marketplace cancellation and refund schedule?',
      a: 'We maintain clear, contractually binding cancellation tiers: Cancellations initiated > 48 hours prior to scheduled pickup receive a 100% full refund. Between 24 and 48 hours, a 75% refund is granted. Less than 24 hours receives a 50% refund. The security deposit is always refunded 100% in all scenarios.',
    },
    {
      q: 'Are FASTag highway tolls and fuel expenses included in the rate?',
      a: 'Every car in the DriveLoop fleet carries an active commercial FASTag. Expressway toll deductions are settled transparently on actuals at trip return. Vehicles are provided with a documented fuel level and should be returned at the equivalent mark.',
    },
    {
      q: 'How do independent rental operators partner with DriveLoop?',
      a: 'Fleet operators can register through the "Become a Host" portal. Once commercial vehicle permits, yellow-plate documentation, and business registrations are vetted by our compliance desk, you can list your vehicles, set custom pricing, and receive guaranteed weekly payouts with just a 10% platform fee.',
    },
  ];

  const filteredCars =
    activeCategoryTab === 'ALL'
      ? featuredCars
      : featuredCars.filter((c) => c.category === activeCategoryTab);

  return (
    <div
      className={`space-y-24 pb-24 transition-colors duration-200 ${
        isLight ? 'bg-[#F4EFEA] text-slate-900' : 'bg-[#0B0F14] text-[#FAF8F3]'
      }`}
    >
      {/* 1. HERO SECTION: Full-bleed Porsche Lakeside Visual Identity matching Image 2 */}
      <section className="relative h-screen min-h-[660px] max-h-[1080px] flex flex-col justify-between overflow-hidden">
        {/* Cinematic Background Image from user upload */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-bg.png"
            alt="Blue Porsche by the lakeside"
            className="w-full h-full object-cover object-[center_65%]"
          />
          {/* Subtle natural photo gradient overlay matching Image 2 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55 pointer-events-none" />
        </div>

        {/* Center Hero Content (placed gracefully in the upper lake/mountain region well above the Porsche) */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 w-full flex-1 flex flex-col items-center justify-start pt-24 sm:pt-28 lg:pt-[136px] text-center">
          {/* Frosted Badge matching Image 2: [Car Rental, Reinvented] */}
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-black/25 backdrop-blur-md border border-white/20 text-white/90 text-xs font-normal mb-3 sm:mb-4 shadow-sm">
            <Car className="w-3.5 h-3.5 text-white/80" strokeWidth={1.8} />
            <span>Car Rental, Reinvented</span>
          </div>

          {/* Headline matching user request: thicker weight */}
          <h1 className="text-3xl sm:text-5xl lg:text-[3.6rem] font-medium text-white tracking-tight leading-[1.12] max-w-3xl mx-auto drop-shadow-sm">
            Rediscover the Joy of <br />
            the Open Road
          </h1>

          {/* Frosted Pill Search Capsule matching user request: transparent with subtle border */}
          <form
            onSubmit={handleQuickSearch}
            className="mt-6 sm:mt-7 w-full max-w-[390px] mx-auto rounded-full bg-transparent backdrop-blur-sm border border-white/30 shadow-lg p-1 flex items-center justify-between hover:border-white/50 transition-all group"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by destination or vehicle..."
              className="w-full bg-transparent pl-4 pr-2 text-xs text-white placeholder-white/50 focus:outline-none font-normal"
            />
            <button
              type="submit"
              aria-label="Search vehicles"
              className="w-9 h-9 rounded-full bg-[#F6E7D7] hover:bg-white text-[#0B0F14] flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#0B0F14]" strokeWidth={2.2} />
            </button>
          </form>
        </div>

        {/* Bottom Trust Indicators matching Image 2 */}
        <div className="relative z-10 pb-7 sm:pb-9 flex items-center justify-center gap-6 sm:gap-10 text-xs text-white/85 font-normal tracking-wide">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-white/80" strokeWidth={1.8} />
            <span>Instant Booking</span>
          </div>
          <span className="text-white/25">|</span>
          <div className="flex items-center gap-2">
            <Car className="w-3.5 h-3.5 text-white/80" strokeWidth={1.8} />
            <span>Wide Selection</span>
          </div>
          <span className="text-white/25">|</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-white/80" strokeWidth={1.8} />
            <span>Secure & Reliable</span>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY ARCHITECTURE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b ${
            isLight ? 'border-stone-200/80' : 'border-[#36424D]'
          }`}
        >
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#E07A3F]">
              Class & Capability
            </span>
            <h2
              className={`font-display text-2xl sm:text-3xl font-bold mt-1 ${
                isLight ? 'text-slate-900' : 'text-[#FAF8F3]'
              }`}
            >
              Curated Fleet Categories
            </h2>
          </div>
          <Link
            to="/explore"
            className={`text-xs font-semibold flex items-center space-x-1.5 mt-2 sm:mt-0 transition-colors group ${
              isLight ? 'text-slate-600 hover:text-black' : 'text-[#D5DBE1] hover:text-[#F6E7D7]'
            }`}
          >
            <span>Explore All 16+ Vehicles</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-[#2D7DA6]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/explore?category=${cat.id}`)}
              className={`group cursor-pointer rounded-xl border overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                isLight
                  ? 'bg-white border-stone-200/80 shadow-xs hover:border-stone-400 hover:shadow-md'
                  : 'bg-[#1A222B] border-[#36424D] hover:border-[#2D7DA6] hover:shadow-card'
              }`}
            >
              <div>
                <div className={`relative aspect-[16/10] overflow-hidden ${isLight ? 'bg-stone-100' : 'bg-[#0B0F14]'}`}>
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                  />
                  <div
                    className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider border backdrop-blur-sm ${
                      isLight
                        ? 'bg-white/90 text-slate-800 border-stone-200 shadow-xs'
                        : 'bg-[#0B0F14]/80 text-[#FAF8F3] border-[#36424D]/50'
                    }`}
                  >
                    {cat.tag}
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <h3
                    className={`font-display text-lg font-bold transition-colors ${
                      isLight ? 'text-slate-900 group-hover:text-black' : 'text-[#FAF8F3] group-hover:text-[#F6E7D7]'
                    }`}
                  >
                    {cat.title}
                  </h3>
                  <p className={`text-xs mt-1.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-[#D5DBE1]'}`}>
                    {cat.desc}
                  </p>
                </div>
              </div>

              <div
                className={`p-4 sm:p-5 pt-0 border-t mt-2 ${
                  isLight ? 'border-stone-100' : 'border-[#36424D]'
                }`}
              >
                <span
                  className={`text-[10px] font-mono uppercase block pt-2 ${
                    isLight ? 'text-slate-400' : 'text-[#6B7783]'
                  }`}
                >
                  Featured Models:
                </span>
                <span
                  className={`text-xs font-medium mt-0.5 block truncate ${
                    isLight ? 'text-slate-800' : 'text-[#FAF8F3]'
                  }`}
                >
                  {cat.lineup}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED FLEET WITH LIVE CATEGORY FILTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b gap-4 ${
            isLight ? 'border-stone-200/80' : 'border-[#36424D]'
          }`}
        >
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#E07A3F]">
              Showroom Selection
            </span>
            <h2
              className={`font-display text-2xl sm:text-3xl font-bold mt-1 ${
                isLight ? 'text-slate-900' : 'text-[#FAF8F3]'
              }`}
            >
              Top Rated Vehicles on DriveLoop
            </h2>
          </div>

          {/* Interactive filter pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'SUV', 'LUXURY', 'ELECTRIC', 'SEDAN'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategoryTab(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeCategoryTab === cat
                    ? isLight
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-[#F6E7D7] text-[#0B0F14] shadow-subtle'
                    : isLight
                    ? 'bg-white border border-stone-200 text-slate-700 hover:text-black hover:border-slate-400 shadow-xs'
                    : 'bg-[#1A222B] border border-[#36424D] text-[#D5DBE1] hover:text-[#FAF8F3] hover:border-[#2D7DA6]'
                }`}
              >
                {cat === 'ALL' ? 'All Fleet' : cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-96 rounded-xl border animate-pulse ${
                  isLight ? 'bg-white border-stone-200/80 shadow-xs' : 'bg-[#1A222B] border-[#36424D]'
                }`}
              />
            ))}
          </div>
        ) : filteredCars.length === 0 ? (
          <div
            className={`p-12 text-center rounded-xl border ${
              isLight ? 'bg-white border-stone-200 text-slate-900 shadow-xs' : 'bg-[#1A222B] border-[#36424D]'
            }`}
          >
            <p className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-[#FAF8F3]'}`}>
              No vehicles found in this category.
            </p>
            <button
              onClick={() => setActiveCategoryTab('ALL')}
              className="mt-3 text-xs text-[#E07A3F] font-semibold underline hover:text-[#2D7DA6]"
            >
              Reset to All Fleet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <VehicleCard key={car.id} vehicle={car} />
            ))}
          </div>
        )}
      </section>

      {/* 4. THE DRIVELOOP DIFFERENCE: Editorial Proof Grid */}
      <section
        className={`border-y py-20 ${
          isLight ? 'bg-white border-stone-200/80' : 'bg-[#1A222B] border-[#36424D]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#E07A3F]">
              Marketplace Integrity
            </span>
            <h2
              className={`font-display text-3xl sm:text-4xl font-bold mt-1 ${
                isLight ? 'text-slate-900' : 'text-[#FAF8F3]'
              }`}
            >
              Rethinking Car Rental in India.
            </h2>
            <p
              className={`text-sm sm:text-base mt-2 leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-[#D5DBE1]'
              }`}
            >
              We replaced unregulated roadside brokers and deceptive aggregate portals with an auditable multi-vendor platform where verified fleet owners compete on quality and service.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div
              className={`p-6 rounded-xl border flex flex-col justify-between transition-colors ${
                isLight
                  ? 'bg-[#F8F6F2] border-stone-200/80 hover:border-stone-400 shadow-xs'
                  : 'bg-[#0B0F14] border-[#36424D] hover:border-[#2D7DA6]'
              }`}
            >
              <div>
                <div
                  className={`w-9 h-9 rounded-md flex items-center justify-center font-mono text-xs font-bold mb-4 border ${
                    isLight
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-[#0E4A6B] text-[#FAF8F3] border-[#2D7DA6]/50'
                  }`}
                >
                  01
                </div>
                <h3 className={`font-display text-lg font-bold ${isLight ? 'text-slate-900' : 'text-[#FAF8F3]'}`}>
                  Dedicated Escrow Deposit
                </h3>
                <p className={`text-xs mt-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-[#D5DBE1]'}`}>
                  Never worry about delayed deposit returns. Your security deposit is locked in automated escrow and credited back to your original source within 24 hours of inspection sign-off.
                </p>
              </div>
              <div
                className={`mt-6 pt-4 border-t flex items-center space-x-2 text-xs font-semibold ${
                  isLight ? 'border-stone-200 text-slate-900' : 'border-[#36424D] text-[#2D7DA6]'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-[#2D7DA6]'}`} />
                <span>Automated 24h Payout Guarantee</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div
              className={`p-6 rounded-xl border flex flex-col justify-between transition-colors ${
                isLight
                  ? 'bg-[#F8F6F2] border-stone-200/80 hover:border-stone-400 shadow-xs'
                  : 'bg-[#0B0F14] border-[#36424D] hover:border-[#2D7DA6]'
              }`}
            >
              <div>
                <div
                  className={`w-9 h-9 rounded-md flex items-center justify-center font-mono text-xs font-bold mb-4 border ${
                    isLight
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-[#0E4A6B] text-[#FAF8F3] border-[#2D7DA6]/50'
                  }`}
                >
                  02
                </div>
                <h3 className={`font-display text-lg font-bold ${isLight ? 'text-slate-900' : 'text-[#FAF8F3]'}`}>
                  Verified Commercial Yellow Plates
                </h3>
                <p className={`text-xs mt-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-[#D5DBE1]'}`}>
                  Every listed car carries authentic state transport yellow plates, valid commercial passenger fitness, and comprehensive multi-passenger insurance. No impoundment fears at state borders.
                </p>
              </div>
              <div
                className={`mt-6 pt-4 border-t flex items-center space-x-2 text-xs font-semibold ${
                  isLight ? 'border-stone-200 text-slate-900' : 'border-[#36424D] text-[#2D7DA6]'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-[#2D7DA6]'}`} />
                <span>100% All-India Tourist Permit</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div
              className={`p-6 rounded-xl border flex flex-col justify-between transition-colors ${
                isLight
                  ? 'bg-[#F8F6F2] border-stone-200/80 hover:border-stone-400 shadow-xs'
                  : 'bg-[#0B0F14] border-[#36424D] hover:border-[#2D7DA6]'
              }`}
            >
              <div>
                <div
                  className={`w-9 h-9 rounded-md flex items-center justify-center font-mono text-xs font-bold mb-4 border ${
                    isLight
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-[#0E4A6B] text-[#FAF8F3] border-[#2D7DA6]/50'
                  }`}
                >
                  03
                </div>
                <h3 className={`font-display text-lg font-bold ${isLight ? 'text-slate-900' : 'text-[#FAF8F3]'}`}>
                  Digital Pre-Trip Inspection
                </h3>
                <p className={`text-xs mt-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-[#D5DBE1]'}`}>
                  Before driving away, both host and driver sign off on odometer reading, fuel level, and a 360° photo walkthrough in the app. Zero fraudulent damage disputes at handover.
                </p>
              </div>
              <div
                className={`mt-6 pt-4 border-t flex items-center space-x-2 text-xs font-semibold ${
                  isLight ? 'border-stone-200 text-slate-900' : 'border-[#36424D] text-[#2D7DA6]'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-[#2D7DA6]'}`} />
                <span>Mutual Sign-Off Protocol</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TOP REGIONAL HUBS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b ${
            isLight ? 'border-stone-200/80' : 'border-[#36424D]'
          }`}
        >
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#E07A3F]">
              Strategic Network
            </span>
            <h2
              className={`font-display text-2xl sm:text-3xl font-bold mt-1 ${
                isLight ? 'text-slate-900' : 'text-[#FAF8F3]'
              }`}
            >
              Top Self-Drive Hubs Across India
            </h2>
          </div>
          <span
            className={`text-xs font-mono mt-2 sm:mt-0 ${
              isLight ? 'text-slate-400' : 'text-[#6B7783]'
            }`}
          >
            Airport & City Center Meet-Points
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {hubs.map((hub) => (
            <div
              key={hub.name}
              onClick={() => navigate(`/explore?city=${encodeURIComponent(hub.name)}`)}
              className={`group cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between ${
                isLight
                  ? 'bg-white border-stone-200/80 shadow-xs hover:border-stone-400 hover:shadow-md'
                  : 'bg-[#1A222B] border-[#36424D] hover:border-[#2D7DA6] hover:shadow-card'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                      isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-800 group-hover:bg-black group-hover:text-white'
                        : 'bg-[#0B0F14] border-[#36424D] text-[#2D7DA6] group-hover:bg-[#2D7DA6] group-hover:text-white'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span
                    className={`font-mono text-[10px] uppercase font-semibold ${
                      isLight ? 'text-slate-400' : 'text-[#6B7783]'
                    }`}
                  >
                    {hub.fleetCount}
                  </span>
                </div>
                <h3
                  className={`font-display text-base font-bold transition-colors ${
                    isLight ? 'text-slate-900 group-hover:text-black' : 'text-[#FAF8F3] group-hover:text-[#F6E7D7]'
                  }`}
                >
                  {hub.name}
                </h3>
                <p className={`text-[11px] mt-1 leading-snug ${isLight ? 'text-slate-500' : 'text-[#D5DBE1]'}`}>
                  {hub.tag}
                </p>
              </div>

              <div
                className={`mt-4 pt-3 border-t text-[10px] font-mono font-semibold ${
                  isLight ? 'border-stone-100 text-[#C25E26]' : 'border-[#36424D] text-[#E07A3F]'
                }`}
              >
                {hub.highlight}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. BECOME A HOST PROMOTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`rounded-2xl p-8 sm:p-14 relative overflow-hidden border shadow-xl ${
            isLight
              ? 'bg-gradient-to-r from-stone-900 via-stone-800 to-black text-white border-stone-700'
              : 'bg-gradient-to-r from-[#0E4A6B] via-[#1A222B] to-[#1A222B] text-white border-[#36424D]'
          }`}
        >
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#E07A3F]">
              FLEET OPERATOR PORTAL
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-[#FAF8F3]">
              Turn Your Idle Rental Fleet Into Predictable Revenue.
            </h2>
            <p className="text-xs sm:text-sm text-[#D5DBE1] leading-relaxed">
              Are you a licensed car rental operator in North India? Join DriveLoop’s verified host network.
              Get pre-screened customers, integrated Razorpay payment collection, automated damage escrow, and weekly direct bank payouts with just 10% marketplace commission.
            </p>
            <div className="pt-3 flex flex-wrap gap-3">
              <Link
                to="/register?role=VENDOR"
                className={`px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-card flex items-center space-x-2 ${
                  isLight
                    ? 'bg-white hover:bg-stone-100 text-black'
                    : 'bg-[#F6E7D7] hover:bg-white text-[#0B0F14]'
                }`}
              >
                <span>Register Fleet Business</span>
                <ArrowRight className="w-3.5 h-3.5 text-inherit" />
              </Link>
              <Link
                to="/host"
                className={`px-5 py-3 rounded-full text-xs font-semibold tracking-wide border transition-colors ${
                  isLight
                    ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    : 'bg-[#0B0F14]/70 hover:bg-[#0B0F14] text-[#FAF8F3] border-[#36424D]'
                }`}
              >
                Host FAQ & Commission Rates
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-[#E07A3F]">
            Transparency & Policies
          </span>
          <h2
            className={`font-display text-2xl sm:text-3xl font-bold mt-1 ${
              isLight ? 'text-slate-900' : 'text-[#FAF8F3]'
            }`}
          >
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border overflow-hidden transition-colors ${
                  isLight
                    ? 'bg-white border-stone-200/80 shadow-xs'
                    : 'bg-[#1A222B] border-[#36424D]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className={`w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold transition-colors ${
                    isLight
                      ? 'text-slate-900 hover:text-black'
                      : 'text-[#FAF8F3] hover:text-[#2D7DA6]'
                  }`}
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp
                      className={`w-4 h-4 shrink-0 ml-4 ${
                        isLight ? 'text-slate-800' : 'text-[#D5DBE1]'
                      }`}
                    />
                  ) : (
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 ml-4 ${
                        isLight ? 'text-slate-400' : 'text-[#6B7783]'
                      }`}
                    />
                  )}
                </button>
                {isOpen && (
                  <div
                    className={`px-4 sm:px-5 pb-5 text-xs leading-relaxed border-t pt-3 ${
                      isLight
                        ? 'border-stone-100 text-slate-600'
                        : 'border-[#36424D] text-[#D5DBE1]'
                    }`}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VehicleCard } from '../../components/cards/VehicleCard';
import { vehicleService } from '../../services/vehicleService';
import { MOCK_FLEET } from '../../services/mockFleet';
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
  Calendar,
  Sparkles,
  Star,
  Quote,
  Clock,
  Compass,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = useState<Vehicle[]>(() =>
    [...MOCK_FLEET].sort((a, b) => b.rating - a.rating).slice(0, 6)
  );
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('ALL');

  // Interactive booking search bar state
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleBookingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCity) params.set('city', selectedCity);
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/explore?${params.toString()}`);
  };

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const cars = await vehicleService.getFeatured();
        if (cars && cars.length > 0) {
          setFeaturedCars(cars);
        }
      } catch (e) {
        console.error('Failed to load featured cars:', e);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const curatedJourneys = [
    {
      id: 'SUV',
      tag: 'Hills & Off-Road',
      title: 'Mountain Expeditions',
      desc: 'All-wheel drive, high ground clearance, and spacious 5 to 7 passenger capability for Shimla, Manali, and Spiti Valley.',
      lineup: 'Mahindra Thar, Toyota Fortuner, Scorpio-N, Creta',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
    },
    {
      id: 'LUXURY',
      tag: 'Executive & Events',
      title: 'Prestige & Luxury',
      desc: 'German precision engineering, acoustic quiet, and commanding presence for summits, corporate meetings, and weddings.',
      lineup: 'BMW X5, Mercedes C-Class, Audi A4',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    },
    {
      id: 'ELECTRIC',
      tag: 'Silent & Efficient',
      title: 'Conscious Electric',
      desc: 'Instant torque, serene cabin acoustics, and 400+ km certified range with rapid fast-charging compatibility.',
      lineup: 'Tata Nexon EV Max, BYD Seal, MG ZS EV',
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80',
    },
    {
      id: 'SEDAN',
      tag: 'Highway Touring',
      title: 'Comfort Touring Sedans',
      desc: 'Supple ride geometry, expansive rear legroom, and effortless 25+ km/l efficiency for scenic day drives and weekend trips.',
      lineup: 'Honda City Hybrid, Skoda Slavia, VW Virtus',
      image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80',
    },
  ];

  const regionalHubs = [
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
      highlight: 'Gateway to Himachal & Shivalik Hills',
    },
  ];

  const realReviews = [
    {
      author: 'Dr. Siddharth Mathur',
      role: 'Verified Renter • New Delhi',
      trip: '5-Day Roadtrip to Spiti in Fortuner Legender',
      text: 'Rented the Fortuner for our family trip to Himachal. Pickup at Aerocity was completed in under 4 minutes with photos on the app. The car was spotless, and the security deposit was back in my bank the morning after return. Absolutely zero friction.',
      rating: 5,
    },
    {
      author: 'Rhea Kapur',
      role: 'Independent Producer • Mumbai',
      trip: 'Shoot in Rajasthan in Mahindra Thar 4x4',
      text: 'The commercial yellow-plate compliance was huge for us—we crossed Haryana and Rajasthan borders with zero police stops or permit headaches. The host was responsive, and the car performed flawlessly across rough terrain.',
      rating: 5,
    },
    {
      author: 'Arjun Nair',
      role: 'Tech Consultant • Bangalore',
      trip: 'Client Summits in Delhi NCR in BMW X5',
      text: 'Far superior to waiting in lines at traditional airport car rental desks. The car was brought right to T3 arrivals, pre-conditioned and fully fueled. The transparent pricing with no surge multipliers is refreshing.',
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: 'What do I need to rent and drive a DriveLoop car?',
      a: 'You simply need an original Indian Driving License (valid for at least 1 year) and a government photo ID (Aadhaar or Passport). Verification is completed securely in seconds before your key handover.',
    },
    {
      q: 'When do I get my security deposit back?',
      a: 'Unlike old-fashioned rental desks that hold your deposit for weeks, 100% of your deposit is held in automated escrow and credited back to your original payment method within 24 hours of your return inspection.',
    },
    {
      q: 'Can I take the car across state borders?',
      a: 'Yes, 100%. Every single vehicle on DriveLoop operates with genuine commercial yellow plates and valid All-India Tourist Permits (AITP). You can travel across state lines without fear of impoundment or unauthorized vehicle penalties.',
    },
    {
      q: 'How do fuel and highway tolls (FASTag) work?',
      a: 'Every car comes with an active commercial FASTag. Expressway tolls are deducted transparently at exact actuals upon return. Fuel is provided with a recorded mark at pickup and simply returned at the same level.',
    },
    {
      q: 'What if I need to cancel my trip?',
      a: 'We have fair, transparent cancellation terms: Cancel more than 48 hours before pickup for a 100% full refund. Between 24 and 48 hours, receive 75%. Less than 24 hours receives 50%. Your security deposit is always refunded 100% regardless of cancellation time.',
    },
  ];

  const filteredCars =
    activeCategoryTab === 'ALL'
      ? featuredCars
      : featuredCars.filter((c) => c.category === activeCategoryTab);

  return (
    <div
      className={`space-y-24 pb-24 transition-colors duration-200 ${
        isLight ? 'bg-[#F4EFEA] text-slate-900' : 'bg-black text-white'
      }`}
    >
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[640px] sm:min-h-[720px] lg:h-[90vh] max-h-[1080px] flex flex-col justify-between overflow-hidden">
        {/* Full-bleed Photography Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-bg.png"
            alt="Scenic roadtrip landscape"
            className="w-full h-full object-cover object-[center_60%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80 pointer-events-none" />
        </div>

        {/* Center Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 w-full flex-1 flex flex-col items-center justify-center pt-16 sm:pt-20 pb-4 text-center -mt-6 sm:-mt-10">
          {/* Frosted Subtle Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-medium mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Verified Self-Drive Rental Marketplace</span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-[2.85rem] font-display font-bold text-white tracking-tight leading-[1.16] max-w-3xl mx-auto drop-shadow-md">
            Rediscover the Joy of <br className="hidden sm:inline" />
            the Open Road.
          </h1>

          {/* MODERN HUMAN BOOKING WIDGET */}
          <form
            onSubmit={handleBookingSearch}
            className="mt-6 sm:mt-7 w-full max-w-3xl rounded-2xl sm:rounded-full bg-black/60 backdrop-blur-xl border border-white/25 shadow-2xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-center gap-2 transition-all hover:border-white/40"
          >
            {/* Field 1: Hub / City */}
            <div className="w-full sm:flex-1 flex items-center gap-2.5 px-4 py-2 sm:py-1 text-left border-b sm:border-b-0 sm:border-r border-white/15">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  Pick-up Hub
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-neutral-900 text-white">All Regional Hubs</option>
                  <option value="Delhi" className="bg-neutral-900 text-white">Delhi NCR (Airport T3)</option>
                  <option value="Gurgaon" className="bg-neutral-900 text-white">Gurgaon (Cyber Hub)</option>
                  <option value="Noida" className="bg-neutral-900 text-white">Noida (Sector 18)</option>
                  <option value="Jaipur" className="bg-neutral-900 text-white">Jaipur (Airport)</option>
                  <option value="Chandigarh" className="bg-neutral-900 text-white">Chandigarh (City Centre)</option>
                </select>
              </div>
            </div>

            {/* Field 2: Vehicle Class */}
            <div className="w-full sm:flex-1 flex items-center gap-2.5 px-4 py-2 sm:py-1 text-left border-b sm:border-b-0 sm:border-r border-white/15">
              <Car className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  Vehicle Class
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-neutral-900 text-white">All Vehicle Classes</option>
                  <option value="SUV" className="bg-neutral-900 text-white">SUVs & 4x4s</option>
                  <option value="LUXURY" className="bg-neutral-900 text-white">Executive & Luxury</option>
                  <option value="SEDAN" className="bg-neutral-900 text-white">Touring Sedans</option>
                  <option value="ELECTRIC" className="bg-neutral-900 text-white">Electric Vehicles</option>
                  <option value="HATCHBACK" className="bg-neutral-900 text-white">City Hatchbacks</option>
                </select>
              </div>
            </div>

            {/* Field 3: Rental Type */}
            <div className="w-full sm:w-auto px-4 py-2 sm:py-1 text-left hidden md:block">
              <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Confirmation</span>
              </div>
            </div>

            {/* Search Submit Action */}
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl sm:rounded-full bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer shrink-0"
            >
              <span>Explore Fleet</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </form>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="relative z-10 pb-8 flex flex-wrap items-center justify-center gap-4 sm:gap-10 text-xs text-white/90 font-medium tracking-wide">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>3-Minute Digital Handover</span>
          </div>
          <span className="hidden sm:inline text-white/30">•</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>24h Refundable Deposit Guarantee</span>
          </div>
          <span className="hidden sm:inline text-white/30">•</span>
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-400" />
            <span>100% Commercial Yellow Plates</span>
          </div>
        </div>
      </section>

      {/* 2. CURATED TRAVEL COLLECTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b ${
            isLight ? 'border-stone-200/80' : 'border-neutral-800'
          }`}
        >
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-500 font-semibold">
              Curated Collections
            </span>
            <h2
              className={`font-display text-2xl sm:text-3xl font-bold mt-1 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Handpicked for Every Journey
            </h2>
          </div>
          <Link
            to="/explore"
            className={`text-xs font-semibold flex items-center space-x-1.5 mt-2 sm:mt-0 transition-colors group ${
              isLight ? 'text-slate-600 hover:text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Browse Complete Fleet ({featuredCars.length}+ Available)</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-amber-400" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {curatedJourneys.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/explore?category=${cat.id}`)}
              className={`group cursor-pointer rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                isLight
                  ? 'bg-white border-stone-200/80 shadow-xs hover:border-stone-400 hover:shadow-md'
                  : 'bg-[#0D0D0E] border-neutral-800/80 hover:border-neutral-700 hover:bg-[#121214] hover:shadow-xl'
              }`}
            >
              <div>
                <div className={`relative aspect-[16/10] overflow-hidden ${isLight ? 'bg-stone-100' : 'bg-black'}`}>
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                  />
                  <div
                    className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider border backdrop-blur-md ${
                      isLight
                        ? 'bg-white/90 text-slate-800 border-stone-200 shadow-xs'
                        : 'bg-black/75 text-neutral-200 border-neutral-700'
                    }`}
                  >
                    {cat.tag}
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <h3
                    className={`font-display text-lg font-bold transition-colors ${
                      isLight ? 'text-slate-900 group-hover:text-black' : 'text-white group-hover:text-amber-400'
                    }`}
                  >
                    {cat.title}
                  </h3>
                  <p className={`text-xs mt-1.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    {cat.desc}
                  </p>
                </div>
              </div>

              <div
                className={`p-4 sm:p-5 pt-0 border-t mt-2 ${
                  isLight ? 'border-stone-100' : 'border-neutral-800/80'
                }`}
              >
                <span
                  className={`text-[10px] font-mono uppercase block pt-2 ${
                    isLight ? 'text-slate-400' : 'text-neutral-500'
                  }`}
                >
                  Featured Models:
                </span>
                <span
                  className={`text-xs font-medium mt-0.5 block truncate ${
                    isLight ? 'text-slate-800' : 'text-neutral-300'
                  }`}
                >
                  {cat.lineup}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SHOWROOM SELECTION: Real Available Fleet */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b gap-4 ${
            isLight ? 'border-stone-200/80' : 'border-neutral-800'
          }`}
        >
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-500 font-semibold">
              Live Fleet
            </span>
            <h2
              className={`font-display text-2xl sm:text-3xl font-bold mt-1 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Popular Vehicles Ready for Pickup
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'SUV', 'LUXURY', 'ELECTRIC', 'SEDAN'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategoryTab(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeCategoryTab === cat
                    ? isLight
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-white text-black font-bold shadow-md'
                    : isLight
                    ? 'bg-white border border-stone-200 text-slate-700 hover:text-black hover:border-slate-400 shadow-xs'
                    : 'bg-[#0D0D0E] border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                {cat === 'ALL' ? 'All Cars' : cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-96 rounded-2xl border animate-pulse ${
                  isLight ? 'bg-white border-stone-200/80' : 'bg-[#0D0D0E] border-neutral-800'
                }`}
              />
            ))}
          </div>
        ) : filteredCars.length === 0 ? (
          <div
            className={`p-12 text-center rounded-2xl border ${
              isLight ? 'bg-white border-stone-200 text-slate-900' : 'bg-[#0D0D0E] border-neutral-800'
            }`}
          >
            <p className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>
              No vehicles found in this category right now.
            </p>
            <button
              onClick={() => setActiveCategoryTab('ALL')}
              className="mt-3 text-xs text-amber-500 font-semibold underline hover:text-amber-400 cursor-pointer"
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

      {/* 4. THE DRIVELOOP DIFFERENCE: High-Trust Standards */}
      <section
        className={`border-y py-20 ${
          isLight ? 'bg-white border-stone-200/80' : 'bg-[#0A0A0C] border-neutral-800'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-500 font-semibold">
              The DriveLoop Standard
            </span>
            <h2
              className={`font-display text-3xl sm:text-4xl font-bold mt-1 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Rethinking Self-Drive Car Rentals in India.
            </h2>
            <p
              className={`text-sm sm:text-base mt-2 leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-neutral-400'
              }`}
            >
              We built DriveLoop to eliminate the headaches of traditional rentals: held security deposits, deceptive surge charges, and impounded private vehicles at state borders.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div
              className={`p-6 sm:p-7 rounded-2xl border flex flex-col justify-between transition-colors ${
                isLight
                  ? 'bg-[#F8F6F2] border-stone-200/80 hover:border-stone-400 shadow-xs'
                  : 'bg-[#0D0D0E] border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${
                    isLight
                      ? 'bg-black text-white border-black'
                      : 'bg-neutral-900 text-amber-400 border-neutral-800'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className={`font-display text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  24-Hour Deposit Release
                </h3>
                <p className={`text-xs mt-2.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  Never wait weeks for your money back. Your security deposit is placed in automated escrow and released directly back to your source account within 24 hours of vehicle return.
                </p>
              </div>
              <div
                className={`mt-6 pt-4 border-t flex items-center space-x-2 text-xs font-semibold ${
                  isLight ? 'border-stone-200 text-slate-900' : 'border-neutral-800 text-neutral-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Automated Escrow Protection</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div
              className={`p-6 sm:p-7 rounded-2xl border flex flex-col justify-between transition-colors ${
                isLight
                  ? 'bg-[#F8F6F2] border-stone-200/80 hover:border-stone-400 shadow-xs'
                  : 'bg-[#0D0D0E] border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${
                    isLight
                      ? 'bg-black text-white border-black'
                      : 'bg-neutral-900 text-emerald-400 border-neutral-800'
                  }`}
                >
                  <Car className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className={`font-display text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  100% Commercial Yellow Plates
                </h3>
                <p className={`text-xs mt-2.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  Every car carries authentic transport yellow plates, valid state passenger fitness permits, and commercial insurance. Enjoy stress-free travel across all state checkpoints.
                </p>
              </div>
              <div
                className={`mt-6 pt-4 border-t flex items-center space-x-2 text-xs font-semibold ${
                  isLight ? 'border-stone-200 text-slate-900' : 'border-neutral-800 text-neutral-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>All-India Tourist Permit (AITP)</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div
              className={`p-6 sm:p-7 rounded-2xl border flex flex-col justify-between transition-colors ${
                isLight
                  ? 'bg-[#F8F6F2] border-stone-200/80 hover:border-stone-400 shadow-xs'
                  : 'bg-[#0D0D0E] border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${
                    isLight
                      ? 'bg-black text-white border-black'
                      : 'bg-neutral-900 text-white border-neutral-800'
                  }`}
                >
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className={`font-display text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  3-Minute Digital Handover
                </h3>
                <p className={`text-xs mt-2.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  Both host and driver complete mutual odometer and 360° photo inspection on the app in 3 minutes before driving away. Zero fraudulent scratch disputes.
                </p>
              </div>
              <div
                className={`mt-6 pt-4 border-t flex items-center space-x-2 text-xs font-semibold ${
                  isLight ? 'border-stone-200 text-slate-900' : 'border-neutral-800 text-neutral-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mutual Sign-Off Record</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VERIFIED RENTER EXPERIENCES (Real Human Stories) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-500 font-semibold">
            Traveler Stories
          </span>
          <h2
            className={`font-display text-2xl sm:text-3xl font-bold mt-1 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Loved by Drivers Across India
          </h2>
          <p className={`text-xs sm:text-sm mt-1.5 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
            Real experiences from travelers who explored the highways with DriveLoop.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {realReviews.map((rev, idx) => (
            <div
              key={idx}
              className={`p-6 sm:p-7 rounded-2xl border flex flex-col justify-between ${
                isLight
                  ? 'bg-white border-stone-200/80 shadow-xs'
                  : 'bg-[#0D0D0E] border-neutral-800'
              }`}
            >
              <div>
                <div className="flex items-center space-x-1 mb-3 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className={`text-xs sm:text-sm italic leading-relaxed ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                  "{rev.text}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800/80">
                <p className={`font-semibold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {rev.author}
                </p>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  {rev.role}
                </p>
                <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-amber-400">
                  {rev.trip}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. STRATEGIC REGIONAL HUBS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b ${
            isLight ? 'border-stone-200/80' : 'border-neutral-800'
          }`}
        >
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-500 font-semibold">
              Delivery Network
            </span>
            <h2
              className={`font-display text-2xl sm:text-3xl font-bold mt-1 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Premier Regional Pickup Hubs
            </h2>
          </div>
          <Link
            to="/explore"
            className={`text-xs font-semibold flex items-center space-x-1.5 mt-2 sm:mt-0 transition-colors ${
              isLight ? 'text-slate-600 hover:text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>See Hub Availability</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {regionalHubs.map((hub) => (
            <div
              key={hub.name}
              onClick={() => navigate(`/explore?city=${hub.name}`)}
              className={`group cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                isLight
                  ? 'bg-white border-stone-200/80 shadow-xs hover:border-stone-400 hover:shadow-md'
                  : 'bg-[#0D0D0E] border-neutral-800/80 hover:border-neutral-700 hover:bg-[#121214] hover:shadow-xl'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      isLight
                        ? 'bg-stone-100 text-slate-800 border-stone-200'
                        : 'bg-neutral-900 text-amber-400 border-neutral-800'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className={`text-[10px] font-mono font-semibold ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    {hub.fleetCount}
                  </span>
                </div>
                <h3
                  className={`font-display text-base font-bold transition-colors ${
                    isLight ? 'text-slate-900 group-hover:text-black' : 'text-white group-hover:text-amber-400'
                  }`}
                >
                  {hub.name}
                </h3>
                <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {hub.tag}
                </p>
              </div>

              <div
                className={`pt-3 border-t mt-4 text-[10px] font-medium truncate ${
                  isLight ? 'border-stone-100 text-slate-500' : 'border-neutral-800/80 text-emerald-400'
                }`}
              >
                {hub.highlight}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-500 font-semibold">
            Support & Clarity
          </span>
          <h2
            className={`font-display text-2xl sm:text-3xl font-bold mt-1 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Frequently Asked Questions
          </h2>
          <p className={`text-xs sm:text-sm mt-1.5 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
            Everything you need to know about renting with DriveLoop.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all ${
                  isLight
                    ? 'bg-white border-stone-200/80 shadow-xs'
                    : 'bg-[#0D0D0E] border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className={`font-semibold text-xs sm:text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <ChevronDown className={`w-4 h-4 shrink-0 ${isLight ? 'text-slate-400' : 'text-neutral-400'}`} />
                  )}
                </button>
                {isOpen && (
                  <div
                    className={`px-5 pb-5 text-xs sm:text-sm leading-relaxed border-t pt-3 ${
                      isLight ? 'border-stone-100 text-slate-600' : 'border-neutral-800 text-neutral-300'
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

      {/* 8. BECOME A HOST PROMO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0D0D0E] border border-neutral-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="max-w-2xl space-y-3 text-center md:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono tracking-widest uppercase text-amber-400 font-semibold">
              Host Partnership Program
            </span>
            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Have a Commercial Rental Fleet?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
              List your commercial yellow-plate cars on DriveLoop. Enjoy guaranteed weekly bank payouts, automated security deposit escrow, and a low 10% platform commission.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/host"
              className="px-6 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Explore Host Program</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>
            <Link
              to="/register?role=VENDOR"
              className="px-6 py-3.5 rounded-full bg-black hover:bg-neutral-900 border border-neutral-800 text-white text-xs font-semibold tracking-wider transition-all flex items-center justify-center"
            >
              Register Fleet
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

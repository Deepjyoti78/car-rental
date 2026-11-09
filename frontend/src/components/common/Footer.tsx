import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, ShieldCheck, Headphones, HeartHandshake, MapPin } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

export const Footer: React.FC = () => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const location = useLocation();

  // Hide footer on focused authentication pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  if (isAuthPage) {
    return null;
  }

  return (
    <footer
      className={`pt-16 pb-12 transition-colors duration-200 border-t ${
        isLight
          ? 'bg-[#EAE4DC] text-slate-900 border-stone-300'
          : 'bg-black text-white border-neutral-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Trust Pillars Banner */}
        <div
          className={`grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b ${
            isLight ? 'border-stone-300' : 'border-neutral-800'
          }`}
        >
          <div className="flex items-start space-x-3.5">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                isLight
                  ? 'bg-white border-stone-300 text-slate-800 shadow-xs'
                  : 'bg-[#0D0D0E] border-neutral-800 text-amber-400'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4
                className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Inspected Fleet
              </h4>
              <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                Commercial yellow plates, multi-point fitness checks, and mutual pre-trip photo logs.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                isLight
                  ? 'bg-white border-stone-300 text-amber-600 shadow-xs'
                  : 'bg-[#0D0D0E] border-neutral-800 text-amber-400'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h4
                className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                24h Deposit Release
              </h4>
              <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                100% refundable deposits returned directly to your source within 24 hours of safe vehicle return.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                isLight
                  ? 'bg-white border-stone-300 text-slate-800 shadow-xs'
                  : 'bg-[#0D0D0E] border-neutral-800 text-amber-400'
              }`}
            >
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4
                className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Direct Hub Delivery
              </h4>
              <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                Airport terminal and city center hubs across Delhi NCR, Jaipur, and Chandigarh.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                isLight
                  ? 'bg-white border-stone-300 text-slate-800 shadow-xs'
                  : 'bg-[#0D0D0E] border-neutral-800 text-amber-400'
              }`}
            >
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h4
                className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                24/7 Roadside Care
              </h4>
              <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                On-call highway emergency assistance and replacement support on all journeys.
              </p>
            </div>
          </div>
        </div>

        {/* Links Navigation */}
        <div
          className={`grid grid-cols-2 md:grid-cols-5 gap-8 py-12 border-b ${
            isLight ? 'border-stone-300' : 'border-neutral-800'
          }`}
        >
          <div className="col-span-2">
            <Link to="/" className="flex items-center space-x-2.5">
              <div
                className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                  isLight
                    ? 'bg-white border-stone-300 text-slate-900 shadow-xs'
                    : 'bg-[#0D0D0E] border-neutral-800 text-amber-400'
                }`}
              >
                <Car className="w-4 h-4" strokeWidth={2} />
              </div>
              <span
                className={`font-display text-lg font-bold tracking-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Drive<span className="text-amber-400">Loop</span>
              </span>
            </Link>
            <p className={`text-xs mt-3.5 leading-relaxed max-w-sm ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
              India's premier verified car rental marketplace connecting selective travelers
              with verified independent fleet operators. Experience the joy of self-drive with transparent pricing.
            </p>
            <p className={`text-[10px] font-mono mt-3 ${isLight ? 'text-slate-500' : 'text-neutral-500'}`}>
              Razorpay Secured • PCI-DSS Compliant • 256-bit Encryption
            </p>
          </div>

          <div>
            <h5
              className={`text-[10px] font-mono uppercase tracking-widest mb-4 ${
                isLight ? 'text-slate-500' : 'text-neutral-400 font-semibold'
              }`}
            >
              Explore Fleet
            </h5>
            <ul className={`space-y-2.5 text-xs ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
              <li>
                <Link to="/explore" className="hover:text-amber-400 transition-colors">
                  All Vehicles
                </Link>
              </li>
              <li>
                <Link to="/explore?category=SUV" className="hover:text-amber-400 transition-colors">
                  Performance SUVs
                </Link>
              </li>
              <li>
                <Link to="/explore?category=LUXURY" className="hover:text-amber-400 transition-colors">
                  Luxury Saloons
                </Link>
              </li>
              <li>
                <Link to="/explore?category=ELECTRIC" className="hover:text-amber-400 transition-colors">
                  Electric Vehicles
                </Link>
              </li>
              <li>
                <Link to="/explore?category=SEDAN" className="hover:text-amber-400 transition-colors">
                  Touring Sedans
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5
              className={`text-[10px] font-mono uppercase tracking-widest mb-4 ${
                isLight ? 'text-slate-500' : 'text-neutral-400 font-semibold'
              }`}
            >
              Fleet Partners
            </h5>
            <ul className={`space-y-2.5 text-xs ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
              <li>
                <Link to="/host" className="hover:text-amber-400 transition-colors">
                  Become a Host
                </Link>
              </li>
              <li>
                <Link to="/register?role=VENDOR" className="hover:text-amber-400 transition-colors">
                  Host Registration
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition-colors">
                  Vendor Portal Login
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-amber-400 transition-colors">
                  Escrow Guarantee
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5
              className={`text-[10px] font-mono uppercase tracking-widest mb-4 ${
                isLight ? 'text-slate-500' : 'text-neutral-400 font-semibold'
              }`}
            >
              Platform & Legal
            </h5>
            <ul className={`space-y-2.5 text-xs ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
              <li>
                <Link to="/how-it-works" className="hover:text-amber-400 transition-colors">
                  Security Deposit Escrow
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-amber-400 transition-colors">
                  Cancellation Schedule
                </Link>
              </li>
              <li>
                <span className="text-neutral-500 cursor-not-allowed">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="text-neutral-500 cursor-not-allowed">
                  Privacy & Telematics
                </span>
              </li>
              <li>
                <span className="text-neutral-500 cursor-not-allowed">
                  Insurance Policy Terms
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Status */}
        <div
          className={`pt-8 flex flex-col sm:flex-row items-center justify-between text-xs gap-4 ${
            isLight ? 'text-slate-500' : 'text-neutral-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px]">All 5 Verified Hubs Operational</span>
          </div>

          <p className="font-mono text-[11px] text-center sm:text-right">
            © {new Date().getFullYear()} DriveLoop Technologies Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Instagram,
  Youtube,
  Linkedin,
  MapPin,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

export const Footer: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const isLight = theme === 'light';
  const location = useLocation();

  // Hide footer on focused authentication pages and admin console
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isAdminDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/fleet-ops');
  if (isAuthPage || isAdminDashboard) {
    return null;
  }

  return (
    <footer
      className={`pt-12 pb-8 transition-colors duration-200 border-t ${
        isLight
          ? 'bg-[#F4EFEA] text-slate-900 border-stone-300/80'
          : 'bg-[#090A0C] text-white border-neutral-800/80'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =========================================================================
            TOP ROW: Brand Info + 3 Nav Columns
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10">
          {/* Col 1: Brand Info & Socials (md:col-span-4) */}
          <div className="md:col-span-4 space-y-3.5">
            {/* Logo: // DriveLoop */}
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="flex items-center gap-1 shrink-0">
                <span
                  className={`w-1.5 h-4.5 rounded-full -skew-x-12 inline-block transition-colors ${
                    isLight ? 'bg-slate-900' : 'bg-white'
                  }`}
                />
                <span
                  className={`w-1.5 h-4.5 rounded-full -skew-x-12 inline-block transition-colors ${
                    isLight ? 'bg-slate-900' : 'bg-white'
                  }`}
                />
              </div>
              <span
                className={`font-extrabold text-xl tracking-tight font-display transition-colors ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Drive<span className="text-[#D4A373] dark:text-[#E2B081]">Loop</span>
              </span>
            </Link>

            {/* Tagline */}
            <p
              className={`text-xs leading-relaxed max-w-sm ${
                isLight ? 'text-stone-600' : 'text-neutral-400'
              }`}
            >
              Rent cars across India with a seamless booking experience. Reliable, flexible, and made for your journey.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white/80 border-stone-300 text-stone-600 hover:text-black hover:border-stone-400'
                    : 'bg-[#141519] border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white/80 border-stone-300 text-stone-600 hover:text-black hover:border-stone-400'
                    : 'bg-[#141519] border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <Youtube className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white/80 border-stone-300 text-stone-600 hover:text-black hover:border-stone-400'
                    : 'bg-[#141519] border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <Linkedin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>

              {/* X / Twitter */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter)"
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white/80 border-stone-300 text-stone-600 hover:text-black hover:border-stone-400'
                    : 'bg-[#141519] border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Explore (md:col-span-2 or 3) */}
          <div className="md:col-span-2 md:col-start-6">
            <h4
              className={`text-sm font-semibold mb-3 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Explore
            </h4>
            <ul
              className={`space-y-2 text-xs ${
                isLight ? 'text-stone-600' : 'text-neutral-400'
              }`}
            >
              <li>
                <Link to="/explore" className="hover:text-amber-500 dark:hover:text-white transition-colors">
                  All Vehicles
                </Link>
              </li>
              <li>
                <Link to="/locations" className="hover:text-amber-500 dark:hover:text-white transition-colors">
                  Locations
                </Link>
              </li>
              <li>
                <Link to="/explore?filter=long-term" className="hover:text-amber-500 dark:hover:text-white transition-colors">
                  Long Term Rental
                </Link>
              </li>
              <li>
                <Link to="/explore?category=LUXURY" className="hover:text-amber-500 dark:hover:text-white transition-colors">
                  Wedding Cars
                </Link>
              </li>
              <li>
                <Link to="/explore?category=ELECTRIC" className="hover:text-amber-500 dark:hover:text-white transition-colors">
                  Electric Vehicles
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="md:col-span-2">
            <h4
              className={`text-sm font-semibold mb-3 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Support
            </h4>
            <ul
              className={`space-y-2 text-xs ${
                isLight ? 'text-stone-600' : 'text-neutral-400'
              }`}
            >
              <li>
                <Link to="/how-it-works#faq" className="hover:text-amber-500 dark:hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-amber-500 dark:hover:text-white transition-colors">
                  Booking Guide
                </Link>
              </li>
              <li>
                <Link to="/how-it-works#cancellation" className="hover:text-amber-500 dark:hover:text-white transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link to="/how-it-works#payment" className="hover:text-amber-500 dark:hover:text-white transition-colors">
                  Payment Options
                </Link>
              </li>
              <li>
                <Link to="/how-it-works#contact" className="hover:text-amber-500 dark:hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Company */}
          <div className="md:col-span-2">
            <h4
              className={`text-sm font-semibold mb-3 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Company
            </h4>
            <ul
              className={`space-y-2 text-xs ${
                isLight ? 'text-stone-600' : 'text-neutral-400'
              }`}
            >
              <li>
                <Link to="/how-it-works" className="hover:text-amber-500 dark:hover:text-white transition-colors">
                  About DriveLoop
                </Link>
              </li>
              <li>
                <Link to="/how-it-works#careers" className="hover:text-amber-500 dark:hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/host" className="hover:text-amber-500 dark:hover:text-white transition-colors">
                  Partner With Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works#terms" className="hover:text-amber-500 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/how-it-works#privacy" className="hover:text-amber-500 dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM DIVIDER & COPYRIGHT ROW
           ========================================================================= */}
        <div
          className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs gap-4 ${
            isLight
              ? 'border-stone-300 text-stone-500'
              : 'border-neutral-800/80 text-neutral-400'
          }`}
        >
          {/* Copyright notice */}
          <p className="font-normal text-xs text-center sm:text-left">
            © {new Date().getFullYear()} DriveLoop. All rights reserved.
          </p>

          {/* Right: Location selector & Theme Switcher Pill */}
          <div className="flex items-center gap-3">
            {/* Country Selector */}
            <div
              className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer select-none ${
                isLight ? 'text-slate-700 hover:text-black' : 'text-neutral-300 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>India</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </div>

            {/* Vertical Separator */}
            <span
              className={`h-3.5 w-px ${
                isLight ? 'bg-stone-300' : 'bg-neutral-800'
              }`}
            />

            {/* Theme Switcher Pill */}
            <button
              onClick={toggleTheme}
              type="button"
              className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                isLight
                  ? 'border-stone-300 bg-white/90 text-slate-800 hover:border-stone-400 shadow-xs'
                  : 'border-neutral-700/80 bg-[#121316] text-neutral-200 hover:border-neutral-600'
              }`}
            >
              {isLight ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-600" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

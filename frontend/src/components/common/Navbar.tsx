import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import {
  Car,
  User as UserIcon,
  LogOut,
  Bell,
  Menu,
  X,
  ShieldCheck,
  LayoutDashboard,
  CalendarCheck,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { miscService } from '../../services/miscService';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, openAuthModal, isAuthModalOpen } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const isHome = location.pathname === '/';
  const isHeaderTransparent = isHome && !scrolled;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await miscService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      // ignore
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Cars', to: '/explore' },
    { label: 'Pricing', to: '/explore' },
    { label: 'Locations', to: '/locations' },
    { label: 'How it Works', to: '/how-it-works' },
    { label: 'Support', to: '/how-it-works#faq' },
  ];

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isAdminDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/fleet-ops');

  // Completely hide Navbar on auth pages (/login, /register), admin console (/admin), or when Auth Modal popup is open
  if (isAuthPage || isAdminDashboard || isAuthModalOpen) {
    return null;
  }

  return (
    <header
      className={`transition-all duration-300 z-50 ${
        isHome
          ? scrolled
            ? theme === 'light'
              ? 'fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-sm text-[#111827]'
              : 'fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-neutral-800 shadow-lg text-white'
            : 'absolute top-0 left-0 right-0 bg-transparent border-transparent text-white'
          : theme === 'light'
          ? 'sticky top-0 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs text-[#111827]'
          : 'sticky top-0 bg-black/95 backdrop-blur-md border-b border-neutral-800 text-white'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo: adaptive to theme & transparency */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors border ${
              isHeaderTransparent || theme === 'dark'
                ? 'bg-neutral-900/90 border-neutral-700/80 group-hover:border-amber-400/60'
                : 'bg-slate-100 border-stone-200 group-hover:border-slate-400'
            }`}>
              <Car
                className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                  isHeaderTransparent || theme === 'dark' ? 'text-amber-400' : 'text-slate-900'
                }`}
                strokeWidth={2}
              />
            </div>
            <span
              className={`text-lg sm:text-xl font-bold tracking-tight drop-shadow-sm font-display ${
                isHeaderTransparent || theme === 'dark' ? 'text-white' : 'text-[#111827]'
              }`}
            >
              Drive<span className="text-amber-400">Loop</span>
            </span>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 lg:space-x-9">
            {navLinks.map((link) => {
              const isActive =
                (link.label === 'Cars' && (location.pathname === '/explore' || location.pathname === '/cars')) ||
                (link.to !== '/explore' && location.pathname === link.to);

              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`text-xs sm:text-[13px] tracking-wide transition-colors relative py-1 ${
                    isActive
                      ? isHeaderTransparent || theme === 'dark'
                        ? 'text-white font-medium after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#f5e6d3]'
                        : 'text-slate-900 font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black'
                      : isHeaderTransparent || theme === 'dark'
                      ? 'text-white/70 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-full transition-all cursor-pointer flex items-center justify-center border shadow-xs ${
                isHeaderTransparent
                  ? 'text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border-white/20'
                  : theme === 'light'
                  ? 'text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border-stone-200/80'
                  : 'text-neutral-300 hover:text-white bg-[#141416] hover:bg-neutral-800 border-neutral-800'
              }`}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light (White) Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-neutral-300" />
              )}
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      if (!notificationsOpen) fetchNotifications();
                    }}
                    className={`p-2 rounded-full transition-all relative ${
                      isHeaderTransparent || theme === 'dark'
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-black" />
                    )}
                  </button>

                  {/* Notification Popover */}
                  {notificationsOpen && (
                    <div
                      className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl py-2 z-50 border ${
                        theme === 'light'
                          ? 'bg-white border-stone-200 text-slate-800'
                          : 'bg-[#0D0D0E] border-neutral-800 text-white'
                      }`}
                    >
                      <div className={`px-4 py-2 border-b flex items-center justify-between ${
                        theme === 'light' ? 'border-stone-100' : 'border-neutral-800'
                      }`}>
                        <span className={`text-[10px] font-mono uppercase tracking-wider ${
                          theme === 'light' ? 'text-slate-400' : 'text-neutral-400'
                        }`}>
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="text-xs text-amber-400 font-semibold">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      <div className={`max-h-72 overflow-y-auto divide-y ${
                        theme === 'light' ? 'divide-stone-100' : 'divide-neutral-800'
                      }`}>
                        {notifications.length === 0 ? (
                          <div className={`p-4 text-center text-xs ${
                            theme === 'light' ? 'text-slate-400' : 'text-neutral-500'
                          }`}>
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-3 transition-colors ${
                                theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-neutral-900'
                              }`}
                            >
                              <p className={`text-xs font-semibold ${
                                theme === 'light' ? 'text-slate-800' : 'text-white'
                              }`}>{n.title}</p>
                              <p className={`text-xs mt-0.5 ${
                                theme === 'light' ? 'text-slate-500' : 'text-neutral-400'
                              }`}>{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>



                {/* Profile Pill Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`flex items-center space-x-2 pl-2 pr-2.5 py-1 rounded-full border transition-all text-xs font-medium ${
                      isHeaderTransparent || theme === 'dark'
                        ? 'border-white/20 bg-black/30 backdrop-blur-sm hover:border-white/50 text-white'
                        : 'border-stone-200 bg-white hover:border-stone-400 text-slate-800 shadow-xs'
                    }`}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.firstName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-400 flex items-center justify-center text-[10px] font-bold text-white">
                        {user.firstName[0]}
                      </div>
                    )}
                    <span className="max-w-[100px] truncate">{user.firstName}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl py-2 z-50 border ${
                        theme === 'light'
                          ? 'bg-white border-stone-200 text-slate-800'
                          : 'bg-[#0D0D0E] border-neutral-800 text-white'
                      }`}
                    >
                      <div className={`px-4 py-2 border-b ${
                        theme === 'light' ? 'border-stone-100' : 'border-neutral-800'
                      }`}>
                        <p className={`text-xs font-bold ${
                          theme === 'light' ? 'text-slate-900' : 'text-white'
                        }`}>
                          {user.firstName} {user.lastName}
                        </p>
                        <p className={`text-[11px] truncate ${
                          theme === 'light' ? 'text-slate-500' : 'text-neutral-400'
                        }`}>{user.email}</p>
                        <span className={`inline-block mt-1 font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                          theme === 'light'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-black text-neutral-300 border-neutral-700'
                        }`}>
                          {user.role}
                        </span>
                      </div>

                      {user.role === 'CUSTOMER' && (
                        <Link
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className={`flex items-center px-4 py-2 text-xs ${
                            theme === 'light' ? 'text-slate-800 hover:bg-slate-50' : 'text-white hover:bg-neutral-900'
                          }`}
                        >
                          <UserIcon className="w-4 h-4 mr-2.5 opacity-70" />
                          Customer Dashboard
                        </Link>
                      )}

                      {user.role === 'VENDOR' && (
                        <Link
                          to="/vendor"
                          onClick={() => setUserDropdownOpen(false)}
                          className={`flex items-center px-4 py-2 text-xs ${
                            theme === 'light' ? 'text-slate-800 hover:bg-slate-50' : 'text-white hover:bg-neutral-900'
                          }`}
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2.5 opacity-70" />
                          Vendor Fleet
                        </Link>
                      )}

                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className={`flex items-center px-4 py-2 text-xs ${
                            theme === 'light' ? 'text-slate-800 hover:bg-slate-50' : 'text-white hover:bg-neutral-900'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4 mr-2.5 opacity-70" />
                          Admin Console
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center px-4 py-2 text-xs text-rose-500 hover:bg-rose-50 transition-colors border-t mt-1 ${
                          theme === 'light' ? 'border-stone-100 hover:bg-rose-50' : 'border-neutral-800 hover:bg-rose-950/30'
                        }`}
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                {/* Sign In button */}
                <button
                  type="button"
                  onClick={() => openAuthModal('LOGIN')}
                  className={`px-4.5 py-1.5 rounded-full text-xs font-semibold transition-all backdrop-blur-sm cursor-pointer border shadow-xs ${
                    isHeaderTransparent
                      ? 'border-white/30 hover:border-white/60 text-white hover:bg-white/10'
                      : theme === 'light'
                      ? 'border-stone-300 hover:border-black text-slate-800 hover:bg-slate-100'
                      : 'bg-[#141416] border-neutral-800 hover:border-neutral-700 text-neutral-200 hover:text-white hover:bg-neutral-800/80'
                  }`}
                >
                  Sign In
                </button>
                {/* Rent a Car button */}
                <Link
                  to="/explore"
                  className={`px-4.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                    isHeaderTransparent
                      ? 'bg-white hover:bg-neutral-200 text-black border border-white'
                      : theme === 'light'
                      ? 'bg-[#111827] hover:bg-black text-white border border-[#111827]'
                      : 'bg-white hover:bg-neutral-200 text-black border border-white'
                  }`}
                >
                  <span>Rent a Car</span>
                  <span className="text-xs">↗</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger & Theme Toggle */}
          <div className="md:hidden flex items-center space-x-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${
                isHeaderTransparent || theme === 'dark'
                  ? 'text-white hover:bg-white/10'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-all ${
                isHeaderTransparent || theme === 'dark'
                  ? 'text-white hover:bg-white/10'
                  : 'text-slate-800 hover:bg-slate-100'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden px-4 pt-3 pb-6 space-y-2 border-b backdrop-blur-xl ${
            theme === 'light'
              ? 'bg-white/95 border-stone-200 text-slate-900 shadow-lg'
              : 'bg-black/98 border-neutral-800 text-white'
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 text-sm rounded-lg ${
                theme === 'light' ? 'text-slate-800 hover:bg-slate-100' : 'text-white hover:bg-neutral-900'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 border-t border-neutral-800">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="px-3 py-1">
                  <p className="text-xs font-bold text-white">
                    {user.firstName} {user.lastName} ({user.role})
                  </p>
                  <p className="text-xs text-neutral-400">{user.email}</p>
                </div>
                {user.role === 'CUSTOMER' && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-semibold text-white rounded-lg bg-[#0D0D0E] border border-neutral-800"
                  >
                    Customer Dashboard
                  </Link>
                )}
                {user.role === 'VENDOR' && (
                  <Link
                    to="/vendor"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-semibold text-white rounded-lg bg-neutral-900 border border-neutral-700"
                  >
                    Vendor Fleet Portal
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-semibold text-white rounded-lg bg-[#0D0D0E] border border-neutral-800"
                  >
                    Admin Control Center
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-rose-400 rounded-lg hover:bg-rose-950/30"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('LOGIN');
                  }}
                  className="w-full text-center py-2 rounded-full border border-white/30 text-xs font-normal text-white bg-transparent cursor-pointer"
                >
                  Sign In
                </button>
                <Link
                  to="/explore"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-full bg-white text-black text-xs font-bold"
                >
                  Rent a Car
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import {
  Car,
  Lock,
  Mail,
  User,
  Phone,
  Building2,
  X,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    login,
    register: registerUser,
    isLoading,
  } = useAuthStore();

  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regRole, setRegRole] = useState<'CUSTOMER' | 'VENDOR'>('CUSTOMER');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');

  const [error, setError] = useState<string | null>(null);

  // Sync tab with store when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setTab(authModalTab);
      setError(null);
      setShowPassword(false);
    }
  }, [isAuthModalOpen, authModalTab]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setLoginEmail(demoEmail);
    setLoginPassword(demoPass);
    setError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await login(loginEmail, loginPassword);
      closeAuthModal();
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'VENDOR') {
        navigate('/vendor');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err.message || 'Invalid email or password. Please try again.';
      setError(
        msg.includes('prisma') || msg.includes('5433') || msg.includes('database')
          ? 'Invalid email or password. You can also click one of the demo quick login buttons above.'
          : msg
      );
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: any = {
      role: regRole,
      firstName,
      lastName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
    };

    if (regRole === 'VENDOR') {
      if (!businessName || !city) {
        setError('Business Name and Operating City are required for Vendor registration.');
        return;
      }
      payload.businessName = businessName;
      payload.businessEmail = regEmail;
      payload.contactNumber = regPhone;
      payload.city = city;
      payload.authorizedPerson = `${firstName} ${lastName}`;
    }

    try {
      const user = await registerUser(payload);
      closeAuthModal();
      if (user.role === 'VENDOR') {
        navigate('/vendor');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please check your information.';
      setError(
        msg.includes('prisma') || msg.includes('5433') || msg.includes('database')
          ? 'Registration temporarily unavailable. Please try again or use demo accounts.'
          : msg
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md transition-all duration-300"
      onClick={closeAuthModal}
    >
      {/* Modal Card with subtle ring and deep luxury shadow */}
      <div
        className={`relative w-full max-w-4xl border rounded-2xl sm:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden grid grid-cols-1 md:grid-cols-12 max-h-[92vh] transition-colors duration-200 animate-in fade-in zoom-in-95 duration-200 ${
          isLight
            ? 'bg-white border-stone-200 text-slate-900 ring-1 ring-black/5'
            : 'bg-[#0D0D0E] border-neutral-800 text-white ring-1 ring-white/10'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* LEFT COLUMN: User's Uploaded Image with Clear, Vivid Automotive Presentation */}
        <div className="hidden md:block md:col-span-5 relative bg-black overflow-hidden">
          <img
            src="/auth-modal-bg.jpg"
            alt="DriveLoop Luxury Mobility"
            className="absolute inset-0 w-full h-full object-cover object-center scale-100 transition-transform duration-700 hover:scale-105"
          />
          {/* Subtle natural gradient at bottom only so the car image is vivid and crisp */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-black/10" />

          {/* Left Overlay Content */}
          <div className="relative z-10 h-full p-7 flex flex-col justify-between">
            {/* Top Brand Logo */}
            <div className="flex items-center space-x-2.5">
              <Car className="w-5 h-5 text-white" strokeWidth={1.8} />
              <span className="text-xl font-medium tracking-tight text-white drop-shadow-sm">
                DriveLoop
              </span>
            </div>

            {/* Bottom Tagline */}
            <div className="pb-2">
              <h3 className="text-xl sm:text-2xl font-light text-white leading-snug tracking-tight drop-shadow-md">
                Every journey begins with trust and freedom.
              </h3>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Elevated UI/UX Content Workspace */}
        <div
          className={`md:col-span-7 p-6 sm:p-9 flex flex-col justify-between overflow-y-auto max-h-[92vh] ${
            isLight ? 'bg-white text-slate-900' : 'bg-[#0D0D0E] text-white'
          }`}
        >
          {/* Header & Close Button */}
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h2
                  className={`text-2xl sm:text-[1.65rem] font-bold tracking-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {tab === 'LOGIN' ? 'Welcome to DriveLoop' : 'Create an Account'}
                </h2>
                <p
                  className={`text-xs mt-1 font-normal ${
                    isLight ? 'text-slate-500' : 'text-neutral-400'
                  }`}
                >
                  {tab === 'LOGIN'
                    ? 'Enter your credentials to access your fleet, bookings, or console'
                    : 'Join DriveLoop as a customer or vehicle fleet host'}
                </p>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={closeAuthModal}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ml-4 ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/30 text-white/70 hover:text-white'
                }`}
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Segmented Pill Tab Selector */}
            <div
              className={`mt-5 inline-flex p-1 rounded-full border ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-black border-neutral-800'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setTab('LOGIN');
                  setError(null);
                }}
                className={`px-5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                  tab === 'LOGIN'
                    ? isLight
                      ? 'bg-black text-white shadow-xs font-semibold'
                      : 'bg-white text-black shadow-sm font-bold'
                    : isLight
                    ? 'text-slate-600 hover:text-black font-medium'
                    : 'text-neutral-400 hover:text-white font-medium'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('REGISTER');
                  setError(null);
                }}
                className={`px-5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                  tab === 'REGISTER'
                    ? isLight
                      ? 'bg-black text-white shadow-xs font-semibold'
                      : 'bg-white text-black shadow-sm font-bold'
                    : isLight
                    ? 'text-slate-600 hover:text-black font-medium'
                    : 'text-neutral-400 hover:text-white font-medium'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: LOGIN FORM */}
            {tab === 'LOGIN' && (
              <div className="mt-5 space-y-4">
                {/* Elevated Quick Demo Autofill Bar */}
                <div
                  className={`p-2.5 sm:p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-black border-neutral-800'
                  }`}
                >
                  <span
                    className={`text-[11px] font-medium flex items-center gap-1.5 ${
                      isLight ? 'text-slate-600' : 'text-neutral-400'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quick Demo:</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => fillDemoAccount('admin@drivio.com', 'Admin@12345')}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-medium transition-all cursor-pointer active:scale-95 ${
                        isLight
                          ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100 shadow-xs'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-neutral-700 text-white'
                      }`}
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemoAccount('vendor1@royalwheels.in', 'Vendor@12345')}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-medium transition-all cursor-pointer active:scale-95 ${
                        isLight
                          ? 'bg-white border-slate-200 text-[#E07A3F] hover:bg-slate-100 shadow-xs'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-amber-400 text-amber-400'
                      }`}
                    >
                      Vendor
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemoAccount('aarav@example.com', 'Customer@12345')}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-medium transition-all cursor-pointer active:scale-95 ${
                        isLight
                          ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100 shadow-xs'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-neutral-700 text-white'
                      }`}
                    >
                      Customer
                    </button>
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label
                      className={`block text-xs font-medium ${
                        isLight ? 'text-slate-800' : 'text-white'
                      }`}
                    >
                      Email Address
                    </label>
                    <div
                      className={`relative flex items-center rounded-xl border transition-all ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 focus-within:border-black focus-within:ring-1 focus-within:ring-black'
                          : 'bg-black border-neutral-800 focus-within:border-white focus-within:ring-1 focus-within:ring-white/20'
                      }`}
                    >
                      <Mail
                        className={`w-4 h-4 ml-3.5 shrink-0 ${
                          isLight ? 'text-slate-400' : 'text-white/40'
                        }`}
                      />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="name@example.com"
                        className={`w-full bg-transparent px-3 py-2.5 text-xs font-normal focus:outline-none ${
                          isLight
                            ? 'text-slate-900 placeholder:text-slate-400'
                            : 'text-white placeholder-white/35'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        className={`text-xs font-medium ${
                          isLight ? 'text-slate-800' : 'text-white'
                        }`}
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => fillDemoAccount('aarav@example.com', 'Customer@12345')}
                        className={`text-[11px] transition-colors ${
                          isLight ? 'text-slate-500 hover:text-black' : 'text-amber-400 hover:text-white'
                        }`}
                      >
                        Demo auto-fill
                      </button>
                    </div>
                    <div
                      className={`relative flex items-center rounded-xl border transition-all ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 focus-within:border-black focus-within:ring-1 focus-within:ring-black'
                          : 'bg-black border-neutral-800 focus-within:border-white focus-within:ring-1 focus-within:ring-white/20'
                      }`}
                    >
                      <Lock
                        className={`w-4 h-4 ml-3.5 shrink-0 ${
                          isLight ? 'text-slate-400' : 'text-white/40'
                        }`}
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full bg-transparent px-3 py-2.5 text-xs font-normal focus:outline-none ${
                          isLight
                            ? 'text-slate-900 placeholder:text-slate-400'
                            : 'text-white placeholder-white/35'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`p-2 mr-1 transition-colors cursor-pointer ${
                          isLight ? 'text-slate-400 hover:text-black' : 'text-white/40 hover:text-white'
                        }`}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full mt-3 py-3 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50 cursor-pointer ${
                      isLight
                        ? 'bg-black hover:bg-slate-800 text-white'
                        : 'bg-white hover:bg-neutral-200 text-black font-bold'
                    }`}
                  >
                    <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                    <ArrowRight className={`w-4 h-4 ${isLight ? 'text-white' : 'text-black'}`} />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: REGISTER FORM */}
            {tab === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-3">
                {/* Role Switcher */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('CUSTOMER')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      regRole === 'CUSTOMER'
                        ? isLight
                          ? 'border-black bg-black text-white shadow-xs'
                          : 'border-white bg-black text-white shadow-sm'
                        : isLight
                        ? 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        : 'border-neutral-800 bg-black/50 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 opacity-80" />
                    <span>Customer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('VENDOR')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      regRole === 'VENDOR'
                        ? isLight
                          ? 'border-black bg-black text-white shadow-xs'
                          : 'border-amber-400 bg-black text-white shadow-sm'
                        : isLight
                        ? 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        : 'border-neutral-800 bg-black/50 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 opacity-80" />
                    <span>Fleet Host (Vendor)</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Aarav"
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                        isLight
                          ? 'border-slate-200 bg-slate-50 text-slate-900 focus:border-black'
                          : 'border-neutral-800 bg-black text-white focus:border-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Sharma"
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                        isLight
                          ? 'border-slate-200 bg-slate-50 text-slate-900 focus:border-black'
                          : 'border-neutral-800 bg-black text-white focus:border-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="aarav@example.com"
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                        isLight
                          ? 'border-slate-200 bg-slate-50 text-slate-900 focus:border-black'
                          : 'border-neutral-800 bg-black text-white focus:border-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="9876543210"
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                        isLight
                          ? 'border-slate-200 bg-slate-50 text-slate-900 focus:border-black'
                          : 'border-neutral-800 bg-black text-white focus:border-white'
                      }`}
                    />
                  </div>
                </div>

                {regRole === 'VENDOR' && (
                  <div className={`grid grid-cols-2 gap-2 pt-1 border-t ${isLight ? 'border-stone-100' : 'border-neutral-800'}`}>
                    <div>
                      <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                        Business Name
                      </label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Apex Luxury Rentals"
                        className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                          isLight
                            ? 'border-slate-200 bg-slate-50 text-slate-900 focus:border-black'
                            : 'border-neutral-800 bg-black text-white focus:border-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                        Operating City
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Delhi NCR"
                        className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                          isLight
                            ? 'border-slate-200 bg-slate-50 text-slate-900 focus:border-black'
                            : 'border-neutral-800 bg-black text-white focus:border-white'
                        }`}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 8 characters with numbers"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isLight
                        ? 'border-slate-200 bg-slate-50 text-slate-900 focus:border-black'
                        : 'border-neutral-800 bg-black text-white focus:border-white'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full mt-2 py-3 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer active:scale-[0.99] ${
                    isLight
                      ? 'bg-black hover:bg-slate-800 text-white'
                      : 'bg-white hover:bg-neutral-200 text-black font-bold'
                  }`}
                >
                  <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
                  <ArrowRight className={`w-4 h-4 ${isLight ? 'text-white' : 'text-black'}`} />
                </button>
              </form>
            )}
          </div>

          {/* Footer toggle note */}
          <div
            className={`pt-4 mt-2 border-t text-center text-xs ${
              isLight ? 'border-stone-100 text-slate-600' : 'border-neutral-800 text-neutral-400'
            }`}
          >
            {tab === 'LOGIN' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('REGISTER');
                    setError(null);
                  }}
                  className={`font-semibold hover:underline cursor-pointer ${
                    isLight ? 'text-black' : 'text-amber-400 hover:text-white'
                  }`}
                >
                  Create one now
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('LOGIN');
                    setError(null);
                  }}
                  className={`font-semibold hover:underline cursor-pointer ${
                    isLight ? 'text-black' : 'text-amber-400 hover:text-white'
                  }`}
                >
                  Sign in here
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

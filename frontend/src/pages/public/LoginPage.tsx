import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { Car, Lock, Mail, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'VENDOR') {
        navigate('/vendor');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setError(
        msg.includes('prisma') || msg.includes('5433') || msg.includes('database')
          ? 'Invalid email or password. You can also click one of the demo quick login buttons above.'
          : msg
      );
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 transition-colors ${
        isLight ? 'bg-[#F4EFEA]' : 'bg-black'
      }`}
    >
      {/* Top Back to Home navigation */}
      <div className="w-full max-w-md flex justify-start mb-4">
        <Link
          to="/"
          className={`inline-flex items-center gap-2 text-xs font-medium transition-colors ${
            isLight ? 'text-slate-600 hover:text-black' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to DriveLoop</span>
        </Link>
      </div>

      <div
        className={`max-w-md w-full space-y-6 p-8 rounded-2xl border shadow-2xl transition-colors ${
          isLight
            ? 'bg-white border-stone-200 text-slate-900'
            : 'bg-[#0D0D0E] border-neutral-800 text-white'
        }`}
      >
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-block group mb-3">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center mx-auto shadow-md border transition-transform group-hover:scale-105 ${
                isLight
                  ? 'bg-black text-white border-black'
                  : 'bg-neutral-900 border-neutral-700 text-white'
              }`}
            >
              <Car className="w-5 h-5 text-amber-400" strokeWidth={2.2} />
            </div>
          </Link>
          <h2
            className={`font-display text-2xl font-bold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Sign in to DriveLoop
          </h2>
          <p
            className={`text-xs mt-1 font-normal ${
              isLight ? 'text-slate-500' : 'text-neutral-400'
            }`}
          >
            Access your customer bookings, fleet operations, or admin console
          </p>
        </div>

        {/* Demo Quick-fill buttons */}
        <div
          className={`p-3.5 rounded-xl border space-y-2 ${
            isLight
              ? 'bg-slate-50 border-stone-200'
              : 'bg-black border-neutral-800'
          }`}
        >
          <p
            className={`text-[10px] font-mono uppercase tracking-wider ${
              isLight ? 'text-slate-400' : 'text-neutral-500'
            }`}
          >
            Demo Quick Login (Click to auto-fill)
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@drivio.com', 'Admin@12345')}
              className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-colors truncate ${
                isLight
                  ? 'bg-white border-stone-200 text-slate-800 hover:bg-slate-100 shadow-xs'
                  : 'bg-neutral-900 border-neutral-700 text-white hover:border-neutral-500'
              }`}
              title="Admin role"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('vendor1@royalwheels.in', 'Vendor@12345')}
              className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-colors truncate ${
                isLight
                  ? 'bg-white border-stone-200 text-[#E07A3F] hover:bg-slate-100 shadow-xs'
                  : 'bg-neutral-900 border-neutral-700 text-amber-400 hover:border-amber-300'
              }`}
              title="Approved Vendor"
            >
              Vendor
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('aarav@example.com', 'Customer@12345')}
              className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-colors truncate ${
                isLight
                  ? 'bg-white border-stone-200 text-slate-800 hover:bg-slate-100 shadow-xs'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-neutral-500'
              }`}
              title="Customer with bookings"
            >
              Customer
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className={`block text-xs font-semibold mb-1 ${
                isLight ? 'text-slate-800' : 'text-white'
              }`}
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                className={`w-4 h-4 absolute left-3 top-3 ${
                  isLight ? 'text-slate-400' : 'text-neutral-500'
                }`}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs font-semibold focus:outline-none transition-colors ${
                  isLight
                    ? 'border-stone-200 bg-slate-50 text-slate-900 focus:border-black'
                    : 'border-neutral-800 bg-black text-white focus:border-white'
                }`}
              />
            </div>
          </div>

          <div>
            <label
              className={`block text-xs font-semibold mb-1 ${
                isLight ? 'text-slate-800' : 'text-white'
              }`}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className={`w-4 h-4 absolute left-3 top-3 ${
                  isLight ? 'text-slate-400' : 'text-neutral-500'
                }`}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs font-semibold focus:outline-none transition-colors ${
                  isLight
                    ? 'border-stone-200 bg-slate-50 text-slate-900 focus:border-black'
                    : 'border-neutral-800 bg-black text-white focus:border-white'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-card disabled:opacity-50 ${
              isLight
                ? 'bg-black hover:bg-slate-800 text-white'
                : 'bg-white hover:bg-neutral-200 text-black'
            }`}
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div
          className={`text-center text-xs ${
            isLight ? 'text-slate-500' : 'text-neutral-400'
          }`}
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            className={`font-semibold hover:underline ${
              isLight ? 'text-black' : 'text-amber-400 hover:text-white'
            }`}
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

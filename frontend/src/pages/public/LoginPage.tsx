import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Car, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
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
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0B0F14]">
      <div className="max-w-md w-full space-y-6 bg-[#1A222B] p-8 rounded-2xl border border-[#36424D] shadow-2xl text-[#FAF8F3]">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-[#0E4A6B] border border-[#2D7DA6]/50 flex items-center justify-center text-[#FAF8F3] mx-auto shadow-card">
            <Car className="w-5 h-5 text-[#FAF8F3]" strokeWidth={2.2} />
          </div>
          <h2 className="font-display text-2xl font-bold text-[#FAF8F3] mt-4 tracking-tight">
            Sign in to DriveLoop
          </h2>
          <p className="text-xs text-[#D5DBE1] mt-1 font-normal">
            Access your customer bookings, fleet operations, or admin console
          </p>
        </div>

        {/* Demo Quick-fill buttons */}
        <div className="p-3.5 rounded-xl bg-[#0B0F14] border border-[#36424D] space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#6B7783]">
            Demo Quick Login (Click to auto-fill)
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@drivio.com', 'Admin@12345')}
              className="py-1.5 px-2 rounded-lg bg-[#1A222B] border border-[#36424D] text-[11px] font-semibold text-[#FAF8F3] hover:border-[#2D7DA6] transition-colors truncate"
              title="Admin role"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('vendor1@royalwheels.in', 'Vendor@12345')}
              className="py-1.5 px-2 rounded-lg bg-[#1A222B] border border-[#36424D] text-[11px] font-semibold text-[#E07A3F] hover:border-[#E07A3F] transition-colors truncate"
              title="Approved Vendor"
            >
              Vendor
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('aarav@example.com', 'Customer@12345')}
              className="py-1.5 px-2 rounded-lg bg-[#1A222B] border border-[#36424D] text-[11px] font-semibold text-[#2D7DA6] hover:border-[#2D7DA6] transition-colors truncate"
              title="Customer with bookings"
            >
              Customer
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-[#E07A3F]/10 border border-[#E07A3F]/30 text-xs text-[#E07A3F] flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#FAF8F3] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6B7783] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#36424D] bg-[#0B0F14] text-xs font-semibold text-[#FAF8F3] focus:outline-none focus:border-[#2D7DA6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#FAF8F3] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6B7783] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#36424D] bg-[#0B0F14] text-xs font-semibold text-[#FAF8F3] focus:outline-none focus:border-[#2D7DA6]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-full bg-[#F6E7D7] hover:bg-white text-[#0B0F14] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-card disabled:opacity-50"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-[#0B0F14]" />
          </button>
        </form>

        <div className="text-center text-xs text-[#D5DBE1]">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[#2D7DA6] hover:text-[#F6E7D7] hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
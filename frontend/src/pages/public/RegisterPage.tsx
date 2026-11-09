import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Car, User, Building2, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isLoading } = useAuthStore();

  const initialRole = searchParams.get('role') === 'VENDOR' ? 'VENDOR' : 'CUSTOMER';
  const [role, setRole] = useState<'CUSTOMER' | 'VENDOR'>(initialRole);

  // Common fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Vendor specific fields
  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [description, setDescription] = useState('');

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: any = {
      role,
      firstName,
      lastName,
      email,
      phone,
      password,
    };

    if (role === 'VENDOR') {
      if (!businessName || !city) {
        setError('Business Name and Operational City are required for Vendor registration.');
        return;
      }
      payload.businessName = businessName;
      payload.businessEmail = businessEmail || email;
      payload.contactNumber = contactNumber || phone;
      payload.city = city;
      payload.address = address;
      payload.postalCode = postalCode;
      payload.description = description;
      payload.authorizedPerson = `${firstName} ${lastName}`;
    }

    try {
      const user = await register(payload);
      if (user.role === 'VENDOR') {
        navigate('/vendor');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-xl w-full space-y-6 bg-[#0D0D0E] p-8 rounded-2xl border border-neutral-800 shadow-2xl text-white">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white mx-auto shadow-card">
            <Car className="w-5 h-5 text-amber-400" strokeWidth={2.2} />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mt-3 tracking-tight">
            Create your DriveLoop Account
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Choose your account type to get started
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-full bg-black border border-neutral-800">
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`py-2 text-xs font-semibold rounded-full transition-all flex items-center justify-center space-x-1.5 ${
              role === 'CUSTOMER'
                ? 'bg-white text-black shadow-subtle'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer Renter</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('VENDOR')}
            className={`py-2 text-xs font-semibold rounded-full transition-all flex items-center justify-center space-x-1.5 ${
              role === 'VENDOR'
                ? 'bg-white text-black shadow-subtle'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Fleet Host Operator</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-xs text-red-400 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {role === 'VENDOR' && (
          <div className="p-3.5 rounded-xl bg-black border border-neutral-800 text-xs text-white flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-400">Host Onboarding Protocol:</span>
              <p className="text-neutral-400 mt-0.5 leading-relaxed">
                New vendor registrations are initialized in <strong>PENDING</strong> review. Platform administrators verify commercial fitness permits before authorizing inventory publishing.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Aarav"
                className="w-full px-3 py-2 rounded-lg border border-neutral-800 bg-black text-xs font-semibold text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sharma"
                className="w-full px-3 py-2 rounded-lg border border-neutral-800 bg-black text-xs font-semibold text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 rounded-lg border border-neutral-800 bg-black text-xs font-semibold text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98XXXXXXXX"
                className="w-full px-3 py-2 rounded-lg border border-neutral-800 bg-black text-xs font-semibold text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Password *</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-3 py-2 rounded-lg border border-neutral-800 bg-black text-xs font-semibold text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>

          {/* Additional Vendor Business Fields */}
          {role === 'VENDOR' && (
            <div className="pt-3 border-t border-neutral-800 space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 block">
                Rental Business Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Apex Luxury Rentals Ltd."
                    className="w-full px-3 py-2 rounded-lg border border-neutral-800 bg-black text-xs font-semibold text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Operational City / Hub *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Delhi NCR, Jaipur"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-800 bg-black text-xs font-semibold text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Business Depot Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Terminal 3 Hub or depot address"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-800 bg-black text-xs font-semibold text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Fleet Profile / Overview</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of your fleet (e.g. 15 premium SUVs and sedans)"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-800 bg-black text-xs font-semibold text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-card disabled:opacity-50"
          >
            <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </form>

        <div className="text-center text-xs text-neutral-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-amber-400 hover:text-white hover:underline transition-colors">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

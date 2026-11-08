import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  ShieldCheck,
  TrendingUp,
  Coins,
  CheckCircle2,
  ArrowRight,
  Calculator,
  Lock,
  Headphones,
} from 'lucide-react';
import { formatINR } from '../../utils/format';

export const HostLandingPage: React.FC = () => {
  // Calculator state
  const [fleetSize, setFleetSize] = useState(5);
  const [dailyRate, setDailyRate] = useState(3500); // ₹3,500
  const [utilizationDays, setUtilizationDays] = useState(20); // 20 days/month (66%)

  const grossMonthly = fleetSize * dailyRate * utilizationDays * 100; // in paise
  const commission = grossMonthly * 0.10;
  const netEarnings = grossMonthly - commission;

  return (
    <div className="space-y-16 py-8 pb-24 bg-[#0B0F14] text-[#FAF8F3]">
      {/* 1. HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0E4A6B] via-[#1A222B] to-[#1A222B] text-white rounded-2xl p-8 sm:p-16 relative overflow-hidden border border-[#36424D] shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-5">
            <span className="inline-block px-3 py-1 rounded-full bg-[#0B0F14]/60 text-[#FAF8F3] text-[10px] font-mono tracking-widest uppercase border border-[#36424D]">
              Host Partnership Program
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-[#FAF8F3]">
              Scale Your Rental Fleet with <span className="text-[#F6E7D7]">DriveLoop</span>.
            </h1>
            <p className="text-sm sm:text-base text-[#D5DBE1] leading-relaxed max-w-xl font-normal">
              Connect directly with verified corporate and leisure self-drive customers.
              Enjoy automated security deposit escrow, dedicated multi-tenant fleet software, and guaranteed weekly bank payouts at a low 10% platform commission.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/register?role=VENDOR"
                className="px-6 py-3.5 rounded-full bg-[#F6E7D7] hover:bg-white text-[#0B0F14] text-xs font-bold uppercase tracking-wider shadow-card transition-all flex items-center space-x-2"
              >
                <span>Onboard Your Rental Business</span>
                <ArrowRight className="w-4 h-4 text-[#0B0F14]" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-full bg-[#0B0F14]/70 hover:bg-[#0B0F14] text-[#FAF8F3] text-xs font-semibold tracking-wide border border-[#36424D] transition-colors"
              >
                Host Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#E07A3F]">
            Fleet Economics
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FAF8F3] mt-1">
            Engineered for Commercial Operators
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1A222B] p-6 rounded-2xl border border-[#36424D] shadow-card space-y-3">
            <div className="w-9 h-9 rounded-full bg-[#0B0F14] border border-[#36424D] text-[#2D7DA6] flex items-center justify-center">
              <Coins className="w-4 h-4 text-[#2D7DA6]" />
            </div>
            <h3 className="font-display text-base font-bold text-[#FAF8F3]">
              Transparent 10% Platform Commission
            </h3>
            <p className="text-xs text-[#D5DBE1] leading-relaxed">
              Keep 90% of your gross rental earnings. No hidden subscription fees, onboarding costs, or delayed payout reserves.
            </p>
          </div>

          <div className="bg-[#1A222B] p-6 rounded-2xl border border-[#36424D] shadow-card space-y-3">
            <div className="w-9 h-9 rounded-full bg-[#0B0F14] border border-[#36424D] text-[#E07A3F] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#E07A3F]" />
            </div>
            <h3 className="font-display text-base font-bold text-[#FAF8F3]">
              Automated Security Deposit Escrow
            </h3>
            <p className="text-xs text-[#D5DBE1] leading-relaxed">
              Refundable deposits are securely collected via Razorpay on every booking, safeguarding your vehicles against unpaid tolls or damage.
            </p>
          </div>

          <div className="bg-[#1A222B] p-6 rounded-2xl border border-[#36424D] shadow-card space-y-3">
            <div className="w-9 h-9 rounded-full bg-[#0B0F14] border border-[#36424D] text-[#F6E7D7] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#F6E7D7]" />
            </div>
            <h3 className="font-display text-base font-bold text-[#FAF8F3]">
              Multi-Tenant Fleet Suite
            </h3>
            <p className="text-xs text-[#D5DBE1] leading-relaxed">
              Dedicated isolated vendor portal to track vehicle utilization, incoming bookings, digital handover odometers, and accounting logs.
            </p>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE REVENUE CALCULATOR */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1A222B] rounded-2xl border border-[#36424D] shadow-card p-6 sm:p-10 space-y-8">
          <div className="text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E07A3F] flex items-center justify-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              Earnings Estimator
            </span>
            <h3 className="font-display text-2xl font-bold text-[#FAF8F3] mt-1">
              Estimate Your Monthly Fleet Revenue
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[#FAF8F3] mb-1">
                Fleet Size: <span className="text-[#F6E7D7] tabular-nums font-bold">{fleetSize} Cars</span>
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={fleetSize}
                onChange={(e) => setFleetSize(Number(e.target.value))}
                className="w-full accent-[#2D7DA6]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#6B7783]">
                <span>1 car</span>
                <span>30 cars</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#FAF8F3] mb-1">
                Avg Daily Rate: <span className="text-[#F6E7D7] tabular-nums font-bold">₹{dailyRate}</span>
              </label>
              <input
                type="range"
                min="1500"
                max="15000"
                step="500"
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                className="w-full accent-[#2D7DA6]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#6B7783]">
                <span>₹1,500</span>
                <span>₹15,000</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#FAF8F3] mb-1">
                Rental Days/Month: <span className="text-[#F6E7D7] tabular-nums font-bold">{utilizationDays} Days</span>
              </label>
              <input
                type="range"
                min="5"
                max="28"
                value={utilizationDays}
                onChange={(e) => setUtilizationDays(Number(e.target.value))}
                className="w-full accent-[#2D7DA6]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#6B7783]">
                <span>5 days</span>
                <span>28 days</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#0B0F14] border border-[#36424D] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#6B7783]">
                Estimated Net Host Monthly Earnings
              </p>
              <p className="text-3xl font-display font-extrabold text-[#F6E7D7] tabular-nums mt-1">
                {formatINR(netEarnings)}
              </p>
              <p className="text-[11px] font-mono text-[#D5DBE1] mt-1">
                Gross: {formatINR(grossMonthly)} • Platform Commission (10%): {formatINR(commission)}
              </p>
            </div>

            <Link
              to="/register?role=VENDOR"
              className="px-6 py-3 rounded-full bg-[#F6E7D7] hover:bg-white text-[#0B0F14] text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap shadow-card"
            >
              Start Onboarding Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  ShieldCheck,
  CreditCard,
  KeyRound,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HeartHandshake,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 pb-24 bg-black text-white">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
          TRANSPARENT ARCHITECTURE
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight">
          How Self-Drive Rentals Work on DriveLoop
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-2xl mx-auto font-normal">
          Everything you need to know about transparent verified pricing, multi-vendor commercial yellow-plate compliance, digital pre-trip inspection, and 24-hour refundable deposit release.
        </p>
      </div>

      {/* 4 Steps Visual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-[#0D0D0E] border border-neutral-800 shadow-card space-y-3 flex flex-col justify-between hover:border-neutral-600 transition-colors">
          <div>
            <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 text-amber-400 flex items-center justify-center font-mono font-bold text-xs mb-4">
              01
            </div>
            <h3 className="font-display text-base font-bold text-white">
              Discover & Filter Fleet
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mt-2">
              Search real-time inventory across Delhi NCR, Gurgaon, Noida, Jaipur, and Chandigarh. Filter by vehicle category, fuel architecture, transmission, and daily budget.
            </p>
          </div>
          <div className="pt-4 border-t border-neutral-800 text-[10px] font-mono text-neutral-500 uppercase">
            Real VINs & Availability
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0D0D0E] border border-neutral-800 shadow-card space-y-3 flex flex-col justify-between hover:border-neutral-600 transition-colors">
          <div>
            <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 text-amber-400 flex items-center justify-center font-mono font-bold text-xs mb-4">
              02
            </div>
            <h3 className="font-display text-base font-bold text-white">
              Verified Pricing Schedule
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mt-2">
              View server-calculated, auditable pricing breakdowns. Daily rate, statutory 18% GST, platform booking fee, and refundable deposit are transparently itemized with zero surge multipliers.
            </p>
          </div>
          <div className="pt-4 border-t border-neutral-800 text-[10px] font-mono text-neutral-500 uppercase">
            Zero Hidden Add-Ons
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0D0D0E] border border-neutral-800 shadow-card space-y-3 flex flex-col justify-between hover:border-neutral-600 transition-colors">
          <div>
            <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 text-amber-400 flex items-center justify-center font-mono font-bold text-xs mb-4">
              03
            </div>
            <h3 className="font-display text-base font-bold text-white">
              Digital Handover Protocol
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mt-2">
              Meet your verified fleet operator at the airport terminal or city hub. Complete digital driver license verification, fuel mark, and mutual odometer photo capture in 3 minutes.
            </p>
          </div>
          <div className="pt-4 border-t border-neutral-800 text-[10px] font-mono text-neutral-500 uppercase">
            Mutual Sign-Off Record
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0D0D0E] border border-neutral-800 shadow-card space-y-3 flex flex-col justify-between hover:border-neutral-600 transition-colors">
          <div>
            <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs mb-4">
              04
            </div>
            <h3 className="font-display text-base font-bold text-white">
              24h Deposit Release
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mt-2">
              Return the vehicle to the designated hub. Once final odometer, fuel, and FASTag logs are signed off, 100% of your security deposit is released back to your bank within 24 hours.
            </p>
          </div>
          <div className="pt-4 border-t border-neutral-800 text-[10px] font-mono text-emerald-400 uppercase font-semibold">
            Automated Escrow Return
          </div>
        </div>
      </div>

      {/* Cancellation Policy Deep-Dive */}
      <div className="bg-[#0D0D0E] p-6 sm:p-10 rounded-2xl border border-neutral-800 shadow-card space-y-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
            Fair & Contractual
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
            Cancellation & Refund Schedule
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            We enforce automated, deterministic cancellation rules with complete visibility:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-xl bg-black border border-neutral-800 space-y-2">
            <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
              Tier 1 • Full Refund
            </span>
            <h4 className="font-bold text-sm text-white pt-1">&gt; 48 Hours Prior</h4>
            <p className="text-neutral-400 leading-relaxed">
              If cancelled more than 48 hours before scheduled pickup, you receive a <strong className="text-white">100% refund</strong> of the base rental fee, taxes, and security deposit.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-black border border-neutral-800 space-y-2">
            <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-amber-950/40 text-amber-300 border border-amber-800/40">
              Tier 2 • Partial Refund
            </span>
            <h4 className="font-bold text-sm text-white pt-1">24 to 48 Hours Prior</h4>
            <p className="text-neutral-400 leading-relaxed">
              Receive a <strong className="text-white">75% refund</strong> of the rental fee and taxes, plus 100% of your security deposit.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-black border border-neutral-800 space-y-2">
            <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-neutral-900 text-neutral-400 border border-neutral-800">
              Tier 3 • Last Minute
            </span>
            <h4 className="font-bold text-sm text-white pt-1">&lt; 24 Hours Prior</h4>
            <p className="text-neutral-400 leading-relaxed">
              Receive a <strong className="text-white">50% refund</strong> of the rental fee and taxes, plus 100% of your security deposit.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Bottom Banner */}
      <div className="text-center bg-[#0D0D0E] text-white p-10 sm:p-14 rounded-2xl space-y-4 border border-neutral-800 shadow-2xl">
        <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Ready to Experience the Road?
        </h3>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
          Explore inspected self-drive vehicles across Delhi NCR, Jaipur, and Chandigarh with instant booking confirmation.
        </p>
        <div className="pt-2">
          <Link
            to="/explore"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider transition-all shadow-card"
          >
            <span>Browse Available Fleet</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </Link>
        </div>
      </div>
    </div>
  );
};

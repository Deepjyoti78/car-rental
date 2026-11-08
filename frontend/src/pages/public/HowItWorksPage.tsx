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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 pb-24 bg-[#0B0F14] text-[#FAF8F3]">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#E07A3F]">
          TRANSPARENT ARCHITECTURE
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#FAF8F3] tracking-tight">
          How Self-Drive Rentals Work on DriveLoop
        </h1>
        <p className="text-xs sm:text-sm text-[#D5DBE1] leading-relaxed max-w-2xl mx-auto font-normal">
          Everything you need to know about transparent verified pricing, multi-vendor commercial yellow-plate compliance, digital pre-trip inspection, and 24-hour refundable deposit release.
        </p>
      </div>

      {/* 4 Steps Visual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-[#1A222B] border border-[#36424D] shadow-card space-y-3 flex flex-col justify-between hover:border-[#2D7DA6] transition-colors">
          <div>
            <div className="w-8 h-8 rounded-full bg-[#0E4A6B] border border-[#2D7DA6]/50 text-[#FAF8F3] flex items-center justify-center font-mono font-bold text-xs mb-4">
              01
            </div>
            <h3 className="font-display text-base font-bold text-[#FAF8F3]">
              Discover & Filter Fleet
            </h3>
            <p className="text-xs text-[#D5DBE1] leading-relaxed mt-2">
              Search real-time inventory across Delhi NCR, Gurgaon, Noida, Jaipur, and Chandigarh. Filter by vehicle category, fuel architecture, transmission, and daily budget.
            </p>
          </div>
          <div className="pt-4 border-t border-[#36424D] text-[10px] font-mono text-[#6B7783] uppercase">
            Real VINs & Availability
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#1A222B] border border-[#36424D] shadow-card space-y-3 flex flex-col justify-between hover:border-[#2D7DA6] transition-colors">
          <div>
            <div className="w-8 h-8 rounded-full bg-[#0E4A6B] border border-[#2D7DA6]/50 text-[#FAF8F3] flex items-center justify-center font-mono font-bold text-xs mb-4">
              02
            </div>
            <h3 className="font-display text-base font-bold text-[#FAF8F3]">
              Verified Pricing Schedule
            </h3>
            <p className="text-xs text-[#D5DBE1] leading-relaxed mt-2">
              View server-calculated, auditable pricing breakdowns. Daily rate, statutory 18% GST, platform booking fee, and refundable deposit are transparently itemized with zero surge multipliers.
            </p>
          </div>
          <div className="pt-4 border-t border-[#36424D] text-[10px] font-mono text-[#6B7783] uppercase">
            Zero Hidden Add-Ons
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#1A222B] border border-[#36424D] shadow-card space-y-3 flex flex-col justify-between hover:border-[#2D7DA6] transition-colors">
          <div>
            <div className="w-8 h-8 rounded-full bg-[#0E4A6B] border border-[#2D7DA6]/50 text-[#FAF8F3] flex items-center justify-center font-mono font-bold text-xs mb-4">
              03
            </div>
            <h3 className="font-display text-base font-bold text-[#FAF8F3]">
              Digital Handover Protocol
            </h3>
            <p className="text-xs text-[#D5DBE1] leading-relaxed mt-2">
              Meet your verified fleet operator at the airport terminal or city hub. Complete digital driver license verification, fuel mark, and mutual odometer photo capture in 3 minutes.
            </p>
          </div>
          <div className="pt-4 border-t border-[#36424D] text-[10px] font-mono text-[#6B7783] uppercase">
            Mutual Sign-Off Record
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#1A222B] border border-[#36424D] shadow-card space-y-3 flex flex-col justify-between hover:border-[#2D7DA6] transition-colors">
          <div>
            <div className="w-8 h-8 rounded-full bg-[#0E4A6B] border border-[#2D7DA6]/50 text-[#FAF8F3] flex items-center justify-center font-mono font-bold text-xs mb-4">
              04
            </div>
            <h3 className="font-display text-base font-bold text-[#FAF8F3]">
              24h Deposit Release
            </h3>
            <p className="text-xs text-[#D5DBE1] leading-relaxed mt-2">
              Return the vehicle to the designated hub. Once final odometer, fuel, and FASTag logs are signed off, 100% of your security deposit is released back to your bank within 24 hours.
            </p>
          </div>
          <div className="pt-4 border-t border-[#36424D] text-[10px] font-mono text-[#F6E7D7] uppercase font-semibold">
            Automated Escrow Return
          </div>
        </div>
      </div>

      {/* Cancellation Policy Deep-Dive */}
      <div className="bg-[#1A222B] p-6 sm:p-10 rounded-2xl border border-[#36424D] shadow-card space-y-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#E07A3F]">
            Fair & Contractual
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FAF8F3] mt-1">
            Cancellation & Refund Schedule
          </h2>
          <p className="text-xs sm:text-sm text-[#D5DBE1] mt-1">
            We enforce automated, deterministic cancellation rules with complete visibility:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-xl bg-[#0B0F14] border border-[#36424D] space-y-2">
            <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-[#0E4A6B]/50 text-[#F6E7D7] border border-[#2D7DA6]/50">
              Tier 1 • Full Refund
            </span>
            <h4 className="font-bold text-sm text-[#FAF8F3] pt-1">&gt; 48 Hours Prior</h4>
            <p className="text-[#D5DBE1] leading-relaxed">
              If cancelled more than 48 hours before scheduled pickup, you receive a <strong className="text-[#FAF8F3]">100% refund</strong> of the base rental fee, taxes, and security deposit.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0B0F14] border border-[#36424D] space-y-2">
            <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-[#E07A3F]/20 text-[#E07A3F] border border-[#E07A3F]/40">
              Tier 2 • Partial Refund
            </span>
            <h4 className="font-bold text-sm text-[#FAF8F3] pt-1">24 to 48 Hours Prior</h4>
            <p className="text-[#D5DBE1] leading-relaxed">
              Receive a <strong className="text-[#FAF8F3]">75% refund</strong> of the rental fee and taxes, plus 100% of your security deposit.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0B0F14] border border-[#36424D] space-y-2">
            <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-[#E07A3F]/10 text-[#E07A3F] border border-[#E07A3F]/20">
              Tier 3 • Last Minute
            </span>
            <h4 className="font-bold text-sm text-[#FAF8F3] pt-1">&lt; 24 Hours Prior</h4>
            <p className="text-[#D5DBE1] leading-relaxed">
              Receive a <strong className="text-[#FAF8F3]">50% refund</strong> of the rental fee and taxes, plus 100% of your security deposit.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Bottom Banner */}
      <div className="text-center bg-gradient-to-r from-[#0E4A6B] to-[#1A222B] text-white p-10 sm:p-14 rounded-2xl space-y-4 border border-[#36424D] shadow-2xl">
        <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAF8F3]">
          Ready to Experience the Road?
        </h3>
        <p className="text-xs sm:text-sm text-[#D5DBE1] max-w-md mx-auto">
          Explore inspected self-drive vehicles across Delhi NCR, Jaipur, and Chandigarh with instant booking confirmation.
        </p>
        <div className="pt-2">
          <Link
            to="/explore"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-[#F6E7D7] hover:bg-white text-[#0B0F14] text-xs font-bold uppercase tracking-wider transition-all shadow-card"
          >
            <span>Browse Available Fleet</span>
            <ArrowRight className="w-4 h-4 text-[#0B0F14]" />
          </Link>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vehicle } from '../../types';
import { formatINR } from '../../utils/format';
import {
  Users,
  Fuel,
  Gauge,
  Star,
  MapPin,
  Heart,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { miscService } from '../../services/miscService';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

interface VehicleCardProps {
  vehicle: Vehicle;
  isWishlisted?: boolean;
  onWishlistToggled?: (saved: boolean) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  isWishlisted = false,
  onWishlistToggled,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const [saved, setSaved] = useState(isWishlisted);
  const [saving, setSaving] = useState(false);

  const primaryImage =
    vehicle.images?.find((img) => img.isPrimary)?.url ||
    vehicle.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80';

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please sign in to save vehicles to your wishlist.');
      return;
    }
    setSaving(true);
    try {
      const res = await miscService.toggleWishlist(vehicle.id);
      setSaved(res.saved);
      onWishlistToggled?.(res.saved);
    } catch (err) {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/vehicles/${vehicle.id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group cursor-pointer rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col justify-between ${
        isLight
          ? 'bg-white border-stone-200/80 shadow-xs hover:border-stone-400 hover:shadow-lg text-slate-900'
          : 'bg-[#0D0D0E] border-neutral-800 hover:border-neutral-600 hover:bg-[#121214] hover:shadow-2xl text-white'
      }`}
    >
      <div>
        {/* Cinematic Vehicle Photography + Sneak Peek Hover Overlay */}
        <div
          className={`relative aspect-[16/10] overflow-hidden ${
            isLight ? 'bg-stone-100' : 'bg-black'
          }`}
        >
          <img
            src={primaryImage}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-95 group-hover:opacity-100"
            loading="lazy"
          />

          {/* Gradient overlay for bottom badge readability */}
          <div
            className={`absolute inset-0 pointer-events-none ${
              isLight
                ? 'bg-gradient-to-t from-black/40 via-transparent to-black/20'
                : 'bg-gradient-to-t from-black/90 via-transparent to-black/30'
            }`}
          />

          {/* Top category & wishlist button */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest backdrop-blur-md border ${
                isLight
                  ? 'bg-white/90 text-slate-800 border-stone-200 shadow-xs'
                  : 'bg-black/80 text-white border-neutral-700'
              }`}
            >
              {vehicle.category}
            </span>

            <button
              onClick={handleToggleWishlist}
              disabled={saving}
              className={`w-8 h-8 rounded-full backdrop-blur-sm border flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-subtle ${
                isLight
                  ? 'bg-white/90 hover:bg-white text-slate-800 border-stone-200 shadow-xs'
                  : 'bg-neutral-900/90 hover:bg-neutral-800 text-white border-neutral-700'
              }`}
              title={saved ? 'Remove from saved' : 'Save vehicle'}
              aria-label="Save vehicle"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  saved
                    ? 'fill-rose-500 text-rose-500'
                    : isLight
                    ? 'text-slate-600'
                    : 'text-white'
                }`}
              />
            </button>
          </div>

          {/* Bottom rating & trip badge */}
          <div
            className={`absolute bottom-3 left-3 flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full backdrop-blur-md text-[11px] font-medium border z-10 ${
              isLight
                ? 'bg-white/90 text-slate-800 border-stone-200 shadow-xs'
                : 'bg-black/85 text-white border-neutral-700'
            }`}
          >
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="font-bold tabular-nums">{vehicle.rating.toFixed(1)}</span>
            <span className={isLight ? 'text-slate-500 text-[10px]' : 'text-neutral-400 text-[10px]'}>
              ({vehicle.totalTrips} trips)
            </span>
          </div>

          {/* Location pill */}
          <div
            className={`absolute bottom-3 right-3 flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full backdrop-blur-md border z-10 ${
              isLight
                ? 'bg-white/90 text-slate-800 border-stone-200 shadow-xs'
                : 'bg-black/85 text-white border-neutral-700'
            }`}
          >
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>{vehicle.city}</span>
          </div>

          {/* ======================================================== */}
          {/* SNEAK PEEK HOVER OVERLAY: Appears smoothly on card hover */}
          {/* ======================================================== */}
          <div
            className={`absolute inset-0 z-20 p-3.5 flex flex-col justify-between transition-all duration-300 pointer-events-none opacity-0 group-hover:opacity-100 ${
              isLight
                ? 'bg-stone-900/90 text-white backdrop-blur-md'
                : 'bg-black/95 text-white backdrop-blur-md'
            }`}
          >
            {/* Top row in sneak peek */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3 h-3" />
                Quick Sneak Peek
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                {vehicle.transmission.toUpperCase()} • {vehicle.fuelType.toUpperCase()}
              </span>
            </div>

            {/* Middle body specs & perks */}
            <div className="space-y-2 py-1">
              <div className="flex items-center gap-1.5 text-xs text-neutral-200">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate text-[11px] font-medium">
                  {(vehicle.vendor as any)?.locationAddress || vehicle.pickupAddress || `${vehicle.city} Verified Hub`}
                </span>
              </div>

              {/* Feature highlights chips */}
              <div className="flex flex-wrap gap-1">
                {(vehicle.features && vehicle.features.length > 0
                  ? vehicle.features.slice(0, 3)
                  : ['Unlimited km', 'Fastag Active', 'Clean & Sanitized']
                ).map((feat, i) => {
                  const label = typeof feat === 'string' ? feat : (feat as any).name || (feat as any).feature?.name || 'Feature';
                  return (
                    <span
                      key={i}
                      className="text-[9px] font-sans px-2 py-0.5 rounded bg-white/10 text-neutral-200 border border-white/10"
                    >
                      {label}
                    </span>
                  );
                })}
              </div>

              {/* Security deposit & terms */}
              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/15 text-neutral-300">
                <span>Security Deposit:</span>
                <span className="font-semibold text-white">
                  {formatINR(vehicle.securityDeposit)}
                </span>
              </div>
            </div>

            {/* Bottom action trigger bar */}
            <div className="pt-2 flex items-center justify-between border-t border-white/15">
              <span className="text-[11px] text-amber-400 font-medium">
                Click anywhere to view full specs
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-full border border-white/20">
                Inspect <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          {/* Header & Brand */}
          <div className="flex items-start justify-between">
            <div>
              <p
                className={`text-[11px] font-mono tracking-wider uppercase ${
                  isLight ? 'text-slate-400' : 'text-neutral-400'
                }`}
              >
                {vehicle.brand} • {vehicle.year}
              </p>
              <h3
                className={`font-display text-base sm:text-lg font-bold transition-colors mt-0.5 line-clamp-1 ${
                  isLight
                    ? 'text-slate-900 group-hover:text-black'
                    : 'text-white group-hover:text-amber-400'
                }`}
              >
                {vehicle.brand} {vehicle.model}
              </h3>
            </div>
          </div>

          {/* Host / Fleet Attribution */}
          <div
            className={`flex items-center gap-1.5 mt-2 text-xs ${
              isLight ? 'text-slate-600' : 'text-neutral-300'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isLight ? 'text-slate-700' : 'text-amber-400'}`} />
            <span
              className={`truncate font-medium ${
                isLight ? 'text-slate-800' : 'text-neutral-200'
              }`}
            >
              {vehicle.vendor?.businessName || 'Verified Fleet Operator'}
            </span>
          </div>

          {/* Technical Specs Strip */}
          <div
            className={`grid grid-cols-3 gap-2 mt-4 pt-3 border-t text-xs ${
              isLight
                ? 'border-stone-100 text-slate-600'
                : 'border-neutral-800 text-neutral-300'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Gauge className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-neutral-400'}`} />
              <span className="truncate capitalize">{vehicle.transmission.toLowerCase()}</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <Fuel className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-neutral-400'}`} />
              <span className="truncate capitalize">{vehicle.fuelType.toLowerCase()}</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <Users className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-neutral-400'}`} />
              <span className="truncate">{vehicle.seatingCapacity} Seats</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Pricing & CTA */}
      <div className="p-4 sm:p-5 pt-0">
        <div
          className={`pt-3 border-t flex items-center justify-between ${
            isLight ? 'border-stone-100' : 'border-neutral-800'
          }`}
        >
          <div>
            <div className="flex items-baseline space-x-1">
              <span
                className={`text-lg sm:text-xl font-bold font-display tabular-nums ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {formatINR(vehicle.dailyRate)}
              </span>
              <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-neutral-400'}`}>
                /day
              </span>
            </div>
            <p
              className={`text-[10px] font-mono mt-0.5 ${
                isLight ? 'text-slate-400' : 'text-neutral-400'
              }`}
            >
              Deposit: {formatINR(vehicle.securityDeposit)} (Refundable)
            </p>
          </div>

          {/* Primary CTA button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/vehicles/${vehicle.id}`);
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-subtle flex items-center gap-1 group/btn ${
              isLight
                ? 'bg-black text-white hover:bg-slate-800'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            <span>View Details</span>
            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </article>
  );
};

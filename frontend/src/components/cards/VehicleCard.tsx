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
  CheckCircle2,
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
    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&auto=format&fit=crop&q=80';

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
      className={`group cursor-pointer rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col justify-between reveal-on-scroll ${
        isLight
          ? 'bg-white border-stone-200/80 shadow-xs hover:border-stone-400 hover:shadow-lg text-slate-900'
          : 'bg-[#0D0D0E] border-neutral-800/80 hover:border-neutral-700 hover:bg-[#121214] hover:shadow-2xl text-white'
      }`}
    >
      <div>
        {/* Cinematic Vehicle Photography */}
        <div
          className={`relative aspect-[16/10] overflow-hidden ${
            isLight ? 'bg-stone-100' : 'bg-black'
          }`}
        >
          <img
            src={primaryImage}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />

          {/* Natural Vignette Gradient */}
          <div
            className={`absolute inset-0 pointer-events-none ${
              isLight
                ? 'bg-gradient-to-t from-black/40 via-transparent to-black/20'
                : 'bg-gradient-to-t from-black/80 via-transparent to-black/30'
            }`}
          />

          {/* Top Badge: Category & Wishlist */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider backdrop-blur-md border ${
                isLight
                  ? 'bg-white/90 text-slate-800 border-stone-200 shadow-xs'
                  : 'bg-black/75 text-neutral-200 border-neutral-700/80'
              }`}
            >
              {vehicle.category}
            </span>

            <button
              onClick={handleToggleWishlist}
              disabled={saving}
              className={`w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-subtle ${
                isLight
                  ? 'bg-white/90 hover:bg-white text-slate-800 border-stone-200 shadow-xs'
                  : 'bg-black/75 hover:bg-neutral-900 text-white border-neutral-700/80'
              }`}
              title={saved ? 'Remove from saved' : 'Save vehicle'}
              aria-label="Save vehicle"
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
                  saved
                    ? 'fill-rose-500 text-rose-500'
                    : isLight
                    ? 'text-slate-600'
                    : 'text-neutral-300'
                }`}
              />
            </button>
          </div>

          {/* Bottom Indicators: Rating & City */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10 transition-opacity duration-200 group-hover:opacity-0">
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full backdrop-blur-md text-[11px] font-medium border ${
                isLight
                  ? 'bg-white/90 text-slate-800 border-stone-200 shadow-xs'
                  : 'bg-black/80 text-white border-neutral-700/80'
              }`}
            >
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="font-bold tabular-nums">{vehicle.rating.toFixed(1)}</span>
              <span className={isLight ? 'text-slate-500 text-[10px]' : 'text-neutral-400 text-[10px]'}>
                ({vehicle.totalTrips || 24})
              </span>
            </div>

            <div
              className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full backdrop-blur-md border ${
                isLight
                  ? 'bg-white/90 text-slate-800 border-stone-200 shadow-xs'
                  : 'bg-black/80 text-white border-neutral-700/80'
              }`}
            >
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{vehicle.city}</span>
            </div>
          </div>

          {/* REFINED SNEAK PEEK: Slides up as a graceful bottom sheet */}
          <div
            className={`absolute inset-x-0 bottom-0 z-20 p-3 pt-2.5 transition-all duration-300 transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 pointer-events-none backdrop-blur-md border-t ${
              isLight
                ? 'bg-white/95 text-slate-900 border-slate-200 shadow-lg'
                : 'bg-black/90 text-white border-neutral-700 shadow-2xl'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-medium mb-1">
              <span className="text-amber-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                {vehicle.transmission} • {vehicle.fuelType}
              </span>
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                {vehicle.mileagePolicy || 'Unlimited km'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] truncate mb-1.5">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span className={`truncate ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                {(vehicle.vendor as any)?.locationAddress || vehicle.pickupAddress || `${vehicle.city} Hub`}
              </span>
            </div>

            <div className={`pt-1.5 border-t flex items-center justify-between text-[10px] ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
              <span className={isLight ? 'text-slate-500' : 'text-neutral-400'}>
                Refundable Deposit: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{formatINR(vehicle.securityDeposit)}</strong>
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                View Details <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p
                className={`text-[11px] font-mono tracking-wider uppercase ${
                  isLight ? 'text-slate-400' : 'text-neutral-500'
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
              isLight ? 'text-slate-600' : 'text-neutral-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate font-medium">
              {vehicle.vendor?.businessName || 'Verified Fleet Host'}
            </span>
          </div>

          {/* Quick Technical Specs Strip */}
          <div
            className={`grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t text-xs ${
              isLight
                ? 'border-stone-100 text-slate-600'
                : 'border-neutral-800/80 text-neutral-400'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Gauge className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="truncate capitalize">{vehicle.transmission.toLowerCase()}</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <Fuel className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="truncate capitalize">{vehicle.fuelType.toLowerCase()}</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="truncate">{vehicle.seatingCapacity} Seats</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Pricing & CTA */}
      <div className="p-4 sm:p-5 pt-0">
        <div
          className={`pt-3 border-t flex items-center justify-between ${
            isLight ? 'border-stone-100' : 'border-neutral-800/80'
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
                isLight ? 'text-slate-500' : 'text-neutral-500'
              }`}
            >
              Zero hidden fees • GST included
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
            <span>Book Now</span>
            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </article>
  );
};

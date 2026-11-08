import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  ArrowUpRight,
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

  return (
    <article
      className={`group rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col justify-between ${
        isLight
          ? 'bg-white border-stone-200/80 shadow-xs hover:border-stone-400 hover:shadow-md text-slate-900'
          : 'bg-[#1A222B] border-[#36424D] hover:border-[#2D7DA6] hover:shadow-card text-[#FAF8F3]'
      }`}
    >
      <div>
        {/* Cinematic Vehicle Photography */}
        <div
          className={`relative aspect-[16/10] overflow-hidden ${
            isLight ? 'bg-stone-100' : 'bg-[#0B0F14]'
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
                : 'bg-gradient-to-t from-[#0B0F14]/90 via-transparent to-[#0B0F14]/30'
            }`}
          />

          {/* Top category & wishlist button */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest backdrop-blur-md border ${
                isLight
                  ? 'bg-white/90 text-slate-800 border-stone-200 shadow-xs'
                  : 'bg-[#0B0F14]/80 text-[#FAF8F3] border-[#36424D]'
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
                  : 'bg-[#1A222B]/80 hover:bg-[#1A222B] text-[#FAF8F3] border-[#36424D]'
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
                    : 'text-[#FAF8F3]'
                }`}
              />
            </button>
          </div>

          {/* Bottom rating & trip badge */}
          <div
            className={`absolute bottom-3 left-3 flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full backdrop-blur-md text-[11px] font-medium border ${
              isLight
                ? 'bg-white/90 text-slate-800 border-stone-200 shadow-xs'
                : 'bg-[#0B0F14]/85 text-[#FAF8F3] border-[#36424D]'
            }`}
          >
            <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
            <span className="font-bold tabular-nums">{vehicle.rating.toFixed(1)}</span>
            <span className={isLight ? 'text-slate-500 text-[10px]' : 'text-[#6B7783] text-[10px]'}>
              ({vehicle.totalTrips} trips)
            </span>
          </div>

          {/* Location pill */}
          <div
            className={`absolute bottom-3 right-3 flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full backdrop-blur-md border ${
              isLight
                ? 'bg-white/90 text-slate-800 border-stone-200 shadow-xs'
                : 'bg-[#0B0F14]/85 text-[#FAF8F3] border-[#36424D]'
            }`}
          >
            <MapPin className={`w-3 h-3 ${isLight ? 'text-[#E07A3F]' : 'text-[#2D7DA6]'}`} />
            <span>{vehicle.city}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          {/* Header & Brand */}
          <div className="flex items-start justify-between">
            <div>
              <p
                className={`text-[11px] font-mono tracking-wider uppercase ${
                  isLight ? 'text-slate-400' : 'text-[#6B7783]'
                }`}
              >
                {vehicle.brand} • {vehicle.year}
              </p>
              <h3
                className={`font-display text-base sm:text-lg font-bold transition-colors mt-0.5 line-clamp-1 ${
                  isLight
                    ? 'text-slate-900 group-hover:text-black'
                    : 'text-[#FAF8F3] group-hover:text-[#F6E7D7]'
                }`}
              >
                {vehicle.brand} {vehicle.model}
              </h3>
            </div>
          </div>

          {/* Host / Fleet Attribution */}
          <div
            className={`flex items-center gap-1.5 mt-2 text-xs ${
              isLight ? 'text-slate-600' : 'text-[#D5DBE1]'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isLight ? 'text-slate-700' : 'text-[#2D7DA6]'}`} />
            <span
              className={`truncate font-medium ${
                isLight ? 'text-slate-800' : 'text-[#FAF8F3]'
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
                : 'border-[#36424D] text-[#D5DBE1]'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Gauge className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-[#6B7783]'}`} />
              <span className="truncate capitalize">{vehicle.transmission.toLowerCase()}</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <Fuel className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-[#6B7783]'}`} />
              <span className="truncate capitalize">{vehicle.fuelType.toLowerCase()}</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <Users className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-[#6B7783]'}`} />
              <span className="truncate">{vehicle.seatingCapacity} Seats</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Pricing & CTA */}
      <div className="p-4 sm:p-5 pt-0">
        <div
          className={`pt-3 border-t flex items-center justify-between ${
            isLight ? 'border-stone-100' : 'border-[#36424D]'
          }`}
        >
          <div>
            <div className="flex items-baseline space-x-1">
              <span
                className={`text-lg sm:text-xl font-bold font-display tabular-nums ${
                  isLight ? 'text-slate-900' : 'text-[#FAF8F3]'
                }`}
              >
                {formatINR(vehicle.dailyRate)}
              </span>
              <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-[#6B7783]'}`}>
                /day
              </span>
            </div>
            <p
              className={`text-[10px] font-mono mt-0.5 ${
                isLight ? 'text-slate-400' : 'text-[#6B7783]'
              }`}
            >
              Deposit: {formatINR(vehicle.securityDeposit)} (Refundable)
            </p>
          </div>

          {/* Primary CTA */}
          <Link
            to={`/vehicles/${vehicle.id}`}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-subtle flex items-center gap-1 group/btn ${
              isLight
                ? 'bg-black text-white hover:bg-slate-800'
                : 'bg-[#F6E7D7] text-[#0B0F14] hover:bg-white'
            }`}
          >
            <span>View Car</span>
            <ArrowUpRight className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
};
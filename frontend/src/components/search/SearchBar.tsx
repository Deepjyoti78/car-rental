import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Search, ChevronDown, Check } from 'lucide-react';

interface SearchBarProps {
  initialCity?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  onSearch?: (params: { city: string; startDate: string; endDate: string }) => void;
  compact?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialCity = '',
  initialStartDate = '',
  initialEndDate = '',
  onSearch,
  compact = false,
}) => {
  const navigate = useNavigate();

  // Helper defaults: pickup tomorrow 10:00 AM, return 3 days later 10:00 AM
  const getDefaultPickupDate = () => {
    if (initialStartDate) return initialStartDate.slice(0, 10);
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  const getDefaultReturnDate = () => {
    if (initialEndDate) return initialEndDate.slice(0, 10);
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().slice(0, 10);
  };

  const [city, setCity] = useState(initialCity);
  const [pickupDate, setPickupDate] = useState(getDefaultPickupDate());
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnDate, setReturnDate] = useState(getDefaultReturnDate());
  const [returnTime, setReturnTime] = useState('10:00');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const popularHubs = [
    { name: 'Delhi', region: 'DEL Airport & Aerocity Hub' },
    { name: 'Gurgaon', region: 'Cyber Hub & Golf Course Rd' },
    { name: 'Noida', region: 'Sector 62 & Expressway' },
    { name: 'Jaipur', region: 'MI Road & Airport Hub' },
    { name: 'Chandigarh', region: 'Sector 17 & Mohali Hub' },
  ];

  // Calculate duration in days
  const rentalDays = useMemo(() => {
    const start = new Date(`${pickupDate}T${pickupTime}:00`);
    const end = new Date(`${returnDate}T${returnTime}:00`);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 0) return 1;
    return Math.max(1, Math.ceil(diffHours / 24));
  }, [pickupDate, pickupTime, returnDate, returnTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startISO = new Date(`${pickupDate}T${pickupTime}:00`).toISOString();
    const returnISO = new Date(`${returnDate}T${returnTime}:00`).toISOString();

    if (onSearch) {
      onSearch({ city, startDate: startISO, endDate: returnISO });
    } else {
      const queryParams = new URLSearchParams();
      if (city.trim()) queryParams.set('city', city.trim());
      queryParams.set('startDate', startISO);
      queryParams.set('endDate', returnISO);
      navigate(`/explore?${queryParams.toString()}`);
    }
  };

  const setPreset = (type: 'weekend' | '3days' | 'week') => {
    const today = new Date();
    let start = new Date(today);
    let end = new Date(today);

    if (type === 'weekend') {
      const day = today.getDay();
      const daysUntilFriday = (5 - day + 7) % 7 || 7;
      start.setDate(today.getDate() + daysUntilFriday);
      end.setDate(start.getDate() + 2); // Friday to Sunday
    } else if (type === '3days') {
      start.setDate(today.getDate() + 1);
      end.setDate(start.getDate() + 3);
    } else if (type === 'week') {
      start.setDate(today.getDate() + 1);
      end.setDate(start.getDate() + 7);
    }

    setPickupDate(start.toISOString().slice(0, 10));
    setReturnDate(end.toISOString().slice(0, 10));
  };

  return (
    <div
      className={`bg-[#0D0D0E]/95 backdrop-blur-xl rounded-2xl md:rounded-full border border-neutral-800 shadow-2xl transition-all ${
        compact ? 'p-2.5' : 'p-3 sm:p-4'
      }`}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          {/* 1. Location / Hub Selector */}
          <div className="md:col-span-4 relative">
            <div
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="px-4 py-2.5 rounded-xl md:rounded-full bg-black/80 border border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5 w-full">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="w-full">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 block leading-none mb-1">
                    Pickup Hub
                  </span>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setShowCityDropdown(true);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Delhi, Gurgaon, Noida, Jaipur..."
                    className="w-full bg-transparent text-xs font-semibold text-white placeholder-neutral-500 focus:outline-none"
                  />
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors shrink-0 ml-1" />
            </div>

            {/* Hub Dropdown */}
            {showCityDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0D0D0E] border border-neutral-800 rounded-xl shadow-2xl z-50 py-1 divide-y divide-neutral-800">
                <div className="px-3.5 py-1.5 text-[9px] font-mono uppercase tracking-wider text-neutral-400 bg-black/60">
                  Select Hub Location
                </div>
                {popularHubs.map((h) => (
                  <button
                    key={h.name}
                    type="button"
                    onClick={() => {
                      setCity(h.name);
                      setShowCityDropdown(false);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-neutral-900 transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">{h.name}</span>
                      <span className="text-neutral-400 text-[10px] block">{h.region}</span>
                    </div>
                    {city.toLowerCase() === h.name.toLowerCase() && (
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Pickup Date & Time */}
          <div className="md:col-span-3 px-4 py-2 rounded-xl md:rounded-full bg-black/80 border border-neutral-800 hover:border-neutral-700 transition-colors">
            <span className="block text-[9px] font-mono uppercase tracking-wider text-neutral-400 mb-0.5 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-amber-400" />
              Pickup Date & Time
            </span>
            <div className="flex items-center space-x-1">
              <input
                type="date"
                value={pickupDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none tabular-nums"
              />
              <select
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="bg-[#0D0D0E] text-[10px] font-semibold text-neutral-300 rounded border border-neutral-800 px-1 py-0.5 focus:outline-none"
              >
                <option value="08:00">08:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="18:00">06:00 PM</option>
                <option value="21:00">09:00 PM</option>
              </select>
            </div>
          </div>

          {/* 3. Return Date & Time */}
          <div className="md:col-span-3 px-4 py-2 rounded-xl md:rounded-full bg-black/80 border border-neutral-800 hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-400" />
                Return Date & Time
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
                {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <input
                type="date"
                value={returnDate}
                min={pickupDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none tabular-nums"
              />
              <select
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className="bg-[#0D0D0E] text-[10px] font-semibold text-neutral-300 rounded border border-neutral-800 px-1 py-0.5 focus:outline-none"
              >
                <option value="08:00">08:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="18:00">06:00 PM</option>
                <option value="21:00">09:00 PM</option>
              </select>
            </div>
          </div>

          {/* 4. Search Button */}
          <div className="md:col-span-2 flex items-center justify-center">
            <button
              type="submit"
              className="w-full md:w-auto md:min-w-[120px] h-[46px] rounded-xl md:rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-card transition-all active:scale-[0.98] hover:scale-[1.02]"
            >
              <Search className="w-4 h-4 text-black" strokeWidth={2.5} />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Quick presets footer */}
        {!compact && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 pt-1 text-xs">
            <div className="flex items-center gap-1.5 text-neutral-400">
              <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">Presets:</span>
              <button
                type="button"
                onClick={() => setPreset('weekend')}
                className="px-2.5 py-0.5 rounded-full text-[10px] bg-black/80 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-colors"
              >
                This Weekend
              </button>
              <button
                type="button"
                onClick={() => setPreset('3days')}
                className="px-2.5 py-0.5 rounded-full text-[10px] bg-black/80 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-colors"
              >
                3-Day Trip
              </button>
              <button
                type="button"
                onClick={() => setPreset('week')}
                className="px-2.5 py-0.5 rounded-full text-[10px] bg-black/80 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-colors"
              >
                Full Week
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-neutral-500">
              <span>Direct Fleet Hosts</span>
              <span>•</span>
              <span>Zero Surge Multipliers</span>
              <span>•</span>
              <span>FASTag Equipped</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        drivio: {
          // Neutral System
          charcoal: '#0B0F14', // Main Background
          slate: '#1A222B',    // Secondary Background / Surface
          stone: '#36424D',    // Elevated card surface / Border
          ash: '#6B7783',      // Muted text / Subdued Border
          fog: '#D5DBE1',      // Secondary text
          ivory: '#FAF8F3',    // Primary text

          // Primary & Accent System
          teal: {
            DEFAULT: '#0E4A6B', // Deep Teal
            hover: '#0A3852',
            light: 'rgba(14, 74, 107, 0.25)',
          },
          ocean: {
            DEFAULT: '#2D7DA6', // Ocean Blue (Primary Accent)
            hover: '#246789',
            light: 'rgba(45, 125, 166, 0.2)',
          },
          cream: {
            DEFAULT: '#F6E7D7', // Warm Cream (Primary Button)
            hover: '#EAD5C1',
            text: '#0B0F14',
          },
          orange: {
            DEFAULT: '#E07A3F', // Sunset Orange (Secondary Accent)
            hover: '#CD682E',
            light: 'rgba(224, 122, 63, 0.2)',
          },
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Syne', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['Space Grotesk', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        hairline: '0 0 0 1px rgba(54, 66, 77, 0.45)',
        subtle: '0 2px 6px rgba(11, 15, 20, 0.6), 0 1px 3px rgba(11, 15, 20, 0.4)',
        card: '0 10px 24px -4px rgba(11, 15, 20, 0.7), 0 2px 8px -2px rgba(11, 15, 20, 0.5)',
        hover: '0 20px 36px -8px rgba(11, 15, 20, 0.8), 0 6px 16px -2px rgba(45, 125, 166, 0.15)',
        glow: '0 0 25px -4px rgba(45, 125, 166, 0.35)',
        orangeGlow: '0 0 25px -4px rgba(224, 122, 63, 0.35)',
      },
      borderRadius: {
        'drivio': '10px',
        'drivio-lg': '16px',
        'drivio-xl': '24px',
        'pill': '9999px',
      },
    },
  },
  plugins: [],
};

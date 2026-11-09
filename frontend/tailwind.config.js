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
          // Neutral System (True Jet Black)
          charcoal: '#000000', // Pitch Black Background
          slate: '#0D0D0E',    // Deep Surface
          stone: '#1E1E22',    // Elevated card surface / Border
          ash: '#71717A',      // Muted text
          fog: '#D4D4D8',      // Secondary text
          ivory: '#FFFFFF',    // Primary text

          // Primary & Accent System
          teal: {
            DEFAULT: '#18181B',
            hover: '#27272A',
            light: 'rgba(255, 255, 255, 0.08)',
          },
          ocean: {
            DEFAULT: '#FFFFFF',
            hover: '#E5E5E5',
            light: 'rgba(255, 255, 255, 0.15)',
          },
          cream: {
            DEFAULT: '#FFFFFF',
            hover: '#E5E5E5',
            text: '#000000',
          },
          orange: {
            DEFAULT: '#F59E0B',
            hover: '#D97706',
            light: 'rgba(245, 158, 11, 0.2)',
          },
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Syne', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['Space Grotesk', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        hairline: '0 0 0 1px rgba(255, 255, 255, 0.08)',
        subtle: '0 2px 6px rgba(0, 0, 0, 0.7), 0 1px 3px rgba(0, 0, 0, 0.5)',
        card: '0 10px 24px -4px rgba(0, 0, 0, 0.8), 0 2px 8px -2px rgba(0, 0, 0, 0.6)',
        hover: '0 20px 36px -8px rgba(0, 0, 0, 0.9), 0 6px 16px -2px rgba(255, 255, 255, 0.05)',
        glow: '0 0 25px -4px rgba(255, 255, 255, 0.15)',
        orangeGlow: '0 0 25px -4px rgba(245, 158, 11, 0.35)',
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

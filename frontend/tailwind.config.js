/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        drivio: {
          charcoal: '#000000',
          slate: '#0D0D0E',
          stone: '#1E1E22',
          ash: '#71717A',
          fog: '#D4D4D8',
          ivory: '#FFFFFF',
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
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'drivio': '10px',
        'drivio-lg': '16px',
        'drivio-xl': '24px',
        'pill': '9999px',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/container-queries"),
  ],
};

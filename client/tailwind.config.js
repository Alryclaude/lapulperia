/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary - Red theme (La Pulperia brand) - More vibrant
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#E53935',  // More vibrant red
          600: '#D32F2F',
          700: '#C62828',
          800: '#B71C1C',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Accent - Golden (brighter for better visibility)
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#FFB300',  // Brighter golden
          500: '#FFA000',
          600: '#FF8F00',
          700: '#FF6F00',
          800: '#E65100',
          900: '#BF360C',
        },
        // Golden for special highlights - Brighter
        gold: {
          DEFAULT: '#FFD700',
          light: '#FFEA00',
          dark: '#FFC107',
        },
        // Cream colors (from the house walls)
        cream: {
          50: '#FFFDF7',
          100: '#FEF7ED',
          200: '#FEF3C7',
          300: '#FDE68A',
          400: '#F5E6C8',
          500: '#E8D5B7',
        },
        // Brown colors (from the door)
        brown: {
          400: '#B45309',
          500: '#92400E',
          600: '#78350F',
          700: '#5C3D2E',
        },
        // Navy (from windows)
        navy: {
          400: '#2D4A6F',
          500: '#1E3A5F',
          600: '#1A2F4A',
        },
        // Dark theme background colors - Improved for better contrast
        dark: {
          DEFAULT: '#0D0B11',
          50: '#2D2A38',    // Lighter for borders, dividers
          100: '#221F2D',   // Cards elevated
          200: '#1A1722',   // Cards base
          300: '#14121A',   // Secondary background
          400: '#0D0B11',   // Primary background
          500: '#08070B',   // Deepest black
        },
        // Semantic colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // Status colors (for orders and pulperias)
        status: {
          open: '#22c55e',
          closing: '#f59e0b',
          closed: '#9ca3af',
          vacation: '#3b82f6',
          pending: '#f59e0b',
          accepted: '#3b82f6',
          preparing: '#8b5cf6',
          ready: '#22c55e',
          delivered: '#6b7280',
          cancelled: '#ef4444',
        },
        // Surface colors
        surface: {
          primary: '#ffffff',
          secondary: '#fafafa',
          elevated: '#ffffff',
          // Dark mode surfaces
          dark: '#1F1B2E',
          'dark-elevated': '#2A2735',
        },
        // shadcn/ui CSS variable colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        // Dark mode shadows
        'dark-sm': '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        // Glows
        'glow': '0 0 0 3px rgba(34, 197, 94, 0.15)',
        'glow-accent': '0 0 0 3px rgba(251, 191, 36, 0.15)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.3)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
        // Colored shadows
        'primary': '0 4px 14px 0 rgba(239, 68, 68, 0.3)',
        'success': '0 4px 14px 0 rgba(34, 197, 94, 0.3)',
        'accent': '0 4px 14px 0 rgba(245, 158, 11, 0.3)',
        'gold': '0 4px 14px 0 rgba(255, 215, 0, 0.3)',
        // Focus rings
        'ring-primary': '0 0 0 3px rgba(239, 68, 68, 0.2)',
        'ring-success': '0 0 0 3px rgba(34, 197, 94, 0.2)',
        'ring-accent': '0 0 0 3px rgba(245, 158, 11, 0.2)',
        'ring-gold': '0 0 0 3px rgba(255, 215, 0, 0.2)',
        // Card hover
        'card-hover': '0 8px 25px -5px rgba(0, 0, 0, 0.15), 0 0 10px rgba(239, 68, 68, 0.1)',
        'card-hover-dark': '0 8px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(239, 68, 68, 0.15)',
      },
      spacing: {
        // Semantic spacing for layout
        'header': '4rem',        // 64px - header height
        'bottom-nav': '4rem',    // 64px - bottom nav (h-16)
        'section': '2rem',       // 32px - section spacing
        'section-lg': '3rem',    // 48px - large section spacing
      },
      borderRadius: {
        'none': '0',
        'sm': '0.375rem',    // 6px - small elements
        'DEFAULT': '0.5rem', // 8px - default
        'md': '0.5rem',      // 8px - buttons, inputs
        'lg': '0.75rem',     // 12px - cards
        'xl': '1rem',        // 16px - large cards
        '2xl': '1.5rem',     // 24px - modals, sheets
        '3xl': '2rem',       // 32px - hero sections
        'full': '9999px',    // pills, avatars
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'confetti': 'confetti 0.5s ease-out forwards',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) rotate(720deg)', opacity: '0' },
        },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-expo': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

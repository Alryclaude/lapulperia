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
        // ========================================
        // PALETA "CONSTELACIÓN DE BARRIO" 2.0
        // ========================================

        // Primary - Rojo Vibrante (más saturado para dark mode)
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#FF6B6B',  // Hover
          500: '#FA5252',  // Principal
          600: '#F03E3E',  // Pressed
          700: '#DC2626',
          800: '#B91C1C',
          900: '#991B1B',
          950: '#7F1D1D',
        },

        // Accent - Dorado Miel (cálido y acogedor)
        accent: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',  // Principal
          500: '#F59E0B',  // Texto/iconos
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },

        // Surface - Fondos oscuros neutros (sin tinte púrpura)
        surface: {
          0: '#0F0F14',    // Background principal
          1: '#1A1A22',    // Cards base
          2: '#252530',    // Cards elevated / inputs
          3: '#32323E',    // Borders activos
          4: '#3F3F4D',    // Borders hover
        },

        // Dark theme (alias para compatibilidad)
        dark: {
          DEFAULT: '#0F0F14',
          50: '#3F3F4D',    // Borders
          100: '#32323E',   // Cards elevated
          200: '#252530',   // Cards base
          300: '#1A1A22',   // Secondary bg
          400: '#0F0F14',   // Primary bg
          500: '#09090D',   // Deepest
        },

        // Categorías del mapa (vibrantes para visibilidad)
        category: {
          food: '#F59E0B',      // Comida - Ámbar
          market: '#22D3EE',    // Mercado - Cyan
          services: '#818CF8',  // Servicios - Indigo
          offer: '#F472B6',     // Ofertas - Rosa
        },

        // Colores vibrantes para acentos
        cyan: {
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
        },
        purple: {
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        indigo: {
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
        },
        pink: {
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
        },

        // Estados semánticos
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        info: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },

        // Status colors para pulperías y órdenes
        status: {
          open: '#22C55E',
          closing: '#F59E0B',
          closed: '#6B7280',
          vacation: '#3B82F6',
          pending: '#F59E0B',
          accepted: '#3B82F6',
          preparing: '#8B5CF6',
          ready: '#22C55E',
          delivered: '#6B7280',
          cancelled: '#EF4444',
        },

        // Colores de barrio (legacy)
        barrio: {
          hueso: '#F4F1EA',
          pizarra: '#2C3E50',
          arcilla: '#FA5252',
          oxido: '#F03E3E',
          frescura: '#22C55E',
        },

        // shadcn/ui CSS variables
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
        // Base shadows
        'xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

        // Dark mode shadows
        'dark-sm': '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',

        // Glow effects - Constelación
        'glow-primary': '0 0 20px rgba(250, 82, 82, 0.4), 0 0 40px rgba(250, 82, 82, 0.2)',
        'glow-primary-lg': '0 0 30px rgba(250, 82, 82, 0.5), 0 0 60px rgba(250, 82, 82, 0.25)',
        'glow-accent': '0 0 20px rgba(251, 191, 36, 0.4), 0 0 40px rgba(251, 191, 36, 0.2)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)',
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.4), 0 0 40px rgba(34, 211, 238, 0.2)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)',
        'glow-pink': '0 0 20px rgba(244, 114, 182, 0.4), 0 0 40px rgba(244, 114, 182, 0.2)',

        // Status glows (para cards abiertas/cerradas)
        'glow-open': '0 0 20px rgba(34, 197, 94, 0.3), 0 0 40px rgba(34, 197, 94, 0.15)',
        'glow-closing': '0 0 20px rgba(245, 158, 11, 0.3), 0 0 40px rgba(245, 158, 11, 0.15)',

        // Button shadows con color
        'btn-primary': '0 4px 14px rgba(250, 82, 82, 0.4)',
        'btn-primary-hover': '0 6px 20px rgba(250, 82, 82, 0.5)',
        'btn-success': '0 4px 14px rgba(34, 197, 94, 0.4)',
        'btn-accent': '0 4px 14px rgba(251, 191, 36, 0.4)',

        // Card hovers
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(250, 82, 82, 0.1)',
        'card-glow-open': '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(34, 197, 94, 0.15)',

        // Focus rings
        'ring-primary': '0 0 0 3px rgba(250, 82, 82, 0.25)',
        'ring-success': '0 0 0 3px rgba(34, 197, 94, 0.25)',
        'ring-accent': '0 0 0 3px rgba(251, 191, 36, 0.25)',
      },

      spacing: {
        'header': '4rem',
        'bottom-nav': '4rem',
        'section': '2rem',
        'section-lg': '3rem',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
      },

      borderRadius: {
        'none': '0',
        'sm': '0.375rem',
        'DEFAULT': '0.5rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'twinkle-delay': 'twinkle 3s ease-in-out 1.5s infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
        'star-pulse': 'starPulse 2s ease-in-out infinite',
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
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.6), 0 0 30px rgba(34, 197, 94, 0.3)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.9' },
        },
        starPulse: {
          '0%, 100%': {
            boxShadow: '0 0 4px rgba(250, 82, 82, 0.4)',
            transform: 'scale(1)',
          },
          '50%': {
            boxShadow: '0 0 12px rgba(250, 82, 82, 0.6), 0 0 20px rgba(250, 82, 82, 0.3)',
            transform: 'scale(1.05)',
          },
        },
      },

      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-expo': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

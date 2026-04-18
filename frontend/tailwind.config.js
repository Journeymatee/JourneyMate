/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      '2xs': '360px',   // small Android phones
      xs:   '400px',    // iPhone SE / medium Android
      sm:   '640px',    // large phones / small tablets
      md:   '768px',    // tablets
      lg:   '1024px',   // small laptops / iPad Pro
      xl:   '1280px',   // desktops
      '2xl':'1536px',   // wide screens
    },
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        silver: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0',
          400: '#4ade80', 500: '#22c55e', 600: '#16a34a',
          700: '#15803d', 900: '#14532d',
        },
        gold: {
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706',
          700: '#b45309', 900: '#78350f',
        },
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
      },
      minHeight: {
        screen: ['100vh', '100dvh'],
      },
      animation: {
        'float':      'float 3s ease-in-out infinite',
        'slide-up':   'slideUp 0.5s ease-out',
        'fade-in':    'fadeIn 0.7s ease-out',
        'shimmer':    'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-sm':  'bounceSm 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        bounceSm: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-3px)' },
        },
      },
      backdropBlur: { xs: '2px' },
      fontSize: {
        'fluid-xs':  ['clamp(0.7rem, 2vw, 0.75rem)',   { lineHeight: '1.4' }],
        'fluid-sm':  ['clamp(0.8rem, 2.5vw, 0.875rem)',{ lineHeight: '1.5' }],
        'fluid-base':['clamp(0.875rem,3vw,1rem)',       { lineHeight: '1.6' }],
        'fluid-lg':  ['clamp(1rem,3.5vw,1.125rem)',     { lineHeight: '1.5' }],
        'fluid-xl':  ['clamp(1.1rem,4vw,1.25rem)',      { lineHeight: '1.4' }],
        'fluid-2xl': ['clamp(1.25rem,5vw,1.5rem)',      { lineHeight: '1.3' }],
        'fluid-3xl': ['clamp(1.5rem,6vw,1.875rem)',     { lineHeight: '1.2' }],
        'fluid-4xl': ['clamp(1.75rem,7vw,2.25rem)',     { lineHeight: '1.1' }],
        'fluid-5xl': ['clamp(2rem,8vw,3rem)',            { lineHeight: '1.05' }],
        'fluid-6xl': ['clamp(2.25rem,9vw,3.75rem)',     { lineHeight: '1.02' }],
        'fluid-7xl': ['clamp(2.5rem,10vw,4.5rem)',      { lineHeight: '1.0' }],
      },
    },
  },
  plugins: [],
}

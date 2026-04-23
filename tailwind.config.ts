/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Anime dark theme base
        navy: {
          50:  '#eef2ff',
          100: '#dbe4ff',
          200: '#bac8ff',
          300: '#91a7ff',
          400: '#748ffc',
          500: '#5c7cfa',
          600: '#4c6ef5',
          700: '#1a1f3d',
          800: '#111633',
          900: '#0d1129',
          950: '#0a0e27',
        },
        // Brand colors
        primary: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Anime accents
        neon: {
          blue:    '#3b82f6',
          cyan:    '#06b6d4',
          magenta: '#ec4899',
          purple:  '#8b5cf6',
          orange:  '#f97316',
          green:   '#10b981',
          red:     '#ef4444',
          yellow:  '#eab308',
        },
        // Light mode warm palette
        cream: {
          50:  '#fefdfb',
          100: '#faf7f2',
          200: '#f5efe5',
          300: '#ede4d3',
        },
        // Pokémon type colors
        type: {
          fire:     '#F08030',
          water:    '#6890F0',
          grass:    '#78C850',
          electric: '#F8D030',
          ice:      '#98D8D8',
          fighting: '#C03028',
          poison:   '#A040A0',
          ground:   '#E0C068',
          flying:   '#A890F0',
          psychic:  '#F85888',
          bug:      '#A8B820',
          rock:     '#B8A038',
          ghost:    '#705898',
          dragon:   '#7038F8',
          dark:     '#705848',
          steel:    '#B8B8D0',
          fairy:    '#EE99AC',
          normal:   '#A8A878',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs:   ['0.75rem', { lineHeight: '1rem' }],
        sm:   ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg:   ['1.125rem', { lineHeight: '1.75rem' }],
        xl:   ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
      },
      borderRadius: {
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        sm:   '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md:   '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg:   '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl:   '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        // Glow shadows
        'glow-blue':    '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.2)',
        'glow-cyan':    '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.2)',
        'glow-magenta': '0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.2)',
        'glow-purple':  '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.2)',
        'glow-red':     '0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.2)',
        'glow-sm':      '0 0 10px rgba(59, 130, 246, 0.3)',
        'glow-lg':      '0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.15)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.2, 0.6, 0.2, 1)',
        snappy: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      animation: {
        'float':         'float 6s ease-in-out infinite',
        'float-slow':    'float 8s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'glow-pulse':    'glowPulse 2s ease-in-out infinite',
        'gradient-shift':'gradientShift 8s ease infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'slide-up':      'slideUp 0.5s cubic-bezier(0.2, 0.6, 0.2, 1)',
        'slide-down':    'slideDown 0.3s cubic-bezier(0.2, 0.6, 0.2, 1)',
        'scale-in':      'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spin-slow':     'spin 3s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'sparkle':       'sparkle 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%':      { opacity: '1', transform: 'scale(1) rotate(180deg)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

module.exports = config;

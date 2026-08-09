/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Neumorphic base surface - everything is built from tints/shades of this.
        base: {
          light: '#e8ecf3',
          DEFAULT: '#e8ecf3',
          dark: '#1f2430',
        },
        surface: {
          dark: '#242a38',
        },
        accent: {
          50: '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        danger: '#ef4444',
        success: '#22c55e',
      },
      boxShadow: {
        // Light theme neumorphism (raised)
        neu: '8px 8px 16px #c5c9d1, -8px -8px 16px #ffffff',
        'neu-sm': '4px 4px 8px #c5c9d1, -4px -4px 8px #ffffff',
        'neu-inset': 'inset 6px 6px 12px #c5c9d1, inset -6px -6px 12px #ffffff',
        'neu-pressed': 'inset 4px 4px 8px #c5c9d1, inset -4px -4px 8px #ffffff',
        // Dark theme neumorphism
        'neu-dark': '8px 8px 16px #171b24, -8px -8px 16px #2d3444',
        'neu-dark-sm': '4px 4px 8px #171b24, -4px -4px 8px #2d3444',
        'neu-dark-inset': 'inset 6px 6px 12px #171b24, inset -6px -6px 12px #2d3444',
        'neu-dark-pressed': 'inset 4px 4px 8px #171b24, inset -4px -4px 8px #2d3444',
      },
      borderRadius: {
        neu: '1.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

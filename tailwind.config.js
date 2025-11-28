/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple Dark Mode Colors
        apple: {
          bg: '#000000',
          'bg-elevated': '#1C1C1E',
          'bg-secondary': '#2C2C2E',
          'bg-tertiary': '#3A3A3C',
          'fill': '#787880',
          'fill-secondary': '#636366',
          'separator': '#38383A',
          'label': '#FFFFFF',
          'label-secondary': '#EBEBF5',
          'label-tertiary': '#EBEBF599',
          'label-quaternary': '#EBEBF54D',
          // Accent Colors
          blue: '#0A84FF',
          green: '#30D158',
          red: '#FF453A',
          orange: '#FF9F0A',
          yellow: '#FFD60A',
          purple: '#BF5AF2',
          pink: '#FF375F',
          teal: '#64D2FF',
          // UI Colors
          'gray-1': '#8E8E93',
          'gray-2': '#636366',
          'gray-3': '#48484A',
          'gray-4': '#3A3A3C',
          'gray-5': '#2C2C2E',
          'gray-6': '#1C1C1E',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        'apple': '10px',
        'apple-lg': '12px',
        'apple-xl': '16px',
        'apple-2xl': '20px',
      },
      boxShadow: {
        'apple-sm': '0 1px 3px rgba(0, 0, 0, 0.3)',
        'apple': '0 4px 12px rgba(0, 0, 0, 0.25)',
        'apple-lg': '0 8px 24px rgba(0, 0, 0, 0.3)',
        'apple-xl': '0 12px 40px rgba(0, 0, 0, 0.35)',
        'apple-glow': '0 0 20px rgba(10, 132, 255, 0.3)',
      },
      backdropBlur: {
        'apple': '20px',
        'apple-lg': '40px',
      },
      animation: {
        'apple-bounce': 'appleBounce 0.3s ease-out',
        'apple-fade': 'appleFade 0.2s ease-out',
      },
      keyframes: {
        appleBounce: {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
        appleFade: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

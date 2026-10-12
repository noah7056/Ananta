/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'sans-serif',
        ],
      },
      colors: {
        // Warm off-white page, white surfaces, light gray fills
        paper: '#F7F5F0',
        wash: '#EFECE3',
        line: '#E2DDCF',
        // Muted charcoal ink in three weights
        ink: {
          DEFAULT: '#2E2C27',
          dim: '#6F6A5D',
          faint: '#A9A394',
        },
        // The single accent: deep sage, used sparingly
        accent: {
          DEFAULT: '#4A6B5A',
          dark: '#3C5849',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.45s ease-out both',
        'rise': 'rise 0.5s ease-out both',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

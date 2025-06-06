/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          500: '#2979ff',
          600: '#1e88e5',
          700: '#1976d2',
        },
        semantic: {
          critical: '#d32f2f',
          high: '#ffa000',
          moderate: '#ffc107',
          low: '#388e3c',
        }
      }
    },
  },
  plugins: [],
};
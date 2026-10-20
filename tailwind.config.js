/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uzum: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          primary: '#7000FF',
          hover: '#5e00d9',
          dark: '#4c00b0',
          accent: '#FF0055',
          gold: '#FFB800',
        },
        nasiya: {
          bg: '#7000FF',
          badge: '#FFEFD5',
          text: '#8B4513',
          yellow: '#FFDD00',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 25px -5px rgba(112, 0, 255, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        dropdown: '0 12px 32px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}

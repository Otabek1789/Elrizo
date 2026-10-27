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
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7000FF',
          700: '#5e00d9',
          800: '#4c00b0',
          900: '#3c008c',
          950: '#26005c',
        },
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
        },
        // Deep Obsidian & OLED Black Theme (zero blue wash, luxury dark aesthetic)
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#1F222E', // Subtle obsidian border & controls
          750: '#181A23',
          800: '#111319', // Luxury obsidian card & surface
          850: '#0E1015',
          900: '#08090C', // Deep obsidian elevated header & surfaces
          950: '#050608', // OLED obsidian pitch black root
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

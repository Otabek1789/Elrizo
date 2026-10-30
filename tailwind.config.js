/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
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
        // Uzum-style Violet-tinted Dark Theme ("sal siyohrang sifat" comfort aesthetic)
        slate: {
          50: '#FAF9FD',
          100: '#F2F0F9',
          200: '#E6E1F4',
          300: '#CBC2E5',
          400: '#A89CC8',
          500: '#7869A6',
          600: '#4D3E7B',
          700: '#382E59', // Clean violet dark border & divider
          750: '#2A2244', // Input & elevated surfaces
          800: '#201A35', // Uzum dark card & modal surface
          850: '#19142A', // Sub-navs & search container
          900: '#141021', // Uzum violet night root background
          950: '#0E0B17', // Deep contrast backdrop
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

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
        // Uzum.uz uslubidagi yoqimli yumshoq siyohrang tungi rejim (QORA EMAS, ko'zni charchatmaydigan binafsharang)
        slate: {
          50: '#FAF8FD',
          100: '#F2EEFA',
          200: '#E5DEF7',
          300: '#C8BDE8',
          400: '#A898D7',
          500: '#7E69BD',
          600: '#614F9D',
          700: '#4B3D7D', // Yumshoq binafsha hoshiya va ajratgich
          750: '#372D5E', // Input va ko'tarilgan elementlar
          800: '#2B234B', // Karta va modal fonlari (qora emas, to'q siyohrang)
          850: '#251F41', // Qidiruv va sub-header fonlari
          900: '#1F1A36', // Asosiy sayt foni (qora emas, yoqimli uzum siyohrang)
          950: '#171329', // Chuqur orqa fon
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

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        botanical: {
          DEFAULT: '#064E3B', // Primary Botanical Green
          secondary: '#166534', // Secondary Green
          dark: '#033B2B', // Dark Green
          light: '#E8F0E2', // Light Green
          subtle: '#CDE1C4',
        },
        cream: {
          DEFAULT: '#F8F5E9', // Main Cream Background
          light: '#FAF7ED',
          card: '#FBF9F0',
          dark: '#EFE9D7',
          border: '#E2DBCA',
        },
        accent: {
          gold: '#D6A83F', // Accent Gold
          warm: '#E29A26',
        },
        text: {
          main: '#173D2E', // Main Text
          muted: '#526E62',
          light: '#7D968B',
        },
        brand: {
          forest: '#064E3B',
          deep: '#033B2B',
          mint: '#E8F0E2',
          emerald: '#166534',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        tamil: ['"Mukta Malar"', '"Noto Sans Tamil"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(6, 78, 59, 0.08)',
        card: '0 8px 30px rgba(23, 61, 46, 0.06)',
        hover: '0 12px 35px rgba(6, 78, 59, 0.12)',
        phone: '0 25px 60px -15px rgba(3, 59, 43, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

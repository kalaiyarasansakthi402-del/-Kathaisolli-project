/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          forest: '#064E3B',
          secondary: '#166534',
          dark: '#033B2B',
          deep: '#022C22',
          cream: '#F8F5E9',
          lightGreen: '#E8F0E2',
          gold: '#D6A83F',
          text: '#173D2E',
          mint: '#A7F3D0',
          emerald: '#10B981',
          bgLight: '#F8F5E9',
          bgDark: '#033B2B',
          cardDark: '#083325',
          borderDark: '#124835',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Lora', 'Georgia', 'serif'],
        heading: ['"Playfair Display"', 'Lora', 'serif'],
        tamil: ['"Mukta Malar"', '"Noto Sans Tamil"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

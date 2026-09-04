/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tvs: {
          navy: '#0B1E36',
          dark: '#071322',
          blue: '#1E40AF',
          lightBlue: '#3B82F6',
          accent: '#E11D48',
          gold: '#D97706',
          card: '#10243E',
          cardBorder: '#1F385C'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

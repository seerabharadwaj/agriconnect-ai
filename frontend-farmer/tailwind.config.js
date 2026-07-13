/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B4513',
        accent: '#FF6B00',
        success: '#2E7D32',
        surface: '#FFF8F0',
      },
    },
  },
  plugins: [],
}

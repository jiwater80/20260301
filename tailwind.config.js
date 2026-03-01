/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1e3a5f', light: '#2d5a8a' },
        accent: { DEFAULT: '#c41e3a', light: '#e84545' },
      },
    },
  },
  plugins: [],
}

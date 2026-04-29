/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom brand colors
        tesla: '#CC0000',
        byd: '#E4062B',
        volkswagen: '#0B3153',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 定义一些具有“交易感”的颜色
        terminal: '#0A0A0A',
        brand: '#3B82F6',
      }
    },
  },
  plugins: [],
}
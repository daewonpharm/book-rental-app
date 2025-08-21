/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  // darkMode 설정 라인은 제거(기본: media 동작)
  theme: { extend: {} },
  plugins: []
};

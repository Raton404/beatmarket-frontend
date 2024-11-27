/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores personalizados más suaves
        primary: {
          100: '#f0f7ff',
          200: '#e0f0ff',
          300: '#bae0ff',
          400: '#7cc5ff',
          500: '#3ba1ff',
          600: '#2389e6',
          700: '#1a6dbd',
        },
        secondary: {
          100: '#f5f0ff',
          200: '#ede0ff',
          300: '#d4bfff',
          400: '#b69aff',
          500: '#9775ff',
          600: '#7b5ce6',
          700: '#6247bd',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
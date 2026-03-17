/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: { 0: '#0e0e10', 1: '#16161a', 2: '#1e1e22', 3: '#26262c', 4: '#2e2e36' },
        tx: { 0: '#f0f0f2', 1: '#c0c0c8', 2: '#8a8a96', 3: '#5a5a66' },
        acc: { DEFAULT: '#569cd6', 2: '#4ec9b0', 3: '#ce9178', 4: '#c586c0', 5: '#dcdcaa' },
      },
      fontFamily: { sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'] },
    },
  },
  plugins: [],
};

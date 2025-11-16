/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#F5F5F5',
          DEFAULT: '#0078D4',
          dark: '#0066B2',
        },
        accent: {
          yellow: '#FFC107',
        },
        cian: {
          blue: '#0078D4',
          darkBlue: '#0066B2',
          gray: '#F5F5F5',
        },
      },
    },
  },
  plugins: [],
}


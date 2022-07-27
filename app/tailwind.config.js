const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme: {
          primary: '#F66C5E',
          accent: '#4F46E5',
          background: {
            DEFAULT: '#1F2937',
            light: '#394150',
            dark: '#111827'
          },
          font: {
            DEFAULT: '#FFFFFF',
            gray: {
              DEFAULT: '#9CA3AF',
              light: '#E5E7EB',
              dark: '#6B7280'
            }
          }
        }
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio')
  ]
};

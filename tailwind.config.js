/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF8F5',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#111418',
          secondary: '#5B6470',
          tertiary: '#8B929B',
        },
        jade: {
          DEFAULT: '#0F5257',
          wash: '#E8F0EE',
        },
        hairline: '#E8E4DC',
      },
      fontFamily: {
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(17,20,24,0.04), 0 8px 24px rgba(17,20,24,0.06)',
      },
      transitionDuration: {
        hover: '180ms',
        modal: '240ms',
      },
      maxWidth: {
        container: '1140px',
      },
    },
  },
  plugins: [],
};

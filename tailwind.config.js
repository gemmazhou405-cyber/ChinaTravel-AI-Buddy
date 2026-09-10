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
          dark: '#0B4145',
        },
        hairline: '#E8E4DC',
        tint: {
          blue: '#EDF2F5',
          bluelabel: '#DEE8EE',
          cream: '#F7F1E5',
          creamlabel: '#EFE4CC',
          red: '#F9EFED',
          redlabel: '#F2DFDB',
        },
      },
      fontFamily: {
        // DESIGN.md: display face is Fraunces (serif). Was regressed to Inter in 46b7da6.
        display: ['"Fraunces Variable"', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(17,20,24,0.04), 0 8px 24px rgba(17,20,24,0.06)',
        // Single large-and-soft elevation used across raised surfaces.
        soft: '0 18px 44px -14px rgba(17,20,24,0.12)',
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

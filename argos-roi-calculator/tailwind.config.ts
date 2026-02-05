import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pfeiffer: {
          red: '#CC0000',
          'red-dark': '#A50000',
        },
        roi: {
          negative: '#CC0000',
          warning: '#FF8C00',
          positive: '#28A745',
        },
        surface: {
          canvas: '#F1F2F2',
          card: '#FFFFFF',
          alternate: '#E7E6E6',
        },
      },
      fontSize: {
        hero: ['40px', { lineHeight: '1.2' }],
        heading: ['24px', { lineHeight: '1.3' }],
        label: ['18px', { lineHeight: '1.5' }],
        body: ['16px', { lineHeight: '1.6' }],
      },
      screens: {
        tablet: '1200px',
        desktop: '1440px',
        wide: '1920px',
      },
    },
  },
  plugins: [],
} satisfies Config;

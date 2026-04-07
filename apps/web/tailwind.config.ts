import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary':     '#09090A',
        'bg-secondary':   '#0F0E0B',
        'accent':         '#C9A84C',
        'accent-light':   '#E4C87A',
        'accent-dark':    '#8A6E2F',
        'text-primary':   '#F5EFE2',
        'text-muted':     '#7C7060',
        'text-secondary': '#B5A88A',
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        ui:      ['var(--font-syne)',      'sans-serif'],
        sans:    ['var(--font-dm-sans)',   'system-ui', 'sans-serif'],
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};

export default config;

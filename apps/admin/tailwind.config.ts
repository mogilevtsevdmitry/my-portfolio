import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0B1F1A',
        'bg-secondary': '#0F2A24',
        'accent': '#4ADE80',
        'text-primary': '#F0FDF4',
        'text-muted': '#86EFAC',
      },
    },
  },
  plugins: [],
};

export default config;

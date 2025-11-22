import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx,js,jsx,html}',
    './src/apps/studio/index.html',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;


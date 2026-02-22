const config = require('@super-prismora/config/tailwind.config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...config,
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../apps/web/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'taven-dark': {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a25',
          600: '#222230',
          500: '#2a2a3b',
        },
        'taven-gold': {
          500: '#d4a843',
          400: '#e0b850',
          300: '#ecc85d',
        },
        'taven-blue': {
          500: '#3b82f6',
          400: '#60a5fa',
          300: '#93c5fd',
        },
      },
    },
  },
  plugins: [],
}
export default config

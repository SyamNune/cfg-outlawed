/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Minimalist Corporate: Charcoal & Slate Gray
        charcoal: {
          50: '#f4f6f8',
          100: '#e9edf2',
          200: '#cbd5e1',
          300: '#a0adbd',
          400: '#738294',
          500: '#505d6e',
          600: '#38424f',
          700: '#272e37',
          800: '#1c2127',
          900: '#15191e',
          950: '#0e1115',
        },
        // Minimalist Corporate: Warm Taupe & Sand
        taupe: {
          50: '#faf8f5',
          100: '#f5f1ec',
          200: '#ebe4dc',
          300: '#d8ccbf',
          400: '#bcaa9c',
          500: '#9b8778',
          600: '#78685c',
          700: '#564a41',
          800: '#3e352e',
          900: '#2c2520',
          950: '#1c1714',
        },
        sand: {
          50: '#fdfcfb',
          100: '#f7f4ef',
          200: '#eee7dd',
          300: '#dfd5c9',
          400: '#c4b3a2',
          500: '#a38f7d',
          600: '#7a6a5b',
          700: '#54483e',
          800: '#362e27',
          900: '#211c18',
          950: '#14110e',
        },
        // Core Primary mapping to Editorial Charcoal & Slate
        primary: {
          50: '#f7f5f2',
          100: '#eee7de',
          200: '#ded2c3',
          300: '#c5b49f',
          400: '#9b8872',
          500: '#6e5f4e',
          600: '#483f34',
          700: '#2d2822',
          800: '#1f1b17',
          900: '#15191e', // Editorial Charcoal
          950: '#0e1115',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'corporate': '0 1px 3px 0 rgba(28, 33, 39, 0.05), 0 1px 2px -1px rgba(28, 33, 39, 0.05)',
        'corporate-md': '0 4px 6px -1px rgba(28, 33, 39, 0.07), 0 2px 4px -2px rgba(28, 33, 39, 0.05)',
        'corporate-lg': '0 10px 15px -3px rgba(28, 33, 39, 0.08), 0 4px 6px -4px rgba(28, 33, 39, 0.04)',
      },
    },
  },
  plugins: [],
}

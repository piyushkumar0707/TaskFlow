/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3525cd',
        'primary-container': '#4f46e5',
        'on-primary': '#ffffff',
        'surface': '#fcf8ff',
        'surface-container': '#f0ecf9',
        'surface-container-low': '#f5f2ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-high': '#eae6f4',
        'on-surface': '#1b1b24',
        'on-surface-variant': '#464555',
        'outline': '#777587',
        'outline-variant': '#c7c4d8',
        'secondary': '#712ae2',
        'secondary-container': '#8a4cfc',
        'error': '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

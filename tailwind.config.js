/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {
      colors: {
        cream: '#fdfbf0',
        'cream-soft': '#f5f1e4',
        brown: '#1e1616',
        'brown-soft': '#3a2e2e',
        accent: '#6f8674'
      },
      fontFamily: {
        fat: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
        sans: ['Poppins', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 12px 32px rgba(30, 22, 22, 0.12)'
      }
    }
  },
  plugins: []
}

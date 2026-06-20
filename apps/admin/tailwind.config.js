export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'max-2xl': { max: '1535px' },
        'max-xl': { max: '1279px' },
        'max-lg': { max: '1023px' },
        'max-md': { max: '767px' },
        'max-sm': { max: '639px' },
        'max-xs': { max: '479px' }
      }
    }
  },
  plugins: [],
  // Prevent Tailwind from conflicting with Ant Design styles
  corePlugins: {
    preflight: false
  }
}

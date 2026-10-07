/** @type {import('tailwindcss').Config} */
const c = (name) => `hsl(var(--${name}) / <alpha-value>)`;

module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)']
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        chart: {
          '1': c('chart-1'),
          '2': c('chart-2'),
          '3': c('chart-3'),
          '4': c('chart-4'),
          '5': c('chart-5')
        },
        sidebar: {
          DEFAULT: c('sidebar-background'),
          foreground: c('sidebar-foreground'),
          primary: c('sidebar-primary'),
          'primary-foreground': c('sidebar-primary-foreground'),
          accent: c('sidebar-accent'),
          'accent-foreground': c('sidebar-accent-foreground'),
          border: c('sidebar-border'),
          ring: c('sidebar-ring')
        }
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 3s ease-in-out infinite',
      }
    }
  },
  plugins: [],
}

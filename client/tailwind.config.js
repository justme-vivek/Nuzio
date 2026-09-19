/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        card: 'var(--card)',
        card2: 'var(--card-2)',
        line: 'var(--line)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        primary: 'var(--primary)',
        primary2: 'var(--primary-2)',
        accent: 'var(--accent)',
        mint: 'var(--mint)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 44px 0 rgba(124, 92, 252, 0.5)',
        'glow-sm': '0 0 22px 0 rgba(124, 92, 252, 0.35)',
        card: '0 10px 34px rgba(0, 0, 0, 0.35)',
      },
      keyframes: {
        eq: {
          '0%, 100%': { transform: 'scaleY(0.35)' },
          '50%': { transform: 'scaleY(1)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        eq: 'eq 1s ease-in-out infinite',
        'eq-2': 'eq 1s ease-in-out 0.2s infinite',
        'eq-3': 'eq 1s ease-in-out 0.4s infinite',
        floaty: 'floaty 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Professional Theme Colors
        pro: {
          bg: '#f8fafc',
          surface: '#ffffff',
          'surface-subtle': '#f1f5f9',
          border: '#e2e8f0',
          'border-subtle': '#cbd5e1',
          text: '#0f172a',
          'text-muted': '#64748b',
          'text-dim': '#94a3b8',
          accent: '#2563eb',
          'accent-hover': '#1d4ed8',
          'accent-subtle': '#eff6ff',
        },
        // Hacker Theme Colors
        hacker: {
          bg: '#0a0e14',
          surface: '#0f141c',
          'surface-subtle': '#161d28',
          border: '#1f2937',
          'border-subtle': '#2d3748',
          text: '#e2e8f0',
          'text-muted': '#94a3b8',
          'text-dim': '#475569',
          accent: '#00f0ff',
          'accent-hover': '#38bdf8',
          'accent-subtle': 'rgba(0, 240, 255, 0.08)',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}

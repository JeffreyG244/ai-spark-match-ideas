/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        love: {
          primary: 'hsl(var(--love-primary))',
          'primary-glow': 'hsl(var(--love-primary-glow))',
          secondary: 'hsl(var(--love-secondary))',
          accent: 'hsl(var(--love-accent))',
          background: 'hsl(var(--love-background))',
          surface: 'hsl(var(--love-surface))',
          card: 'hsl(var(--love-card))',
          border: 'hsl(var(--love-border))',
          text: 'hsl(var(--love-text))',
          'text-light': 'hsl(var(--love-text-light))',
          'text-muted': 'hsl(var(--love-text-muted))',
          success: 'hsl(var(--love-success))',
          warning: 'hsl(var(--love-warning))',
          error: 'hsl(var(--love-error))',
        },
      },
      backgroundImage: {
        'love-gradient': 'var(--love-gradient-primary)',
        'love-gradient-accent': 'var(--love-gradient-accent)',
        'love-gradient-subtle': 'var(--love-gradient-subtle)',
      },
      boxShadow: {
        'love-glow': 'var(--love-shadow-glow)',
        'love-elegant': 'var(--love-shadow-elegant)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
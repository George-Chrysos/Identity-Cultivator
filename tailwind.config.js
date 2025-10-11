/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      fontFamily: {
        // Primary Title Font - Orbitron (futuristic, geometric)
        title: ['Orbitron', 'sans-serif'],
        // Body/UI Font - Exo 2 (sci-fi sans-serif with warmth)
        body: ['Exo 2', 'system-ui', 'sans-serif'],
        // Accent/Special Font - Cinzel Decorative (arcane, ancient)
        accent: ['Cinzel Decorative', 'serif'],
      },
      colors: {
        // Dark futuristic theme
        dark: {
          bg: '#0B0B1A',
          surface: '#1A1A2E',
          card: '#16213E',
          border: '#2A2F5F',
        },
        primary: {
          50: '#f0f0ff',
          100: '#e0e0ff',
          200: '#c7c7ff',
          300: '#a3a3ff',
          400: '#8080ff',
          500: '#6366f1',
          600: '#5048e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Violet/Purple theme
        violet: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Cyan glowing accents
        cyan: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        evolution: {
          novice: '#64748b',
          apprentice: '#10b981',
          expert: '#f59e0b',
          master: '#8b5cf6',
          legend: '#ef4444',
        }
      },
      animation: {
        'level-up': 'levelUp 0.6s ease-in-out',
        'xp-gain': 'xpGain 0.4s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-glow': 'pulseGlow 1.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        levelUp: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        xpGain: {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(-20px)', opacity: '0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #06b6d4, 0 0 10px #06b6d4, 0 0 15px #06b6d4' },
          '100%': { boxShadow: '0 0 10px #06b6d4, 0 0 20px #06b6d4, 0 0 30px #06b6d4' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px #a855f7, 0 0 10px #a855f7' },
          '50%': { boxShadow: '0 0 20px #a855f7, 0 0 30px #a855f7, 0 0 40px #a855f7' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glow': '0 0 15px rgba(6, 182, 212, 0.5)',
        'glow-lg': '0 0 25px rgba(6, 182, 212, 0.6)',
        'violet-glow': '0 0 15px rgba(168, 85, 247, 0.5)',
        'violet-glow-lg': '0 0 25px rgba(168, 85, 247, 0.6)',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
        heading: ['var(--font-zalando)', 'sans-serif'],
      },
      colors: {
        // Couleurs pour le site public (anciennes)
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#db2777', // Couleur principale exacte (site public)
          600: '#be185d',
          700: '#9f1239',
          800: '#831843',
          900: '#701a3e',
        },
        // Couleurs Dashboard selon manifeste
        dashboard: {
          primary: '#ca3b76', // Couleur principale (accent)
          text: {
            main: '#2C2C2C', // Texte principal (noir clair)
            secondary: '#555555', // Texte secondaire
            light: '#8A8A8A', // Texte gris clair (placeholder, sous-titres)
          },
          bg: {
            main: '#FFFFFF', // Background général
            secondary: '#F8F9FB', // Background secondaire (cards, blocs)
          },
          border: '#E6E6E6', // Bordures & séparateurs
          success: '#16A34A', // Couleur succès (stats en hausse)
          alert: '#DC2626', // Couleur alerte (stats en baisse)
          info: '#2563EB', // Couleur info (neutre/statistiques)
          hover: '#F1F1F1', // Gris hover
        },
      },
      boxShadow: {
        'card': '0px 2px 10px rgba(0,0,0,0.06)',
        'button-hover': '0px 4px 12px rgba(0,0,0,0.10)',
        'modal': '0px 8px 20px rgba(0,0,0,0.20)',
      },
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette « Bright Playful » : canevas clair, violet + citron vert.
        page: '#F4F3FA',
        card: '#FFFFFF',
        ink: {
          900: '#1B1830',
          700: '#5C5872',
          500: '#8A86A0',
          300: '#B3B0C2',
          200: '#D6D3E6',
          100: '#ECEBF5',
        },
        violet: {
          DEFAULT: '#7C5CF0',
          light: '#A78BFA',
          mid: '#9A7CF2',
          pale: '#CDBFFA',
          track: '#DDD6F8',
          soft: '#F0EDFD',
        },
        lime: { DEFAULT: '#B6F24A', ink: '#3F5710', deep: '#2F4708' },
        grass: '#5AA832',
        ember: { DEFAULT: '#E0662A', soft: '#FFF3E6' },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '22px',
        tile: '18px',
        chip: '14px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(90,70,180,.05)',
        card: '0 2px 10px rgba(90,70,180,.07)',
        lift: '0 4px 14px rgba(124,92,240,.4)',
        ring: '0 2px 8px rgba(124,92,240,.10)',
      },
      fontSize: {
        micro: ['11px', '1.45'],
        meta: ['12px', '1.5'],
        body: ['14px', '1.55'],
        lead: ['15px', '1.55'],
        title: ['24px', '1.15'],
        hero: ['27px', '1.1'],
        stat: ['24px', '1.1'],
      },
      letterSpacing: { label: '0.14em' },
    },
  },
  plugins: [],
}

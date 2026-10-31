export const Brand = {
  name: 'Kathaisolli',
  nameTamil: 'கதைசொல்லி',
  tagline: 'ஒவ்வொரு கதைக்கும் ஒரு குரல்',
  taglineEnglish: 'Every Story Has a Voice',
} as const;

export const Colors = {
  forestGreen: '#064E3B',
  deepGreen: '#022C22',
  mintGreen: '#A7F3D0',
  emerald: '#10B981',
  white: '#FFFFFF',
  backgroundLight: '#F8FAF7',
  backgroundDark: '#101A16',
  cardLight: '#FFFFFF',
  cardDark: '#182620',
  borderLight: '#E2E8F0',
  borderDark: '#23382F',
  textPrimaryLight: '#0F172A',
  textPrimaryDark: '#F8FAFC',
  textSecondaryLight: '#475569',
  textSecondaryDark: '#94A3B8',
  textMuted: '#64748B',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
} as const;

export const Typography = {
  fontFamilyTamil: 'Mukta Malar, "Noto Sans Tamil", system-ui, sans-serif',
  fontFamilyBase: 'Inter, system-ui, -apple-system, sans-serif',
  heading: {
    hero: 'text-3xl md:text-5xl font-extrabold tracking-tight',
    section: 'text-xl md:text-2xl font-bold tracking-tight',
    card: 'text-base md:text-lg font-semibold',
  },
} as const;

export const Radii = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
} as const;

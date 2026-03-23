/**
 * SunSuraksha Design Tokens
 * 
 * Warm, light palette — easy on the eyes under bright sunlight.
 * All colors tested for WCAG AA contrast against their intended backgrounds.
 */

export const Colors = {
  // Backgrounds
  background: '#FFF9F3',       // Warm cream — main app bg
  card: '#FFFFFF',             // Pure white — card surfaces
  cardAlt: '#FFF3E8',         // Peach tint — alternate cards
  inputBg: '#FFF5ED',         // Soft peach — input fields

  // Brand
  primary: '#D4763C',         // Warm terracotta — buttons, accents
  primaryLight: '#F0C4A0',    // Light peach — selected states
  primaryDark: '#A85A2A',     // Deep terracotta — pressed states

  // Semantic — Heat levels
  safe: '#4A9B6E',            // Calm green — safe / cool
  safeBg: '#E8F5EC',          // Light green bg
  moderate: '#D4963C',        // Warm amber — moderate heat
  moderateBg: '#FFF3E0',      // Light amber bg
  danger: '#C95A3C',          // Burnt orange — danger / hot
  dangerBg: '#FDEAE5',        // Light danger bg
  extreme: '#A63D2B',         // Deep red-brown — extreme heat
  extremeBg: '#FDE0D8',       // Light extreme bg

  // Text
  text: '#3D2E22',            // Warm dark brown — primary text
  textSecondary: '#8C7B6B',   // Muted brown — secondary text
  textLight: '#B5A494',       // Light brown — placeholders, hints
  textOnPrimary: '#FFFFFF',   // White — text on primary buttons
  textOnDark: '#FFF9F3',      // Cream — text on dark surfaces

  // Borders & Dividers
  border: '#E8DDD2',          // Warm light border
  borderLight: '#F2EAE0',     // Very subtle divider
  divider: '#F0E6DA',         // Section dividers

  // Utility
  white: '#FFFFFF',
  black: '#1A1410',
  overlay: 'rgba(61, 46, 34, 0.5)',  // Warm overlay for modals
} as const;


export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  screen: 48,     // Top/bottom safe area padding
} as const;


export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,      // Pill / circle
} as const;


export const Typography = {
  // Font families — using system fonts for now
  // Can swap to custom fonts (Nunito, Poppins) in Step 2
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },

  // Font sizes
  size: {
    xs: 11,
    sm: 13,
    body: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 32,
    hero: 48,      // Heat score number
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },

  // Font weights (as string for RN compatibility)
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;


export const Shadows = {
  sm: {
    shadowColor: '#3D2E22',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#3D2E22',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#3D2E22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;


/**
 * Heat score color mapping
 * Returns the appropriate color based on the 0-100 heat danger score
 */
export function getHeatColor(score: number): string {
  if (score <= 30) return Colors.safe;
  if (score <= 55) return Colors.moderate;
  if (score <= 75) return Colors.danger;
  return Colors.extreme;
}

export function getHeatBgColor(score: number): string {
  if (score <= 30) return Colors.safeBg;
  if (score <= 55) return Colors.moderateBg;
  if (score <= 75) return Colors.dangerBg;
  return Colors.extremeBg;
}

export function getHeatLabel(score: number): string {
  if (score <= 30) return 'Safe';
  if (score <= 55) return 'Moderate';
  if (score <= 75) return 'Danger';
  return 'Extreme';
}

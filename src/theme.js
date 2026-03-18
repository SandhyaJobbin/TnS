/**
 * Central design tokens for the Trust & Safety Kiosk.
 *
 * Import from here instead of scattering hex values across every file.
 * If a color needs to change, change it once here.
 */

// ── Core palette ─────────────────────────────────────────────────────────────

/** Primary red — matches Tailwind `primary` + CSS `.scan-line` */
export const RED = '#FF003C'

/** Deep near-black used for all screen backgrounds */
export const DARK_BG = '#020B18'

/** Slightly lighter dark used in mid-game screens */
export const MID_BG = '#0a0e1a'

/** Cyan accent — Lost in Context theme */
export const CYAN = '#00f3ff'

/** Success / positive tier — dimension scorecard "Leading" */
export const GREEN = '#4ade80'

/** Warning tier — dimension scorecard "On Track" */
export const AMBER = '#fbbf24'

/** Lower tier — dimension scorecard "Independent Take" */
export const ORANGE = '#fb923c'

// ── Typography ────────────────────────────────────────────────────────────────

/** Monospace stack — used for all labels, captions, terminal-style text */
export const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace"

// ── Semantic aliases ──────────────────────────────────────────────────────────

export const BORDER_RED   = 'rgba(255,0,60,0.15)'
export const BORDER_FAINT = 'rgba(255,255,255,0.06)'
export const GLOW_RED_SM  = `0 0 16px rgba(255,0,60,0.3)`
export const GLOW_RED_LG  = `0 4px 32px rgba(255,0,60,0.35)`
export const GLASS_BG     = 'rgba(2,11,24,0.85)'
export const CARD_BG      = 'rgba(255,255,255,0.04)'

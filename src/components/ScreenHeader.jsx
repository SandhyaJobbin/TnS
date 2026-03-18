import { useContext } from 'react'
import { AppContext } from '../App'
import { MONO, RED, BORDER_RED, GLASS_BG } from '../theme'

/**
 * ScreenHeader — shared branded header used by mid-game and results screens.
 *
 * Props:
 *   title      string   — bold line, e.g. "Trust & Safety Summit"
 *   subtitle   string   — smaller red line below title, e.g. "Intelligence Report"
 *   right      ReactNode — optional slot rendered on the right side
 */
export default function ScreenHeader({ title, subtitle, right }) {
  const { navigate } = useContext(AppContext)
  return (
    <header
      className="relative z-10 w-full flex items-center justify-between px-4 md:px-8 py-3 md:py-5 border-b flex-shrink-0"
      style={{
        borderColor: BORDER_RED,
        background: GLASS_BG,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Left — logo + title */}
      <div className="flex items-center gap-3">
        <button
          onPointerDown={() => navigate('gameSelect')}
          className="opacity-90 active:opacity-60 transition-opacity"
          aria-label="Home"
        >
          <img
            src={`${import.meta.env.BASE_URL}sutherland-logo.png`}
            alt="Sutherland"
            className="h-8 w-auto object-contain"
          />
        </button>
        <div>
          <h2 className="text-white text-sm font-black leading-none uppercase tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p
              className="text-[10px] uppercase tracking-[0.2em] font-bold mt-0.5"
              style={{ color: RED, fontFamily: MONO }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right — optional slot */}
      {right && <div className="flex items-center gap-4">{right}</div>}
    </header>
  )
}

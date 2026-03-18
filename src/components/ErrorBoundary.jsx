import { Component } from 'react'
import { RED, MONO, DARK_BG } from '../theme'

/**
 * ErrorBoundary — wraps the entire app so a JS runtime error never shows
 * a blank white screen on the kiosk. Instead it shows a branded recovery UI
 * and auto-reloads after 10 seconds.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
    this._reloadTimer = null
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[Kiosk ErrorBoundary]', error, info)
  }

  componentDidUpdate(_, prevState) {
    if (this.state.hasError && !prevState.hasError) {
      this._reloadTimer = setTimeout(() => window.location.reload(), 10_000)
    }
  }

  componentWillUnmount() {
    clearTimeout(this._reloadTimer)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: DARK_BG,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          padding: '2rem',
        }}
      >
        {/* Pulsing dot */}
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: RED,
            boxShadow: `0 0 16px ${RED}`,
            animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
          }}
        />

        <p
          style={{
            fontFamily: MONO,
            fontSize: '11px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: RED,
          }}
        >
          System Error Detected
        </p>

        <p
          style={{
            fontFamily: MONO,
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          Restarting in 10 seconds…
        </p>

        {this.state.error && (
          <pre
            style={{
              fontFamily: MONO,
              fontSize: '11px',
              color: 'rgba(255,80,80,0.8)',
              background: 'rgba(255,0,60,0.08)',
              border: '1px solid rgba(255,0,60,0.2)',
              borderRadius: '0.75rem',
              padding: '1rem 1.25rem',
              maxWidth: '90vw',
              maxHeight: '30vh',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              textAlign: 'left',
            }}
          >
            {this.state.error.toString()}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
        )}

        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '1rem',
            background: RED,
            color: '#fff',
            border: 'none',
            borderRadius: '0.75rem',
            padding: '0.75rem 2rem',
            fontFamily: MONO,
            fontSize: '11px',
            fontWeight: 900,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: `0 0 24px rgba(255,0,60,0.4)`,
          }}
        >
          Restart Now
        </button>
      </div>
    )
  }
}

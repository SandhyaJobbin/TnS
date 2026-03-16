import { useRef } from 'react'
import { useSession } from '../hooks/useSession'

const PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'admin1234'

export default function AdminHotspot() {
  const { goToAdmin } = useSession()
  const tapTimestamps = useRef([])
  const holdTimer = useRef(null)
  const inputRef = useRef(null)

  function handlePointerDown() {
    const now = Date.now()
    tapTimestamps.current = tapTimestamps.current.filter(t => now - t < 2000)
    tapTimestamps.current.push(now)

    if (tapTimestamps.current.length >= 3) {
      holdTimer.current = setTimeout(() => {
        const code = window.prompt('Admin passcode:')
        if (code === PASSCODE) goToAdmin()
        tapTimestamps.current = []
      }, 500)
    }
  }

  function handlePointerUp() {
    if (holdTimer.current) clearTimeout(holdTimer.current)
  }

  return (
    <div
      className="absolute bottom-0 right-0 w-20 h-20 z-50 cursor-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    />
  )
}

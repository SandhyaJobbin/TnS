import { useCallback } from 'react'

const BASE = import.meta.env.BASE_URL
const cache = {}

export function useSound(filename, { volume = 1 } = {}) {
  const src = `${BASE}sounds/${filename}`

  const play = useCallback(() => {
    try {
      if (!cache[src]) {
        cache[src] = new Audio(src)
      }
      const audio = cache[src]
      audio.volume = volume
      audio.currentTime = 0
      audio.play().catch(() => {}) // swallow autoplay / missing-file errors
    } catch (e) {}
  }, [src, volume])

  return play
}

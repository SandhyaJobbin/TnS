// Import bundled video assets so Vite resolves their hashed URLs at build time.
// We preload by creating off-screen <video preload="auto"> elements — the ONLY
// reliably cross-browser way to get video data into the browser's media buffer.
// fetch() with cache:'force-cache' only fills the HTTP cache; the video element
// still has to re-parse from there. Hidden video elements fill the media buffer
// directly so playback starts instantly when the real element renders.
import trust2030Video from '../assets/videos/Trust-And-Safety-2030.mp4'
import lostInContextVideo from '../assets/videos/Lost-in-context.mp4'
import gameIntro1Video from '../assets/videos/gameintro1.mp4'
import gameIntro2Video from '../assets/videos/gameintro2.mp4'

const BUNDLED_VIDEOS = [
  trust2030Video,
  lostInContextVideo,
  gameIntro1Video,
  gameIntro2Video,
]

// Cache so we don't create duplicate elements on re-calls
const _preloadedElements = []

export function preloadAssets() {
  if (_preloadedElements.length > 0) return // already run

  for (const url of BUNDLED_VIDEOS) {
    const v = document.createElement('video')
    v.src = url
    v.preload = 'auto'
    v.muted = true
    v.playsInline = true
    v.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;'
    document.body.appendChild(v)
    _preloadedElements.push(v)
  }
}

// Import bundled video assets so Vite resolves their hashed URLs at build time.
// fetch() with cache:'force-cache' warms the HTTP cache so videos are ready
// when the game screens render. The VideoPreloader component in App.jsx handles
// the deeper media-buffer preloading via hidden <video preload="auto"> elements.
// Keeping this as pure fetch() (no DOM manipulation) so it's safe to call
// before React mounts in main.jsx.
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

export function preloadAssets() {
  for (const url of BUNDLED_VIDEOS) {
    fetch(url, { cache: 'force-cache' }).catch(() => {
      // Non-fatal — video will still load on demand if prefetch fails
    })
  }
}

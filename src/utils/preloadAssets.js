// Import bundled video assets so Vite resolves their hashed URLs at build time.
// fetch() with cache:'force-cache' asks the browser to download and store each
// file in the HTTP cache immediately — the videos are ready before the screens
// that need them are ever rendered.
import trust2030Video from '../assets/videos/Trust-and-safety-2030.mp4'
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
      // Non-fatal — the video will still load on demand if prefetch fails
    })
  }
}

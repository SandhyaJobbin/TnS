import anime from 'animejs/lib/anime.esm.js'

export function pulseCard(element) {
  anime({
    targets: element,
    scale: [1, 1.03, 1],
    duration: 300,
    easing: 'easeInOutQuad'
  })
}

export function bounceIn(element) {
  anime({
    targets: element,
    scale: [0.8, 1],
    opacity: [0, 1],
    duration: 400,
    easing: 'easeOutBack'
  })
}

export function flashHighlight(element, color = '#191970') {
  anime({
    targets: element,
    backgroundColor: [color, 'rgba(255,255,255,0.05)'],
    duration: 600,
    easing: 'easeOutQuad'
  })
}

export function countUp(element, from, to, duration = 1000) {
  anime({
    targets: { value: from },
    value: to,
    duration,
    easing: 'easeOutQuad',
    update(anim) {
      element.textContent = Math.round(anim.animations[0].currentValue)
    }
  })
}

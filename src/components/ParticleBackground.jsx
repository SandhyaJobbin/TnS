import { useEffect, useRef, useState } from 'react'

const PARTICLE_COUNT = 60

export default function ParticleBackground() {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    if (useFallback) return

    let Matter
    let runner, render

    async function init() {
      try {
        Matter = await import('matter-js')
        const { Engine, Runner, Render, Bodies, World, Mouse, MouseConstraint } = Matter

        const canvas = canvasRef.current
        if (!canvas) return

        const width = canvas.offsetWidth
        const height = canvas.offsetHeight

        const engine = Engine.create({ gravity: { x: 0, y: 0.05 } })
        engineRef.current = engine

        render = Render.create({
          canvas,
          engine,
          options: {
            width,
            height,
            wireframes: false,
            background: 'transparent',
          }
        })

        // Walls (invisible)
        const walls = [
          Bodies.rectangle(width / 2, -10, width, 20, { isStatic: true, render: { fillStyle: 'transparent' } }),
          Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true, render: { fillStyle: 'transparent' } }),
          Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true, render: { fillStyle: 'transparent' } }),
          Bodies.rectangle(width + 10, height / 2, 20, height, { isStatic: true, render: { fillStyle: 'transparent' } }),
        ]
        World.add(engine.world, walls)

        // Particles
        const particles = []
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const r = 3 + Math.random() * 5
          const alpha = 0.2 + Math.random() * 0.5
          const colors = ['#191970', '#2e3fb0', '#4050c4', '#6470d8', '#8b92e8']
          const color = colors[Math.floor(Math.random() * colors.length)]
          const p = Bodies.circle(
            Math.random() * width,
            Math.random() * height,
            r,
            {
              restitution: 0.8,
              frictionAir: 0.001,
              render: { fillStyle: color + Math.floor(alpha * 255).toString(16).padStart(2, '0') }
            }
          )
          // random initial velocity
          Matter.Body.setVelocity(p, {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2
          })
          particles.push(p)
        }
        World.add(engine.world, particles)

        runner = Runner.create()
        Runner.run(runner, engine)
        Render.run(render)

        // FPS guard
        let frameCount = 0
        let lastCheck = performance.now()
        function checkFPS() {
          frameCount++
          const now = performance.now()
          if (now - lastCheck >= 2000) {
            const fps = (frameCount / ((now - lastCheck) / 1000))
            if (fps < 25) setUseFallback(true)
            frameCount = 0
            lastCheck = now
          }
          if (!useFallback) requestAnimationFrame(checkFPS)
        }
        requestAnimationFrame(checkFPS)

      } catch (e) {
        setUseFallback(true)
      }
    }

    init()

    return () => {
      if (runner && Matter) Matter.Runner.stop(runner)
      if (render && Matter) {
        Matter.Render.stop(render)
        if (render.canvas) render.canvas.remove()
      }
      if (engineRef.current && Matter) Matter.Engine.clear(engineRef.current)
    }
  }, [useFallback])

  if (useFallback) {
    return (
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(25,25,112,0.2) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(64,80,196,0.12) 0%, transparent 50%), #080820',
          animation: 'none'
        }}
      />
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0"
      style={{ background: 'transparent' }}
    />
  )
}

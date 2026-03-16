import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

export default function PollChart({ data, userAnswer }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !data) return

    const labels = Object.keys(data)
    const values = Object.values(data).map(v => Math.round(v))
    const backgroundColors = labels.map(label =>
      label === userAnswer
        ? 'rgba(124, 58, 237, 0.9)'
        : 'rgba(255, 255, 255, 0.15)'
    )
    const borderColors = labels.map(label =>
      label === userAnswer
        ? 'rgba(167, 139, 250, 1)'
        : 'rgba(255, 255, 255, 0.1)'
    )

    if (chartRef.current) {
      chartRef.current.destroy()
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Responses (%)',
          data: values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 8,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 600,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.raw}%`
            }
          }
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: {
              color: 'rgba(255,255,255,0.4)',
              callback: v => `${v}%`
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: 'rgba(255,255,255,0.7)', font: { size: 14 } }
          }
        }
      }
    })

    return () => {
      if (chartRef.current) chartRef.current.destroy()
    }
  }, [data, userAnswer])

  return <canvas ref={canvasRef} className="w-full" style={{ height: '220px' }} />
}

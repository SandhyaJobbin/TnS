import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

export default function RadarChart({ dimensionScores }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !dimensionScores) return

    const labels = Object.keys(dimensionScores)
    const values = Object.values(dimensionScores)

    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Your Alignment',
          data: values,
          backgroundColor: 'rgba(124, 58, 237, 0.25)',
          borderColor: 'rgba(167, 139, 250, 0.9)',
          pointBackgroundColor: 'rgba(167, 139, 250, 1)',
          pointBorderColor: '#fff',
          pointHoverRadius: 6,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 800, easing: 'easeInOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => ` ${ctx.raw}% aligned` }
          }
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              display: false,
              stepSize: 25,
            },
            grid: { color: 'rgba(255,255,255,0.1)' },
            angleLines: { color: 'rgba(255,255,255,0.1)' },
            pointLabels: {
              color: 'rgba(255,255,255,0.7)',
              font: { size: 13 }
            }
          }
        }
      }
    })

    return () => {
      if (chartRef.current) chartRef.current.destroy()
    }
  }, [dimensionScores])

  return <canvas ref={canvasRef} />
}

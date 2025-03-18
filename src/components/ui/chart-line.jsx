'use client'
import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// No importar el plugin de zoom aquí directamente
// import zoomPlugin from 'chartjs-plugin-zoom'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export function LineChart({ data, index, categories, yFormatter }) {
  // Estado para controlar si estamos en el cliente
  const [isClient, setIsClient] = useState(false)

  // Registrar plugin de zoom SOLO en el cliente
  useEffect(() => {
    setIsClient(true)
    
    // Importación dinámica del plugin de zoom
    const registerZoomPlugin = async () => {
      const zoomPlugin = (await import('chartjs-plugin-zoom')).default
      ChartJS.register(zoomPlugin)
    }
    
    registerZoomPlugin()
  }, [])

  // Definimos colores y estilos para cada categoría
  const lineStyles = {
    balance: {
      color: '#3B82F6',
      dash: [],
      pointRadius: 2,          // balance con puntos pequeños
      pointHoverRadius: 6,
    },
    max_drawdown: {
      color: '#F87171',        // Rojo punteado
      dash: [5, 5],
      pointRadius: 0,          // SIN puntos (solo línea)
      pointHoverRadius: 0,
    },
    profit_target: {
      color: '#10B981',        // Verde
      dash: [],
      pointRadius: 0,          // SIN puntos (solo línea)
      pointHoverRadius: 0,
    },
    // otros estilos si lo requieres
  }

  // Construimos datasets para Chart.js
  const chartData = {
    labels: data.map((item) => item[index]),
    datasets: categories.map((cat) => {
      const style = lineStyles[cat] || { color: '#FFF', dash: [], pointRadius: 0, pointHoverRadius: 0 }
      return {
        label: cat,
        data: data.map((item) => item[cat]),
        borderColor: style.color,
        backgroundColor: 'transparent',
        borderDash: style.dash,
        borderWidth: 2,
        pointRadius: style.pointRadius,
        pointHoverRadius: style.pointHoverRadius,
        spanGaps: true, // para trazar líneas aunque haya huecos
      }
    }),
  }

  // Calculamos min y max para incluir valores horizontales
  let allValues = []
  data.forEach((row) => {
    categories.forEach((cat) => {
      const val = row[cat]
      if (typeof val === 'number') {
        allValues.push(val)
      }
    })
  })

  if (allValues.length === 0) {
    allValues = [0, 100]
  }
  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)
  const paddingFactor = 0.05
  const range = maxVal - minVal
  const suggestedMin = minVal - range * paddingFactor
  const suggestedMax = maxVal + range * paddingFactor

  // Opciones de Chart.js
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 5,
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#333',
        titleColor: '#FFF',
        bodyColor: '#FFF',
        borderColor: '#FFF',
        borderWidth: 1,
      },
      // Solo habilitamos zoom si estamos en el cliente
      ...(isClient && {
        zoom: {
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: 'x',
          },
          pan: {
            enabled: true,
            mode: 'x',
          },
          limits: {
            x: {
              min: 'original',
              max: 'original',
              minRange: 2,
            },
          },
        }
      }),
    },
    scales: {
      x: {
        ticks: {
          display: false,
        },
      },
      y: {
        suggestedMin,
        suggestedMax,
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        ticks: {
          color: '#FFF',
          callback: (value) => yFormatter(value),
        },
      },
    },
  }

  return (
    <div style={{ backgroundColor: '#000', padding: '1rem', borderRadius: '8px' }}>
      <div style={{ width: '100%', height: '60vh' }}>
        <Line data={chartData} options={options} />
      </div>

      {/* Leyenda personalizada */}
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
        <ul
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            fontSize: '0.85rem',
          }}
        >
          {categories.map((cat) => {
            const style = lineStyles[cat] || { color: '#FFF', dash: [], pointRadius: 0 }
            const borderStyle = style.dash.length
              ? `2px dashed ${style.color}`
              : `2px solid ${style.color}`

            return (
              <li key={cat} style={{ display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '30px',
                    height: '0',
                    borderBottom: borderStyle,
                    marginRight: '8px',
                  }}
                />
                <span style={{ color: '#FFF', textTransform: 'capitalize' }}>
                  {cat.replace(/_/g, ' ')}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
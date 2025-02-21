'use client'
import React, { useEffect } from 'react'
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

// Importamos el plugin de zoom de manera dinámica
// para evitar "window is not defined" en SSR
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
  // 1) Registrar chartjs-plugin-zoom dentro de useEffect, solo en el cliente
  useEffect(() => {
    import('chartjs-plugin-zoom').then((zoomModule) => {
      ChartJS.register(zoomModule.default)
    })
  }, [])

  // 2) Definimos colores y estilo (punteado o no) para cada categoría
  const lineStyles = {
    target: {
      color: '#10B981', // Verde
      dash: [],
    },
    balance: {
      color: '#3B82F6', // Azul
      dash: [],
    },
    high_water_mark: {
      color: '#FBBF24', // Amarillo
      dash: [],
    },
    equity: {
      color: '#3B82F6', // Azul punteado
      dash: [5, 5],
    },
    max_drawdown: {
      color: '#F87171', // Rojo
      dash: [5, 5],
    },
    max_daily_loss: {
      color: '#F87171', // Rojo punteado
      dash: [],
    },
  }

  // 3) Construimos los datasets para Chart.js
  const chartData = {
    labels: data.map((item) => item[index]),
    datasets: categories.map((cat) => {
      const style = lineStyles[cat] || { color: '#FFF', dash: [] }
      return {
        label: cat,
        data: data.map((item) => item[cat]),
        borderColor: style.color,
        backgroundColor: 'transparent',
        borderDash: style.dash,
        borderWidth: 2,
        // Ocultamos puntos y solo aparecen en hover:
        pointRadius: 0,
        pointHoverRadius: 5,
      }
    }),
  }

  // 4) Opciones de Chart.js (fondo negro, tooltip, zoom, etc.)
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 5, // más espacio interno
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, // Ocultamos la leyenda nativa (usamos la personalizada)
      },
      tooltip: {
        backgroundColor: '#333',
        titleColor: '#FFF',
        bodyColor: '#FFF',
        borderColor: '#FFF',
        borderWidth: 1,
      },
      // Configuración del plugin de zoom
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
        pan: {
          enabled: true,
          mode: 'x',
        },
        limits: {
          x: {
            // Mantener min y max originales de la data
            min: 'original',
            max: 'original',
            // minRange define la distancia mínima entre min y max
            // es decir, cuánto puedes acercar como máximo
            minRange: 2,
          },
        },
      },
      
    },
    scales: {
      x: {
        // Ocultamos las etiquetas de la fecha
        ticks: {
          display: false,
        },
      },
      y: {
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

  // 5) Render del componente
  return (
    <div style={{ backgroundColor: '#000', padding: '1rem', borderRadius: '8px' }}>
      {/* Contenedor para el gráfico */}
      <div style={{ width: '100%', height: '60vh' }}>
        <Line data={chartData} options={options} />
      </div>

      {/* Leyenda personalizada debajo */}
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
        <ul
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            fontSize: '0.85rem', // Ajusta el tamaño de fuente a tu gusto
          }}
        >
          {categories.map((cat) => {
            const style = lineStyles[cat] || { color: '#FFF', dash: [] }
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

// src/pages/metrix2/grafico.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { LineChart } from '@/components/ui/chart-line'

export default function MyPage({
  statisticsData,
  maxDrawdownAbsolute,
  profitTargetAbsolute
}) {
  const [data, setData] = useState([])

  // Formateador del eje Y para moneda
  const yFormatter = (tick) => {
    if (typeof tick === 'number') {
      return `$ ${new Intl.NumberFormat('us').format(tick)}`
    }
    return ''
  }

  useEffect(() => {
    if (!statisticsData || statisticsData.length === 0) return
    if (maxDrawdownAbsolute == null) return
    if (profitTargetAbsolute == null) return

    const chartData = transformStatisticsToChartData(
      statisticsData,
      maxDrawdownAbsolute,
      profitTargetAbsolute
    )
    setData(chartData)
  }, [statisticsData, maxDrawdownAbsolute, profitTargetAbsolute])

  /**
   * 1) Ordenar la data por brokerTime (fecha/hora).
   * 2) Asignar en cada punto el mismo valor para max_drawdown y profit_target
   *    => líneas horizontales a lo largo de todas las fechas.
   */
  const transformStatisticsToChartData = (dataArray, ddAbsolute, ptAbsolute) => {
    // Ordenar por fecha/hora
    const sortedData = [...dataArray].sort((a, b) => {
      const dateA = new Date(a.brokerTime).getTime()
      const dateB = new Date(b.brokerTime).getTime()
      return dateA - dateB
    })

    // Asignar valor fijo en cada punto para max_drawdown y profit_target
    return sortedData.map(item => {
      const date = item.brokerTime
        ? item.brokerTime.split(' ')[0] // "YYYY-MM-DD"
        : new Date().toISOString().split('T')[0]

      return {
        date,
        balance: item.lastEquity,
        max_drawdown: ddAbsolute,
        profit_target: ptAbsolute,
      }
    })
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
        No hay datos disponibles para mostrar.
      </div>
    )
  }

  return (
    <>
      <h2 className="text-lg font-semibold mb-4">Evolución del Balance</h2>
      <div className="dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
        <LineChart
          data={data}
          index="date"
          categories={[
            'balance',
            'max_drawdown',
            'profit_target'
          ]}
          yFormatter={yFormatter}
        />
      </div>
    </>
  )
}

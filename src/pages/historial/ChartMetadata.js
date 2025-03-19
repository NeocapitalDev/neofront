// src/pages/historial/ChartMetadata.js
'use client'
import React, { useEffect, useState } from 'react'
import { LineChart } from '@/components/ui/chart-line'

const ChartMetadata = ({ metadata }) => {
    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Formateador del eje Y para moneda
    const yFormatter = (tick) => {
        if (typeof tick === 'number') {
            return `$ ${new Intl.NumberFormat('us').format(tick)}`
        }
        return ''
    }

    useEffect(() => {
        // Log para depuración
        console.log('Metadata recibida en ChartMetadata:', metadata);

        if (!metadata) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            
            // Determinar si los datos están en metrics o directamente en metadata
            const metrics = metadata.metrics || metadata
            
            // Obtener los valores necesarios para el gráfico
            const initialBalance = metrics.deposits || 10000
            const maxDrawdownPercent = metrics.maxDrawdown || 10
            const profitTargetPercent = 10 // Valor por defecto si no está especificado
            
            // Cálculo de valores absolutos para líneas horizontales
            const maxDrawdownAbsolute = initialBalance * (1 - maxDrawdownPercent / 100)
            const profitTargetAbsolute = initialBalance * (1 + profitTargetPercent / 100)
            
            // Priorizar el uso de equityChart si está disponible
            if (metadata.equityChart && metadata.equityChart.length > 0) {
                const processedData = transformEquityChartData(
                    metadata.equityChart,
                    maxDrawdownAbsolute,
                    profitTargetAbsolute
                )
                setChartData(processedData)
            }
            // Si no hay equityChart pero hay dailyGrowth, usarlo
            else if (metrics.dailyGrowth && metrics.dailyGrowth.length > 0) {
                const processedData = transformDailyGrowthData(
                    metrics.dailyGrowth,
                    maxDrawdownAbsolute,
                    profitTargetAbsolute
                )
                setChartData(processedData)
            }
            // Si no hay suficientes datos, generar datos de ejemplo
            else {
                console.warn("No hay datos suficientes para el gráfico, usando valores simulados")
                const sampleData = generateSampleData(
                    initialBalance,
                    maxDrawdownAbsolute,
                    profitTargetAbsolute
                )
                setChartData(sampleData)
            }
            
            setLoading(false)
        } catch (err) {
            console.error("Error procesando datos para el gráfico:", err)
            setError(err.message || "Error desconocido")
            setLoading(false)
        }
    }, [metadata])

    /**
     * Transforma los datos de equityChart al formato requerido
     */
    const transformEquityChartData = (equityChartData, ddAbsolute, ptAbsolute) => {
        // Ordenar por fecha/hora
        const sortedData = [...equityChartData].sort((a, b) => {
            const dateA = new Date(a.brokerTime).getTime()
            const dateB = new Date(b.brokerTime).getTime()
            return dateA - dateB
        })

        // Transformar al formato requerido por el componente LineChart
        return sortedData.map(item => {
            // Extraer solo la parte de fecha (YYYY-MM-DD) del brokerTime
            const date = item.brokerTime
                ? item.brokerTime.split(' ')[0]
                : new Date().toISOString().split('T')[0]

            return {
                date,
                balance: item.lastBalance || item.startBalance, // Usar lastBalance si está disponible
                max_drawdown: ddAbsolute,                       // Línea horizontal de drawdown máximo
                profit_target: ptAbsolute                       // Línea horizontal de target de profit
            }
        })
    }

    /**
     * Transforma los datos de dailyGrowth al formato requerido
     */
    const transformDailyGrowthData = (dailyGrowthData, ddAbsolute, ptAbsolute) => {
        return dailyGrowthData.map(day => {
            // Asegurarnos que date sea string en formato YYYY-MM-DD
            const date = typeof day.date === 'string'
                ? day.date
                : new Date().toISOString().split('T')[0]

            return {
                date,
                balance: day.balance,
                max_drawdown: ddAbsolute,
                profit_target: ptAbsolute
            }
        })
    }

    /**
     * Genera datos de ejemplo para el gráfico
     */
    const generateSampleData = (initialBalance, ddAbsolute, ptAbsolute) => {
        const today = new Date()
        return Array.from({ length: 30 }, (_, i) => {
            const date = new Date(today)
            date.setDate(date.getDate() - (29 - i))
            const formattedDate = date.toISOString().split('T')[0]

            // Simular fluctuación del balance
            const dayChange = Math.random() * 500 - 200
            const balance = initialBalance + (i * 100) + dayChange

            return {
                date: formattedDate,
                balance: balance,
                equity: balance - (Math.random() * 200 - 100), // Simular equity ligeramente diferente
                max_drawdown: ddAbsolute,
                profit_target: ptAbsolute
            }
        })
    }

    // Mostrar indicador de carga
    if (loading) {
        return (
            <div className="flex justify-center items-center h-60 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--app-primary)]"></div>
            </div>
        )
    }

    // Mostrar error si lo hay
    if (error) {
        return (
            <div className="text-red-500 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg dark:bg-zinc-800 shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
                Error cargando datos del gráfico: {error}
            </div>
        )
    }

    // Mensaje cuando no hay datos
    if (chartData.length === 0) {
        return (
            <div className="text-center p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
                No hay datos disponibles para mostrar.
                <pre className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                    Datos recibidos: {JSON.stringify(metadata, null, 2)}
                </pre>
            </div>
        )
    }

    // Renderizar gráfico
    return (
        <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Evolución del Balance</h2>
            <div className="dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                <LineChart
                    data={chartData}
                    index="date"
                    categories={[
                        'balance',
                        'max_drawdown',
                        'profit_target'
                    ]}
                    yFormatter={yFormatter}
                />
            </div>
        </div>
    )
}

export default ChartMetadata
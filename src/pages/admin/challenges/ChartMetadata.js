// src/pages/historial/ChartMetadata.js
'use client'
import React, { useEffect, useState } from 'react'
import { LineChart } from '@/components/ui/chart-line'

const ChartMetadata = ({ metadata, stageConfig, initialBalance }) => {
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
        console.log('StageConfig recibido en ChartMetadata:', stageConfig);
        console.log('InitialBalance recibido en ChartMetadata:', initialBalance);

        if (!metadata) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            
            // Determinar si los datos están en metrics o directamente en metadata
            const metrics = metadata.metrics || metadata
            
            // Obtener el balance inicial
            // Prioridad: 1. valor pasado como prop, 2. valor en metrics.deposits, 3. valor por defecto
            const baseBalance = initialBalance || metrics.deposits || 10000
            console.log('Balance base para cálculos:', baseBalance);
            
            // Obtener los valores de profit target y max drawdown del stageConfig
            // Si no están disponibles, usar valores por defecto
            let profitTargetPercent = 10;  // Valor por defecto: 10%
            let maxDrawdownPercent = 10;   // Valor por defecto: 10%
            
            if (stageConfig) {
                // Usar los valores del stage si están disponibles
                if (typeof stageConfig.profitTarget === 'number') {
                    profitTargetPercent = stageConfig.profitTarget;
                }
                
                // Para el max drawdown, priorizar maximumTotalLoss, si no está disponible usar maximumDailyLoss
                if (typeof stageConfig.maximumTotalLoss === 'number') {
                    maxDrawdownPercent = stageConfig.maximumTotalLoss;
                } else if (typeof stageConfig.maximumDailyLoss === 'number') {
                    maxDrawdownPercent = stageConfig.maximumDailyLoss;
                }
            }
            
            console.log('Porcentajes utilizados:', {
                profitTargetPercent,
                maxDrawdownPercent
            });
            
            // Cálculo de valores absolutos para líneas horizontales
            const maxDrawdownAbsolute = baseBalance * (1 - maxDrawdownPercent / 100);
            const profitTargetAbsolute = baseBalance * (1 + profitTargetPercent / 100);
            
            console.log('Valores absolutos calculados:', {
                maxDrawdownAbsolute,
                profitTargetAbsolute
            });
            
            // Priorizar el uso de equityChart si está disponible
            if (metadata.equityChart && metadata.equityChart.length > 0) {
                console.log('Usando datos de equityChart para la gráfica');
                const processedData = transformEquityChartData(
                    metadata.equityChart,
                    maxDrawdownAbsolute,
                    profitTargetAbsolute
                )
                setChartData(processedData)
            }
            // Si no hay equityChart pero hay dailyGrowth, usarlo
            else if (metrics.dailyGrowth && metrics.dailyGrowth.length > 0) {
                console.log('Usando datos de dailyGrowth para la gráfica');
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
                    baseBalance,
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
    }, [metadata, stageConfig, initialBalance])

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
            <div className="text-red-500  bg-red-100 dark:bg-red-900/30 rounded-lg dark:bg-zinc-800 shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
                Error cargando datos del gráfico: {error}
            </div>
        )
    }

    // Mensaje cuando no hay datos
    if (chartData.length === 0) {
        return (
            <div className="text-center  bg-gray-100 dark:bg-zinc-800 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
                No hay datos disponibles para mostrar.
                <pre className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                    Datos recibidos: {JSON.stringify(metadata, null, 2)}
                </pre>
            </div>
        )
    }

    // Renderizar gráfico
    return (
        <div className="mt-4">
            <h2 className="text-lg font-semibold mb-4">Evolución del Balance</h2>
            <div className="dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black ">
                <LineChart
                    data={chartData}
                    index="date"
                    categories={[
                        'balance',
                        'max_drawdown',
                        'profit_target'
                    ]}
                    yFormatter={yFormatter}
                    colors={["blue", "red", "green"]}
                />
            </div>
        </div>
    )
}

export default ChartMetadata
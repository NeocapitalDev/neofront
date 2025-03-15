// src/pages/metrix2/grafico.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { LineChart } from '@/components/ui/chart-line'
import { useRouter } from 'next/router'
import { MetaStats } from 'metaapi.cloud-sdk'

export default function MyPage() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const router = useRouter()
    const { idcuenta } = router.query

    // Formateador del eje Y para moneda
    const yFormatter = (tick) => {
        if (typeof tick === 'number') {
            return `$ ${new Intl.NumberFormat('us').format(tick)}`
        }
        return ''
    }

    useEffect(() => {
        // Solo proceder si tenemos el ID de la cuenta
        if (!idcuenta) return

        const fetchBalanceData = async () => {
            setLoading(true)
            setError(null)

            try {
                // Primero obtenemos los datos del challenge para conseguir el accountId
                const challengeResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenges/${idcuenta}?populate=broker_account`,
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
                            "Content-Type": "application/json",
                        },
                    }
                )

                if (!challengeResponse.ok) {
                    throw new Error(`Error obteniendo datos del challenge: ${challengeResponse.status}`)
                }

                const challengeData = await challengeResponse.json()
                const accountId = challengeData?.data?.broker_account?.idMeta

                if (!accountId) {
                    throw new Error("No se encontró el ID de la cuenta MetaAPI")
                }

                // Obtenemos las métricas usando MetaStats
                const metaStats = new MetaStats(process.env.NEXT_PUBLIC_TOKEN_META_API)
                const metrics = await metaStats.getMetrics(accountId)

                // Transformamos los datos para el gráfico
                if (metrics && metrics.dailyGrowth && metrics.dailyGrowth.length > 0) {
                    const chartData = transformMetricsToChartData(metrics)
                    console.log("Datos procesados para el gráfico:", chartData)
                    setData(chartData)
                } else {
                    console.warn("No hay datos de crecimiento diario disponibles")
                    // Generar datos de ejemplo si no hay datos reales
                    const sampleData = generateSampleData(metrics?.deposits || 10000)
                    setData(sampleData)
                }
            } catch (err) {
                console.error("Error obteniendo datos para el gráfico:", err)
                setError(err.message || "Error desconocido")

                // Generar datos de ejemplo en caso de error
                const sampleData = generateSampleData(10000)
                setData(sampleData)
            } finally {
                setLoading(false)
            }
        }

        fetchBalanceData()
    }, [idcuenta])

    /**
     * Transforma los datos de métricas al formato requerido por el gráfico
     */
    const transformMetricsToChartData = (metrics) => {
        // Extraer datos de crecimiento diario
        const dailyGrowthData = metrics.dailyGrowth || []
        const initialBalance = metrics.deposits || 10000
        const targetBalance = initialBalance * 1.1 // 10% por encima del inicial

        // Transformar al formato esperado por LineChart
        return dailyGrowthData.map(day => {
            // Calcular valores para max_drawdown y max_daily_loss basados en la métrica
            const maxDrawdownAmount = initialBalance * (1 - (metrics.maxDrawdown || 0.1) / 100)
            const maxDailyLossAmount = day.balance * 0.95 // 5% del balance del día

            return {
                date: typeof day.date === 'string' ? day.date.split(' ')[0] : new Date().toISOString().split('T')[0], // Solo la parte de la fecha
                balance: day.balance || initialBalance,
                target: targetBalance,
                equity: day.balance || initialBalance, // Podemos usar el balance como equity si no está disponible
                max_drawdown: maxDrawdownAmount,
                max_daily_loss: maxDailyLossAmount
            }
        })
    }

    /**
     * Genera datos de ejemplo para el gráfico
     */
    const generateSampleData = (initialBalance) => {
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
                target: initialBalance * 1.1,
                equity: balance - (Math.random() * 500 - 250),
                max_drawdown: initialBalance * 0.9,
                max_daily_loss: balance * 0.95
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
            <div className="text-red-500 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg dark:bg-zinc-800  shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
                Error cargando datos del gráfico: {error}
            </div>
        )
    }

    // Mensaje cuando no hay datos
    if (data.length === 0) {
        return (
            <div className="text-center p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg  shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
                No hay datos disponibles para mostrar.
            </div>
        )
    }

    // Renderizar gráfico
    return (
        <>
            <h2 className="text-lg font-semibold mb-4">Evolución del Balance</h2>
            <div className="dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black ">
                <LineChart
                    data={data}
                    index="date"
                    categories={[
                        'target',
                        'balance',
                        //'high_water_mark',
                        //'equity',
                        'max_drawdown',
                        //'max_daily_loss',
                    ]}
                    yFormatter={yFormatter}
                />
            </div>
        </>
    )
}
// src/pages/historial/ChartMetadata.js
'use client'
import React, { useEffect, useState } from 'react'
import { LineChart } from '@/components/ui/chart-line'

const ChartMetadata = ({ metadata, stageConfig, initialBalance }) => {
    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [horizontalLines, setHorizontalLines] = useState({
        maxDrawdown: null,
        profitTarget: null
    })

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

            // Guardar los valores para las líneas horizontales
            setHorizontalLines({
                maxDrawdown: maxDrawdownAbsolute,
                profitTarget: profitTargetAbsolute
            });

            let balanceData = [];

            // Priorizar el uso de equityChart si está disponible
            if (metadata.equityChart && metadata.equityChart.length > 0) {
                console.log('Usando datos de equityChart para la gráfica');
                balanceData = transformEquityChartData(metadata.equityChart);
            }
            // Si no hay equityChart pero hay dailyGrowth, usarlo
            else if (metrics.dailyGrowth && metrics.dailyGrowth.length > 0) {
                console.log('Usando datos de dailyGrowth para la gráfica');
                balanceData = transformDailyGrowthData(metrics.dailyGrowth);
            }
            // Si no hay suficientes datos, generar datos de ejemplo
            else {
                console.warn("No hay datos suficientes para el gráfico, usando valores simulados");
                balanceData = generateSampleBalanceData(baseBalance);
            }

            // Para líneas horizontales, usamos un enfoque híbrido
            const processedData = processDataForChart(
                balanceData,
                maxDrawdownAbsolute,
                profitTargetAbsolute
            );

            setChartData(processedData);
            setLoading(false);
        } catch (err) {
            console.error("Error procesando datos para el gráfico:", err);
            setError(err.message || "Error desconocido");
            setLoading(false);
        }
    }, [metadata, stageConfig, initialBalance]);

    /**
     * Transforma los datos de equityChart para obtener solo los datos de balance
     */
    const transformEquityChartData = (equityChartData) => {
        // Ordenar por fecha/hora
        const sortedData = [...equityChartData].sort((a, b) => {
            const dateA = new Date(a.brokerTime).getTime();
            const dateB = new Date(b.brokerTime).getTime();
            return dateA - dateB;
        });

        // Transformar al formato requerido
        return sortedData.map(item => {
            // Extraer solo la parte de fecha (YYYY-MM-DD) del brokerTime
            const date = item.brokerTime
                ? item.brokerTime.split(' ')[0]
                : new Date().toISOString().split('T')[0];

            return {
                date,
                balance: item.lastBalance || item.startBalance || 0
            };
        });
    }

    /**
     * Transforma los datos de dailyGrowth para obtener solo los datos de balance
     */
    const transformDailyGrowthData = (dailyGrowthData) => {
        return dailyGrowthData.map(day => {
            // Asegurarnos que date sea string en formato YYYY-MM-DD
            const date = typeof day.date === 'string'
                ? day.date
                : new Date().toISOString().split('T')[0];

            return {
                date,
                balance: day.balance || 0
            };
        });
    }

    /**
     * Genera datos de ejemplo para el balance
     */
    const generateSampleBalanceData = (initialBalance) => {
        const today = new Date();
        return Array.from({ length: 30 }, (_, i) => {
            const date = new Date(today);
            date.setDate(date.getDate() - (29 - i));
            const formattedDate = date.toISOString().split('T')[0];

            // Simular fluctuación del balance
            const dayChange = Math.random() * 500 - 200;
            const balance = initialBalance + (i * 100) + dayChange;

            return {
                date: formattedDate,
                balance: balance
            };
        });
    }

    /**
     * Procesa los datos para el componente LineChart
     * Usamos un enfoque híbrido - series separadas para visualización de líneas
     * pero aseguramos que los tooltips muestren todos los valores
     */
    const processDataForChart = (balanceData, maxDrawdownValue, profitTargetValue) => {
        if (!balanceData || balanceData.length === 0) return [];

        // Extraer la primera y última fecha
        const dates = balanceData.map(item => item.date);
        const firstDate = dates[0];
        const lastDate = dates[dates.length - 1];

        // Crear series individuales para cada tipo de dato
        // 1. Serie completa para balance
        const balanceSeries = balanceData.map(item => ({
            date: item.date,
            balance: item.balance
        }));

        // 2. Serie para max_drawdown (solo 2 puntos, inicio y fin)
        const maxDrawdownSeries = [
            { date: firstDate, max_drawdown: maxDrawdownValue, tooltipValue: maxDrawdownValue },
            { date: lastDate, max_drawdown: maxDrawdownValue, tooltipValue: maxDrawdownValue }
        ];

        // 3. Serie para profit_target (solo 2 puntos, inicio y fin)
        const profitTargetSeries = [
            { date: firstDate, profit_target: profitTargetValue, tooltipValue: profitTargetValue },
            { date: lastDate, profit_target: profitTargetValue, tooltipValue: profitTargetValue }
        ];

        // 4. Serie para tooltips (todos los puntos con todos los valores)
        const tooltipSeries = balanceData.map(item => ({
            date: item.date,
            tooltipBalance: item.balance,
            tooltipMaxDrawdown: maxDrawdownValue,
            tooltipProfitTarget: profitTargetValue
        }));

        // Combinar todas las series
        const combinedData = [
            ...balanceSeries,
            ...maxDrawdownSeries,
            ...profitTargetSeries,
            ...tooltipSeries
        ];

        return combinedData;
    }

    /**
     * Personaliza el tooltip para mostrar todos los valores
     */
    const customTooltipFormatter = (dataPoint, category) => {
        const date = dataPoint.date;

        // Encontrar todos los puntos con esta fecha
        const pointsWithSameDate = chartData.filter(item => item.date === date);

        // Extraer valores para el tooltip
        let balanceValue = null;
        let maxDrawdownValue = null;
        let profitTargetValue = null;

        pointsWithSameDate.forEach(point => {
            if (point.balance !== undefined) balanceValue = point.balance;
            if (point.max_drawdown !== undefined) maxDrawdownValue = point.max_drawdown;
            if (point.profit_target !== undefined) profitTargetValue = point.profit_target;

            // También buscar en campos de tooltip si están disponibles
            if (point.tooltipBalance !== undefined) balanceValue = point.tooltipBalance;
            if (point.tooltipMaxDrawdown !== undefined) maxDrawdownValue = point.tooltipMaxDrawdown;
            if (point.tooltipProfitTarget !== undefined) profitTargetValue = point.tooltipProfitTarget;
        });

        // Formatear valores para el tooltip
        const formattedBalance = balanceValue !== null ? yFormatter(balanceValue) : 'N/A';
        const formattedMaxDrawdown = maxDrawdownValue !== null ? yFormatter(maxDrawdownValue) : 'N/A';
        const formattedProfitTarget = profitTargetValue !== null ? yFormatter(profitTargetValue) : 'N/A';

        // El formato depende de la categoría actual
        if (category === 'balance') {
            return `balance: ${formattedBalance}`;
        } else if (category === 'max_drawdown') {
            return `max_drawdown: ${formattedMaxDrawdown}`;
        } else if (category === 'profit_target') {
            return `profit_target: ${formattedProfitTarget}`;
        }

        // Por defecto mostrar solo el valor actual
        return `${category}: ${yFormatter(dataPoint[category] || 0)}`;
    };

    // Mostrar indicador de carga
    if (loading) {
        return (
            <div className="flex justify-center items-center h-60 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black ">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--app-primary)]"></div>
            </div>
        )
    }

    // Mostrar error si lo hay
    if (error) {
        return (
            <div className="text-red-500 bg-red-100 dark:bg-red-900/30 rounded-lg dark:bg-zinc-800 shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black p-4">
                Error cargando datos del gráfico: {error}
            </div>
        )
    }

    // Mensaje cuando no hay datos
    if (chartData.length === 0) {
        return (
            <div className="text-center bg-gray-100 dark:bg-zinc-800 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black p-4">
                No hay datos disponibles para mostrar.
                <pre className="mt-4 text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                    Datos recibidos: {JSON.stringify(metadata, null, 2)}
                </pre>
            </div>
        )
    }

    // Renderizar gráfico con configuración mejorada
    return (
        <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Evolución del Balance por hora</h2>
            <div className="dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                <LineChart
                    data={chartData}
                    index="date"
                    categories={['balance', 'max_drawdown', 'profit_target']}
                    yFormatter={yFormatter}
                    colors={["#FBBF24", "red", "green"]}
                    valueFormatter={customTooltipFormatter}
                    showLegend={true}
                    showGridLines={true}
                    startEndOnly={false}
                    showXAxis={true}
                    showYAxis={true}
                    curveType="linear"
                    connectNulls={true}
                />
            </div>
        </div>
    )
}

export default ChartMetadata
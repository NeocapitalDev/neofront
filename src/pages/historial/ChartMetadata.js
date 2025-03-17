// src/pages/historial/ChartMetadata.js
import React, { useEffect, useState } from 'react';
import { LineChart } from '@/components/ui/chart-line';

const ChartMetadata = ({ metadata }) => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Formateador del eje Y para moneda
    const yFormatter = (tick) => {
        if (typeof tick === 'number') {
            return `$ ${new Intl.NumberFormat('us').format(tick)}`;
        }
        return '';
    };

    useEffect(() => {
        if (!metadata) return;

        try {
            setLoading(true);
            
            // Si existe dailyGrowth en metadata, usamos esos datos para el gráfico
            if (metadata.dailyGrowth && metadata.dailyGrowth.length > 0) {
                const transformedData = transformMetricsToChartData(metadata);
                setChartData(transformedData);
            } else {
                // Intentar crear datos a partir de resumen mensual si está disponible
                if (metadata.monthlyAnalytics && metadata.monthlyAnalytics.length > 0) {
                    const dataFromMonthly = createDataFromMonthlyAnalytics(metadata);
                    setChartData(dataFromMonthly);
                } else {
                    // Si hay datos de ganancia/pérdida diaria, intentar crear datos desde ahí
                    if (metadata.profit !== undefined && metadata.balance !== undefined) {
                        const dataFromProfit = createDataFromProfit(metadata);
                        setChartData(dataFromProfit);
                    } else {
                        // Si no hay suficientes datos disponibles, generar datos de ejemplo
                        console.warn("No hay datos suficientes para generar un gráfico real, usando datos de ejemplo");
                        const initialBalance = metadata.deposits || metadata.balance || 10000;
                        const sampleData = generateSampleData(initialBalance);
                        setChartData(sampleData);
                    }
                }
            }
        } catch (err) {
            console.error("Error procesando datos para el gráfico:", err);
            setError(err.message || "Error desconocido");
            
            // En caso de error, mostrar datos de ejemplo
            const initialBalance = metadata.deposits || metadata.balance || 10000;
            const sampleData = generateSampleData(initialBalance);
            setChartData(sampleData);
        } finally {
            setLoading(false);
        }
    }, [metadata]);

    /**
     * Transforma los datos de métricas al formato requerido por el gráfico
     */
    const transformMetricsToChartData = (metrics) => {
        // Extraer datos de crecimiento diario
        const dailyGrowthData = metrics.dailyGrowth || [];
        const initialBalance = metrics.deposits || 10000;
        const targetBalance = initialBalance * 1.1; // 10% por encima del inicial

        // Transformar al formato esperado por LineChart
        return dailyGrowthData.map(day => {
            // Calcular valores para max_drawdown y max_daily_loss basados en la métrica
            const maxDrawdownAmount = initialBalance * (1 - (metrics.maxDrawdown || 0.1) / 100);
            const maxDailyLossAmount = day.balance * 0.95; // 5% del balance del día

            return {
                date: typeof day.date === 'string' ? day.date : new Date().toISOString().split('T')[0], // Solo la parte de la fecha
                balance: day.balance || initialBalance,
                target: targetBalance,
                equity: day.balance || initialBalance, // Podemos usar el balance como equity si no está disponible
                max_drawdown: maxDrawdownAmount,
                max_daily_loss: maxDailyLossAmount
            };
        });
    };

    /**
     * Crea datos de gráfico a partir de la información mensual
     */
    const createDataFromMonthlyAnalytics = (metrics) => {
        const initialBalance = metrics.deposits || 10000;
        const targetBalance = initialBalance * 1.1;
        
        // Ordenar los datos mensuales por fecha
        const sortedMonthly = [...metrics.monthlyAnalytics].sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });
        
        // Crear un punto de datos para cada mes
        return sortedMonthly.map((month, index) => {
            // Calcular el balance acumulado
            let balance = initialBalance;
            for (let i = 0; i <= index; i++) {
                balance += sortedMonthly[i].profit || 0;
            }
            
            // Calcular drawdown
            const maxDrawdownAmount = initialBalance * (1 - (metrics.maxDrawdown || 5) / 100);
            
            return {
                date: month.date, // Formato YYYY-MM
                balance: balance,
                target: targetBalance,
                max_drawdown: maxDrawdownAmount
            };
        });
    };
    
    /**
     * Crea datos de gráfico a partir del profit y balance actuales
     */
    const createDataFromProfit = (metrics) => {
        const initialBalance = metrics.deposits || metrics.balance - metrics.profit || 10000;
        const currentBalance = metrics.balance || initialBalance + metrics.profit;
        const targetBalance = initialBalance * 1.1;
        const maxDrawdownAmount = initialBalance * (1 - (metrics.maxDrawdown || 5) / 100);
        
        // Crear solo dos puntos: inicio y fin
        return [
            {
                date: metrics.tradingStartBrokerTime 
                    ? new Date(metrics.tradingStartBrokerTime).toISOString().split('T')[0] 
                    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                balance: initialBalance,
                target: targetBalance,
                max_drawdown: maxDrawdownAmount
            },
            {
                date: new Date().toISOString().split('T')[0],
                balance: currentBalance,
                target: targetBalance,
                max_drawdown: maxDrawdownAmount
            }
        ];
    };
    
    /**
     * Genera datos de ejemplo para el gráfico basados en el balance inicial
     */
    const generateSampleData = (initialBalance) => {
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
                balance: balance,
                target: initialBalance * 1.1,
                equity: balance - (Math.random() * 500 - 250),
                max_drawdown: initialBalance * 0.9,
                max_daily_loss: balance * 0.95
            };
        });
    };

    // Mostrar indicador de carga
    if (loading) {
        return (
            <div className="flex justify-center items-center h-60 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--app-primary)]"></div>
            </div>
        );
    }

    // Mostrar error si lo hay
    if (error) {
        return (
            <div className="text-red-500 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg dark:bg-zinc-800  shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
                Error cargando datos del gráfico: {error}
            </div>
        );
    }

    // Mensaje cuando no hay datos
    if (chartData.length === 0) {
        return (
            <div className="text-center p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg  shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
                No hay datos disponibles para mostrar.
            </div>
        );
    }

    // Renderizar gráfico
    return (
        <>
            <h2 className="text-lg font-semibold mb-4">Evolución del Balance</h2>
            <div className="dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black ">
                <LineChart
                    data={chartData}
                    index="date"
                    categories={[
                        'target',
                        'balance',
                        'max_drawdown',
                    ]}
                    yFormatter={yFormatter}
                />
            </div>
        </>
    );
};

export default ChartMetadata;
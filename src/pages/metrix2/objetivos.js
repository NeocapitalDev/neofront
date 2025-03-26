// src/pages/historial/objetivos.js
"use client";

import React, { useState, useEffect } from "react";

// Custom SVG Icons
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 mr-2 rounded-lg text-white bg-green-500">
        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" />
    </svg>
);

const XMarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 mr-2 rounded-lg text-white bg-red-500">
        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);

// Utility function to format days
const formatDays = (days, minimumDays) => {
    // Asegurar que los días no sean negativos
    const integerDays = Math.max(0, Math.floor(days));
    // Evitar división por cero asegurando que minimumDays sea al menos 1 SOLO para el cálculo del porcentaje
    const safeMinimumDays = Math.max(1, minimumDays);
    const percentage = (integerDays / safeMinimumDays) * 100;
    return {
        displayDays: integerDays,
        displayPercentage: percentage.toFixed(2)
    };
};

// Utility function to format profit/loss
const formatProfit = (initialBalance, currentProfit, profitTarget) => {
    const profit = Math.max(0, currentProfit);

    // Calcular el porcentaje con respecto al objetivo, no al balance inicial
    const percentage = profit === 0 ? 0 : (profit / profitTarget) * 100;

    return {
        displayProfit: profit.toFixed(2),
        displayPercentage: percentage.toFixed(2),
        isTargetMet: profit >= profitTarget
    };
};

export default function Objetivos({ challengeConfig, metricsData, initBalance, phase }) {
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [objetivos, setObjetivos] = useState([]);

    // Asegúrate de que phase esté disponible (puede venir como 'pase' o 'phase')
    const currentPhase = phase;

    // Establecer un valor por defecto para el balance
    const balance = initBalance || 10000;

    useEffect(() => {
        if (!challengeConfig || !metricsData) return;

        // console.log("Datos para Objetivos:", { challengeConfig, metricsData, balance, currentPhase });

        // Extraer los datos reales del trading desde metricsData
        const tradeDayCount = Math.max(0, metricsData.daysSinceTradingStarted || 0);

        // CORRECCIÓN: Cálculo de pérdida máxima diaria (maxDailyDrawdown)
        let maxDailyDrawdown = 0;

        // Método 1: Búsqueda en dailyGrowth (mejor opción - datos diarios)
        if (Array.isArray(metricsData.dailyGrowth) && metricsData.dailyGrowth.length > 0) {
            // Buscar el día con la mayor pérdida (el valor negativo más grande en valor absoluto)
            metricsData.dailyGrowth.forEach(day => {
                if (day.profit !== undefined && day.profit < 0) {
                    const dailyLoss = Math.abs(day.profit);
                    if (dailyLoss > maxDailyDrawdown) {
                        maxDailyDrawdown = dailyLoss;
                    }
                } else if (day.drawdownProfit !== undefined && day.drawdownProfit > 0) {
                    // Alternativa: usar drawdownProfit si está disponible
                    if (day.drawdownProfit > maxDailyDrawdown) {
                        maxDailyDrawdown = day.drawdownProfit;
                    }
                }
            });
            // console.log("Pérdida máxima diaria encontrada en dailyGrowth:", maxDailyDrawdown);
        }
        // Método 2: Verificar en openTradesByHour para ver pérdidas por hora 
        else if (metricsData.openTradesByHour && metricsData.openTradesByHour.length > 0) {
            // Buscar la hora con la mayor pérdida
            metricsData.openTradesByHour.forEach(hourData => {
                if (hourData.lostProfit !== undefined && hourData.lostProfit < 0) {
                    const hourLoss = Math.abs(hourData.lostProfit);
                    if (hourLoss > maxDailyDrawdown) {
                        maxDailyDrawdown = hourLoss;
                    }
                }
            });
            // console.log("Pérdida máxima diaria encontrada en openTradesByHour:", maxDailyDrawdown);
        }
        // Método 3: Usar worstTrade como aproximación (es una sola operación pero puede ser indicativo)
        else if (metricsData.worstTrade !== undefined && metricsData.worstTrade < 0) {
            maxDailyDrawdown = Math.abs(metricsData.worstTrade);
            // console.log("Usando worstTrade como aproximación de pérdida diaria:", maxDailyDrawdown);
        }
        // Método 4: Usar periods.today.profit si es negativo
        else if (metricsData.periods &&
            metricsData.periods.today &&
            metricsData.periods.today.profit !== undefined &&
            metricsData.periods.today.profit < 0) {
            maxDailyDrawdown = Math.abs(metricsData.periods.today.profit);
            // console.log("Usando periods.today.profit como pérdida diaria:", maxDailyDrawdown);
        }
        // Método 5: Fallback a la pérdida total solo si no tenemos otra opción
        else if (metricsData.profit < 0) {
            maxDailyDrawdown = Math.abs(metricsData.profit);
            // console.log("ADVERTENCIA: Usando profit total como fallback para pérdida diaria:", maxDailyDrawdown);
        }

        // Para la pérdida máxima total (maxAbsoluteDrawdown), calcular basado en datos disponibles
        let maxAbsoluteDrawdown = 0;

        if (typeof metricsData.maxDrawdown === 'number') {
            // Si tenemos maxDrawdown como porcentaje, convertir a valor monetario
            maxAbsoluteDrawdown = (balance * metricsData.maxDrawdown) / 100;
            // console.log("Pérdida máxima calculada a partir de maxDrawdown (%):", maxAbsoluteDrawdown);
        } else if (metricsData.profit < 0) {
            // Si no hay dato específico, usar el profit negativo como approximación
            maxAbsoluteDrawdown = Math.abs(metricsData.profit);
            // console.log("Usando profit total como aproximación de pérdida máxima:", maxAbsoluteDrawdown);
        }

        // Para maxRelativeProfit, usamos profit del SDK (solo si es positivo)
        const maxRelativeProfit = metricsData.profit > 0 ? metricsData.profit : 0;

        // Obtener configuración del desafío (usar los nombres de propiedades correctos)
        // Mapear los nombres para soportar tanto los que vienen de historial como de metrix2
        const minimumTradingDays = challengeConfig.minimumTradingDays || 0;
        const maximumDailyLossPercent = challengeConfig.maximumDailyLossPercent || challengeConfig.maximumDailyLoss || 5;
        const maxDrawdownPercent = challengeConfig.maxDrawdownPercent || challengeConfig.maximumTotalLoss || 10;
        const profitTargetPercent = challengeConfig.profitTargetPercent || challengeConfig.profitTarget || 8;

        // Calcular los valores absolutos para los objetivos
        const maxDailyLossAmount = (balance * maximumDailyLossPercent) / 100;
        const maxTotalLossAmount = (balance * maxDrawdownPercent) / 100;
        const profitTargetAmount = (balance * profitTargetPercent) / 100;

        // Crear array de objetivos basado en la configuración del desafío
        const newObjetivos = [
            {
                nombre: `Mínimo ${minimumTradingDays} Días de Trading`,
                ...(() => {
                    const { displayDays, displayPercentage } = formatDays(
                        tradeDayCount,
                        minimumTradingDays
                    );
                    return {
                        resultado: `${displayDays} días (${displayPercentage}%)`,
                        estado: displayDays >= minimumTradingDays,
                    };
                })(),
                descripcion: "Este valor representa el número de sus días de trading activos medidos en la zona horaria CE(S)T.",
                videoUrl: "https://www.youtube.com/watch?v=lPd0uOoRzsY",
            },
            {
                nombre: `Pérdida máxima del día - $${maxDailyLossAmount.toFixed(2)}`,
                resultado: `$${maxDailyDrawdown.toFixed(2)} (${(
                    (maxDailyDrawdown / maxDailyLossAmount) * 100
                ).toFixed(2)}%)`,
                estado: maxDailyDrawdown <= maxDailyLossAmount,
                descripcion:
                    "Este valor representa la caída de capital más baja registrada en un día concreto. Contiene su P/L flotante y sólo puede ser sustituido por una pérdida mayor.",
                videoUrl: "https://www.youtube.com/watch?v=WaeBEto7Tkk",
            },
            {
                nombre: `Pérdida Máx. - $${maxTotalLossAmount.toFixed(2)}`,
                resultado: `$${maxAbsoluteDrawdown.toFixed(2)} (${(
                    (maxAbsoluteDrawdown / maxTotalLossAmount) * 100).toFixed(2)}%)`,
                estado: maxAbsoluteDrawdown <= maxTotalLossAmount,
                descripcion: "Este valor representa el capital registrado más bajo en su cuenta desde el momento en que se empezó a operar.",
                videoUrl: "https://www.youtube.com/watch?v=AsNUg0O-9iQ",
            },
        ];

        // Agregar objetivo de profit si está configurado
        if (profitTargetPercent) {
            const { displayProfit, displayPercentage, isTargetMet } = formatProfit(
                balance,
                maxRelativeProfit,
                profitTargetAmount
            );

            newObjetivos.push({
                nombre: `Objetivo de Beneficio - $${profitTargetAmount.toFixed(2)}`,
                resultado: `$${displayProfit} (${displayPercentage}%)`,
                estado: isTargetMet,
                descripcion: "Este valor representa su ganancia en el capital.",
                videoUrl: "https://www.youtube.com/watch?v=DWJts3chO_I",
            });
        }

        setObjetivos(newObjetivos);
    }, [challengeConfig, metricsData, balance, currentPhase]);

    const toggleExpand = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    // Si no hay datos de configuración o métricas, mostrar un mensaje de carga
    if (!challengeConfig || !metricsData) {
        return (
            <div className="border-gray-500 dark:border-zinc-800 dark:shadow-black bg-white rounded-md shadow-md dark:bg-zinc-800 dark:text-white p-6 text-center">
                <p>Cargando objetivos...</p>
            </div>
        );
    }

    // Si no hay objetivos calculados, mostrar un mensaje
    if (!objetivos.length) {
        return (
            <div className="border-gray-500 dark:border-zinc-800 dark:shadow-black bg-white rounded-md shadow-md dark:bg-zinc-800 dark:text-white p-6 text-center">
                <p>No hay datos de objetivos disponibles.</p>
            </div>
        );
    }

    return (
        <div className="border-gray-500 dark:border-zinc-800 dark:shadow-black bg-white rounded-md shadow-md dark:bg-zinc-800 dark:text-white">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-500 dark:border-zinc-600">
                        <th className="px-6 py-4 text-md text-start text-gray-700 dark:text-white">
                            Objetivos de Trading
                        </th>
                        <th className="px-6 py-4 text-md text-start text-gray-700 dark:text-white">
                            Resultados
                        </th>
                        <th className="px-6 py-4 text-md text-start text-gray-700 dark:text-white">
                            Estado
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {objetivos.map((obj, index) => (
                        <React.Fragment key={index}>
                            <tr
                                className={`cursor-pointer dark:hover:bg-zinc-700 hover:bg-gray-100 ${index === objetivos.length - 1 ? "" : "border-b border-gray-500 dark:border-zinc-600"
                                    }`}
                                onClick={() => toggleExpand(index)}
                            >
                                <td className="px-6 py-4 text-amber-400 font-semibold">
                                    {expandedIndex === index ? `- ${obj.nombre}` : `+ ${obj.nombre}`}
                                </td>
                                <td className="px-6 py-4 bg-gray-100 dark:bg-zinc-900">{obj.resultado}</td>
                                <td className="px-6 py-4">
                                    {obj.estado ? (
                                        <div className="flex items-center">
                                            <CheckIcon />
                                            <span>Aprobado</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <XMarkIcon />
                                            <span>No aprobado</span>
                                        </div>
                                    )}
                                </td>
                            </tr>
                            {expandedIndex === index && (
                                <tr>
                                    <td colSpan="3" className="text-center align-middle px-6 py-6">
                                        <div className="flex flex-col items-center">
                                            <p>{obj.descripcion}</p>
                                            <div className="mt-4 flex justify-center">
                                                <iframe
                                                    width="200"
                                                    src={obj.videoUrl.replace("watch?v=", "embed/")}
                                                    title="YouTube video"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    referrerPolicy="strict-origin-when-cross-origin"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
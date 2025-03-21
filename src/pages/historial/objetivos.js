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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mr-2 rounded-lg text-white bg-red-500">
        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);
const InfoIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd"></path>
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

    const balance = initBalance || 10000; // Valor por defecto si no hay balance inicial

    useEffect(() => {
        if (!challengeConfig || !metricsData) return;

        console.log("Datos de metricsData:", metricsData);
        // Extraer los datos reales del trading desde metricsData
        const tradeDayCount = Math.max(0, metricsData.daysSinceTradingStarted || 0);

        // CORRECCIÓN: Cálculo de pérdida máxima diaria real
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
            console.log("Pérdida máxima diaria encontrada en dailyGrowth:", maxDailyDrawdown);
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
            console.log("Pérdida máxima diaria encontrada en openTradesByHour:", maxDailyDrawdown);
        }
        // Método 3: Usar worstTrade como aproximación (es una sola operación pero puede ser indicativo)
        else if (metricsData.worstTrade !== undefined && metricsData.worstTrade < 0) {
            maxDailyDrawdown = Math.abs(metricsData.worstTrade);
            console.log("Usando worstTrade como aproximación de pérdida diaria:", maxDailyDrawdown);
        }
        // Método 4: Usar periods.today.profit si es negativo
        else if (metricsData.periods &&
            metricsData.periods.today &&
            metricsData.periods.today.profit !== undefined &&
            metricsData.periods.today.profit < 0) {
            maxDailyDrawdown = Math.abs(metricsData.periods.today.profit);
            console.log("Usando periods.today.profit como pérdida diaria:", maxDailyDrawdown);
        }
        // Método 5: Fallback a la pérdida total solo si no tenemos otra opción
        else if (metricsData.profit < 0) {
            maxDailyDrawdown = Math.abs(metricsData.profit);
            console.log("ADVERTENCIA: Usando profit total como fallback para pérdida diaria:", maxDailyDrawdown);
        }

        // Para la pérdida máxima total (maxDrawdown), calcular basado en datos disponibles
        let maxAbsoluteDrawdown = 0;

        if (typeof metricsData.maxDrawdown === 'number') {
            // Si tenemos maxDrawdown como porcentaje, convertir a valor monetario
            maxAbsoluteDrawdown = (balance * metricsData.maxDrawdown) / 100;
            console.log("Pérdida máxima calculada a partir de maxDrawdown (%):", maxAbsoluteDrawdown);
        } else if (metricsData.profit < 0) {
            // Si no hay dato específico, usar el profit negativo como approximación
            maxAbsoluteDrawdown = Math.abs(metricsData.profit);
            console.log("Usando profit total como aproximación de pérdida máxima:", maxAbsoluteDrawdown);
        }

        // Para maxRelativeProfit, usamos profit del SDK (solo si es positivo)
        const maxRelativeProfit = metricsData.profit > 0 ? metricsData.profit : 0;

        // Mapear los nombres de propiedades de challengeConfig
        const minimumTradingDays = challengeConfig.minimumTradingDays || 0;
        const maximumDailyLossPercent = challengeConfig.maximumDailyLoss || 5;
        const maxDrawdownPercent = challengeConfig.maximumTotalLoss || 10;
        const profitTargetPercent = challengeConfig.profitTarget || 8;

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
    }, [challengeConfig, metricsData, balance]);

    const toggleExpand = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    // Si no hay objetivos, no mostrar nada
    if (!objetivos.length) {
        return (
            <div className="border-gray-500 dark:border-zinc-800 dark:shadow-black bg-white rounded-md shadow-md dark:bg-zinc-800 dark:text-white p-6 text-center">
                <p>No hay datos de objetivos disponibles.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {objetivos.map((objetivo, index) => (
                <div key={index} className="rounded-md bg-zinc-800 dark:text-white overflow-hidden">
                    {/* Cabecera del objetivo */}
                    <div className="p-3">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="text-sm font-medium text-amber-400">{objetivo.nombre}</h3>
                            <button
                                onClick={() => toggleExpand(index)}
                                className="text-gray-400 hover:text-white"
                            >
                                <InfoIcon />
                            </button>
                        </div>

                        <div className="flex justify-between items-center mb-2 border-2">
                            <div className="text-base font-semibold">{objetivo.resultado}</div>
                            <div className="flex items-center">
                                <span className="mr-2">{objetivo.porcentaje}%</span>
                                <div className={`rounded-full w-full flex items-center justify-center ${objetivo.estado ? 'bg-green-500' : 'bg-red-500'}`}>
                                    {objetivo.estado ? <CheckIcon /> : <XMarkIcon />}
                                </div>
                            </div>
                        </div>

                        {/* Barra de progreso */}
                        {/* <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${objetivo.estado ? 'bg-amber-500' : 'bg-amber-500'}`}
                                style={{ width: `${Math.min(100, objetivo.porcentaje)}%` }}
                            ></div>
                        </div> */}

                        <div className="mt-1 text-xs text-gray-400">
                            {objetivo.subInfo}
                        </div>
                    </div>

                    {/* Contenido expandible */}
                    {expandedIndex === index && (
                        <div className="border-t border-gray-700 p-3">
                            <p className="text-sm text-gray-300 mb-2">{objetivo.descripcion}</p>
                            <div className="flex justify-center">
                                <iframe
                                    width="180"
                                    height="120"
                                    src={objetivo.videoUrl.replace("watch?v=", "embed/")}
                                    title="YouTube video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
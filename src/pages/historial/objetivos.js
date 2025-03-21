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

    const balance = initBalance || 10000; // Valor por defecto si no hay balance inicial

    useEffect(() => {
        if (!challengeConfig || !metricsData) return;

        console.log("Datos de metricsData:", metricsData);
        // Extraer los datos reales del trading desde metricsData
        const tradeDayCount = Math.max(0, metricsData.daysSinceTradingStarted || 0);

        // CORRECCIÓN: Para calcular pérdidas, usar directamente el valor absoluto del profit negativo
        // Esto asegura que tanto la pérdida diaria como la pérdida máxima usen el mismo valor
        let totalLoss = 0;
        
        // Usar el valor absoluto del profit negativo
        if (metricsData.profit < 0) {
            totalLoss = Math.abs(metricsData.profit);
        }
        
        // Si no hay profit negativo, intentar buscarlo en dailyGrowth
        else if (Array.isArray(metricsData.dailyGrowth) && metricsData.dailyGrowth.length > 0) {
            totalLoss = metricsData.dailyGrowth.reduce((total, day) => {
                if (day.profit < 0) {
                    return total + Math.abs(day.profit);
                }
                return total;
            }, 0);
        }
        
        // Usar el mismo valor para pérdida diaria y pérdida máxima
        const maxDailyDrawdown = totalLoss;
        const maxAbsoluteDrawdown = totalLoss;

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

    // Versión simplificada que se ajusta a la imagen de referencia
    return (
        <div className="border-gray-500 dark:border-zinc-800 dark:shadow-black bg-white rounded-md shadow-md dark:bg-zinc-800 dark:text-white">
            <div className="grid grid-cols-3 text-left">
                <div className="p-5 font-semibold">Objetivos de Trading</div>
                <div className="p-5 font-semibold">Resultados</div>
                <div className="p-5 font-semibold">Estado</div>
            </div>
            
            {objetivos.map((obj, index) => (
                <div 
                    key={index} 
                    className="grid grid-cols-3 text-left border-t border-gray-500 dark:border-zinc-700"
                >
                    <div className="p-5 text-amber-400">{obj.nombre}</div>
                    <div className="p-5">{obj.resultado}</div>
                    <div className="p-5">
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
                    </div>
                </div>
            ))}
        </div>
    );
}
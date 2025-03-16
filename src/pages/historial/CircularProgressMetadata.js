// src/pages/historial/CircularProgressMetadata.js
import { useState, useEffect } from "react";

// Componente individual de CircularProgress
const CircularProgress = ({ percentage = 0, size = 100, strokeWidth = 10, color = "green" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start = 0;
    const stepTime = 20;
    const increment = percentage / 50;

    const interval = setInterval(() => {
      start += increment;
      if (start >= percentage) {
        start = percentage;
        clearInterval(interval);
      }
      setProgress(start);
    }, stepTime);
    
    return () => clearInterval(interval);
  }, [percentage]);

  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Fondo del círculo */}
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="#222" strokeWidth={strokeWidth} fill="none" />
      {/* Barra de progreso */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
      />
      {/* Texto del porcentaje */}
      <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="20" fill={color} fontWeight="bold">
        {Math.round(progress)}%
      </text>
    </svg>
  );
};

// Componente principal que usa los datos de metadata
const CircularProgressMetadata = ({ metadata }) => {
  // Si no hay metadata, no renderizar nada
  if (!metadata) return null;

  // Datos calculados para los círculos de progreso
  // Usamos un valor por defecto (10000) si no tenemos el valor inicial del depósito
  // Si hay un balance inicial registrado en el objeto, lo usamos como valor inicial
  const initialBalance = metadata.deposits || 10000;
  const currentBalance = metadata.balance || initialBalance;
  const targetValue = initialBalance * 1.1; // 10% sobre balance inicial
  
  // 1. Objetivo de Profit (Target)
  let profitPercentage = 0;
  if (currentBalance <= initialBalance) {
    // Progreso negativo: qué porcentaje del objetivo hemos perdido
    profitPercentage = ((currentBalance - initialBalance) / initialBalance) * 100;
  } else if (currentBalance >= targetValue) {
    // Objetivo superado
    profitPercentage = 100;
  } else {
    // Progreso positivo hacia el objetivo
    profitPercentage = ((currentBalance - initialBalance) / (targetValue - initialBalance)) * 100;
  }
  
  const cappedProfitPercentage = Math.min(100, Math.max(0, profitPercentage));
  
  // 2. Drawdown Máximo
  const maxAllowedDrawdown = 10; // 10% es el máximo permitido típicamente
  
  // Calcular el drawdown si no está disponible directamente
  let currentDrawdownPercentage = 0;
  if (metadata.maxDrawdown !== undefined) {
    currentDrawdownPercentage = metadata.maxDrawdown;
  } else if (metadata.highestBalance && metadata.balance) {
    // Calcular el drawdown basado en la diferencia entre el balance más alto y el actual
    const drawdownAmount = metadata.highestBalance - metadata.balance;
    currentDrawdownPercentage = (drawdownAmount / metadata.highestBalance) * 100;
  }
  
  const drawdownUsagePercentage = (currentDrawdownPercentage / maxAllowedDrawdown) * 100;
  const cappedDrawdownPercentage = Math.min(100, Math.max(0, drawdownUsagePercentage));
  
  // 3. Win Rate
  const targetWinRate = 50; // 50% suele ser un buen objetivo
  
  // Calcular win rate si no está disponible directamente
  let currentWinRate = 0;
  if (metadata.wonTradesPercent !== undefined) {
    currentWinRate = metadata.wonTradesPercent;
  } else if (metadata.wonTrades !== undefined && metadata.trades !== undefined && metadata.trades > 0) {
    // Calcular win rate basado en trades ganados / total de trades
    currentWinRate = (metadata.wonTrades / metadata.trades) * 100;
  } else if (metadata.lostTradesPercent !== undefined) {
    // Si tenemos el porcentaje de trades perdidos, podemos deducir el win rate
    currentWinRate = 100 - metadata.lostTradesPercent;
  }
  
  const winRatePercentage = (currentWinRate / targetWinRate) * 100;
  const cappedWinRatePercentage = Math.min(100, Math.max(0, winRatePercentage));

  // Datos para los círculos de progreso
  const progressData = {
    target: {
      value: targetValue,
      current: currentBalance,
      percentage: cappedProfitPercentage,
      color: profitPercentage >= 100 ? "green" : profitPercentage < 0 ? "red" : "blue",
      label: "Objetivo de Profit"
    },
    drawdown: {
      value: maxAllowedDrawdown,
      current: currentDrawdownPercentage,
      percentage: cappedDrawdownPercentage,
      color: cappedDrawdownPercentage >= 80 ? "red" : cappedDrawdownPercentage >= 50 ? "yellow" : "green",
      label: "Drawdown Máximo"
    },
    winRate: {
      value: targetWinRate,
      current: currentWinRate,
      percentage: cappedWinRatePercentage,
      color: cappedWinRatePercentage >= 80 ? "green" : cappedWinRatePercentage >= 50 ? "blue" : "yellow",
      label: "Win Rate"
    },
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 text-white bg-black my-6 rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.keys(progressData).map((key) => {
          const item = progressData[key];
          const textColorClass = 
            item.color === "green" ? "text-green-500" : 
            item.color === "yellow" ? "text-yellow-500" : 
            item.color === "red" ? "text-red-500" : "text-blue-500";
          
          // Personalizar cómo se muestran los valores según el tipo de métrica
          let currentDisplay, targetDisplay;
          if (key === "target") {
            currentDisplay = `$${item.current.toFixed(2)}`;
            targetDisplay = `$${item.value.toFixed(2)}`;
          } else if (key === "drawdown") {
            currentDisplay = `${item.current.toFixed(2)}%`;
            targetDisplay = `${item.value.toFixed(2)}%`;
          } else if (key === "winRate") {
            currentDisplay = `${item.current.toFixed(2)}%`;
            targetDisplay = `${item.value.toFixed(2)}%`;
          }
          
          return (
            <div key={key} className="flex gap-4">
              <CircularProgress 
                percentage={item.percentage} 
                color={
                  item.color === "green" ? "#10B981" : 
                  item.color === "yellow" ? "#F59E0B" : 
                  item.color === "red" ? "#EF4444" : "#3B82F6"
                } 
              />
              <div>
                <p className="text-gray-400">{item.label}</p>
                <p className="text-xl font-bold">{targetDisplay}</p>
                <p className={textColorClass}>Actual</p>
                <p className={`${textColorClass} font-bold`}>{currentDisplay}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CircularProgressMetadata;
// src/pages/historial/CircularProgressMetadata.js
'use client'
import { useState, useEffect } from "react";

// Componente CircularProgress (barra circular) - versión más compacta
const CircularProgress = ({ percentage = 0, size = 80, strokeWidth = 8, color = "green" }) => {
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
      <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="16" fill={color} fontWeight="bold">
        {Math.round(progress)}%
      </text>
    </svg>
  );
};

// Componente principal - versión compacta
const CircularProgressMetadata = ({ metadata, stageConfig, initialBalance }) => {
  const [progressData, setProgressData] = useState({
    target: { value: 0, current: 0, percentage: 0, color: "green", label: "Objetivo de Profit" },
    drawdown: { value: 0, current: 0, percentage: 0, color: "yellow", label: "Drawdown Máximo" },
    profitFactor: { value: 2, current: 0, percentage: 0, color: "amber", label: "Profit Factor" },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (!metadata) {
      setLoading(false);
      setHasData(false);
      return;
    }

    try {
      // Utilizar datos procesados correctamente
      const metrics = metadata;

      // Verificar si hay datos válidos para mostrar
      const hasValidData = metrics &&
        (metrics.balance !== undefined ||
          metrics.maxDrawdown !== undefined ||
          metrics.profitFactor !== undefined);

      if (!hasValidData) {
        setHasData(false);
        setLoading(false);
        return;
      }

      // Obtener el balance inicial desde los props
      const deposit = initialBalance || metrics.deposits || metrics.initialBalance || 10000;

      // Obtener valores de configuración desde stageConfig
      let profitTargetPercent = 10; // Valor por defecto
      let maxAllowedDrawdownPercent = 10; // Valor por defecto

      if (stageConfig) {
        // Obtener profit target del stageConfig
        if (typeof stageConfig.profitTarget === 'number') {
          profitTargetPercent = stageConfig.profitTarget;
        } else if (typeof stageConfig.profitTargetPercent === 'number') {
          profitTargetPercent = stageConfig.profitTargetPercent;
        }

        // Obtener drawdown del stageConfig
        if (typeof stageConfig.maximumTotalLoss === 'number') {
          maxAllowedDrawdownPercent = stageConfig.maximumTotalLoss;
        } else if (typeof stageConfig.maxDrawdownPercent === 'number') {
          maxAllowedDrawdownPercent = stageConfig.maxDrawdownPercent;
        } else if (typeof stageConfig.maximumDailyLoss === 'number') {
          maxAllowedDrawdownPercent = stageConfig.maximumDailyLoss;
        }
      }

      // Cálculos para las barras circulares
      calculateProgressData(
        deposit,
        maxAllowedDrawdownPercent,
        profitTargetPercent,
        metrics
      );

      setHasData(true);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Error desconocido");
      setHasData(false);
      setLoading(false);
    }
  }, [metadata, stageConfig, initialBalance]);

  /**
   * Función calculateProgressData para el componente de historial
   */
  const calculateProgressData = (deposit, ddPercent, profitTargetPercent, metricsData) => {
    if (!metricsData) return;

    // 1) Objetivo de Profit:
    const currentBalance = metricsData.balance || deposit;
    const targetValue = deposit + (deposit * profitTargetPercent / 100);

    let profitPercentage = 0;
    if (currentBalance <= deposit) {
      profitPercentage = 0;
    } else if (currentBalance >= targetValue) {
      profitPercentage = 100;
    } else {
      profitPercentage = ((currentBalance - deposit) / (targetValue - deposit)) * 100;
    }
    const cappedProfitPercentage = Math.min(100, Math.max(0, profitPercentage));

    // 2) Drawdown Máximo
    const drawdownAllowed = ddPercent;
    const drawdownReal = metricsData.maxDrawdown || 0; // % real
    let drawdownPercentage = (drawdownReal / drawdownAllowed) * 100;
    const cappedDrawdownPercentage = Math.min(100, Math.max(0, drawdownPercentage));

    // 3) Profit Factor
    const targetProfitFactor = 2;
    const currentProfitFactor = metricsData.profitFactor || 0;
    let profitFactorPercentage = (currentProfitFactor / targetProfitFactor) * 100;
    const cappedProfitFactorPercentage = Math.min(100, Math.max(0, profitFactorPercentage));

    setProgressData({
      // Objetivo de Profit - Nuevo esquema: rojo < 40%, amarillo 40-80%, verde > 80%
      target: {
        value: targetValue,
        current: currentBalance,
        percentage: cappedProfitPercentage,
        color:
          cappedProfitPercentage >= 80 ? "green" :
            cappedProfitPercentage >= 40 ? "yellow" :
              "red",
        label: "Objetivo de Profit"
      },
      // Drawdown Máximo - Nuevo esquema: verde < 40%, amarillo 40-80%, rojo > 80%
      drawdown: {
        value: drawdownAllowed,
        current: drawdownReal,
        percentage: cappedDrawdownPercentage,
        color:
          cappedDrawdownPercentage >= 80 ? "red" :
            cappedDrawdownPercentage >= 40 ? "yellow" :
              "green",
        label: "Drawdown Máximo"
      },
      // Profit Factor - Nuevo esquema: rojo < 40%, amarillo 40-80%, verde > 80%
      profitFactor: {
        value: targetProfitFactor,
        current: currentProfitFactor,
        percentage: cappedProfitFactorPercentage,
        color:
          cappedProfitFactorPercentage >= 80 ? "green" :
            cappedProfitFactorPercentage >= 40 ? "yellow" :
              "red",
        label: "Profit Factor"
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4 text-white bg-black my-3 rounded-md">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        <span className="ml-2 text-sm">Cargando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-3 text-red-500 bg-black my-3 rounded-md text-sm">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="text-center p-3 bg-black rounded-lg shadow-md text-white border-zinc-700 shadow-black my-3 text-sm">
        No hay datos disponibles para mostrar.
      </div>
    );
  }

  // Definir los colores hexadecimales para cada color
  const getColorHex = (colorName) => {
    switch (colorName) {
      case "green":
        return "#10B981"; // Verde más intenso
      case "yellow":
        return "#F59E0B"; // Amarillo ámbar
      case "red":
        return "#EF4444"; // Rojo más intenso
      case "amber":
        return "#FBBF24"; // Amber 400
      default:
        return "#FBBF24"; // Amber 400 por defecto
    }
  };

  // Renderizado compacto y responsivo
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3  bg-black py-2 px-3 rounded-xl">
        {Object.keys(progressData).map((key) => {
          const item = progressData[key];
          const textColorClass =
            item.color === "green" ? "text-green-500" :
              item.color === "yellow" ? "text-yellow-500" :
                item.color === "red" ? "text-red-500" :
                  "text-amber-400";

          // Formatear la visualización
          let currentDisplay, targetDisplay;
          if (key === "target") {
            currentDisplay = `$${item.current.toFixed(2)}`;
            targetDisplay = `$${item.value.toFixed(2)}`;
          } else if (key === "drawdown") {
            currentDisplay = `${item.current.toFixed(2)}%`;
            targetDisplay = `${item.value.toFixed(2)}%`;
          } else if (key === "profitFactor") {
            currentDisplay = item.current.toFixed(2);
            targetDisplay = item.value.toFixed(2);
          }

          return (
            <div key={key} className="flex items-center space-x-2 p-2 bg-zinc-900 rounded-md">
              <CircularProgress
                percentage={item.percentage}
                color={getColorHex(item.color)}
                size={60}
                strokeWidth={6}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                <p className="text-sm font-bold mb-1">{targetDisplay}</p>
                <div className="flex justify-between items-center">
                  <p className={`text-xs ${textColorClass}`}>Actual:</p>
                  <p className={`text-xs font-bold ${textColorClass}`}>{currentDisplay}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default CircularProgressMetadata;
import React, { useState, useEffect } from "react";

export default function BarraWinLose({ data }) {
  console.log(data)

  const [metrics, setMetrics] = useState({
    averageWin: 0,
    averageLoss: 0,
    wonTradesPercent: 0,
    lostTradesPercent: 0,
  });

  useEffect(() => {
    if (data?.metrics) {
      setMetrics({
        averageWin: data.metrics.averageWin || 0,
        averageLoss: data.metrics.averageLoss || 0,
        wonTradesPercent: data.metrics.wonTradesPercent || 0,
        lostTradesPercent: data.metrics.lostTradesPercent || 0,
      });
    }
  }, [data]);

  // Manejo condicional para evitar renderizar datos incorrectos
  if (!data?.metrics) {
    return <p className="text-gray-500">Cargando datos...</p>;
  }

  return (
    <div className="pt-5">
      <p className="text-lg font-semibold mb-4">Progreso de Win/Lose</p>
      <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700 h-6 relative">
        {/* Porcentaje y cantidad de Wins */}
        <div
          className="absolute top-0 left-0 h-full bg-amber-500 rounded-l-xl text-xs font-medium text-center text-blue-100 flex items-center justify-center"
          style={{ width: `${metrics.wonTradesPercent}%` }}
        >
          ${metrics.averageWin.toLocaleString()} Wins
        </div>
        {/* Porcentaje y cantidad de Losses */}
        <div
          className="absolute top-0 h-full bg-red-600 rounded-r-full text-xs font-medium text-center text-red-100 flex items-center justify-center"
          style={{
            left: `${metrics.wonTradesPercent}%`,
            width: `${metrics.lostTradesPercent}%`,
          }}
        >
          ${metrics.averageLoss.toLocaleString()} Losses
        </div>
      </div>
    </div>
  );
}

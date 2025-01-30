import React, { useState, useEffect } from "react";

export default function BarraWinLose({ data }) {
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
    <div className="p-2 bg-white shadow-md dark:bg-[#0A0A0A]">
      <div className="w-full mx-auto bg-gray-200 rounded-full dark:bg-gray-700 h-6 relative overflow-hidden">
        {/* Porcentaje y cantidad de Wins */}
        {metrics.wonTradesPercent > 0 && (
          <div
            className="absolute top-0 left-0 h-full bg-amber-600 text-xs font-medium text-center text-blue-100 flex items-center justify-center"
            style={{
              width: `${metrics.wonTradesPercent}%`,
              borderTopRightRadius:
                metrics.wonTradesPercent === 100 ? "0" : "9999px",
              borderBottomRightRadius:
                metrics.wonTradesPercent === 100 ? "0" : "9999px",
            }}
          >
            {`$${metrics.averageWin.toLocaleString()}`}
          </div>
        )}
        {/* Porcentaje y cantidad de Losses */}
        {metrics.lostTradesPercent > 0 && (
          <div
            className="absolute top-0 h-full bg-red-600 text-xs font-medium text-center text-red-100 flex items-center justify-center"
            style={{
              left: `${metrics.wonTradesPercent}%`,
              width: `${metrics.lostTradesPercent}%`,
              borderTopLeftRadius:
                metrics.lostTradesPercent === 100 ? "0" : "9999px",
              borderBottomLeftRadius:
                metrics.lostTradesPercent === 100 ? "0" : "9999px",
            }}
          >
            {`$${metrics.averageLoss.toLocaleString()}`}
          </div>
        )}
      </div>
    </div>
  );
}

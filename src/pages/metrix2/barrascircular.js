// src/pages/metrix2/barracircular.js
'use client'
import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { MetaStats } from 'metaapi.cloud-sdk';

// Componente CircularProgress
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

// Componente principal Dashboard
const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brokerAccountData, setBrokerAccountData] = useState(null);
  const router = useRouter();
  const { idcuenta } = router.query;
  
  // Datos calculados para los círculos de progreso
  const [progressData, setProgressData] = useState({
    target: { value: 10000, current: 0, percentage: 0, color: "green", label: "Objetivo de Profit" },
    drawdown: { value: 0, current: 0, percentage: 0, color: "yellow", label: "Drawdown Máximo" },
    winRate: { value: 100, current: 0, percentage: 0, color: "blue", label: "Win Rate" },
  });

  useEffect(() => {
    // Solo proceder si tenemos el ID de la cuenta
    if (!idcuenta) return;

    const fetchMetricsData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Obtener datos del challenge para conseguir el accountId y balance inicial
        const challengeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenges/${idcuenta}?populate=broker_account`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!challengeResponse.ok) {
          throw new Error(`Error obteniendo datos del challenge: ${challengeResponse.status}`);
        }

        const challengeData = await challengeResponse.json();
        const accountId = challengeData?.data?.broker_account?.idMeta;
        
        // Guardar los datos del broker account
        const brokerAccount = challengeData?.data?.broker_account;
        setBrokerAccountData(brokerAccount);
        
        // Asegurarse de que el balance inicial se obtiene del broker account
        const initialBalance = brokerAccount?.balance || 10000;
        console.log("Balance inicial del broker account:", initialBalance);

        if (!accountId) {
          throw new Error("No se encontró el ID de la cuenta MetaAPI");
        }

        // Obtener métricas usando MetaStats
        const metaStats = new MetaStats(process.env.NEXT_PUBLIC_TOKEN_META_API);
        const metricsData = await metaStats.getMetrics(accountId);
        console.log("Métricas obtenidas:", metricsData);
        setMetrics(metricsData);

        // Calcular los valores para los círculos de progreso
        calculateProgressData(metricsData, initialBalance);
      } catch (err) {
        console.error("Error obteniendo métricas:", err);
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchMetricsData();
  }, [idcuenta]);

  // Función para calcular los datos de progreso basado en las métricas reales
  const calculateProgressData = (metricsData, initialBalance) => {
    if (!metricsData) return;

    // 1. Objetivo de Profit (Target)
    const targetValue = initialBalance * 1.1; // 10% sobre balance inicial del broker account
    const currentBalance = metricsData.balance || initialBalance;
    
    // Calcular el porcentaje de progreso hacia el objetivo
    // Si el balance actual es menor que el inicial, el porcentaje será negativo
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
    // La métrica maxDrawdown ya viene en porcentaje, pero necesitamos calcular cuánto representa
    // del máximo permitido (generalmente 10%)
    const maxAllowedDrawdown = 10; // 10% es el máximo permitido típicamente
    const currentDrawdownPercentage = metricsData.maxDrawdown || 0;
    const drawdownUsagePercentage = (currentDrawdownPercentage / maxAllowedDrawdown) * 100;
    const cappedDrawdownPercentage = Math.min(100, Math.max(0, drawdownUsagePercentage));
    
    // 3. Win Rate
    const targetWinRate = 50; // 50% suele ser un buen objetivo
    const currentWinRate = metricsData.wonTradesPercent || 0;
    const winRatePercentage = (currentWinRate / targetWinRate) * 100;
    const cappedWinRatePercentage = Math.min(100, Math.max(0, winRatePercentage));

    // Actualizar estado con los datos calculados
    setProgressData({
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
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 text-white bg-black my-6 rounded-md">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="ml-3">Cargando métricas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 text-red-500 bg-black my-6 rounded-md">
        <p>Error: {error}</p>
      </div>
    );
  }

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

export default Dashboard;
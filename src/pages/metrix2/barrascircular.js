'use client'
import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { MetaStats } from 'metaapi.cloud-sdk';

// Componente CircularProgress (barra circular)
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
  const [progressData, setProgressData] = useState({
    target: { value: 0, current: 0, percentage: 0, color: "green", label: "Objetivo de Profit" },
    drawdown: { value: 0, current: 0, percentage: 0, color: "yellow", label: "Drawdown Máximo" },
    winRate: { value: 50, current: 0, percentage: 0, color: "blue", label: "Win Rate" },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();
  const { idcuenta } = router.query;

  useEffect(() => {
    if (!idcuenta) return;

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Obtener datos del challenge (Strapi) -> broker_account.balance
        const challengeUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenges/${idcuenta}?populate=broker_account`;
        const challengeRes = await fetch(challengeUrl, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        });
        if (!challengeRes.ok) {
          throw new Error(`Error obteniendo datos del challenge: ${challengeRes.status}`);
        }
        const challengeData = await challengeRes.json();
        const accountId = challengeData?.data?.broker_account?.idMeta;
        // Balance inicial
        const deposit = challengeData?.data?.broker_account?.balance || 10000;

        if (!accountId) {
          throw new Error("No se encontró el ID de la cuenta MetaAPI (idMeta).");
        }

        // 2. Obtener maxDrawdown y profitTarget desde ChallengeRelation (filtrando por documentId)
        const relationUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-relations?filters[challenges][documentId][$eq]=${idcuenta}&populate=*`;
        const relationRes = await fetch(relationUrl, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        });
        if (!relationRes.ok) {
          throw new Error(`Error obteniendo datos de ChallengeRelation: ${relationRes.status}`);
        }
        const relationData = await relationRes.json();

        // Ejemplo: data[0].maxDrawdown y data[0].profitTarget
        const ddPercent = relationData?.data?.[0]?.maxDrawdown || 10;
        const profitTargetPercent = relationData?.data?.[0]?.profitTarget || 10;

        // 3. Obtener métricas reales desde Meta API
        const metaStats = new MetaStats(process.env.NEXT_PUBLIC_TOKEN_META_API);
        const metricsData = await metaStats.getMetrics(accountId);
        console.log("Métricas de Meta API:", metricsData);

        // 4. Calcular los datos para las barras circulares
        calculateProgressData(deposit, ddPercent, profitTargetPercent, metricsData);
      } catch (err) {
        console.error("Error general:", err);
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [idcuenta]);

  /**
   * Combina:
   * - deposit: balance inicial (Strapi)
   * - ddPercent (maxDrawdown permitido)
   * - profitTargetPercent (profitTarget permitido)
   * - metricsData: (balance actual, maxDrawdown real, wonTradesPercent, etc.)
   */
  const calculateProgressData = (deposit, ddPercent, profitTargetPercent, metricsData) => {
    if (!metricsData) return;

    // 1) Objetivo de Profit:
    //    - Si el balance actual está por debajo del inicial => 0%
    //    - Si está por encima o igual al target => 100%
    //    - En rango intermedio => porcentaje lineal
    const currentBalance = metricsData.balance || deposit;
    const targetValue = deposit + (deposit * profitTargetPercent / 100); // Ej: deposit=10000, profitTarget=2 => 10200

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

    // 3) Win Rate
    const targetWinRate = 50;
    const currentWinRate = metricsData.wonTradesPercent || 0;
    let winRatePercentage = (currentWinRate / targetWinRate) * 100;
    const cappedWinRatePercentage = Math.min(100, Math.max(0, winRatePercentage));

    setProgressData({
      // Objetivo de Profit
      target: {
        value: targetValue,
        current: currentBalance,
        percentage: cappedProfitPercentage,
        color:
          cappedProfitPercentage >= 100 ? "green" :
          cappedProfitPercentage <= 0 ? "red" :
          "blue",
        label: "Objetivo de Profit"
      },
      // Drawdown Máximo
      drawdown: {
        value: drawdownAllowed,
        current: drawdownReal,
        percentage: cappedDrawdownPercentage,
        color:
          cappedDrawdownPercentage >= 80 ? "red" :
          cappedDrawdownPercentage >= 50 ? "yellow" :
          "green",
        label: "Drawdown Máximo"
      },
      // Win Rate
      winRate: {
        value: targetWinRate,
        current: currentWinRate,
        percentage: cappedWinRatePercentage,
        color:
          cappedWinRatePercentage >= 80 ? "green" :
          cappedWinRatePercentage >= 50 ? "blue" :
          "yellow",
        label: "Win Rate"
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 text-white bg-black my-6 rounded-md">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="ml-3">Cargando datos...</span>
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
            item.color === "red" ? "text-red-500" :
            "text-blue-500";

          // Formatear la visualización
          let currentDisplay, targetDisplay;
          if (key === "target") {
            // Ej: "$9800.00" / "$10200.00"
            currentDisplay = `$${item.current.toFixed(2)}`;
            targetDisplay = `$${item.value.toFixed(2)}`;
          } else if (key === "drawdown") {
            // Ej: "6.00%" / "10.00%"
            currentDisplay = `${item.current.toFixed(2)}%`;
            targetDisplay = `${item.value.toFixed(2)}%`;
          } else if (key === "winRate") {
            // Ej: "30.00%" / "50.00%"
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
                  item.color === "red" ? "#EF4444" :
                  "#3B82F6"
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

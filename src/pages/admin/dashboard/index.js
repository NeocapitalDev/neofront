"use client";

import DashboardLayout from "..";
import { useState, useEffect } from "react";
import { BanknotesIcon, FlagIcon, HandRaisedIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { useWooCommerce } from "@/services/useWoo";
import { useStrapiData } from "@/services/strapiService";
import { useAllOrders } from "@/services/allOrders";

const tabs = ["General", "Risk"];
const timeframes = [
  "This Week",
  "This Month",
  "Last 3 Months",
  "Last 6 Months",
  "All History",
];

// Valores por defecto (fallbacks) para cuando no se proporcionan datos
const defaultCohortStats = [
  { id: "totalSales", label: "Total Ventas", value: "$0.00" },
  { id: "totalOrders", label: "Total Pedidos", value: "0" }, // Nueva métrica para pedidos
  { id: "totalChallenges", label: "Challenges Totales", value: "0" },
  { id: "newChallenges", label: "Nuevos Challenges (Hoy)", value: "0" }, // Actualizado para indicar que es diario
  { id: "prevActiveChallenges", label: "Number of Prev. Active Challenges", value: "0" },
  { id: "winningChallenges", label: "Challenges Ganados", value: "1" },
  { id: "lostChallenges", label: "Challenges Perdidos", value: "0" },
  { id: "recurrentUsers", label: "% Recurrent Users", value: "0" },
  { id: "brokenRules", label: "Most Broken Rules", value: "-" },
];

export default function Index() {
  const [selectedTab, setSelectedTab] = useState("General");
  const [selectedTimeframe, setSelectedTimeframe] = useState("This Week");
  const [cohortStatsData, setCohortStatsData] = useState({});
  const [stats, setStats] = useState([
    { label: "0.00", subLabel: "from 0 Challenge" },
    { label: "0.00", subLabel: "from 0 Challenge" },
    { label: "0.00", subLabel: "from 0 Challenge" },
  ]);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [todayRange, setTodayRange] = useState({ startDate: "", endDate: "" });

  // Función para obtener las fechas del día actual (para nuevos challenges)
  useEffect(() => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    setTodayRange({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  }, []);

  // Función para obtener las fechas según el timeframe seleccionado
  useEffect(() => {
    const calculateDateRange = () => {
      const now = new Date();
      let startDate = new Date();
      const endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      switch (selectedTimeframe) {
        case "This Week":
          // Ajustar al inicio de la semana (domingo)
          const dayOfWeek = now.getDay();
          startDate.setDate(now.getDate() - dayOfWeek);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "This Month":
          // Ajustar al inicio del mes
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "Last 3 Months":
          // Ajustar a 3 meses atrás
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case "Last 6 Months":
          // Ajustar a 6 meses atrás
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          break;
        case "All History":
          // Usar una fecha muy antigua para obtener todo
          startDate = new Date(2000, 0, 1);
          break;
        default:
          // Por defecto, ajustar a hoy
          startDate.setHours(0, 0, 0, 0);
      }

      setDateRange({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
    };

    calculateDateRange();
  }, [selectedTimeframe]);

  // 1. Obtener órdenes según el timeframe
  const {
    data: filteredOrders,
    error: filteredOrdersError,
    isLoading: filteredOrdersLoading,
    refetch: refetchFilteredOrders
  } = useWooCommerce(
    dateRange.startDate && dateRange.endDate ?
      `orders?after=${dateRange.startDate}&before=${dateRange.endDate}&per_page=100` : null
  );

  // 2. Obtener todos los productos
  const {
    data: products,
    error: productsError,
    isLoading: productsLoading
  } = useWooCommerce('products/10576/variations?per_page=100');
  console.log("productos: ", products)
  // 3. Obtener retos según el timeframe
  const {
    data: filteredChallenges,
    error: filteredChallengesError,
    isLoading: filteredChallengesLoading,
    refetch: refetchFilteredChallenges
  } = useStrapiData(
    dateRange.startDate && dateRange.endDate ?
      `challenges?filters[createdAt][$gte]=${dateRange.startDate}&filters[createdAt][$lte]=${dateRange.endDate}` : null
  );

  // 3.1 Obtener retos del día actual (independiente del timeframe)
  const {
    data: todayChallenges,
    error: todayChallengesError,
    isLoading: todayChallengesLoading
  } = useStrapiData(
    todayRange.startDate && todayRange.endDate ?
      `challenges?filters[createdAt][$gte]=${todayRange.startDate}&filters[createdAt][$lte]=${todayRange.endDate}` : null
  );

  // 4. Usar el hook personalizado para obtener todas las órdenes
  const { allOrders, isLoading: allOrdersLoading, isComplete } = useAllOrders();

  // 5. Total de challenges
  const {
    data: totalChallenges,
    error: totalChallengesError,
    isLoading: totalChallengesLoading
  } = useStrapiData('challenges');

  // 6. Total de challenges ganadores según timeframe
  const {
    data: winningChallengesFiltered,
    error: winningChallengesFilteredError,
    isLoading: winningChallengesFilteredLoading,
    refetch: refetchWinningChallenges
  } = useStrapiData(
    dateRange.startDate && dateRange.endDate ?
      `challenges?filters[result][$eq]=approved&filters[createdAt][$gte]=${dateRange.startDate}&filters[createdAt][$lte]=${dateRange.endDate}` : null
  );

  // 7. Total de challenges perdidos según timeframe
  const {
    data: lostChallengesFiltered,
    error: lostChallengesFilteredError,
    isLoading: lostChallengesFilteredLoading,
    refetch: refetchLostChallenges
  } = useStrapiData(
    dateRange.startDate && dateRange.endDate ?
      `challenges?filters[result][$eq]=disapproved&filters[createdAt][$gte]=${dateRange.startDate}&filters[createdAt][$lte]=${dateRange.endDate}` : null
  );

  // Refetch data when timeframe changes
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      refetchFilteredOrders && refetchFilteredOrders();
      refetchFilteredChallenges && refetchFilteredChallenges();
      refetchWinningChallenges && refetchWinningChallenges();
      refetchLostChallenges && refetchLostChallenges();
    }
  }, [dateRange]);

  // Procesar los datos cuando estén disponibles
  useEffect(() => {
    // Verificar que tenemos todos los datos necesarios
    if (
      !filteredOrdersLoading &&
      !filteredChallengesLoading &&
      !todayChallengesLoading &&
      !allOrdersLoading &&
      !totalChallengesLoading &&
      !winningChallengesFilteredLoading &&
      !lostChallengesFilteredLoading &&
      dateRange.startDate &&
      dateRange.endDate &&
      todayRange.startDate
    ) {
      // Calcular el total de ventas para el periodo seleccionado
      const totalSales = filteredOrders?.reduce((sum, order) => {
        return sum + (parseFloat(order.total) || 0);
      }, 0) || 0;

      // Cantidad de pedidos para el periodo seleccionado
      const totalOrdersCount = filteredOrders?.length || 0;

      // Contar challenges nuevos del día (siempre diario)
      const newChallengesCount = todayChallenges?.length || 0;

      // Actualizar el estado con los datos calculados
      setCohortStatsData({
        totalSales: `$${totalSales.toFixed(2)}`,
        totalOrders: totalOrdersCount.toString(),
        totalChallenges: totalChallenges?.length.toString() || "0",
        newChallenges: newChallengesCount.toString(),
        winningChallenges: winningChallengesFiltered?.length.toString() || "0",
        lostChallenges: lostChallengesFiltered?.length.toString() || "0",
        // Otros campos pueden requerir lógica específica
      });

      // Actualizar los stats de la parte superior
      setStats([
        {
          label: `$${totalSales.toFixed(2)}`,
          subLabel: `from ${totalOrdersCount} Orders`
        },
        {
          label: newChallengesCount.toString(),
          subLabel: `New Challenges (Today)` // Siempre muestra "Today" para claridad
        },
        {
          label: winningChallengesFiltered?.length.toString() || "0",
          subLabel: `Winning Challenges (${selectedTimeframe})`
        },
      ]);
    }
  }, [
    filteredOrders,
    filteredChallenges,
    todayChallenges,
    winningChallengesFiltered,
    lostChallengesFiltered,
    totalChallenges,
    dateRange,
    todayRange,
    filteredOrdersLoading,
    filteredChallengesLoading,
    todayChallengesLoading,
    winningChallengesFilteredLoading,
    lostChallengesFilteredLoading,
    totalChallengesLoading,
    selectedTimeframe
  ]);

  // Combinar los datos recibidos con los valores por defecto
  const cohortStats = defaultCohortStats.map(stat => ({
    ...stat,
    value: cohortStatsData[stat.id] !== undefined ? cohortStatsData[stat.id] : stat.value
  }));

  // Indicador de carga
  const isLoading =
    filteredOrdersLoading ||
    filteredChallengesLoading ||
    todayChallengesLoading ||
    totalChallengesLoading ||
    winningChallengesFilteredLoading ||
    lostChallengesFilteredLoading ||
    !dateRange.startDate ||
    !todayRange.startDate;

  return (
    <DashboardLayout>
      <div className="p-8 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 rounded-lg shadow-lg min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            {tabs.map((tab) => (
              <Button
                key={tab}
                className={`px-4 py-2 rounded-lg ${selectedTab === tab ? "bg-[var(--app-secondary)]" : "bg-zinc-800"
                  }`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 items-center mb-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <select
            className="bg-zinc-700 text-white px-4 py-2 rounded-lg"
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
          >
            {timeframes.map((timeframe) => (
              <option key={timeframe} value={timeframe}>
                {timeframe}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {[BanknotesIcon, FlagIcon, HandRaisedIcon].map((Icon, index) => (
            <div key={index} className="bg-zinc-800 p-6 rounded-lg text-center">
              <Icon className="w-11 text-[var(--app-secondary)] text-sm mx-auto" />
              <p className="text-xl font-bold mt-2">{stats[index].label}</p>
              <p className="text-zinc-400">{stats[index].subLabel}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mt-8">Cohort Stats ({selectedTimeframe})</h2>
        {isLoading ? (
          <div className="mt-4 p-4 bg-zinc-800 rounded-lg text-center">
            <p>Loading data...</p>
          </div>
        ) : (
          <CohortStatsTable cohortStats={cohortStats} />
        )}
      </div>
    </DashboardLayout>
  );
}

// Función para la tabla de estadísticas
export function CohortStatsTable({ cohortStats }) {
  return (
    <div className="rounded-lg mt-4 border-zinc-800">
      <table className="w-full text-left text-zinc-300 border border-zinc-800">
        <thead>
          <tr className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border-b border-zinc-800">
            <th className="p-3 border border-zinc-800">Metric</th>
            <th className="p-3 border border-zinc-800">Value</th>
          </tr>
        </thead>
        <tbody>
          {cohortStats.map((stat, index) => (
            <tr key={index} className="border-b border-zinc-600 bg-[var(--app-primary)]">
              <td className="p-3 font-semibold text-black border border-zinc-800">
                {stat.label}
              </td>
              <td className="p-3 font-bold text-black border border-zinc-800">
                {stat.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
// src/pages/metrix2/[idcuenta].js
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import Layout from "../../components/layout/dashboard";
import Loader from "../../components/loaders/loader";
import { PhoneIcon, ChartBarIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import CredencialesModal from "../dashboard/credentials";
import Link from "next/link";
import { MetaStats } from 'metaapi.cloud-sdk';
import WinLoss from "./winloss";
import Statistics from './statistics';

// Ajusta la ruta de estos imports a donde tengas tus componentes
import MyPage from "./grafico";           // Gráfica
import Dashboard from "src/pages/metrix2/barrascircular"; // Barras circulares
import Objetivos from "./objetivos";

import RelatedChallenges from "../../components/challenges/RelatedChallenges";

/**
 * Fetcher genérico para SWR
 */
const fetcher = (url) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

const Metrix = () => {
  const router = useRouter();
  const { idcuenta } = router.query;

  // 1. Obtener Challenge con SWR
  const { data: challengeData, error, isLoading } = useSWR(
    idcuenta
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenges/${idcuenta}?populate=broker_account`
      : null,
    fetcher
  );

  // 2. Guardar el equity-chart en apiResult
  const [apiResult, setApiResult] = useState(null);

  // 3. Guardar métricas de MetaStats
  const [metricsData, setMetricsData] = useState(null);
  const [metricsError, setMetricsError] = useState(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);

  // 4. Guardar maxDrawdown (en porcentaje) y profitTarget (en porcentaje) de ChallengeRelation
  const [ddPercent, setDdPercent] = useState(10);       // fallback
  const [profitTargetPercent, setProfitTargetPercent] = useState(10); // fallback

  // 5. Guardar valores monetarios para la gráfica
  const [maxDrawdownAbsolute, setMaxDrawdownAbsolute] = useState(null);
  const [profitTargetAbsolute, setProfitTargetAbsolute] = useState(null);

  // 6. Guardar configuración del desafío para Objetivos
  const [challengeConfig, setChallengeConfig] = useState(null);

  /**
   * useEffect #1: Obtener métricas de MetaStats
   */
  useEffect(() => {
    const fetchAdditionalMetrics = async (idMeta) => {
      setIsMetricsLoading(true);
      const metaStats = new MetaStats(process.env.NEXT_PUBLIC_TOKEN_META_API);
      try {
        const metrics = await metaStats.getMetrics(idMeta);
        setMetricsData(metrics);
        console.log("Métricas de MetaStats:", metrics);
      } catch (err) {
        setMetricsError(err);
        console.error("Error obteniendo métricas:", err);
      } finally {
        setIsMetricsLoading(false);
      }
    };

    if (challengeData?.data?.broker_account?.idMeta) {
      fetchAdditionalMetrics(challengeData.data.broker_account.idMeta);
    }
  }, [challengeData?.data?.broker_account?.idMeta]);

  /**
   * useEffect #2: Obtener el equity-chart (apiResult)
   */
  useEffect(() => {
    const fetchEquityChart = async () => {
      if (!challengeData?.data?.broker_account?.idMeta) return;

      const accountId = challengeData.data.broker_account.idMeta;
      const url = `https://risk-management-api-v1.new-york.agiliumtrade.ai/users/current/accounts/${accountId}/equity-chart?realTime=false`;
      console.log("URL construida (equity-chart):", url);

      const token = process.env.NEXT_PUBLIC_TOKEN_META_API;
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "auth-token": token,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        setApiResult(result);
      } catch (error) {
        console.error("Error fetching equity-chart data:", error);
      }
    };

    fetchEquityChart();
  }, [challengeData]);

  /**
   * useEffect #3: Obtener datos de ChallengeRelation, 
   * filtrando por challenges.documentId = idcuenta
   */
  useEffect(() => {
    if (!idcuenta) return;
    if (!challengeData?.data) return;

    // Balance inicial del broker
    const brokerInitialBalance = challengeData.data.broker_account?.balance;
    console.log("Balance inicial del broker_account:", brokerInitialBalance);

    const fetchRelation = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-relations?filters[challenges][documentId][$eq]=${idcuenta}&populate=*`;
        console.log("URL Strapi (ChallengeRelation):", url);

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Error fetching from Strapi: ${res.status}`);
        }

        const json = await res.json();
        const item = json?.data?.[0];
        if (!item) return;

        // Obtener todos los parámetros necesarios para los objetivos
        const ddP = item.maxDrawdown;
        const ptP = item.profitTarget;
        const minTradingDays = item.minimumTradingDays;
        const maxDailyLossP = item.maximumDailyLoss;

        console.log("Parámetros de objetivos:", {
          maxDrawdown: ddP,
          profitTarget: ptP,
          minimumTradingDays: minTradingDays,
          maximumDailyLoss: maxDailyLossP
        });

        // Guardar valores para maxDrawdown y profitTarget
        setDdPercent(ddP);
        setProfitTargetPercent(ptP);

        // 1) Calcular maxDrawdownAbsolute en valor monetario (resta)
        const ddAbsolute = brokerInitialBalance - (ddP / 100) * brokerInitialBalance;
        console.log("maxDrawdown en valor monetario (resta):", ddAbsolute);
        setMaxDrawdownAbsolute(ddAbsolute);

        // 2) Calcular profitTargetAbsolute en valor monetario (suma)
        const ptAbsolute = brokerInitialBalance + (ptP / 100) * brokerInitialBalance;
        console.log("profitTarget en valor monetario (suma):", ptAbsolute);
        setProfitTargetAbsolute(ptAbsolute);

        // Guardar configuración para el componente Objetivos
        setChallengeConfig({
          minimumTradingDays: minTradingDays,
          maximumDailyLossPercent: maxDailyLossP,
          maxDrawdownPercent: ddP,
          profitTargetPercent: ptP
        });

      } catch (err) {
        console.error("Error consultando Strapi (ChallengeRelation):", err);
      }
    };

    fetchRelation();
  }, [idcuenta, challengeData?.data]);

  // Loading y Error
  if (isLoading || isMetricsLoading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  if (error || metricsError) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center text-white">
          <div className="p-8 bg-white dark:bg-zinc-800 rounded-lg shadow-lg w-full">
            <h1 className="text-2xl font-bold text-red-600">🚧 Error de conexión 🚧</h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              No se pudieron cargar los datos. Por favor, intenta nuevamente más tarde.
            </p>
            {metricsError && metricsError.message && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 rounded text-sm text-red-800 dark:text-red-200">
                Error: {metricsError.message}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Tomar el brokerInitialBalance para pasárselo a Dashboard
  const brokerInitialBalance = challengeData?.data?.broker_account?.balance;

  return (
    <Layout>
      <h1 className="flex p-6 pl-12 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
        <ChartBarIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-white" />
        Account Metrix {challengeData?.data?.broker_account?.login || "Sin nombre"}
      </h1>

      <div className="flex justify-start gap-3 my-6">
        {challengeData?.data && <CredencialesModal {...challengeData.data.broker_account} />}

        <Link
          href="/support"
          className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border-gray-300 dark:border-zinc-500"
        >
          <PhoneIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
          <span className="text-xs lg:text-sm dark:text-zinc-200">Contacte con nosotros</span>
        </Link>
        <button
          onClick={() => router.reload()}
          className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border-gray-300 dark:border-zinc-500"
        >
          <ArrowPathIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
          <span className="text-xs lg:text-sm dark:text-zinc-200">Actualizar</span>
        </button>
      </div>

      {/* Componente de Barras Circulares */}
      <Dashboard
        // Balance inicial
        brokerInitialBalance={brokerInitialBalance}
        // maxDrawdown permitido (porcentaje)
        maxAllowedDrawdownPercent={ddPercent}
        // profitTarget (porcentaje)
        profitTargetPercent={profitTargetPercent}
        // métricas reales de MetaStats (balance actual, maxDrawdown real, etc.)
        metricsData={metricsData}
      />

      {/* Gráfica de líneas */}
      <div className="mt-6">
        <MyPage
          statisticsData={apiResult}
          maxDrawdownAbsolute={maxDrawdownAbsolute}
          profitTargetAbsolute={profitTargetAbsolute} // target en valor monetario (sumado)
        />
      </div>

      {/* Componente de WinLoss */}
      <WinLoss data={metricsData || {}} />

      {/* Objetivos */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold pb-4">Objetivo</h2>
        {challengeConfig ? (
          <Objetivos
            // Pasar la configuración del desafío desde Strapi
            challengeConfig={challengeConfig}
            // Pasar los datos de métricas reales del SDK
            metricsData={metricsData}
            // Balance inicial para cálculos
            initBalance={challengeData?.data?.broker_account?.balance}
            // Fase actual
            pase={challengeData?.data?.phase}
          />
        ) : (
          <div className="border-gray-500 dark:border-zinc-800 dark:shadow-black bg-white rounded-md shadow-md dark:bg-zinc-800 dark:text-white p-6 text-center">
            <p>Cargando objetivos...</p>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/1 rounded-lg">
          <h2 className="text-lg font-bold mb-4 pt-5">Estadísticas</h2>
          <Statistics
            data={{
              ...metricsData,
              phase: challengeData?.data?.phase || "Desconocida",
              brokerInitialBalance: brokerInitialBalance // Pasar el balance inicial
            }}
          />
        </div>
      </div>

      <div className="bg-black text-white p-6 rounded-lg shadow-lg my-6">
        <h2 className="text-xl font-bold mb-4">Datos en Bruto para Comparación</h2>

        <div className="mb-6">
          <h3 className="font-semibold text-blue-400 mb-2">MetricsData</h3>
          <pre className="bg-zinc-900 p-4 rounded-lg whitespace-pre-wrap overflow-auto max-h-96 text-xs">
            {JSON.stringify(metricsData, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold text-green-400 mb-2">EquityChartData</h3>
          <pre className="bg-zinc-900 p-4 rounded-lg whitespace-pre-wrap overflow-auto max-h-96 text-xs">
            {JSON.stringify(apiResult, null, 2)}
          </pre>
        </div>
      </div>
      
      {/* Componente para mostrar los challenges relacionados */}
      {challengeData?.data && (
          <RelatedChallenges currentChallenge={challengeData.data} />
      )}
    </Layout>
  );
};

export default Metrix;
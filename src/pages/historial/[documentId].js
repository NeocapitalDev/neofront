import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import Layout from "../../components/layout/dashboard";
import Loader from "../../components/loaders/loader";
import { PhoneIcon, ChartBarIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import CredencialesModal from "../dashboard/credentials";
import Link from "next/link";
import CircularProgressMetadata from "./CircularProgressMetadata";
import ChartMetadata from "./ChartMetadata";

const fetcher = (url) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

const HistorialMetrix = () => {
  const router = useRouter();
  const { documentId } = router.query;
  const [metadataStats, setMetadataStats] = useState(null);

  // Obtener los datos del challenge, incluyendo el campo metadata
  const { data: challengeData, error, isLoading } = useSWR(
    documentId
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenges/${documentId}?populate=broker_account`
      : null,
    fetcher
  );

  // Cuando los datos del challenge se cargan, extraer los datos de metadata
  useEffect(() => {
    if (challengeData?.data?.metadata) {
      setMetadataStats(challengeData.data.metadata);
    }
  }, [challengeData]);

  if (isLoading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  if (error || !challengeData) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center text-white">
          <div className="p-8 bg-white dark:bg-zinc-800 rounded-lg shadow-lg w-full">
            <h1 className="text-2xl font-bold text-red-600">🚧 Error de conexión 🚧</h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              No se pudieron cargar los datos. Por favor, intenta nuevamente más tarde.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Si no hay metadata, mostrar mensaje y datos básicos del challenge
  if (!metadataStats) {
    return (
      <Layout>
        <h1 className="flex p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
          <ChartBarIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-white" />
          Historial de Cuenta {challengeData?.data?.broker_account?.login || "Sin nombre"}
        </h1>
        
        {/* Información básica del challenge */}
        <div className="mt-6 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
          <h2 className="text-lg font-semibold mb-4">Información básica del challenge</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><span className="font-semibold">ID de Challenge:</span> {challengeData?.data?.challengeId || "No disponible"}</p>
              <p><span className="font-semibold">Fase:</span> {challengeData?.data?.phase || "No disponible"}</p>
              <p><span className="font-semibold">Resultado:</span> {challengeData?.data?.result || "No disponible"}</p>
            </div>
            <div>
              <p><span className="font-semibold">Fecha de inicio:</span> {challengeData?.data?.startDate ? new Date(challengeData.data.startDate).toLocaleDateString() : "No disponible"}</p>
              <p><span className="font-semibold">Fecha de fin:</span> {challengeData?.data?.endDate ? new Date(challengeData.data.endDate).toLocaleDateString() : "En progreso"}</p>
              <p><span className="font-semibold">Login MT4/MT5:</span> {challengeData?.data?.broker_account?.login || "No disponible"}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-10 mt-6 text-center">
          <div className="p-8 bg-white dark:bg-zinc-800 rounded-lg shadow-lg w-full">
            <h1 className="text-2xl font-bold text-yellow-600">⚠️ Sin datos históricos detallados ⚠️</h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              No hay datos estadísticos guardados para este challenge en el campo metadata.
            </p>
            {challengeData?.data?.result === 'progress' && (
              <div className="mt-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Este challenge está actualmente en progreso. Para ver sus estadísticas en tiempo real, utiliza el enlace a continuación:
                </p>
                <div className="mt-4">
                  <Link href={`/metrix2/${documentId}`} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg inline-flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2" />
                    Ver métricas en tiempo real
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="flex p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
        <ChartBarIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-white" />
        Historial de Cuenta {challengeData?.data?.broker_account?.login || "Sin nombre"}
      </h1>

      <div className="flex justify-start gap-3 my-6">
        {challengeData?.data?.broker_account && (
          <CredencialesModal {...challengeData.data.broker_account} />
        )}

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

      {/* Componentes de visualización usando los datos de metadata */}
      <CircularProgressMetadata metadata={metadataStats} />
      <ChartMetadata metadata={metadataStats} />

      {/* Información detallada */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Resumen de trading</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
            <h3 className="text-md font-semibold mb-2">Estadísticas generales</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Balance inicial:</span>
                <span className="font-medium">${metadataStats.deposits?.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span>Balance actual:</span>
                <span className="font-medium">${metadataStats.balance?.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span>Margen libre:</span>
                <span className="font-medium">${metadataStats.freeMargin?.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span>Ganancia/Pérdida:</span>
                <span className={`font-medium ${metadataStats.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${metadataStats.profit?.toFixed(2)}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Ganancia porcentual:</span>
                <span className={`font-medium ${metadataStats.gain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {metadataStats.gain?.toFixed(2)}%
                </span>
              </li>
              <li className="flex justify-between">
                <span>Drawdown máximo:</span>
                <span className="font-medium text-red-500">{metadataStats.maxDrawdown?.toFixed(2)}%</span>
              </li>
              <li className="flex justify-between">
                <span>Balance más alto:</span>
                <span className="font-medium">${metadataStats.highestBalance?.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span>Fecha balance más alto:</span>
                <span className="font-medium">{new Date(metadataStats.highestBalanceDate).toLocaleDateString()}</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
            <h3 className="text-md font-semibold mb-2">Estadísticas de trades</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Total trades:</span>
                <span className="font-medium">{metadataStats.trades}</span>
              </li>
              <li className="flex justify-between">
                <span>Trades ganados:</span>
                <span className="font-medium text-green-500">{metadataStats.wonTrades} ({metadataStats.wonTradesPercent?.toFixed(2)}%)</span>
              </li>
              <li className="flex justify-between">
                <span>Trades perdidos:</span>
                <span className="font-medium text-red-500">{metadataStats.lostTrades} ({metadataStats.lostTradesPercent?.toFixed(2)}%)</span>
              </li>
              <li className="flex justify-between">
                <span>Ganancia media:</span>
                <span className="font-medium text-green-500">${metadataStats.averageWin?.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span>Pérdida media:</span>
                <span className="font-medium text-red-500">${metadataStats.averageLoss?.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span>Mejor trade:</span>
                <span className="font-medium text-green-500">${metadataStats.bestTrade?.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span>Peor trade:</span>
                <span className="font-medium text-red-500">${metadataStats.worstTrade?.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span>Factor de rentabilidad:</span>
                <span className="font-medium">{metadataStats.profitFactor?.toFixed(2)}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Resumen de instrumentos */}
      {metadataStats.currencySummary && metadataStats.currencySummary.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Resumen por instrumentos</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metadataStats.currencySummary.map((currency, index) => (
              <div key={index} className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
                <h3 className="text-md font-semibold mb-2">{currency.currency}</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Total trades:</span>
                    <span className="font-medium">{currency.total.trades}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Ganancia/Pérdida:</span>
                    <span className={`font-medium ${currency.total.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${currency.total.profit?.toFixed(2)}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Trades ganados:</span>
                    <span className="font-medium text-green-500">
                      {currency.total.wonTrades} ({currency.total.wonTradesPercent?.toFixed(2)}%)
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Trades perdidos:</span>
                    <span className="font-medium text-red-500">
                      {currency.total.lostTrades} ({currency.total.lostTradesPercent?.toFixed(2)}%)
                    </span>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información completa en formato JSON */}
      {/*
      <div className="mt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Datos completos</h2>
          <button 
            onClick={() => {
              const el = document.getElementById('metadata-json');
              el.style.display = el.style.display === 'none' ? 'block' : 'none';
            }}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded text-sm"
          >
            Mostrar/Ocultar
          </button>
        </div>
        <pre 
          id="metadata-json"
          className="bg-black text-white p-4 rounded-lg overflow-auto text-sm mt-2"
          style={{display: 'none'}}
        >
          {JSON.stringify(metadataStats, null, 2)}
        </pre>
      </div>
      */}
    </Layout>
  );
};

export default HistorialMetrix;
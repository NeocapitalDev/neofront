// src/pages/historial/[documentId].js
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import Layout from "../../components/layout/dashboard";
import Loader from "../../components/loaders/loader";
import { PhoneIcon, ChartBarIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

// Componentes importados
import CircularProgressMetadata from "./CircularProgressMetadata";
import ChartMetadata from "./ChartMetadata";
import WinLossHistorical from "./WinLossHistorical";
import StatisticsHistorical from "./StatisticsHistorical";
import RelatedChallenges from "../../components/challenges/RelatedChallenges";

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
  const [currentStage, setCurrentStage] = useState(null);
  const [debugMode, setDebugMode] = useState(false);

  // Obtener los datos del challenge, incluyendo el campo metadata
  const { data: challengeData, error, isLoading } = useSWR(
    documentId
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenges/${documentId}?populate=*`
      : null,
    fetcher
  );

  // Cuando los datos del challenge se cargan, extraer los datos de metadata
  useEffect(() => {
    // Log para depuración
    console.log('Datos del challenge recibidos:', challengeData);

    // Verificar si existe el campo metadata
    if (challengeData?.data?.metadata) {
      try {
        // Intentar parsear el JSON si es un string
        const metadata = typeof challengeData.data.metadata === 'string' 
          ? JSON.parse(challengeData.data.metadata) 
          : challengeData.data.metadata;

        console.log('Metadata parseada:', metadata);

        // Verificar si la metadata tiene las propiedades necesarias
        if (metadata && (metadata.metrics || metadata.equityChart)) {
          // Dar prioridad a metrics si existe, sino usar toda la metadata
          const statsToUse = { ...metadata.metrics || metadata };
          
          // Agregar propiedades adicionales
          statsToUse.broker_account = challengeData.data.broker_account;
          statsToUse.equityChart = metadata.equityChart;

          // Añadir stage correspondiente al phase actual
          const challengePhase = challengeData.data.phase;
          const matchedStage = metadata.challenge_stages?.find(stage => stage.phase === challengePhase);

          console.log('Phase del challenge:', challengePhase);
          console.log('Stage encontrado:', matchedStage);

          // Establecer el stage actual
          setCurrentStage(matchedStage);

          // Establecer las estadísticas
          setMetadataStats(statsToUse);
        } else {
          console.warn('La metadata no contiene datos válidos:', metadata);
          setMetadataStats(null);
        }
      } catch (parseError) {
        console.error('Error al parsear metadata:', parseError);
        setMetadataStats(null);
      }
    } else {
      console.warn('No se encontró el campo metadata');
      setMetadataStats(null);
    }
  }, [challengeData]);

  // Render de carga
  if (isLoading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  // Render de error
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

  // Sin metadata
  if (!metadataStats) {
    return (
      <Layout>
        <h1 className="flex p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
          <ChartBarIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-white" />
          Historial de Cuenta {challengeData?.data?.broker_account?.login || "Sin nombre"}
        </h1>
        
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
        
        {challengeData?.data && (
          <RelatedChallenges currentChallenge={challengeData.data} />
        )}
        
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

  // Render principal con metadata
  return (
    <Layout>
      <h1 className="flex p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
        <ChartBarIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-white" />
        Historial de Cuenta {challengeData?.data?.broker_account?.login || "Sin nombre"}
      </h1>

      <CircularProgressMetadata 
        metadata={metadataStats} 
        stageConfig={currentStage}
      />
      <ChartMetadata 
        metadata={metadataStats} 
        stageConfig={currentStage}
      />
      
      <WinLossHistorical 
        metadata={metadataStats} 
        stageConfig={currentStage}
      />
      
      <div className="flex flex-col md:flex-row gap-4 mt-6">
        <div className="w-full md:w-1/1 rounded-lg">
          <h2 className="text-lg font-bold mb-4">Estadísticas</h2>
          <StatisticsHistorical 
            metadata={metadataStats}
            phase={challengeData?.data?.phase || "Desconocida"}
            stageConfig={currentStage}
            brokerInitialBalance={metadataStats.deposits || challengeData?.data?.broker_account?.balance}
          />
        </div>
      </div>

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
                      {currency.total.wonTrades || 0} ({currency.total.wonTradesPercent?.toFixed(2) || 0}%)
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Trades perdidos:</span>
                    <span className="font-medium text-red-500">
                      {currency.total.lostTrades || 0} ({currency.total.lostTradesPercent?.toFixed(2) || 0}%)
                    </span>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {challengeData?.data && (
        <RelatedChallenges currentChallenge={challengeData.data} />
      )}

      <div className="mt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Datos completos</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setDebugMode(!debugMode)}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
            >
              {debugMode ? "Ocultar Debug" : "Modo Debug"}
            </button>
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
        </div>
        
        {debugMode && (
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Stage actual</h3>
            <pre className="bg-gray-800 text-yellow-400 p-4 rounded-lg overflow-auto text-sm mt-2">
              {JSON.stringify(currentStage, null, 2)}
            </pre>
            
            <h3 className="text-md font-semibold mb-2 mt-4">Datos originales (estructura completa)</h3>
            <pre className="bg-gray-800 text-yellow-400 p-4 rounded-lg overflow-auto text-sm mt-2">
              {JSON.stringify(challengeData?.data, null, 2)}
            </pre>
          </div>
        )}
        
        <pre 
          id="metadata-json"
          className="bg-black text-white p-4 rounded-lg overflow-auto text-sm mt-2"
          style={{display: 'none'}}
        >
          {JSON.stringify(metadataStats, null, 2)}
        </pre>
      </div>
    </Layout>
  );
};

export default HistorialMetrix;
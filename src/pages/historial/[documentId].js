// src/pages/historial/[documentId].js
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Layout from "../../components/layout/dashboard";
import Loader from "../../components/loaders/loader";
import { PhoneIcon, ChartBarIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { BarChart, Landmark, FileChartColumn, ChartCandlestick, FileChartPie } from "lucide-react";

// Componentes importados
import CircularProgressMetadata from "./CircularProgressMetadata";
import ChartMetadata from "./ChartMetadata";
import WinLossHistorical from "./WinLossHistorical";
import StatisticsHistorical from "./StatisticsHistorical";
import RelatedChallenges from "../../components/challenges/RelatedChallenges";
import Objetivos from "./objetivos";

// Fetcher simplificado sin Content-Type para GET requests
const fetcher = (url, token) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    if (!res.ok) {
      console.error(`Error en respuesta: ${res.status} ${res.statusText}`);
      throw new Error(`Error API: ${res.status}`);
    }
    return res.json();
  });

/**
 * Función para determinar el stage correcto basado en la fase actual y los stages disponibles
 * @param {number} currentPhase - Fase actual del challenge
 * @param {Array} stages - Array de stages disponibles
 * @returns {Object} Stage seleccionado
 */
const determineCorrectStage = (currentPhase, stages) => {
  if (!stages || !Array.isArray(stages) || stages.length === 0) {
    console.warn('No hay stages disponibles');
    return null;
  }

  const totalStages = stages.length;
  let stageIndex;

  // console.log(`Determinando stage: Fase actual=${currentPhase}, Total stages=${totalStages}`);

  // Si tenemos 2 o 3 stages totales, aplicamos la lógica inversa
  if (totalStages === 2 || totalStages === 3) {
    if (currentPhase === 2) {
      // Si la fase es 2 (con 2 fases totales), seleccionamos el primer stage (índice 0)
      stageIndex = 0;
      // console.log(`Caso especial: Fase 2 con ${totalStages} stages totales -> Seleccionando índice 0`);
    } else if (currentPhase === 3) {
      // Si la fase es 3 (con 1 fase total), seleccionamos el único stage
      stageIndex = 0;
      // console.log(`Caso especial: Fase 3 con ${totalStages} stages totales -> Seleccionando índice 0`);
    } else {
      // Para otras fases, calculamos el índice correspondiente sin pasarnos del total
      stageIndex = Math.min(currentPhase - 1, totalStages - 1);
      // console.log(`Caso normal con ${totalStages} stages: Calculando índice ${stageIndex} (min(${currentPhase}-1, ${totalStages}-1))`);
    }
  } else {
    // Para otros casos de cantidad de stages, simplemente usamos la fase actual - 1 como índice
    stageIndex = Math.min(currentPhase - 1, totalStages - 1);
    // console.log(`Caso estándar: Calculando índice ${stageIndex} (min(${currentPhase}-1, ${totalStages}-1))`);
  }

  // console.log(`Stage seleccionado con índice ${stageIndex}:`, stages[stageIndex]);
  return stages[stageIndex];
};

const HistorialMetrix = () => {
  const router = useRouter();
  const { documentId } = router.query;
  const { data: session } = useSession();
  const [metadataStats, setMetadataStats] = useState(null);
  const [currentStage, setCurrentStage] = useState(null);
  const [debugMode, setDebugMode] = useState(false);
  const [initialBalance, setInitialBalance] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(null);


  // Fetch simplificado en dos pasos
  // Paso 1: Obtener datos básicos del usuario con challenges
  const { data: userData, error, isLoading } = useSWR(
    session?.jwt && documentId
      ? [
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me?populate[challenges]=*`,
        session.jwt
      ]
      : null,
    ([url, token]) => {
      // console.log("Consultando URL:", url);
      return fetcher(url, token);
    }
  );

  // Paso 2: Encontrar el challenge específico y luego obtener sus detalles
  useEffect(() => {
    if (userData?.challenges && documentId && session?.jwt) {
      const basicChallenge = userData.challenges.find(
        (challenge) => challenge.documentId === documentId
      );

      if (basicChallenge && basicChallenge.id) {
        // console.log('Challenge básico encontrado:', basicChallenge);

        // Obtener detalles completos del challenge en una consulta separada
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenges/${basicChallenge.documentId}?populate[broker_account]=*&populate[challenge_relation][populate][challenge_stages]=*`, {
          headers: {
            Authorization: `Bearer ${session.jwt}`,
          },
        })
          .then(res => {
            if (!res.ok) throw new Error(`Error API: ${res.status}`);
            return res.json();
          })
          .then(response => {
            const detailedChallenge = response.data || response;
            // console.log('Detalles completos del challenge:', detailedChallenge);

            // Extraer broker_account considerando diferentes estructuras posibles
            let brokerAccount = null;

            // Caso 1: broker_account directamente en detailedChallenge
            if (detailedChallenge.broker_account) {
              brokerAccount = detailedChallenge.broker_account;
            }
            // Caso 2: broker_account en attributes
            else if (detailedChallenge.attributes && detailedChallenge.attributes.broker_account) {
              brokerAccount = detailedChallenge.attributes.broker_account;
            }
            // Caso 3: broker_account con formato data/attributes
            else if (detailedChallenge.attributes &&
              detailedChallenge.attributes.broker_account &&
              detailedChallenge.attributes.broker_account.data) {
              brokerAccount = detailedChallenge.attributes.broker_account.data.attributes;
            }

            // console.log('Broker account extraído:', brokerAccount);

            // Combinar datos básicos con detalles y broker_account procesado
            setCurrentChallenge({
              ...basicChallenge,
              ...(detailedChallenge.attributes || detailedChallenge),
              broker_account: brokerAccount
            });
          })
          .catch(err => {
            console.error('Error al obtener detalles del challenge:', err);
            setCurrentChallenge(basicChallenge); // Usar datos básicos si falla
          });
      } else {
        console.warn('No se encontró challenge con documentId:', documentId);
        setCurrentChallenge(basicChallenge); // Puede ser null
      }
    }
  }, [userData, documentId, session?.jwt]);

  // Process challenge metadata when current challenge is set
  useEffect(() => {
    // Verificar si hay un desafío actual seleccionado
    if (!currentChallenge) {
      // console.log('No hay desafío actual seleccionado aún');
      return;
    }

    // Console log para verificar los datos completos recibidos
    // console.log('Datos del challenge recibidos:', {
    //   documentId,
    //     phase: currentChallenge.phase,
    //       hasMetadata: !!currentChallenge.metadata,
    //         metadataType: typeof currentChallenge.metadata
    // });

    // Extraer el phase
    const phase = currentChallenge.phase;
    // console.log('Phase extraído:', phase);

    // Verificar si existe el campo metadata
    if (currentChallenge.metadata) {
      try {
        // Intentar parsear el JSON si es un string
        const metadata = typeof currentChallenge.metadata === 'string'
          ? JSON.parse(currentChallenge.metadata)
          : currentChallenge.metadata;

        // console.log('Metadata parseada correctamente');
        // console.log('Estructura de la metadata:', {
        //   tieneMetaId: !!metadata.metaId,
        //     tieneMetrics: !!metadata.metrics,
        //       tieneEquityChart: !!metadata.equityChart,
        //         tieneBrokerAccount: !!metadata.broker_account,
        //           tieneChallengeStages: Array.isArray(metadata.challenge_stages),
        //             cantidadDeStages: metadata.challenge_stages?.length
        // });

        // Extraer el balance inicial del broker_account
        let balanceInicial = null;

        // Intentar obtener el balance de diferentes ubicaciones posibles
        if (metadata.broker_account && metadata.broker_account.balance) {
          balanceInicial = metadata.broker_account.balance;
          // console.log('Balance inicial encontrado en metadata.broker_account:', balanceInicial);
        } else if (metadata.deposits) {
          balanceInicial = metadata.deposits;
          // console.log('Balance inicial encontrado en metadata.deposits:', balanceInicial);
        } else if (metadata.metrics && metadata.metrics.deposits) {
          balanceInicial = metadata.metrics.deposits;
          // console.log('Balance inicial encontrado en metadata.metrics.deposits:', balanceInicial);
        } else if (currentChallenge.broker_account && currentChallenge.broker_account.balance) {
          balanceInicial = currentChallenge.broker_account.balance;
          // console.log('Balance inicial encontrado en currentChallenge.broker_account:', balanceInicial);
        }

        // Guardar el balance inicial en el estado
        setInitialBalance(balanceInicial);

        // Verificar si la metadata tiene las propiedades necesarias
        if (metadata && (metadata.metrics || metadata.trades)) {
          // Dar prioridad a metrics si existe, sino usar toda la metadata
          const statsToUse = { ...metadata.metrics || metadata };

          // Agregar propiedades adicionales
          statsToUse.broker_account = metadata.broker_account || currentChallenge.broker_account;
          statsToUse.equityChart = metadata.equityChart;

          // Asegurarse de que el balance inicial esté disponible en las estadísticas
          statsToUse.initialBalance = balanceInicial;

          // Obtener la fase actual del challenge
          const challengePhase = currentChallenge.phase;

          // Obtener los stages disponibles de la metadata o de challenge_relation
          const stages = metadata.challenge_stages ||
            (currentChallenge.challenge_relation &&
              currentChallenge.challenge_relation.challenge_stages);

          // Aplicar la lógica especial para determinar el stage correcto
          const selectedStage = determineCorrectStage(challengePhase, stages);

          if (selectedStage) {
            // console.log('Stage seleccionado correctamente:', selectedStage);
          } else {
            console.warn('No se pudo seleccionar un stage válido para la fase:', challengePhase);
          }

          // Establecer el stage seleccionado
          setCurrentStage(selectedStage);

          // Establecer las estadísticas
          setMetadataStats(statsToUse);

          // Log final de los datos procesados
          //   console.log('Datos procesados correctamente:', {
          //   phase: challengePhase,
          //     balanceInicial: balanceInicial,
          //       stageSeleccionado: selectedStage?.name,
          //         metadataStats: {
          //     trades: statsToUse.trades,
          //       wonTradesPercent: statsToUse.wonTradesPercent,
          //         profit: statsToUse.profit,
          //           balance: statsToUse.balance
          //   }
          // });
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
  }, [currentChallenge]);

  // Render de carga
  if (isLoading || !session) {
    return (
      <Layout >
        <div className="grid place-items-center h-[45%]">
          <Loader />
        </div>
      </Layout>
    );
  }

  // Render de error
  if (error || !userData) {
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

  // Render si no se encontró el challenge
  if (!currentChallenge) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center text-white">
          <div className="p-8 bg-white dark:bg-zinc-800 rounded-lg shadow-lg w-full">
            <h1 className="text-2xl font-bold text-yellow-600">⚠️ Challenge no encontrado ⚠️</h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              No se encontró ningún challenge con el ID proporcionado en tu cuenta.
              Verifica que el ID sea correcto o que tengas acceso a este challenge.
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
        {userData?.challenges && (
          <RelatedChallenges
            currentChallenge={currentChallenge}
            userChallenges={userData.challenges}
          />
        )}

        <div className="flex flex-col items-center justify-center py-6 mt-4 text-center">
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg w-full">
            <h1 className="text-xl font-bold text-yellow-600">⚠️ Sin datos históricos detallados ⚠️</h1>
            <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
              No hay datos estadísticos guardados para este challenge en el campo metadata.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Render principal con metadata - reestructurado según la imagen
  return (
    <Layout>
      {/* Nueva estructura similar a la imagen - más compacta */}
      <div className="flex flex-col lg:flex-row gap-4 mt-4">
        {/* Columna izquierda con gráfico principal */}
        <div className="w-full lg:w-8/12">
          {/* Componente de saldo/balance con el gráfico principal */}
          <div className="">
            <div className="flex justify-between items-center mb-2 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
              <div className="flex items-center">
                <Landmark className="w-5 h-5 mr-2 text-[var(--app-primary)]" />
                <h2 className="text-lg font-semibold">Saldo de la Cuenta</h2>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">${initialBalance || "$10000"}</div>
                <div className="flex items-center justify-end text-xs">
                  <span className="mr-2">Equity: ${metadataStats.equity || initialBalance}</span>
                  <span className={`${metadataStats.profitPercentage >= 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
                    {metadataStats.profitPercentage >= 0 ? '+' : ''}{metadataStats.profitPercentage || '0'}%
                  </span>
                </div>
              </div>
            </div>

            {/* Gráfico principal */}
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
              <ChartMetadata
                metadata={metadataStats}
                stageConfig={currentStage}
                initialBalance={initialBalance}
              />
            </div>
          </div>

          {/* Resto de componentes en la columna izquierda */}
          <div className="grid grid-cols-1 gap-4 mt-4">
            {/* Historial de ganancias/pérdidas */}
            <h2 className="text-lg font-semibold flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-[var(--app-primary)]" />
              Win/Loss Rates
            </h2>
            <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
              <WinLossHistorical
                metadata={metadataStats}
                stageConfig={currentStage}
              />
            </div>

            {/* Estadísticas */}
            <h2 className="text-lg font-semibold flex items-center">
              <FileChartColumn className="w-5 h-5 mr-2 text-[var(--app-primary)]" />
              Estadisticas
            </h2>
            <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
              <StatisticsHistorical
                metadata={metadataStats}
                phase={currentChallenge?.phase || "Desconocida"}
                stageConfig={currentStage}
                brokerInitialBalance={initialBalance || metadataStats.deposits || currentChallenge?.broker_account?.balance}
              />
            </div>
          </div>

          {/* Resumen por instrumentos (si existe) */}
          {metadataStats.currencySummary && metadataStats.currencySummary.length > 0 && (
            <div className="flex flex-col gap-4 mt-4">
              <h2 className="text-lg font-semibold flex items-center">
                <ChartCandlestick className="w-5 h-5 mr-2 text-[var(--app-primary)]" />
                Resumen por Instrumentos
              </h2>
              <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {metadataStats.currencySummary.slice(0, 4).map((currency, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-zinc-900 p-3 rounded-md">
                      <h3 className="text-sm font-semibold mb-1">{currency.currency}</h3>
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        <div>Total trades: <span className="font-medium">{currency.total.trades}</span></div>
                        <div>Ganancia: <span className={`font-medium ${currency.total.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ${currency.total.profit?.toFixed(2)}
                        </span></div>
                        <div>Ganados: <span className="font-medium text-green-500">
                          {currency.total.wonTrades || 0} ({currency.total.wonTradesPercent?.toFixed(1) || 0}%)
                        </span></div>
                        <div>Perdidos: <span className="font-medium text-red-500">
                          {currency.total.lostTrades || 0} ({currency.total.lostTradesPercent?.toFixed(1) || 0}%)
                        </span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha con métricas y objetivos */}
        <div className="w-full lg:w-4/12">
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between items-center bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
              <div className="flex items-center">
                <FileChartPie className="w-5 h-5 mr-2 text-[var(--app-primary)]" />
                Historial CH{currentChallenge?.id || "Sin nombre"}
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black space-y-4">
              {/* Plataforma */}
              <div className="">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Plataforma</h3>
                  <span className="bg-[var(--app-primary)] text-white text-xs px-2 py-1 rounded">METATRADER 4</span>
                </div>
              </div>

              {/* Tipo de cuenta */}
              <div className="">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Tipo de cuenta</h3>
                  <span className="bg-amber-100 text-[var(--app-secondary)] text-xs px-2 py-1 rounded">{currentStage?.name || "2 PASOS PRO"}</span>
                </div>
              </div>

              {/* Fase */}
              <div className="">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Fase</h3>
                  <span className="font-medium">{currentChallenge?.phase || "3"}</span>
                </div>
              </div>

              {/* Tamaño de la cuenta */}
              <div className="">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Tamaño de la cuenta:</h3>
                  <span className="font-bold">${initialBalance || "$10000"}</span>
                </div>
              </div>

              {/* Periodo de inicio */}
              <div className="">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Periodo de inicio:</h3>
                  <span className="font-medium">
                    {currentChallenge?.startDate
                      ? new Date(currentChallenge.startDate).toLocaleDateString()
                      : "21/3/2025"}
                  </span>
                </div>
              </div>

              {/* Fin del periodo */}
              <div className="">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Fin del periodo:</h3>
                  <span className="font-medium">
                    {currentChallenge?.endDate
                      ? new Date(currentChallenge.endDate).toLocaleDateString()
                      : "21/3/2025"}
                  </span>
                </div>
              </div>

              {/* Recompensas totales */}
              <div className="">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Recompensas totales</h3>
                  <span className="font-bold">${metadataStats.totalRewards || "$0.00"} ({metadataStats.rewardsCount || "0"})</span>
                </div>
              </div>
            </div>

            {/* Objetivos comerciales */}
            <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
              <h2 className="text-base font-semibold mb-2">Objetivos comerciales</h2>

              {/* Componente Objetivos */}
              {currentStage ? (
                <Objetivos
                  challengeConfig={currentStage}
                  metricsData={metadataStats}
                  initBalance={initialBalance}
                  phase={currentChallenge?.phase}
                />
              ) : (
                <div className="text-center p-3">
                  <p className="text-sm">No hay información de objetivos disponible.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Challenges relacionados (si existen) */}
      {userData?.challenges && (
        <div className="mt-4">
          <RelatedChallenges
            currentChallenge={currentChallenge}
            userChallenges={userData.challenges}
          />
        </div>
      )}
    </Layout>
  );
};

export default HistorialMetrix;
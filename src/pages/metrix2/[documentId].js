// src/pages/metrix2/[documentId].js
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Layout from "../../components/layout/dashboard";
import Loader from "../../components/loaders/loader";
import { PhoneIcon, ChartBarIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import CredencialesModal from "../dashboard/credentials";
import Link from "next/link";
import WinLoss from "./winloss";
import Statistics from './statistics';
import MyPage from "./grafico";
import Dashboard from "src/pages/metrix2/barrascircular";
import Objetivos from "./objetivos";
import RelatedChallenges from "../../components/challenges/RelatedChallenges";
import { BarChart, Landmark, FileChartColumn, ChartCandlestick, FileChartPie } from "lucide-react";

/**
 * Fetcher simplificado para GET requests
 */
const fetcher = (url, token) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${token || process.env.NEXT_PUBLIC_API_TOKEN}`,
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

const Metrix = () => {
  const router = useRouter();
  const { documentId } = router.query;
  const { data: session } = useSession();

  // Estados para almacenar datos procesados
  const [metadataStats, setMetadataStats] = useState(null);
  const [currentStage, setCurrentStage] = useState(null);
  const [initialBalance, setInitialBalance] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [challengeConfig, setChallengeConfig] = useState(null);

  // Estados para valores monetarios para la gráfica
  const [ddPercent, setDdPercent] = useState(10);       // fallback
  const [profitTargetPercent, setProfitTargetPercent] = useState(10); // fallback
  const [maxDrawdownAbsolute, setMaxDrawdownAbsolute] = useState(null);
  const [profitTargetAbsolute, setProfitTargetAbsolute] = useState(null);

  // Obtener datos básicos del usuario con sus challenges
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

  // Encontrar el challenge específico y obtener sus detalles completos
  useEffect(() => {
    if (userData?.challenges && documentId && session?.jwt) {
      // Primero encontrar el challenge básico entre los challenges del usuario
      const basicChallenge = userData.challenges.find(
        (challenge) => challenge.documentId === documentId
      );

      if (basicChallenge && basicChallenge.id) {
        // console.log('Challenge básico encontrado:', basicChallenge);

        // Obtener detalles completos del challenge encontrado
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
        setCurrentChallenge(null);
      }
    }
  }, [userData, documentId, session?.jwt]);

  // Procesar los datos del challenge cuando se reciben
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

    // Obtener el balance inicial del broker
    const brokerInitialBalance = currentChallenge.broker_account?.balance;
    // console.log("Balance inicial del broker_account:", brokerInitialBalance);
    setInitialBalance(brokerInitialBalance);

    // Procesar metadata si existe
    if (currentChallenge.metadata) {
      try {
        // Intentar parsear el JSON si es un string
        const metadata = typeof currentChallenge.metadata === 'string'
          ? JSON.parse(currentChallenge.metadata)
          : currentChallenge.metadata;

        // console.log('Metadata parseada correctamente:', metadata);

        // Extraer datos relevantes
        if (metadata && (metadata.metrics || metadata.trades)) {
          // Dar prioridad a metrics si existe, sino usar toda la metadata
          const statsToUse = { ...metadata.metrics || metadata };

          // Verificar si hay equityChart en metadata o en metrics
          if (metadata.equityChart) {
            // console.log("equityChart encontrado en metadata principal");
            statsToUse.equityChart = metadata.equityChart;
          } else if (metadata.metrics && metadata.metrics.equityChart) {
            // console.log("equityChart encontrado en metadata.metrics");
            statsToUse.equityChart = metadata.metrics.equityChart;
          }

          // Verificar si hay datos en equityChart
          if (statsToUse.equityChart) {
            // console.log("Datos de equityChart disponibles:", {
            //   length: Array.isArray(statsToUse.equityChart) ? statsToUse.equityChart.length : 'No es array',
            //     muestra: Array.isArray(statsToUse.equityChart) ? statsToUse.equityChart.slice(0, 2) : statsToUse.equityChart
            // });
          } else {
            console.warn("No se encontraron datos de equityChart");

            // Si no hay equityChart, intentar crear uno básico con datos disponibles
            if (statsToUse.balance && statsToUse.equity) {
              // console.log("Creando equityChart básico con balance y equity");
              statsToUse.equityChart = [
                {
                  timestamp: new Date().getTime() - 86400000, // Ayer
                  equity: brokerInitialBalance || 10000,
                  balance: brokerInitialBalance || 10000
                },
                {
                  timestamp: new Date().getTime(), // Hoy
                  equity: statsToUse.equity,
                  balance: statsToUse.balance
                }
              ];
            }
          }

          // Agregar propiedades adicionales
          statsToUse.broker_account = metadata.broker_account || currentChallenge.broker_account;
          statsToUse.initialBalance = brokerInitialBalance;

          // Si llega hasta aquí sin equityChart, intentamos darle un formato básico para que no falle
          if (!statsToUse.equityChart) {
            statsToUse.equityChart = [
              { timestamp: new Date().getTime() - 86400000, equity: brokerInitialBalance || 10000, balance: brokerInitialBalance || 10000 },
              { timestamp: new Date().getTime(), equity: brokerInitialBalance || 10000, balance: brokerInitialBalance || 10000 }
            ];
          }

          // Obtener la fase actual del challenge
          const challengePhase = currentChallenge.phase;

          // Obtener los stages disponibles de la metadata o de challenge_relation
          const stages = metadata.challenge_stages ||
            (currentChallenge.challenge_relation &&
              currentChallenge.challenge_relation.challenge_stages);

          // Aplicar la lógica para determinar el stage correcto
          const selectedStage = determineCorrectStage(challengePhase, stages);

          if (selectedStage) {
            // console.log('Stage seleccionado correctamente:', selectedStage);
            setCurrentStage(selectedStage);

            // Extraer parámetros importantes para los objetivos
            const maxLoss = selectedStage.maximumTotalLoss || 10;
            const profitTarget = selectedStage.profitTarget || 10;
            const maxDailyLoss = selectedStage.maximumDailyLoss || 5;
            const minTradingDays = selectedStage.minimumTradingDays || 0;

            // Guardar valores para maxDrawdown y profitTarget
            setDdPercent(maxLoss);
            setProfitTargetPercent(profitTarget);

            // Guardar configuración para el componente Objetivos
            setChallengeConfig({
              minimumTradingDays: minTradingDays,
              maximumDailyLossPercent: maxDailyLoss,
              maxDrawdownPercent: maxLoss,
              profitTargetPercent: profitTarget
            });

            // 1) Calcular maxDrawdownAbsolute en valor monetario (resta)
            if (brokerInitialBalance) {
              const ddAbsolute = brokerInitialBalance - (maxLoss / 100) * brokerInitialBalance;
              // console.log("maxDrawdown en valor monetario (resta):", ddAbsolute);
              setMaxDrawdownAbsolute(ddAbsolute);

              // 2) Calcular profitTargetAbsolute en valor monetario (suma)
              const ptAbsolute = brokerInitialBalance + (profitTarget / 100) * brokerInitialBalance;
              // console.log("profitTarget en valor monetario (suma):", ptAbsolute);
              setProfitTargetAbsolute(ptAbsolute);
            }
          }

          // Añadir valores calculados si faltan
          if (!statsToUse.maxDrawdown && (statsToUse.balance || statsToUse.equity) && brokerInitialBalance) {
            const currentBalance = statsToUse.balance || statsToUse.equity;
            const drawdownAmount = brokerInitialBalance - currentBalance;
            statsToUse.maxDrawdown = drawdownAmount > 0 ? drawdownAmount : 0;
            statsToUse.maxDrawdownPercent = (statsToUse.maxDrawdown / brokerInitialBalance) * 100;
          }

          if (!statsToUse.profit && statsToUse.balance && brokerInitialBalance) {
            statsToUse.profit = statsToUse.balance - brokerInitialBalance;
            statsToUse.profitPercent = (statsToUse.profit / brokerInitialBalance) * 100;
          }

          // Establecer las estadísticas
          // console.log("Estableciendo metadataStats con:", {
          // balance: statsToUse.balance,
          //     equity: statsToUse.equity,
          //       profit: statsToUse.profit,
          //         maxDrawdown: statsToUse.maxDrawdown,
          //           tieneEquityChart: !!statsToUse.equityChart,
          //             equityChartLength: statsToUse.equityChart ? statsToUse.equityChart.length : 0
          // });

          setMetadataStats(statsToUse);
        } else {
          console.warn('La metadata no contiene datos válidos de métricas');
          createBasicStats(currentChallenge, brokerInitialBalance);
        }
      } catch (parseError) {
        console.error('Error al parsear metadata:', parseError);
        createBasicStats(currentChallenge, brokerInitialBalance);
      }
    } else {
      console.warn('No se encontró el campo metadata en el challenge');
      createBasicStats(currentChallenge, brokerInitialBalance);
    }
  }, [currentChallenge]);

  // Función auxiliar para crear datos básicos cuando no hay metadata
  const createBasicStats = (challenge, brokerInitialBalance) => {
    if (brokerInitialBalance) {
      const basicStats = {
        balance: brokerInitialBalance,
        equity: brokerInitialBalance,
        profit: 0,
        profitPercent: 0,
        maxDrawdown: 0,
        maxDrawdownPercent: 0,
        broker_account: challenge.broker_account,
        initialBalance: brokerInitialBalance,
        equityChart: [
          { timestamp: new Date().getTime() - 86400000, equity: brokerInitialBalance, balance: brokerInitialBalance },
          { timestamp: new Date().getTime(), equity: brokerInitialBalance, balance: brokerInitialBalance }
        ]
      };

      setMetadataStats(basicStats);
    }

    // Si no hay metadata, intentamos obtener los parámetros básicos del stage al menos
    if (challenge.challenge_relation && challenge.challenge_relation.challenge_stages) {
      const stages = challenge.challenge_relation.challenge_stages;
      const selectedStage = determineCorrectStage(challenge.phase, stages);

      if (selectedStage) {
        setCurrentStage(selectedStage);

        // Extraer parámetros para los objetivos
        const maxLoss = selectedStage.maximumTotalLoss || 10;
        const profitTarget = selectedStage.profitTarget || 10;
        const maxDailyLoss = selectedStage.maximumDailyLoss || 5;
        const minTradingDays = selectedStage.minimumTradingDays || 0;

        setDdPercent(maxLoss);
        setProfitTargetPercent(profitTarget);

        setChallengeConfig({
          minimumTradingDays: minTradingDays,
          maximumDailyLossPercent: maxDailyLoss,
          maxDrawdownPercent: maxLoss,
          profitTargetPercent: profitTarget
        });

        if (brokerInitialBalance) {
          const ddAbsolute = brokerInitialBalance - (maxLoss / 100) * brokerInitialBalance;
          setMaxDrawdownAbsolute(ddAbsolute);

          const ptAbsolute = brokerInitialBalance + (profitTarget / 100) * brokerInitialBalance;
          setProfitTargetAbsolute(ptAbsolute);
        }
      }
    }
  };

  // Loading y Error
  if (isLoading || !session) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  if (error || !userData) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center text-white">
          <div className="p-8 bg-white dark:bg-zinc-800 rounded-lg shadow-lg w-full">
            <h1 className="text-2xl font-bold text-red-600">🚧 Error de conexión 🚧</h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              No se pudieron cargar los datos. Por favor, intenta nuevamente más tarde.
            </p>
            {error && error.message && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 rounded text-sm text-red-800 dark:text-red-200">
                Error: {error.message}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // No challenge data
  if (!currentChallenge) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center text-white">
          <div className="p-8 bg-white dark:bg-zinc-800 rounded-lg shadow-lg w-full">
            <h1 className="text-2xl font-bold text-yellow-600">⚠️ Challenge no encontrado ⚠️</h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              No se encontró ningún challenge con el ID proporcionado en tu cuenta.
              Verifica que el ID sea correcto y que tengas acceso a este challenge.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>



      {/* Nueva estructura similar a la imagen - más compacta */}
      <div className="flex flex-col lg:flex-row gap-4 mt-4">
        {/* Columna izquierda con gráfico principal */}
        <div className="w-full lg:w-8/12">

      <div className="">
                <div className="flex justify-between items-center mb-2 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
                  <div className="flex items-center">
                  <Landmark className="w-5 h-5 mr-2 text-[var(--app-primary)]" />
                  <h2 className="text-lg font-semibold">Saldo de la Cuenta</h2>
                  </div>
                   <div className="text-right">
                  <div className="text-lg font-bold">{initialBalance || "$10000"}</div>
                  <div className="flex items-center justify-end text-xs">
                    <span className="mr-2">Equity: ${metadataStats?.equity || initialBalance}</span>
                    <span className={`${metadataStats?.profitPercent >= 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
                    {metadataStats?.profitPercent >= 0 ? '+' : ''}{metadataStats?.profitPercent || '0'}%
                    </span>
                  </div>
                  </div> 
                </div>

                {/* Gráfico principal */}
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
      {/* Gráfica de líneas */}
        <MyPage
          statisticsData={metadataStats?.equityChart || []}
          maxDrawdownAbsolute={maxDrawdownAbsolute || (initialBalance ? initialBalance * 0.9 : 9000)}
          profitTargetAbsolute={profitTargetAbsolute || (initialBalance ? initialBalance * 1.1 : 11000)}
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
            <WinLoss data={metadataStats || {}} />

            </div>

            {/* Estadísticas */}
            <h2 className="text-lg font-semibold flex items-center">
              <FileChartColumn className="w-5 h-5 mr-2 text-[var(--app-primary)]" />
              Estadisticas
            </h2>
            <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
            <Statistics
            data={{
              ...metadataStats,
              phase: currentChallenge?.phase || "Desconocida",
              brokerInitialBalance: initialBalance // Pasar el balance inicial
            }}
          />
            </div>


                      {/* Resumen por instrumentos (si existe) */}
                      {metadataStats?.currencySummary && metadataStats?.currencySummary.length > 0 && (
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
                  <span className="font-bold">{initialBalance || "$10000"}</span>
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

                      <div className="">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">Recompensas totales</h3>
                        <span className="font-bold">${ metadataStats?.profit }</span>
                        
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
      
      {/* Componente para mostrar los challenges relacionados */}
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

export default Metrix;
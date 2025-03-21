// src/pages/historial/[documentId].js
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react"; // Import useSession hook
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

  console.log(`Determinando stage: Fase actual=${currentPhase}, Total stages=${totalStages}`);

  // Si tenemos 2 o 3 stages totales, aplicamos la lógica inversa
  if (totalStages === 2 || totalStages === 3) {
    if (currentPhase === 2) {
      // Si la fase es 2 (con 2 fases totales), seleccionamos el primer stage (índice 0)
      stageIndex = 0;
      console.log(`Caso especial: Fase 2 con ${totalStages} stages totales -> Seleccionando índice 0`);
    } else if (currentPhase === 3) {
      // Si la fase es 3 (con 1 fase total), seleccionamos el único stage
      stageIndex = 0;
      console.log(`Caso especial: Fase 3 con ${totalStages} stages totales -> Seleccionando índice 0`);
    } else {
      // Para otras fases, calculamos el índice correspondiente sin pasarnos del total
      stageIndex = Math.min(currentPhase - 1, totalStages - 1);
      console.log(`Caso normal con ${totalStages} stages: Calculando índice ${stageIndex} (min(${currentPhase}-1, ${totalStages}-1))`);
    }
  } else {
    // Para otros casos de cantidad de stages, simplemente usamos la fase actual - 1 como índice
    stageIndex = Math.min(currentPhase - 1, totalStages - 1);
    console.log(`Caso estándar: Calculando índice ${stageIndex} (min(${currentPhase}-1, ${totalStages}-1))`);
  }

  console.log(`Stage seleccionado con índice ${stageIndex}:`, stages[stageIndex]);
  return stages[stageIndex];
};

const HistorialMetrix = () => {
  const router = useRouter();
  const { documentId } = router.query;
  const { data: session } = useSession(); // Get user session
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
      console.log("Consultando URL:", url); // Para depuración
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
        console.log('Challenge básico encontrado:', basicChallenge);
        
        // Obtener detalles completos del challenge en una consulta separada
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenges/${basicChallenge.id}?populate[broker_account]=*&populate[challenge_relation][populate][challenge_stages]=*`, {
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
            console.log('Detalles completos del challenge:', detailedChallenge);
            
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
            
            console.log('Broker account extraído:', brokerAccount);
            
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
      console.log('No hay desafío actual seleccionado aún');
      return;
    }

    // Console log para verificar los datos completos recibidos
    console.log('Datos del challenge recibidos:', {
      documentId,
      phase: currentChallenge.phase,
      hasMetadata: !!currentChallenge.metadata,
      metadataType: typeof currentChallenge.metadata
    });

    // Extraer el phase
    const phase = currentChallenge.phase;
    console.log('Phase extraído:', phase);

    // Verificar si existe el campo metadata
    if (currentChallenge.metadata) {
      try {
        // Intentar parsear el JSON si es un string
        const metadata = typeof currentChallenge.metadata === 'string' 
          ? JSON.parse(currentChallenge.metadata) 
          : currentChallenge.metadata;

        console.log('Metadata parseada correctamente');
        console.log('Estructura de la metadata:', {
          tieneMetaId: !!metadata.metaId,
          tieneMetrics: !!metadata.metrics,
          tieneEquityChart: !!metadata.equityChart,
          tieneBrokerAccount: !!metadata.broker_account,
          tieneChallengeStages: Array.isArray(metadata.challenge_stages),
          cantidadDeStages: metadata.challenge_stages?.length
        });
        
        // Extraer el balance inicial del broker_account
        let balanceInicial = null;
        
        // Intentar obtener el balance de diferentes ubicaciones posibles
        if (metadata.broker_account && metadata.broker_account.balance) {
          balanceInicial = metadata.broker_account.balance;
          console.log('Balance inicial encontrado en metadata.broker_account:', balanceInicial);
        } else if (metadata.deposits) {
          balanceInicial = metadata.deposits;
          console.log('Balance inicial encontrado en metadata.deposits:', balanceInicial);
        } else if (metadata.metrics && metadata.metrics.deposits) {
          balanceInicial = metadata.metrics.deposits;
          console.log('Balance inicial encontrado en metadata.metrics.deposits:', balanceInicial);
        } else if (currentChallenge.broker_account && currentChallenge.broker_account.balance) {
          balanceInicial = currentChallenge.broker_account.balance;
          console.log('Balance inicial encontrado en currentChallenge.broker_account:', balanceInicial);
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
            console.log('Stage seleccionado correctamente:', selectedStage);
          } else {
            console.warn('No se pudo seleccionar un stage válido para la fase:', challengePhase);
          }

          // Establecer el stage seleccionado
          setCurrentStage(selectedStage);

          // Establecer las estadísticas
          setMetadataStats(statsToUse);
          
          // Log final de los datos procesados
          console.log('Datos procesados correctamente:', {
            phase: challengePhase,
            balanceInicial: balanceInicial,
            stageSeleccionado: selectedStage?.name,
            metadataStats: {
              trades: statsToUse.trades,
              wonTradesPercent: statsToUse.wonTradesPercent,
              profit: statsToUse.profit,
              balance: statsToUse.balance
            }
          });
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

  // Efecto adicional para verificar los datos después de que se establecen en el estado
  useEffect(() => {
    if (metadataStats) {
      console.log('Estado metadataStats establecido con éxito:', {
        trades: metadataStats.trades,
        profit: metadataStats.profit,
        balance: metadataStats.balance,
        initialBalance: metadataStats.initialBalance || initialBalance
      });
    }
    
    if (currentStage) {
      console.log('Estado currentStage establecido con éxito:', currentStage);
    }
    
    if (initialBalance) {
      console.log('Balance inicial establecido:', initialBalance);
    }
  }, [metadataStats, currentStage, initialBalance]);

  // Depuración de la estructura de datos de broker_account
  useEffect(() => {
    if (currentChallenge) {
      console.group('Depuración de estructura de broker_account');
      console.log('currentChallenge:', currentChallenge);
      
      // Verificar broker_account directo
      console.log('broker_account directo:', currentChallenge.broker_account);
      
      // Verificar si hay datos anidados
      if (currentChallenge.broker_account && currentChallenge.broker_account.data) {
        console.log('broker_account.data:', currentChallenge.broker_account.data);
        console.log('broker_account.data.attributes:', currentChallenge.broker_account.data.attributes);
      }
      
      // Verificar si hay broker_account en metadata
      if (currentChallenge.metadata) {
        const metadata = typeof currentChallenge.metadata === 'string'
          ? JSON.parse(currentChallenge.metadata)
          : currentChallenge.metadata;
        
        console.log('metadata.broker_account:', metadata.broker_account);
      }
      
      // Intentar obtener login de diferentes rutas
      const possibleLogins = [
        currentChallenge.broker_account?.login,
        currentChallenge.broker_account?.data?.attributes?.login,
        typeof currentChallenge.metadata === 'string'
          ? JSON.parse(currentChallenge.metadata)?.broker_account?.login
          : currentChallenge.metadata?.broker_account?.login
      ];
      
      console.log('Posibles valores de login:', possibleLogins);
      console.groupEnd();
    }
  }, [currentChallenge]);

  // Verificar los datos para el componente Objetivos
  useEffect(() => {
    if (currentStage && metadataStats) {
      console.group('Datos para el componente Objetivos');
      console.log('challengeConfig:', currentStage);
      console.log('metadataStats:', metadataStats);
      console.log('initialBalance:', initialBalance);
      console.log('phase:', currentChallenge?.phase);
      console.groupEnd();
    }
  }, [currentStage, metadataStats, initialBalance, currentChallenge]);

  // Render de carga
  if (isLoading || !session) {
    return (
      <Layout>
        <Loader />
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
        <h1 className="flex p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
          <ChartBarIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-white" />
          Historial de Cuenta {currentChallenge?.broker_account?.login || 
                             currentChallenge?.broker_account?.data?.attributes?.login || 
                             (currentChallenge?.metadata && typeof currentChallenge.metadata === 'string' 
                               ? JSON.parse(currentChallenge.metadata)?.broker_account?.login 
                               : currentChallenge?.metadata?.broker_account?.login) || 
                             "Sin nombre"}
        </h1>
        
        <div className="mt-6 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
          <h2 className="text-lg font-semibold mb-4">Información básica del challenge</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><span className="font-semibold">ID de Challenge:</span> {currentChallenge?.challengeId || "No disponible"}</p>
              <p><span className="font-semibold">Fase:</span> {currentChallenge?.phase || "No disponible"}</p>
              <p><span className="font-semibold">Resultado:</span> {currentChallenge?.result || "No disponible"}</p>
            </div>
            <div>
              <p><span className="font-semibold">Fecha de inicio:</span> {currentChallenge?.startDate ? new Date(currentChallenge.startDate).toLocaleDateString() : "No disponible"}</p>
              <p><span className="font-semibold">Fecha de fin:</span> {currentChallenge?.endDate ? new Date(currentChallenge.endDate).toLocaleDateString() : "En progreso"}</p>
              <p><span className="font-semibold">Login MT4/MT5:</span> {currentChallenge?.broker_account?.login || 
                                                                      currentChallenge?.broker_account?.data?.attributes?.login || 
                                                                      (currentChallenge?.metadata && typeof currentChallenge.metadata === 'string' 
                                                                        ? JSON.parse(currentChallenge.metadata)?.broker_account?.login 
                                                                        : currentChallenge?.metadata?.broker_account?.login) || 
                                                                      "No disponible"}</p>
              <p><span className="font-semibold">Balance inicial:</span> ${currentChallenge?.broker_account?.balance || 
                                                                         currentChallenge?.broker_account?.data?.attributes?.balance || 
                                                                         (currentChallenge?.metadata && typeof currentChallenge.metadata === 'string' 
                                                                           ? JSON.parse(currentChallenge.metadata)?.broker_account?.balance 
                                                                           : currentChallenge?.metadata?.broker_account?.balance) || 
                                                                         "No disponible"}</p>
            </div>
          </div>
        </div>
        
        {userData?.challenges && (
          <RelatedChallenges 
            currentChallenge={currentChallenge} 
            userChallenges={userData.challenges} 
          />
        )}
        
        <div className="flex flex-col items-center justify-center py-10 mt-6 text-center">
          <div className="p-8 bg-white dark:bg-zinc-800 rounded-lg shadow-lg w-full">
            <h1 className="text-2xl font-bold text-yellow-600">⚠️ Sin datos históricos detallados ⚠️</h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              No hay datos estadísticos guardados para este challenge en el campo metadata.
            </p>
            {currentChallenge?.result === 'progress' && (
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
        Historial de Cuenta {currentChallenge?.broker_account?.login || 
                           currentChallenge?.broker_account?.data?.attributes?.login || 
                           (currentChallenge?.metadata && typeof currentChallenge.metadata === 'string' 
                             ? JSON.parse(currentChallenge.metadata)?.broker_account?.login 
                             : currentChallenge?.metadata?.broker_account?.login) || 
                           "Sin nombre"}
      </h1>

      <CircularProgressMetadata 
        metadata={metadataStats} 
        stageConfig={currentStage}
        initialBalance={initialBalance}
      />
      <ChartMetadata 
        metadata={metadataStats} 
        stageConfig={currentStage}
        initialBalance={initialBalance}
      />
      
      <WinLossHistorical 
        metadata={metadataStats} 
        stageConfig={currentStage}
      />

      {/* Objetivos */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold pb-4">Objetivo</h2>
        {currentStage ? (
          <Objetivos
            // Usar currentStage como la configuración del desafío
            challengeConfig={currentStage}
            // Usar metadataStats como los datos de métricas
            metricsData={metadataStats}
            // Usar initialBalance para cálculos
            initBalance={initialBalance}
            // Usar la fase actual del challenge (corregido de "pase" a "phase")
            phase={currentChallenge?.phase}
          />
        ) : (
          <div className="border-gray-500 dark:border-zinc-800 dark:shadow-black bg-white rounded-md shadow-md dark:bg-zinc-800 dark:text-white p-6 text-center">
            <p>No hay información de objetivos disponible.</p>
          </div>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mt-6">
        <div className="w-full md:w-1/1 rounded-lg">
          <h2 className="text-lg font-bold mb-4">Estadísticas</h2>
          <StatisticsHistorical 
            metadata={metadataStats}
            phase={currentChallenge?.phase || "Desconocida"}
            stageConfig={currentStage}
            brokerInitialBalance={initialBalance || metadataStats.deposits || currentChallenge?.broker_account?.balance}
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

      {userData?.challenges && (
        <RelatedChallenges 
          currentChallenge={currentChallenge} 
          userChallenges={userData.challenges}
        />
      )}
    </Layout>
  );
};

export default HistorialMetrix;
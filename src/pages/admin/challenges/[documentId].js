// src/pages/admin/challenges/[documentId].js
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "..";
import Loader from "../../../components/loaders/loader";
import { PhoneIcon, ChartBarIcon, ArrowPathIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { MetaStats } from 'metaapi.cloud-sdk'; // Importamos MetaStats SDK

// Importamos el componente de objetivos
import Objetivos from "./Objetivos";

// Componentes importados
import CircularProgressMetadata from "./CircularProgressMetadata";
import ChartMetadata from "./ChartMetadata";
import WinLossHistorical from "./WinLossHistorical";
import StatisticsHistorical from "./StatisticsHistorical";
import RelatedChallenges from "../../../components/challenges/RelatedChallenges";
import CredencialesModal from "../../dashboard/credentials";
import { useStrapiData } from "@/services/strapiServiceJWT";

/**
 * Función para determinar el stage correcto basado en la fase actual y los stages disponibles
 * @param {number} currentPhase - Fase actual del challenge
 * @param {Array} stages - Array de stages disponibles
 * @returns {Object} Stage seleccionado
 */
// Función mejorada para determinar el stage correcto
const determineCorrectStage = (currentPhase, stages) => {
  // Convertir currentPhase a número
  const phaseNum = parseInt(currentPhase, 10);

  // Validación de datos de entrada
  if (isNaN(phaseNum)) {
    console.error('La fase actual no es un número válido:', currentPhase);
    return null;
  }

  // Verificación más robusta de stages
  if (!stages || !Array.isArray(stages) || stages.length === 0) {
    console.warn('No hay stages disponibles o el formato es incorrecto');
    // Crear un stage predeterminado en caso de que no haya stages
    return {
      name: "Stage por defecto",
      description: "Stage creado automáticamente debido a falta de datos",
      targets: {
        profit_target: 8,
        max_daily_loss: 5,
        max_loss: 10
      }
    };
  }

  const totalStages = stages.length;
  let stageIndex;

  console.log(`Determinando stage: Fase actual=${phaseNum}, Total stages=${totalStages}, Stages disponibles:`, stages);

  // Si tenemos 2 o 3 stages totales, aplicamos la lógica especial
  if (totalStages === 2 || totalStages === 3) {
    if (phaseNum === 2) {
      // Si la fase es 2 (con 2 fases totales), seleccionamos el primer stage (índice 0)
      stageIndex = 0;
      console.log(`Caso especial: Fase ${phaseNum} con ${totalStages} stages totales -> Seleccionando índice 0`);
    } else if (phaseNum === 3) {
      // Si la fase es 3 (con 1 fase total), seleccionamos el único stage
      stageIndex = 0;
      console.log(`Caso especial: Fase ${phaseNum} con ${totalStages} stages totales -> Seleccionando índice 0`);
    } else {
      // Para otras fases, calculamos el índice correspondiente sin pasarnos del total
      stageIndex = Math.min(phaseNum - 1, totalStages - 1);
      console.log(`Caso normal con ${totalStages} stages: Calculando índice ${stageIndex} (min(${phaseNum}-1, ${totalStages}-1))`);
    }
  } else {
    // Para otros casos de cantidad de stages, simplemente usamos la fase actual - 1 como índice
    stageIndex = Math.min(phaseNum - 1, totalStages - 1);
    console.log(`Caso estándar: Calculando índice ${stageIndex} (min(${phaseNum}-1, ${totalStages}-1))`);
  }

  // Verificación adicional
  if (stageIndex < 0 || stageIndex >= totalStages) {
    console.warn(`Índice calculado (${stageIndex}) fuera de rango para ${totalStages} stages disponibles.`);
    stageIndex = 0; // Usar el primer stage como fallback
    console.log(`Usando stage 0 como fallback.`);
  }

  const selectedStage = stages[stageIndex];
  console.log(`Stage seleccionado con índice ${stageIndex}:`, selectedStage);

  // Verificación de la estructura del stage
  if (!selectedStage) {
    console.error(`No se pudo seleccionar un stage válido en el índice ${stageIndex}`);
    // Retornar un stage por defecto en lugar de null
    return {
      name: "Stage por defecto",
      description: "Stage creado automáticamente debido a error en la selección",
      targets: {
        profit_target: 8,
        max_daily_loss: 5,
        max_loss: 10
      }
    };
  }

  return selectedStage;
};

/**
 * Función para obtener el Stage desde Strapi mediante challenge-relations
 * @param {string} documentId - ID del challenge
 * @param {string} jwt - Token JWT para la autenticación
 * @returns {Promise<Object>} Configuración del stage
 */
const fetchStageConfiguration = async (documentId, jwt) => {
  try {
    console.log("Obteniendo configuración del stage para el challenge:", documentId);
    // 1. Primero obtenemos las relaciones para identificar los stages asociados
    const relationUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-relations?filters[challenges][documentId][$eq]=${documentId}&populate=challenge_stages`;
    console.log("URL Strapi (ChallengeRelation):", relationUrl);

    const relationRes = await fetch(relationUrl, {
      headers: {
        Authorization: `Bearer ${jwt || process.env.NEXT_PUBLIC_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!relationRes.ok) {
      throw new Error(`Error fetching from Strapi: ${relationRes.status}`);
    }

    const relationJson = await relationRes.json();
    const relation = relationJson?.data?.[0];

    if (!relation || !relation.challenge_stages || relation.challenge_stages.length === 0) {
      console.error("No se encontraron stages asociados al challenge");
      return null;
    }

    // 2. Obtenemos el stage actual (tomamos el primero por ahora)
    const currentStage = relation.challenge_stages[0];
    const stageDocumentId = currentStage.documentId;

    // 3. Ahora obtenemos los parámetros desde ChallengeStage
    const stageUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-stages?filters[documentId][$eq]=${stageDocumentId}`;
    console.log("URL Strapi (ChallengeStage):", stageUrl);

    const stageRes = await fetch(stageUrl, {
      headers: {
        Authorization: `Bearer ${jwt || process.env.NEXT_PUBLIC_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!stageRes.ok) {
      throw new Error(`Error fetching from Strapi: ${stageRes.status}`);
    }

    const stageJson = await stageRes.json();
    const stage = stageJson?.data?.[0];

    if (!stage) {
      console.error("No se encontró el stage con los parámetros");
      return null;
    }

    // Extraer los parámetros importantes
    return {
      name: stage.name || "Stage",
      description: stage.description || "",
      targets: {
        profit_target: stage.profitTarget || 8,
        max_daily_loss: stage.maximumDailyLoss || 5,
        max_loss: stage.maximumTotalLoss || 10,
        minimum_trading_days: stage.minimumTradingDays || 0
      }
    };
  } catch (error) {
    console.error("Error obteniendo configuración del stage:", error);
    return null;
  }
};

/**
 * Función para convertir datos de MetaStats a formato compatible con metadata
 * @param {Object} metricsData - Datos obtenidos de MetaStats API
 * @param {Object} brokerAccount - Datos de la cuenta del broker
 * @param {number} initialBalance - Balance inicial
 * @returns {Object} Formato compatible con metadata
 */
const convertMetaStatsToMetadata = (metricsData, brokerAccount, initialBalance) => {
  if (!metricsData) return null;

  // Establecer un balance inicial predeterminado si no está disponible
  const baseBalance = initialBalance || metricsData.deposits || 10000;

  // Crear el objeto convertido con todos los campos necesarios
  const convertedData = {
    // Propiedades principales
    trades: metricsData.trades || 0,
    balance: metricsData.balance || baseBalance,
    equity: metricsData.equity || baseBalance,
    profit: metricsData.profit || 0,

    // Métricas de trading
    wonTrades: metricsData.wonTrades || 0,
    lostTrades: metricsData.lostTrades || 0,
    wonTradesPercent: metricsData.wonTradesPercent || 0,
    lostTradesPercent: metricsData.lostTradesPercent || 0,

    // Métricas de profit/loss
    averageWin: metricsData.averageWin || 0,
    averageLoss: metricsData.averageLoss || 0,
    averageWinPips: metricsData.averageWinPips || 0,
    averageLossPips: metricsData.averageLossPips || 0,

    // Métricas de mejor/peor trade
    bestTrade: metricsData.bestTrade || 0,
    worstTrade: metricsData.worstTrade || 0,
    bestTradePips: metricsData.bestTradePips || 0,
    worstTradePips: metricsData.worstTradePips || 0,

    // Métricas de dirección (long/short)
    longTrades: metricsData.longTrades || 0,
    shortTrades: metricsData.shortTrades || 0,
    longWonTrades: metricsData.longWonTrades || 0,
    shortWonTrades: metricsData.shortWonTrades || 0,
    longWonTradesPercent: metricsData.longWonTradesPercent || 0,
    shortWonTradesPercent: metricsData.shortWonTradesPercent || 0,

    // Métricas de drawdown
    maxDrawdown: metricsData.maxDrawdown || 0,
    maxDrawdownPercent: metricsData.maxDrawdownPercent || 0,
    maxBalanceDrawdown: metricsData.maxBalanceDrawdown || metricsData.maxDrawdown || 0,
    maxBalanceDrawdownPercent: metricsData.maxBalanceDrawdownPercent || metricsData.maxDrawdownPercent || 0,
    maxEquityDrawdown: metricsData.maxEquityDrawdown || metricsData.maxDrawdown || 0,
    maxEquityDrawdownPercent: metricsData.maxEquityDrawdownPercent || metricsData.maxDrawdownPercent || 0,

    // Métricas de rendimiento
    profitFactor: metricsData.profitFactor || 0,
    expectancy: metricsData.expectancy || 0,
    expectancyPips: metricsData.expectancyPips || 0,

    // Métricas de tiempo
    daysSinceTradingStarted: metricsData.daysSinceTradingStarted || 0,
    averageTradeLengthInMilliseconds: metricsData.averageTradeLengthInMilliseconds || 0,

    // Métricas de volumen
    pips: metricsData.pips || 0,
    lots: metricsData.lots || 0,

    // Datos de cuenta
    broker_account: brokerAccount || {},
    initialBalance: baseBalance,
    deposits: metricsData.deposits || baseBalance,

    // Datos de gráficos
    dailyGrowth: metricsData.dailyGrowth || [],
    balanceChart: metricsData.balanceChart || [],
    equityChart: metricsData.equityChart || [],

    // Resumen por instrumentos - manejar tanto currencySummary como currencies
    currencySummary: handleCurrencySummary(metricsData)
  };

  return convertedData;
};

/**
 * Procesa el resumen de divisas desde MetaStats
 * @param {Object} metricsData - Datos de MetaStats
 * @returns {Array} Array formateado de resumen de divisas
 */
function handleCurrencySummary(metricsData) {
  // Verificar si existe currencySummary o currencies
  if (metricsData.currencySummary && Array.isArray(metricsData.currencySummary)) {
    return metricsData.currencySummary.map(formatCurrencyData);
  } else if (metricsData.currencies && Array.isArray(metricsData.currencies)) {
    return metricsData.currencies.map(formatCurrencyData);
  }

  return [];
}

/**
 * Formatea los datos de una divisa individual
 * @param {Object} currency - Datos de divisa individual
 * @returns {Object} Datos formateados
 */
function formatCurrencyData(currency) {
  return {
    currency: currency.currency || currency.name || "Unknown",
    total: {
      trades: currency.total?.trades || currency.trades || 0,
      profit: currency.total?.profit || currency.profit || 0,
      pips: currency.total?.pips || currency.pips || 0,
      wonTrades: currency.total?.wonTrades || currency.wonTrades || 0,
      wonTradesPercent: currency.total?.wonTradesPercent || currency.wonTradesPercent || 0,
      lostTrades: currency.total?.lostTrades || currency.lostTrades || 0,
      lostTradesPercent: currency.total?.lostTradesPercent || currency.lostTradesPercent || 0
    },
    long: currency.long || {
      trades: 0,
      profit: 0,
      pips: 0
    },
    short: currency.short || {
      trades: 0,
      profit: 0,
      pips: 0
    },
    history: currency.history || []
  };
}

const AdminChallengeDetail = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [metadataStats, setMetadataStats] = useState(null);
  const [currentStage, setCurrentStage] = useState(null);
  const [debugMode, setDebugMode] = useState(false);
  const [initialBalance, setInitialBalance] = useState(null);

  // Estados para manejo de datos del SDK
  const [metricsData, setMetricsData] = useState(null);
  const [metricsError, setMetricsError] = useState(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);
  const [useMetricsAPI, setUseMetricsAPI] = useState(false);
  const [equityChartData, setEquityChartData] = useState(null);

  // Estados para objetivos
  const [challengeConfig, setChallengeConfig] = useState(null);
  const [ddPercent, setDdPercent] = useState(10); // fallback
  const [profitTargetPercent, setProfitTargetPercent] = useState(10); // fallback
  const [maxDrawdownAbsolute, setMaxDrawdownAbsolute] = useState(null);
  const [profitTargetAbsolute, setProfitTargetAbsolute] = useState(null);

  // Extraer documentId de la URL
  const { documentId } = router.query;
  console.log("documentId", documentId);

  // Usar el servicio con el token JWT
  const route = documentId && session?.jwt ? `challenges/${documentId}?populate=*` : null;
  const { data, error, isLoading, mutate } = useStrapiData(route, session?.jwt);

  // Extraer challengeData de la estructura anidada
  const challengeData = data?.data;
  console.log("challengeData", challengeData);

  // Función para volver a la lista de challenges
  const handleBack = () => {
    router.push("/admin/challenges");
  };

  // Cuando los datos del challenge se cargan, extraer los datos de metadata
  useEffect(() => {
    // Verificar si los datos del challenge están disponibles
    if (!challengeData) {
      console.log('No hay datos del challenge disponibles aún');
      return;
    }

    // Console log para verificar los datos completos recibidos
    console.log('Datos del challenge recibidos:', {
      documentId,
      phase: challengeData.phase,
      hasMetadata: !!challengeData.metadata,
      metadataType: typeof challengeData.metadata
    });

    // Extraer el phase
    const phase = challengeData.phase;
    console.log('Phase extraído:', phase);

    // Verificar si existe el campo metadata
    if (challengeData.metadata) {
      try {
        // Intentar parsear el JSON si es un string
        const metadata = typeof challengeData.metadata === 'string'
          ? JSON.parse(challengeData.metadata)
          : challengeData.metadata;
        console.log('Metadata ', metadata);
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
        } else if (challengeData.broker_account && challengeData.broker_account.balance) {
          balanceInicial = challengeData.broker_account.balance;
          console.log('Balance inicial encontrado en challengeData.broker_account:', balanceInicial);
        }

        // Guardar el balance inicial en el estado
        setInitialBalance(balanceInicial);

        // Verificar si la metadata tiene las propiedades necesarias
        if (metadata && (metadata.metrics || metadata.trades)) {
          console.log('La metadata contiene datos válidos:');
          // Dar prioridad a metrics si existe, sino usar toda la metadata
          const statsToUse = { ...metadata.metrics || metadata };

          // Agregar propiedades adicionales
          statsToUse.broker_account = metadata.broker_account || challengeData.broker_account;
          statsToUse.equityChart = metadata.equityChart;

          // Asegurarse de que el balance inicial esté disponible en las estadísticas
          statsToUse.initialBalance = balanceInicial;

          // Obtener la fase actual del challenge
          const challengePhase = challengeData.phase;

          // Obtener los stages disponibles de la metadata
          const stages = metadata.challenge_stages;

          // Aplicar la lógica especial para determinar el stage correcto
          const selectedStage = determineCorrectStage(challengePhase, stages);

          if (selectedStage) {
            console.log('Stage seleccionado correctamente:', selectedStage);
          } else {
            console.warn('No se pudo seleccionar un stage válido para la fase:', challengePhase);
          }

          // Establecer el stage seleccionado
          const profitTarget = selectedStage.profitTarget || 10;
          const maxLoss = selectedStage.maximumTotalLoss || 10;
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
          setCurrentStage(selectedStage);

          // Establecer las estadísticas
          setMetadataStats(statsToUse);
          setUseMetricsAPI(false); // Usamos los datos de metadata

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
          console.warn('La metadata no contiene datos válidos, se intentará usar la API de MetaStats');
          setUseMetricsAPI(true); // Intentaremos usar la API
        }
      } catch (parseError) {
        console.error('Error al parsear metadata, se intentará usar la API de MetaStats:', parseError);
        setUseMetricsAPI(true); // Intentaremos usar la API
      }
    } else {
      console.warn('No se encontró el campo metadata, se intentará usar la API de MetaStats');
      setUseMetricsAPI(true); // Intentaremos usar la API
    }
  }, [challengeData, documentId]);

  // Efecto para obtener datos desde MetaStats cuando no hay metadata válida
  useEffect(() => {
    const fetchMetaStatsData = async () => {
      // Solo hacer la petición si se decidió usar la API y tenemos acceso a idMeta
      if (!useMetricsAPI || !challengeData?.broker_account?.idMeta) {
        console.log("No se puede usar la API de MetaStats:", {
          useMetricsAPI,
          idMeta: challengeData?.broker_account?.idMeta
        });
        return;
      }

      console.log("Iniciando la obtención de datos desde MetaStats...");

      setIsMetricsLoading(true);

      try {
        // 1. Obtener el metaId del broker_account
        const accountId = challengeData.broker_account.idMeta;
        console.log("accountId para MetaStats:", accountId);

        // 2. Crear instancia del SDK
        const metaStats = new MetaStats(process.env.NEXT_PUBLIC_TOKEN_META_API);

        // 3. Obtener las métricas
        const metrics = await metaStats.getMetrics(accountId);
        console.log("Métricas obtenidas de MetaStats:", metrics);
        setMetricsData(metrics);

        // 4. Obtener el equity chart (opcional)
        try {
          const url = `https://risk-management-api-v1.new-york.agiliumtrade.ai/users/current/accounts/${accountId}/equity-chart?realTime=false`;
          console.log("URL para equity-chart:", url);

          const response = await fetch(url, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "auth-token": process.env.NEXT_PUBLIC_TOKEN_META_API,
            },
          });

          if (response.ok) {
            const equityData = await response.json();
            console.log("Datos de equity-chart obtenidos:", equityData);
            setEquityChartData(equityData);
          }
        } catch (equityError) {
          console.error("Error obteniendo equity chart:", equityError);
        }

        // 5. Obtener stage desde ChallengeRelation/ChallengeStage
        console.log("Obteniendo configuración de stage desde Strapi...");
        console.log("document", documentId);
        const stageConfig = await fetchStageConfiguration(documentId, session?.jwt);
        if (stageConfig) {
          console.log("Configuración de stage obtenida:", stageConfig);
          setCurrentStage(stageConfig);

          // Extraer valores para los objetivos
          if (stageConfig.targets) {
            const profitTarget = stageConfig.targets.profit_target || 10;
            const maxLoss = stageConfig.targets.max_loss || 10;
            const maxDailyLoss = stageConfig.targets.max_daily_loss || 5;
            const minTradingDays = stageConfig.targets.minimum_trading_days || 0;

            // Guardar valores para objetivos
            setDdPercent(maxLoss);
            setProfitTargetPercent(profitTarget);

            // Configuración para el componente Objetivos
            setChallengeConfig({
              minimumTradingDays: minTradingDays,
              maximumDailyLossPercent: maxDailyLoss,
              maxDrawdownPercent: maxLoss,
              profitTargetPercent: profitTarget
            });
          }
        }

        // 6. Convertir los datos al formato de metadata
        const balanceInicial = challengeData.broker_account.balance;
        setInitialBalance(balanceInicial);

        // Calcular valores absolutos para objetivos
        if (balanceInicial) {
          const ddAbsolute = balanceInicial - (ddPercent / 100) * balanceInicial;
          setMaxDrawdownAbsolute(ddAbsolute);

          const ptAbsolute = balanceInicial + (profitTargetPercent / 100) * balanceInicial;
          setProfitTargetAbsolute(ptAbsolute);
        }

        // 7. Convertir y establecer los datos
        const convertedData = convertMetaStatsToMetadata(
          metrics,
          challengeData.broker_account,
          balanceInicial
        );

        if (equityChartData) {
          convertedData.equityChart = equityChartData;
        }

        // Asegurarse de que todos los campos importantes están disponibles
        if (convertedData) {
          // Añadir campos calculados si faltan
          if (!convertedData.profitFactor && convertedData.wonTrades && convertedData.lostTrades) {
            const totalWon = convertedData.wonTrades * convertedData.averageWin;
            const totalLost = Math.abs(convertedData.lostTrades * convertedData.averageLoss);
            convertedData.profitFactor = totalLost > 0 ? totalWon / totalLost : 0;
          }

          // Asegurarse de que los campos maxDrawdown sean consistentes
          if (!convertedData.maxDrawdown && convertedData.maxBalanceDrawdown) {
            convertedData.maxDrawdown = convertedData.maxBalanceDrawdown;
          }

          // Calcular expectancy si no está disponible
          if (!convertedData.expectancy) {
            const winRate = convertedData.wonTradesPercent / 100;
            const lossRate = convertedData.lostTradesPercent / 100;
            convertedData.expectancy = (winRate * convertedData.averageWin) + (lossRate * convertedData.averageLoss);
          }

          console.log("Campos adicionales calculados para convertedData:", {
            profitFactor: convertedData.profitFactor,
            expectancy: convertedData.expectancy,
            maxDrawdown: convertedData.maxDrawdown
          });
        }

        console.log("Datos convertidos al formato de metadata:", convertedData);
        setMetadataStats(convertedData);

      } catch (error) {
        console.error("Error obteniendo datos de MetaStats:", error);
        setMetricsError(error);
      } finally {
        setIsMetricsLoading(false);
      }
    };

    fetchMetaStatsData();
  }, [useMetricsAPI, challengeData, documentId, session, ddPercent, profitTargetPercent]);

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

  // Verificar si estamos esperando que el router proporcione el documentId o la sesión
  if (!documentId || !session) {
    return (
      <DashboardLayout>
        <Loader />
        <div className="mt-4 text-center text-gray-500">Cargando información del challenge...</div>
      </DashboardLayout>
    );
  }

  // Comprobar si tenemos token de MetaStats API
  useEffect(() => {
    if (useMetricsAPI) {
      const token = process.env.NEXT_PUBLIC_TOKEN_META_API;
      if (!token) {
        console.error("⚠️ No se encontró el token de MetaStats API. Asegúrate de que NEXT_PUBLIC_TOKEN_META_API está definido en las variables de entorno.");
      } else {
        console.log("Token de MetaStats API disponible ✓");
      }
    }
  }, [useMetricsAPI]);

  // Render de carga
  if (isLoading || isMetricsLoading) {
    return (
      <DashboardLayout>
        <div className="grid place-items-center h-[100%]">
          <div>
            <Loader />
            {isMetricsLoading && (
              <div className="mt-4 text-center text-gray-500">Obteniendo métricas...</div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Render de error
  if ((error || metricsError) && !metadataStats) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-8 bg-white dark:bg-zinc-800 rounded-lg shadow-lg w-full">
            <h1 className="text-2xl font-bold text-red-600">🚧 Error de conexión 🚧</h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              No se pudieron cargar los datos. Por favor, intenta nuevamente más tarde.
            </p>
            {metricsError && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 rounded text-sm text-red-800 dark:text-red-200">
                Error: {metricsError.message || "Error desconocido al obtener métricas"}
              </div>
            )}
            <Button
              className="mt-4 bg-blue-500 hover:bg-blue-600"
              onClick={handleBack}
            >
              Volver a la lista de challenges
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Sin metadata ni datos de API
  if (!metadataStats) {
    return (
      <DashboardLayout>
        {/* Cabecera con controles de navegación */}
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <ChartBarIcon className="w-6 h-6 mr-2" />
            Challenge {challengeData?.broker_account?.login || "Sin nombre"}
          </h1>
          <div className="flex space-x-2">
            <Button onClick={handleBack} variant="outline" size="sm">
              <ArrowLeftIcon className="w-4 h-4 mr-1" /> Volver a la lista
            </Button>
            <Button onClick={() => mutate()} variant="outline" size="sm">
              <ArrowPathIcon className="w-4 h-4 mr-1" /> Actualizar
            </Button>
          </div>
        </div>

        <h1 className="flex p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
          <ChartBarIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-white" />
          Historial de Cuenta {challengeData?.broker_account?.login || "Sin nombre"}
        </h1>

        <div className="mt-6 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
          <h2 className="text-lg font-semibold mb-4">Información básica del challenge</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><span className="font-semibold">ID de Challenge:</span> {challengeData?.challengeId || "No disponible"}</p>
              <p><span className="font-semibold">Fase:</span> {challengeData?.phase || "No disponible"}</p>
              <p><span className="font-semibold">Resultado:</span> {challengeData?.result || "No disponible"}</p>
            </div>
            <div>
              <p><span className="font-semibold">Fecha de inicio:</span> {challengeData?.startDate ? new Date(challengeData.startDate).toLocaleDateString() : "No disponible"}</p>
              <p><span className="font-semibold">Fecha de fin:</span> {challengeData?.endDate ? new Date(challengeData.endDate).toLocaleDateString() : "En progreso"}</p>
              <p><span className="font-semibold">Login MT4/MT5:</span> {challengeData?.broker_account?.login || "No disponible"}</p>
              <p><span className="font-semibold">Balance inicial:</span> ${challengeData?.broker_account?.balance || "No disponible"}</p>
            </div>
          </div>
        </div>

        {/* Información del usuario (solo visible para admin) */}
        <div className="mt-6 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
          <h2 className="text-lg font-semibold mb-4">Información del usuario</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><span className="font-semibold">Email:</span> {challengeData?.user?.email || "No disponible"}</p>
              <p><span className="font-semibold">Nombre:</span> {challengeData?.user?.username || "No disponible"}</p>
            </div>
            <div>
              <p><span className="font-semibold">ID de Usuario:</span> {challengeData?.user?.id || "No disponible"}</p>
              <p><span className="font-semibold">Fecha de registro:</span> {challengeData?.user?.createdAt ? new Date(challengeData.user.createdAt).toLocaleDateString() : "No disponible"}</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            {challengeData?.broker_account && (
              <CredencialesModal {...challengeData.broker_account} />
            )}
          </div>
        </div>

        {challengeData && (
          <RelatedChallenges currentChallenge={challengeData} />
        )}

        <div className="flex flex-col items-center justify-center py-10 mt-6 text-center">
          <div className="p-8 bg-white dark:bg-zinc-800 rounded-lg shadow-lg w-full">
            <h1 className="text-2xl font-bold text-yellow-600">⚠️ Sin datos históricos detallados ⚠️</h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              No hay datos estadísticos disponibles para este challenge.
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              Se ha intentado obtener datos de MetaStats pero no ha sido posible. Puede que el challenge no tenga un idMeta válido
              o que no haya datos disponibles en el servicio.
            </p>
            {challengeData?.broker_account?.idMeta && (
              <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900 rounded text-blue-800 dark:text-blue-200">
                <p className="font-semibold">Información de depuración:</p>
                <p>ID Meta disponible: {challengeData.broker_account.idMeta}</p>
                <p>Token API: {process.env.NEXT_PUBLIC_TOKEN_META_API ? "Configurado ✓" : "No configurado ⚠️"}</p>
                <button
                  onClick={() => {
                    setUseMetricsAPI(true);
                    setTimeout(() => mutate(), 500);
                  }}
                  className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                >
                  Intentar nuevamente
                </button>
              </div>
            )}
            {challengeData?.result === 'progress' && (
              <div className="mt-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Este challenge está actualmente en progreso. Para ver sus estadísticas en tiempo real, utiliza el enlace a continuación:
                </p>
                <div className="mt-4 flex gap-2 justify-center">
                  <Link href={`/metrix2/${documentId}`} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg inline-flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2" />
                    Ver métricas en tiempo real
                  </Link>
                  <Link href={`/historial/${documentId}`} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg inline-flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2" />
                    Ver en página de historial
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Render principal con metadata o datos de API
  return (
    <DashboardLayout>
      {/* Cabecera con controles de navegación */}
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center">
          <ChartBarIcon className="w-6 h-6 mr-2" />
          Challenge {challengeData?.broker_account?.login || "Sin nombre"}
        </h1>
        <div className="flex space-x-2">
          <Button onClick={handleBack} variant="outline" size="sm">
            <ArrowLeftIcon className="w-4 h-4 mr-1" /> Volver a la lista
          </Button>
          <Button onClick={() => mutate()} variant="outline" size="sm">
            <ArrowPathIcon className="w-4 h-4 mr-1" /> Actualizar
          </Button>
          <Link href={`/historial/${documentId}`} legacyBehavior>
            <Button as="a" variant="outline" size="sm" className="bg-green-500 text-white hover:bg-green-600">
              <ChartBarIcon className="w-4 h-4 mr-1" /> Ver en página de historial
            </Button>
          </Link>
        </div>
      </div>

      {useMetricsAPI && (
        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            <strong>Nota:</strong> Mostrando datos obtenidos en tiempo real desde MetaStats API.
          </p>
        </div>
      )}

      <h1 className="flex p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
        <ChartBarIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-white" />
        Historial de Cuenta {challengeData?.broker_account?.login || "Sin nombre"}
      </h1>

      {/* Información del usuario (solo visible para admin) */}
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md dark:text-white dark:border-zinc-700 dark:shadow-black">
        <h2 className="text-xl font-semibold mb-4">Información del usuario</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="mb-2"><span className="font-semibold">Email:</span> {challengeData?.user?.email || "No disponible"}</p>
            <p className="mb-2"><span className="font-semibold">Nombre:</span> {challengeData?.user?.username || "No disponible"}</p>
          </div>
          <div>
            <p className="mb-2"><span className="font-semibold">ID de Usuario:</span> {challengeData?.user?.id || "No disponible"}</p>
            <p className="mb-2"><span className="font-semibold">Fecha de registro:</span> {challengeData?.user?.createdAt ? new Date(challengeData.user.createdAt).toLocaleDateString() : "No disponible"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {challengeData?.broker_account && (
            <CredencialesModal {...challengeData.broker_account} />
          )}
        </div>
      </div>

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
        <h2 className="text-lg font-semibold pb-4">Objetivos</h2>
        {challengeConfig ? (
          <Objetivos
            // Pasar la configuración del desafío
            challengeConfig={challengeConfig}
            // Pasar los datos de métricas
            metricsData={useMetricsAPI ? metricsData : metadataStats}
            // Balance inicial para cálculos
            initBalance={initialBalance || challengeData?.broker_account?.balance}
            // Fase actual
            pase={challengeData?.phase}
          />
        ) : (
          <div className="border-gray-500 dark:border-zinc-800 dark:shadow-black bg-white rounded-md shadow-md dark:bg-zinc-800 dark:text-white p-6 text-center">
            <p>Cargando objetivos...</p>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-6">
        <div className="w-full md:w-1/1 rounded-lg">
          <h2 className="text-lg font-bold mb-4">Estadísticas</h2>
          <StatisticsHistorical
            metadata={metadataStats}
            phase={challengeData?.phase || "Desconocida"}
            stageConfig={currentStage}
            brokerInitialBalance={initialBalance || metadataStats.deposits || challengeData?.broker_account?.balance}
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

      {challengeData && (
        <RelatedChallenges currentChallenge={challengeData} />
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

            <h3 className="text-md font-semibold mb-2 mt-4">Balance inicial</h3>
            <pre className="bg-gray-800 text-yellow-400 p-4 rounded-lg overflow-auto text-sm mt-2">
              {initialBalance}
            </pre>

            <h3 className="text-md font-semibold mb-2 mt-4">Fase del challenge</h3>
            <pre className="bg-gray-800 text-yellow-400 p-4 rounded-lg overflow-auto text-sm mt-2">
              {challengeData?.phase}
            </pre>

            <h3 className="text-md font-semibold mb-2 mt-4">Origen de datos</h3>
            <pre className="bg-gray-800 text-yellow-400 p-4 rounded-lg overflow-auto text-sm mt-2">
              {useMetricsAPI ? "MetaStats API" : "Metadata del Challenge"}
            </pre>

            <h3 className="text-md font-semibold mb-2 mt-4">Configuración de Objetivos</h3>
            <pre className="bg-gray-800 text-yellow-400 p-4 rounded-lg overflow-auto text-sm mt-2">
              {JSON.stringify({
                challengeConfig,
                ddPercent,
                profitTargetPercent,
                maxDrawdownAbsolute,
                profitTargetAbsolute,
                initialBalance
              }, null, 2)}
            </pre>

            {useMetricsAPI && metricsData && (
              <>
                <h3 className="text-md font-semibold mb-2 mt-4">Datos originales de MetaStats</h3>
                <pre className="bg-gray-800 text-yellow-400 p-4 rounded-lg overflow-auto text-sm mt-2">
                  {JSON.stringify(metricsData, null, 2)}
                </pre>
              </>
            )}

            <h3 className="text-md font-semibold mb-2 mt-4">Datos originales del Challenge (estructura completa)</h3>
            <pre className="bg-gray-800 text-yellow-400 p-4 rounded-lg overflow-auto text-sm mt-2">
              {JSON.stringify(challengeData, null, 2)}
            </pre>
          </div>
        )}

        <pre
          id="metadata-json"
          className="bg-black text-white p-4 rounded-lg overflow-auto text-sm mt-2"
          style={{ display: 'none' }}
        >
          {JSON.stringify(metadataStats, null, 2)}
        </pre>
      </div>
    </DashboardLayout>
  );
};

export default AdminChallengeDetail;
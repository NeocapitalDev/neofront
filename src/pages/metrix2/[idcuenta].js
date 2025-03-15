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
import MyPage from "./grafico";
import  CircularProgress  from 'src/pages/metrix2/barrascircular'



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
  const [apiResult, setApiResult] = useState(null);

  const { data: challengeData, error, isLoading } = useSWR(
    idcuenta
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenges/${idcuenta}?populate=broker_account`
      : null,
    fetcher
  );

  const [metricsData, setMetricsData] = useState(null);
  const [metricsError, setMetricsError] = useState(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);

  useEffect(() => {
    const fetchAdditionalMetrics = async (idMeta) => {
      const metaStats = new MetaStats(process.env.NEXT_PUBLIC_TOKEN_META_API);
      try {
        const metrics = await metaStats.getMetrics(idMeta);
        setMetricsData(metrics);
        //      console.log(metricsData);
      } catch (err) {
        setMetricsError(err);
      } finally {
        setIsMetricsLoading(false);
      }
    };


    if (challengeData?.data?.broker_account?.idMeta) {
      fetchAdditionalMetrics(challengeData.data.broker_account.idMeta);
    }
  }, [challengeData?.data?.broker_account?.idMeta]);


  useEffect(() => {
    const fetchData = async () => {
      if (!challengeData?.data?.broker_account?.idMeta || !challengeData?.data?.challengeId) return;
  
      // Imprime en la consola los valores que se usarán para construir la URL
      console.log("Broker Account idMeta:", challengeData.data.broker_account.idMeta);
      console.log("Challenge id:", challengeData.data.challengeId);
      
      const url = `https://risk-management-api-v1.new-york.agiliumtrade.ai/users/current/accounts/${challengeData.data.broker_account.idMeta}/trackers/${challengeData.data.challengeId}/statistics`;
      console.log("URL construida:", url);
  
      const token = process.env.NEXT_PUBLIC_TOKEN_META_API;
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "auth-token": `${token}`,
            "api-version": 1,
          },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const result = await response.json();
        setApiResult(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, [challengeData]);
  

  if (isLoading || isMetricsLoading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout>

      <h1 className="flex p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
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

      {error || metricsError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-white">
          <div className="p-8 bg-white dark:bg-zinc-800 rounded-lg shadow-lg w-full">
            <h1 className="text-2xl font-bold text-red-600">🚧 Error de conexión 🚧</h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              No se pudieron cargar los datos. Por favor, intenta nuevamente más tarde.
            </p>
          </div>
        </div>
      ) : (
        <>
          <CircularProgress  />
          <MyPage />

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Métricas de Meta API</h2>
            {metricsError ? (
              <p className="text-red-500">Error al cargar las métricas: {metricsError.message}</p>
            ) : metricsData ? (
              <pre className="bg-black text-white p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(metricsData, null, 2)}
              </pre>
            ) : (
              <p>Cargando métricas adicionales...</p>
            )}
          </div>

          <div className="mt-6">

            <h2 className="text-lg font-semibold">Challenge Stats</h2>
            {apiResult ? (
              <pre className="bg-black text-white p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(apiResult, null, 2)}
              </pre>
            ) : (
              <p>Cargando datos...</p>
            )}
          </div>


        </>
      )}

    </Layout>
  );
};

export default Metrix;

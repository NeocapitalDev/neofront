import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import Layout from "../../components/layout/dashboard";
import Loader from "../../components/loaders/loader";
import { PhoneIcon, ChartBarIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import CredencialesModal from "../dashboard/credentials";
import Link from "next/link";

import Balance from "./balance";
import Stats from "./stats";
import WinLoss from "./winloss";
import Objetivos from "./objetivos";

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

  const { data: challengeData, error, isLoading } = useSWR(
    idcuenta
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenges/${idcuenta}`
      : null,
    fetcher
  );

  const [metricsData, setMetricsData] = useState(null);
  const [metricsError, setMetricsError] = useState(null);

  // useEffect(() => {
  //   console.log("challengeData recibido:", challengeData);
  // }, [challengeData]);


  useEffect(() => {
    const fetchAdditionalMetrics = async (idMeta) => {
      try {
        const response = await fetch(
          `https://metastats-api-v1.new-york.agiliumtrade.ai/users/current/accounts/${idMeta}/metrics`,
          {
            headers: {
              "auth-token": `${process.env.NEXT_PUBLIC_TOKEN_META_API}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Error al obtener datos de MetaAPI");
        }
        const data = await response.json();
        setMetricsData(data);
      } catch (err) {
        setMetricsError(err);
      }
    };

    if (challengeData?.data?.idMeta) {
      fetchAdditionalMetrics(challengeData.data.idMeta);
    }
  }, [challengeData?.data?.idMeta]);

  if (isLoading) {
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
        Account Metrix {challengeData?.data?.login || "Sin nombre"}
      </h1>

      <div className="flex justify-start gap-3 my-6">
        {challengeData?.data && <CredencialesModal {...challengeData.data} />}

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
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                {console.log("Datos enviados a Balance:", metricsData)}
                <Balance data={metricsData || {}} />
              </div>
              <div className="md:col-span-1">
                {challengeData?.data && <Stats {...challengeData.data} />}
              </div>
            </div>
          </div>

          <WinLoss data={metricsData || {}} />


          <Objetivos />

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Detalles del desafío</h2>
            <pre className="bg-black text-white p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(challengeData, null, 2)}
            </pre>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Métricas adicionales</h2>
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
        </>
      )}

    </Layout>
  );
};

export default Metrix;

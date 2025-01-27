import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import Layout from "../../components/layout/dashboard";
import Loader from "../../components/loaders/loader";
import Component from "../metrix/balance"; // Importar el componente del gráfico

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

  if (error) {
    return (
      <Layout>
        Error al cargar los datos: {error.message}
      </Layout>
    );
  }

  if (!challengeData || !challengeData.data) {
    return (
      <Layout>
        No se encontraron datos para esta cuenta.
      </Layout>
    );
  }

  return (
    <Layout title="Metrix">
      <h1 className="flex p-6 bg-white shadow-md rounded-lg dark:bg-zinc-800 dark:text-white">
        Account Metrix {challengeData.data.login || "Sin nombre"}
      </h1>
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Métricas adicionales</h2>
        {metricsError ? (
          <p className="text-red-500">
            Error al cargar las métricas: {metricsError.message}
          </p>
        ) : metricsData ? (
          // Pasar metricsData al componente gráfico
          <Component metricsData={metricsData} />
        ) : (
          <p>Cargando métricas adicionales...</p>
        )}
      </div>
    </Layout>
  );
};

export default Metrix;

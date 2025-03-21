// src/pages/admin/parameters/index.js
import React from "react";
import { useRouter } from "next/navigation"; // o "next/router" en Next.js 12
import DataTable from "@/components/forms/parameters/DataTable";
import Columns from "@/components/forms/parameters/Columns";
import DashboardLayout from "..";
import useSWR from "swr";

function IndexPage() {
  const fetcher = (url) =>
    fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

  const { data, isLoading, error, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-relations?populate=*`,
    fetcher
  );

  // Función para actualizar los datos
  function actualizarDatos() {
    mutate();
    console.log("Datos actualizados");
  }

  const processedData = data?.data || [];
  const router = useRouter();

  // Función para manejar el clic en "Ver Visualizador"
  function handleViewVisualizer() {
    // Ajusta la ruta a donde quieras redirigir
    router.push("/admin/parameters/visualizador");
  }

  return (
    <DashboardLayout>
      <div className="p-6 text-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-6">Parámetros</h1>

        {/* Botón "Ver Visualizador" en la parte superior */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleViewVisualizer}
            className="bg-amber-400 hover:bg-amber-500 px-4 py-2 rounded text-black font-semibold transition-colors"
          >
            Ver Visualizador
          </button>
        </div>

        {/* Tabla de datos */}
        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 mt-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400 mx-auto"></div>
              <p className="mt-4 text-zinc-400">Cargando datos...</p>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 text-red-400 p-4 rounded border border-red-800">
              <p className="font-medium">Error al cargar los datos:</p>
              <p>{error.message}</p>
            </div>
          ) : (
            <DataTable data={processedData} columns={Columns(actualizarDatos)} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default IndexPage;
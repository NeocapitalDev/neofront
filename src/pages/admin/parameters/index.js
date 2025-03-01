import React from "react";
import { useRouter } from "next/navigation"; // o "next/router" en Next.js 12
import { useStrapiData } from "../../../services/strapiService";
import { DataTable } from "./DataTable";
import { Columns } from "./Columns";
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



  const { data, isLoading, error } = useSWR(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-relations?populate=*`,
    fetcher
  );

  const processedData = data?.data || [];
  
  console.log(processedData);

  // const { data, error, isLoading } = useStrapiData("challenge-relations?populate=*");
  const router = useRouter();

  // Función para manejar el clic en "Ver Visualizador"
  function handleViewVisualizer() {
    // Ajusta la ruta a donde quieras redirigir
    router.push("/admin/parameters/visualizador");
  }

  return (
    <DashboardLayout>
      <section className="w-full mx-auto h-full p-4 text-white">
        {/* Botón "Ver Visualizador" en la parte superior */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleViewVisualizer}
            className="bg-amber-400 hover:bg-amber-500 px-3 py-2 rounded text-black"
          >
            Ver Visualizador
          </button>
        </div>

        {/* Contenido principal */}
        <div className="flex flex-col gap-4">
          {isLoading && <div>Loading...</div>}
          {error && <div>Error: {error.message}</div>}
          {data && <DataTable data={processedData} columns={Columns} />}
        </div>
      </section>
    </DashboardLayout>
  );
}

export default IndexPage;

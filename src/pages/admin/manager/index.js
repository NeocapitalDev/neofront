"use client";

import React, { useState } from "react";
import { SubcategoriesManager } from "@/components/manager/SubcategoriesManager";
import { ProductsManager } from "@/components/manager/ProductsManager";
import { StagesManager } from "@/components/manager/StagesManager";
import { RowsPerPage } from "@/components/table/RowsPerPage";
import DashboardLayout from "..";

export default function IndexPage() {
  // Estado para el tamaño de página, compartido entre las tres tablas
  const [pageSize, setPageSize] = useState(5);

  return (
    <DashboardLayout>
      <div className="p-6 text-white rounded-lg shadow-lg min-h-screen">
        <h1 className="text-4xl font-bold mb-6">Gestion de Registros</h1>

        {/* Control de filas por página */}
        <div className="mb-4">
          <RowsPerPage pageSize={pageSize} onPageSizeChange={setPageSize} />
        </div>

        {/* Grid con las 3 tablas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Cada componente está dentro de un contenedor con el mismo estilo */}
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
            <h2 className="text-xl font-semibold mb-4">Subcategorías</h2>
            <SubcategoriesManager pageSize={pageSize} />
          </div>

          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
            <h2 className="text-xl font-semibold mb-4">Productos</h2>
            <ProductsManager pageSize={pageSize} />
          </div>

          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
            <h2 className="text-xl font-semibold mb-4">Etapas</h2>
            <StagesManager pageSize={pageSize} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
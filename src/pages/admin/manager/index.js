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
      <div className="p-2 space-y-4 min-h-screen text-white">
        <RowsPerPage pageSize={pageSize} onPageSizeChange={setPageSize} />
        {/* Grid con las 3 tablas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Subcategorías */}
          <SubcategoriesManager pageSize={pageSize} />

          {/* Productos */}
          <ProductsManager pageSize={pageSize} />

          {/* Stages */}
          <StagesManager pageSize={pageSize} />
        </div>
      </div>
    </DashboardLayout>
  );
}

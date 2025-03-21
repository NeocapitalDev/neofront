"use client";

import React, { useState, useEffect } from "react";
import { useStrapiData } from "../../../services/strapiService";
import { DataTable } from "@/components/table/DataTable";
import { getColumns } from "@/components/table/Columns";
import DashboardLayout from "..";
import { useRouter } from "next/router";
import { X, Plus } from "lucide-react";
import Skeleton from "@/components/loaders/loader";
import { Toaster, toast } from 'sonner';

export default function ViewSteps() {
  const { data, error, isLoading } = useStrapiData("challenge-steps/get-all-data");
  const [selectedRow, setSelectedRow] = useState(null);
  const router = useRouter();

  const handleCreate = () => {
    router.push("/admin/steps/create");
  };

  useEffect(() => {
    // Si existen parámetros de toast en la query, muestra el toast
    if (router.query.toast && router.query.message) {
      if (router.query.toast === "success") {
        toast.success(router.query.message);
      } else {
        toast.error(router.query.message);
      }
      // Limpia los parámetros de la query para que no se vuelva a disparar el toast
      router.replace(router.pathname, undefined, { shallow: true });
    }
  }, [router.query, router]);

  return (
    <DashboardLayout>
      <div className="p-6 text-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-6">Challenge Steps</h1>

        {isLoading ? (
          <StepLoader />
        ) : error ? (
          <div className="text-red-400 p-4">Error: {error.message}</div>
        ) : data && (
          <div className="w-full">
            {/* Botón para crear nuevo registro */}
            <div className="w-full flex justify-end mb-4">
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-[var(--app-primary)] text-black font-semibold rounded hover:bg-[var(--app-secondary)] transition-colors"
              >
                <p className="flex items-center justify-center gap-2">
                  Nuevo Registro<Plus className="h-4 w-4" />
                </p>
              </button>
            </div>

            {/* Tabla de datos */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 mt-4">
              <DataTable data={data} columns={getColumns()} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export const StepLoader = () => {
  return (
    <div className='grid place-items-center h-[calc(100vh-300px)]'>
      <Skeleton />
    </div>
  );
}
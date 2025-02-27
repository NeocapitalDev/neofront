import React, { useState } from "react";
import { useStrapiData } from "../../../services/strapiService";
import { DataTable } from "@/components/table/DataTable";
import { getColumns, Challenge } from "@/components/table/Columns";
import DashboardLayout from "..";
import { useRouter } from "next/router";
import { X, Plus } from "lucide-react";
import Skeleton from "@/components/loaders/loader";


export default function ViewSteps() {
  const { data, error, isLoading } = useStrapiData("challenge-steps?populate=*");

  // Estado que guarda la fila seleccionada para editar
  const [selectedRow, setSelectedRow] = useState(null);
  console.log("selectedRow", selectedRow);
  console.log("data", data);
  // console.log("data 0", data[0]);
  const router = useRouter();
  const handleCreate = () => {
    router.push("/admin/steps/create");
  };
  return (
    <DashboardLayout>
      {isLoading && <StepLoader></StepLoader>}
      {error && <div>Error: {error.message}</div>}
      {data && (
        <div className="w-[70%] mx-auto">
          <div className="w-full flex justify-end">
            <button onClick={handleCreate} className="px-4 py-2 bg-[var(--app-primary)] text-black font-semibold rounded hover:bg-[var(--app-secondary)]">
              <p className="flex items-center justify-center gap-2">
                Nuevo Registro<Plus className="h-4 w-4" />
              </p>
            </button>
          </div>
          <div className="my-10"></div>
          <DataTable data={data} columns={getColumns(Challenge)} />
        </div>
      )}

      {/* <UpdateStepFormC step={data[0]}></UpdateStepFormC> */}
    </DashboardLayout>
  );
}
export const StepLoader = () => {
  return (
    <div className='grid place-items-center h-[calc(100vh-100px)]'><Skeleton></Skeleton></div>
  )
}

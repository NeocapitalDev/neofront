// pages/steps/[documentid].js
import React from 'react';
import { useRouter } from "next/router";
import { UpdateStepFormC } from "@/components/forms/step/UpdateStepFormC";
import DashboardLayout from "../../";
import { useStrapiData } from "../../../../services/strapiServiceId";
import { StepLoader } from '..';

export default function UpdateStep() {
  const { documentid } = useRouter().query;

  // Llamamos al hook solo si documentid está disponible
  const { data, error, isLoading, refetch } = useStrapiData(
    documentid ? `challenge-steps/${documentid}/get-all-data` : null
  );
  // console.log("data", data);
  // Callback que se pasa al formulario para refrescar la data
  const handleActive = () => {
    console.log("active");
    refetch(); // Vuelve a ejecutar la consulta
  };

  // Mientras no se tenga documentid o se esté cargando, mostramos un loader
  if (!documentid || isLoading) {
    return (
      <DashboardLayout>
        <StepLoader />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className='grid place-items-center h-screen'>
          Error: <p className='text-red-500'>{error.message}</p>
        </div>
      </DashboardLayout>
    );
  }

  // En Strapi v4, el registro único suele estar en data[0] si la respuesta es un arreglo
  return (
    <DashboardLayout>
      <UpdateStepFormC step={data.data[0]} onStepChange={handleActive} />
    </DashboardLayout>
  );
}

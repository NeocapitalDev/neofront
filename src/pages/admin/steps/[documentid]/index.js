// pages/steps/[documentid].js

import React from 'react';
import { useRouter } from "next/router";
import { UpdateStepFormC } from "@/components/forms/step/UpdateStepFormC";
import DashboardLayout from "../../";
import { useStrapiData } from "../../../../services/strapiServiceId";
import { StepLoader } from '..';
export default function UpdateStep() {
  const { documentid } = useRouter().query;
  if (!documentid) {
    return <DashboardLayout><StepLoader></StepLoader></DashboardLayout>;
  }

  const { data, error, isLoading } =
    useStrapiData(`challenge-steps/${documentid}?populate=*`);

  if (isLoading) return <DashboardLayout><StepLoader></StepLoader></DashboardLayout>;
  if (error) return <DashboardLayout><div className='grid place-items-center h-screen'>Error: <p className='text-red-500'>{error.message}</p></div></DashboardLayout>;

  // In Strapi v4, single record often is at data.data
  const step = data.data ? data.data : data;

  return (
    <DashboardLayout>
      <UpdateStepFormC step={step} />
    </DashboardLayout>
  );
}

import React from 'react'
import { CreateStepFormC } from "@/components/forms/step/CreateStepFormC";
import DashboardLayout from "../../";
export default function Index() {
  return (
    <DashboardLayout>
      <div>
        <CreateStepFormC />
      </div>
    </DashboardLayout>
  )
}

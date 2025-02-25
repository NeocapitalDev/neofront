import React, { useState } from "react";
import StepForm from "./StepFrom";
import StageForm from "./StageForm";
import ProductForm from "./ProductForm";
import AccountForm from "./AccountForm";
import { CreateStepForm } from "./CreateStepForm";
import { useStrapiData } from "../../services/strapiService";
import { DataTable } from "@/components/table/DataTable";
import { getColumns, Challenge } from "@/components/table/Columns";

function Index() {
    const { data, error, isLoading } = useStrapiData("challenge-steps?populate=*");

    // Estado que guarda la fila seleccionada para editar
    const [selectedRow, setSelectedRow] = useState(null);
    console.log("selectedRow", selectedRow);
    console.log("data", data);
    return (
        <section className="w-[100%] h-[100%] p-4 bg-black text-white">
            <div className="flex flex-col gap-4 mb-32">
                {/* Se le pasa la fila seleccionada a StepForm */}
                {/* <StepForm step={selectedRow} />
                 */}
                <CreateStepForm />
            </div>

            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {data && (
                <div className="w-[70%] mx-auto">
                    <DataTable data={data} columns={getColumns(setSelectedRow)} />
                </div>
            )}
        </section>
    );
}

export default Index;

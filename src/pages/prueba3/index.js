import React from 'react'
import StepForm from './StepFrom';
import StageForm from './StageForm';
import ProductForm from './ProductForm';
import AccountForm from './AccountForm';
import { useStrapiData } from "../../services/strapiService";
import { DataTable } from '@/components/table/DataTable';
import { Columns } from '@/components/table/Columns';


function index() {
    const { data, error, isLoading } = useStrapiData("challenge-steps?populate=*");
    return (
        <section className='w-[100%] h-[100%] p-4 bg-black text-white'>

            <div className='flex flex-col gap-4'>
                <StepForm></StepForm>
                {/* <StageForm></StageForm>
                <ProductForm></ProductForm>
                <AccountForm></AccountForm> */}

            </div>
            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {data && <DataTable data={data} columns={Columns} />}
        </section>
    )
}

export default index
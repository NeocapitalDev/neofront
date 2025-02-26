import React from 'react'
import { useStrapiData } from "../../../services/strapiService";
import { DataTable } from './DataTable';
import { Columns } from './Columns';
import DashboardLayout from "..";


function index() {
    const { data, error, isLoading } = useStrapiData("challenge-relations-stages?populate=*");
    return (

    <DashboardLayout>


        <section className='w-[100%] h-[100%] p-4 bg-black text-white'>

            <div className='flex flex-col gap-4'>
            
            
            </div>

            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {data && <DataTable data={data} columns={Columns} />}
        </section>
            </DashboardLayout>
        
    )
}

export default index


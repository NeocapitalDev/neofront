import React from 'react'
import StepForm from './StepFrom';
import StageForm from './StageForm';
import ProductForm from './ProductForm';
import AccountForm from './AccountForm';
import { useStrapiData } from "../../services/strapiService";


function index() {
    
    return (
        <section className='w-[100%] h-[100%] p-4 bg-black text-white'>

            <div className='grid grid-cols-3 gap-4 place-items-center'>
                <StepForm></StepForm>
                <StageForm></StageForm>
                <ProductForm></ProductForm>
                <AccountForm></AccountForm>
            </div>
        </section>
    )
}

export default index
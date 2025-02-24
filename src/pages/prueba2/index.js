import React from 'react'
import StepForm from './StepFrom';
import StageForm from './StageForm';

function index() {
    return (
        <div className='grid grid-cols-2 gap-4 place-items-center'>
            <StepForm></StepForm>
            <StageForm></StageForm></div>
    )
}

export default index
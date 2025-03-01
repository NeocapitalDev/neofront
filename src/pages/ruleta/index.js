import React from 'react'
import RuletaSorteo from './Ruleta'
import DashboardLayout from '../admin'
export default function Index() {
    return (
        <DashboardLayout>
            {/* <Button>Perder</Button> */}
            <RuletaSorteo>
            </RuletaSorteo>
        </DashboardLayout>
    )
}

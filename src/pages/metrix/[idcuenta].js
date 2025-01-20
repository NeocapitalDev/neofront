import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/dashboard';
import { ChartBarIcon } from '@heroicons/react/24/outline'; 
import MetrixDash from '../../components/structure/dashboard/metrixdash';
import MetrixInfo from '../../components/structure/dashboard/metrixinfo';

const Metrix = () => {
    const router = useRouter();
    const { idcuenta } = router.query; // Obtiene el idcuenta de la URL

    return (
        <Layout title="Metrix">
            <div className="p-0 ">
                <h1 className="bg-white rounded-md p-4 text-xl font-bold mb-4 shadow-md flex items-center">
                    <ChartBarIcon className="w-6 h-6 mr-2 text-gray-700" />
                    Account Metrix {idcuenta ? idcuenta : 'Cargando...'}
                </h1>
                <div className="flex justify-start gap-3 mb-4">
                    <button className="bg-white border-2 border-slate-200 hover:border-slate-400 py-2 px-4 rounded-md shadow-sm transition duration-300">Credenciales</button>
                    <button className="bg-white border-2 border-slate-200 hover:border-slate-400 py-2 px-4 rounded-md shadow-sm transition duration-300">Contacte con nosotros</button>
                    <button className="bg-white border-2 border-slate-200 hover:border-slate-400 py-2 px-4 rounded-md shadow-sm transition duration-300">Actualizar</button>
                </div>

                <div className="flex space-x-4">
                    <div className="w-3/4">
                        <h2 className="text-lg font-semibold">Resultados Actuales</h2>
                        <MetrixDash />
                    </div>

                    <div className="w-1/4">
                        <h2 className="text-lg font-semibold">Free Trial {idcuenta}</h2>
                        <div className="border rounded-md p-4 mb-4 bg-white shadow-md">
                            <MetrixInfo />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Metrix;
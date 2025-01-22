import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/dashboard';
import { ArrowPathIcon, ChartBarIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline';
import MetrixDash from '../dashboard/metrixdash';
import MetrixInfo from '../dashboard/metrixinfo';
import Objetivos from '../dashboard/objetivos';
import Diariotrading from '../dashboard/diariotrading';

const Metrix = () => {
    const router = useRouter();
    const { idcuenta } = router.query; // Obtiene el idcuenta de la URL

    return (
        <Layout title="Metrix">
            <h1 className="flex p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                <ChartBarIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-white" />
                Account Metrix {idcuenta ? idcuenta : 'Cargando...'}
            </h1>
            
            <div className="flex justify-start gap-3 my-6">
                <button className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border-gray-300 dark:border-zinc-500">
                    <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                    <span className="text-xs lg:text-sm dark:text-zinc-200">Credenciales</span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border-gray-300 dark:border-zinc-500">
                    <PhoneIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                    <span className="text-xs lg:text-sm dark:text-zinc-200">Contacte con nosotros</span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border-gray-300 dark:border-zinc-500">
                    <ArrowPathIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                    <span className="text-xs lg:text-sm dark:text-zinc-200">Actualizar</span>
                </button>
            </div>


            <div className="flex space-x-4">
                <div className="w-3/4">
                    <h2 className="text-lg font-semibold">Resultados Actuales</h2>
                    <MetrixDash />
                </div>

                <div className="w-1/4">
                    <h2 className="text-lg font-semibold">Free Trial {idcuenta}</h2>
                    <MetrixInfo />
                </div>
            </div>
            
            <Objetivos />
            <Diariotrading />

        </Layout>
    );
};

export default Metrix;
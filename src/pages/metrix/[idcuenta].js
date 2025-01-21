import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/dashboard';
import { ChartBarIcon } from '@heroicons/react/24/outline'; 
import MetrixDash from '../../components/structure/dashboard/metrixdash';
import MetrixInfo from '../../components/structure/dashboard/metrixinfo';
import Objetivos from '../../components/structure/dashboard/objetivos';
import Diariotrading from '../../components/structure/dashboard/diariotrading';

const Metrix = () => {
    const router = useRouter();
    const { idcuenta } = router.query; // Obtiene el idcuenta de la URL

    return (
        <Layout title="Metrix">
            <div className="p-0 ">
                <h1 className="bg-white rounded-md p-4 text-xl font-bold mb-4 flex items-center  dark:bg-zinc-800 border-gray-200  border-2  shadow-md dark:text-white dark:border-zinc-800 dark:shadow-black">
                    <ChartBarIcon className="w-6 h-6 mr-2 text-gray-700 " />
                    Account Metrix {idcuenta ? idcuenta : 'Cargando...'}
                </h1>
                <div className="flex justify-start gap-3 mb-4">
                    <button className="p-6 dark:bg-zinc-800 border-gray-200  dark:text-white dark:border-zinc-800 dark:shadow-black bg-white border-2  hover:border-slate-400 py-2 px-4 rounded-md shadow-md transition duration-300">Credenciales</button>
                    <button className="p-6 dark:bg-zinc-800 border-gray-200  dark:text-white dark:border-zinc-800 dark:shadow-black bg-white border-2  hover:border-slate-400 py-2 px-4 rounded-md shadow-md transition duration-300">Contacte con nosotros</button>
                    <button className="p-6 dark:bg-zinc-800 border-gray-200  dark:text-white dark:border-zinc-800 dark:shadow-black bg-white border-2  hover:border-slate-400 py-2 px-4 rounded-md shadow-md transition duration-300">Actualizar</button>

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
                <h2 className="text-lg mt-5 font-semibold">Objetivos</h2>
                <Objetivos />
                <br />
                <Diariotrading />

            </div>
        </Layout>
    );
};

export default Metrix;
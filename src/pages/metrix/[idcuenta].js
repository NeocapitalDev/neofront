import React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/dashboard';
import { ArrowPathIcon, ChartBarIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline';
import MetrixDash from '../../pages/metrix/metrixdash';
import MetrixInfo from '../../pages/metrix/metrixinfo';
import Objetivos from '../../pages/metrix/objetivos';
import Diariotrading from '../../pages/metrix/diariotrading';
import Loader from '../../components/loaders/loader';
import CredencialesModal from '../../pages/dashboard/credentials';

const fetcher = (url) =>
    fetch(url, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
    }).then((res) => res.json());

const Metrix = () => {
    const router = useRouter();
    const { idcuenta } = router.query; // Obtiene el idcuenta de la URL

    const { data: challengeData, error, isLoading } = useSWR(
        idcuenta ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenges/${idcuenta}` : null,
        fetcher
    );

    if (isLoading) {
        return <Layout><Loader /></Layout>;
    }

    if (error) {
        console.error('Error fetching challenge data:', error);
        return <Layout>Error al cargar los datos: {error.message}</Layout>;
    }

    console.log('Challenge Data:', challengeData);

    return (
        <Layout title="Metrix">
            <h1 className="flex p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                <ChartBarIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-white" />
                Account Metrix {challengeData?.data?.id ? `${challengeData.data.login}` : ''}
            </h1>

            <div className="flex justify-start gap-3 my-6">
                <CredencialesModal {...challengeData.data} />


                <Link href="/support" className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border-gray-300 dark:border-zinc-500">
                    <PhoneIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                    <span className="text-xs lg:text-sm dark:text-zinc-200">Contacte con nosotros</span>
                </Link>
                <button onClick={() => router.reload()} className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border-gray-300 dark:border-zinc-500">
                    <ArrowPathIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                    <span className="text-xs lg:text-sm dark:text-zinc-200">Actualizar</span>
                </button>
            </div>


            <div className="mt-6">
                <h2 className="text-lg font-semibold">Detalles del desafío</h2>
                <pre className="bg-black p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(challengeData, null, 2)}
                </pre>
            </div>

            {/* <div>
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
            </div> */}
        </Layout>
    );
};

export default Metrix;

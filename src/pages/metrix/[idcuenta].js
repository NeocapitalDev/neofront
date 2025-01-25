import React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/dashboard';
import { ArrowPathIcon, ChartBarIcon, PhoneIcon } from '@heroicons/react/24/outline';
import Loader from '../../components/loaders/loader';
import CredencialesModal from '../../pages/dashboard/credentials';
import Balance from "../../pages/prueba/index"
import Stats from "./stats"
import MetrixDash from './metrixdash';

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

    // Mostrar loader mientras se cargan los datos
    if (isLoading) {
        return (
            <Layout>
                <Loader />
            </Layout>
        );
    }

    // Mostrar mensaje de error si ocurre un problema al cargar los datos
    if (error) {
        console.error('Error fetching challenge data:', error);
        return (
            <Layout>
                <div className="p-4 bg-red-100 text-red-700 rounded-md">
                    Error al cargar los datos: {error.message}
                </div>
            </Layout>
        );
    }

    // Si no hay datos o la estructura no es válida, mostrar un fallback
    if (!challengeData || !challengeData.data) {
        return (
            <Layout>
                <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
                    No se encontraron datos para esta cuenta.
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Metrix">
            <h1 className="flex p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                <ChartBarIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-white" />
                Account Metrix {challengeData.data.login || 'Sin nombre'}
            </h1>

            <div className="flex justify-start gap-3 my-6">
                {/* Renderiza el modal solo si challengeData.data está disponible */}
                {challengeData.data && <CredencialesModal {...challengeData.data} />}

                <Link
                    href="/support"
                    className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border-gray-300 dark:border-zinc-500"
                >
                    <PhoneIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                    <span className="text-xs lg:text-sm dark:text-zinc-200">Contacte con nosotros</span>
                </Link>
                <button
                    onClick={() => router.reload()}
                    className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border-gray-300 dark:border-zinc-500"
                >
                    <ArrowPathIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                    <span className="text-xs lg:text-sm dark:text-zinc-200">Actualizar</span>
                </button>
            </div>


            <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <Balance />
                    </div>
                    <div className="md:col-span-1">
                        <Stats />
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h2 className="text-lg font-semibold">Detalles del desafío</h2>
                <pre className="bg-black p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(challengeData, null, 2)}
                </pre>

                <MetrixDash />
            </div>
        </Layout>
    );
};

export default Metrix;

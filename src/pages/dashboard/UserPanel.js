import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import CredencialesModal from './credentials';

// Función fetcher para usar con SWR
const fetcher = async (url, token) => {
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Datos obtenidos de la API:", data); // Verifica los datos obtenidos
    return data;
};

export default function Index() {
    const { data: session } = useSession();

    // Usar SWR para la solicitud
    const { data, error, isLoading } = useSWR(
        session?.jwt
            ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me?populate=challenges`, session.jwt]
            : null,
        ([url, token]) => fetcher(url, token)
    );

    if (isLoading) {
        return <p className="text-center">Cargando...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">Error al cargar los datos: {error.message}</p>;
    }

    if (!data?.challenges?.length) {
        return <p className="text-center">No hay desafíos disponibles.</p>;
    }

    return (
        <div>
            {data.challenges.map((challenge, index) => (
                <div
                    key={index}
                    className="p-6 mb-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black"
                >
                    <h2 className="text-xl font-bold text-zinc-800 mb-2 dark:text-zinc-200">
                        {challenge.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{challenge.description}</p>
                    <div className="mt-4 flex space-x-4">
                        <CredencialesModal />
                        <Link href={`/challenges/${challenge.id}`}>
                            <button className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border-gray-300 dark:border-zinc-500">
                                <ChartBarIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                                <span className="text-xs lg:text-sm dark:text-zinc-200">Ver Detalles</span>
                            </button>
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}

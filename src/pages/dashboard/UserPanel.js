import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import CredencialesModal from './credentials';
import Loader from '../../components/loaders/loader';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

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

    const [visibility, setVisibility] = useState({}); // Estado global para visibilidad

    // Cargar estado inicial desde localStorage
    useEffect(() => {
        const storedVisibility = localStorage.getItem("visibility");
        if (storedVisibility) {
            setVisibility(JSON.parse(storedVisibility));
        }
    }, []);

    // Guardar estado en localStorage cada vez que cambia
    useEffect(() => {
        localStorage.setItem("visibility", JSON.stringify(visibility));
    }, [visibility]);

    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        return <p className="text-center text-red-500">Error al cargar los datos: {error.message}</p>;
    }

    if (!data?.challenges?.length) {
        return <p className="text-center">No hay desafíos disponibles.</p>;
    }

    const toggleVisibility = (id) => {
        setVisibility((prev) => ({
            ...prev,
            [id]: !prev[id], // Alternar visibilidad para el desafío con el ID correspondiente
        }));
    };

    return (
        <div>
            {data.challenges.map((challenge, index) => {
                const isVisible = visibility[challenge.id] ?? true; // Obtener el estado de visibilidad actual

                return (
                    <div
                        key={index}
                        className="relative p-6 mb-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black"
                    >
                        <p className="text-sm font-bold text-zinc-800 mb-2 dark:text-zinc-200">
                            Login: {challenge.login}
                        </p>

                        {isVisible && (
                            <>
                                <div className="mt-2 flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-8">

                                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                        Balance:{' '}
                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                            {challenge.balance}
                                        </span>
                                    </p>
                                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                        Fin:{' '}
                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                            {challenge.endDate
                                                ? new Date(data.createdAt).toLocaleDateString()
                                                : "No disponible"}
                                        </span>
                                    </p>
                                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                        Resultado:{' '}
                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                            {challenge.result}
                                        </span>
                                    </p>

                                </div>

                                <div className="mt-4 flex space-x-4">
                                    <CredencialesModal {...challenge} />

                                    <Link href={`/metrix/${challenge.documentId}`}>
                                        <button className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border-gray-300 dark:border-zinc-500">
                                            <ChartBarIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                                            <span className="text-xs lg:text-sm dark:text-zinc-200">Metrix</span>
                                        </button>
                                    </Link>
                                </div>
                            </>
                        )}

                        <div className="absolute bottom-6 right-6 flex items-center">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id={`visible-mode-${index}`}
                                    checked={isVisible}
                                    onCheckedChange={() => toggleVisibility(challenge.id)}
                                />
                                <Label htmlFor={`visible-mode-${index}`}>Visible</Label>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

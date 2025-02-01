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
    console.log(useSession());
    const { data, error, isLoading } = useSWR(
        session?.jwt
            ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me?populate=challenges`, session.jwt]
            : null,
        ([url, token]) => fetcher(url, token)
    );

    const [visibility, setVisibility] = useState(() => {
        // Obtener valores del localStorage en la primera renderización
        if (typeof window !== "undefined") {
            const storedVisibility = localStorage.getItem("visibility");
            return storedVisibility ? JSON.parse(storedVisibility) : {};
        }
        return {};
    });
    
    useEffect(() => {
        // Guardar los cambios en localStorage cada vez que visibility cambie
        if (typeof window !== "undefined") {
            localStorage.setItem("visibility", JSON.stringify(visibility));
        }
    }, [visibility]);
    
    useEffect(() => {
        const storedVisibility = localStorage.getItem("visibility");
        if (storedVisibility) {
            setVisibility(JSON.parse(storedVisibility));
        }
    }, []);


    if (isLoading) return <Loader />;
    if (error) return <p className="text-center text-red-500">Error al cargar los datos: {error.message}</p>;
    if (!data?.challenges?.length) return <p className="text-center">No hay desafíos disponibles.</p>;

    // console.log(data.challenges);

    const toggleVisibility = (id) => {
        setVisibility((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Definir los phase en orden fijo
    const phase = [
        { key: "3", label: "Fase Neotrader" },
        { key: "2", label: "Fase Practicante" },
        { key: "1", label: "Fase Estudiante" },
    ];

    return (
        <div>
            {phase.map(({ key, label }) => {
                // Filtrar los desafíos que coincidan con el phase actual
                const challenges = data.challenges.filter(challenge => challenge.phase == key);

                if (challenges.length === 0) return null; // Si no hay desafíos en este phase, no renderizar nada

                return (
                    <div key={key}>
                        {/* Título del phase */}
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">{label}</h2>

                        {/* Renderizar los desafíos de este phase */}
                        {challenges.map((challenge, index) => {
                            const isVisible = visibility[challenge.id] ?? true;

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
                                                            ? new Date(challenge.endDate).toLocaleDateString()
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
            })}
        </div>
    );
}
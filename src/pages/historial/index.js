/* src/pages/historial/index.js */
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout/dashboard';
import Loader from '../../components/loaders/loader';
import { useStrapiData } from '../../services/strapiServiceJWT';
import { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon, ChartBarIcon} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Historial() {
    const { data: session } = useSession();
    const token = session?.jwt;

    // Obtener datos del usuario con challenges poblados usando useStrapiData
    const { data, error, isLoading } = useStrapiData('users/me?populate[challenges][populate]=broker_account', token);

    const [searchParentId, setSearchParentId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filteredGroups, setFilteredGroups] = useState({});
    const [expandedGroups, setExpandedGroups] = useState({});

    // Definir colores para los estados
    const statusColors = {
        approved: 'text-green-500',
        disapproved: 'text-red-500',
        progress: 'text-yellow-500',
        init: 'text-blue-500',
        withdrawal: 'text-purple-500',
        retry: 'text-orange-500',
    };

    // Filtrar y agrupar challenges
    useEffect(() => {
        if (data?.challenges) {
            // Agrupar challenges por parentId
            const grouped = data.challenges.reduce((acc, challenge) => {
                const key = challenge.parentId || challenge.documentId;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(challenge);
                acc[key].sort((a, b) => a.phase - b.phase); // Ordenar por fase
                return acc;
            }, {});

            // Filtrar por parentId y rango de fechas
            const filtered = Object.entries(grouped).filter(([parentId, challenges]) => {
                const groupStart = new Date(Math.min(...challenges.map(c => new Date(c.startDate))));
                const groupEnd = new Date(Math.max(...challenges.map(c => new Date(c.endDate || new Date()))));

                const matchesParentId = parentId.toLowerCase().includes(searchParentId.toLowerCase());
                const matchesStart = !startDate || groupStart >= new Date(startDate);
                const matchesEnd = !endDate || groupEnd <= new Date(endDate);

                return matchesParentId && matchesStart && matchesEnd;
            });

            setFilteredGroups(Object.fromEntries(filtered));
        }
    }, [data, searchParentId, startDate, endDate]);

    // Mostrar loader mientras se cargan los datos
    if (isLoading) {
        return (
            <Layout>
                <Loader />
            </Layout>
        );
    }

    // Mostrar error si ocurre
    if (error) {
        return (
            <Layout>
                <div className="p-6 text-red-600 dark:text-red-400">
                    Error al cargar los datos: {error.message}
                </div>
            </Layout>
        );
    }

    // Determinar el estado del grupo de challenges
    const getGroupStatus = (challenges) => {
        const lastChallenge = challenges[challenges.length - 1];
        if (lastChallenge.result === "disapproved") return "red";
        if (lastChallenge.result === "progress" || lastChallenge.result === "init") return "yellow";
        if (lastChallenge.result === "withdrawal" || (lastChallenge.result === "approved" && lastChallenge.phase === 3)) return "green";
        return "gray"; // Estado por defecto
    };

    // Alternar visibilidad de los detalles del grupo
    const toggleGroup = (parentId) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [parentId]: !prev[parentId],
        }));
    };

    return (
        <Layout>
            <div className="p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                <h1 className="text-2xl font-bold mb-4">Historial de Challenges</h1>

                {/* Filtros */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Buscar por parentId"
                        value={searchParentId}
                        onChange={(e) => setSearchParentId(e.target.value)}
                        className="p-2 border rounded dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
                    />
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-2 border rounded dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-2 border rounded dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
                    />
                </div>

                {/* Grupos de Challenges */}
                {Object.entries(filteredGroups).length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">No hay challenges que coincidan con los filtros.</p>
                ) : (
                    Object.entries(filteredGroups).map(([parentId, challenges]) => {
                        const status = getGroupStatus(challenges);
                        const lastChallenge = challenges[challenges.length - 1];
                        const isExpanded = expandedGroups[parentId];

                        return (
                            <div
                                key={parentId}
                                className={`mb-4 p-4 rounded-lg ${{
                                    red: 'bg-red-100 dark:bg-red-900',
                                    yellow: 'bg-yellow-100 dark:bg-yellow-900',
                                    green: 'bg-green-100 dark:bg-green-900',
                                    gray: 'bg-gray-100 dark:bg-gray-700'
                                }[status]}`}
                            >
                                <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleGroup(parentId)}>
                                    <h2 className="text-lg font-semibold">
                                        Grupo: {parentId} - Última Fase: {lastChallenge.phase} ({lastChallenge.result})
                                    </h2>
                                    {isExpanded ? (
                                        <ChevronUpIcon className="h-6 w-6" />
                                    ) : (
                                        <ChevronDownIcon className="h-6 w-6" />
                                    )}
                                </div>

                                {/* Detalles del grupo */}
                                <div className="mt-2">
                                    <p>Fecha Inicio: {new Date(Math.min(...challenges.map(c => new Date(c.startDate)))).toLocaleDateString()}</p>
                                    <p>Fecha Fin: {new Date(Math.max(...challenges.map(c => new Date(c.endDate || new Date())))).toLocaleDateString()}</p>
                                </div>

                                {/* Desplegable con fases anteriores */}
                                {isExpanded && (
                                    <div className="mt-4">
                                        {challenges.map((challenge, index) => (
                                            <div key={index} className="p-2 bg-white dark:bg-zinc-800 rounded mb-2">
                                                <p>
                                                    Fase {challenge.phase} - Resultado: <span className={statusColors[challenge.result] || 'text-gray-500'}>{challenge.result}</span>
                                                </p>
                                                <p>Inicio: {new Date(challenge.startDate).toLocaleDateString()} - Fin: {challenge.endDate ? new Date(challenge.endDate).toLocaleDateString() : "En curso"}</p>
                                                <Link href={challenge.result === 'progress' ? `/metrix2/${challenge.documentId}` : `/historial/${challenge.documentId}`}>
                                                    <button className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border-gray-300 dark:border-zinc-500">
                                                        <ChartBarIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                                                        <span className="text-xs lg:text-sm dark:text-zinc-200">Metrix</span>
                                                    </button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </Layout>
    );
}
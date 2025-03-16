/* src/pages/historial/index.js */
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout/dashboard';
import Loader from '../../components/loaders/loader';
import { useStrapiData } from '../../services/strapiServiceJWT';
import { useState, useEffect } from "react";
import {
    ChevronDownIcon,
    ChevronUpIcon,
    ChartBarIcon,
    CalendarIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
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
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Definir colores para los estados
    const statusColors = {
        approved: 'text-green-600 dark:text-green-300',
        disapproved: 'text-red-600 dark:text-red-300',
        progress: 'text-yellow-600 dark:text-yellow-300',
        init: 'text-blue-600 dark:text-blue-300',
        withdrawal: 'text-purple-600 dark:text-purple-300',
        retry: 'text-orange-600 dark:text-orange-300',
    };

    const statusBgColors = {
        approved: 'bg-green-100 dark:bg-green-900/40',
        disapproved: 'bg-red-100 dark:bg-red-900/40',
        progress: 'bg-yellow-100 dark:bg-yellow-900/40',
        init: 'bg-blue-100 dark:bg-blue-900/40',
        withdrawal: 'bg-purple-100 dark:bg-purple-900/40',
        retry: 'bg-orange-100 dark:bg-orange-900/40',
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
        if (lastChallenge.result === "disapproved") return "disapproved";
        if (lastChallenge.result === "progress") return "progress";
        if (lastChallenge.result === "init") return "init";
        if (lastChallenge.result === "withdrawal") return "withdrawal";
        if (lastChallenge.result === "approved" && lastChallenge.phase === 3) return "approved";
        if (lastChallenge.result === "retry") return "retry";
        return "init"; // Estado por defecto
    };

    // Alternar visibilidad de los detalles del grupo
    const toggleGroup = (parentId) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [parentId]: !prev[parentId],
        }));
    };

    // Formatear fecha en formato legible
    const formatDate = (dateString) => {
        if (!dateString) return "En curso";
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Layout>
            <div className="p-6 dark:bg-zinc-800 bg-white rounded-lg dark:text-white">
                <div className="flex flex-wrap justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold mb-2 sm:mb-0">Historial de Challenges</h1>
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-yellow-500 text-black hover:bg-yellow-600 transition-colors shadow-md"
                    >
                        <FunnelIcon className="h-5 w-5" />
                        <span className="font-semibold">Filtros</span>
                    </button>
                </div>

                {/* Filtros (colapsables) */}
                {isFilterOpen && (
                    <div className="mb-6 p-4 bg-gray-100 dark:bg-zinc-700 rounded-lg shadow-md border border-gray-200 dark:border-zinc-600">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar por ID"
                                    value={searchParentId}
                                    onChange={(e) => setSearchParentId(e.target.value)}
                                    className="pl-10 p-2 w-full border rounded-lg dark:bg-zinc-800 dark:text-white dark:border-zinc-600 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="pl-10 p-2 w-full border rounded-lg dark:bg-zinc-800 dark:text-white dark:border-zinc-600 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    placeholder="Fecha inicio"
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="pl-10 p-2 w-full border rounded-lg dark:bg-zinc-800 dark:text-white dark:border-zinc-600 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    placeholder="Fecha fin"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Grupos de Challenges */}
                <div className="space-y-4">
                    {Object.entries(filteredGroups).length === 0 ? (
                        <div className="text-center p-8 bg-gray-50 dark:bg-zinc-700 rounded-lg border border-gray-200 dark:border-zinc-600 shadow-md">
                            <p className="text-gray-500 dark:text-gray-400">No hay challenges que coincidan con los filtros.</p>
                        </div>
                    ) : (
                        Object.entries(filteredGroups).map(([parentId, challenges]) => {
                            const status = getGroupStatus(challenges);
                            const lastChallenge = challenges[challenges.length - 1];
                            const isExpanded = expandedGroups[parentId];
                            const startDateFormatted = formatDate(Math.min(...challenges.map(c => new Date(c.startDate))));
                            const endDateFormatted = formatDate(lastChallenge.endDate);

                            return (
                                <div
                                    key={parentId}
                                    className="border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 rounded-lg shadow-md overflow-hidden"
                                >
                                    {/* Cabecera del Challenge (siempre visible) */}
                                    <div className="flex flex-col p-4 lg:p-6">
                                        {/* Identificador del challenge y botón de expansión en una fila */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="bg-yellow-500 text-black font-bold text-lg px-3 py-2 rounded-lg shadow-md text-center">
                                                <span className="block" title={parentId}>#{parentId}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => toggleGroup(parentId)}
                                                    className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
                                                    aria-label={isExpanded ? "Collapse" : "Expand"}
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUpIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                                                    ) : (
                                                        <ChevronDownIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                                                    )}
                                                </button>

                                                {/* Botón de metrix */}
                                                <Link href={lastChallenge.result === 'progress' ? `/metrix2/${lastChallenge.documentId}` : `/historial/${lastChallenge.documentId}`}>
                                                    <button className="hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white px-5 py-2 rounded-lg text-base font-semibold shadow-md flex items-center justify-center space-x-2">
                                                        <ChartBarIcon className="h-5 w-5" />
                                                        <span>Metrix</span>
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Información principal */}
                                        <div className="pl-1">
                                            {/* Estado y fase actual */}
                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                <div className="inline-flex items-center gap-2">
                                                    <span className={`inline-block w-3 h-3 rounded-full ${status === 'approved' ? 'bg-green-600' :
                                                            status === 'progress' ? 'bg-yellow-500' :
                                                                status === 'disapproved' ? 'bg-red-600' :
                                                                    status === 'init' ? 'bg-blue-500' :
                                                                        status === 'withdrawal' ? 'bg-purple-500' :
                                                                            'bg-orange-500'
                                                        }`} />
                                                    <span className={`font-semibold ${statusColors[status] || 'text-gray-600 dark:text-gray-300'}`}>
                                                        {status === 'approved' ? 'Aprobado' :
                                                            status === 'progress' ? 'En progreso' :
                                                                status === 'disapproved' ? 'Rechazado' :
                                                                    status === 'init' ? 'Iniciado' :
                                                                        status === 'withdrawal' ? 'Retirado' :
                                                                            status === 'retry' ? 'Reintento' : 'Desconocido'}
                                                    </span>
                                                </div>
                                                <span className="text-gray-500 dark:text-gray-400 hidden md:inline">|</span>
                                                <span className="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-600 px-3 py-1 rounded-md">
                                                    Fase {lastChallenge.phase}
                                                </span>
                                            </div>

                                            {/* Período */}
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                <span className="font-medium mr-2">Período:</span>
                                                <span className="bg-gray-100 dark:bg-zinc-600 px-3 py-1 rounded-md text-gray-700 dark:text-gray-300">{startDateFormatted} - {endDateFormatted}</span>
                                            </div>

                                            {/* Última actualización */}
                                            <div className="text-sm flex items-center gap-2">
                                                <span className="text-black dark:text-white font-semibold">Última actualización:</span>
                                                <span className="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-600 px-3 py-1 rounded-md">
                                                    {formatDate(lastChallenge.endDate ? lastChallenge.endDate : lastChallenge.startDate)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detalles del Challenge (expandible) */}
                                    {isExpanded && (
                                        <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-600">
                                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-3">Historial de fases</h3>
                                            <div className="space-y-3">
                                                {challenges.map((challenge, index) => (
                                                    <div
                                                        key={index}
                                                        className={`p-4 rounded-lg shadow-sm border ${statusBgColors[challenge.result] || 'bg-gray-50 dark:bg-zinc-700'} border-gray-200 dark:border-zinc-600`}
                                                    >
                                                        <div className="flex flex-col sm:flex-row justify-between">
                                                            {/* Info de la fase */}
                                                            <div className="mb-3 sm:mb-0">
                                                                <div className="flex items-center mb-1">
                                                                    <span className="font-semibold text-gray-800 dark:text-white text-lg">
                                                                        Fase {challenge.phase}
                                                                    </span>
                                                                    <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${statusColors[challenge.result]} ${statusBgColors[challenge.result]}`}>
                                                                        {challenge.result === 'approved' ? 'Aprobado' :
                                                                            challenge.result === 'progress' ? 'En progreso' :
                                                                                challenge.result === 'disapproved' ? 'Rechazado' :
                                                                                    challenge.result === 'init' ? 'Iniciado' :
                                                                                        challenge.result === 'withdrawal' ? 'Retirado' :
                                                                                            challenge.result === 'retry' ? 'Reintento' : challenge.result}
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center mt-2">
                                                                    <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                                                                    <span>
                                                                        {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Botón de detalles */}
                                                            <Link
                                                                href={challenge.result === 'progress' ? `/metrix2/${challenge.documentId}` : `/historial/${challenge.documentId}`}
                                                            >
                                                                <button className="w-full sm:w-auto hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md flex items-center justify-center space-x-2">
                                                                    <ChartBarIcon className="h-4 w-4" />
                                                                    <span>Ver detalles</span>
                                                                </button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </Layout>
    );
}
// src/pages/historial/index.js
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
    FunnelIcon,
    ClockIcon,
    DocumentIcon,
    XCircleIcon,
    InformationCircleIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Historial() {
    const { data: session } = useSession();
    const token = session?.jwt;

    // Obtener datos del usuario con challenges poblados usando useStrapiData
    const { data, error, isLoading } = useStrapiData(
        token ? 'users/me?populate[challenges][populate][0]=broker_account&populate[challenges][populate][1]=certificates' : null,
        token
    );

    const [searchParentId, setSearchParentId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filteredGroups, setFilteredGroups] = useState({});
    const [expandedGroups, setExpandedGroups] = useState({});
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Definir colores para los estados
    const statusColors = {
        approved: 'text-green-600 dark:text-green-400',
        disapproved: 'text-red-600 dark:text-red-400',
        progress: 'text-yellow-600 dark:text-yellow-400',
        init: 'text-blue-600 dark:text-blue-400',
        withdrawal: 'text-purple-600 dark:text-purple-400',
        retry: 'text-orange-600 dark:text-orange-400',
    };

    // Definir colores para los gradientes con mejores gradientes para ambos modos
    const statusGradients = {
        approved: 'from-green-200 via-green-100/80 to-white dark:from-green-900/40 dark:via-green-800/20 dark:to-zinc-900',
        disapproved: 'from-red-200 via-red-100/80 to-white dark:from-red-900/40 dark:via-red-800/20 dark:to-zinc-900',
        progress: 'from-amber-200 via-amber-100/80 to-white dark:from-amber-900/40 dark:via-amber-800/20 dark:to-zinc-900',
        init: 'from-blue-200 via-blue-100/80 to-white dark:from-blue-900/40 dark:via-blue-800/20 dark:to-zinc-900',
        withdrawal: 'from-purple-200 via-purple-100/80 to-white dark:from-purple-900/40 dark:via-purple-800/20 dark:to-zinc-900',
        retry: 'from-orange-200 via-orange-100/80 to-white dark:from-orange-900/40 dark:via-orange-800/20 dark:to-zinc-900',
    };

    // Quitar los bordes de color basados en el estado
    const statusBorderColors = {
        approved: '',
        disapproved: '',
        progress: '',
        init: '',
        withdrawal: '',
        retry: '',
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
                <div className="p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
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

    // Verificar si un challenge tiene certificados
    const hasCertificates = (challenge) => {
        return challenge?.certificates && challenge.certificates.length > 0;
    };

    // Obtener los certificados del challenge
    const getCertificates = (challenge) => {
        return challenge?.certificates || [];
    };

    // Determinar si debe mostrarse el botón de certificado
    const shouldShowCertificateButton = (challenge) => {
        return challenge.result === 'approved' || challenge.result === 'withdrawal';
    };

    // Renderizar botones de certificados
    const renderCertificateButtons = (challenge) => {
        if (!shouldShowCertificateButton(challenge)) {
            return null;
        }

        const certificates = getCertificates(challenge);

        // Si no hay certificados, mostrar botón de "Sin certificado"
        if (certificates.length === 0) {
            return (
                <div className="flex h-8 bg-gray-200 border border-gray-300 justify-center rounded-lg shadow-sm dark:bg-zinc-700/50 dark:border-zinc-600/50 items-center px-3 space-x-1 text-xs text-gray-500 dark:text-gray-400 transition-all duration-200 cursor-not-allowed">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    <span>Sin certificado</span>
                </div>
            );
        }

        // Organizar certificados por tipo
        const phaseCertificates = certificates.filter(cert => cert.tipoChallenge.startsWith('fase'));
        const withdrawalCertificates = certificates.filter(cert => cert.tipoChallenge === 'retirado');

        return (
            <div className="flex space-x-2">
                {/* Certificados de fase */}
                {phaseCertificates.map((cert, index) => (
                    <Link key={`phase-${index}`} href={`/certificates/verify/${cert.documentId}`}>
                        <button className="flex h-8 bg-white border border-gray-300 justify-center rounded-lg shadow-sm dark:bg-zinc-700/90 dark:border-zinc-500/50 dark:hover:bg-zinc-600/80 hover:bg-gray-50 items-center px-3 py-1.5 space-x-1 text-xs transition-all duration-200">
                            <DocumentIcon className="h-4 w-4 mr-1" />
                            <span>Certificado Fase {cert.tipoChallenge.replace('fase', '')}</span>
                        </button>
                    </Link>
                ))}

                {/* Certificados de retiro */}
                {withdrawalCertificates.map((cert, index) => (
                    <Link key={`withdrawal-${index}`} href={`/certificates/verify/${cert.documentId}`}>
                        <button className="flex h-8 bg-white border border-gray-300 justify-center rounded-lg shadow-sm dark:bg-zinc-700/90 dark:border-zinc-500/50 dark:hover:bg-zinc-600/80 hover:bg-gray-50 items-center px-3 py-1.5 space-x-1 text-xs transition-all duration-200">
                            <DocumentIcon className="h-4 w-4 mr-1" />
                            <span>Certificado de Retiro</span>
                        </button>
                    </Link>
                ))}
            </div>
        );
    };

    return (
        <Layout>
            {/* Cabecera del historial */}
            <div className="relative overflow-hidden bg-gradient-to-r from-white to-gray-50 dark:from-zinc-800 dark:to-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700 transition-all">
                <div className="absolute h-1 top-0 left-0 right-0 bg-[var(--app-primary)]"></div>

                <div className="p-6 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-[var(--app-primary)]/10">
                            <ClockIcon className="w-5 h-5 text-[var(--app-primary)]" />
                        </div>
                        <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">
                            Historial de Challenges
                        </h1>
                    </div>

                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="bg-[var(--app-primary)] text-black hover:bg-[var(--app-secondary)] px-4 py-2 rounded-lg shadow-sm flex items-center space-x-2 transition-all"
                    >
                        <FunnelIcon className="h-5 w-5" />
                        <span className="font-medium">Filtros</span>
                    </button>
                </div>
            </div>

            {/* Sección de filtros mejorada */}
            <div className="mt-6">
                {isFilterOpen && (
                    <div className="bg-white dark:bg-zinc-800/90 shadow-md rounded-xl border border-gray-100 dark:border-zinc-700 overflow-hidden transition-all">
                        <div className="border-b border-gray-100 dark:border-zinc-700/50 p-6">
                            <div className="flex items-center">
                                <div className="p-2 rounded-full bg-[var(--app-primary)]/10 mr-3">
                                    <FunnelIcon className="w-5 h-5 text-[var(--app-primary)]" />
                                </div>
                                <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">
                                    Opciones de filtrado
                                </h2>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="space-y-2">
                                    <label htmlFor="searchId" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Buscar por ID
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="searchId"
                                            type="text"
                                            placeholder="Ingrese ID del challenge"
                                            value={searchParentId}
                                            onChange={(e) => setSearchParentId(e.target.value)}
                                            className="pl-10 w-full h-10 bg-gray-50 dark:bg-zinc-700/50 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-[var(--app-primary)]/30 focus:border-[var(--app-primary)] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="startDate" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Fecha inicio
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="startDate"
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="pl-10 w-full h-10 bg-gray-50 dark:bg-zinc-700/50 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-[var(--app-primary)]/30 focus:border-[var(--app-primary)] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="endDate" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Fecha fin
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="endDate"
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="pl-10 w-full h-10 bg-gray-50 dark:bg-zinc-700/50 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-[var(--app-primary)]/30 focus:border-[var(--app-primary)] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Contenedor principal de challenges con el nuevo estilo */}
            <div className="mt-6">
                {Object.entries(filteredGroups).length === 0 ? (
                    <div className="bg-white dark:bg-zinc-800/90 shadow-md rounded-xl border border-gray-100 dark:border-zinc-700 p-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                            <div className="p-4 rounded-full bg-gray-100 dark:bg-zinc-700/50">
                                <InformationCircleIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No hay resultados</h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                No hay challenges que coincidan con los criterios de búsqueda.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(filteredGroups).map(([parentId, challenges]) => {
                            const status = getGroupStatus(challenges);
                            const lastChallenge = challenges[challenges.length - 1];
                            const isExpanded = expandedGroups[parentId];
                            const startDateFormatted = formatDate(Math.min(...challenges.map(c => new Date(c.startDate))));
                            const endDateFormatted = formatDate(lastChallenge.endDate);

                            return (
                                <div
                                    key={parentId}
                                    className={`bg-gradient-to-b ${statusGradients[status]} rounded-lg shadow-md border overflow-hidden relative transition-all duration-200`}
                                >
                                    {/* Barra de estado */}
                                    {/* <div className={`h-1 ${status === 'approved' ? 'bg-green-500 dark:bg-green-400' :
                                        status === 'progress' ? 'bg-yellow-500 dark:bg-yellow-400' :
                                            status === 'disapproved' ? 'bg-red-500 dark:bg-red-400' :
                                                status === 'init' ? 'bg-blue-500 dark:bg-blue-400' :
                                                    status === 'withdrawal' ? 'bg-purple-500 dark:bg-purple-400' :
                                                        'bg-orange-500 dark:bg-orange-400'
                                        }`}></div> */}

                                    {/* Cabecera del Challenge */}
                                    <div className="p-6 border-b border-gray-100 dark:border-zinc-700/50">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-[var(--app-primary)] text-black rounded-lg px-3 py-1.5 shadow-sm">
                                                    <span className="text-base font-bold" title={parentId}>CH-{challenges[0].id}</span>
                                                </div>

                                                <div className="flex items-center">
                                                    <div className={`w-2.5 h-2.5 rounded-full mr-2 ${status === 'approved' ? 'bg-green-500 dark:bg-green-400' :
                                                        status === 'progress' ? 'bg-yellow-500 dark:bg-yellow-400' :
                                                            status === 'disapproved' ? 'bg-red-500 dark:bg-red-400' :
                                                                status === 'init' ? 'bg-blue-500 dark:bg-blue-400' :
                                                                    status === 'withdrawal' ? 'bg-purple-500 dark:bg-purple-400' :
                                                                        'bg-orange-500 dark:bg-orange-400'
                                                        }`}></div>
                                                    <span className={`font-medium ${statusColors[status]}`}>
                                                        {status === 'approved' ? 'Aprobado' :
                                                            status === 'progress' ? 'En progreso' :
                                                                status === 'disapproved' ? 'Desaprobado' :
                                                                    status === 'init' ? 'Por Iniciar' :
                                                                        status === 'withdrawal' ? 'Retirado' :
                                                                            status === 'retry' ? 'Rechazado' : 'Desconocido'}
                                                    </span>
                                                </div>

                                                <div className="hidden md:flex items-center">
                                                    <span className="text-gray-300 dark:text-gray-600 mx-2">|</span>
                                                    <span className="bg-gray-100 dark:bg-zinc-700/60 text-gray-700 dark:text-gray-300 px-2.5 py-1 text-xs rounded-md font-medium">
                                                        Fase {lastChallenge.phase}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <Link href={`/metrix/${lastChallenge.documentId}`}>
                                                    <button className="bg-white hover:bg-gray-50 dark:bg-zinc-700 dark:hover:bg-zinc-600 border border-gray-200 dark:border-zinc-600 rounded-lg px-3 py-1.5 text-sm font-medium flex items-center space-x-1 shadow-sm transition-all">
                                                        <ChartBarIcon className="h-4 w-4 mr-1" />
                                                        <span>Metrix</span>
                                                    </button>
                                                </Link>

                                                <button
                                                    onClick={() => toggleGroup(parentId)}
                                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all"
                                                    aria-label={isExpanded ? "Contraer" : "Expandir"}
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUpIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                                    ) : (
                                                        <ChevronDownIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-4">
                                            <div className="flex items-center">
                                                <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                                    <span className="font-medium">Período:</span>
                                                    <span className="ml-1">{startDateFormatted} - {endDateFormatted}</span>
                                                </span>
                                            </div>

                                            <div className="flex items-center">
                                                <ClockIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                                    <span className="font-medium">Última actualización:</span>
                                                    <span className="ml-1">{formatDate(lastChallenge.endDate ? lastChallenge.endDate : lastChallenge.startDate)}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detalles del Challenge */}
                                    {isExpanded && (
                                        <div className="p-6 bg-gray-50 dark:bg-zinc-900/40">
                                            <div className="mb-4 flex items-center">
                                                <div className="p-1.5 rounded-full bg-[var(--app-primary)]/10 mr-2">
                                                    <DocumentTextIcon className="w-4 h-4 text-[var(--app-primary)]" />
                                                </div>
                                                <h3 className="text-base font-semibold text-zinc-800 dark:text-white">
                                                    Historial de fases
                                                </h3>
                                            </div>

                                            <div className="space-y-4">
                                                {challenges.map((challenge, index) => (
                                                    <div
                                                        key={index}
                                                        className={`p-3 rounded-lg shadow-sm border bg-gradient-to-b ${statusGradients[challenge.result]} relative overflow-hidden transition-all duration-200`}
                                                    >
                                                        {/* <div className={`h-1 ${challenge.result === 'approved' ? 'bg-green-500 dark:bg-green-400' :
                                                            challenge.result === 'progress' ? 'bg-yellow-500 dark:bg-yellow-400' :
                                                                challenge.result === 'disapproved' ? 'bg-red-500 dark:bg-red-400' :
                                                                    challenge.result === 'init' ? 'bg-blue-500 dark:bg-blue-400' :
                                                                        challenge.result === 'withdrawal' ? 'bg-purple-500 dark:bg-purple-400' :
                                                                            'bg-orange-500 dark:bg-orange-400'
                                                            }`}></div> */}

                                                        <div className="p-4">
                                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                                <div>
                                                                    <div className="flex items-center mb-2">
                                                                        <span className="text-base font-semibold text-zinc-800 dark:text-white mr-3">
                                                                            Fase {challenge.phase}
                                                                        </span>
                                                                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${challenge.result === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                                            challenge.result === 'progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                                challenge.result === 'disapproved' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                                                    challenge.result === 'init' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                                        challenge.result === 'withdrawal' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                                                                            'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                                                            }`}>
                                                                            {challenge.result === 'approved' ? 'Aprobado' :
                                                                                challenge.result === 'progress' ? 'En progreso' :
                                                                                    challenge.result === 'disapproved' ? 'Desaprobado' :
                                                                                        challenge.result === 'init' ? 'Por Iniciar' :
                                                                                            challenge.result === 'withdrawal' ? 'Retirado' :
                                                                                                challenge.result === 'retry' ? 'Rechazado' : challenge.result}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                                        <CalendarIcon className="h-4 w-4 mr-2" />
                                                                        <span>{formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-wrap gap-2">
                                                                    {/* Botones de certificado */}
                                                                    {renderCertificateButtons(challenge)}

                                                                    {/* Botón de detalles */}
                                                                    <Link href={`/metrix/${challenge.documentId}`}>
                                                                        <button className="bg-white hover:bg-gray-50 dark:bg-zinc-700 dark:hover:bg-zinc-600 border border-gray-200 dark:border-zinc-600 rounded-lg px-3 py-1.5 text-xs font-medium flex items-center shadow-sm transition-all">
                                                                            <ChartBarIcon className="h-4 w-4 mr-1" />
                                                                            <span>Ver detalles</span>
                                                                        </button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
}
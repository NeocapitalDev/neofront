import React from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout/dashboard';
import Loader from '../../components/loaders/loader';
import { useStrapiData } from '../../services/strapiServiceJWT';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { DocumentTextIcon, BanknotesIcon } from '@heroicons/react/24/outline';

const WithdrawalsPage = () => {
    const { data: session } = useSession();
    const token = session?.jwt;

    // Usamos el hook para obtener los datos del usuario con sus challenges y retiros
    const { data, error, isLoading } = useStrapiData('users/me?populate[challenges][populate][withdraw]=*', token);
    console.log(data);
    if (isLoading) {
        return (
            <Layout>
                <Loader />
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="p-6 text-red-600 dark:text-red-400">
                    Error al cargar los datos: {error.message}
                </div>
            </Layout>
        );
    }

    // Extraer los retiros (withdrawals) de los challenges del usuario
    const withdrawals = [];

    if (data?.challenges) {
        data.challenges.forEach(challenge => {
            if (challenge.withdraw) {
                withdrawals.push({
                    ...challenge.withdraw,
                    challengeId: challenge.challengeId,
                    phase: challenge.phase,
                    challenge: challenge.documentId
                });
            }
        });
    }
    console.log(withdrawals);
    // Función para formatear la fecha
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Función para mostrar el estado del retiro con un color adecuado
    const getStatusBadge = (status) => {
        let bgColor = "bg-yellow-100 text-yellow-800";

        if (status === "pagado" || status === "completado") {
            bgColor = "bg-green-100 text-green-800";
        } else if (status === "rechazado") {
            bgColor = "bg-red-100 text-red-800";
        }

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor}`}>
                {status || "proceso"}
            </span>
        );
    };

    // Obtener el nombre de la fase
    const getPhaseLabel = (phase) => {
        switch (phase) {
            case 1: return "Fase 1";
            case 2: return "Fase 2";
            case 3: return "Fase 3 - ";
            default: return `Fase ${phase}`;
        }
    };

    return (
        <Layout>
            <div className="p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <BanknotesIcon className="w-6 h-6 text-gray-600 dark:text-gray-200" />
                        <h1 className="text-xl font-semibold">Mis Retiros</h1>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 overflow-x-auto dark:bg-black bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Challenge</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Wallet</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead className="text-right">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {withdrawals.length > 0 ? (
                            withdrawals.map((withdrawal, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">
                                        {getPhaseLabel(withdrawal.phase)} # {withdrawal?.challenge}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(withdrawal.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <span className="truncate max-w-[150px] inline-block">
                                            {withdrawal.wallet}
                                        </span>
                                    </TableCell>
                                    <TableCell>${withdrawal.amount}</TableCell>
                                    <TableCell className="text-right">
                                        {getStatusBadge(withdrawal.estado)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6">
                                    No hay retiros para mostrar.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </Layout>
    );
};

export default WithdrawalsPage;
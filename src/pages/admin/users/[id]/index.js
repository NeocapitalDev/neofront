"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import DashboardLayout from "../..";

const fetcher = async (url, token) => {
    // console.log("Fetching data from:", url); // Depuración

    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        console.error("Error en la API:", res.status, res.statusText);
        throw new Error("Error al obtener datos");
    }

    const json = await res.json();
    // console.log("Datos recibidos de la API:", json); // Ver datos en consola
    return json;
};

export default function UserProfile() {
    const { data: session } = useSession();
    const router = useRouter();
    const { id } = router.query;

    // Se mantiene la ruta original
    const { data, error, isLoading } = useSWR(
        session?.jwt && id
            ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users?filters[documentId][$eq]=${id}&populate[challenges][populate]=broker_account`, session.jwt]
            : null,
        ([url, token]) => fetcher(url, token)
    );
    // console.log("ID de Usuario:", id); // Depuración

    // console.log("Datos en UserProfile:", data); // Depuración

    const [resultFilter, setResultFilter] = useState("");
    const [phaseFilter, setPhaseFilter] = useState("");

    const filteredChallenges = useMemo(() => {
        if (!data || data.length === 0) return [];

        const user = data[0];

        return user.challenges?.filter((challenge) => {
            const matchesResult = resultFilter ? challenge.result === resultFilter : true;
            const matchesPhase = phaseFilter ? String(challenge.phase) === phaseFilter : true;
            return matchesResult && matchesPhase;
        }) || [];
    }, [data, resultFilter, phaseFilter]);

    if (isLoading) {
        return (
            <DashboardLayout>
                <p className="text-center text-zinc-500">Cargando datos...</p>
            </DashboardLayout>
        );
    }

    if (error || !data || data.length === 0) {
        return (
            <DashboardLayout>
                <p className="text-center text-red-500">
                    Error al cargar los datos o usuario no encontrado.
                </p>
            </DashboardLayout>
        );
    }

    const user = data[0];

    const translateResult = (result) => {
        switch (result) {
            case "init":
                return "Iniciado";
            case "approved":
                return "Aprobado";
            case "disapproved":
                return "Desaprobado";
            case "progress":
                return "En Curso";
            default:
                return "N/A";
        }
    };

    return (
        <DashboardLayout>
            <div className="p-8 bg-zinc-900 text-zinc-200 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold mb-4">Perfil de Usuario</h1>
                <p>
                    <strong>Nombre:</strong> {user.firstName} {user.lastName}
                </p>
                <p>
                    <strong>Email:</strong> {user.email}
                </p>
                <p>
                    <strong>Verificado:</strong> {user.isVerified ? "Sí" : "No"}
                </p>

                {/* Filtros */}
                <h2 className="text-xl font-bold mt-8 mb-4">Challenges</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 py-2">
                    <select
                        value={resultFilter}
                        onChange={(e) => setResultFilter(e.target.value)}
                        className="h-9 px-3 text-sm bg-zinc-800 text-zinc-200 border-zinc-700 rounded-md"
                    >
                        <option value="">Resultado</option>
                        <option value="approved">Aprobado</option>
                        <option value="disapproved">Desaprobado</option>
                        <option value="progress">En Curso</option>
                    </select>
                    <select
                        value={phaseFilter}
                        onChange={(e) => setPhaseFilter(e.target.value)}
                        className="h-9 px-3 text-sm bg-zinc-800 text-zinc-200 border-zinc-700 rounded-md"
                    >
                        <option value="">Etapa</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                </div>

                {/* Tabla */}
                <div className="border border-zinc-700 rounded-md overflow-hidden mt-4">
                    <Table>
                        <TableHeader className="bg-zinc-800">
                            <TableRow>
                                <TableHead className="text-zinc-200">ID</TableHead>
                                <TableHead className="text-zinc-200">Login</TableHead>
                                <TableHead className="text-zinc-200">Server</TableHead>
                                <TableHead className="text-zinc-200">Platform</TableHead>
                                <TableHead className="text-zinc-200">Resultado</TableHead>
                                <TableHead className="text-zinc-200">Etapa</TableHead>
                                <TableHead className="text-zinc-200">Balance Inicial</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredChallenges.map((challenge) => {
                                // console.log("Challenge ID:", challenge.id);
                                // console.log("Broker Account:", challenge.broker_account);

                                // Verificamos si `broker_account` existe antes de acceder a sus atributos
                                const broker = challenge.broker_account
                                    ? {
                                        login: challenge.broker_account.login || "N/A",
                                        server: challenge.broker_account.server || "N/A",
                                        platform: challenge.broker_account.platform || "N/A",
                                        balance: challenge.broker_account.balance || "N/A",
                                    }
                                    : { login: "N/A", server: "N/A", platform: "N/A", balance: "N/A" };

                                return (
                                    <TableRow key={challenge.id}>
                                        <TableCell>{challenge.id}</TableCell>
                                        <TableCell>{broker.login}</TableCell>
                                        <TableCell>{broker.server}</TableCell>
                                        <TableCell>{broker.platform}</TableCell>
                                        <TableCell>{translateResult(challenge.result)}</TableCell>
                                        <TableCell>{challenge.phase}</TableCell>
                                        <TableCell>{broker.balance}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>

                    </Table>
                </div>
            </div>
        </DashboardLayout>
    );
}

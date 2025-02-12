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
import { Input } from "@/components/ui/input";
import DashboardLayout from "../..";

const fetcher = async (url, token) => {
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error("Error al obtener datos");
    return res.json();
};

export default function UserProfile() {
    const { data: session } = useSession();
    const router = useRouter();
    const { id } = router.query;

    const { data, error, isLoading } = useSWR(
        session?.jwt && id
            ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users?filters[documentId][$eq]=${id}&populate=*`, session.jwt]
            : null,
        ([url, token]) => fetcher(url, token)
    );

    const [search, setSearch] = useState("");
    const [resultFilter, setResultFilter] = useState("");
    const [phaseFilter, setPhaseFilter] = useState("");

    const filteredChallenges = useMemo(() => {
        if (!data || data.length === 0) return [];
        const user = data[0];
        return user.challenges.filter((challenge) => {
            const matchesSearch = challenge.login?.toLowerCase().includes(search.toLowerCase());
            const matchesResult = resultFilter ? challenge.result === resultFilter : true;
            const matchesPhase = phaseFilter ? String(challenge.phase) === phaseFilter : true;

            return matchesSearch && matchesResult && matchesPhase;
        });
    }, [data, search, resultFilter, phaseFilter]);

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

    // Removed unused formatDate function

    const translateResult = (result) => {
        switch (result) {
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
                    <strong>Nombre:</strong> {user.username}
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
                    <Input
                        placeholder="Login..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 px-3 text-sm bg-zinc-800 text-zinc-200 border-zinc-700 rounded-md"
                    />
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
                            {filteredChallenges.length > 0 ? (
                                filteredChallenges.map((challenge) => (
                                    <TableRow key={challenge.id}>
                                        <TableCell>{challenge.id}</TableCell>
                                        <TableCell>{challenge.login}</TableCell>
                                        <TableCell>{challenge.server}</TableCell>
                                        <TableCell>{challenge.platform}</TableCell>
                                        <TableCell>{translateResult(challenge.result)}</TableCell>
                                        <TableCell>{challenge.phase}</TableCell>
                                        <TableCell>{challenge.initBalance}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-zinc-500 py-6">
                                        No se encontraron resultados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DashboardLayout>
    );
}

"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import DashboardLayout from "..";

const brokerAccountColumns = [
    { accessorKey: "login", header: "Login" },
    { accessorKey: "password", header: "Password" },
    { accessorKey: "balance", header: "Balance" },
    { accessorKey: "server", header: "Server" },
    { accessorKey: "platform", header: "Platform" },
    { accessorKey: "used", header: "Used" },
];

const fetcher = (url, token) =>
    fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((res) => res.json());

export default function BrokerAccountsTable() {
    const { data: session } = useSession();
    const { data, error, isLoading } = useSWR(
        session?.jwt
            ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/broker-accounts`, session.jwt]
            : null,
        ([url, token]) => fetcher(url, token)
    );
    console.log(data)
    const [search, setSearch] = useState("");
    const [resultFilter, setResultFilter] = useState("");
    const [phaseFilter, setPhaseFilter] = useState("");
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");

    const filteredData = useMemo(() => {
        if (!data || !data.data) return [];

        return data.data.filter((account) => {
            const matchesSearch = account.login?.toLowerCase().includes(search.toLowerCase());
            return matchesSearch;
        });
    }, [data, search]);

    const table = useReactTable({
        data: filteredData,
        columns: brokerAccountColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <DashboardLayout>
            <div className="p-6 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 rounded-lg shadow-lg">
                {/* Barra de búsqueda y filtros */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 py-2">
                    {/* Filtro por login */}
                    <Input
                        placeholder="Login..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 px-3 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 rounded-md"
                    />
                </div>

                {/* Tabla */}
                <div className="border border-zinc-300 dark:border-zinc-700 rounded-md overflow-hidden mt-4">
                    <Table>
                        <TableHeader className="bg-zinc-200 dark:bg-zinc-800">
                            <TableRow>
                                {brokerAccountColumns.map((column) => (
                                    <TableHead key={column.accessorKey} className="text-zinc-900 dark:text-zinc-200 border-b border-zinc-300 dark:border-zinc-700">
                                        {column.header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length > 0 ? (
                                filteredData.map((account, index) => (
                                    <TableRow key={index} className="border-b border-zinc-300 dark:border-zinc-700">
                                        <TableCell>{account.login}</TableCell>
                                        <TableCell>{account.password}</TableCell>
                                        <TableCell>{account.balance}</TableCell>
                                        <TableCell>{account.server}</TableCell>
                                        <TableCell>{account.platform}</TableCell>
                                        <TableCell>{account.used ? "Yes" : "No"}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={brokerAccountColumns.length} className="text-center text-zinc-500 py-6">
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

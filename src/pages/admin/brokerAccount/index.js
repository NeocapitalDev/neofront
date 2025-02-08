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
    { accessorkey: "inversorPass", header: "Inversor"},
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
            ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/broker-accounts?filters[used][$eq]=false`, session.jwt]
            : null,
        ([url, token]) => fetcher(url, token)
    );

    const [search, setSearch] = useState("");
    const [usedFilter, setUsedFilter] = useState("");

    const filteredData = useMemo(() => {
        if (!data || !data.data) return [];

        return data.data.filter((account) => {
            const matchesSearch = account.login?.toLowerCase().includes(search.toLowerCase());
            const matchesUsed =
                usedFilter === "" ? true : account.used === (usedFilter === "Yes");

            return matchesSearch && matchesUsed;
        });
    }, [data, search, usedFilter]);

    // Contador de cuentas por balance
    const balanceCounts = useMemo(() => {
        if (!data || !data.data) return {};

        const balances = ["5000", "10000", "25000", "50000", "100000"];
        const counts = balances.reduce((acc, balance) => {
            acc[balance] = data.data.filter((account) => account.balance == balance).length;
            return acc;
        }, {});

        return counts;
    }, [data]);

    const table = useReactTable({
        data: filteredData,
        columns: brokerAccountColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <DashboardLayout>
            <div className="p-6 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 rounded-lg shadow-lg">

                {/* Resumen de Cuentas por Balance */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 ">
                    {[
                        { amount: "5000", label: "$5,000", color: "bg-blue-500" },
                        { amount: "10000", label: "$10,000", color: "bg-green-500" },
                        { amount: "25000", label: "$25,000", color: "bg-yellow-500" },
                        { amount: "50000", label: "$50,000", color: "bg-red-500" },
                        { amount: "100000", label: "$100,000", color: "bg-purple-500" },
                    ].map(({ amount, label, color }) => (
                        <div
                            key={amount}
                            className={`${color} text-white p-4 rounded-lg shadow-md flex flex-col items-center`}
                        >
                            <span className="text-xl font-bold">{balanceCounts[amount] || 0}</span>
                            <span className="text-sm">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Barra de búsqueda y filtros */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 py-2 mt-4">
                    {/* Filtro por login */}
                    <Input
                        placeholder="Login..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 px-3 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 rounded-md"
                    />

                    {/* Filtro por "Used" */}
                    <select
                        value={usedFilter}
                        onChange={(e) => setUsedFilter(e.target.value)}
                        className="h-9 px-3 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 rounded-md"
                    >
                        <option value="">Todos</option>
                        <option value="Yes">Sí</option>
                        <option value="No">No</option>
                    </select>
                </div>

                {/* Tabla */}
                <div className="border border-zinc-300 dark:border-zinc-700 rounded-md overflow-hidden mt-6">
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
                                        <TableCell>{account.inversorPass}</TableCell>
                                        <TableCell>{account.used ? "Si" : "No"}</TableCell>
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

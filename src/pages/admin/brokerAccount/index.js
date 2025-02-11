"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
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
import { Button } from "@/components/ui/button";

const brokerAccountColumns = [
    { accessorKey: "login", header: "Login" },
    { accessorKey: "password", header: "Password" },
    { accessorKey: "balance", header: "Balance" },
    { accessorKey: "server", header: "Server" },
    { accessorKey: "platform", header: "Platform" },
    { accessorKey: "inversorPass", header: "Inversor" },
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
    const { data, error } = useSWR(
        session?.jwt
            ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/broker-accounts?filters[used][$eq]=false`, session.jwt]
            : null,
        ([url, token]) => fetcher(url, token)
    );

    const [search, setSearch] = useState("");
    const [selectedAccountType, setSelectedAccountType] = useState(null);

    const accountTypes = [
        { amount: "5000", label: "$5,000", color: "bg-blue-500" },
        { amount: "10000", label: "$10,000", color: "bg-green-500" },
        { amount: "25000", label: "$25,000", color: "bg-yellow-500" },
        { amount: "50000", label: "$50,000", color: "bg-red-500" },
        { amount: "100000", label: "$100,000", color: "bg-purple-500" },
    ];

    const balanceCounts = useMemo(() => {
        if (!data || !data.data) return {};

        return accountTypes.reduce((acc, { amount }) => {
            acc[amount] = data.data.filter((account) => account.balance == amount).length;
            return acc;
        }, {});
    }, [data]);

    return (
        <DashboardLayout>
            <div className="p-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 rounded-lg shadow-lg">
                {/* Contadores de cuentas */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    {accountTypes.map(({ amount, label, color }) => (
                        <div key={amount} className={`${color} text-white p-4 rounded-lg shadow-md flex flex-col items-center`}>
                            <span className="text-xl font-bold">{balanceCounts[amount] || 0}</span>
                            <span className="text-sm">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Panel de selección de cuenta */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="md:col-span-2 p-4 bg-white dark:bg-zinc-800 rounded-md shadow-md">
                        <p className="text-lg font-semibold mb-4">Selecciona el tipo de cuenta</p>
                        <div className="grid grid-cols-2 gap-4">
                            {accountTypes.map(({ amount, label, color }) => (
                                <button
                                    key={amount}
                                    onClick={() => {
                                        setSelectedAccountType(label);
                                    }}
                                    className={`${color} text-white p-4 rounded-lg shadow-md flex flex-col items-center hover:opacity-90 transition`}
                                >
                                    <span className="text-xl font-bold">{label}</span>
                                </button>
                            ))}
                        </div>
                        {/* Formulario debajo del botón */}
                            <div className="mt-6   rounded-md shadow-md">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Agregar cuenta - {selectedAccountType}</h2>
                                <Input placeholder="Ingrese el login..." className="mt-4 border bg-zinc-700" />
                                <Input placeholder="Ingrese la contraseña..." className="mt-2 border bg-zinc-700" />
                                <Input placeholder="Ingrese el servidor..." className="mt-2 border bg-zinc-700" />
                                <Button className="mt-4 w-full">Guardar Cuenta</Button>
                            </div>
                        
                    </div>

                    {/* Tabla de cuentas */}
                    <div className="md:col-span-3 border-zinc-300 border-2 dark:border-zinc-700 rounded-md overflow-hidden h-[70vh] overflow-y-auto">
                        <div className="p-4">
                            <Input
                                placeholder="Buscar login..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full mb-4"
                            />
                        </div>
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
                                <TableRow>
                                    <TableCell colSpan={brokerAccountColumns.length} className="text-center text-zinc-500 py-6">
                                        No se encontraron resultados.
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
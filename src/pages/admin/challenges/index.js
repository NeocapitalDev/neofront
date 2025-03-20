// src/pages/admin/challenges/index.js
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
import { Button } from "@/components/ui/button";
import DashboardLayout from "..";
import { useRouter } from "next/router";
import { useStrapiData } from "@/services/strapiServiceJWT";

// Columnas de la tabla en español
const tableColumns = [
  { accessorKey: "traderAccount", header: "Cuenta Trader" },
  { accessorKey: "traderEmail", header: "Email Trader" },
  { accessorKey: "state", header: "Estado" },
  { accessorKey: "step", header: "Fase" },
  { accessorKey: "equity", header: "Capital" },
  { accessorKey: "brokerGroup", header: "Server" },
  { accessorKey: "actions", header: "Acciones" },
];

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

export default function ChallengesTable() {
  const { data: session } = useSession();

  // const route = session?.jwt ? "challenges?populate=*" : null;
  const { data, error, isLoading } = useStrapiData("challenges?populate=*");
  console.log("data", data);

  const formatCurrency = (amount) =>
    amount ? `$${parseFloat(amount).toLocaleString("es-ES", { minimumFractionDigits: 2 })}` : "N/A";

  const translateResult = (result) => {
    switch (result) {
      case "init":
        return "Iniciado";
      case "approved":
        return "Aprobado";
      case "disapproved":
        return "Rechazado";
      case "progress":
        return "En Progreso";
      case "withdrawal":
        return "Retirado";
      case "retry":
        return "Reintento";
      default:
        return "Desconocido";
    }
  };

  const getStatusElement = (result) => {
    const text = translateResult(result);
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${statusColors[result] || 'text-gray-600 dark:text-gray-300'} ${statusBgColors[result] || 'bg-gray-100 dark:bg-gray-800'}`}>
        <span className={`w-2 h-2 mr-2 rounded-full ${result === 'approved' ? 'bg-green-600' :
          result === 'progress' ? 'bg-yellow-500' :
            result === 'disapproved' ? 'bg-red-600' :
              result === 'init' ? 'bg-blue-500' :
                result === 'withdrawal' ? 'bg-purple-500' :
                  'bg-orange-500'
          }`}></span>
        {text}
      </span>
    );
  };

  const router = useRouter();

  const handleButtonClick = (documentId) => {
    router.push(`/admin/challenges/${documentId}`);
  };

  const filteredData = useMemo(() => {
    console.log(data);
    if (!data || !data.data) return [];

    return data.map((challenge) => ({
      traderAccount: challenge.broker_account?.login ?? "N/A",
      traderEmail: challenge.user?.email ?? "N/A",
      state: getStatusElement(challenge.result),
      step: `Fase ${challenge.phase ?? "N/A"}`,
      equity: formatCurrency(challenge.broker_account?.balance),
      brokerGroup: challenge.broker_account?.server ?? "N/A",
      actions: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleButtonClick(challenge.documentId)}
        >
          Ver Detalles
        </Button>
      ),
    }));
  }, [data]);

  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <DashboardLayout>
      <div className="p-6 rounded-lg shadow-lg text-white">
        <h1 className="text-4xl font-bold mb-6">Challenges</h1>
        <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg mt-4">
          <Table>
            <TableHeader className="bg-zinc-200 dark:bg-zinc-800">
              <TableRow>
                {tableColumns.map((column) => (
                  <TableHead key={column.accessorKey} className="border-b border-zinc-300 text-zinc-900 dark:border-zinc-700 dark:text-zinc-200">
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((challenge, index) => (
                  <TableRow
                    key={index}
                    className="border-b border-zinc-300 dark:border-zinc-700"
                  >
                    <TableCell>{challenge.traderAccount}</TableCell>
                    <TableCell>{challenge.traderEmail}</TableCell>
                    <TableCell>{challenge.state}</TableCell>
                    <TableCell>{challenge.step}</TableCell>
                    <TableCell>{challenge.equity}</TableCell>
                    <TableCell>{challenge.brokerGroup}</TableCell>
                    <TableCell>{challenge.actions}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} className="text-center text-zinc-500 py-6">
                    No se encontraron datos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end items-center mt-4 space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
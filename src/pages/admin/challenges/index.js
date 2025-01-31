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

const challengeColumns = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "login", header: "Login" },
  { accessorKey: "result", header: "Resultado" },
  { accessorKey: "startDate", header: "Fecha de Inicio" },
  { accessorKey: "endDate", header: "Fecha de Fin" },
  { accessorKey: "step", header: "Paso" },
];

const fetcher = (url, token) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());

export default function ChallengesTable() {
  const { data: session } = useSession();
  const { data, error, isLoading } = useSWR(
    session?.jwt
      ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenges`, session.jwt]
      : null,
    ([url, token]) => fetcher(url, token)
  );

  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!data || !data.data) return [];
    return data.data.filter((challenge) =>
      challenge.login.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const table = useReactTable({
    data: filteredData,
    columns: challengeColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar los datos</div>;

  return (
    <DashboardLayout>
      <div className="p-8 bg-zinc-900 text-zinc-200 rounded-lg shadow-lg">
        {/* Barra de búsqueda */}
        <div className="flex items-center py-4">
          <Input
            placeholder="Filtrar por login..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm bg-zinc-800 text-zinc-200 border-zinc-700"
          />
        </div>

        {/* Tabla */}
        <div className="border border-zinc-700 rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-800">
              <TableRow>
                {challengeColumns.map((column) => (
                  <TableHead key={column.accessorKey} className="text-zinc-200 border-b border-zinc-700">
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((challenge, index) => (
                  <TableRow key={index} className="border-b border-zinc-700">
                    <TableCell>{challenge.id}</TableCell>
                    <TableCell>{challenge.login}</TableCell>
                    <TableCell>{challenge.result ?? "N/A"}</TableCell>
                    <TableCell>{challenge.startDate ?? "N/A"}</TableCell>
                    <TableCell>{challenge.endDate ?? "N/A"}</TableCell>
                    <TableCell>{challenge.step}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={challengeColumns.length} className="text-center text-zinc-500 py-6">
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

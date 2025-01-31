"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetcher } from "@/services/strapiService";
import Loader from "@/components/loaders/loader";
import DashboardLayout from "..";

const challengeColumns = [
  { accessorKey: "login", header: "Usuario (Login)" },
  { accessorKey: "startDate", header: "Fecha Inicio" },
  { accessorKey: "endDate", header: "Fecha Fin" },
  { accessorKey: "status", header: "Estado" },
];

export default function ChallengesTable() {
  const { data: session } = useSession();

  // Verificar que session existe antes de hacer la petición
  const { data, error, isLoading } = useSWR(
    session?.jwt
      ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenges`, session.jwt]
      : null,
    ([url, token]) => fetcher(url, token)
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Transformación de datos
  const challengesData = useMemo(() => {
    if (!data || !data.data) return [];
    return data.data.map((challenge) => ({
      id: challenge?.id || "",
      login: challenge?.attributes?.user?.data?.attributes?.username || "Desconocido",
      startDate: challenge?.attributes?.startDate || "No disponible",
      endDate: challenge?.attributes?.endDate || "No disponible",
      status: challenge?.attributes?.passed ? "Aprobado" : "No aprobado",
    }));
  }, [data]);

  // Filtrado de datos
  const filteredData = useMemo(() => {
    return challengesData.filter(
      (challenge) =>
        challenge.login.toLowerCase().includes(search.toLowerCase()) &&
        (statusFilter === "" || challenge.status === statusFilter)
    );
  }, [search, statusFilter, challengesData]);

  const table = useReactTable({
    data: filteredData,
    columns: challengeColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <DashboardLayout>
      <div className="p-8 mt-5 bg-zinc-900 text-zinc-200 rounded-lg shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="Buscar por login..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm bg-zinc-800 text-zinc-200 border-zinc-700"
          />
          <DropdownMenu>
            <DropdownMenuTrigger className="bg-zinc-800 text-zinc-200 px-4 py-2 rounded-md">
              Estado
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-800 text-zinc-200">
              {["", "Aprobado", "No aprobado"].map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`${statusFilter === status ? "bg-zinc-700" : ""} hover:bg-zinc-700`}
                >
                  {status || "Todos"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <div className="text-red-500 text-center py-4">Error al cargar los datos.</div>
        ) : (
          <div className="border border-zinc-700 rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-800">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-zinc-200 border-b border-zinc-700"
                      >
                        {header.column.columnDef.header}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="border-b border-zinc-700">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-zinc-200">
                          {cell.renderValue()}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={challengeColumns.length}
                      className="text-center text-zinc-500 py-6"
                    >
                      No se encontraron resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

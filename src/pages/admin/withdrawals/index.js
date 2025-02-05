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
  { accessorKey: "startDate", header: "Fecha de Inicio" },
  { accessorKey: "endDate", header: "Fecha de Fin" },
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
    ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenges?filters[phase][$eq]=3&filters[result][$eq]=approved`, session.jwt]
    : null,
    ([url, token]) => fetcher(url, token)
  );

  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState(""); // "Aprobado" o "No Aprobado"
  const [phaseFilter, setPhaseFilter] = useState(""); // "1", "2", "3"
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const filteredData = useMemo(() => {
    if (!data || !data.data) return [];

    return data.data.filter((challenge) => {
      const matchesSearch = challenge.login.toLowerCase().includes(search.toLowerCase());
      const matchesResult =
        resultFilter && challenge.result
          ? challenge.result.toLowerCase() === resultFilter.toLowerCase()
          : true;
      const matchesPhase = phaseFilter ? String(challenge.phase) === phaseFilter : true;
      const matchesDateRange =
        (!startDateFilter || new Date(challenge.startDate) >= new Date(startDateFilter)) &&
        (!endDateFilter || new Date(challenge.endDate) <= new Date(endDateFilter));

      return matchesSearch && matchesResult && matchesPhase && matchesDateRange;
    });
  }, [data, search, resultFilter, phaseFilter, startDateFilter, endDateFilter]);

  const table = useReactTable({
    data: filteredData,
    columns: challengeColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });


  return (
    <DashboardLayout>
      <div className="p-6 bg-zinc-900 text-zinc-200 rounded-lg shadow-lg">
        {/* Barra de búsqueda y filtros */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 py-2">
          {/* Filtro por login */}
          <Input
            placeholder="Login..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 px-3 text-sm bg-zinc-800 text-zinc-200 border-zinc-700 rounded-md"
          />

          {/* Filtro por fecha de inicio */}
          <Input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="h-9 px-3 text-sm bg-zinc-800 text-zinc-200 border-zinc-700 rounded-md"
          />

          {/* Filtro por fecha de fin */}
          <Input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="h-9 px-3 text-sm bg-zinc-800 text-zinc-200 border-zinc-700 rounded-md"
          />
        </div>

        {/* Tabla */}
        <div className="border border-zinc-700 rounded-md overflow-hidden mt-4">
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
                    <TableCell>{formatDate(challenge.startDate) ?? "N/A"}</TableCell>
                    <TableCell>{formatDate(challenge.endDate) ?? "N/A"}</TableCell>
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





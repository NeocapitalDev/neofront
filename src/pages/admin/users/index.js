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

const userColumns = [
  { accessorKey: "username", header: "Nombre de Usuario" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "isVerified",
    header: "Verificado",
    cell: ({ row }) => (row.getValue("isVerified") ? "TRUE" : "FALSE"),
  },
];

const fetcher = (url, token) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());

export default function UsersTable() {
  const { data: session } = useSession();
  const { data, error, isLoading } = useSWR(
    session?.jwt
      ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, session.jwt]
      : null,
    ([url, token]) => fetcher(url, token)
  );

  const [search, setSearch] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("Todos");

  const filteredData = useMemo(() => {
    if (!data) return [];

    return data
      .filter(
        (user) =>
          user.username.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      )
      .filter((user) => {
        if (verificationFilter === "Todos") return true;
        return verificationFilter === "Verificado"
          ? user.isVerified
          : !user.isVerified;
      })
      .map((user) => ({
        ...user,
        isVerified: user.isVerified ? "TRUE" : "FALSE",
      }));
  }, [data, search, verificationFilter]);

  const table = useReactTable({
    data: filteredData,
    columns: userColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar los datos</div>;

  return (
    <div className="p-8 bg-zinc-900 text-zinc-200 rounded-lg shadow-lg">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
        {/* Input de búsqueda */}
        <Input
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm bg-zinc-800 text-zinc-200 border-zinc-700"
        />

        {/* Select para Verificación */}
        <Select
          value={verificationFilter}
          onChange={(e) => setVerificationFilter(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="border border-zinc-700 rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-800">
            <TableRow>
              {userColumns.map((column) => (
                <TableHead
                  key={column.accessorKey}
                  className="text-zinc-200 border-b border-zinc-700"
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((user, index) => (
                <TableRow key={index} className="border-b border-zinc-700">
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.isVerified}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={userColumns.length}
                  className="text-center text-zinc-500 py-6"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* Componente Select */
const Select = ({ value, onChange }) => {
  return (
    <div className="relative w-full md:w-48">
      <select
        value={value}
        onChange={onChange}
        className="block w-full px-3 py-2 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-600"
      >
        <option value="Todos">Todos</option>
        <option value="Verificado">Verificado</option>
        <option value="No Verificado">No Verificado</option>
      </select>
    </div>
  );
};

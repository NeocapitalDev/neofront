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

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((user) =>
      user.username.toLowerCase().includes(search.toLowerCase())
    ).map(user => ({
      ...user,
      isVerified: user.isVerified ? "TRUE" : "FALSE",
    }));
  }, [data, search]);

  const table = useReactTable({
    data: filteredData,
    columns: userColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar los datos</div>;

  return (
    // <DashboardLayout>
      <div className="p-8 bg-zinc-900 text-zinc-200 rounded-lg shadow-lg">
        {/* Barra de búsqueda */}
        <div className="flex items-center py-4">
          <Input
            placeholder="Filtrar usuarios..."
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
                {userColumns.map((column) => (
                  <TableHead key={column.accessorKey} className="text-zinc-200 border-b border-zinc-700">
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
                  <TableCell colSpan={userColumns.length} className="text-center text-zinc-500 py-6">
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    // </DashboardLayout>
  );
}
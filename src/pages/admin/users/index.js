"use client";

import React, { useState, useMemo } from "react";
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

const usersData = [
  { id: "1", username: "JohnDoe", email: "john@example.com", blocked: false, verified: true },
  { id: "2", username: "JaneSmith", email: "jane@example.com", blocked: true, verified: false },
  { id: "3", username: "Alice", email: "alice@example.com", blocked: false, verified: true },
];

const userColumns = [
  { accessorKey: "username", header: "Nombre de Usuario" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "blocked",
    header: "Bloqueado",
    cell: ({ row }) => (row.getValue("blocked") ? "Sí" : "No"),
  },
  {
    accessorKey: "verified",
    header: "Verificado",
    cell: ({ row }) => (row.getValue("verified") ? "Sí" : "No"),
  },
];

export default function UsersTable() {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    return usersData.filter((user) =>
      user.username.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const table = useReactTable({
    data: filteredData,
    columns: userColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <DashboardLayout>
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
    </DashboardLayout>
  );
}

"use client";

import React, { useState, useMemo } from "react";
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
import DashboardLayout from "..";

const challengesData = [
  { id: "1", title: "Challenge 1", status: "Completed", participants: 50 },
  { id: "2", title: "Challenge 2", status: "In Progress", participants: 20 },
  { id: "3", title: "Challenge 3", status: "Pending", participants: 10 },
];

const challengeColumns = [
  { accessorKey: "title", header: "Título" },
  { accessorKey: "status", header: "Estado" },
  { accessorKey: "participants", header: "Participantes" },
];

export default function ChallengesTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredData = useMemo(() => {
    return challengesData.filter(
      (challenge) =>
        challenge.title.toLowerCase().includes(search.toLowerCase()) &&
        (statusFilter === "" || challenge.status === statusFilter)
    );
  }, [search, statusFilter]);

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
            placeholder="Buscar challenges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm bg-zinc-800 text-zinc-200 border-zinc-700"
          />
          <DropdownMenu>
            <DropdownMenuTrigger className="bg-zinc-800 text-zinc-200 px-4 py-2 rounded-md">
              Estado
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-800 text-zinc-200">
              {["", "Completed", "In Progress", "Pending"].map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`${
                    statusFilter === status ? "bg-zinc-700" : ""
                  } hover:bg-zinc-700`}
                >
                  {status || "Todos"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
      </div>
    </DashboardLayout>
  );
}

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
import { CheckCircle, XCircle } from "lucide-react"; // Importa íconos de Lucide
import DashboardLayout from "..";

const userColumns = [
  { accessorKey: "username", header: "Nombre de Usuario" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "isVerified",
    header: "Verificado",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        {row.getValue("isVerified") ? (
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500 w-5 h-5" />
            <span className="text-green-500 font-medium">Verificado</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <XCircle className="text-red-500 w-5 h-5" />
            <span className="text-red-500 font-medium">No Verificado</span>
          </div>
        )}
      </div>
    ),
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

  const [usernameSearch, setUsernameSearch] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("Todos");

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) {
      console.error("Error: 'data' no es un arreglo:", data);
      return [];
    }

    return data
      .filter(
        (user) =>
          user?.username
            ?.toLowerCase()
            .includes(usernameSearch.toLowerCase()) &&
          user?.email?.toLowerCase().includes(emailSearch.toLowerCase())
      )
      .filter((user) => {
        if (verificationFilter === "Todos") return true;
        return verificationFilter === "Verificado"
          ? user.isVerified
          : !user.isVerified;
      });
  }, [data, usernameSearch, emailSearch, verificationFilter]);

  const table = useReactTable({
    data: filteredData,
    columns: userColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <p className="text-center text-zinc-500">Cargando datos...</p>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <p className="text-center text-red-500">Error al cargar los datos.</p>
      </DashboardLayout>
    );
  }

  if (!Array.isArray(data)) {
    return (
      <DashboardLayout>
        <p className="text-center text-zinc-500">
          No hay datos disponibles o la estructura es incorrecta.
        </p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 bg-zinc-900 text-zinc-200 rounded-lg shadow-lg">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
          <Input
            placeholder="Buscar por nombre..."
            value={usernameSearch}
            onChange={(e) => setUsernameSearch(e.target.value)}
            className="max-w-sm bg-zinc-800 text-zinc-200 border-zinc-700"
          />
          <Input
            placeholder="Buscar por email..."
            value={emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
            className="max-w-sm bg-zinc-800 text-zinc-200 border-zinc-700"
          />
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
                    <TableCell>
                      {user.isVerified ? (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="text-green-500 w-5 h-5" />
                          <span className="text-green-500 font-medium">
                            Verificado
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <XCircle className="text-red-500 w-5 h-5" />
                          <span className="text-red-500 font-medium">
                            No Verificado
                          </span>
                        </div>
                      )}
                    </TableCell>
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

/* Componente Select */
const Select = ({ value, onChange }) => {
  return (
    <div className="relative w-full md:w-48">
      <select
        value={value}
        onChange={onChange}
        className="block w-full px-3 py-1 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-600"
      >
        <option value="Todos">Todos</option>
        <option value="Verificado">Verificado</option>
        <option value="No Verificado">No Verificado</option>
      </select>
    </div>
  );
};

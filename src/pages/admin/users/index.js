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
import { CheckCircle, XCircle } from "lucide-react";
import DashboardLayout from "..";
import { useRouter } from "next/router";
import Flag from "react-world-flags";

import { PencilSquareIcon } from "@heroicons/react/24/solid";

import EditUserModal from "./editUserModal";

const userColumns = (router) => [
  { accessorKey: "fullName", header: "Nombre Completo" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Teléfono" },
  {
    accessorKey: "country",
    header: "País",
    cell: ({ row }) => {
      const countryCode = row.original.countryCode?.toLowerCase(); 
      return (
        <div className="flex items-center space-x-2">
          {countryCode && <Flag country={countryCode} className="w-6 h-4" />}
          <span>{row.getValue("country")}</span>
        </div>
      );
    },
  },
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
  {
    accessorKey: "id",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <RedirectButton userdocumentId={row.original.documentId} />
        <EditButton user={row.original} />
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
  const router = useRouter();
  const { data, error, isLoading } = useSWR(
    session?.jwt
      ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, session.jwt]
      : null,
    ([url, token]) => fetcher(url, token)
  );

  // console.log(data);

  const [nameSearch, setNameSearch] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("Todos");

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data
      .filter((user) => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        return fullName.includes(nameSearch.toLowerCase());
      })
      .filter((user) => user.email.toLowerCase().includes(emailSearch.toLowerCase()))
      .filter((user) => {
        if (verificationFilter === "Todos") return true;
        return verificationFilter === "Verificado"
          ? user.isVerified
          : !user.isVerified;
      });
  }, [data, nameSearch, emailSearch, verificationFilter]);

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

  return (
    <DashboardLayout>
      <div className="p-8 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 rounded-lg shadow-lg">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
          <Input
            placeholder="Buscar por nombre..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="max-w-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700"
          />
          <Input
            placeholder="Buscar por email..."
            value={emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
            className="max-w-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700"
          />
          <Select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
          />
        </div>

        {/* Tabla */}
        <div className="border border-zinc-300 dark:border-zinc-700 rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-200 dark:bg-zinc-800">
              <TableRow>
                {userColumns(router).map((column) => (
                  <TableHead
                    key={column.accessorKey}
                    className="text-zinc-900 dark:text-zinc-200 border-b border-zinc-300 dark:border-zinc-700"
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((user, index) => (
                  <TableRow key={index} className="border-b border-zinc-300 dark:border-zinc-700">
                    <TableCell>{user.firstName + " " + user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.country}</TableCell>
                    <TableCell>
                      {user.isVerified ? (
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
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <RedirectButton userdocumentId={user.documentId} />
                        <EditButton user={user} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={userColumns(router).length} className="text-center">
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
        className=" max-w-sm py-1  bg-white dark:bg-zinc-800 text-zinc-700 rounded-md dark:text-zinc-200 border-zinc-300 dark:border-zinc-700"
      >
        <option className="" value="Todos">Estado de cuenta</option>
        <option value="Verificado">Verificado</option>
        <option value="No Verificado">No Verificado</option>
      </select>
    </div>
  );
};

const RedirectButton = ({ userdocumentId }) => {
  const router = useRouter();

  const handleRedirect = () => {
    router.push(`/admin/users/${userdocumentId}`);
  };

  return (
    <button
      onClick={handleRedirect}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Ver Detalles
    </button>
  );
};

const EditButton = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        onClick={handleEdit}
        className="ml-2 px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center space-x-1"
      >
        <PencilSquareIcon className="w-5 h-5" />
        <span>Editar</span>
      </button>

      {isModalOpen && (
        <EditUserModal
          user={user} // Pasamos el usuario seleccionado al modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

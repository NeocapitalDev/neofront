"use client";

import React, { useState, useMemo, useCallback } from "react";
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
import { CheckCircle, XCircle, Eye } from "lucide-react";
import DashboardLayout from "..";
import { useRouter } from "next/router";
import Flag from "react-world-flags";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import EditUserModal from "./editUserModal";

const userColumns = (router, openPdfModal) => [
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
    accessorKey: "statusSign",
    header: "Firma Aprobada",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        {row.getValue("statusSign") ? (
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500 w-5 h-5" />
            <span className="text-green-500 font-medium">Aprobado</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <XCircle className="text-red-500 w-5 h-5" />
            <span className="text-red-500 font-medium">No Aprobado</span>
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
        <ViewPdfButton user={row.original} onViewPdf={openPdfModal} />
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

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_PDF_MANAGE || "https://n8n.neocapitalfunding.com/webhook-test/7072a687-cb6f-48e4-aed3-dca35255a1a9";

export default function UsersTable() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR(
    session?.jwt
      ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users?populate=*`, session.jwt]
      : null,
    ([url, token]) => fetcher(url, token)
  );

  const [nameSearch, setNameSearch] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("Todos");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

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

  const openPdfModal = (user) => {
    setSelectedUser(user);
    setIsPdfModalOpen(true);
  };

  const closePdfModal = () => {
    setSelectedUser(null);
    setIsPdfModalOpen(false);
  };

  const sendWebhook = async (user, statusSign) => {
    try {
      const payload = {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          pdfUrl: user.pdf?.[0]?.url || null,
        },
        statusSign: statusSign,
      };

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Error al enviar el webhook");
      }

      console.log("Webhook enviado exitosamente:", payload);
    } catch (error) {
      console.error("Error al enviar el webhook:", error);
      toast.error("Error al enviar la notificación al webhook: " + error.message);
    }
  };

  const handleApprove = async () => {
    if (!selectedUser) return;

    try {
      // Actualizar statusSign en Strapi
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.jwt}`,
        },
        body: JSON.stringify({ statusSign: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || "Error al aprobar la firma");
      }

      // Enviar webhook
      await sendWebhook(selectedUser, true);

      toast.success("Firma aprobada exitosamente.");
      mutate(); // Refresh the table data
      closePdfModal();
    } catch (error) {
      console.error("Error al aprobar la firma:", error);
      toast.error("Hubo un problema al aprobar la firma: " + error.message);
    }
  };

  const handleDisapprove = async () => {
    if (!selectedUser) return;

    try {
      // Actualizar statusSign en Strapi
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.jwt}`,
        },
        body: JSON.stringify({ statusSign: false }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || "Error al desaprobar la firma");
      }

      // Enviar webhook
      await sendWebhook(selectedUser, false);

      toast.success("Firma desaprobada exitosamente.");
      mutate(); // Refresh the table data
      closePdfModal();
    } catch (error) {
      console.error("Error al desaprobar la firma:", error);
      toast.error("Hubo un problema al desaprobar la firma: " + error.message);
    }
  };

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
                {userColumns(router, openPdfModal).map((column) => (
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
                      {user.statusSign ? (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="text-green-500 w-5 h-5" />
                          <span className="text-green-500 font-medium">Aprobado</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <XCircle className="text-red-500 w-5 h-5" />
                          <span className="text-red-500 font-medium">No Aprobado</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <RedirectButton userdocumentId={user.documentId} />
                        <EditButton user={user} />
                        <ViewPdfButton user={user} onViewPdf={openPdfModal} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={userColumns(router, openPdfModal).length} className="text-center">
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modal para ver el PDF */}
        {selectedUser && (
          <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Ver PDF de {selectedUser.firstName} {selectedUser.lastName}</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {selectedUser.pdf?.[0]?.url ? (
                  <embed
                    src={`${selectedUser.pdf[0].url}#toolbar=0`}
                    type="application/pdf"
                    className="w-full min-h-[calc(80vh)]"
                  />
                ) : (
                  <p className="text-center text-red-500">No se ha subido un PDF para este usuario.</p>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={handleApprove}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={!selectedUser.pdf?.[0]?.url}
                >
                  Aprobar
                </Button>
                <Button
                  onClick={handleDisapprove}
                  className="bg-red-500 hover:bg-red-600 text-white"
                  disabled={!selectedUser.pdf?.[0]?.url}
                >
                  Desaprobar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
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
        className="max-w-sm py-1 bg-white dark:bg-zinc-800 text-zinc-700 rounded-md dark:text-zinc-200 border-zinc-300 dark:border-zinc-700"
      >
        <option value="Todos">Estado de cuenta</option>
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
      Detalles
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
          user={user}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

const ViewPdfButton = ({ user, onViewPdf }) => {
  console.log(user);
  return (
    <button
      onClick={() => onViewPdf(user)}
      className="ml-2 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center space-x-1"
    >
      <Eye className="w-5 h-5" />
      <span>PDF</span>
    </button>
  );
};
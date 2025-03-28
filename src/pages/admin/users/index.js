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
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

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

  // Filter and paginate data
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

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, pageSize]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / pageSize);
  }, [filteredData, pageSize]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(0);
  }, [nameSearch, emailSearch, verificationFilter]);

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
      <div className="p-6">
        <h1 className="text-4xl font-bold mb-6">Users</h1>
        <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg mt-4 space-y-4">
          {/* Filtros */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
            <div className="flex w-full md:w-auto gap-2 flex-col md:flex-row">
              <Input
                placeholder="Buscar por nombre..."
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700"
              />
              <Input
                placeholder="Buscar por email..."
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700"
              />
            </div>

            <div className="relative w-full md:w-48">
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="w-full py-2 px-3 rounded-md bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700"
              >
                <option value="Todos">Estado de cuenta</option>
                <option value="Verificado">Verificado</option>
                <option value="No Verificado">No Verificado</option>
              </select>
            </div>
          </div>

          {/* Tabla */}
          <div className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900">
            <Table>
              <TableHeader className="bg-zinc-200 dark:bg-zinc-800">
                <TableRow>
                  <TableHead className="text-zinc-900 dark:text-zinc-200 font-medium">Nombre Completo</TableHead>
                  <TableHead className="text-zinc-900 dark:text-zinc-200 font-medium">Email</TableHead>
                  <TableHead className="text-zinc-900 dark:text-zinc-200 font-medium">Teléfono</TableHead>
                  <TableHead className="text-zinc-900 dark:text-zinc-200 font-medium">País</TableHead>
                  <TableHead className="text-zinc-900 dark:text-zinc-200 font-medium">Verificado</TableHead>
                  <TableHead className="text-zinc-900 dark:text-zinc-200 font-medium">Firma Aprobada</TableHead>
                  <TableHead className="text-zinc-900 dark:text-zinc-200 font-medium">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((user, index) => (
                    <TableRow key={index} className="border-b border-zinc-300 dark:border-zinc-700">
                      <TableCell className="py-3">{user.firstName + " " + user.lastName}</TableCell>
                      <TableCell className="py-3">{user.email}</TableCell>
                      <TableCell className="py-3">{user.phone}</TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center space-x-2">
                          {user.countryCode && <Flag country={user.countryCode.toLowerCase()} className="w-6 h-4" />}
                          <span>{user.country}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
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
                      <TableCell className="py-3">
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
                      <TableCell className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => router.push(`/admin/users/${user.documentId}`)}
                            className="px-3 py-1 h-9 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Detalles
                          </Button>
                          <Button
                            onClick={() => {
                              const editButton = document.getElementById(`edit-button-${user.id}`);
                              if (editButton) editButton.click();
                            }}
                            className="px-3 py-1 h-9 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center space-x-1"
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                            <span>Editar</span>
                          </Button>
                          <Button
                            onClick={() => openPdfModal(user)}
                            className="px-3 py-1 h-9 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center space-x-1"
                          >
                            <Eye className="w-5 h-5" />
                            <span>PDF</span>
                          </Button>
                          <span id={`edit-button-${user.id}`} className="hidden">
                            <EditButton user={user} />
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No se encontraron resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {filteredData.length > 0 && (
            <div className="flex items-center justify-between px-2 mt-4">
              <div className="flex-1 text-sm text-zinc-700 dark:text-zinc-400">
                Mostrando {paginatedData.length} de {filteredData.length} registros
              </div>
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Filas por página</p>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="h-8 w-16 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2"
                  >
                    {[10, 20, 30, 40, 50].map((size) => (
                      <option key={size} value={size} className="flex items-start">
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Página {currentPage + 1} de {totalPages || 1}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(0)}
                    disabled={currentPage === 0}
                  >
                    <span className="sr-only">Ir a la primera página</span>
                    <span className="h-4 w-4">{"⟪"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    <span className="sr-only">Ir a la página anterior</span>
                    <span className="h-4 w-4">{"<"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    <span className="sr-only">Ir a la página siguiente</span>
                    <span className="h-4 w-4">{">"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    <span className="sr-only">Ir a la última página</span>
                    <span className="h-4 w-4">{"⟫"}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

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
      </div>
    </DashboardLayout>
  );
}

const EditButton = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        onClick={handleEdit}
        className="hidden"
      >
        Editar
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
"use client";

import React, { useState, useMemo } from "react";
import { useStrapiData } from "src/services/strapiService";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import DashboardLayout from "..";

const withdrawColumns = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "documentId", header: "Document ID" },
  { accessorKey: "wallet", header: "Wallet" },
  { accessorKey: "amount", header: "Monto" },
  { accessorKey: "estado", header: "Estado" },
  { accessorKey: "createdAt", header: "Fecha de Creación" },
  { accessorKey: "username", header: "Usuario" },
  { accessorKey: "challengeId", header: "ID del Challenge" },
  { accessorKey: "action", header: "Acciones" },
  // { accessorKey: "challengeDocumentId", header: "Document ID del Challenge" },
];

export default function WithdrawsTable() {
  const { data, error, isLoading } = useStrapiData("withdraws?populate[challenge][populate]=user");

  // Estados para filtros
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");

  // Estados para el modal de rechazo
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleAccept = async (documentId) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`https://n8n.neocapitalfunding.com/webhook/withdraw-status1`, {
        method: "POST",
        body: JSON.stringify({
          documentId: documentId,
          status: "pagado"
        }),
        headers: {
          "Content-Type": "application/json"
        },
      });
      if (response.ok) {
        // console.log("Respuesta del servidor:", response);s
        toast.success("Retiro completado ", response.respuesta || response.ok);
        // Force page reload after successful withresponse.respuesta || response.okdrawal acceptance
        setTimeout(() => {
          // window.location.reload();
        }, 1000); // Delay of 1 second to allow the toast to be visible
      } else {
        throw new Error("Error en la respuesta del servidor", response.respuesta || response.error);
      }
    } catch (error) {
      toast.error("Error, no se pudo completar el retiro");
      console.error("Error al aceptar la solicitud de retiro:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRejectModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setRejectionReason("");
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!selectedWithdrawal || !rejectionReason.trim()) {
      toast.error("Error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`https://n8n.neocapitalfunding.com/webhook/withdraw-status1`, {
        method: "POST",
        body: JSON.stringify({
          documentId: selectedWithdrawal.documentId,
          status: "rechazado",
          reason: rejectionReason
        }),
        headers: {
          "Content-Type": "application/json"
        },
      });

      if (response.ok) {
        toast.success("Retiro rechazado y notificado al usuario. ", response.respuesta || response.ok);
        setIsRejectModalOpen(false);
      } else {
        throw new Error("Error en la respuesta del servidor", response.respuesta || response.error);
      }
    } catch (error) {
      toast.error("Ha ocurrido un error al rechazar la solicitud de retiro.");
      console.error("Error al rechazar la solicitud de retiro:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Procesar los datos para obtener una estructura plana para la tabla
  const processedData = useMemo(() => {
    if (!data) return [];

    return data.map(item => {
      // Manejar ambas posibles estructuras de datos (directa o con atributos)
      const withdraw = item.attributes || item;
      const challenge = withdraw.challenge?.data?.attributes || withdraw.challenge;
      const user = challenge?.user?.data?.attributes || challenge?.user;

      return {
        id: item.id,
        documentId: withdraw.documentId,
        wallet: withdraw.wallet,
        amount: withdraw.amount,
        estado: withdraw.estado,
        createdAt: withdraw.createdAt,
        // Extraer datos de usuario y reto a una estructura plana
        username: user?.username || "N/A",
        email: user?.email || "N/A",
        challengeId: challenge?.id || "N/A",
        challengeDocumentId: challenge?.documentId || "N/A"
      };
    });
  }, [data]);

  const filteredData = useMemo(() => {
    if (!processedData.length) return [];

    return processedData.filter((item) => {
      const matchesEstado = estadoFilter ? item.estado === estadoFilter : true;

      // Solo aplicar filtros de fecha si son fechas válidas
      const validStartDate = item.startDate !== "N/A";
      const validEndDate = item.endDate !== "N/A";

      const matchesDateRange =
        (!startDateFilter || !validStartDate || new Date(item.startDate) >= new Date(startDateFilter)) &&
        (!endDateFilter || !validEndDate || new Date(item.endDate) <= new Date(endDateFilter));

      return matchesEstado && matchesDateRange;
    });
  }, [processedData, estadoFilter, startDateFilter, endDateFilter]);

  const table = useReactTable({
    data: filteredData,
    columns: withdrawColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <DashboardLayout>
      <div className="p-6 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 rounded-lg shadow-lg">
        {/* Barra de búsqueda y filtros */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 py-2">
          {/* Filtro por estado */}
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="h-9 px-3 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 rounded-md"
          >
            <option value="">Todos los estados</option>
            <option value="proceso">En Proceso</option>
            <option value="pagado">Pagado</option>
            <option value="rechazado">Rechazado</option>
          </select>

          {/* Filtro por fecha de inicio */}
          <Input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="h-9 px-3 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 rounded-md"
          />

          {/* Filtro por fecha de fin */}
          <Input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="h-9 px-3 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 rounded-md"
          />
        </div>

        {/* Tabla */}
        <div className="border border-zinc-300 dark:border-zinc-700 rounded-md overflow-hidden mt-4">
          <Table>
            <TableHeader className="bg-zinc-200 dark:bg-zinc-800">
              <TableRow>
                {withdrawColumns.map((column) => (
                  <TableHead key={column.accessorKey} className="text-zinc-900 dark:text-zinc-200 border-b border-zinc-300 dark:border-zinc-700">
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={withdrawColumns.length} className="text-center text-zinc-500 py-6">
                    Cargando datos...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={withdrawColumns.length} className="text-center text-zinc-500 py-6">
                    Error al cargar los datos: {error.message}
                  </TableCell>
                </TableRow>
              ) : filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableRow key={index} className="border-b border-zinc-300 dark:border-zinc-700">
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.documentId}</TableCell>
                    <TableCell>{item.wallet}</TableCell>
                    <TableCell>{item.amount}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.estado === "completado"
                        ? "bg-green-100 text-green-800"
                        : item.estado === "rechazado"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                        }`}>
                        {item.estado}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell>{item.username}</TableCell>
                    <TableCell>{item.challengeId}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="success"
                          disabled={item.estado !== "proceso" || isSubmitting}
                          onClick={() => handleAccept(item.documentId)}
                          className={`px-3 py-1 text-xs font-medium rounded-md text-white ${item.estado !== "proceso" || isSubmitting
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                            } transition-colors`}
                        >
                          Completar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={item.estado !== "proceso" || isSubmitting}
                          onClick={() => openRejectModal(item)}
                          className={`px-3 py-1 text-xs font-medium rounded-md text-white ${item.estado !== "proceso" || isSubmitting
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                            } transition-colors`}
                        >
                          Rechazar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={withdrawColumns.length} className="text-center text-zinc-500 py-6">
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal de rechazo */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar Solicitud de Retiro</DialogTitle>
            <DialogDescription>
              Por favor, proporcione una razón para rechazar esta solicitud. Esta información será compartida con el usuario.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Escriba la razón del rechazo"
              className="min-h-24"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isSubmitting}
            >
              {isSubmitting ? "Procesando..." : "Confirmar Rechazo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
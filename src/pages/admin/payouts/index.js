"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "..";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWooCommerce } from "@/services/useWoo";

const PayoutsPage = () => {
  // Estados para filtros y paginación
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  
  // Parámetros para la consulta a WooCommerce
  const params = {
    per_page: 10,
    page,
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(startDate && { after: `${startDate}T00:00:00` }),
    ...(endDate && { before: `${endDate}T23:59:59` }),
  };

  // Usar el hook useWooCommerce, el endpoint no lleva "/" al inicio.
  const { data: orders, error, isLoading } = useWooCommerce("orders", {
    params,
    swrOptions: { refreshInterval: 60000 }, // refresca cada 60 segundos
  });

  // Función para traducir el estado del pedido al español
  const translateStatus = (status) => {
    switch (status) {
      case "processing":
        return "Procesando";
      case "completed":
        return "Completado";
      case "pending":
        return "Pendiente";
      default:
        return status;
    }
  };

  // Se intenta obtener el total de páginas; si no está disponible se asume 1.
  const totalPages =
    orders && orders.length > 0 && orders[0].meta
      ? orders[0].meta.totalPages || 1
      : 1;

  // Log para ver la respuesta
  useEffect(() => {
    console.log("Respuesta JSON de orders:", orders);
  }, [orders]);

  return (
    <DashboardLayout>
      <div className="p-6 text-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-6">Movements</h1>
        {/* Filtros */}
        <div className="mb-4">
          <label className="mr-4">
            <strong>Estado:</strong>{" "}
            <select
              className="bg-slate-600"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="processing">Procesando</option>
              <option value="completed">Completado</option>
            </select>
          </label>
          <label className="mr-4">
            <strong>Fecha desde:</strong>{" "}
            <input
              className="bg-slate-600"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <label className="mr-4">
            <strong>Fecha hasta:</strong>{" "}
            <input
              className="bg-slate-600"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 mt-4">
          {isLoading ? (
            <p>Cargando pedidos...</p>
          ) : error ? (
            <p className="text-red-400">Error: {error.message}</p>
          ) : orders && orders.length > 0 ? (
            <Table>
              <TableHeader className="bg-zinc-800 text-zinc-300 p-2">
                <TableRow>
                  <TableHead>Trader</TableHead>
                  <TableHead>ID de orden</TableHead>
                  <TableHead>Trader Email</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Challenge</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  // Extraer los nombres de los productos de line_items para el campo Challenge
                  let challengeValue = "";
                  if (order.line_items && Array.isArray(order.line_items)) {
                    challengeValue = order.line_items
                      .map((item) => item.name)
                      .join(", ");
                  }
                  return (
                    <TableRow key={order.id} className="border-b border-zinc-700">
                      <TableCell>{order.billing?.first_name} {order.billing?.last_name}</TableCell>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.billing?.email}</TableCell>
                      <TableCell>
                        {new Date(order.date_created).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {order.total} {order.currency}
                      </TableCell>
                      <TableCell>{challengeValue}</TableCell>
                      <TableCell className="text-green-400">
                        {translateStatus(order.status)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-zinc-500"
                  >
                    Sin Resultados
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </div>
        {/* Paginación */}
        <div className="mt-4 flex items-center">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="mr-4 p-2 border rounded"
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="ml-4 p-2 border rounded"
          >
            Siguiente
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PayoutsPage;

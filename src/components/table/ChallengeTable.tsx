"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

// 1. Definimos la interfaz de los items (con precio opcional)
export interface ChallengeItem {
  id: number;
  documentId?: string;
  name: string;
  precio?: number; // <-- se hace opcional
}

// 2. Definimos las props del componente
interface ChallengeTableProps {
  title: string;
  data: ChallengeItem[];
  pageSize: number;
  onCreate: () => void;
  onEdit: (item: ChallengeItem) => void;
  // 3. Nueva prop para indicar si mostramos el precio
  showPrice?: boolean;
}

export const ChallengeTable: React.FC<ChallengeTableProps> = ({
  title,
  data,
  pageSize,
  onCreate,
  onEdit,
  showPrice = false,
}) => {
  // Paginación local
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular total de páginas
  const totalPages = useMemo(() => {
    if (pageSize < 1) return 1;
    return Math.ceil(data.length / pageSize) || 1;
  }, [data, pageSize]);

  // Ajustar currentPage si supera totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Calcular el slice de datos a mostrar
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedData = data.slice(startIndex, endIndex);

  // Funciones de paginación
  function goFirstPage() {
    setCurrentPage(1);
  }
  function goPrevPage() {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }
  function goNextPage() {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }
  function goLastPage() {
    setCurrentPage(totalPages);
  }

  return (
    <div className="h-[410px] flex flex-col space-y-2">
      {/* Barra superior con Título y botón "Crear" */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </h2>
        <Button
          variant="secondary"
          className="bg-yellow-500 text-black hover:bg-yellow-400 px-3 py-1 text-sm"
          onClick={onCreate}
        >
          Crear
        </Button>
      </div>

      {/* Contenedor de la tabla con scroll interno */}
      <div className="flex-1 overflow-auto rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900">
        <Table className="w-full table-fixed rounded-md">
          {/* Encabezado fijo */}
          <TableHeader className="sticky top-0 z-10 bg-zinc-200 dark:bg-zinc-800">
            <TableRow className="text-center">
              <TableHead className="p-2">ID</TableHead>
              <TableHead className="p-2">Nombre</TableHead>

              {/* Mostrar la cabecera de "Precio" solo si showPrice es true */}
              {showPrice && (
                <TableHead className="p-2">Precio</TableHead>
              )}
              <TableHead className="p-2">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="p-2 text-center">
            {displayedData.length > 0 ? (
              displayedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  {showPrice && <TableCell>{item.precio}</TableCell>}
                  <TableCell>
                    <Button
                      variant="outline"
                      className="px-2 py-1 text-xs sm:text-sm"
                      onClick={() => onEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={showPrice ? 4 : 3}
                  className="h-24 text-center text-gray-500"
                >
                  Sin Resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación al fondo del contenedor */}
      <div className="flex items-center justify-end px-2 py-1 space-x-2">
        <span className="text-gray-500 text-xs sm:text-sm">
          Página {currentPage} de {totalPages}
        </span>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            className="px-2 py-1 text-xs sm:text-sm"
            onClick={goFirstPage}
            disabled={currentPage === 1}
          >
            «
          </Button>
          <Button
            variant="outline"
            className="px-2 py-1 text-xs sm:text-sm"
            onClick={goPrevPage}
            disabled={currentPage === 1}
          >
            ‹
          </Button>
          <Button
            variant="outline"
            className="px-2 py-1 text-xs sm:text-sm"
            onClick={goNextPage}
            disabled={currentPage === totalPages}
          >
            ›
          </Button>
          <Button
            variant="outline"
            className="px-2 py-1 text-xs sm:text-sm"
            onClick={goLastPage}
            disabled={currentPage === totalPages}
          >
            »
          </Button>
        </div>
      </div>
    </div>
  );
};

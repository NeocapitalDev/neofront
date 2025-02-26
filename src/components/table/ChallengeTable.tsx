"use client";
import React, { useState, useMemo } from "react";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ChallengeItem {
  id: number;
  documentId?: string;
  name: string;
}

interface ChallengeTableProps {
  title: string;
  data: ChallengeItem[];
  pageSize: number;          // Se recibe desde el padre
  onCreate: () => void;
  onEdit: (item: ChallengeItem) => void;
}

export const ChallengeTable: React.FC<ChallengeTableProps> = ({
  title,
  data,
  pageSize,
  onCreate,
  onEdit,
}) => {
  // Paginación local (solo currentPage)
  const [currentPage, setCurrentPage] = useState(1);

  // totalPages calculado
  const totalPages = useMemo(() => {
    if (pageSize < 1) return 1;
    return Math.ceil(data.length / pageSize) || 1;
  }, [data, pageSize]);

  // Ajustar currentPage si excede
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  // Slice de datos
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
    <div className="h-[500px] flex flex-col bg-zinc-900 border border-zinc-700 rounded">
      {/* Encabezado */}
      <CardHeader className="pb-1">
        <CardTitle className="text-yellow-400 flex justify-between items-center text-sm sm:text-base">
          {title}
          <Button
            variant="secondary"
            className="bg-yellow-500 text-black hover:bg-yellow-400 px-3 py-1 text-sm"
            onClick={onCreate}
          >
            Crear
          </Button>
        </CardTitle>
      </CardHeader>

      {/* Contenido con scroll interno */}
      <CardContent className="flex-1 overflow-y-auto space-y-2 px-2 py-2">
        {displayedData.length === 0 && (
          <p className="text-gray-400 text-sm">No hay datos para {title}.</p>
        )}

        {displayedData.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center border-b border-gray-700 py-1 text-sm"
          >
            <span>
              <span className="text-gray-400">ID: {item.id}</span> |{" "}
              <span className="text-white">{item.name}</span>
            </span>
            <Button
              variant="outline"
              className="px-2 py-1 text-sm"
              onClick={() => onEdit(item)}
            >
              Editar
            </Button>
          </div>
        ))}
      </CardContent>

      {/* Footer de paginación (sin Rows per page, pues es global) */}
      <div className="border-t border-gray-700 px-2 py-1 flex items-center justify-end">
        <div className="flex items-center space-x-2">
          <span className="text-gray-300 text-xs sm:text-sm">
            Page {currentPage} of {totalPages}
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
    </div>
  );
};

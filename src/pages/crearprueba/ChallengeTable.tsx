import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ChallengeItem {
  id: number;
  name: string;
}

interface ChallengeTableProps {
  title: string;
  data: ChallengeItem[];
  onCreate: () => void;
  onEdit: (item: ChallengeItem) => void;
}

export const ChallengeTable: React.FC<ChallengeTableProps> = ({
  title,
  data,
  onCreate,
  onEdit,
}) => {
  // Estado local para el número de registros a mostrar
  const [pageSize, setPageSize] = useState(5);

  // Slicing de datos según pageSize
  const displayedData = data.slice(0, pageSize);

  return (
    <Card className="bg-black text-white w-full">
      <CardHeader>
        <CardTitle className="text-yellow-400 flex justify-between items-center">
          {title}
          <Button
            variant="secondary"
            className="bg-yellow-500 text-black hover:bg-yellow-400"
            onClick={onCreate}
          >
            Crear
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {displayedData.length === 0 && (
          <p className="text-gray-400">No hay datos para {title}.</p>
        )}

        {displayedData.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center border-b border-gray-700 py-2"
          >
            <span>
              <span className="text-gray-400">ID: {item.id}</span> |{" "}
              <span className="text-white">{item.name}</span>
            </span>
            <Button
              variant="outline"
              onClick={() => onEdit(item)}
            >
              Editar
            </Button>
          </div>
        ))}

        {/* Desplegable para seleccionar cuántos registros mostrar */}
        <div className="mt-4 flex items-center gap-2">
          <label htmlFor="pageSizeSelect" className="text-gray-300">
            Mostrar:
          </label>
          <select
            id="pageSizeSelect"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-gray-800 border border-gray-600 px-10 text-white p-1 rounded"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-gray-400">registros</span>
        </div>
      </CardContent>
    </Card>
  );
};

"use client";

import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTableViewOptions } from "./DataTableViewOptions";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    // Contenedor principal en una sola línea (sin flex-wrap)
    <div className="flex items-center w-full space-x-2 overflow-hidden">
      {/* 
        Sección de inputs con flex-shrink y min-w-0 para que puedan reducir 
        el ancho en pantallas pequeñas sin romper a otra línea 
      */}
      <div className="flex-1 flex items-center space-x-2 min-w-0 overflow-hidden">
        <input
          placeholder="Filtrar por Nombre ..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="
            flex-shrink min-w-0 w-auto max-w-[200px]
            rounded-md border border-gray-700 bg-transparent
            text-white placeholder-gray-500
            px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]
            focus:border-[var(--app-primary)] transition
          "
        />

        <input
          placeholder="Filtrar por Subcat ..."
          value={
            (table
              .getColumn("challenge_subcategories")
              ?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table
              .getColumn("challenge_subcategories")
              ?.setFilterValue(event.target.value)
          }
          className="
            flex-shrink min-w-0 w-auto max-w-[200px]
            rounded-md border border-gray-700 bg-transparent
            text-white placeholder-gray-500
            px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]
            focus:border-[var(--app-primary)] transition
          "
        />

        <input
          placeholder="Filtrar por stage ..."
          value={
            (table.getColumn("challenge_stages")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) => {
            const value = event.target.value;
            table
              .getColumn("challenge_stages")
              ?.setFilterValue(value === "" ? undefined : value);
          }}
          className="
            flex-shrink min-w-0 w-auto max-w-[200px]
            rounded-md border border-gray-700 bg-transparent
            text-white placeholder-gray-500
            px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]
            focus:border-[var(--app-primary)] transition
          "
        />

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Opciones de vista, alineadas a la derecha */}
      <div className="z-10">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}

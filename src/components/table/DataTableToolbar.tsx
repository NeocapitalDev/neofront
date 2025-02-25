"use client";

import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./DataTableViewOptions";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <input
          placeholder="Nombre"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="py-2 px-4 rounded-md border border-gray-700 bg-transparent text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)] transition w-[150px] lg:w-[250px]"
        />

        <input
          placeholder="Subcategoria"
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
          className="py-2 px-4 rounded-md border border-gray-700 bg-transparent text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)] transition w-[150px] lg:w-[250px]"
        />
        <input
          placeholder="Etapa"
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
          className="py-2 px-4 rounded-md border border-gray-700 bg-transparent text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)] transition w-[150px] lg:w-[250px]"
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
      <div className="z-10">
        <DataTableViewOptions table={table} />
      </div>{" "}
    </div>
  );
}

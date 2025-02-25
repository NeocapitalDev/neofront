"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import { DetailModal } from "./DetailModal";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useState } from "react";
import { StepDetails } from "./StepDetails";
export type Challenge = {
  id: number;
  name: string;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  challenge_subcategories: {
    id: number;
    name: string;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  }[];
  challenge_stages: {
    id: number;
    name: string;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  }[];
};

export const Columns: ColumnDef<Challenge>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate") ||
          false
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("name")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "challenge_subcategories",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Subcategories" />
    ),
    cell: ({ row }) => {
      const subcategories = row.getValue(
        "challenge_subcategories"
      ) as Challenge["challenge_subcategories"];
      return (
        <div className="flex flex-wrap gap-1">
          {subcategories.map((subcategory) => (
            <Badge key={subcategory.id} variant="secondary">
              {subcategory.name}
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const subcategories = row.getValue(
        "challenge_subcategories"
      ) as Challenge["challenge_subcategories"];
      return subcategories.some((subcategory) =>
        subcategory.name.toLowerCase().includes(value.toLowerCase())
      );
    },
  },
  {
    accessorKey: "challenge_stages",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stages" />
    ),
    cell: ({ row }) => {
      const stages = row.getValue(
        "challenge_stages"
      ) as Challenge["challenge_stages"];
      return (
        <div className="flex flex-wrap gap-1">
          {stages.map((stage) => (
            <Badge key={stage.id} variant="outline">
              {stage.name}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const data = row.original;
      const step = {
        name: data.name,
        subcategories: data.challenge_subcategories,
        stages: data.challenge_stages,
      };
      const [isModalOpen, setIsModalOpen] = useState(false);

      return (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsModalOpen(true)}
          >
            <Eye className="h-4 w-4" />
          </Button>

          <DetailModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={`Step Details: ${step.name}`}
            maxWidth="xl"
          >
            <StepDetails step={step} />
          </DetailModal>
        </>
      );
    },
  },
];

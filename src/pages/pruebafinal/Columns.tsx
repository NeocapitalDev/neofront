"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import { DetailModal } from "./DetailModal";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useState } from "react";
import { PropDetails } from "./PropDetails";


export type ChallengeRelationsStages = {
  id: number;
  documentId: string;
  minimumTradingDays: number | null;
  maximumDailyLoss: number;
  maximumLoss: number;
  profitTarget: number | null;
  leverage: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  challenge_subcategory: {
    id: number;
    documentId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
  challenge_products: {
    id: number;
    documentId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  }[];
};

export const Columns: ColumnDef<ChallengeRelationsStages>[] = [
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


  //  {
  //    accessorKey: "name",
  //    header: ({ column }) => (
  //      <DataTableColumnHeader column={column} title="Name" />
  //    ),
  //    cell: ({ row }) => {
  //      return (
  //        <div className="flex space-x-2">
  //          <span className="max-w-[500px] truncate font-medium">
  //            {row.getValue("name")}
  //          </span>
  //        </div>
  //      );
  //    },
  //  },


  {
    accessorKey: "challenge_subcategory",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="challenge_subcategory" />
    ),
    cell: ({ row }) => {
      const subcategories = row.getValue(
        "challenge_subcategory"
      ) as ChallengeRelationsStages["challenge_subcategory"];
      return (
        <div className="flex flex-wrap gap-1">
            <Badge key={subcategories.id} variant="secondary">
              {subcategories.name}
            </Badge>
        </div>
      );
    },
      filterFn: (row, id, value) => {
        const subcategories = row.getValue(
        "challenge_subcategory"
        ) as ChallengeRelationsStages["challenge_subcategory"];
        return subcategories.name.toLowerCase().includes(value.toLowerCase());
      },
  },



  {
    accessorKey: "challenge_products",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Productos" />
    ),
    cell: ({ row }) => {
      const products = row.getValue(
        "challenge_products"
      ) as ChallengeRelationsStages["challenge_products"];
      return (
        <div className="flex flex-wrap gap-1">
          {products.map((product) => (
            <Badge key={product.id} variant="secondary">
              {product.name}
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const products = row.getValue(
        "challenge_products"
      ) as ChallengeRelationsStages["challenge_products"];
      return products.some((product) =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
    },
  },


   {
     id: "actions",
     header: "Actions",
     cell: ({ row }) => {
       const data = row.original;
       const prop = {
        minimumTradingDays: data.minimumTradingDays,
        maximumDailyLoss: data.maximumDailyLoss,
        maximumLoss: data.maximumLoss,
        profitTarget: data.profitTarget,
        leverage: data.leverage,

        challenge_subcategory: data.challenge_subcategory,
        challenge_products: data.challenge_products,
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
             title={`Prop Details: ${prop}`}
             maxWidth="xl"
           >
             <PropDetails prop={prop} />
           </DetailModal>
         </>
       );
     },
   },


];

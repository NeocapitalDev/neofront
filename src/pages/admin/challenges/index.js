// src/pages/admin/challenges/index.js
"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
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
import { Button } from "@/components/ui/button";
import DashboardLayout from "..";
import { useRouter } from "next/router";
import { useStrapiData } from "@/services/strapiServiceJWT";

const tableColumns = [
  { accessorKey: "traderAccount", header: "Trader Account" },
  { accessorKey: "traderEmail", header: "Trader Email" },
  { accessorKey: "state", header: "State" },
  { accessorKey: "step", header: "Step" },
  { accessorKey: "equity", header: "Equity" },
  { accessorKey: "brokerGroup", header: "Broker Group" },
  { accessorKey: "actions", header: "Actions" },
];

export default function ChallengesTable() {
  const { data: session } = useSession();

  const route = session?.jwt ? "challenges?populate=*" : null;
  const { data, error, isLoading } = useStrapiData(route, session?.jwt);

  const formatCurrency = (amount) =>
    amount
      ? `$${parseFloat(amount).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`
      : "N/A";

  const translateResult = (result) => {
    switch (result) {
      case "init":
        return "Iniciado";
      case "approved":
        return "Approved";
      case "disapproved":
        return "Disapproved";
      case "progress":
        return "On Challenge";
      case "withdrawal":
        return "Withdrawal";
      default:
        return "N/A";
    }
  };

  const router = useRouter();

  const handleButtonClick = (documentId) => {
    router.push(`/admin/challenges/${documentId}`);
  };

  const filteredData = useMemo(() => {
    if (!data || !data.data) return [];

    return data.data.map((challenge) => ({
      traderAccount: challenge.broker_account?.login ?? "N/A",
      traderEmail: challenge.user?.email ?? "N/A",
      state: (
        <span
          className={
            challenge.result === "init"
              ? "text-blue-500"
              : challenge.result === "approved"
              ? "text-green-500"
              : challenge.result === "disapproved"
              ? "text-red-500"
              : challenge.result === "progress"
              ? "text-yellow-500"
              : challenge.result === "withdrawal"
              ? "text-purple-500"
              : "text-gray-500"
          }
        >
          {translateResult(challenge.result)}
        </span>
      ),
      step: `Phase ${challenge.phase ?? "N/A"}`,
      equity: formatCurrency(challenge.broker_account?.balance),
      brokerGroup: challenge.broker_account?.server ?? "N/A",
      actions: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleButtonClick(challenge.documentId)}
        >
          Ver Detalles
        </Button>
      ),
    }));
  }, [data]);

  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <DashboardLayout>
      <div className="p-6 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 rounded-lg shadow-lg">
        <div className="border border-zinc-300 dark:border-zinc-700 rounded-md overflow-hidden mt-4">
          <Table>
            <TableHeader className="bg-zinc-200 dark:bg-zinc-800">
              <TableRow>
                {tableColumns.map((column) => (
                  <TableHead
                    key={column.accessorKey}
                    className="text-zinc-900 dark:text-zinc-200 border-b border-zinc-300 dark:border-zinc-700"
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((challenge, index) => (
                  <TableRow
                    key={index}
                    className="border-b border-zinc-300 dark:border-zinc-700"
                  >
                    <TableCell>{challenge.traderAccount}</TableCell>
                    <TableCell>{challenge.traderEmail}</TableCell>
                    <TableCell>{challenge.state}</TableCell>
                    <TableCell>{challenge.step}</TableCell>
                    <TableCell>{challenge.equity}</TableCell>
                    <TableCell>{challenge.brokerGroup}</TableCell>
                    <TableCell>{challenge.actions}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className="text-center text-zinc-500 py-6"
                  >
                    No data found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
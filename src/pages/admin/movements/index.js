"use client";

import React, { useState } from "react";
import DashboardLayout from "..";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

const movementsData = [
  {
    account: "1574530394",
    email: "noah.jones@proprietaryfirms.tech",
    date: "18 Sep 24",
    amount: "$0.00",
    challenge: "100K Plus (FUNDED)",
    type: "Payment",
    status: "Confirmed",
  },
  {
    account: "1574530392",
    email: "john.doe@proprietaryfirms.tech",
    date: "18 Sep 24",
    amount: "$0.00",
    challenge: "100K Plus (FUNDED)",
    type: "Payment",
    status: "Confirmed",
  },
  {
    account: "157453091",
    email: "john.doe@proprietaryfirms.tech",
    date: "18 Sep 24",
    amount: "$0.00",
    challenge: "100K Plus (FUNDED)",
    type: "Payment",
    status: "Confirmed",
  },
  {
    account: "1574529481",
    email: "luciana.martinez@proprietaryfirms.tech",
    date: "16 Sep 24",
    amount: "$9,000.00",
    challenge: "200K Plus (FUNDED)",
    type: "Withdraw",
    status: "Rejected",
  },
  {
    account: "1574530037",
    email: "luciana.martinez@proprietaryfirms.tech",
    date: "13 Sep 24",
    amount: "$0.00",
    challenge: "200K Plus (FUNDED)",
    type: "Payment",
    status: "Confirmed",
  },
  {
    account: "1574529481",
    email: "luciana.martinez@proprietaryfirms.tech",
    date: "13 Sep 24",
    amount: "$200.00",
    challenge: "200K Plus (FUNDED)",
    type: "Payment",
    status: "Confirmed",
  },
  {
    account: "1574528844",
    email: "luciana.martinez@proprietaryfirms.tech",
    date: "11 Sep 24",
    amount: "$100.00",
    challenge: "100K Plus (FAILED)",
    type: "Payment",
    status: "Confirmed",
  },
  {
    account: "1574528447",
    email: "luciana.martinez@proprietaryfirms.tech",
    date: "10 Sep 24",
    amount: "$100.00",
    challenge: "100K Plus (ON_CHALLENGE)",
    type: "Payment",
    status: "Confirmed",
  },
];

export default function MovementsTable() {
  return (
    <DashboardLayout>
      <div className="p-6  text-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-6">Movements</h1>
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mt-4">
          <Table>
            <TableHeader className="bg-gray-800 text-gray-300">
              <TableRow>
                <TableHead>Trader Account</TableHead>
                <TableHead>Trader Email</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Challenge</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movementsData.map((movement, index) => (
                <TableRow key={index} className="border-b border-gray-700">
                  <TableCell>{movement.account}</TableCell>
                  <TableCell>{movement.email}</TableCell>
                  <TableCell>{movement.date}</TableCell>
                  <TableCell>{movement.amount}</TableCell>
                  <TableCell>{movement.challenge}</TableCell>
                  <TableCell className={movement.type === "Withdraw" ? "text-blue-400" : "text-green-400"}>{movement.type}</TableCell>
                  <TableCell className={movement.status === "Rejected" ? "text-red-400" : "text-green-400"}>{movement.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
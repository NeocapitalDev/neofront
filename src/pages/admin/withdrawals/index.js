"use client";

import { useState, useEffect } from "react";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import DashboardLayout from "..";

const withdrawalsData = [
  { id: "1", user: "John Doe", amount: 100, status: "Completed", date: "2025-01-28" },
  { id: "2", user: "Jane Smith", amount: 200, status: "Pending", date: "2025-01-29" },
  { id: "3", user: "Mike Ross", amount: 150, status: "Rejected", date: "2025-01-27" },
];

export default function WithdrawalsTable() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [filteredData, setFilteredData] = useState(withdrawalsData);

  const statuses = ["All", "Completed", "Pending", "Rejected"];

  useEffect(() => {
    const filtered = withdrawalsData.filter(
      (item) =>
        (search === "" || item.user.toLowerCase().includes(search.toLowerCase())) &&
        (selectedStatus === "All" || item.status === selectedStatus)
    );
    setFilteredData(filtered);
  }, [search, selectedStatus]);

  return (
    <DashboardLayout>
      <div className="p-8 bg-zinc-900 text-zinc-200 rounded-lg shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          {/* Search Bar */}
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/3 bg-zinc-800 text-zinc-200 border-zinc-700"
          />

          {/* Dropdown for Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-zinc-800 hover:bg-zinc-600 text-zinc-200 border-zinc-700">
                {selectedStatus} ▼
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-800 text-zinc-200">
              {statuses.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`${
                    selectedStatus === status ? "bg-zinc-700" : ""
                  } hover:bg-zinc-700`}
                >
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        <div className="rounded-md border border-zinc-700 overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-800">
              <TableRow>
                <TableHead className="text-zinc-200 border-b border-zinc-700">User</TableHead>
                <TableHead className="text-zinc-200 border-b border-zinc-700">Amount</TableHead>
                <TableHead className="text-zinc-200 border-b border-zinc-700">Status</TableHead>
                <TableHead className="text-zinc-200 border-b border-zinc-700">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="border-b border-zinc-700">
                    <TableCell className="text-zinc-200">{item.user}</TableCell>
                    <TableCell className="text-zinc-200">${item.amount}</TableCell>
                    <TableCell className="text-zinc-200">{item.status}</TableCell>
                    <TableCell className="text-zinc-200">{item.date}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-zinc-500 py-6">
                    No results found. Try searching or filtering for a different term.
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

import { useState } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";

const Input = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="px-4 py-2 border rounded-md w-full dark:bg-zinc-700 dark:text-white"
  />
);

const Button = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition ${className}`}
  >
    {children}
  </button>
);

export function WithdrawalsTable({ data }) {
  const [filter, setFilter] = useState({ status: "", amount: "" });
  const [filteredData, setFilteredData] = useState(data);

  const applyFilters = (status) => {
    const newFilteredData = data.filter((item) =>
      (status === "" || item.status === status) &&
      (filter.amount === "" || item.amount.toString().includes(filter.amount))
    );
    setFilteredData(newFilteredData);
    setFilter({ ...filter, status });
  };

  return (
    <div className="p-8 mt-5 bg-white dark:bg-zinc-800 rounded-lg shadow-lg space-y-8">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex space-x-4">
          {["Pending", "Completed", "Rejected"].map((status) => (
            <Button 
              key={status} 
              onClick={() => applyFilters(status)} 
              className={filter.status === status ? "bg-gray-800 text-white" : "bg-gray-200 dark:bg-gray-700"}
            >
              {status}
            </Button>
          ))}
        </div>
        <Input
          placeholder="Filtrar por monto"
          value={filter.amount}
          onChange={(e) => setFilter({ ...filter, amount: e.target.value })}
        />
        <Button onClick={() => applyFilters("")} className="bg-red-500 text-white">Reset</Button>
      </div>
      <div className="overflow-x-auto">
        <Table className="w-full border-collapse rounded-lg overflow-hidden">
          <TableHead className="bg-gray-200 dark:bg-gray-700 text-left">
            <TableRow>
              <TableCell className="py-3 px-28 font-semibold text-center">Usuario</TableCell>
              <TableCell className="py-3 px-28 font-semibold text-center">Estado</TableCell>
              <TableCell className="py-3 px-28 font-semibold text-center">Monto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((item, index) => (
              <TableRow key={index} className="hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                <TableCell className="py-6 px-28 text-center">{item.user}</TableCell>
                <TableCell className="py-6 px-28 font-medium capitalize text-center">{item.status}</TableCell>
                <TableCell className="py-6 px-28 font-bold text-green-500 dark:text-green-400 text-center">${item.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

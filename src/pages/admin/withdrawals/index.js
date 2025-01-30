import { useState, useEffect } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import DashboardLayout from "..";

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

export default function WithdrawalsTable({ data = [] }) {
  const [filter, setFilter] = useState({ status: "", amount: "" });
  const [filteredData, setFilteredData] = useState(data);

  // Sincronizar el estado inicial
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const applyFilters = (status) => {
    const newFilteredData = data.filter(
      (item) =>
        (status === "" || item.status === status) &&
        (filter.amount === "" || item.amount.toString().includes(filter.amount))
    );
    setFilteredData(newFilteredData);
    setFilter({ ...filter, status });
  };

  return (
    <DashboardLayout>
      <div className="p-8 mt-5 bg-white dark:bg-zinc-800 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
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
          <Button onClick={() => applyFilters("")} className="bg-red-500 text-white">
            Reset
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed rounded-lg overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="py-4 px-6 font-semibold text-center w-1/3">Usuario</th>
                <th className="py-4 px-6 font-semibold text-center w-1/3">Estado</th>
                <th className="py-4 px-6 font-semibold text-center w-1/3">Monto</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-100 dark:hover:bg-gray-600 transition divide-x divide-gray-200 dark:divide-gray-700"
                  >
                    <td className="py-4 px-6 text-center w-1/3 truncate">{item.user}</td>
                    <td className="py-4 px-6 font-medium capitalize text-center w-1/3 truncate">{item.status}</td>
                    <td className="py-4 px-6 font-bold text-green-500 dark:text-green-400 text-center w-1/3 truncate">
                      ${item.amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-4 px-6 text-center">
                    No hay datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

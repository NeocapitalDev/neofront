import { useState, useEffect } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import DashboardLayout from "..";

const Input = ({ value, onChange, placeholder }) => (
    <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="px-4 py-2 border rounded-md w-1/3 dark:bg-zinc-700 dark:text-white"
    />
);

const Dropdown = ({ options, selected, onChange, placeholder }) => (
    <div className="relative">
        <select
            value={selected}
            onChange={onChange}
            className="block w-full px-4 py-2 border rounded-md dark:bg-zinc-700 dark:text-white"
        >
            <option value="" disabled>
                {placeholder}
            </option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

const Button = ({ children, onClick, className = "" }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition ${className}`}
    >
        {children}
    </button>
);

export default function UsersTable({ data = [] }) {
    const [filter, setFilter] = useState({ username: "", blocked: "", isVerified: "" });
    const [filteredData, setFilteredData] = useState(data);

    useEffect(() => {
        setFilteredData(data);
    }, [data]);

    const applyFilters = () => {
        const newFilteredData = data.filter(
            (item) =>
                (filter.username === "" || item.username.includes(filter.username)) &&
                (filter.blocked === "" || item.blocked.toString() === filter.blocked) &&
                (filter.isVerified === "" || item.isVerified.toString() === filter.isVerified)
        );
        setFilteredData(newFilteredData);
    };

    return (
        <DashboardLayout>
            <div className="p-8 mt-5 bg-white dark:bg-zinc-800 rounded-lg shadow-lg">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                    <Input
                        placeholder="Filtrar por nombre de usuario"
                        value={filter.username}
                        onChange={(e) => setFilter({ ...filter, username: e.target.value })}
                    />
                    <Dropdown
                        options={[
                            { label: "Bloqueado", value: "true" },
                            { label: "No Bloqueado", value: "false" },
                        ]}
                        selected={filter.blocked}
                        onChange={(e) => setFilter({ ...filter, blocked: e.target.value })}
                        placeholder="Filtrar por bloqueado"
                    />
                    <Dropdown
                        options={[
                            { label: "Verificado", value: "true" },
                            { label: "No Verificado", value: "false" },
                        ]}
                        selected={filter.isVerified}
                        onChange={(e) => setFilter({ ...filter, isVerified: e.target.value })}
                        placeholder="Filtrar por verificado"
                    />
                    <Button onClick={applyFilters} className="bg-green-500">
                        Fitrar
                    </Button>
                    <Button
                        onClick={() => setFilter({ username: "", blocked: "", isVerified: "" })}
                        className="bg-red-500"
                    >
                        Reset
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse table-fixed rounded-lg overflow-hidden">
                        <thead className="bg-gray-200 dark:bg-gray-700">
                            <tr>
                                <th className="py-4 px-6 font-semibold text-center">Nombre de Usuario</th>
                                <th className="py-4 px-6 font-semibold text-center">Bloqueado</th>
                                <th className="py-4 px-6 font-semibold text-center">Verificado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-100 dark:hover:bg-gray-600 transition divide-x divide-gray-200 dark:divide-gray-700"
                                    >
                                        <td className="py-4 px-6 text-center truncate">{item.username}</td>
                                        <td className="py-4 px-6 text-center truncate">{item.blocked ? "Sí" : "No"}</td>
                                        <td className="py-4 px-6 text-center truncate">{item.isVerified ? "Sí" : "No"}</td>
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

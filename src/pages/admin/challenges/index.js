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

export default function ChallengesTable({ data = [] }) {
    const [filter, setFilter] = useState({ user: "", login: "", step: "" });
    const [filteredData, setFilteredData] = useState(data);

    useEffect(() => {
        setFilteredData(data);
    }, [data]);

    const applyFilters = () => {
        const newFilteredData = data.filter(
            (item) =>
                (filter.user === "" || item.user.includes(filter.user)) &&
                (filter.login === "" || item.login.includes(filter.login)) &&
                (filter.step === "" || item.step.includes(filter.step))
        );
        setFilteredData(newFilteredData);
    };

    return (
        <DashboardLayout>
            <div className="p-8 mt-5 bg-white dark:bg-zinc-800 rounded-lg shadow-lg">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                    <Input
                        placeholder="Filtrar por usuario"
                        value={filter.user}
                        onChange={(e) => setFilter({ ...filter, user: e.target.value })}
                    />
                    <Input
                        placeholder="Filtrar por login"
                        value={filter.login}
                        onChange={(e) => setFilter({ ...filter, login: e.target.value })}
                    />
                    <Input
                        placeholder="Filtrar por paso"
                        value={filter.step}
                        onChange={(e) => setFilter({ ...filter, step: e.target.value })}
                    />
                    <Button onClick={applyFilters} className="bg-green-500">
                        Filtrar
                    </Button>
                    <Button
                        onClick={() => setFilter({ user: "", login: "", step: "" })}
                        className="bg-red-500"
                    >
                        Reset
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse table-fixed rounded-lg overflow-hidden">
                        <thead className="bg-gray-200 dark:bg-gray-700">
                            <tr>
                                <th className="py-4 px-6 font-semibold text-center">Usuario</th>
                                <th className="py-4 px-6 font-semibold text-center">Login</th>
                                <th className="py-4 px-6 font-semibold text-center">Paso</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-100 dark:hover:bg-gray-600 transition divide-x divide-gray-200 dark:divide-gray-700"
                                    >
                                        <td className="py-4 px-6 text-center truncate">{item.user}</td>
                                        <td className="py-4 px-6 text-center truncate">{item.login}</td>
                                        <td className="py-4 px-6 text-center truncate">{item.step}</td>
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

"use client";

import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export default function Component({ data }) {
    // Función para formatear la fecha a dd/mm/aaaa
    const formatDate = (dateString) => {
        if (!dateString || dateString === "-") return "-";
    
        let date;
        
        if (typeof dateString === "number") {
            date = new Date(dateString);
        } else if (typeof dateString === "string") {
            date = new Date(dateString + "T00:00:00Z"); // Ajuste de zona horaria
        } else {
            return "-";
        }
    
        if (isNaN(date.getTime())) return "-";
    
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit"
        });
    };
    
    return (
        <div className=" dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">

            <div className="p-2 overflow-x-auto dark:bg-black bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead>Ganancias</TableHead>
                            <TableHead>Lotes</TableHead>
                            <TableHead>Pips</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.dailyGrowth?.length > 0 ? (
                            data.dailyGrowth.map((day, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{formatDate(day.date)}</TableCell>
                                    <TableCell>${(day.balance ?? 0).toFixed(2)}</TableCell>
                                    <TableCell className={day.gains > 0 ? "text-green-500" : "text-red-500"}>
                                        {(day.gains ?? 0).toFixed(2)}%
                                    </TableCell>
                                    <TableCell>{(day.lots ?? 0).toFixed(1)}</TableCell>
                                    <TableCell>{(day.pips ?? 0).toFixed(2)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    No hay datos para mostrar.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

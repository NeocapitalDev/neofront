"use client";

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
            year: "numeric"
        })+ " (UTC)";
    };
    
    
    return (
        <div className="border-gray-200 border-2 dark:border-zinc-800 dark:shadow-black p-3 bg-white rounded-md shadow-md dark:bg-zinc-800 dark:text-white">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-300 dark:border-zinc-700">
                        <th className="py-2 px-4 font-medium">Fecha</th>
                        <th className="py-2 px-4 font-medium">Balance</th>
                        <th className="py-2 px-4 font-medium">Ganancias</th>
                        <th className="py-2 px-4 font-medium">Lotes</th>
                        <th className="py-2 px-4 font-medium">Pips</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.dailyGrowth?.length > 0 ? (
                        data.dailyGrowth.map((day, index) => (
                            <tr key={index} className="border-b border-gray-200 dark:border-zinc-700">
                                <td className="py-2 px-4">{formatDate(day.date)}</td>
                                <td className="py-2 px-4">${(day.balance ?? 0).toFixed(2)}</td>
                                <td className={`py-2 px-4 ${day.gains > 0 ? "text-green-500" : "text-red-500"}`}>
                                    {(day.gains ?? 0).toFixed(2)}%
                                </td>
                                <td className="py-2 px-4">{(day.lots ?? 0).toFixed(1)}</td>
                                <td className="py-2 px-4">{(day.pips ?? 0).toFixed(2)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="text-center py-4">
                                No hay datos disponibles
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

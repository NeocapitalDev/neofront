import { useState } from 'react';

export default function MetrixInfo() {
    const data = [
        { label: "Estado", value: "Listo" },
        { label: "Inicio", value: "-" },
        { label: "Fin", value: "-" },
        { label: "Tamaño de cuenta", value: "$50,000.00" },
        { label: "Plataforma", value: "MT4"},
        { label: "Última actualización", value: "-" },
    ];

    return (
        <>
            <p className="text-lg font-semibold mb-4">Estadísticas</p>
            <div className="px-3 h-auto max-w-full border-2 border-gray-100 dark:border-zinc-800 dark:shadow-black bg-white rounded-md shadow-md dark:bg-zinc-800 dark:text-white">
                <table className="w-full border-collapse text-sm">
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index} className="border-b dark:border-zinc-500 border-zinc-300 last:border-none">
                                <td className="py-4 font-medium dark:text-white text-black">{item.label}</td>
                                <td className="text-right">
                                    {item.isLink ? (
                                        <a href="#" className="text-blue-400 hover:underline">
                                            {item.value}
                                        </a>
                                    ) : (
                                        item.value
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

import { useState } from 'react';

export default function MetrixInfo() {
    const data = [
        { label: "Estado", value: "Listo" },
        { label: "Iniciar", value: "-" },
        { label: "Fin", value: "-" },
        { label: "Tamaño de cuenta", value: "$50,000.00" },
        { label: "Tipo de Cuenta", value: "FTMO" },
        { label: "Plataforma (MT4)", value: "Descargar", isLink: true },
        { label: "Última actualización", value: "-" },
    ];

    return (
        <div className="   border-gray-200  border-2   dark:border-zinc-800 dark:shadow-black   p-3  bg-white rounded-md shadow-md dark:bg-zinc-800 dark:text-white ">
            <table className="w-full border-collapse text-sm">
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index} className="border-b last:border-none">
                            <td className="py-1 font-medium dark:text-white  text-gray-500">{item.label}</td>
                            <td className="py-1 text-right">
                                {item.isLink ? (
                                    <a
                                        href="#"
                                        className="text-blue-400 hover:underline"
                                    >
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
    );
}

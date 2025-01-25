import React from 'react';
import Layout from '../../components/layout/dashboard';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

const data = [
    {
        challenge: "FTMO Challenge 1",
        dates: "01/01/2025 - 01/31/2025",
        amount: "$200",
        order: "#12345",
        account: "Cuenta 1",
        status: "Pagado",
        documents: "Ver factura",
    },
    {
        challenge: "FTMO Challenge 2",
        dates: "02/01/2025 - 02/28/2025",
        amount: "$150",
        order: "#12346",
        account: "Cuenta 2",
        status: "Pendiente",
        documents: "Descargar",
    },
    {
        challenge: "FTMO Challenge 3",
        dates: "03/01/2025 - 03/31/2025",
        amount: "$300",
        order: "#12347",
        account: "Cuenta 3",
        status: "Cancelado",
        documents: "Sin documentos",
    },
];


const Billing = () => {
    return (
        <Layout title="Billing">
            <div className="p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                <div className="flex justify-between items-center ">
                    <div className="flex items-center space-x-2">
                        <DocumentTextIcon className="w-6 h-6 text-gray-600 dark:text-gray-200" />
                        <h1 className="text-xl font-semibold">Facturación</h1>
                    </div>
                </div>
            </div>

            <div className="mt-6 overflow-x-auto dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                <table className="w-full table-auto text-left border-collapse">
                    <thead className="text-zinc-800 dark:text-white text-sm font-semibold border-b border-gray-200 dark:border-zinc-600">
                        <tr>
                            <th className="p-4">Challenge</th>
                            <th className="p-4">Fechas</th>
                            <th className="p-4">Monto</th>
                            <th className="p-4">Orden</th>
                            <th className="p-4">Cuenta</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4">Factura</th>
                        </tr>
                    </thead>

                    <tbody>
                        {(data.map((row, index) => (
                                <tr
                                    key={index}
                                    className={`${index === data.length - 1 ? '' : 'border-b dark:border-zinc-700'
                                        } transition`}
                                >
                                    <td className="p-4 text-sm font-medium text-gray-800 dark:text-white">{row.challenge}</td>
                                    <td className="p-4 text-sm text-gray-600 dark:text-white ">{row.dates}</td>
                                    <td className="p-4 text-sm text-gray-600 dark:text-white">{row.amount}</td>
                                    <td className="p-4 text-sm text-gray-600 dark:text-white">{row.order}</td>
                                    <td className="p-4 text-sm text-gray-600 dark:text-white">{row.account}</td>
                                    <td className="p-4 text-xs font-semibold text-white">
                                        <span
                                            className={`inline-block rounded-lg px-2 py-1 ${row.status === "Pagado"
                                                ? "bg-green-600 "
                                                : row.status === "Pendiente"
                                                    ? "bg-yellow-600 "
                                                    : "bg-red-600 "
                                                }`}
                                        >
                                            {row.status}
                                        </span>
                                    </td>

                                    <td className="p-4 text-xs font-semibold text-white">
                                        <button
                                            className="inline-block px-4 py-2 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                                        >
                                            {row.documents}
                                        </button>
                                    </td>


                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>


        </Layout>
    );
};

export default Billing;

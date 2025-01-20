import React from 'react';
import Layout from '../../components/layout/dashboard';
import Icono from '../../components/layout/dashboard';
import { FunnelIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
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
        documents: "Descargar documentos",
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
            <div className="p-0">
                <div className="flex bg-white p-5 justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <DocumentTextIcon className="w-6 h-6 text-gray-600" />
                        <h1 className="text-xl font-semibold">Facturación</h1>
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg border border-gray-300 hover:bg-gray-200">
                        <FunnelIcon className="w-6 h-6 text-gray-600" />
                        <span>Filtro</span>
                    </button>
                </div>

                <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
                    <table className="w-full table-auto text-left border-collapse">
                        <thead className="border-b">
                            <tr>
                                <th className="px-4 py-3 text-zinc-800 font-semibold">FTMO Challenge</th>
                                <th className="px-4 py-3 text-zinc-800 font-semibold">Fechas</th>
                                <th className="px-4 py-3 text-zinc-800 font-semibold">Monto a pagar</th>
                                <th className="px-4 py-3 text-zinc-800 font-semibold">Orden</th>
                                <th className="px-4 py-3 text-zinc-800 font-semibold">Cuenta</th>
                                <th className="px-4 py-3 text-zinc-800 font-semibold">Estado</th>
                                <th className="px-4 py-3 text-zinc-800 font-semibold">Factura y Documentos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
    <td colSpan="7" className="px-4 py-6 text-center">
        <div className="flex flex-col items-center justify-center h-[300px]">
            <Image 
                src="/images/billing/icono.svg" 
                width={300}
                height={300}
                className="w-[300px] h-[300px] relative -mt-20"
                alt="No data icon"
            />
            <p className="-mt-20 text-gray-500 relative">No hay órdenes ni transacciones disponibles</p>
        </div>
    </td>
</tr>

                            ) : (
                                data.map((row, index) => (
                                    <tr 
                                        key={index} 
                                        className={`border-b ${
                                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                        } hover:bg-gray-100 transition`}
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{row.challenge}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{row.dates}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{row.amount}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{row.order}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{row.account}</td>
                                        <td 
                                            className={`px-4 py-3 text-sm font-semibold ${
                                                row.status === "Pagado"
                                                    ? "text-green-600"
                                                    : row.status === "Pendiente"
                                                    ? "text-yellow-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {row.status}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-blue-600 underline cursor-pointer hover:text-blue-800">
                                            {row.documents}
                                        </td>
                                    </tr>
                                ))
                                
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Billing;

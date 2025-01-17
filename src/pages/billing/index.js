import React from 'react';
import Layout from '../../components/layout/dashboard';
import { FunnelIcon,DocumentTextIcon } from '@heroicons/react/24/outline';

const Billing = () => {
    return (
        <Layout title="Billing">
            <div className="p-6">
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
                        <thead className=" border-b">
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
                            <tr>
                                <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="w-8 h-8 text-gray-300"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M8.25 6.75h7.5m-7.5 3h7.5m-7.5 3h7.5M5.25 6.75h.008v.008H5.25V6.75zm0 3h.008v.008H5.25v-.008zm0 3h.008v.008H5.25v-.008zm0 3h.008v.008H5.25v-.008zm0 3h.008v.008H5.25v-.008z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="mt-4 text-sm">No hay órdenes ni transacciones disponibles</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Billing;

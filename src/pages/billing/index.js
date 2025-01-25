// pages/orders.js
import Layout from '../../components/layout/dashboard';
import Loader from '../../components/loaders/loader';
import { useStrapiData } from '../../services/strapiService';
import Image from 'next/image';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const ordersPage = () => {
    // Usamos el hook que creamos para obtener los datos de 'orders'
    const { data: orders, error, isLoading } = useStrapiData('orders');
    //console.log(orders);
    // Si está cargando, mostramos un mensaje de carga
    if (isLoading) {
        return <Layout><Loader /></Layout>;
    }

    // Si hay un error, mostramos el mensaje de error
    if (error) {
        return <Layout>Error al cargar los datos: {error.message}</Layout>;
    }

    // Si los datos se cargaron correctamente, los mostramos
    return (
        <Layout>
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
                            <th className="p-4">Fecha</th>
                            <th className="p-4">Monto</th>
                            <th className="p-4">Orden ID</th>
                            <th className="p-4">Cuenta</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4">Factura</th>
                        </tr>
                    </thead>

                    {orders && orders.length > 0 ? (
                        orders.map((plataforma, index) => (
                            <div
                                key={index}
                                className="p-6 bg-white rounded-lg shadow-md dark:bg-zinc-800 dark:border-zinc-800 dark:text-white dark:shadow-black transition flex flex-col items-center"
                            >
                                {/* Contenedor Horizontal para el Icono y el Texto */}
                                <div className="flex items-center mb-4 w-full">
                                    {/* Icono */}
                                    <div className="flex-shrink-0 dark:bg-zinc-700 bg-gray-100 p-3 rounded-full flex items-center justify-center">
                                        {typeof plataforma.icono === 'string' ? (
                                            <Image
                                                src={`${plataforma.icono}`} // Asegúrate de que la imagen se encuentre en la ruta correcta
                                                alt={plataforma.nombre}
                                                width={60}
                                                height={60}
                                                className="w-[60px] h-[60px] rounded-full"
                                            />
                                        ) : (
                                            plataforma.icono
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <span className="block dark:text-white text-gray-700 font-medium">Plataforma</span>
                                        <p className="text-gray-900 dark:text-white font-bold text-lg">{plataforma.nombre}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>No hay datos para mostrar.</div>
                    )}

                </table>
            </div>


        </Layout>
    );
};

export default ordersPage;
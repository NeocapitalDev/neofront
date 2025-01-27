import { useSession } from 'next-auth/react'; // Importamos el hook de sesión
import Layout from '../../components/layout/dashboard';
import Loader from '../../components/loaders/loader';
import { useStrapiData } from '../../services/strapiServiceJWT';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const OrdersPage = () => {
    const { data: session } = useSession(); // Obtenemos la sesión
    const token = session?.jwt; // Extraemos el token JWT de la sesión

    // Usamos el hook que creamos para obtener los datos de 'orders'
    const { data, error, isLoading } = useStrapiData('users/me?populate=orders', token);

    //console.log('Full Data:', data); // Log de los datos completos obtenidos
    if (isLoading) {
        return <Layout><Loader /></Layout>;
    }

    if (error) {
        return <Layout>Error al cargar los datos: {error.message}</Layout>;
    }

    // Verificamos si los datos incluyen la propiedad `orders`
    const orders = data?.orders || [];
    //console.log('Orders Data:', orders); // Log de los datos de órdenes

    return (
        <Layout>
            <div className="p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <DocumentTextIcon className="w-6 h-6 text-gray-600 dark:text-gray-200" />
                        <h1 className="text-xl font-semibold">Facturación</h1>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 overflow-x-auto dark:bg-black bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Challenge</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead className="w-[100px]">Orden ID</TableHead>
                            <TableHead className="text-right">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length > 0 ? (
                            orders.map((orden, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{orden.products}</TableCell>
                                    <TableCell>
                                        {new Date(orden.dateCreated).toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: '2-digit',
                                        })}
                                    </TableCell>
                                    <TableCell>${orden.total}</TableCell>
                                    <TableCell>#{orden.idWoo}</TableCell>
                                    <TableCell className="text-right">{orden.statusOrder}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <div>No hay datos para mostrar.</div>
                        )}
                    </TableBody>
                </Table>
            </div>
        </Layout>
    );
};

export default OrdersPage;
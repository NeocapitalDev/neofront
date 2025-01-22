import Layout from '../../components/layout/dashboard';
import Loader from '../../components/loaders/loader';
import { useStrapiData } from '../../lib/strapiService';
import Image from 'next/image';
const NotificationsPage = () => {
    // Usamos el hook que creamos para obtener los datos de 'notifications'
    const { data: notifications, error, isLoading } = useStrapiData('news');

    // Si está cargando, mostramos un mensaje de carga
    if (isLoading) {
        return (
            <Loader />
        );
    }

    // Si hay un error, mostramos el mensaje de error
    if (error) {
        return <p>Error al cargar las notificaciones: {error.message}</p>;
    }

    // Renderizamos las notificaciones si los datos están disponibles
    // Renderizamos las notificaciones
    return (
        <div className="p-6 bg-white dark:text-white shadow-md rounded-lg dark:bg-zinc-800">
            <div className="space-y-4 dark:text-white">
                {notifications && notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="border rounded-lg p-4 shadow-sm bg-white dark:bg-zinc-700 dark:border-gray-600 dark:shadow-black space-y-2"
                        >
                            <div className="flex items-start">
                                <span className="text-2xl mr-3">{notification.icon}</span>
                                <div>
                                    <h3 className="font-bold text-amber-400">
                                        {notification.title}
                                    </h3>
                                    <p className="text-black dark:text-white">{notification.description}</p>
                                    <p className="text-sm text-gray-400">{notification.time}</p>
                                </div>
                            </div>
                            {notification.image && (
                                <div className="flex justify-center mt-2">
                                    <Image
                                        src={notification.image}
                                        alt={notification.title}
                                        width={96}
                                        height={96}
                                        className="w-24 h-24 rounded-lg"
                                    />
                                </div>
                            )}
                            <div>
                                <a
                                    href={notification.url}
                                    className="block text-center bg-amber-400 text-black font-semibold py-2 px-4 rounded hover:bg-amber-500 transition"
                                >
                                    Ver más
                                </a>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="dark:text-white">No hay notificaciones para mostrar.</div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
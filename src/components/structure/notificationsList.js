import Image from 'next/image';

const NotificationsPage = () => {
    // Datos de ejemplo
    const notifications = [
        {
            id: 1,
            icon: '🔔',
            title: 'Nueva actualización disponible',
            description: 'La versión 2.0 de la aplicación ya está disponible. Descárgala ahora para acceder a las nuevas funciones.',
            time: 'Hace 2 horas',
            image: '/images/updates/update-icon.png',
            buttonLink: '#',
            buttonText: 'Actualizar ahora',
        },
        {
            id: 2,
            icon: '📢',
            title: 'Mantenimiento programado',
            description: 'El sistema estará en mantenimiento el próximo sábado de 2:00 AM a 6:00 AM.',
            time: 'Hace 1 día',
            image: '/images/maintenance/maintenance-icon.png',
            buttonLink: '#',
            buttonText: 'Más información',
        },
    ];

    // Renderizamos las notificaciones
    return (
        <div className="p-4 dark:bg-zinc-800 bg-white dark:text-white rounded-lg">
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
                                    href={notification.buttonLink}
                                    className="block text-center bg-amber-400 text-black font-semibold py-2 px-4 rounded hover:bg-amber-500 transition"
                                >
                                    {notification.buttonText}
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

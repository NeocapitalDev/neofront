import React from "react";

const notifications = [
    {
        id: 1,
        icon: "⚠️", // Icono representativo
        title: "Actualizaciones importantes",
        description: "¡No se pierda las actualizaciones de trading!",
        time: "hace 10 horas",
        image: "/images/icon-dark.png", // Imagen de ejemplo
        buttonText: "Más información",
        buttonLink: "#",
    },
    {
        id: 2,
        icon: "🔑", // Icono representativo
        title: "Free Trial",
        description:
            "Gracias por realizar su Free Trial. Las credenciales de acceso a su cuenta de trading se encuentran directamente en su Área de Cliente o en su Account MetriX. Buena suerte en su trading.",
        time: "hace 20 horas",
        image: null,
        buttonText: "Credenciales",
        buttonLink: "#",
    },
];

const NotificationsList = () => {
    return (
        <div className="p-4 space-y-4">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className="border rounded-lg p-4 shadow-sm bg-white space-y-2"
                >
                    <div className="flex items-start">
                        <span className="text-2xl mr-3">{notification.icon}</span>
                        <div>
                            <h3 className="font-bold text-blue-600">{notification.title}</h3>
                            <p className="text-gray-600">{notification.description}</p>
                            <p className="text-sm text-gray-400">{notification.time}</p>
                        </div>
                    </div>
                    {notification.image && (
                        <div className="flex justify-center mt-2">
                            <img
                                src={notification.image}
                                alt={notification.title}
                                className="w-24 h-24 rounded-lg"
                            />
                        </div>
                    )}
                    <div>
                        <a
                            href={notification.buttonLink}
                            className="block text-center bg-amber-400 text-white font-semibold py-2 px-4 rounded hover:bg-amber-500 transition"
                        >
                            {notification.buttonText}
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationsList;

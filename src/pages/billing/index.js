import React from "react";
import Layout from "../../components/layout/dashboard";
import {
    ChatBubbleOvalLeftEllipsisIcon,
    GlobeAltIcon,
    CameraIcon,
    BuildingOfficeIcon,
    HashtagIcon,
    PlayIcon,
} from "@heroicons/react/24/outline";

const plataformas = [
    {
        nombre: "Discord",
        url: "#",
        accion: "Unirse",
        icono: (
            <ChatBubbleOvalLeftEllipsisIcon className="h-10 w-10 text-purple-600" />
        ),
    },
    {
        nombre: "Facebook",
        url: "#",
        accion: "Seguir",
        icono: <GlobeAltIcon className="h-10 w-10 text-blue-600" />,
    },
    {
        nombre: "Instagram",
        url: "#",
        accion: "Seguir",
        icono: <CameraIcon className="h-10 w-10 text-pink-600" />,
    },
    {
        nombre: "LinkedIn",
        url: "#",
        accion: "Seguir",
        icono: <BuildingOfficeIcon className="h-10 w-10 text-blue-700" />,
    },
    {
        nombre: "X",
        url: "#",
        accion: "Seguir",
        icono: <HashtagIcon className="h-10 w-10 text-black" />,
    },
    {
        nombre: "YouTube",
        url: "#",
        accion: "Suscribirse",
        icono: <PlayIcon className="h-10 w-10 text-red-600" />,
    },
];
const Billing = () => {

    return (
        <Layout title="Billing">
            <div className="p-6 bg-white shadow-md rounded-lg">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="mr-2">📢</span> Redes Sociales
                </h2>
                <p className="text-gray-600 mb-6">
                    Síguenos en nuestras redes sociales, donde podrás ver las
                    actualizaciones de nuestra comunidad, eventos y mucho más. Puedes
                    encontrarnos en las principales plataformas, ¡solo elige tu favorita!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plataformas.map((plataforma, index) => (
                        <div
                            key={index}
                            className="p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center"
                        >
                            {/* Contenedor Horizontal para el Icono y el Texto */}
                            <div className="flex items-center mb-4 w-full">
                                {/* Icono */}
                                <div className="flex-shrink-0 bg-gray-100 p-4 rounded-full flex items-center justify-center">
                                    {plataforma.icono}
                                </div>

                                {/* Información de la Plataforma */}
                                <div className="ml-4">
                                    <span className="block text-gray-700 font-medium">Plataforma</span>
                                    <p className="text-gray-900 font-bold text-lg">{plataforma.nombre}</p>
                                </div>
                            </div>

                            {/* Botón de Acción */}
                            <a
                                href={plataforma.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition w-full"
                            >
                                {plataforma.accion}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="ml-2 w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.5 10.5L21 3m0 0h-7.5m7.5 0v7.5M21 13v6.75A2.25 2.25 0 0118.75 22H5.25A2.25 2.25 0 013 19.75V5.25A2.25 2.25 0 015.25 3H12"
                                    />
                                </svg>
                            </a>
                        </div>
                    ))}
                </div>

            </div>
        </Layout>
    );
};

export default Billing;
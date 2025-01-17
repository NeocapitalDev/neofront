import React from "react";
import Layout from "../../components/layout/dashboard";
import Image from "next/image";
import {
    ChatBubbleOvalLeftEllipsisIcon,
    GlobeAltIcon,
    CameraIcon,
    BuildingOfficeIcon,
    HashtagIcon,
} from "@heroicons/react/24/outline";

const plataformas = [
    {
        nombre: "Discord",
        url: "#",
        accion: "Unirse",
        icono: "discord.svg",
    },
    {
        nombre: "Facebook",
        url: "#",
        accion: "Seguir",
        icono: "facebook.svg",
    },
    {
        nombre: "Instagram",
        url: "#",
        accion: "Seguir",
        icono: "instagram.svg",
    },
    {
        nombre: "LinkedIn",
        url: "#",
        accion: "Seguir",
        icono: "linkendin.svg",
    },
    {
        nombre: "X",
        url: "#",
        accion: "Seguir",
        icono: "x.svg",
    },
    {
        nombre: "YouTube",
        url: "#",
        accion: "Suscribirse",
        icono: "youtube.svg",
    },
];
const Social = () => {
    return (
        <Layout title="Social">
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
                                <div className="flex-shrink-0 bg-gray-100 p-3 rounded-full flex items-center justify-center">
                                    {typeof plataforma.icono === "string" ? (
                                        <Image
                                            src={`/images/social/${plataforma.icono}`}
                                            alt={plataforma.nombre}
                                            width={51}
                                            height={51}
                                            className="w-[51px] h-[51px]"
                                        />
                                    ) : plataforma.icono}
                                </div>
                                <div className="ml-4">
                                    <span className="block text-gray-700 font-medium">
                                        Plataforma
                                    </span>
                                    <p className="text-gray-900 font-bold text-lg">
                                        {plataforma.nombre}
                                    </p>
                                </div>
                            </div>

                            {/* Botón de Acción */}
                            <a
                                href={plataforma.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center bg-amber-500 text-black font-medium py-2 px-4 rounded-lg hover:bg-amber-600 transition w-full"
                            >
                                {plataforma.accion}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="ml-2 w-3 h-3"
                                    viewBox="0 0 512 512"
                                    fill="#000000"
                                >
                                    <path d="M352 0c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9L370.7 96 201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L416 141.3l41.4 41.4c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6V32c0-17.7-14.3-32-32-32H352zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"></path>
                                </svg>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default Social;

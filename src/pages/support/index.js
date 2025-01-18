import React from "react";
import Layout from "../../components/layout/dashboard";
import Image from "next/image";
import { useStrapiData } from "../../lib/strapiService";
import { ArrowLongRightIcon } from "@heroicons/react/24/solid";

const Billing = () => {
    const { data: supports, error, isLoading } = useStrapiData("supports?populate=*");
    console.log(supports);
    
    const constructImageUrl = (url) => {
        const baseUrl = process.env.NEXT_PUBLIC_STRAPI_BASE_URL || "http://localhost:1337";
        console.log(`${baseUrl}${url}`)
        return `${baseUrl}${url}`;
    };

    if (isLoading) {
        return (
            <Layout title="Billing">
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <p className="text-gray-600">Cargando plataformas de soporte...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Billing">
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <p className="text-red-600">Error al cargar las plataformas de soporte.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Billing">
            <div className="p-6 bg-white shadow-md rounded-lg">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="mr-2">
                        <Image
                            src={"/images/support/soporte.svg"}
                            width={30}
                            height={30}
                            className="w-[30px] h-[30px]"
                            alt="Icono de Soporte"
                        />
                    </span>
                    Support
                </h2>
                <p className="text-gray-600 mb-6">
                    Si necesitas ayuda, no dudes en contactarnos a través de nuestras principales plataformas. Estamos aquí para responder tus preguntas y brindarte el soporte que necesitas. ¡Conéctate con nosotros ahora!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {supports.map((plataforma, index) => (
                        <div
                            key={index}
                            className="p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center"
                        >
                            {/* Contenedor Horizontal para el Icono y el Texto */}
                            <div className="flex items-center mb-4 w-full">
                                {/* Icono */}
                                <div className="flex-shrink-0 bg-gray-100 p-3 rounded-full flex items-center justify-center">
                                    <Image
                                        src={constructImageUrl(plataforma.icon.url)}
                                        alt={plataforma.nombre}
                                        width={51}
                                        height={51}
                                        className="w-[51px] h-[51px] rounded-full"
                                    />
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
                                <ArrowLongRightIcon className="ml-2 w-6 h-6 text-black" />
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default Billing;

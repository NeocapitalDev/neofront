import React from "react";
import { useRouter } from "next/router";
import { HomeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const Breadcrumb = () => {
    const router = useRouter();
    const pathSegments = router.pathname.split("/").filter(Boolean); // Divide la ruta y elimina elementos vacíos

    // Verifica si estamos en la raíz "/"
    const isHomePage = pathSegments.length === 0;

    return (
        <nav className="flex items-center space-x-2 text-gray-500 mb-3">
            {/* Si estamos en la página principal (raíz), solo muestra el icono y "Inicio" */}
            {isHomePage ? (
                <span className="flex items-center text-gray-400">
                    <HomeIcon className="w-5 h-5" />
                    <span className="ml-2 text-gray-700 font-medium">Inicio</span>
                </span>
            ) : (
                <>
                    {/* Icono de inicio */}
                    <Link href="/" legacyBehavior>
                        <a className="flex items-center text-gray-400 hover:text-gray-600 transition">
                            <HomeIcon className="w-5 h-5" />
                        </a>
                    </Link>

                    {/* Generación de rutas dinámicas */}
                    {pathSegments.map((segment, index) => {
                        const isLast = index === pathSegments.length - 1; // Verifica si es el último segmento
                        const href = "/" + pathSegments.slice(0, index + 1).join("/");

                        // Capitaliza las primeras letras y maneja "dashboard" de forma especial
                        const displaySegment = segment.charAt(0).toUpperCase() + segment.slice(1);

                        return (
                            <React.Fragment key={index}>
                                <span className="text-gray-400">/</span>
                                {isLast ? (
                                    <span className="text-gray-700 font-medium capitalize">{displaySegment}</span>
                                ) : (
                                    <Link href={href} legacyBehavior>
                                        <a className="hover:text-gray-600 transition capitalize">{displaySegment}</a>
                                    </Link>
                                )}
                            </React.Fragment>
                        );
                    })}
                </>
            )}
        </nav>
    );
};

export default Breadcrumb;

// pages/socials.js
import Layout from '../../components/layout/dashboard';
import Loader from '../../components/loaders/loader';
import { useStrapiData } from '../../lib/strapiService';
import Image from 'next/image';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';

const SocialsPage = () => {
    // Usamos el hook que creamos para obtener los datos de 'socials'
    const { data: socials, error, isLoading } = useStrapiData('socials');
    console.log(socials);
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
                    {socials && socials.length > 0 ? (
                        socials.map((plataforma, index) => (
                            <div
                                key={index}
                                className="p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center"
                            >
                                {/* Contenedor Horizontal para el Icono y el Texto */}
                                <div className="flex items-center mb-4 w-full">
                                    {/* Icono */}
                                    <div className="flex-shrink-0 bg-gray-100 p-3 rounded-full flex items-center justify-center">
                                        {typeof plataforma.icono === 'string' ? (
                                            <Image
                                                src={`${plataforma.icono}`} // Asegúrate de que la imagen se encuentre en la ruta correcta
                                                alt={plataforma.nombre}
                                                width={51}
                                                height={51}
                                                className="w-[51px] h-[51px]"
                                            />
                                        ) : (
                                            plataforma.icono
                                        )}
                                    </div>
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
                                    className="inline-flex items-center justify-center bg-amber-500 text-black font-medium py-2 px-4 rounded-lg hover:bg-amber-600 transition w-full"
                                >
                                    {plataforma.accion}
                                    {/* Icono de redirección usando ArrowTopRightOnSquareIcon */}
                                    <ArrowTopRightOnSquareIcon className="ml-2 w-4 h-4" />
                                </a>
                            </div>
                        ))
                    ) : (
                        <div>No hay datos para mostrar.</div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default SocialsPage;
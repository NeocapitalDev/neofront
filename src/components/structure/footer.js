const FooterInfo = () => {
    return (
        <div className="mt-6 text-sm dark:text-white">
            <div className="flex flex-col">
                <div className="font-bold text-md mb-4 border-b pb-1 border-gray-300 dark:border-zinc-600">
                    <a href="#" className="text-zinc-600 hover:underline dark:text-white">Política de Privacidad</a> &nbsp; | &nbsp;
                    <a href="#" className="text-zinc-600 hover:underline dark:text-white">Términos y Condiciones</a>
                </div>
                <p className="mb-4 max-w-full  text-xs text-justify">
                    Toda la información proporcionada en este sitio está destinada exclusivamente a fines educativos relacionados con el trading en mercados financieros y no sirve en
                    modo alguno como recomendación específica de inversión, recomendación comercial, análisis de oportunidades de inversión o recomendación general similar en relación con
                    el trading de instrumentos de inversión. {process.env.NEXT_PUBLIC_NAME_APP} sólo ofrece servicios de trading simulado y herramientas educativas para traders.
                    La información contenida en este sitio no está dirigida a residentes en ningún país o jurisdicción en los que dicha distribución o
                    utilización sea contraria a las leyes o normativas locales. Las empresas {process.env.NEXT_PUBLIC_NAME_APP} no actúan como brokers y no aceptan depósitos. La solución
                    técnica ofrecida para las plataformas y la alimentación de datos de {process.env.NEXT_PUBLIC_NAME_APP} está gestionada por proveedores de liquidez.
                </p>
                <p className="text-gray-500 dark:text-white text-xs">
                    2025 © Copyright - {process.env.NEXT_PUBLIC_NAME_APP}.com Hecho con ❤ por el trading.<br />
                    Versión: 1.1.0
                </p>
            </div>
        </div>
    );
};

export default FooterInfo;

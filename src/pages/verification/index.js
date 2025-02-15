import { useState } from "react";
import Layout from "../../components/layout/dashboard";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const Verification = dynamic(() => import("../verification/verification"), { ssr: false });

const SocialsPage = () => {
    const [accepted, setAccepted] = useState(false);

    const handleSign = () => {
        if (accepted) {
            alert("Contrato firmado exitosamente.");
        }
    };

    return (
        <Layout>
            <div className="p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                <h2 className="text-xl font-semibold mb-0 flex items-center">
                    <CheckCircleIcon className="h-6 w-6 mr-2" />
                    Verificación
                </h2>
            </div>

            <Verification apiKey="dd8f7e39-0ef2-4c05-a872-b40235b2d24f" />

            <div className="mt-6">
                <p className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">
                    2. Firma de contrato
                </p>
                <div className="flex flex-col p-6 dark:bg-black bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                    <div className="h-64 overflow-y-auto border p-4 rounded-lg bg-gray-100 dark:bg-zinc-900">
                        <p className="text-sm text-zinc-900 dark:text-white whitespace-pre-line">
                            1. Términos
                            Al acceder al sitio web de Wazend, aceptas estar sujeto a estos términos de servicio...
                            
                            2. Licencia de Uso
                            Se concede permiso para descargar temporalmente una copia de los materiales...
                            
                            3. Descargo de responsabilidad
                            Los materiales en el sitio web de Wazend se proporcionan «tal cual»...
                            
                            4. Limitaciones
                            En ningún caso Wazend o sus proveedores serán responsables de ningún daño...
                            
                            5. Precisión de los materiales
                            Los materiales que aparecen en el sitio web de Wazend podrían incluir errores...
                            
                            6. Enlaces
                            Wazend no ha revisado todos los sitios vinculados a su sitio web...
                            
                            7. Modificaciones
                            Wazend puede revisar estos términos de servicio para su sitio web...
                            
                            8. Ley Aplicable
                            Estos términos y condiciones se rigen e interpretan de acuerdo con las leyes de Wazend...
                            
                        </p>
                    </div>
                    <label className="flex items-center space-x-2 mt-4">
                        <input
                            type="checkbox"
                            checked={accepted}
                            onChange={() => setAccepted(!accepted)}
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-zinc-900 dark:text-white">Acepto los términos del contrato</span>
                    </label>
                    <Button
                        className="mt-4 bg-[#1F6263] hover:bg-[#29716c] text-white text-sm font-medium px-6 py-5 rounded-md"
                        disabled={!accepted}
                        onClick={handleSign}
                    >
                        Firmar
                    </Button>
                </div>
            </div>
        </Layout>
    );
};

export default SocialsPage;

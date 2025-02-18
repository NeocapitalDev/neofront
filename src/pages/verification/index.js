import { useState } from "react";
import Layout from "../../components/layout/dashboard";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import useSWR from "swr";
import Loader from '../../components/loaders/loader';
import { useSession } from "next-auth/react";
import { toast } from "sonner";

// ✅ Importación corregida de VeriffComponent
import VeriffComponent from "./verification"; 
const Verification = dynamic(() => import("../verification/verification"), { ssr: false });

const fetcher = async (url, token) => {
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return response.json();
};

const SocialsPage = () => {
    const { data: session } = useSession();
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data, error, isLoading, mutate } = useSWR(
        session?.jwt
            ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me?populate[challenges][populate]=broker_account`, session.jwt]
            : null,
        ([url, token]) => fetcher(url, token)
    );

    console.log("User Data:", data);

    const isVerified = data?.isVerified;
    const statusSign = data?.statusSign;

    // ✅ Corrección: Asegurar que `challenges` es un array antes de evaluarlo
    const hasPhase3Challenge = Array.isArray(data?.challenges) && data.challenges.some(challenge => challenge.phase === 3);
    const hasPhase1Or2Challenge = Array.isArray(data?.challenges) && data.challenges.some(challenge => challenge.phase === 1 || challenge.phase === 2);
    const newAccount = !data?.challenges || data.challenges.length === 0;

    console.log("Is Verified:", isVerified);
    console.log("Has Phase 3 Challenge:", hasPhase3Challenge);
    console.log("Has Phase 1 or 2 Challenge:", hasPhase1Or2Challenge);
    console.log("Is statusSign:", statusSign);
    console.log("newAccount:", newAccount);

    // ✅ Función para firmar el contrato
    const handleSign = async () => {
        if (accepted) {
            setLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${data?.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.jwt}`,
                    },
                    body: JSON.stringify({ statusSign: true }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Error en la respuesta de Strapi:", errorData);
                    toast.error("Error en la firma del contrato");
                    throw new Error(`Error ${response.status} - ${errorData?.error?.message || "Error desconocido"}`);
                }

                toast.success("Contrato firmado exitosamente.");
                mutate();
            } catch (error) {
                console.error("Error al firmar el contrato:", error);
                toast.error("Hubo un problema al firmar el contrato.");
            } finally {
                setLoading(false);
            }
        }
    };

    if (isLoading) {
        return <Layout><Loader /></Layout>;
    }

    if (error) {
        return <Layout>Error al cargar los datos: {error.message}</Layout>;
    }

    // 🔒 Si está en fase 1 o 2 sin verificar, mostrar la sección bloqueada
    if ((hasPhase1Or2Challenge || newAccount) && !isVerified) {
        return (
            <Layout>
                <div className="p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                    <h2 className="text-xl font-semibold mb-0 flex items-center">
                        <CheckCircleIcon className="h-6 w-6 mr-2" />
                        Sección bloqueada
                    </h2>
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                        Para acceder a esta sección, necesitas haber alcanzado la fase NeoTrader en tu desafío. 
                    </p>
                    {newAccount ? (
                        <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                            Actualmente no tienes ningún desafío activo. Una vez que inicies tu primer NEO Challenge, 
                            esta sección se desbloqueará automáticamente y podrás avanzar en tu proceso de evaluación.
                        </p>
                    ) : (
                        <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                            Tu desafío está en curso en la fase 1 o 2. Continúa operando y alcanza la fase NeoTrader para desbloquear esta sección.
                        </p>
                    )}
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                        ¡Empieza ahora y demuestra tus habilidades en el mundo del trading!
                    </p>
                </div>
            </Layout>
        );
    }
    

    return (
        <Layout>
            {/* ✅ Mostramos el componente Veriff para manejar la verificación */}
            <VeriffComponent isVerified={isVerified} />

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
                            checked={statusSign || accepted}
                            onChange={() => { if (!statusSign) setAccepted(!accepted); }}
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-zinc-900 dark:text-white">Acepto los términos del contrato</span>
                    </label>
                    <Button
                        className="mt-4 bg-[#1F6263] hover:bg-[#29716c] text-white text-sm font-medium px-6 py-5 rounded-md"
                        disabled={statusSign || !accepted || loading}
                        onClick={handleSign}
                    >
                        {loading ? "Firmando..." : "Firmar"}
                    </Button>
                </div>
            </div>
        </Layout>
    );
};

export default SocialsPage;

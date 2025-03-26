import { useState, useMemo, useCallback } from "react";
import Layout from "../../components/layout/dashboard";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { useStrapiData } from "src/services/strapiServiceJWT";
import Loader from "../../components/loaders/loader";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CheckBadgeIcon } from '@heroicons/react/24/outline';

import VeriffComponent from "./verification";

const Verification = dynamic(() => import("../verification/verification"), { ssr: false });

// const fetcher = async (url, token) => {
//     try {
//         const response = await fetch(url, {
//             headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!response.ok) throw new Error(`Error: ${response.status}`);
//         return response.json();
//     } catch (error) {
//         console.error("Fetcher Error:", error);
//         throw error;
//     }
// };

const SocialsPage = () => {
    const { data: session } = useSession();
    const token = session?.jwt ?? null; // Previene errores de undefined

    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);



    // const { data, error, isLoading, mutate } = useSWR(
    //     token
    //         ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me?populate[challenges][populate]=broker_account`, token]
    //         : null,
    //     ([url, token]) => fetcher(url, token)
    // );


    const route = token ? "users/me?populate[challenges][populate]=broker_account" : null;
    const { data, error, isLoading, mutate } = useStrapiData(route, token);
    // console.log("data: ", data);




    const { isVerified, statusSign, challenges = [] } = data || {};
    // console.log("challenges: ", challenges);
    const { hasPhase3Challenge, hasPhase1Or2Challenge, newAccount } = useMemo(() => ({
        hasPhase3Challenge: challenges.some(challenge => challenge.phase === 3),
        hasPhase1Or2Challenge: challenges.some(challenge => [1, 2].includes(challenge.phase)),
        newAccount: challenges.length === 0,
    }), [challenges]);

    const handleSign = useCallback(async () => {
        if (!accepted || loading) return;

        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${data?.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ statusSign: true, isVerified: true }),
            });
            // console.log("token: ", token);
            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData?.error?.message || "Error en la firma del contrato");
                throw new Error(`Error ${response.status}`);
            }

            toast.success("Contrato firmado exitosamente.");
            mutate();
        } catch (error) {
            console.error("Error al firmar el contrato:", error);
            toast.error("Hubo un problema al firmar el contrato.");
        } finally {
            setLoading(false);
        }
    }, [accepted, data?.id, token, loading, mutate]);

    return (
        <Layout>

            {isLoading && <Loader />}

            {error && (
                <p className="text-red-500">Error al cargar los datos: {error.message}</p>
            )}

            {!isLoading && !error && (
                <>

                    <div className="p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black mb-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <CheckBadgeIcon className="w-6 h-6 text-gray-600 dark:text-gray-200" />
                                <h1 className="text-xl font-semibold">Verificación</h1>
                            </div>
                        </div>
                    </div>

                    {((!hasPhase3Challenge && (hasPhase1Or2Challenge || newAccount)) && !isVerified) ? (
                        <div className="p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                La sección de verificación se desbloqueará para usted una vez que esté a punto de firmar o cambiar un contrato con nosotros. Se desbloqueará automáticamente una vez que haya llegado a fase NeoTrader.
                            </p>
                        </div>
                    ) : (
                        <>
                            <VeriffComponent isVerified={isVerified} />

                            <div className="mt-6">
                                <p className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">
                                    2. Firma de contrato
                                </p>
                                <div className="flex flex-col p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                                    <div className="h-64 overflow-y-auto border p-4 rounded-lg bg-gray-100 dark:bg-zinc-900">
                                        <p className="text-sm text-zinc-900 dark:text-white whitespace-pre-line">
                                            {/* 📌 Sección de términos y condiciones */}
                                            1. Términos...
                                            2. Licencia de Uso...
                                            3. Descargo de responsabilidad...
                                            4. Limitaciones...
                                            5. Precisión de los materiales...
                                            6. Enlaces...
                                            7. Modificaciones...
                                            8. Ley Aplicable...
                                        </p>
                                    </div>

                                    {/* ✅ Checkbox de aceptación */}
                                    <label className="flex items-center space-x-2 mt-4">
                                        <input
                                            type="checkbox"
                                            checked={statusSign || accepted}
                                            onChange={() => !statusSign && setAccepted(prev => !prev)}
                                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-zinc-900 dark:text-white">
                                            Acepto los términos del contrato
                                        </span>
                                    </label>

                                    {/* ✅ Botón de firma */}
                                    <Button
                                        className="mt-4 bg-[#1F6263] hover:bg-[#29716c] text-white text-sm font-medium px-6 py-5 rounded-md"
                                        disabled={statusSign || !accepted || loading}
                                        onClick={handleSign}
                                    >
                                        {loading ? "Firmando..." : "Firmar"}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </Layout>
    );
};

export default SocialsPage;

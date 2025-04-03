// src/pages/verification/index.js
import { useState, useMemo, useCallback } from "react";
import Layout from "../../components/layout/dashboard";
import { CheckCircleIcon, DocumentIcon, DocumentTextIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useStrapiData } from "src/services/strapiServiceJWT";
import Loader from "../../components/loaders/loader";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import VeriffComponent from "./verification";
import { DownloadIcon, UploadIcon } from "lucide-react";

const DEFAULT_CONTRACT_URL = `${process.env.NEXT_PUBLIC_DEFAULT_CONTRACT_URL || "https://minio.neocapitalfunding.com/strapi/CONTRATO_278b458332.pdf"}`;

const SocialsPage = () => {
    const { data: session } = useSession();
    const token = session?.jwt ?? null;

    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pdfFile, setPdfFile] = useState(null);

    const route = token ? "users/me?populate[challenges][populate]=broker_account&populate[pdf]=*" : null;
    const { data, error, isLoading, mutate } = useStrapiData(route, token);

    const { isVerified, statusSign, challenges = [], pdf } = data || {};
    const isSigned = !!pdf;
    const isUploadDisabled = statusSign === true; // Disable upload if statusSign is true

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

    const handlePdf = useCallback(async () => {
        if (isUploadDisabled) {
            toast.error("No puedes subir un PDF porque el documento ya ha sido verificado por un administrador.");
            return;
        }

        if (!pdfFile) {
            toast.error("Por favor selecciona un archivo PDF primero");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('files', pdfFile);

            const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(errorData?.error?.message || "Error uploading PDF");
            }

            const uploadData = await uploadResponse.json();
            const fileId = uploadData[0].id;

            const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${data?.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ pdf: fileId }),
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(errorData?.error?.message || "Error updating user with PDF");
            }

            toast.success("PDF subido exitosamente.");
            mutate();
        } catch (error) {
            console.error("Error al subir pdf:", error);
            toast.error("Hubo un problema al subir el PDF: " + error.message);
        } finally {
            setLoading(false);
            setPdfFile(null);
        }
    }, [pdfFile, data?.id, token, mutate, isUploadDisabled]);

    const handleFileChange = (e) => {
        if (isUploadDisabled) {
            toast.error("No puedes subir un PDF porque el documento ya ha sido verificado por un administrador.");
            return;
        }

        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
        } else {
            toast.error("Por favor selecciona un archivo PDF válido");
            setPdfFile(null);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(DEFAULT_CONTRACT_URL);
            if (!response.ok) {
                throw new Error("Error al descargar el PDF");
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "Contrato.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error al descargar el PDF:", error);
            toast.error("Hubo un problema al descargar el PDF.");
        }
    };

    return (
        <Layout>
            {isLoading && <Loader />}
            {error && (
                <p className="text-red-500">Error al cargar los datos: {error.message}</p>
            )}
            {!isLoading && !error && (
                <>
                    {/* Cabecera de verificación */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-white to-gray-50 dark:from-zinc-800 dark:to-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700 transition-all">
                        <div className="absolute h-1 top-0 left-0 right-0 bg-[var(--app-primary)]"></div>

                        <div className="p-6 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-full bg-[var(--app-primary)]/10">
                                    <CheckBadgeIcon className="w-5 h-5 text-[var(--app-primary)]" />
                                </div>
                                <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">
                                    Verificación
                                </h1>
                            </div>

                            {statusSign && (
                                <div className="flex items-center">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        Contrato verificado
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {((!hasPhase3Challenge && (hasPhase1Or2Challenge || newAccount)) && !isVerified) ? (
                        <div className="mt-6 bg-white dark:bg-zinc-800/90 shadow-md rounded-xl border border-gray-100 dark:border-zinc-700 overflow-hidden transition-all">
                            <div className="p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <InformationCircleIcon className="w-5 h-5 text-amber-500" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        La sección de verificación se desbloqueará para usted una vez que esté a punto de firmar o cambiar un contrato con nosotros. Se desbloqueará automáticamente una vez que haya llegado a fase Real.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <VeriffComponent isVerified={isVerified} />

                            <div className="mt-6">
                                {/* <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-2 rounded-full bg-[var(--app-primary)]/10">
                                        <DocumentTextIcon className="w-5 h-5 text-[var(--app-primary)]" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">
                                        Documento de Contrato
                                    </h2>
                                </div> */}

                                {statusSign ? (
                                    <div className="bg-white dark:bg-zinc-800/90 shadow-md rounded-xl border border-gray-100 dark:border-zinc-700 overflow-hidden transition-all">
                                        <div className="p-6">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                                                    <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">
                                                        Contrato verificado
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Tu contrato ha sido verificado correctamente. Ahora puedes continuar con las operaciones sin restricciones y
                                                        acceder a todas las funcionalidades disponibles en la plataforma.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-zinc-800/90 shadow-md rounded-xl border border-gray-100 dark:border-zinc-700 overflow-hidden transition-all">
                                        <div className="border-b border-gray-100 dark:border-zinc-700/50 p-6">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <div className="p-2 rounded-full bg-[var(--app-primary)]/10 mr-3">
                                                        <DocumentTextIcon className="w-5 h-5 text-[var(--app-primary)]" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">
                                                        Contrato
                                                    </h3>
                                                </div>

                                                <div className="flex items-center">
                                                    <span className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${isSigned ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                        {isSigned ? (
                                                            <>
                                                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                                                Enviado
                                                            </>
                                                        ) : (
                                                            "Pendiente de envío"
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            {/* Visualizador de PDF con altura fija */}
                                            <div className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden mb-6">
                                                <div className="p-2 bg-gray-100 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 flex justify-between items-center">
                                                    <div className="flex items-center space-x-2">
                                                        <DocumentIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contrato</span>
                                                    </div>
                                                    <Button
                                                        className="bg-transparent hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded transition-colors"
                                                        onClick={handleDownload}
                                                    >
                                                        <DownloadIcon className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <embed
                                                    src={`${DEFAULT_CONTRACT_URL}#toolbar=0`}
                                                    type="application/pdf"
                                                    className="w-full h-[500px]"
                                                />
                                            </div>

                                            {isUploadDisabled && (
                                                <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-sm flex items-center space-x-2">
                                                    <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />
                                                    <p>No puedes subir un PDF porque el documento ya ha sido verificado por un administrador.</p>
                                                </div>
                                            )}

                                            {/* Acciones */}
                                            <div className="space-y-4">
                                                <Button
                                                    className="w-full bg-[var(--app-primary)] hover:bg-amber-600 text-white text-md font-semibold px-6 py-4 rounded-lg shadow-md transition-all flex items-center justify-center space-x-2"
                                                    onClick={handleDownload}
                                                >
                                                    <DownloadIcon className="w-5 h-5" />
                                                    <span>Descargar PDF</span>
                                                </Button>

                                                <div className="bg-gray-50 dark:bg-zinc-700/30 rounded-lg border border-gray-100 dark:border-zinc-700/50 p-4">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                        Para completar la verificación, descargue el documento, fírmelo y súbalo nuevamente.
                                                    </p>

                                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                                        <div className="flex-grow">
                                                            <div className="relative">
                                                                <input
                                                                    type="file"
                                                                    accept="application/pdf"
                                                                    onChange={handleFileChange}
                                                                    className="file:cursor-pointer file:border-none file:rounded-lg file:bg-[var(--app-primary)] file:text-white file:px-3 file:py-2 file:mr-3 file:font-medium hover:file:bg-amber-600 disabled:opacity-50 w-full text-sm cursor-pointer focus:outline-none bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg py-2 px-3"
                                                                    disabled={loading || isUploadDisabled}
                                                                />
                                                                {loading && (
                                                                    <div className="absolute inset-0 bg-white/50 dark:bg-zinc-800/50 flex items-center justify-center rounded-lg">
                                                                        <svg className="animate-spin h-5 w-5 text-[var(--app-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {pdfFile && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                    {pdfFile.name} ({Math.round(pdfFile.size / 1024)} KB)
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <Button
                                                                className={`w-full sm:w-auto bg-[var(--app-secondary)] hover:bg-[var(--app-primary)] text-white text-sm font-semibold px-6 py-3 rounded-lg shadow-md transition-all flex items-center justify-center space-x-2 ${(!pdfFile || loading || isUploadDisabled) ? "opacity-50 cursor-not-allowed" : ""}`}
                                                                disabled={!pdfFile || loading || isUploadDisabled}
                                                                onClick={handlePdf}
                                                            >
                                                                {loading ? (
                                                                    <>
                                                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                        </svg>
                                                                        <span>Subiendo...</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UploadIcon className="w-4 h-4" />
                                                                        <span>Subir documento</span>
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}
        </Layout>
    );
};

export default SocialsPage;


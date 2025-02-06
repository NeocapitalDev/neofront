import { useSession } from "next-auth/react";
import { useState } from "react";

const VerificationButton = () => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

    const startVerification = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/sumsub", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const { token } = await res.json();
            window.location.href = `https://verification.sumsub.com?accessToken=${token}`;
        } catch (error) {
            console.error("Error en la verificación:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-end mt-6">
            {/* Botón de verificación */}
            <button
                onClick={startVerification}
                disabled={session?.user.verification_status === "approved" || loading}
                className={`px-4 py-2 text-black font-semibold rounded-md shadow-lg transition ${session?.user.verification_status === "approved"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-600"
                    }`}
            >
                {session?.user.verification_status === "approved"
                    ? "Verificación Completa"
                    : loading
                        ? "Cargando..."
                        : "Verificar Identidad"}
            </button>
        </div>
    );
};

export default VerificationButton;

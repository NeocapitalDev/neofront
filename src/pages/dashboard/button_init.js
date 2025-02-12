"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from 'sonner';

const ButtonInit = ({ documentId, result }) => {
    const { data: session } = useSession(); // ✅ Obtiene sesión correctamente
    const [isLoading, setIsLoading] = useState(false); // Estado de carga

    const sendToWebhook = async () => {
        if (!session) {
            console.warn("⚠️ Usuario no autenticado.");
            return;
        }
        if (!documentId) {
            console.warn("⚠️ No se recibió un documentId.");
            return;
        }

        setIsLoading(true); // Inicia el estado de carga

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_N8N_CHALLENGE_UPDATE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: session.user.id, // ID del usuario autenticado
                    documentId, // Document ID recibido como prop
                    timestamp: new Date().toISOString(), // Marca de tiempo
                }),
            });

            if (response.ok) {
                // console.log("✅ Datos enviados correctamente a n8n");
                toast.success('Solicitud procesada exitosamente');
                window.location.reload(); // Recargar página si el envío fue exitoso
            } else {
                console.error("❌ Error al enviar datos a n8n");
                toast.error('Error al procesar la solicitud');
            }
        } catch (err) {
            console.error("❌ Error en la solicitud al webhook:", err);
        } finally {
            setIsLoading(false); // Finaliza el estado de carga
        }
    };

    // Solo muestra el mensaje si `result` es "init"
    if (result !== "init") {
        return null;
    }

    return (
        <div className="flex items-center py-3 px-4 gap-2 mt-4 border border-yellow-500 bg-yellow-500 rounded-lg">
            <p className="text-sm text-black font-medium">
                Tienes un challenge por iniciar
            </p>

            <button
                onClick={sendToWebhook}
                className="text-sm text-black font-bold uppercase underline"
                disabled={isLoading} // Deshabilitar botón mientras carga
            >
                {isLoading ? "Cargando..." : "CLICK AQUÍ"}
            </button>
        </div>
    );
};

export default ButtonInit;

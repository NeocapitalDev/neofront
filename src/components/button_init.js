"use client";

import React from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";

const fetcher = (url, token) =>
    fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((res) => res.json());

const ButtonInit = () => {
    const { data: session } = useSession(); // ✅ Obtiene sesión correctamente

    const { data, error, isLoading } = useSWR(
        session?.jwt
            ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me?populate=challenges`, session.jwt]
            : null,
        ([url, token]) => fetcher(url, token)
    );

    const sendToWebhook = async () => {
        if (!session) {
            console.warn("⚠️ Usuario no autenticado.");
            return;
        }
        if (isLoading) {
            console.log("Cargando datos...");
            return;
        }
        if (error) {
            console.error("Error obteniendo los challenges:", error);
            return;
        }
        if (!data || !data.challenges) {
            console.warn("No hay datos de challenges disponibles.");
            return;
        }

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_N8N_CHALLENGE_UPDATE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: data.id, // ID del usuario autenticado
                    challenges: data.challenges, // Desafíos del usuario
                    timestamp: new Date().toISOString(), // Marca de tiempo
                }),
            });

            if (response.ok) {
                console.log("✅ Datos enviados correctamente a n8n");
            } else {
                console.error("❌ Error al enviar datos a n8n");
            }
        } catch (err) {
            console.error("❌ Error en la solicitud al webhook:", err);
        }
    };

    return (
        <div className="flex flex-col-1 items-start py-4 gap-2 mt-4 dark:border-zinc-600 bg-gray-100 dark:bg-zinc-800">
            <p className="text-sm text-gray-600 dark:text-gray-300 py-2">
                Haz clic para iniciar el challenge
            </p> 

            <button
                onClick={sendToWebhook}
                className="flex items-center justify-center space-x-2 px-3 py-1 h-8 border rounded-md shadow-sm bg-gray-200 hover:bg-gray-300 text-xs dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:border-zinc-500"
            >
                Iniciar challenge
            </button>
        </div>
    );
};

export default ButtonInit;

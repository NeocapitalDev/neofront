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
    const { data: session } = useSession(); // ✅ Obtiene session correctamente

    const { data, error, isLoading } = useSWR(
        session?.jwt
            ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me?populate=challenges`, session.jwt]
            : null,
        ([url, token]) => fetcher(url, token)
    );

    const handleClick = () => {
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

        console.log("📌 Data de Challenges:", data.challenges);
    };

    return (
        <button
            onClick={handleClick}
            className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 w-auto dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:border-zinc-500"
        >
            Challenge Data
        </button>
    );
};

export default ButtonInit;

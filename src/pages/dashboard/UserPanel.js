import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChartBarIcon, BellIcon } from '@heroicons/react/24/outline';
import CredencialesModal from './credentials';
import Loader from '../../components/loaders/loader';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const fetcher = async (url, token) => {
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return response.json();
};

const fetchMetaStats = async (idMeta) => {
    const response = await fetch(
        `https://metastats-api-v1.new-york.agiliumtrade.ai/users/current/accounts/${idMeta}/metrics`,
        {
            headers: {
                "auth-token": `${process.env.NEXT_PUBLIC_TOKEN_META_API}`,
                "Content-Type": "application/json",
            },
        }
    );
    if (!response.ok) throw new Error(`Error en Metastats API: ${response.status}`);
    return response.json();
};

export default function Index() {
    const { data: session } = useSession();
    const router = useRouter();

    const { data, error, isLoading } = useSWR(
        session?.jwt
            ? [`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me?populate[challenges][populate]=broker_account`, session.jwt]
            : null,
        ([url, token]) => fetcher(url, token)
    );

    const [visibility, setVisibility] = useState(() => {
        if (typeof window !== "undefined") {
            const storedVisibility = localStorage.getItem("visibility");
            return storedVisibility ? JSON.parse(storedVisibility) : {};
        }
        return {};
    });

    const [metaStats, setMetaStats] = useState({});

    useEffect(() => {
        if (data?.challenges?.length) {
            const fetchAllMetaStats = async () => {
                const metaStatsData = {};
                for (const challenge of data.challenges) {
                    if (challenge.idMeta) {
                        try {
                            const metaData = await fetchMetaStats(challenge.idMeta);
                            metaStatsData[challenge.idMeta] = metaData.metrics?.balance;
                        } catch (error) {
                            console.error(`Error en Metastats para idMeta ${challenge.idMeta}:`, error);
                        }
                    }
                }
                setMetaStats(metaStatsData);
            };
            fetchAllMetaStats();
        }
    }, [data?.challenges]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("visibility", JSON.stringify(visibility));
        }
    }, [visibility]);

    if (isLoading) return <Loader />;
    if (error) return <p className="text-center text-red-500">Error al cargar los datos: {error.message}</p>;

    const isVerified = data?.isVerified;
    const toggleVisibility = (id) => setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));

    const phase = [
        { key: "3", label: "Fase Neotrader" },
        { key: "2", label: "Fase Practicante" },
        { key: "1", label: "Fase Estudiante" },
    ];

    return (
        <div>
            {phase.map(({ key, label }) => {
                const challenges = data?.challenges?.filter(challenge => challenge.phase == key) || [];
                if (challenges.length === 0) return null;

                return (
                    <div key={key}>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">{label}</h2>
                        {key === "3" && !isVerified ? (
                            <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow-md mb-6">
                                <div className="flex items-center space-x-2">
                                    <BellIcon className="h-6 w-6 text-amber-500 dark:text-amber-300" />
                                    <span className="text-sm text-amber-800 dark:text-yellow-300 font-medium">
                                        Por favor verifica tu cuenta para acceder a la fase Neotrader.
                                    </span>
                                </div>
                                <button
                                    onClick={() => router.push("/profile")}
                                    className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-md text-sm"
                                >
                                    Verificar ahora
                                </button>
                            </div>
                        ) : (
                            challenges.map((challenge, index) => {
                                const isVisible = visibility[challenge.id] ?? true;
                                const balance = metaStats[challenge.idMeta];
                                return (
                                    <div
                                        key={index}
                                        className="relative p-6 mb-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black"
                                    >
                                        <p className="text-sm font-bold text-zinc-800 mb-2 dark:text-zinc-200">
                                            Login: {challenge.login}
                                        </p>
                                        {isVisible && (
                                            <>
                                                <div className="mt-2 flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-8">
                                                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                        Balance:{" "}
                                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                                            ${balance !== undefined ? balance : challenge.initBalance || "-"}
                                                        </span>
                                                    </p>
                                                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                        Fin:{" "}
                                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                                            {challenge.endDate
                                                                ? new Date(challenge.endDate).toLocaleDateString()
                                                                : "-"}
                                                        </span>
                                                    </p>
                                                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                        Resultado:{" "}
                                                        <span className={`font-bold ${{
                                                            progress: 'text-yellow-500',
                                                            disapproved: 'text-red-500',
                                                            approved: 'text-green-500'
                                                        }[challenge.result] || 'text-slate-800 dark:text-slate-200'}`}>
                                                            {{
                                                                progress: 'En curso',
                                                                disapproved: 'Desaprobado',
                                                                approved: 'Aprobado'
                                                            }[challenge.result] || challenge.result}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="mt-4 flex space-x-4">
                                                    <CredencialesModal {...challenge} />
                                                    <Link href={`/metrix/${challenge.documentId}`}>
                                                        <button className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border-gray-300 dark:border-zinc-500">
                                                            <ChartBarIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                                                            <span className="text-xs lg:text-sm dark:text-zinc-200">Metrix</span>
                                                        </button>
                                                    </Link>
                                                </div>
                                            </>
                                        )}
                                        <div className="absolute bottom-6 right-6 flex items-center">
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id={`visible-mode-${index}`}
                                                    checked={isVisible}
                                                    onCheckedChange={() => toggleVisibility(challenge.id)}
                                                />
                                                <Label htmlFor={`visible-mode-${index}`}>Visible</Label>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                );
            })}
        </div>

    );
}

/* src/pages/dashboard/UserPanel.js */
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChartBarIcon, BellIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import Loader from '../../components/loaders/loader';
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ButtonInit from 'src/pages/dashboard/button_init';
import MetaApi, { MetaStats } from 'metaapi.cloud-sdk';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import NeoChallengeCard from './neoCard';
import BilleteraCripto from '../../components/wallet/crypto-wallet';

const fetcher = async (url, token) => {
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
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

    const [balances, setBalances] = useState({});
    const [isLoadingBalances, setIsLoadingBalances] = useState(true);
    const [visibility, setVisibility] = useState(() => {
        if (typeof window !== "undefined") {
            return JSON.parse(localStorage.getItem("visibility") || "{}");
        }
        return {};
    });

    useEffect(() => {
        if (data?.challenges) {
            const fetchBalances = async () => {
                setIsLoadingBalances(true);
                const metaStats = new MetaStats(process.env.NEXT_PUBLIC_TOKEN_META_API);
                const newBalances = {};

                for (const challenge of data.challenges) {
                    if (challenge.broker_account?.idMeta) {
                        try {
                            const metrics = await metaStats.getMetrics(challenge.broker_account.idMeta);
                            newBalances[challenge.id] = metrics.balance;
                        } catch (error) {
                            console.error(`Error obteniendo el balance para ${challenge.broker_account.idMeta}:`, error);
                            newBalances[challenge.id] = challenge.broker_account.balance || "No disponible";
                        }
                    } else {
                        newBalances[challenge.id] = "No asignado";
                    }
                }
                setBalances(newBalances);
                setIsLoadingBalances(false);
            };

            fetchBalances();
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

    // Filtrar challenges que están "en curso" o "por iniciar"
    const activeChallenges = data?.challenges?.filter(challenge => 
        challenge.result === "init" || challenge.result === "progress"
    ) || [];

    // Agrupar los challenges filtrados por parentId
    const groupedChallenges = activeChallenges.reduce((acc, challenge) => {
        const key = challenge.parentId || challenge.documentId;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(challenge);
        // Ordenar por phase dentro del grupo
        acc[key].sort((a, b) => a.phase - b.phase);
        return acc;
    }, {});

    return (
        <div>
            {activeChallenges.length === 0 && <NeoChallengeCard />}

            {Object.entries(groupedChallenges).length > 0 ? (
                Object.entries(groupedChallenges).map(([parentId, challenges]) => (
                    <div key={parentId} className="mb-8">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                            Grupo: {parentId} ({challenges.length} {challenges.length === 1 ? 'fase' : 'fases'})
                        </h2>

                        {challenges.map((challenge, index) => {
                            const isVisible = visibility[challenge.id] ?? true;

                            let balanceDisplay;
                            if (challenge.result === "init") {
                                balanceDisplay = "Por iniciar";
                            } else if (!challenge.broker_account) {
                                balanceDisplay = "No asignado";
                            } else if (isLoadingBalances) {
                                balanceDisplay = "Cargando...";
                            } else {
                                balanceDisplay = balances[challenge.id] ?? "No disponible";
                            }

                            return (
                                <div
                                    key={index}
                                    className="relative p-6 mb-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black"
                                >
                                    <p className="text-sm font-bold text-zinc-800 mb-2 dark:text-zinc-200">
                                        Fase {challenge.phase} - Login: {challenge.broker_account?.login || "-"}
                                    </p>

                                    {isVisible && (
                                        <>
                                            <div className="mt-2 flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-8">
                                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                    Balance: <span className="font-bold text-slate-800 dark:text-slate-200">
                                                        {typeof balanceDisplay === "number" ? `$${balanceDisplay}` : balanceDisplay}
                                                    </span>
                                                </p>
                                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                    Inicio: <span className="font-bold text-slate-800 dark:text-slate-200">
                                                        {challenge.startDate ? new Date(challenge.startDate).toLocaleDateString() : "-"}
                                                    </span>
                                                </p>
                                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                    Fin: <span className="font-bold text-slate-800 dark:text-slate-200">
                                                        {challenge.endDate ? new Date(challenge.endDate).toLocaleDateString() : "-"}
                                                    </span>
                                                </p>
                                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                    Resultado: <span className={`font-bold ${{
                                                        progress: 'text-[var(--app-primary)]',
                                                        disapproved: 'text-red-500',
                                                        approved: 'text-green-500'
                                                    }[challenge.result] || 'text-slate-800 dark:text-slate-200'}`}>
                                                        {{
                                                            init: 'Por iniciar',
                                                            progress: 'En curso',
                                                            disapproved: 'Desaprobado',
                                                            approved: 'Aprobado',
                                                            retry: 'Repetir'
                                                        }[challenge.result] || challenge.result}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="mt-4 flex space-x-4">
                                                <Link href={`/metrix2/${challenge.documentId}`}>
                                                    <button className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border-gray-300 dark:border-zinc-500">
                                                        <ChartBarIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                                                        <span className="text-xs lg:text-sm dark:text-zinc-200">Metrix</span>
                                                    </button>
                                                </Link>

                                                {isVerified && String(challenge.phase) === "3" && challenge.result === "approved" && (
                                                    <BilleteraCripto
                                                        balance={balances[challenge.id] || "0"}
                                                        brokerBalance={challenge.broker_account?.balance || "0"}
                                                        userId={data?.id}
                                                        challengeId={challenge.documentId}
                                                    />
                                                )}
                                            </div>
                                        </>
                                    )}

                                    <ButtonInit documentId={challenge.documentId} result={challenge.result} phase={challenge.phase} />

                                    <div className="mt-4 flex items-center justify-end">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id={`visible-mode-${challenge.id}-${index}`}
                                                checked={isVisible}
                                                onCheckedChange={() => toggleVisibility(challenge.id)}
                                            />
                                            <Label htmlFor={`visible-mode-${challenge.id}-${index}`}>Visible</Label>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">No hay challenges disponibles.</p>
            )}
        </div>
    );
}
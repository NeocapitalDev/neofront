/* src/pages/dashboard/UserPanel.js */
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChartBarIcon } from '@heroicons/react/24/outline';
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
    console.log('Session:', session);
    const router = useRouter();

    // URL modificada para incluir challenge_relation y sus stages
    const { data, error, isLoading } = useSWR(
        session?.jwt
            ? [
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me?populate[challenges][populate][broker_account]=*&populate[challenges][populate][withdraw]=*&populate[challenges][populate][challenge_relation][populate][challenge_stages]=*`,
                session.jwt
            ]
            : null,
        ([url, token]) => fetcher(url, token)
    );
    console.log('Data:', data);

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
                        newBalances[challenge.id] = "1000000";
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

    // Función para obtener el nombre del stage según la fase del challenge
    const getStageName = (challenge) => {
        if (!challenge.challenge_relation?.challenge_stages ||
            !Array.isArray(challenge.challenge_relation.challenge_stages) ||
            challenge.challenge_relation.challenge_stages.length === 0) {
            return `Fase ${challenge.phase}`;
        }

        // Ordenar los stages (asumimos que tienen un orden implícito por ID)
        const sortedStages = [...challenge.challenge_relation.challenge_stages].sort((a, b) => a.id - b.id);

        // Verificar si hay un stage correspondiente a la fase actual
        if (challenge.phase > 0 && challenge.phase <= sortedStages.length) {
            return sortedStages[challenge.phase - 1].name || `Fase ${challenge.phase}`;
        }

        return `Fase ${challenge.phase}`;
    };

    if (isLoading) return <Loader />;
    if (error) return <p className="text-center text-red-500">Error al cargar los datos: {error.message}</p>;

    const isVerified = data?.isVerified;
    const toggleVisibility = (id) => setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));

    // Filtrar challenges que están "en curso" o "por iniciar"
    const activeChallenges = data?.challenges
        ?.map((challenge) => {
            console.log('Full Challenge Object:', JSON.stringify(challenge, null, 2));
            console.log('Challenge Withdraw:', challenge.withdraw);
            console.log('Challenge Details:', {
                documentId: challenge.documentId,
                phase: challenge.phase,
                result: challenge.result,
                hasWithdraw: !!challenge.withdraw,
                withdrawDetails: challenge.withdraw,
                stageInfo: challenge.challenge_relation?.challenge_stages
            });
            return challenge;
        })
        .filter((challenge) => {
            // Siempre mostrar challenges en init o progress
            if (challenge.isactive === false) {
                return false;
            }
            if (challenge.result === "init" || challenge.result === "progress") {
                return true;
            }

            // Para challenges en phase 3
            if (challenge.phase === 3) {
                // Mostrar si está aprobado y NO tiene retiro
                return challenge.result === "approved" && !challenge.withdraw;
            }

            return false;
        }) || [];

    console.log('Active Challenges:', activeChallenges);

    // Agrupar los challenges por stage (fase)
    const groupedChallengesByStage = activeChallenges.reduce((acc, challenge) => {
        const stageName = getStageName(challenge);
        if (!acc[stageName]) {
            acc[stageName] = [];
        }
        acc[stageName].push(challenge);
        return acc;
    }, {});

    // Ordenar los stages por su número de fase
    const sortedStages = Object.keys(groupedChallengesByStage).sort((a, b) => {
        const extractPhaseNumber = (stageName) => {
            const match = stageName.match(/Fase (\d+)/);
            return match ? parseInt(match[1]) : 0;
        };
        return extractPhaseNumber(a) - extractPhaseNumber(b);
    });

    return (
        <div>
            {activeChallenges.length === 0 && <NeoChallengeCard />}

            {sortedStages.length > 0 ? (
                sortedStages.map((stageName) => {
                    const stageChallengers = groupedChallengesByStage[stageName];
                    return (
                        <div key={stageName} className="mb-8">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                                {stageName}
                                {/* ({stageChallengers.length} {stageChallengers.length === 1 ? 'challenge' : 'challenges'}) */}
                            </h2>

                            {stageChallengers.map((challenge, index) => {
                                const isVisible = visibility[challenge.id] ?? true;

                                let balanceDisplay;
                                if (!challenge?.broker_account?.balance) {
                                    balanceDisplay = "No disponible";
                                } else {
                                    balanceDisplay = challenge.broker_account.balance;
                                }

                                return (
                                    <div
                                        key={index}
                                        className="relative p-6 mb-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black"
                                    >
                                        <p className="font-bold text-zinc-800 mb-2 dark:text-zinc-200 text-lg">
                                            Challenge - {challenge.parentId || challenge.documentId}
                                            <br />
                                            <span className='text-sm'>Login: {challenge.broker_account?.login || "-"}</span>
                                        </p>

                                        {isVisible && (
                                            <>
                                                <div className="mt-2 flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-8">
                                                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                        Balance:{" "}
                                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                                            {typeof balanceDisplay === "number" ? `$${balanceDisplay}` : balanceDisplay}
                                                        </span>
                                                    </p>
                                                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                        Inicio:{" "}
                                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                                            {challenge.startDate ? new Date(challenge.startDate).toLocaleDateString() : "-"}
                                                        </span>
                                                    </p>
                                                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                        Fin:{" "}
                                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                                            {challenge.endDate ? new Date(challenge.endDate).toLocaleDateString() : "-"}
                                                        </span>
                                                    </p>
                                                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                        Resultado:{" "}
                                                        <span
                                                            className={`font-bold ${{
                                                                progress: "text-[var(--app-primary)]",
                                                                disapproved: "text-red-500",
                                                                approved: "text-green-500",
                                                            }[challenge.result] || "text-slate-800 dark:text-slate-200"
                                                                }`}
                                                        >
                                                            {
                                                                {
                                                                    init: "Por iniciar",
                                                                    progress: "En curso",
                                                                    disapproved: "Desaprobado",
                                                                    approved: "Aprobado",
                                                                    retry: "Repetir",
                                                                }[challenge.result] || challenge.result
                                                            }
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="mt-4 flex space-x-4 items-center">
                                                    <Link href={`/metrix2/${challenge.documentId}`}>
                                                        <button className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border-gray-300 dark:border-zinc-500">
                                                            <ChartBarIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                                                            <span className="text-xs lg:text-sm dark:text-zinc-200">Metrix</span>
                                                        </button>
                                                    </Link>
                                                    {!isVerified && challenge.phase === 3 &&
                                                        challenge.result === "approved" && (<p className='font-light text-gray-300'>Debes estar verificado para retirar tus ganancias, ve al apartado de verificación.</p>)}
                                                    {isVerified &&
                                                        challenge.phase === 3 &&
                                                        challenge.result === "approved" && (
                                                            <div className='flex gap-2 items-center'>
                                                                <BilleteraCripto
                                                                    balance={balances[challenge.id] || 1000000}
                                                                    brokerBalance={challenge.broker_account?.balance || "0"}
                                                                    userId={data?.id}
                                                                    challengeId={challenge.documentId}
                                                                />
                                                            </div>
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
                    );
                })
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">No hay challenges disponibles.</p>
            )}
        </div>
    );
}
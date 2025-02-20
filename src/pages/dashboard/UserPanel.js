import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChartBarIcon, BellIcon } from '@heroicons/react/24/outline';
import CredencialesModal from './credentials';
import Loader from '../../components/loaders/loader';
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ButtonInit from 'src/pages/dashboard/button_init';
import MetaApi, { MetaStats } from 'metaapi.cloud-sdk';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import NeoChallengeCard from './neoCard';


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
    const [visibility, setVisibility] = useState(() => {
        if (typeof window !== "undefined") {
            return JSON.parse(localStorage.getItem("visibility") || "{}");
        }
        return {};
    });

    useEffect(() => {
        if (data?.challenges) {
            const fetchBalances = async () => {
                const metaStats = new MetaStats(process.env.NEXT_PUBLIC_TOKEN_META_API);
                const newBalances = {};

                for (const challenge of data.challenges) {
                    if (challenge.broker_account?.idMeta) {
                        try {
                            const metrics = await metaStats.getMetrics(challenge.broker_account.idMeta);
                            newBalances[challenge.broker_account.idMeta] = metrics.balance;
                        } catch (error) {
                            console.error(`Error obteniendo el balance para ${challenge.broker_account.idMeta}:`, error);
                            // Usar el balance inicial en lugar de "Error"
                            newBalances[challenge.broker_account.idMeta] = challenge.broker_account.balance || "No disponible";
                        }
                    }
                }
                setBalances(newBalances);
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

    return (
        <div>
            {/* Mostrar la tarjeta NeoChallengeCard solo cuando no haya desafíos activos */}
            {data?.challenges?.length === 0 && <NeoChallengeCard />}

            {["3", "2", "1"].map(key => {
                const challenges = data?.challenges?.filter(challenge => challenge.phase == key) || [];
                if (challenges.length === 0) return null;

                return (
                    <div key={key}>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                            {key === "3" ? "Fase Neotrader" : key === "2" ? "Fase Practicante" : "Fase Estudiante"}
                        </h2>

                        {key === "3" && !isVerified ? (
                            <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow-md mb-6">
                                <div className="flex items-center gap-3">
                                    <BellIcon className="h-7 w-7 text-[var(--app-primary)] dark:text-[var(--app-primary)]" />
                                    <p className="text-base font-medium text-amber-800 dark:text-[var(--app-primary)]">
                                        Verifica tu cuenta para acceder a la fase <strong>Neotrader</strong>.
                                    </p>
                                </div>
                                <Link href="/verification" className="block mt-4 px-5 py-2.5 text-center bg-[var(--app-primary)] hover:bg-[var(--app-secondary)] text-black font-semibold rounded-lg shadow-md text-base transition">
                                    Verificar ahora
                                </Link>
                            </div>
                        ) : (
                            challenges.map((challenge, index) => {
                                const isVisible = visibility[challenge.id] ?? true;

                                let balance = balances[challenge.balance] ?? "Cargando...";
                                if (challenge.broker_account?.idMeta) {
                                    balance = balances[challenge.broker_account.idMeta] ?? balance;
                                }

                                return (
                                    <div
                                        key={index}
                                        className="relative p-6 mb-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black"
                                    >
                                        <p className="text-sm font-bold text-zinc-800 mb-2 dark:text-zinc-200">
                                            Login: {challenge.broker_account?.login || "-"}
                                        </p>

                                        {isVisible && (
                                            <>
                                                <div className="mt-2 flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-8">
                                                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                        Balance:{" "}
                                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                                            {balance === "Cargando..." ? balance : `$${balance}`}
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
                                                        <span className={`font-bold ${{
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
                                                    <CredencialesModal {...challenge.broker_account} />
                                                    <Link href={`/metrix/${challenge.documentId}`}>
                                                        <button className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border-gray-300 dark:border-zinc-500">
                                                            <ChartBarIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                                                            <span className="text-xs lg:text-sm dark:text-zinc-200">Metrix</span>
                                                        </button>
                                                    </Link>
                                                </div>
                                            </>
                                        )}

                                        <ButtonInit documentId={challenge.documentId} result={challenge.result} phase={challenge.phase} />

                                        {/* Botón de visibilidad abajo */}
                                        <div className="mt-4 flex items-center justify-end">
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

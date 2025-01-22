import { KeyIcon, ChartBarIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import CredencialesModal from './credentials';
import Link from 'next/link';

export default function Index() {
    const accountData = [
        {
            login: "530187422",
            balance: "$198,703.37",
            rewardDate: "23/1/2025",
            result: "En curso",
            resultClass: "text-yellow-500",
        },
        {
            login: "550016337",
            balance: "$202,647.26",
            rewardDate: "7/1/2025",
            result: "Repetir",
            resultClass: "text-blue-500",
        },
        {
            login: "520179378",
            balance: "$200,261.52",
            rewardDate: "19/12/2024",
            result: "Aprobado",
            resultClass: "text-green-500",
        },
        {
            login: "510238451",
            balance: "$150,120.45",
            rewardDate: "10/2/2025",
            result: "Pendiente",
            resultClass: "text-gray-500",
        },
        {
            login: "540012345",
            balance: "$300,560.10",
            rewardDate: "15/3/2025",
            result: "Finalizado",
            resultClass: "text-red-500",
        },
    ];

    const [visibility, setVisibility] = useState(
        Array(accountData.length).fill(true) // Estado para cada tarjeta
    );

    const toggleVisibility = (index) => {
        const updatedVisibility = [...visibility];
        updatedVisibility[index] = !updatedVisibility[index];
        setVisibility(updatedVisibility);
    };

    return (

        <div>
            {accountData.map((account, index) => (
                <div
                    key={index}
                    className="relative p-6 mb-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black"
                >
                    {/* Login */}
                    <p className="text-sm font-bold text-zinc-800 mb-2 dark:text-zinc-200">
                        Login:{' '}
                        <span className="font-semibold">
                            {account.login}
                        </span>
                    </p>

                    {/* Mostrar Balance, RewardDate y Result si está visible */}
                    {visibility[index] && (
                        <div className="mt-2 flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-8">
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-300">
                                Balance:{' '}
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {account.balance}
                                </span>
                            </p>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-300">
                                Día de Recompensa:{' '}
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {account.rewardDate}
                                </span>
                            </p>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-300">
                                Resultado:{' '}
                                <span className={`font-bold ${account.resultClass}`}>
                                    {account.result}
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Mostrar botones solo si está visible */}
                    {visibility[index] && (
                        <div className="mt-4 flex flex-col items-start space-y-2 lg:flex-row lg:space-y-0 lg:space-x-4">
                            <CredencialesModal />

                            <Link href={`/metrix/${account.login}`}>
                                <button className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 border-gray-300 dark:border-zinc-500">
                                    <ChartBarIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                                    <span className="text-xs lg:text-sm dark:text-zinc-200">MetriX</span>
                                </button>
                            </Link>

                        </div>
                    )}

                    {/* Toggle Visible */}
                    <div className="absolute bottom-4 right-4 flex items-center">
                        <span className="text-sm text-gray-600 mr-2 dark:text-gray-300">Visible</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={visibility[index]}
                                onChange={() => toggleVisibility(index)}
                                className="sr-only peer"
                            />
                            <div
                                className={`w-11 h-6 rounded-full peer-focus:outline-none transition-all ${visibility[index] ? 'bg-green-500' : 'bg-zinc-500'} dark:${visibility[index] ? 'bg-green-400' : 'bg-zinc-600'}`}
                            >
                                <div
                                    className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full transition-transform ${visibility[index] ? 'translate-x-5 bg-white' : 'translate-x-0 bg-gray-300 dark:bg-zinc-400'}`}
                                ></div>
                            </div>
                        </label>
                    </div>


                </div>
            ))}
        </div>

    );
}
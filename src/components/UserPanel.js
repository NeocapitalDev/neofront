import Layout from '../components/layout/dashboard';
import { KeyIcon, ChartBarIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

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
            <h2 className="text-lg font-semibold mb-4 text-gray-800">NEOCAPITAL Accounts</h2>

            {accountData.map((account, index) => (
                <div
                    key={index}
                    className="bg-white shadow-md rounded-lg p-6 relative mb-6"
                >
                    {/* Login */}
                    <p className="text-sm text-black mb-2">
                        Login:{' '}
                        <span className="font-medium text-slate-800">
                            {account.login}
                        </span>
                    </p>

                    {/* Mostrar Balance, RewardDate y Result si está visible */}
                    {visibility[index] && (
                        <div className="mt-2 flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-8">
                            <p className="text-sm text-gray-400">
                                Balance:{' '}
                                <span className="font-medium text-slate-800">
                                    {account.balance}
                                </span>
                            </p>
                            <p className="text-sm text-gray-400">
                                Día de Recompensa:{' '}
                                <span className="font-medium text-slate-800">
                                    {account.rewardDate}
                                </span>
                            </p>
                            <p className="text-sm text-gray-400">
                                Resultado:{' '}
                                <span className={`font-medium ${account.resultClass}`}>
                                    {account.result}
                                </span>
                            </p>
                        </div>
                    )}


                    {/* Mostrar botones solo si está visible */}
                    {visibility[index] && (
                        <div className="mt-4 flex flex-col items-start space-y-2 lg:flex-row lg:space-y-0 lg:space-x-4">
                            <button className="flex items-center justify-center space-x-2 px-2 py-1 border rounded-sm shadow-md bg-gray-0 hover:bg-gray-200 w-auto">
                                <KeyIcon className="h-6 w-6 text-gray-600" />
                                <span className="text-xs lg:text-sm">Credenciales</span>
                            </button>
                            <button className="flex items-center justify-center space-x-2 px-2 py-1 border rounded-sm shadow-md bg-gray-0 hover:bg-gray-200 w-auto">
                                <ChartBarIcon className="h-6 w-6 text-gray-600" />
                                <span className="text-xs lg:text-sm">MetriX</span>
                            </button>
                        </div>


                    )}

                    {/* Toggle Visible */}
                    <div className="absolute bottom-4 right-4 flex items-center">
                        <span className="text-sm text-gray-600 mr-2">Visible</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={visibility[index]}
                                onChange={() => toggleVisibility(index)}
                                className="sr-only peer"
                            />
                            <div
                                className={`w-11 h-6 rounded-full peer-focus:outline-none transition-all ${visibility[index] ? 'bg-green-500' : 'bg-zinc-500'
                                    }`}
                            >
                                <div
                                    className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full transition-transform ${visibility[index] ? 'translate-x-5 bg-white' : 'translate-x-0 bg-gray-300'
                                        }`}
                                ></div>
                            </div>
                        </label>
                    </div>
                </div>
            ))}
        </div>
    );


}

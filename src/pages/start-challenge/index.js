import Layout from "../../components/layout/dashboard";
import { useState } from "react";
import Image from "next/image";
import { UserIcon } from '@heroicons/react/24/outline';

const StartChallenge = () => {
    const [selectedCurrency, setSelectedCurrency] = useState("USD");
    const [selectedBalance, setSelectedBalance] = useState("100000");
    const [selectedAccount, setSelectedAccount] = useState("NEO");
    const [selectedPlatform, setSelectedPlatform] = useState("MT4");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [refundPolicyAccepted, setRefundPolicyAccepted] = useState(false);

    const getChallengeLink = () => {
        switch (selectedBalance) {
            case "5,000":
                return "https://neocapitalfunding.com/desafio-neo-5k/";
            case "10,000":
                return "https://neocapitalfunding.com/desafio-neo-10k/";
            case "25,000":
                return "https://neocapitalfunding.com/desafio-neo-25k/";
            case "50,000":
                return "https://neocapitalfunding.com/desafio-neo-50k/";
            case "100,000":
                return "https://neocapitalfunding.com/desafio-neo-100k/";
            default:
                return "#";
        }
    };

    return (
        <Layout>
            <div className="p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <UserIcon className="w-6 h-6 text-gray-600 dark:text-gray-200" />
                        <h1 className="text-xl font-semibold">Configure su producto </h1>
                    </div>
                </div>
            </div>

            <div className="p-6 mt-5 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black">
                {/* Balance de la Cuenta */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Balance de Cuenta</h3>
                    <div className="grid mt-6 grid-cols-3 gap-2">
                        {["5,000", "10,000", "25,000", "50,000", "100,000"].map((balance) => (
                            <button
                                key={balance}
                                onClick={() => setSelectedBalance(balance)}
                                className={`px-4 py-3 rounded-md border ${selectedBalance === balance ? "bg-amber-600" : "bg-zinc-700"}`}
                            >
                                {balance} USD
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tipo de Cuenta */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Tipo de Cuenta (Apalancamiento 1:100)</h3>
                    <div className="flex gap-2">
                        {["NEO"].map((account) => (
                            <button
                                key={account}
                                onClick={() => setSelectedAccount(account)}
                                className={`px-4 py-3 rounded-md border ${selectedAccount === account ? "bg-amber-600" : "bg-zinc-700"}`}
                            >
                                {account}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Plataforma */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Plataforma</h3>
                    <div className="flex gap-2">
                        {["MT4"].map((platform) => (
                            <button
                                key={platform}
                                onClick={() => setSelectedPlatform(platform)}
                                className={`px-4 py-3 rounded-md border ${selectedPlatform === platform ? "bg-amber-600" : "bg-zinc-700"}`}
                            >
                                {platform}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Términos y Pago */}
                <div className="mb-6">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={() => setTermsAccepted(!termsAccepted)}
                        />
                        <span>Declaro que he leído y estoy de acuerdo con <span className="text-amber-500">Términos y Condiciones</span></span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            checked={refundPolicyAccepted}
                            onChange={() => setRefundPolicyAccepted(!refundPolicyAccepted)}
                        />
                        <span>Declaro que he leído y estoy de acuerdo con <span className="text-amber-500">Política de Cancelación y Reembolso</span></span>
                    </div>
                </div>

                {/* Precio y Botón de Pago */}
                <div className="text-center">
                    <p className="text-xl py-5 font-semibold text-green-400">
                        {selectedBalance === "5,000" ? "$44" :
                            selectedBalance === "10,000" ? "$79" :
                                selectedBalance === "25,000" ? "$179" :
                                    selectedBalance === "50,000" ? "$299" :
                                        selectedBalance === "100,000" ? "$499" : ""}
                    </p>
                    <a href={getChallengeLink()} className="mt-9 bg-amber-600 text-white px-6 py-3 rounded-md w-full font-semibold">
                        Confirmar y Proceder al Pago
                    </a>
                </div>
            </div>
        </Layout>
    );
};

export default StartChallenge;

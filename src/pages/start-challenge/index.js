import Layout from "../../components/layout/dashboard";
import { useState } from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";

const CHALLENGE_OPTIONS = [
    { balance: "5,000", price: "$44", link: "https://neocapitalfunding.com/desafio-neo-5k/" },
    { balance: "10,000", price: "$79", link: "https://neocapitalfunding.com/desafio-neo-10k/" },
    { balance: "25,000", price: "$179", link: "https://neocapitalfunding.com/desafio-neo-25k/" },
    { balance: "50,000", price: "$299", link: "https://neocapitalfunding.com/desafio-neo-50k/" },
    { balance: "100,000", price: "$499", link: "https://neocapitalfunding.com/desafio-neo-100k/" }
];

const PLATFORMS = ["MT4"];

const StartChallenge = () => {
    const { data: session } = useSession();
    const email = session?.user?.email || "";
    const firstName = session?.firstName || "";
    const lastName = session?.lastName || "";

    const [selectedBalance, setSelectedBalance] = useState(CHALLENGE_OPTIONS[0].balance);
    const [selectedPlatform, setSelectedPlatform] = useState("MT4");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [refundPolicyAccepted, setRefundPolicyAccepted] = useState(false);

    const isButtonDisabled = !termsAccepted || !refundPolicyAccepted;
    const selectedChallenge = CHALLENGE_OPTIONS.find(ch => ch.balance === selectedBalance) || CHALLENGE_OPTIONS[0];
    const challengeLink = `${selectedChallenge.link}?billing_email=${encodeURIComponent(email)}&billing_first_name=${encodeURIComponent(firstName)}&billing_last_name=${encodeURIComponent(lastName)}`;

    return (
        <Layout>
            <div className="p-6 dark:bg-zinc-800 bg-white shadow-lg rounded-lg dark:text-white">
                <div className="flex items-center space-x-2">
                    <UserIcon className="w-6 h-6 text-gray-600 dark:text-gray-200" />
                    <h1 className="text-xl font-semibold">Configure su producto</h1>
                </div>
            </div>

            <div className="p-6 mt-5 dark:bg-zinc-800 bg-white shadow-lg rounded-lg dark:text-white">
                {/* Balance de la Cuenta */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Balance de Cuenta</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {CHALLENGE_OPTIONS.map(({ balance }) => (
                            <button
                                key={balance}
                                onClick={() => setSelectedBalance(balance)}
                                className={`px-4 py-3 rounded-md shadow-md transition-colors ${selectedBalance === balance ? "bg-amber-500 text-black" : "bg-zinc-700 text-white"}`}
                            >
                                {balance} USD
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tipo de Plataforma */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Plataforma</h3>
                    <div className="flex gap-2">
                        {PLATFORMS.map((platform) => (
                            <button
                                key={platform}
                                onClick={() => setSelectedPlatform(platform)}
                                className={`px-4 py-3 rounded-md shadow-md transition-colors ${selectedPlatform === platform ? "bg-amber-500 text-black" : "bg-zinc-700 text-white"}`}
                            >
                                {platform}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Términos y Pago */}
                <div className="mb-6 space-y-2">
                    {[{
                        label: "Términos y Condiciones",
                        state: termsAccepted,
                        setter: setTermsAccepted
                    }, {
                        label: "Política de Cancelación y Reembolso",
                        state: refundPolicyAccepted,
                        setter: setRefundPolicyAccepted
                    }].map(({ label, state, setter }, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input type="checkbox" className="rounded-md" checked={state} onChange={() => setter(!state)} />
                            <span>
                                Declaro que he leído y estoy de acuerdo con <span className="text-amber-500">{label}</span>
                            </span>
                        </div>
                    ))}
                </div>

                {/* Precio y Botón de Pago */}
                <div className="text-center">
                    <p className="text-xl py-5 font-semibold text-green-400">{selectedChallenge.price}</p>
                    <a
                        href={challengeLink}
                        className={`mt-9 bg-amber-500 text-black px-6 py-3 rounded-md w-full font-semibold block text-center transition-opacity ${isButtonDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-amber-400"}`}
                        onClick={(e) => isButtonDisabled && e.preventDefault()}
                    >
                        Confirmar y Proceder al Pago
                    </a>
                </div>
            </div>
        </Layout>
    );
};

export default StartChallenge;

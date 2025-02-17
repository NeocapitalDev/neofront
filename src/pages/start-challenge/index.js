import Layout from "../../components/layout/dashboard";
import { useState } from "react";
import Image from "next/image";

const StartChallenge = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedBalance, setSelectedBalance] = useState("100000");
  const [selectedAccount, setSelectedAccount] = useState("FTMO");
  const [selectedPlatform, setSelectedPlatform] = useState("MT5");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [refundPolicyAccepted, setRefundPolicyAccepted] = useState(false);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto  text-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Configure sus requisitos e inicie el FTMO Challenge</h2>
        
        {/* Moneda de la Cuenta */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Moneda de la Cuenta de Trading</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {["USD", "EUR", "CZK", "GBP", "AUD", "CAD", "CHF"].map((currency) => (
              <button
                key={currency}
                onClick={() => setSelectedCurrency(currency)}
                className={`px-4 py-2 rounded-md border ${selectedCurrency === currency ? "bg-amber-600" : "bg-gray-700"}`}
              >
                {currency}
              </button>
            ))}
          </div>
        </div>

        {/* Balance de la Cuenta */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Balance de Cuenta</h3>
          <div className="grid grid-cols-3 gap-2">
            {["200000", "100000", "50000", "25000", "10000"].map((balance) => (
              <button
                key={balance}
                onClick={() => setSelectedBalance(balance)}
                className={`px-4 py-2 rounded-md border ${selectedBalance === balance ? "bg-amber-600" : "bg-gray-700"}`}
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
            {["FTMO", "FTMO Swing"].map((account) => (
              <button
                key={account}
                onClick={() => setSelectedAccount(account)}
                className={`px-4 py-2 rounded-md border ${selectedAccount === account ? "bg-amber-600" : "bg-gray-700"}`}
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
            {["MT5", "MT4", "cTrader", "DXtrade"].map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-4 py-2 rounded-md border ${selectedPlatform === platform ? "bg-amber-600" : "bg-gray-700"}`}
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
          <p className="text-xl font-semibold text-green-400">$1,144.04</p>
          <button className="mt-4 bg-amber-600 text-white px-6 py-3 rounded-md w-full font-semibold">
            Confirmar y Proceder al Pago
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default StartChallenge;
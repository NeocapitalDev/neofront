"use client";
import { useState } from "react";

// Arrays de datos simulados
const STEPS = [
  { id: 1, label: "Instant" },
  { id: 2, label: "1 Step" },
  { id: 3, label: "2 Step" },
];

const PRODUCTS = [
  { id: 1, label: "FundingPips Zero" },
  { id: 2, label: "FundingPips" },
  { id: 3, label: "FundingPips Pro" },
];

const ACCOUNTS = [
  { id: 1, label: "$5K" },
  { id: 2, label: "$10K" },
  { id: 3, label: "$25K" },
  { id: 4, label: "$50K" },
  { id: 5, label: "$100K" },
];

// Stages con campos configurables
const STAGES = [
  {
    id: 1,
    stage: "Student",
    minimumTradingDays: "3 days",
    maxDailyLoss: "4%",
    maxLoss: "6%",
    profitTarget: "8%",
    leverage: "1:50",
  },
  {
    id: 2,
    stage: "Practitioner",
    minimumTradingDays: "3 days",
    maxDailyLoss: "5%",
    maxLoss: "9%",
    profitTarget: "12%",
    leverage: "1:200",
  },
  {
    id: 3,
    stage: "Master",
    minimumTradingDays: "",
    maxDailyLoss: "3%",
    maxLoss: "5%",
    profitTarget: "8%",
    leverage: "1:50",
  },
];

export default function BrokerAccountCreator() {
  // Lista de cuentas creadas (array local)
  const [brokerAccounts, setBrokerAccounts] = useState([]);

  // Selecciones principales
  const [selectedStepId, setSelectedStepId] = useState(STEPS[0].id);
  const [selectedProductId, setSelectedProductId] = useState(PRODUCTS[0].id);
  const [selectedAccountId, setSelectedAccountId] = useState(ACCOUNTS[0].id);
  const [selectedStageId, setSelectedStageId] = useState(STAGES[0].id);

  // Campos del Stage (permitimos editar/override)
  const [minTradingDays, setMinTradingDays] = useState(STAGES[0].minimumTradingDays);
  const [maxDailyLoss, setMaxDailyLoss] = useState(STAGES[0].maxDailyLoss);
  const [maxLoss, setMaxLoss] = useState(STAGES[0].maxLoss);
  const [profitTarget, setProfitTarget] = useState(STAGES[0].profitTarget);
  const [leverage, setLeverage] = useState(STAGES[0].leverage);

  // Otros campos de la cuenta
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [balance, setBalance] = useState(0);
  const [server, setServer] = useState("");
  const [platform, setPlatform] = useState("");

  // Cuando el usuario selecciona un Stage distinto en el <select>,
  // cargamos sus valores por defecto para permitir override.
  const handleStageChange = (newStageId) => {
    setSelectedStageId(newStageId);
    const stageObj = STAGES.find((s) => s.id === Number(newStageId));
    if (stageObj) {
      setMinTradingDays(stageObj.minimumTradingDays || "");
      setMaxDailyLoss(stageObj.maxDailyLoss || "");
      setMaxLoss(stageObj.maxLoss || "");
      setProfitTarget(stageObj.profitTarget || "");
      setLeverage(stageObj.leverage || "");
    }
  };

  // Función para crear la cuenta
  const handleCreateBrokerAccount = () => {
    const newId = brokerAccounts.length + 1;

    const stepObj = STEPS.find((s) => s.id === Number(selectedStepId));
    const productObj = PRODUCTS.find((p) => p.id === Number(selectedProductId));
    const accountObj = ACCOUNTS.find((a) => a.id === Number(selectedAccountId));
    const stageObj = STAGES.find((st) => st.id === Number(selectedStageId));

    // Creamos un objeto con toda la info
    const newBrokerAccount = {
      id: newId,
      step: stepObj,
      product: productObj,
      account: accountObj,
      // guardamos el "stage" con sus valores override
      stage: {
        ...stageObj,
        // Sobrescribimos los campos que el usuario haya editado
        minimumTradingDays: minTradingDays,
        maxDailyLoss,
        maxLoss,
        profitTarget,
        leverage,
      },
      login,
      password,
      balance: Number(balance),
      server,
      platform,
    };

    setBrokerAccounts([...brokerAccounts, newBrokerAccount]);

    // Reset de campos
    setLogin("");
    setPassword("");
    setBalance(0);
    setServer("");
    setPlatform("");
  };

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Creador de BrokerAccount (con Stage editable)</h1>

      <div className="space-y-4 max-w-lg mb-8 bg-gray-800 p-4 rounded">
        {/* Selección de Step */}
        <div>
          <label className="block mb-1">Step</label>
          <select
            className="w-full p-2 bg-gray-700"
            value={selectedStepId}
            onChange={(e) => setSelectedStepId(e.target.value)}
          >
            {STEPS.map((step) => (
              <option key={step.id} value={step.id}>
                {step.label}
              </option>
            ))}
          </select>
        </div>

        {/* Selección de Product */}
        <div>
          <label className="block mb-1">Product</label>
          <select
            className="w-full p-2 bg-gray-700"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            {PRODUCTS.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.label}
              </option>
            ))}
          </select>
        </div>

        {/* Selección de Account */}
        <div>
          <label className="block mb-1">Account</label>
          <select
            className="w-full p-2 bg-gray-700"
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
          >
            {ACCOUNTS.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.label}
              </option>
            ))}
          </select>
        </div>

        {/* Selección de Stage + edición de campos */}
        <div>
          <label className="block mb-1">Stage</label>
          <select
            className="w-full p-2 bg-gray-700"
            value={selectedStageId}
            onChange={(e) => handleStageChange(e.target.value)}
          >
            {STAGES.map((st) => (
              <option key={st.id} value={st.id}>
                {st.stage}
              </option>
            ))}
          </select>
        </div>

        {/* Campos editables de Stage */}
        <div className="bg-gray-700 p-3 rounded space-y-2">
          <div>
            <label className="block mb-1 text-sm">Minimum Trading Days</label>
            <input
              className="w-full p-2 bg-gray-600"
              value={minTradingDays}
              onChange={(e) => setMinTradingDays(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Max Daily Loss</label>
            <input
              className="w-full p-2 bg-gray-600"
              value={maxDailyLoss}
              onChange={(e) => setMaxDailyLoss(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Max Loss</label>
            <input
              className="w-full p-2 bg-gray-600"
              value={maxLoss}
              onChange={(e) => setMaxLoss(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Profit Target</label>
            <input
              className="w-full p-2 bg-gray-600"
              value={profitTarget}
              onChange={(e) => setProfitTarget(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Leverage</label>
            <input
              className="w-full p-2 bg-gray-600"
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
            />
          </div>
        </div>

        {/* Campos de credenciales de Broker */}
        <button
          onClick={handleCreateBrokerAccount}
          className="px-4 py-2 bg-green-500 text-black font-semibold rounded mt-2"
        >
          Crear Cuenta
        </button>
      </div>

      {/* Tabla de cuentas creadas */}
      <h2 className="text-xl font-semibold mb-2">Cuentas Creadas</h2>
      <table className="w-full bg-gray-800 rounded">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Step</th>
            <th className="p-2 text-left">Product</th>
            <th className="p-2 text-left">Account</th>
            <th className="p-2 text-left">Stage</th>
            <th className="p-2 text-left">Min Days</th>
            <th className="p-2 text-left">Max Daily Loss</th>
            <th className="p-2 text-left">Max Loss</th>
            <th className="p-2 text-left">Profit Target</th>
            <th className="p-2 text-left">Leverage</th>

          </tr>
        </thead>
        <tbody>
          {brokerAccounts.map((ba) => (
            <tr key={ba.id} className="border-b border-gray-700">
              <td className="p-2">{ba.id}</td>
              <td className="p-2">{ba.step.label}</td>
              <td className="p-2">{ba.product.label}</td>
              <td className="p-2">{ba.account.label}</td>
              <td className="p-2">{ba.stage.stage}</td>
              <td className="p-2">{ba.stage.minimumTradingDays}</td>
              <td className="p-2">{ba.stage.maxDailyLoss}</td>
              <td className="p-2">{ba.stage.maxLoss}</td>
              <td className="p-2">{ba.stage.profitTarget}</td>
              <td className="p-2">{ba.stage.leverage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

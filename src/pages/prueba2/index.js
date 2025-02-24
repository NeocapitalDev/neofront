"use client";

import { useState } from "react";

export default function FundingSteps() {
    // Arreglo de datos con la nueva distribución de productos
    const stepsData = [
        {
            // INSTANT: solo FundingPips Zero
            id: "instant",
            label: "Instant (Limited time)",
            products: [
                {
                    id: "fundingpips-zero",
                    label: "FundingPips Zero",
                    accounts: [
                        {
                            id: "5k",
                            label: "$5K",
                            stages: [
                                {
                                    stage: "Master",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    leverage: "1:50",
                                    rewardsSplit: "Bi-weekly 95%",
                                },
                            ],
                        },
                        {
                            id: "10k",
                            label: "$10K",
                            stages: [
                                {
                                    stage: "Master",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    leverage: "1:50",
                                    rewardsSplit: "Bi-weekly 95%",
                                },
                            ],
                        },
                        {
                            id: "25k",
                            label: "$25K",
                            stages: [
                                {
                                    stage: "Master",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    leverage: "1:50",
                                    rewardsSplit: "Bi-weekly 95%",
                                },
                            ],
                        },
                        {
                            id: "50k",
                            label: "$50K",
                            stages: [
                                {
                                    stage: "Master",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    leverage: "1:50",
                                    rewardsSplit: "Bi-weekly 95%",
                                },
                            ],
                        },
                        {
                            id: "100k",
                            label: "$100K",
                            stages: [
                                {
                                    stage: "Master",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    leverage: "1:50",
                                    rewardsSplit: "Bi-weekly 95%",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            // 1 STEP: solo FundingPips
            id: "1-step",
            label: "1 Step",
            products: [
                {
                    id: "fundingpips",
                    label: "FundingPips",
                    accounts: [
                        {
                            id: "5k",
                            label: "$5K",
                            stages: [
                                {
                                    stage: "Student",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "4%",
                                    maxLoss: "6%",
                                    profitTarget: "8%",
                                    leverage: "1:50",
                                },
                                {
                                    stage: "Master",
                                    maxDailyLoss: "4%",
                                    maxLoss: "6%",
                                    leverage: "1:50",
                                    rewardsSplit: "Every Tuesday",
                                },
                            ],
                        },
                        {
                            id: "10k",
                            label: "$10K",
                            stages: [
                                {
                                    stage: "Student",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "4%",
                                    maxLoss: "6%",
                                    profitTarget: "8%",
                                    leverage: "1:50",
                                },
                                {
                                    stage: "Master",
                                    maxDailyLoss: "4%",
                                    maxLoss: "6%",
                                    leverage: "1:50",
                                    rewardsSplit: "Every Tuesday",
                                },
                            ],
                        },
                        {
                            id: "25k",
                            label: "$25K",
                            stages: [
                                {
                                    stage: "Student",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "4%",
                                    maxLoss: "6%",
                                    profitTarget: "8%",
                                    leverage: "1:50",
                                },
                                {
                                    stage: "Master",
                                    maxDailyLoss: "4%",
                                    maxLoss: "6%",
                                    leverage: "1:50",
                                    rewardsSplit: "Every Tuesday",
                                },
                            ],
                        },
                        {
                            id: "50k",
                            label: "$50K",
                            stages: [
                                {
                                    stage: "Student",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "4%",
                                    maxLoss: "6%",
                                    profitTarget: "8%",
                                    leverage: "1:50",
                                },
                                {
                                    stage: "Master",
                                    maxDailyLoss: "4%",
                                    maxLoss: "6%",
                                    leverage: "1:50",
                                    rewardsSplit: "Every Tuesday",
                                },
                            ],
                        },
                        {
                            id: "100k",
                            label: "$100K",
                            stages: [
                                {
                                    stage: "Student",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "4%",
                                    maxLoss: "6%",
                                    profitTarget: "8%",
                                    leverage: "1:50",
                                },
                                {
                                    stage: "Master",
                                    maxDailyLoss: "4%",
                                    maxLoss: "6%",
                                    leverage: "1:50",
                                    rewardsSplit: "Every Tuesday",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            // 2 STEP: FundingPips y FundingPips Pro
            id: "2-step",
            label: "2 Step",
            products: [
                {
                    id: "fundingpips",
                    label: "FundingPips",
                    accounts: [
                        {
                            id: "5k",
                            label: "$5K",
                            stages: [
                                {
                                    stage: "Student",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "8%",
                                    leverage: "1:50",
                                },
                                {
                                    stage: "Practitioner",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "$15,000",
                                    leverage: "1:200",
                                },
                                {
                                    stage: "Master",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    leverage: "1:100",
                                    rewardsSplit: "Weekly 80%",
                                },
                            ],
                        },
                        {
                            id: "10k",
                            label: "$10K",
                            stages: [
                                {
                                    stage: "Student",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "8%",
                                    leverage: "1:50",
                                },
                                {
                                    stage: "Practitioner",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "$15,000",
                                    leverage: "1:200",
                                },
                                {
                                    stage: "Master",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    leverage: "1:100",
                                    rewardsSplit: "Weekly 80%",
                                },
                            ],
                        },
                        {
                            id: "25k",
                            label: "$25K",
                            stages: [
                                {
                                    stage: "Student",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "8%",
                                    leverage: "1:50",
                                },
                                {
                                    stage: "Practitioner",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "$15,000",
                                    leverage: "1:200",
                                },
                                {
                                    stage: "Master",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    leverage: "1:100",
                                    rewardsSplit: "Weekly 80%",
                                },
                            ],
                        },
                        {
                            id: "50k",
                            label: "$50K",
                            stages: [
                                {
                                    stage: "Student",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "8%",
                                    leverage: "1:50",
                                },
                                {
                                    stage: "Practitioner",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "$15,000",
                                    leverage: "1:200",
                                },
                                {
                                    stage: "Master",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    leverage: "1:100",
                                    rewardsSplit: "Weekly 80%",
                                },
                            ],
                        },
                        {
                            id: "100k",
                            label: "$100K",
                            stages: [
                                {
                                    stage: "Student",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "8%",
                                    leverage: "1:50",
                                },
                                {
                                    stage: "Practitioner",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "$15,000",
                                    leverage: "1:200",
                                },
                                {
                                    stage: "Master",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    leverage: "1:100",
                                    rewardsSplit: "Weekly 80%",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "fundingpips-pro",
                    label: "FundingPips Pro (Limited time)",
                    accounts: [
                        {
                            id: "5k",
                            label: "$5K",
                            stages: [
                                {
                                    stage: "Student",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "8%",
                                    leverage: "1:50",
                                },
                                {
                                    stage: "Practitioner",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "$15,000",
                                    leverage: "1:200",
                                },
                                {
                                    stage: "Master",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    leverage: "1:100",
                                    rewardsSplit: "Weekly 80%",
                                },
                            ],
                        },
                        {
                            id: "10k",
                            label: "$10K",
                            stages: [
                                {
                                    stage: "Student",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "8%",
                                    leverage: "1:50",
                                },
                                {
                                    stage: "Practitioner",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "$15,000",
                                    leverage: "1:200",
                                },
                                {
                                    stage: "Master",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    leverage: "1:100",
                                    rewardsSplit: "Weekly 80%",
                                },
                            ],
                        },
                        {
                            id: "25k",
                            label: "$25K",
                            stages: [
                                {
                                    stage: "Student",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "8%",
                                    leverage: "1:50",
                                },
                                {
                                    stage: "Practitioner",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "$15,000",
                                    leverage: "1:200",
                                },
                                {
                                    stage: "Master",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    leverage: "1:100",
                                    rewardsSplit: "Weekly 80%",
                                },
                            ],
                        },
                        {
                            id: "50k",
                            label: "$50K",
                            stages: [
                                {
                                    stage: "Student",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "8%",
                                    leverage: "1:50",
                                },
                                {
                                    stage: "Practitioner",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "$15,000",
                                    leverage: "1:200",
                                },
                                {
                                    stage: "Master",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    leverage: "1:100",
                                    rewardsSplit: "Weekly 80%",
                                },
                            ],
                        },
                        {
                            id: "100k",
                            label: "$100K",
                            stages: [
                                {
                                    stage: "Student",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "8%",
                                    leverage: "1:50",
                                },
                                {
                                    stage: "Practitioner",
                                    minimumTradingDays: "3 days",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    profitTarget: "$15,000",
                                    leverage: "1:200",
                                },
                                {
                                    stage: "Master",
                                    maxDailyLoss: "3%",
                                    maxLoss: "5%",
                                    leverage: "1:100",
                                    rewardsSplit: "Weekly 80%",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ];

    // Estados para la selección
    // Paso (Instant / 1-step / 2-step)
    const [selectedStepId, setSelectedStepId] = useState(stepsData[0].id);
    // Producto (depende del paso)
    const [selectedProductId, setSelectedProductId] = useState(
        stepsData[0].products[0].id
    );
    // Cuenta (depende del producto)
    const [selectedAccountId, setSelectedAccountId] = useState(
        stepsData[0].products[0].accounts[0].id
    );

    // 1. Step seleccionado
    const selectedStep =
        stepsData.find((s) => s.id === selectedStepId) || stepsData[0];

    // 2. Producto seleccionado
    const selectedProduct =
        selectedStep.products.find((p) => p.id === selectedProductId) ||
        selectedStep.products[0];

    // 3. Cuenta seleccionada
    const selectedAccount =
        selectedProduct.accounts.find((a) => a.id === selectedAccountId) ||
        selectedProduct.accounts[0];

    return (
        <div className="min-h-screen bg-[#0B0D2C] text-white p-6">
            <h1 className="text-2xl font-bold mb-4">Planes de Funding</h1>

            {/* Botones para Step (Instant, 1 Step, 2 Step) */}
            <div className="flex space-x-4 mb-4">
                {stepsData.map((step) => (
                    <button
                        key={step.id}
                        onClick={() => {
                            setSelectedStepId(step.id);
                            // Al cambiar de Step, reseteamos Producto y Cuenta
                            setSelectedProductId(step.products[0].id);
                            setSelectedAccountId(step.products[0].accounts[0].id);
                        }}
                        className={`px-4 py-2 rounded ${selectedStepId === step.id
                                ? "bg-yellow-400 text-black"
                                : "bg-zinc-700"
                            }`}
                    >
                        {step.label}
                    </button>
                ))}
            </div>

            {/* Botones para Producto (según el Step) */}
            <div className="flex space-x-4 mb-4">
                {selectedStep.products.map((prod) => (
                    <button
                        key={prod.id}
                        onClick={() => {
                            setSelectedProductId(prod.id);
                            setSelectedAccountId(prod.accounts[0].id);
                        }}
                        className={`px-4 py-2 rounded ${selectedProductId === prod.id
                                ? "bg-yellow-400 text-black"
                                : "bg-zinc-700"
                            }`}
                    >
                        {prod.label}
                    </button>
                ))}
            </div>

            {/* Botones para Monto de Cuenta ($5K, $10K, etc.) */}
            <div className="flex space-x-4 mb-8">
                {selectedProduct.accounts.map((acc) => (
                    <button
                        key={acc.id}
                        onClick={() => setSelectedAccountId(acc.id)}
                        className={`px-4 py-2 rounded ${selectedAccountId === acc.id
                                ? "bg-yellow-400 text-black"
                                : "bg-zinc-700"
                            }`}
                    >
                        {acc.label}
                    </button>
                ))}
            </div>

            {/* Render de las Etapas (Student, Practitioner, Master), según la selección */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedAccount.stages?.map((stageItem, idx) => (
                    <div key={idx} className="bg-[#141743] p-4 rounded space-y-2">
                        <h2 className="text-xl font-semibold text-yellow-400">
                            {stageItem.stage}
                        </h2>

                        {/* Campos opcionales */}
                        {stageItem.minimumTradingDays && (
                            <p>
                                <span className="text-zinc-400">Minimum Trading Days:</span>{" "}
                                {stageItem.minimumTradingDays}
                            </p>
                        )}
                        {stageItem.maxDailyLoss && (
                            <p>
                                <span className="text-zinc-400">Maximum Daily Loss:</span>{" "}
                                {stageItem.maxDailyLoss}
                            </p>
                        )}
                        {stageItem.maxLoss && (
                            <p>
                                <span className="text-zinc-400">Maximum Loss:</span>{" "}
                                {stageItem.maxLoss}
                            </p>
                        )}
                        {stageItem.profitTarget && (
                            <p>
                                <span className="text-zinc-400">Profit Target:</span>{" "}
                                {stageItem.profitTarget}
                            </p>
                        )}
                        {stageItem.leverage && (
                            <p>
                                <span className="text-zinc-400">Leverage:</span>{" "}
                                {stageItem.leverage}
                            </p>
                        )}
                        {stageItem.rewardsSplit && (
                            <p>
                                <span className="text-zinc-400">Rewards & Split:</span>{" "}
                                {stageItem.rewardsSplit}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

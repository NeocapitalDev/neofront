"use client";

interface MetricsData {
    balance?: number;
    averageWin?: number;
    averageLoss?: number;
    trades?: number;
    wonTradesPercent?: number;
    lots?: number;
    monthlyAnalytics?: { currencies?: { rewardToRiskRatio?: number }[] }[];
}

export default function Component({ data = {} as MetricsData }) {
    return (
        <div className="border-gray-200 border-2 dark:border-zinc-800 dark:shadow-black p-3 bg-white rounded-md shadow-md dark:bg-zinc-800 dark:text-white">
            <ul className="space-y-4">
                {[
                    { label: "Capi:", value: `$${(data.balance ?? 0).toFixed(2)}` },
                    { label: "Beneficio promedio:", value: `$${(data.averageWin ?? 0).toFixed(2)}` },
                    { label: "Pérdida promedio:", value: `$${(data.averageLoss ?? 0).toFixed(2)}` },
                    { label: "No. de trades:", value: data.trades ?? 0 },
                    { label: "Tasa de éxito:", value: `${data.wonTradesPercent ?? 0}%` },
                    { label: "Lotes:", value: (data.lots ?? 0).toFixed(1) },
                    { label: "RRR Promedio:", value: data.monthlyAnalytics?.[0]?.currencies?.[0]?.rewardToRiskRatio?.toFixed(2) ?? 'N/A' },
                ].map((item, index) => (
                    <li key={index} className="border-b dark:border-zinc-500 pb-2 flex justify-between">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-right">{item.value}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}


"use client";

interface MetricsData {
    balance?: number;
    averageWin?: number;
    averageLoss?: number;
    trades?: number;
    lostTradesPercent?: number;
    equity?: number;
    wonTradesPercent?: number;
    lots?: number;
    wonTrades?: number;
    lostTrades?: number;
    monthlyAnalytics?: { currencies?: { rewardToRiskRatio?: number }[] }[];
}

export default function Component({ data = {} as MetricsData }) {
    console.log(data);

    const metrics = [
        { label: "Capital:", value: `$${(data.equity ?? 0).toFixed(2)}` },
        { label: "Beneficio promedio:", value: `$${(data.averageWin ?? 0).toFixed(2)}` },
        { label: "Balance:", value: `$${(data.balance ?? 0).toFixed(2)}` },
        { label: "Pérdida promedio:", value: `$${(data.averageLoss ?? 0).toFixed(2)}` },
        { label: "No. de trades:", value: data.trades ?? 0 },

        {
            label: "RRR Promedio:",
            value: (data.averageLoss
                ? (data.averageWin ?? 0) / Math.abs(data.averageLoss ?? 1)
                : 0
            ).toFixed(2),
        },

        { label: "Lotes:", value: (data.lots ?? 0).toFixed(2) },

        {
            label: "Expectativa:",
            value: (
                ((data.wonTradesPercent ?? 0) / 100 * (data.averageWin ?? 0)) -
                ((data.lostTradesPercent ?? 0) / 100 * Math.abs(data.averageLoss ?? 0))
            ).toFixed(2),
        },

        { label: "Tasa de éxito:", value: `${(data.wonTradesPercent ?? 0)}%` },

        {
            label: "Coeficiente de Beneficio:",
            value: (
                ((data.wonTrades ?? 0) * (data.averageWin ?? 0)) /
                Math.abs((data.lostTrades ?? 1) * (data.averageLoss ?? 1))
            ).toFixed(2),
        },
    ];

    return (
        <div className="border-gray-200 border-2 dark:border-zinc-800 dark:shadow-black p-4 bg-white rounded-md shadow-md dark:bg-zinc-800 dark:text-white">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {metrics.map(({ label, value }, index) => (
                 <li
                 key={index}
                 className={`pb-2 flex flex-col ${index < 8 ? "border-b dark:border-zinc-500" : ""}`}
             >
             
                        <span className=" font-medium">{label}</span>
                        <span className="text-left mt-1">{value}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

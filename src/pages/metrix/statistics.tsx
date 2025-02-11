"use client";

interface MetricsData {
    balance?: number;
    expectancy?: number;
    averageLoss?: number;
    trades?: number;
    wonTradesPercent?: number;
    lots?: number;
    monthlyAnalytics?: { currencies?: { rewardToRiskRatio?: number }[] }[];
    profitFactor?: number;
}

export default function Component({ data = {} as MetricsData }) {
    return (
        <div className="border-gray-200 border-2 dark:border-zinc-800 dark:shadow-black p-3 bg-white rounded-md shadow-md dark:bg-zinc-800 dark:text-white">
            <p className="text-lg font-semibold mb-4">Estadísticas</p>
            <ul className="space-y-2">
                <li>
                    <span className="font-medium">Capital:</span> ${ (data.balance ?? 0).toFixed(2) }
                </li>
                <li>
                    <span className="font-medium">Beneficio promedio:</span> ${ (data.expectancy ?? 0).toFixed(2) }
                </li>
                <li>
                    <span className="font-medium">Pérdida promedio:</span> ${ (data.averageLoss ?? 0).toFixed(2) }
                </li>
                <li>
                    <span className="font-medium">No. de trades:</span> { data.trades ?? 0 }
                </li>
                <li>
                    <span className="font-medium">Tasa de éxito:</span> { data.wonTradesPercent ?? 0 }%
                </li>
                <li>
                    <span className="font-medium">Lotes:</span> { (data.lots ?? 0).toFixed(1) }
                </li>
                <li>
                    <span className="font-medium">RRR Promedio:</span> { data.monthlyAnalytics?.[0]?.currencies?.[0]?.rewardToRiskRatio?.toFixed(2) ?? 'N/A' }
                </li>
                <li>
                    <span className="font-medium">Coeficiente de beneficio:</span> { (data.profitFactor ?? 0).toFixed(2) }
                </li>
            </ul>
        </div>
    );
}

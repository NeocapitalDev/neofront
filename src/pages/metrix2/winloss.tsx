"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Component({ data }) {
  const [chartData, setChartData] = useState({
    wonTradesPercent: 0,
    lostTradesPercent: 0,
    wonBalance: 0,
    lostBalance: 0,
  });

  useEffect(() => {
    if (data) {
      const wonBalance = data.wonTrades > 0 ? data.wonTrades * data.averageWin : 0;
      const lostBalance = data.lostTrades > 0 ? Math.abs(data.lostTrades * data.averageLoss) : 0;

      setChartData({
        wonTradesPercent: data.wonTradesPercent || 0,
        lostTradesPercent: data.lostTradesPercent || 0,
        wonBalance,
        lostBalance,
      });
    }
  }, [data]);

  const noTrades =
    chartData.wonTradesPercent === 0 && chartData.lostTradesPercent === 0;

  return (
    <div className="mt-6 w-full   md:max-w-2/3 lg:max-w-2/3 justify-start items-start">
      <h2 className="text-lg font-semibold">Win/Loss Rates</h2>
      <Card className="flex flex-col mt-4 pt-4">
        <CardContent className="flex flex-col items-center">
          {noTrades ? (
            <div className="text-center text-muted-foreground">
              Sin resultados aún, no se han realizado trades.
            </div>
          ) : (
            <div className="w-full mt-6">
              <div className="relative w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-md">
                {/* Porcentaje de Wins */}
                {chartData.wonTradesPercent > 0 && (
                  <div
                    className={`absolute top-0 left-0 h-full bg-green-600 text-xs font-medium text-center text-blue-100 flex items-center justify-center ${
                      chartData.wonTradesPercent === 100 ? "rounded-md" : "rounded-l-md"
                    }`}
                    style={{
                      width: `${chartData.wonTradesPercent}%`,
                    }}
                  >
                    {`${chartData.wonTradesPercent.toFixed(1)}%`}
                  </div>
                )}
                {/* Porcentaje de Losses */}
                {chartData.lostTradesPercent > 0 && (
                  <div
                    className={`absolute top-0 h-full w-full bg-red-600 text-xs font-medium text-center text-red-100 flex items-center justify-center ${
                      chartData.lostTradesPercent === 100 ? "rounded-md" : "rounded-r-md"
                    }`}
                    style={{
                      left: `${chartData.wonTradesPercent}%`,
                      width: `${chartData.lostTradesPercent}%`,
                    }}
                  >
                    {`${chartData.lostTradesPercent.toFixed(1)}%`}
                  </div>
                )}
              </div>
              {/* Valores totales */}
              <div className="flex justify-between mt-1">
                <span className="text-green-600 font-medium">
                  Ganancia total: ${chartData.wonBalance.toLocaleString()}
                </span>
                <span className="text-red-600 font-medium">
                  Pérdida total: ${chartData.lostBalance.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

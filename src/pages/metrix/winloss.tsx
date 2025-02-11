"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Component({ data }) {
  const [chartData, setChartData] = useState({
    wonTradesPercent: 0,
    lostTradesPercent: 0,
    wonTrades: 0,
    lostTrades: 0,
    wonBalance: 0,
    lostBalance: 0,
    averageWin: 0,
    averageLoss: 0,
  });

  useEffect(() => {
    if (data) {
      setChartData({
        wonTradesPercent: data.wonTradesPercent || 0,
        lostTradesPercent: data.lostTradesPercent || 0,
        wonTrades: data.wonTrades || 0,
        lostTrades: data.lostTrades || 0,
        wonBalance: data.wonBalance || 0,
        lostBalance: data.lostBalance || 0,
        averageWin: data.averageWin || 0,
        averageLoss: data.averageLoss || 0,
      });
    }
  }, [data]);

  const noTrades = chartData.wonTradesPercent === 0 && chartData.lostTradesPercent === 0;

  return (
    <div className="mt-6 w-full max-w-full md:max-w-2/3 lg:max-w-2/3 justify-start items-start">
        <h2 className="text-lg font-semibold">Win/Loss Rates</h2>
    <Card className="flex flex-col mt-4 pt-4">

      <CardContent className="flex flex-col items-center">
        {noTrades ? (
          <div className="text-center text-muted-foreground">
            Sin resultados aun, no se han realizado trades.
          </div>
        ) : (
          <div className="w-full mt-6">
            <div className="relative w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-md">
              {/* Porcentaje de Wins */}
              {chartData.wonTradesPercent > 0 && (
                <div
                  className="absolute top-0 left-0 h-full bg-green-600 text-xs font-medium text-center text-blue-100 flex items-center justify-center rounded-md"
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
                  className="absolute top-0 h-full bg-red-600 text-xs font-medium text-center text-red-100 flex items-center justify-center rounded-md"
                  style={{
                    left: `${chartData.wonTradesPercent}%`,
                    width: `${chartData.lostTradesPercent}%`,
                  }}
                >
                  {`${chartData.lostTradesPercent.toFixed(1)}%`}
                </div>
              )}
            </div>
            {/* Valores promedio */}
            <div className="flex justify-between mt-1">
              <span className="text-gray-600">
                Ganancia: ${chartData.averageWin.toLocaleString()}
              </span>
              <span className="text-gray-600">
                Perdida: ${chartData.averageLoss.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}

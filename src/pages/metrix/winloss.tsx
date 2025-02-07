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
    if (data?.metrics) {
      setChartData({
        wonTradesPercent: data.metrics.wonTradesPercent || 0,
        lostTradesPercent: data.metrics.lostTradesPercent || 0,
        wonTrades: data.metrics.wonTrades || 0,
        lostTrades: data.metrics.lostTrades || 0,
        wonBalance: data.metrics.wonBalance || 0,
        lostBalance: data.metrics.lostBalance || 0,
        averageWin: data.metrics.averageWin || 0,
        averageLoss: data.metrics.averageLoss || 0,
      });
    }
  }, [data]);

  const noTrades = chartData.wonTradesPercent === 0 && chartData.lostTradesPercent === 0;

  return (
    <Card className="flex flex-col mt-4 pt-4">

      <CardContent className="flex flex-col items-center">
        {noTrades ? (
          <div className="text-center text-muted-foreground">
            Sin resultados aun, no se han realizado trades.
          </div>
        ) : (
          <div className="w-full max-w-[800px] mt-4">
            <div className="relative w-full h-8 mt-2 bg-gray-200 dark:bg-gray-700 rounded-md">
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
              <span className="text-green-400">
                Ganancia: ${chartData.averageWin.toLocaleString()}
              </span>
              <span className="text-red-600">
                Perdida: ${chartData.averageLoss.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

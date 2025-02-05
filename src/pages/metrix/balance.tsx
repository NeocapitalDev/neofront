"use client";

import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  balance: {
    label: "Profit",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function Component({ data }) {
  const [chartData, setChartData] = useState([]);
  const [balance, setBalance] = useState(0);
  const [winPercentage, setWinPercentage] = useState(0);
  const [losePercentage, setLosePercentage] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [totalLosses, setTotalLosses] = useState(0);

  useEffect(() => {
    if (data?.metrics) {
      const { balance, openTradesByHour } = data.metrics;

      if (typeof balance === "number") {
        setBalance(balance);
      } else {
        console.error("El balance no es válido:", balance);
      }

      if (Array.isArray(openTradesByHour) && openTradesByHour.length > 0) {
        const extractedData = openTradesByHour.reduce(
          (acc, item, index) => {
            const previousBalance = acc.length ? acc[acc.length - 1].balance : 0;
            const newBalance = previousBalance + (item.profit || 0);
            acc.push({
              trade: index + 1,
              balance: newBalance,
            });
            return acc;
          },
          [{ trade: 0, balance: 0 }]
        );

        setChartData(extractedData);

        const totalTrades = openTradesByHour.length;
        const wins = openTradesByHour.filter((trade) => trade.profit > 0);
        const losses = openTradesByHour.filter((trade) => trade.profit <= 0);

        const totalWinAmount = wins.reduce((sum, trade) => sum + trade.profit, 0);
        const totalLossAmount = losses.reduce(
          (sum, trade) => sum + Math.abs(trade.profit || 0),
          0
        );

        setTotalWins(totalWinAmount);
        setTotalLosses(totalLossAmount);

        setWinPercentage(
          totalTrades > 0 ? parseFloat(((wins.length / totalTrades) * 100).toFixed(2)) : 0
        );
        setLosePercentage(
          totalTrades > 0 ? parseFloat(((losses.length / totalTrades) * 100).toFixed(2)) : 0
        );
      } else {
        setChartData([]);
      }
    } else {
      console.warn("Los datos de `metrics` no están disponibles.");
    }
  }, [data]);

  return (
    <>
      <p className="text-lg font-semibold mb-4">Resultados Actuales</p>
      <Card>
        <CardHeader>
          <CardTitle className="font-normal text-black dark:text-white">
            Balance
          </CardTitle>
          <CardDescription className="text-4xl font-semibold text-black dark:text-white">
            ${balance.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {chartData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-opacity-75 dark:bg-opacity-75">
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                No hay trades disponibles
              </p>
            </div>
          )}
          <ChartContainer config={chartConfig}>
            <LineChart
              data={chartData}
              margin={{
                left: 0,
                right: 12,
                top: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid horizontal={true} strokeWidth={2} vertical={false} />
              <XAxis
                dataKey="trade"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                label={{ value: "Trades", position: "insideBottom", offset: -10 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Line
                dataKey="balance"
                type="natural"
                stroke="#FFC107"
                strokeWidth={2}
                dot={{
                  fill: "#FFC107",
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
}

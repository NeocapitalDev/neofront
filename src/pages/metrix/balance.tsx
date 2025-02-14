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
  const [minY, setMinY] = useState(0);
  const [maxY, setMaxY] = useState(0);

  useEffect(() => {
    if (data) {
      const { balance, openTradesByHour } = data;

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

        // Obtener el mínimo y máximo balance
        const balances = extractedData.map((d) => d.balance);
        const minVal = Math.min(...balances);
        const maxVal = Math.max(...balances);

        // Ajustar valores a múltiplos de 1000
        setMinY(Math.floor(minVal / 1000) * 1000);
        setMaxY(Math.ceil(maxVal / 1000) * 1000);
      } else {
        setChartData([]);
      }
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
                tickCount={5} // Define la cantidad de ticks visibles en el eje Y
                domain={[minY, maxY]} // Ajusta el dominio a múltiplos de 1000
                tickFormatter={(value) => `$${value.toLocaleString()}`} // Muestra valores en múltiplos de 1000
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Line
                dataKey="balance"
                type="monotone"
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

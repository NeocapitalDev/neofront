"use client"

import { useEffect, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Importar los datos
import openTradesByHour from "./data"
import metrics from "./data.js"
const chartConfig = {
  balance: {
    label: "Profit",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function Component() {
  const [chartData, setChartData] = useState([])
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    setBalance(metrics.metrics.balance)
    // Calcular el balance acumulado
    const extractedData = openTradesByHour.metrics.openTradesByHour.reduce(
      (acc, item, index) => {
        const previousBalance = acc.length ? acc[acc.length - 1].balance : 0
        const newBalance = previousBalance + item.profit
        acc.push({
          trade: index + 1,
          balance: newBalance,
        })
        return acc
      },
      [{ trade: 0, balance: 0 }] // Inicializar con trade 0 y balance 0
    )

    setChartData(extractedData)
  }, [])

  return (
    <div>
      <p className="text-lg font-semibold mb-4">Resultados Actuales</p>
      <Card>
        <CardHeader>
          <CardTitle className="font-normal text-black dark:text-white">
          Balance
          </CardTitle>
          <CardDescription className="text-4xl font-semibold text-black dark:text-white">
          ${balance.toLocaleString()} {/* Mostrar el balance */}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
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
    </div>
  )
}

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
import openTradesByHour from "../metrix/data"

const chartConfig = {
  balance: {
    label: "Profit",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function Component() {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    // Extraer datos de "openTradesByHour"
    const extractedData = openTradesByHour.metrics.openTradesByHour.map((item, index) => ({
      trade: index + 1, // Índice del trade
      balance: item.profit, // Profit
    }))

    setChartData(extractedData)
  }, [])

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="font-normal text-black dark:text-white">
            Profit por Trade
          </CardTitle>
          <CardDescription className="text-4xl font-semibold text-black dark:text-white">
            $99,921
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart
              data={chartData}
              margin={{
                left: 12,
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

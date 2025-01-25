"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
const chartData = [
  { trade: "0", balance: 0},
  { trade: "1", balance: -123},
  { trade: "2", balance: -78},
  { trade: "2", balance: 40},
]

const chartConfig = {
  balance: {
    label: "Balance",
    color: "hsl(var(--chart-1))",
  },
  // mobile: {
  //   label: "Mobile",
  //   color: "hsl(var(--chart-2))",
  // },
} satisfies ChartConfig

export default function Component() {
  return (
    <div>
          <Card>
      <CardHeader>
        <CardTitle className="font-normal text-black dark:text-white">Balance</CardTitle>
        <CardDescription className="text-4xl font-semibold text-black dark:text-white">$99,921</CardDescription>

      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid horizontal={true} strokeWidth={2} vertical={false} />
            <XAxis
              dataKey="trade"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
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

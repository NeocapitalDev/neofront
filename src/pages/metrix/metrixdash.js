"use client";

import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineDot,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const lineChartData = [
  { date: "2025-01-01", profit: 120.5, balance: 100050.5 },
  { date: "2025-01-02", profit: -50.8, balance: 100000.0 },
  { date: "2025-01-03", profit: 200.2, balance: 100200.2 },
  { date: "2025-01-04", profit: -78.96, balance: 99921.04 },
  { date: "2025-01-05", profit: 95.3, balance: 100016.34 },
  { date: "2025-01-06", profit: -30.1, balance: 99986.24 },
  { date: "2025-01-07", profit: 150.0, balance: 100136.24 },
  { date: "2025-01-08", profit: -20.7, balance: 100115.54 },
];

export function Component() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Line Chart - Profit & Balance</CardTitle>
          <CardDescription>January 2025</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Pass the correct data (lineChartData) to ChartContainer */}
          <ChartContainer data={lineChartData}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={lineChartData}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => value.slice(5)}
                  tickMargin={8}
                />
                <YAxis />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{
                    fill: "hsl(var(--chart-1))",
                  }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{
                    fill: "hsl(var(--chart-2))",
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Rendimiento mensual observado{" "}
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="leading-none text-muted-foreground">
            Datos de rendimiento financiero por día
          </div>
        </CardFooter>
      </Card>
    );
  }
  
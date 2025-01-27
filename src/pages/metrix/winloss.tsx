"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

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

export default function Component({ data }) {
  const [chartData, setChartData] = useState([
    { month: "january", wonTradesPercent: 0, lostTradesPercent: 0 },
  ]);

  useEffect(() => {
    if (data?.metrics) {
      const wonTradesPercent = data.metrics.wonTradesPercent || 0; // Usa valores reales
      const lostTradesPercent = data.metrics.lostTradesPercent || 0; // Usa valores reales

      const updatedData = [{ month: "dynamic", wonTradesPercent, lostTradesPercent }];
      setChartData(updatedData);
    }
  }, [data]);

  const chartConfig = {
    wonTradesPercent: {
      label: "Won Trades",
      color: "hsl(var(--chart-1))",
    },
    lostTradesPercent: {
      label: "Lost Trades",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <Card className="flex flex-col mt-4">
      <CardHeader className="items-center pb-0">
        <CardTitle>Radial Chart - Dynamic Data</CardTitle>
        <CardDescription>Resumen basado en métricas recibidas</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          Win / Lose 

                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Rates
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="wonTradesPercent"
              stackId="a"
              cornerRadius={5}
              fill="hsl(var(--chart-1))"
              className="stroke-transparent stroke-2"
              label={{
                position: "insideStart",
                formatter: (value) => `${chartData[0].wonTradesPercent.toFixed(2)}%`, // Muestra valores reales
                fill: "#fff",
              }}
            />
            <RadialBar
              dataKey="lostTradesPercent"
              fill="hsl(var(--chart-2))"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
              label={{
                position: "insideEnd",
                formatter: (value) => `${chartData[0].lostTradesPercent.toFixed(2)}%`, // Muestra valores reales
                fill: "#fff",
              }}
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Cambios recientes en las métricas <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Datos basados en operaciones realizadas.
        </div>
      </CardFooter>
    </Card>
  );
}

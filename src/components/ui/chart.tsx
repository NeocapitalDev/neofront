// src/components/ui/chart.js
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function ChartContainer({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ChartTooltip({ label, value }) {
  return (
    <div className="p-2 bg-white shadow rounded">
      <p>{label}</p>
      <p>{value}</p>
    </div>
  );
}

export function ChartConfig({ options }) {
  return <div>Chart configuration goes here</div>;
}

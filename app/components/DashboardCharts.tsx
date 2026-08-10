"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type WeeklySalesPoint = { week: string; value: number };
type BranchSalesPoint = { name: string; sales: number };

const tooltipStyle = {
  border: 0,
  borderRadius: 14,
  boxShadow: "0 12px 35px rgba(13,18,75,.14)",
};

const axisTick = { fill: "#787d90", fontSize: 11 };

export function WeeklySalesChart({ data, gradientId }: { data: WeeklySalesPoint[]; gradientId: string }) {
  return <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}>
      <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5da895" stopOpacity={.45} /><stop offset="100%" stopColor="#5da895" stopOpacity={0} /></linearGradient></defs>
      <CartesianGrid strokeDasharray="4 8" stroke="#e2e5ec" vertical={false} />
      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={axisTick} />
      <YAxis axisLine={false} tickLine={false} tick={axisTick} />
      <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`$${value}k`, "Ventas"]} />
      <Area type="monotone" dataKey="value" stroke="#151a67" strokeWidth={3} fill={`url(#${gradientId})`} />
    </AreaChart>
  </ResponsiveContainer>;
}

export function BranchSalesChart({ data }: { data: BranchSalesPoint[] }) {
  return <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
      <CartesianGrid strokeDasharray="4 8" stroke="#e2e5ec" vertical={false} />
      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
      <YAxis axisLine={false} tickLine={false} tick={axisTick} />
      <Tooltip cursor={{ fill: "rgba(93,168,149,.08)" }} contentStyle={tooltipStyle} formatter={(value) => [Number(value).toLocaleString("es-MX", { style: "currency", currency: "MXN" }), "Ventas"]} />
      <Bar dataKey="sales" fill="#151a67" radius={[10, 10, 2, 2]} />
    </BarChart>
  </ResponsiveContainer>;
}

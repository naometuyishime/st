"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const barData = [
  { name: "Q1", planned: 120, actual: 95 },
  { name: "Q2", planned: 140, actual: 132 },
  { name: "Q3", planned: 160, actual: 155 },
  { name: "Q4", planned: 180, actual: 165 },
];

const pieData = [
  { name: "Male", value: 45, color: "hsl(var(--primary))" },
  { name: "Female", value: 55, color: "hsl(var(--accent))" },
];

interface StatsChartProps {
  type: "bar" | "pie";
  title: string;
  data?: any[];
}

export default function StatsChart({ type, title, data }: StatsChartProps) {
  const [colors, setColors] = useState({
    primary: "#3b82f6",
    accent: "#5cb85c",
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const root = getComputedStyle(document.documentElement);
      const primaryVar = root.getPropertyValue("--primary").trim();
      const accentVar = root.getPropertyValue("--accent").trim();

      const normalize = (v: string, fallback: string) => {
        if (!v) return fallback;
        const val = v.trim();
        if (
          val.startsWith("#") ||
          val.startsWith("rgb") ||
          val.startsWith("hsl")
        )
          return val;
        return `hsl(${val})`;
      };

      const primary = normalize(primaryVar, colors.primary);
      const accent = normalize(accentVar, colors.accent);
      setColors({ primary, accent });
    } catch (e) {
      // ignore
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!loaded) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 h-64 flex items-center justify-center">
        <div className="animate-pulse w-3/4 h-6 bg-muted rounded" />
      </div>
    );
  }

  if (type === "bar") {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data || barData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                itemStyle={{
                  color: "#fff",
                }}
              />
              <Bar
                dataKey="planned"
                fill={colors.primary}
                name="Planned"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="actual"
                fill={colors.accent}
                name="Actual"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  const pieColors = [colors.primary, colors.accent];

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data || pieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              stroke="none"
            >
              {(data || pieData).map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={pieColors[index % pieColors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-4">
        {(data || pieData).map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: pieColors[index % pieColors.length] }}
            />
            <span className="text-sm text-muted-foreground">
              {entry.name}: {entry.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

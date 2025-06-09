// SPDX-FileCopyrightText: Copyright (c) 2024-present unoptimized
//
// SPDX-License-Identifier: MIT
"use client";
import {
  AreaChart as RechartsAreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
// import { useTheme } from "next-themes"; // This will need to be replaced or adapted for Vite

type AreaChartProps = {
  data: any[];
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showTooltip?: boolean;
};

export const AreaChart = ({
  data,
  categories,
  index,
  colors = ["#6366f1", "#3b82f6", "#ef4444", "#f97316", "#8b5cf6", "#10b981"], // Default color palette
  valueFormatter = (value) => value.toString(),
  className,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showTooltip = true,
}: AreaChartProps) => {
  // const { theme } = useTheme(); // For adapting to dark/light mode if needed for text, etc.
  const theme = "light"; // Placeholder theme
  const strokeColor = theme === "dark" ? "#e5e7eb" : "#6b7280"; // Example: gray-300 for dark, gray-500 for light

  return (
    <div className={`w-full h-[300px] ${className}`}> {/* Ensure height is defined */}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />}
          {showXAxis && (
            <XAxis
              dataKey={index}
              stroke={strokeColor}
              tick={{ fill: strokeColor, fontSize: 12 }}
              tickLine={{ stroke: strokeColor }}
            />
          )}
          {showYAxis && (
            <YAxis
              stroke={strokeColor}
              tick={{ fill: strokeColor, fontSize: 12 }}
              tickLine={{ stroke: strokeColor }}
              tickFormatter={valueFormatter}
            />
          )}
          {showTooltip && (
            <Tooltip
              formatter={valueFormatter}
              contentStyle={{
                backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff", // Example: gray-800 for dark, white for light
                borderColor: theme === "dark" ? "#374151" : "#e5e7eb", // Example: gray-700 for dark, gray-200 for light
                color: theme === "dark" ? "#f3f4f6" : "#1f2937", // Example: gray-100 for dark, gray-800 for light
              }}
              labelStyle={{ color: theme === "dark" ? "#f3f4f6" : "#1f2937" }}
            />
          )}
          {categories.map((category, i) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[i % colors.length]}
              fill={colors[i % colors.length]}
              fillOpacity={0.3}
              strokeWidth={2}
              dot={{
                stroke: colors[i % colors.length],
                strokeWidth: 2,
                fill: theme === "dark" ? "#1f2937" : "#ffffff", // Match tooltip background for dot fill
              }}
              activeDot={{
                stroke: colors[i % colors.length],
                strokeWidth: 2,
                fill: colors[i % colors.length],
                r: 5,
              }}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

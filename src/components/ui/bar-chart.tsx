// SPDX-FileCopyrightText: Copyright (c) 2024-present unoptimized
//
// SPDX-License-Identifier: MIT
"use client";
import {
  BarChart as RechartsBarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
// import { useTheme } from "next-themes"; // This will need to be replaced or adapted for Vite

type BarChartProps = {
  data: any[];
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
  layout?: "horizontal" | "vertical";
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  barSize?: number; // For fixed bar size
  barCategoryGap?: string | number; // Gap between categories of bars
};

export const BarChart = ({
  data,
  categories,
  index,
  colors = ["#3b82f6", "#10b981", "#ef4444", "#f97316", "#8b5cf6", "#6366f1"], // Default color palette
  valueFormatter = (value) => value.toString(),
  className,
  layout = "horizontal",
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showTooltip = true,
  showLegend = true,
  barSize, // If undefined, Recharts calculates it
  barCategoryGap,
}: BarChartProps) => {
  // const { theme } = useTheme(); // For adapting to dark/light mode if needed
  const theme = "light"; // Placeholder theme
  const strokeColor = theme === "dark" ? "#e5e7eb" : "#6b7280"; // Example: gray-300 for dark, gray-500 for light

  return (
    <div className={`w-full h-[300px] ${className}`}> {/* Ensure height is defined */}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} layout={layout} barCategoryGap={barCategoryGap}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />}
          {showXAxis && (
            <XAxis
              dataKey={layout === "horizontal" ? index : undefined}
              type={layout === "horizontal" ? "category" : "number"}
              stroke={strokeColor}
              tick={{ fill: strokeColor, fontSize: 12 }}
              tickLine={{ stroke: strokeColor }}
              axisLine={{ stroke: strokeColor }}
              hide={!showXAxis}

            />
          )}
          {showYAxis && (
            <YAxis
              dataKey={layout === "vertical" ? index : undefined}
              type={layout === "vertical" ? "category" : "number"}
              stroke={strokeColor}
              tick={{ fill: strokeColor, fontSize: 12 }}
              tickLine={{ stroke: strokeColor }}
              axisLine={{ stroke: strokeColor }}
              tickFormatter={layout === "horizontal" ? valueFormatter : undefined}
              hide={!showYAxis}
            />
          )}
          {showTooltip && (
            <Tooltip
              formatter={valueFormatter}
              contentStyle={{
                backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                color: theme === "dark" ? "#f3f4f6" : "#1f2937",
              }}
              labelStyle={{ color: theme === "dark" ? "#f3f4f6" : "#1f2937" }}
              cursor={{ fill: theme === "dark" ? "rgba(200,200,200,0.1)" : "rgba(0,0,0,0.1)"}}
            />
          )}
          {showLegend && (
            <Legend wrapperStyle={{ color: strokeColor, fontSize: "12px" }} />
          )}
          {categories.map((category, i) => (
            <Bar
              key={category}
              dataKey={category}
              fill={colors[i % colors.length]}
              barSize={barSize}
              // radius={layout === 'horizontal' ? [4, 4, 0, 0] : [0, 4, 4, 0]} // Optional: rounded bars
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

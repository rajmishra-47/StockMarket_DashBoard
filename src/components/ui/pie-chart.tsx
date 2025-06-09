// SPDX-FileCopyrightText: Copyright (c) 2024-present unoptimized
//
// SPDX-License-Identifier: MIT
"use client";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
// import { useTheme } from "next-themes"; // This will need to be replaced or adapted for Vite

type DonutChartProps = {
  data: any[];
  category: string;
  index: string; // dataKey for the name of the slice
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
  showTooltip?: boolean;
  showLegend?: boolean;
  variant?: "pie" | "donut";
  label?: boolean | React.ReactNode | ((entry: any) => React.ReactNode);
  labelLine?: boolean;
  innerRadius?: string | number; // For donut
  outerRadius?: string | number;
};

export const DonutChart = ({
  data,
  category,
  index,
  colors = ["#3b82f6", "#10b981", "#ef4444", "#f97316", "#8b5cf6", "#6366f1"], // Default color palette
  valueFormatter = (value) => value.toString(),
  className,
  showTooltip = true,
  showLegend = false, // Legends can be verbose for pie charts
  variant = "donut",
  label,
  labelLine = false,
  innerRadius = "60%", // Default for donut
  outerRadius = "80%", // Default for donut
}: DonutChartProps) => {
  // const { theme } = useTheme(); // For adapting to dark/light mode if needed
  const theme = "light"; // Placeholder theme
  const strokeColor = theme === "dark" ? "#e5e7eb" : "#6b7280";

  const chartInnerRadius = variant === "pie" ? 0 : innerRadius;

  return (
    <div className={`w-full h-[300px] ${className}`}> {/* Ensure height is defined */}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey={category}
            nameKey={index}
            cx="50%"
            cy="50%"
            innerRadius={chartInnerRadius}
            outerRadius={outerRadius}
            fill="#8884d8" // Default fill, overridden by Cell
            label={label}
            labelLine={labelLine}
            paddingAngle={data.length > 1 ? 2 : 0} // Add padding angle if more than one slice
          >
            {data.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={colors[idx % colors.length]}
                stroke={theme === "dark" ? "#1f2937" : "#ffffff"} // Border color for slices
                strokeWidth={2}
              />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              formatter={(value, name, props) => [valueFormatter(value as number), props.name]}
              contentStyle={{
                backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                color: theme === "dark" ? "#f3f4f6" : "#1f2937",
              }}
              labelStyle={{ color: theme === "dark" ? "#f3f4f6" : "#1f2937" }}
              itemStyle={{ color: theme === "dark" ? "#f3f4f6" : "#1f2937" }}
            />
          )}
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ color: strokeColor, fontSize: "12px", paddingTop: "10px" }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

// You can also export PieChart if you want a more generic name, but DonutChart is common for this style.
export const PieChart = DonutChart;

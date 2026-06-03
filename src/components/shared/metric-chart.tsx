"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CHART_PALETTE,
  colorForIndex,
  colorForModuleKey,
} from "@/lib/constants/chart-colors";
import { cn } from "@/lib/utils";

export interface ChartDataPoint {
  name: string;
  value: number;
  /** Optional module key for automatic color mapping */
  moduleKey?: string;
  color?: string;
  [key: string]: string | number | undefined;
}

interface MetricChartProps {
  title: string;
  data: ChartDataPoint[];
  type?: "area" | "bar" | "line" | "pie";
  dataKey?: string;
  /** Primary series color (hex) */
  color?: string;
  /** Per-bar colors; defaults to palette / moduleKey */
  multiColor?: boolean;
  loading?: boolean;
  className?: string;
  height?: number;
}

function resolveColor(point: ChartDataPoint, index: number): string {
  if (point.color) return point.color;
  if (point.moduleKey) return colorForModuleKey(point.moduleKey);
  return colorForIndex(index);
}

export function MetricChart({
  title,
  data,
  type = "area",
  dataKey = "value",
  color = CHART_PALETTE[0],
  multiColor = type === "bar" || type === "pie",
  loading,
  className,
  height = 200,
}: MetricChartProps) {
  if (loading) {
    return (
      <Card className={cn("border shadow-sm", className)}>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full" style={{ height }} />
        </CardContent>
      </Card>
    );
  }

  const tooltipStyle = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  };

  const ChartBody = () => {
    if (type === "pie") {
      return (
        <PieChart>
          <Tooltip contentStyle={tooltipStyle} />
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={height * 0.25}
            outerRadius={height * 0.38}
            paddingAngle={2}
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.name}
                fill={multiColor ? resolveColor(entry, i) : color}
                stroke="transparent"
              />
            ))}
          </Pie>
        </PieChart>
      );
    }

    const common = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip contentStyle={tooltipStyle} />
      </>
    );

    if (type === "bar") {
      return (
        <BarChart data={data}>
          {common}
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={entry.name}
                fill={multiColor ? resolveColor(entry, i) : color}
              />
            ))}
          </Bar>
        </BarChart>
      );
    }

    if (type === "line") {
      return (
        <LineChart data={data}>
          {common}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            dot={{ fill: color, r: 3 }}
            activeDot={{ r: 5, fill: color }}
          />
        </LineChart>
      );
    }

    const gradientId = `area-${title.replace(/\s/g, "-")}`;
    return (
      <AreaChart data={data}>
        {common}
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          fill={`url(#${gradientId})`}
          strokeWidth={2}
        />
      </AreaChart>
    );
  };

  return (
    <Card className={cn("border bg-card shadow-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div
            className="flex items-center justify-center text-sm text-muted-foreground"
            style={{ height }}
          >
            No data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <ChartBody />
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart as RechartsAreaChart,
} from "recharts"

interface DataPoint {
  date: string
  value: number
}

interface AreaChartProps {
  data: DataPoint[]
}

export function AreaChart({ data }: AreaChartProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure the component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-[300px] w-full bg-muted/20 animate-pulse rounded-md" />
  }

  const isDark = theme === "dark"

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsAreaChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
          tickFormatter={(value) => {
            const date = new Date(value)
            return `${date.toLocaleString("default", { month: "short" })} ${date.getDate()}`
          }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: isDark ? "#374151" : "#e5e7eb",
            color: isDark ? "#ffffff" : "#000000",
          }}
          formatter={(value) => value.toLocaleString()}
          labelFormatter={(label) => {
            const date = new Date(label)
            return date.toLocaleDateString()
          }}
        />
        <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}


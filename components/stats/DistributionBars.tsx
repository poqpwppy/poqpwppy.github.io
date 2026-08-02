"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";

const GRID = "#27272a";
const TEXT = "#a1a1aa";
const ACCENT = "#ffffff";
const EMPTY = "#1c1c21";

type DataRow = { name: string; count: number; color?: string };

/** Horizontal count bars — used for category / difficulty / platform. */
export function DistributionBars({
  data,
  className,
}: {
  data: DataRow[];
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 24, bottom: 0, left: 8 }}
            barSize={16}
          >
            <CartesianGrid stroke={GRID} horizontal={false} strokeDasharray="3 3" />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fill: TEXT, fontSize: 11, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={92}
              tick={{ fill: TEXT, fontSize: 11, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
            />
            <Bar dataKey="count" radius={[0, 2, 2, 0]}>
              {data.map((row) => (
                <Cell
                  key={row.name}
                  fill={row.count ? row.color ?? ACCENT : EMPTY}
                />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                style={{
                  fill: "#a2a2ab",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

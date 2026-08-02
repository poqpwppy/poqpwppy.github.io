"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const ACCENT = "#ffffff";
const GRID = "#27272a";
const TEXT = "#a1a1aa";
const BG = "#09090b";

type RatingPoint = {
  /** Short axis label, e.g. "6/23". */
  label: string;
  /** Full date used by the tooltip, e.g. "2025-06". */
  date: string;
  rating: number;
};

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: { date: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload.date;
  return (
    <div className="border border-line2 bg-bg3 px-3 py-2 font-mono text-xs">
      <p className="text-fg3">{d}</p>
      <p className="mt-0.5 text-fg">
        <span className="text-accent">◆</span>{" "}
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

/** CTFtime rating over time — filled area + line. */
export function RatingChart({ data }: { data: RatingPoint[] }) {
  return (
    <div className="h-64 w-full md:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
          <defs>
            <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.28} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke={GRID}
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: TEXT, fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={{ stroke: GRID }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: TEXT, fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
            domain={["dataMin - 40", "dataMax + 40"]}
            width={48}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: GRID }}
          />
          <Area
            type="monotone"
            dataKey="rating"
            stroke="none"
            fill="url(#ratingFill)"
          />
          <Line
            type="monotone"
            dataKey="rating"
            stroke={ACCENT}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: ACCENT, stroke: BG, strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

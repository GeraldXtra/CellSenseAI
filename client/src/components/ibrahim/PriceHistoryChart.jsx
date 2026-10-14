import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function readVar(name) {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function monthLabel(date) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";
  return value.toLocaleDateString("en-GB", { month: "short" });
}

function dayLabel(date) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";
  return value.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function PriceHistoryChart({ history = [] }) {
  const colors = useMemo(
    () => ({
      line: readVar("--cs-chart-line"),
      grid: readVar("--cs-chart-grid"),
      soft: readVar("--cs-ink-soft"),
      size: readVar("--cs-size-tiny"),
      height: parseInt(readVar("--cs-card-image-h"), 10),
      axis: parseInt(readVar("--cs-space-16"), 10),
      dot: parseInt(readVar("--cs-space-1"), 10),
    }),
    [],
  );

  const points = history.map((entry, index) => ({
    key: index,
    month: monthLabel(entry.date),
    day: dayLabel(entry.date),
    price: entry.price,
  }));

  const tick = { fill: colors.soft, fontSize: colors.size };

  return (
    <figure className="price-chart">
      <div className="cs-table-wrap">
        <div className="price-chart-box">
          <ResponsiveContainer width="100%" height={colors.height}>
            <LineChart data={points}>
              <CartesianGrid stroke={colors.grid} vertical={false} />
              <XAxis
                dataKey="month"
                tick={tick}
                tickLine={false}
                axisLine={{ stroke: colors.grid }}
              />
              <YAxis
                tick={tick}
                tickLine={false}
                axisLine={{ stroke: colors.grid }}
                tickFormatter={(value) => `$${value}`}
                domain={["dataMin - 10", "dataMax + 10"]}
                allowDecimals={false}
                width={colors.axis}
              />
              <Tooltip
                formatter={(value) => [`$${value}`, "Guide price"]}
                labelFormatter={(label, payload) =>
                  payload && payload[0] ? payload[0].payload.day : label
                }
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={colors.line}
                strokeWidth={2}
                dot={{ r: colors.dot, fill: colors.line, stroke: colors.line }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <figcaption className="price-chart-caption">Guide prices. Each point is a price check.</figcaption>
    </figure>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { CHART_MARGIN } from "@/constants";
import {
	formatCurrency,
	formatRangeDateYTD,
	formatShortDate,
} from "@/lib/formatters";
import { ToggleMultiple } from "@/components/ToggleMultiple/ToggleMultiple";
import type { ProfitHistoryPoint } from "@/lib/graphs";

import styles from "./ProfitHistoryChart.module.scss";

interface ProfitHistoryChartProps {
	data: ProfitHistoryPoint[];
}
type ChartRange = "ALL" | "6M" | "1M";

const CHART_RANGES: { label: string; value: ChartRange }[] = [
	{ label: "All", value: "ALL" },
	{ label: "6M", value: "6M" },
	{ label: "1M", value: "1M" },
];
export function ProfitHistoryChart({ data }: ProfitHistoryChartProps) {
	const [range, setRange] = useState<ChartRange>("ALL");

	const filteredData = useMemo(() => {
		if (range === "ALL") {
			return data;
		}
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const startDate = new Date(today);
		if (range === "6M") {
			startDate.setMonth(startDate.getMonth() - 6);
		}
		if (range === "1M") {
			startDate.setMonth(startDate.getMonth() - 1);
		}
		const firstVisibleIndex = data.findIndex(
			(point) => new Date(`${point.date}T00:00:00`) >= startDate,
		);
		if (firstVisibleIndex === -1) {
			return [];
		}
		if (firstVisibleIndex === 0) {
			return data;
		}
		return data.slice(firstVisibleIndex - 1);
	}, [data, range]);

	type ChartCSSProperties = React.CSSProperties & {
		"--chart-margin-top": string;
		"--chart-margin-right": string;
		"--chart-margin-bottom": string;
		"--chart-margin-left": string;
	};

	const cssVariables: ChartCSSProperties = {
		"--chart-margin-top": `${CHART_MARGIN.top / 16}rem`,
		"--chart-margin-right": `${CHART_MARGIN.right / 16}rem`,
		"--chart-margin-bottom": `${CHART_MARGIN.bottom / 16}rem`,
		"--chart-margin-left": `${CHART_MARGIN.left / 16}rem`,
	};

	return (
		<div className={styles.ProfitHistoryChart} style={cssVariables}>
			<div className={styles.ProfitHistoryChart__header}>
				<div className={styles.ProfitHistoryChart__ranges}>
					<ToggleMultiple
						options={CHART_RANGES}
						value={range}
						onChange={setRange}
					/>
				</div>
			</div>
			<div className={styles.ProfitHistoryChart__chart}>
				<ResponsiveContainer width='100%' height='100%'>
					<AreaChart data={filteredData} margin={CHART_MARGIN}>
						<defs>
							<linearGradient
								id='profitHistoryFill'
								x1='0'
								y1='0'
								x2='0'
								y2='1'
							>
								<stop
									offset='0%'
									stopColor='var(--chart-line-color)'
									stopOpacity='var(--chart-fill-opacity-start)'
								/>
								<stop
									offset='100%'
									stopColor='var(--chart-line-color)'
									stopOpacity='var(--chart-fill-opacity-end)'
								/>
							</linearGradient>
						</defs>

						<CartesianGrid stroke='var(--chart-grid-color)' />
						<ReferenceLine
							y={0}
							stroke='var(--chart-zero-line-color)'
							strokeWidth={1}
						/>

						<XAxis
							dataKey='date'
							tickFormatter={formatRangeDateYTD}
							tick={{
								fill: "var(--text-color)",
								fontSize: "var(--chart-axis-font-size)",
								opacity: "var(--chart-axis-font-opacity)",
							}}
							interval={4}
							tickLine={false}
							axisLine={{
								stroke: "var(--chart-axis-border-color)",
							}}
						/>

						<YAxis
							tickFormatter={(value) =>
								formatCurrency(Number(value), {
									minimumFractionDigits: 0,
									maximumFractionDigits: 0,
								})
							}
							tick={{
								fill: "var(--text-color)",
								fontSize: "var(--chart-axis-font-size)",
								opacity: "var(--chart-axis-font-opacity)",
							}}
							tickLine={false}
							axisLine={{
								stroke: "var(--chart-axis-border-color)",
							}}
						/>

						<Tooltip
							cursor={{
								stroke: "var(--chart-line-color)",
								strokeWidth: 1,
								strokeDasharray: "5 5",
							}}
							contentStyle={{
								backgroundColor: "var(--chart-tooltip-background-color)",
								border: "var(--chart-tooltip-border-line)",
								borderRadius: "var(--button-border-radius)",
								padding: "var(--chart-tooltip-padding)",
								boxShadow: "var(--chart-tooltip-box-shadow)",
							}}
							labelStyle={{
								color: "var(--chart-tooltip-label-color)",
							}}
							itemStyle={{
								color: "var(--chart-tooltip-item-color)",
							}}
							labelFormatter={(value) => formatShortDate(String(value))}
							formatter={(value) => [
								formatCurrency(Number(value), {
									minimumFractionDigits: 0,
									maximumFractionDigits: 0,
								}),
							]}
						/>

						<Area
							type='monotone'
							dataKey='value'
							stroke='var(--chart-line-color)'
							strokeWidth={2}
							fill='url(#profitHistoryFill)'
							dot={{
								fill: "var(--bg-color)",
								stroke: "var(--chart-dot-color)",
								strokeWidth: 2,
								fillOpacity: "1",
								r: 4,
							}}
							activeDot={{
								fill: "var(--chart-dot-color)",
								stroke: "var(--chart-dot-color)",
								strokeWidth: 2,
								r: 4,
							}}
							isAnimationActive={true}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}

"use client";

import { useMemo, useState } from "react";
import { ToggleMultiple } from "@/components/ToggleMultiple/ToggleMultiple";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { CHART_MARGIN } from "@/constants";
import {
	formatCurrency,
	formatNumericDate,
	formatShortDate,
	formatRangeDate1M,
	formatRangeDate1Y,
	formatRangeDateAll,
	formatRangeDateYTD,
} from "@/lib/formatters";
import type { CostHistoryPoint } from "@/lib/graphs";

import styles from "./CostHistoryChart.module.scss";

type ChartRange = "1M" | "YTD" | "1Y" | "ALL";

const CHART_RANGES: { label: string; value: ChartRange }[] = [
	{ label: "All", value: "ALL" },
	{ label: "1Y", value: "1Y" },
	{ label: "YTD", value: "YTD" },
	{ label: "1M", value: "1M" },
];

interface CostHistoryChartProps {
	data: CostHistoryPoint[];
}

export function CostHistoryChart({ data }: CostHistoryChartProps) {
	const [range, setRange] = useState<ChartRange>("1M");
	const rangeDateFormatter = {
		"1M": formatRangeDate1M,
		YTD: formatRangeDateYTD,
		"1Y": formatRangeDate1Y,
		ALL: formatRangeDateAll,
	}[range];
	const rangeInterval = {
		"1M": 0,
		YTD: 4,
		"1Y": 4,
		ALL: 10,
	}[range];

	const filteredData = useMemo(() => {
		if (range === "ALL") {
			return data;
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const startDate = new Date(today);

		switch (range) {
			case "1M":
				startDate.setMonth(startDate.getMonth() - 1);
				break;

			case "YTD":
				startDate.setMonth(0, 1);
				break;

			case "1Y":
				startDate.setFullYear(startDate.getFullYear() - 1);
				break;
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

	const yDomain = useMemo(() => {
		if (range === "ALL") {
			return [0, "auto"] as const;
		}

		const values = filteredData.map((point) => point.value);

		if (values.length === 0) {
			return [0, "auto"] as const;
		}

		const min = Math.min(...values);
		const max = Math.max(...values);
		const difference = max - min;

		if (difference === 0) {
			const padding = Math.max(max * 0.1, 100);

			return [
				Math.max(0, Math.floor(min - padding)),
				Math.ceil(max + padding),
			] as const;
		}

		const padding = difference * 0.1;

		return [
			Math.max(0, Math.floor(min - padding)),
			Math.ceil(max + padding),
		] as const;
	}, [filteredData, range]);

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
		<div className={styles.CostHistoryChart} style={cssVariables}>
			<div className={styles.CostHistoryChart__header}>
				<div className={styles.CostHistoryChart__ranges}>
					<ToggleMultiple
						options={CHART_RANGES}
						value={range}
						onChange={setRange}
					/>
				</div>
			</div>

			<div className={styles.CostHistoryChart__chart}>
				<ResponsiveContainer width='100%' height='100%'>
					<AreaChart data={filteredData} margin={CHART_MARGIN}>
						<defs>
							<linearGradient id='costHistoryFill' x1='0' y1='0' x2='0' y2='1'>
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

						<XAxis
							dataKey='date'
							tickFormatter={rangeDateFormatter}
							tick={{
								fill: "var(--text-color)",
								fontSize: "var(--chart-axis-font-size)",
								opacity: "var(--chart-axis-font-opacity)",
							}}
							interval={rangeInterval}
							tickLine={false}
							axisLine={{
								stroke: "var(--chart-axis-border-color)",
							}}
						/>

						<YAxis
							domain={yDomain}
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
							fill='url(#costHistoryFill)'
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

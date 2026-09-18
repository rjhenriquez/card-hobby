export const SIDEBAR_NAVIGATION = [
	{
		label: "Investments",
		href: "/",
		icon: "investments",
	},
	{
		label: "Collection",
		href: "/collection",
		icon: "collection",
	},
	{
		label: "Dashboard",
		href: "/dashboard",
		icon: "charts",
	},
	{
		label: "PSA Submissions",
		href: "/psa-submissions",
		icon: "submissions",
	},
	{
		label: "Packages",
		href: "/packages",
		icon: "shipping",
	},
	{
		label: "PSA Gem Rate",
		href: "/psa-gem-rate",
		icon: "diamond",
	},
] as const;

export const CARD_TABLE_COLUMN_WIDTHS: Record<string, string> = {
	info: "8.4em",
	ebaySeller: "8.4em",
	setName: "8.4em",
	notes: "4.2em",
	purchasedFrom: "8.4em",
	effectiveStatus: "8.4em",
};

export const CARD_TABLE_HIDDEN_COLUMNS: Record<
	"investment" | "collection",
	string[]
> = {
	investment: ["notes", "isShared"],
	collection: [
		"notes",
		"gradingCost",
		"effectiveStatus",
		"purchasedFrom",
		"price",
		"gradingCost",
		"ebaySeller",
		"soldPrice",
		"soldDate",
		"profit",
		"roi",
		"psaSubmissionNumbers",
	],
};
export const CARD_TABLE_VALUE_COLUMNS = [
	"price",
	"gradingCost",
	"totalCost",
	"soldPrice",
	"profit",
	"roi",
] as const;

export const CHART_MARGIN = {
	top: 16,
	right: 32,
	bottom: 0,
	left: 0,
};

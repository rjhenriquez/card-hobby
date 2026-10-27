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
		icon: "psa",
	},
	{
		label: "Packages",
		href: "/packages",
		icon: "shipping",
		divider: true,
	},
	{
		label: "Auctions",
		href: "/auctions",
		icon: "auction",
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

// Quick selections for the card table's Cost filter, in dollars.
// Use `null` for an open end: { min: 500, max: null } means "$500 and up".
export const FILTER_COST_RANGES: { min: number | null; max: number | null }[] =
	[
		{ min: 0, max: 100 },
		{ min: 100, max: 200 },
		{ min: 200, max: 500 },
		{ min: 500, max: null },
	];

export const CHART_MARGIN = {
	top: 16,
	right: 32,
	bottom: 0,
	left: 0,
};
export const PSA_GRADE_DEFINITIONS = {
	10: "GEM MT",
	9: "MINT",
	8.5: "NM-MT+",
	8: "NM-MT",
	7.5: "NM+",
	7: "NM",
	6.5: "EX-MT+",
	6: "EX-MT",
	5.5: "EX+",
	5: "EX",
	4.5: "VG-EX+",
	4: "VG-EX",
	3.5: "VG+",
	3: "VG",
	2.5: "GOOD+",
	2: "GOOD",
	1.5: "FR",
	1: "PR",
} as const;

export const STATUS_CLASSES = [
	{ term: "Transit", className: "status--yellow" },
	{ term: "Ebay", className: "status--green" },
	{ term: "PSA", className: "status--red" },
	{ term: "Received", className: "status--blue" },
	{ term: "In Hand", className: "status--blue" },
	{ term: "Available", className: "status--green" },
	{ term: "Pending", className: "status--yellow" },
	{ term: "Redemption", className: "status--gray" },
	{ term: "DCSports", className: "status--blue-light" },
];

// Browser width ranges in px, matching the SCSS ranges in
// styles/utilities/_mixin-media-queries.scss. Use with useDimensions():
// const isLargeWidth = useDimensions() >= BROWSER_WIDTH_RANGES.large.min;
export const BROWSER_WIDTH_RANGES = {
	tiny: { min: 0, max: 400 },
	small: { min: 401, max: 768 },
	medium: { min: 769, max: 1140 },
	large: { min: 1141, max: Infinity },
} as const;

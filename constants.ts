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

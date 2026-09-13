export const CARD_TABLE_COLUMN_WIDTHS: Record<string, string> = {
	info: "100px",
	ebaySeller: "100px",
	setName: "100px",
	notes: "50px",
	purchasedFrom: "100px",
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

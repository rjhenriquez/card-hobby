export interface Card {
	id: number;
	player: string;
	category: string | null;
	year: string | null;
	setName: string | null;
	info: string | null;
	notes: string | null;
	portfolio: "investment" | "collection";
	acquisitionType: "purchased" | "pulled";
	price: number | null;
	purchaseDate: string | null;
	purchasedFrom: string | null;
	ebaySeller: string | null;
	purchasePrice: string | null;
	status: string | null;
	effectiveStatus: string | null;
	psaSubmissionNumbers: string[];
	gradingCost: number;
	totalCost: number | null;
	soldVia: string | null;
	soldDate: string | null;
	soldPrice: string | null;
	profit: number | null;
	isPaid: boolean;
	roi: number | null;
}

import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { db } from "@/db";
import { cards, cardStatuses } from "@/db/schema";

interface CsvRow {
	Player: string;
	Category: string;
	Status: string;
	Year: string;
	Set: string;
	Info: string;
	Notes: string;
	"Purchase Date": string;
	"Purchased from": string;
	"Ebay Seller": string;
	Price: string;
	Sold: string;
}
const statusMap: Record<string, string> = {
	"PSA - Ebay Auction": "Raw Pile",
	"PSA Grading": "Raw Pile",
	"Ebay Fixed": "Raw Pile",
	"In Transit from PSA": "In Transit",
	"Waiting PSA lower tier": "Raw Pile",
};

function parseCurrency(value: string) {
	const cleaned = value.replace(/[$,]/g, "").trim();

	if (!cleaned) {
		return null;
	}

	const number = Number(cleaned);

	return Number.isNaN(number) ? null : number.toFixed(2);
}

function parseDate(value: string) {
	if (!value.trim()) {
		return null;
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return null;
	}

	return date.toISOString().slice(0, 10);
}

const fileArgument = process.argv[2];
const shouldImport = process.argv.includes("--import");

if (!fileArgument) {
	throw new Error(
		"CSV file is required. Example: npm run import:cards -- testData.csv",
	);
}

const filePath = path.resolve(fileArgument);
const csv = fs.readFileSync(filePath, "utf8");

const lines = csv.split(/\r?\n/);

// Numbers exported an extra title line before the actual CSV header.
const csvWithoutTitle = lines.slice(1).join("\n");

const rows = parse(csvWithoutTitle, {
	columns: true,
	skip_empty_lines: true,
	trim: true,
}) as CsvRow[];
async function main() {
	const statusRows = await db
		.select({
			id: cardStatuses.id,
			name: cardStatuses.name,
		})
		.from(cardStatuses);

	const statusByName = new Map(
		statusRows.map((status) => [status.name, status.id]),
	);

	const cardRows = rows.filter((row) => row.Player?.trim());

	const unsoldRows = cardRows.filter((row) => !row.Sold?.trim());

	const invalidRows: {
		row: number;
		player: string;
		reasons: string[];
	}[] = [];

	const cardsToImport = unsoldRows.map((row, index) => {
		const reasons: string[] = [];

		if (!row.Player?.trim()) {
			reasons.push("Missing player");
		}

		const rawStatus = row.Status?.trim() ?? "";

		const normalizedStatus = statusMap[rawStatus] ?? rawStatus;

		if (normalizedStatus && !statusByName.has(normalizedStatus)) {
			reasons.push(`Unknown status: "${rawStatus}"`);
		}

		const purchaseDate = parseDate(row["Purchase Date"]);

		if (row["Purchase Date"]?.trim() && !purchaseDate) {
			reasons.push(`Invalid purchase date: "${row["Purchase Date"]}"`);
		}

		const purchasePrice = parseCurrency(row.Price);

		if (row.Price?.trim() && purchasePrice === null) {
			reasons.push(`Invalid price: "${row.Price}"`);
		}

		if (reasons.length > 0) {
			invalidRows.push({
				row: index + 3,
				player: row.Player || "Unknown",
				reasons,
			});
		}

		return {
			player: row.Player.trim(),
			category: row.Category?.trim() || null,
			year: row.Year?.trim() || null,
			setName: row.Set?.trim() || null,
			info: row.Info?.trim() || null,
			notes: row.Notes?.trim() || null,
			portfolio: "investment" as const,
			statusId: normalizedStatus
				? (statusByName.get(normalizedStatus) ?? null)
				: null,
			acquisitionType: "purchased" as const,
			purchaseDate,
			purchasedFrom: row["Purchased from"]?.trim() || null,
			ebaySeller: row["Ebay Seller"]?.trim() || null,
			purchasePrice,
			isPaid: false,
		};
	});

	console.log("");
	console.log("Card Import Dry Run");
	console.log("-------------------");
	console.log(`CSV rows: ${rows.length}`);
	console.log(`Card rows: ${cardRows.length}`);
	console.log(`Unsold rows: ${unsoldRows.length}`);
	console.log(`Skipped sold rows: ${cardRows.length - unsoldRows.length}`);
	console.log(`Valid cards: ${cardsToImport.length - invalidRows.length}`);
	console.log(`Invalid cards: ${invalidRows.length}`);
	console.log("");

	if (invalidRows.length > 0) {
		console.log("Problems:");

		for (const row of invalidRows) {
			console.log(`Row ${row.row} - ${row.player}`);

			for (const reason of row.reasons) {
				console.log(`  - ${reason}`);
			}
		}

		console.log("");
	}

	if (!shouldImport) {
		console.log("No database changes made.");
		console.log("");
		console.log("Run again with --import to insert these cards.");
		return;
	}

	if (invalidRows.length > 0) {
		console.log("Import cancelled because invalid rows were found.");
		return;
	}

	await db.insert(cards).values(cardsToImport);

	console.log(`Imported ${cardsToImport.length} cards.`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { parse } from "csv-parse/sync";
import { cards, cardStatuses } from "@/db/schema";

dotenv.config({
	path: path.join(process.cwd(), ".env.local"),
});

interface CsvRow {
	player: string;
	category: string;
	year: string;
	setName: string;
	info: string;
	notes: string;
	purchaseDate: string;
	purchasedFrom: string;
	ebaySeller: string;
	purchasePrice: string;
}

function parseCurrency(value: string) {
	const cleaned = value?.replace(/[$,]/g, "").trim();

	if (!cleaned) {
		return null;
	}

	const number = Number(cleaned);

	return Number.isNaN(number) ? null : number.toFixed(2);
}

function parseDate(value: string) {
	const trimmed = value?.trim();

	if (!trimmed) {
		return null;
	}

	const date = new Date(trimmed);

	if (Number.isNaN(date.getTime())) {
		return null;
	}

	return date.toISOString().slice(0, 10);
}

function parseOptionalString(value: string) {
	const trimmed = value?.trim();

	if (!trimmed || trimmed.toUpperCase() === "N/A") {
		return null;
	}

	return trimmed;
}

const fileArgument = process.argv[2] ?? "collection.csv";
const shouldImport = process.argv.includes("--import");

const filePath = path.resolve(fileArgument);
const csv = fs.readFileSync(filePath, "utf8");

const rows = parse(csv, {
	columns: true,
	skip_empty_lines: true,
	trim: true,
}) as CsvRow[];

async function main() {
	// Import DB only after .env.local has been loaded.
	const { db } = await import("@/db");

	const statusRows = await db
		.select({
			id: cardStatuses.id,
			name: cardStatuses.name,
		})
		.from(cardStatuses);

	const collectionStatus = statusRows.find(
		(status) => status.name === "Collection",
	);

	if (!collectionStatus) {
		throw new Error(
			'Card status "Collection" does not exist. Create it before importing.',
		);
	}

	const invalidRows: {
		row: number;
		player: string;
		reasons: string[];
	}[] = [];

	const cardsToImport = rows.map((row, index) => {
		const reasons: string[] = [];

		const player = row.player?.trim();

		if (!player) {
			reasons.push("Missing player");
		}

		const purchaseDate = parseDate(row.purchaseDate);

		if (row.purchaseDate?.trim() && !purchaseDate) {
			reasons.push(`Invalid purchase date: "${row.purchaseDate}"`);
		}

		const purchasePrice = parseCurrency(row.purchasePrice);

		if (row.purchasePrice?.trim() && purchasePrice === null) {
			reasons.push(`Invalid purchase price: "${row.purchasePrice}"`);
		}

		if (reasons.length > 0) {
			invalidRows.push({
				row: index + 2,
				player: player || "Unknown",
				reasons,
			});
		}

		return {
			player: player ?? "",
			category: parseOptionalString(row.category),
			year: parseOptionalString(row.year),
			setName: parseOptionalString(row.setName),
			info: parseOptionalString(row.info),
			notes: parseOptionalString(row.notes),

			portfolio: "collection" as const,
			statusId: collectionStatus.id,
			acquisitionType: "purchased" as const,

			purchaseDate,
			purchasedFrom: parseOptionalString(row.purchasedFrom),
			ebaySeller: parseOptionalString(row.ebaySeller),
			purchasePrice,

			isPaid: false,
			isShared: false,
		};
	});

	console.log("");
	console.log("Collection Import Dry Run");
	console.log("-------------------------");
	console.log(`CSV rows: ${rows.length}`);
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
		console.log("Run again with --import to insert these cards:");
		console.log(
			`npx tsx scripts/import-collection.ts ${fileArgument} --import`,
		);

		return;
	}

	if (invalidRows.length > 0) {
		console.log("Import cancelled because invalid rows were found.");
		return;
	}

	await db.insert(cards).values(cardsToImport);

	console.log("");
	console.log(`✓ Imported ${cardsToImport.length} collection cards.`);
}

main().catch((error) => {
	console.error("");
	console.error("Collection import failed:");
	console.error(error);
	process.exit(1);
});

import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { parse } from "csv-parse/sync";
import {
	cards,
	cardStatuses,
	psaSubmissionCards,
	psaSubmissions,
} from "@/db/schema";

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
	gradingCost: string;
	psaSubmissionNumber: string;
	grade: string;
	soldPrice: string;
	soldDate: string;
}

function parseCurrency(value: string) {
	const cleaned = value.replace(/[$,]/g, "").trim();

	if (!cleaned) {
		return null;
	}

	const number = Number(cleaned);

	return Number.isNaN(number) ? null : number.toFixed(2);
}

function parseDate(value: string) {
	const trimmed = value.trim();

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

const fileArgument = process.argv[2] ?? "cards_sold.csv";
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

	const soldStatus = statusRows.find((status) => status.name === "Sold");

	if (!soldStatus) {
		throw new Error('Card status "Sold" does not exist');
	}

	const submissionRows = await db
		.select({
			id: psaSubmissions.id,
			submissionNumber: psaSubmissions.submissionNumber,
		})
		.from(psaSubmissions);

	const submissionByNumber = new Map(
		submissionRows.map((submission) => [
			submission.submissionNumber,
			submission.id,
		]),
	);

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

		const soldDate = parseDate(row.soldDate);

		if (!soldDate) {
			reasons.push(`Invalid sold date: "${row.soldDate}"`);
		}

		const purchasePrice = parseCurrency(row.purchasePrice);

		if (row.purchasePrice?.trim() && purchasePrice === null) {
			reasons.push(`Invalid purchase price: "${row.purchasePrice}"`);
		}

		const soldPrice = parseCurrency(row.soldPrice);

		if (soldPrice === null) {
			reasons.push(`Invalid sold price: "${row.soldPrice}"`);
		}

		const gradingCost = parseCurrency(row.gradingCost);

		if (row.gradingCost?.trim() && gradingCost === null) {
			reasons.push(`Invalid grading cost: "${row.gradingCost}"`);
		}

		const submissionNumber = parseOptionalString(row.psaSubmissionNumber);

		if (submissionNumber && !submissionByNumber.has(submissionNumber)) {
			reasons.push(`Unknown PSA submission: "${submissionNumber}"`);
		}

		const gradeValue = parseOptionalString(row.grade);

		if (
			gradeValue &&
			(Number.isNaN(Number(gradeValue)) ||
				Number(gradeValue) < 0 ||
				Number(gradeValue) > 10)
		) {
			reasons.push(`Invalid grade: "${row.grade}"`);
		}

		if (reasons.length > 0) {
			invalidRows.push({
				row: index + 2,
				player: player || "Unknown",
				reasons,
			});
		}
		return {
			card: {
				player: player ?? "",
				category: parseOptionalString(row.category),
				year: parseOptionalString(row.year),
				setName: parseOptionalString(row.setName),
				info: parseOptionalString(row.info),
				notes: parseOptionalString(row.notes),

				portfolio: "investment" as const,
				statusId: soldStatus.id,
				acquisitionType: "purchased" as const,

				purchaseDate,
				purchasedFrom: parseOptionalString(row.purchasedFrom),
				ebaySeller: parseOptionalString(row.ebaySeller),
				purchasePrice,

				historicalGradingCost: !submissionNumber ? gradingCost : null,

				historicalGrade:
					!submissionNumber && gradeValue
						? Number(gradeValue).toFixed(1)
						: null,

				soldDate,
				soldPrice,

				isPaid: true,
				isShared: false,
			},

			submissionNumber,
			gradingCost,
			grade: gradeValue,
		};
	});

	console.log("");
	console.log("Sold Card Import Dry Run");
	console.log("------------------------");
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
		console.log(`Run again with --import to insert these cards:`);
		console.log(`npx tsx scripts/import-cards.ts ${fileArgument} --import`);
		return;
	}

	if (invalidRows.length > 0) {
		console.log("Import cancelled because invalid rows were found.");
		return;
	}

	for (const [index, item] of cardsToImport.entries()) {
		const [insertedCard] = await db.insert(cards).values(item.card).returning({
			id: cards.id,
		});

		if (item.submissionNumber) {
			const submissionId = submissionByNumber.get(item.submissionNumber);

			if (!submissionId) {
				throw new Error(`PSA submission ${item.submissionNumber} not found`);
			}

			await db.insert(psaSubmissionCards).values({
				submissionId,
				cardId: insertedCard.id,

				baseGradingFee: item.gradingCost ?? "0",
				gradingAdjustment: "0",

				grade: item.grade ? Number(item.grade).toFixed(1) : null,

				gradeStatus: item.grade ? "graded" : "no_grade",
			});
		}

		console.log(`✓ ${index + 1}/${cardsToImport.length} — ${item.card.player}`);
	}

	console.log("");
	console.log(`✓ Imported ${cardsToImport.length} sold cards.`);
}

main().catch((error) => {
	console.error("");
	console.error("Card import failed:");
	console.error(error);
	process.exit(1);
});

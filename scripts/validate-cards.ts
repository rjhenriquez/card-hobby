import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config({
	path: path.join(process.cwd(), ".env.local"),
});

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not defined");
}

const sql = neon(process.env.DATABASE_URL);

const filePath = path.join(process.cwd(), "cards_sold.csv");
const csv = fs.readFileSync(filePath, "utf8").trim();

const [headerRow, ...rows] = csv.split(/\r?\n/);

const headers = headerRow.split(",").map((header) => header.trim());

const expectedHeaders = [
	"player",
	"category",
	"year",
	"setName",
	"info",
	"notes",
	"purchaseDate",
	"purchasedFrom",
	"ebaySeller",
	"purchasePrice",
	"gradingCost",
	"psaSubmissionNumber",
	"grade",
	"soldPrice",
	"soldDate",
];

if (headers.join(",") !== expectedHeaders.join(",")) {
	throw new Error(
		`Unexpected CSV headers.\nExpected: ${expectedHeaders.join(",")}\nReceived: ${headers.join(",")}`,
	);
}

async function validateCards() {
	let hasErrors = false;

	const psaSubmissions = await sql`
		SELECT submission_number
		FROM psa_submissions
	`;

	const validSubmissionNumbers = new Set(
		psaSubmissions.map((row) => String(row.submission_number)),
	);

	rows.forEach((row, index) => {
		const lineNumber = index + 2;

		const values = row.split(",").map((value) => value.trim());

		if (values.length !== expectedHeaders.length) {
			console.error(
				`Line ${lineNumber}: expected ${expectedHeaders.length} columns, received ${values.length}.`,
			);

			hasErrors = true;
			return;
		}

		const [
			player,
			category,
			year,
			setName,
			info,
			notes,
			purchaseDate,
			purchasedFrom,
			ebaySeller,
			purchasePrice,
			gradingCost,
			psaSubmissionNumber,
			grade,
			soldPrice,
			soldDate,
		] = values;

		if (!player) {
			console.error(`Line ${lineNumber}: player is required.`);
			hasErrors = true;
		}

		if (purchaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate)) {
			console.error(
				`Line ${lineNumber}: invalid purchaseDate "${purchaseDate}".`,
			);
			hasErrors = true;
		}

		if (!soldDate || !/^\d{4}-\d{2}-\d{2}$/.test(soldDate)) {
			console.error(`Line ${lineNumber}: invalid soldDate "${soldDate}".`);
			hasErrors = true;
		}

		if (
			purchasePrice &&
			(Number.isNaN(Number(purchasePrice)) || Number(purchasePrice) < 0)
		) {
			console.error(
				`Line ${lineNumber}: invalid purchasePrice "${purchasePrice}".`,
			);
			hasErrors = true;
		}

		if (
			gradingCost &&
			(Number.isNaN(Number(gradingCost)) || Number(gradingCost) < 0)
		) {
			console.error(
				`Line ${lineNumber}: invalid gradingCost "${gradingCost}".`,
			);
			hasErrors = true;
		}

		if (
			!soldPrice ||
			Number.isNaN(Number(soldPrice)) ||
			Number(soldPrice) < 0
		) {
			console.error(`Line ${lineNumber}: invalid soldPrice "${soldPrice}".`);
			hasErrors = true;
		}

		if (
			grade &&
			(Number.isNaN(Number(grade)) || Number(grade) < 0 || Number(grade) > 10)
		) {
			console.error(`Line ${lineNumber}: invalid grade "${grade}".`);
			hasErrors = true;
		}

		if (
			psaSubmissionNumber &&
			psaSubmissionNumber.toUpperCase() !== "N/A" &&
			!validSubmissionNumbers.has(psaSubmissionNumber)
		) {
			console.error(
				`Line ${lineNumber}: PSA submission ${psaSubmissionNumber} does not exist.`,
			);
			hasErrors = true;
		}

		void category;
		void year;
		void setName;
		void info;
		void notes;
		void purchasedFrom;
		void ebaySeller;
	});

	if (hasErrors) {
		process.exitCode = 1;
		return;
	}

	console.log("✓ Sold-card CSV is valid.");
	console.log(`✓ ${rows.length} sold cards found.`);
	console.log("✓ PSA submission references are valid.");
}

validateCards().catch((error) => {
	console.error(error);
	process.exit(1);
});

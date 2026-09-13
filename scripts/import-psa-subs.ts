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

const filePath = path.join(process.cwd(), "psa_subs.csv");
const csv = fs.readFileSync(filePath, "utf8").trim();

const [, ...rows] = csv.split(/\r?\n/);

async function importPsaSubmissions() {
	console.log(`Importing ${rows.length} historical PSA submissions...`);

	for (const [index, row] of rows.entries()) {
		const [
			submissionNumber,
			receivedDate,
			historicalTotalCards,
			historicalPsa10,
			historicalPsa9,
			historicalPsa85,
			historicalPsa8,
			historicalPsa75OrLess,
			historicalNoGrade,
		] = row.split(",").map((value) => value.trim());

		await sql`
			INSERT INTO psa_submissions (
				submission_number,
				received_date,
				is_historical,
				historical_total_cards,
				historical_psa_10,
				historical_psa_9,
				historical_psa_85,
				historical_psa_8,
				historical_psa_75_or_less,
				historical_no_grade
			)
			VALUES (
				${submissionNumber},
				${receivedDate},
				true,
				${Number(historicalTotalCards)},
				${Number(historicalPsa10)},
				${Number(historicalPsa9)},
				${Number(historicalPsa85)},
				${Number(historicalPsa8)},
				${Number(historicalPsa75OrLess)},
				${Number(historicalNoGrade)}
			)
		`;

		console.log(`✓ ${index + 1}/${rows.length} — PSA ${submissionNumber}`);
	}

	console.log("");
	console.log(`✓ Imported ${rows.length} historical PSA submissions.`);
}

importPsaSubmissions().catch((error) => {
	console.error("PSA import failed:");
	console.error(error);
	process.exit(1);
});

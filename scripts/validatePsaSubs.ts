import fs from "node:fs";
import path from "node:path";

const filePath = path.join(process.cwd(), "psa_subs.csv");
const csv = fs.readFileSync(filePath, "utf8").trim();

const [headerRow, ...rows] = csv.split(/\r?\n/);

const headers = headerRow.split(",").map((header) => header.trim());

const expectedHeaders = [
	"submissionNumber",
	"receivedDate",
	"historicalTotalCards",
	"historicalPsa10",
	"historicalPsa9",
	"historicalPsa85",
	"historicalPsa8",
	"historicalPsa75OrLess",
	"historicalNoGrade",
];

if (headers.join(",") !== expectedHeaders.join(",")) {
	throw new Error(
		`Unexpected CSV headers.\nExpected: ${expectedHeaders.join(",")}\nReceived: ${headers.join(",")}`,
	);
}

const seenSubmissionNumbers = new Set<string>();
let hasErrors = false;

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
		submissionNumber,
		receivedDate,
		totalCardsValue,
		psa10Value,
		psa9Value,
		psa85Value,
		psa8Value,
		psa75OrLessValue,
		noGradeValue,
	] = values;

	if (!submissionNumber) {
		console.error(`Line ${lineNumber}: missing submission number.`);
		hasErrors = true;
	}

	if (seenSubmissionNumbers.has(submissionNumber)) {
		console.error(
			`Line ${lineNumber}: duplicate submission number ${submissionNumber}.`,
		);
		hasErrors = true;
	}

	seenSubmissionNumbers.add(submissionNumber);

	if (!/^\d{4}-\d{2}-\d{2}$/.test(receivedDate)) {
		console.error(
			`Line ${lineNumber}: invalid received date "${receivedDate}".`,
		);
		hasErrors = true;
	}

	const totalCards = Number(totalCardsValue);
	const psa10 = Number(psa10Value);
	const psa9 = Number(psa9Value);
	const psa85 = Number(psa85Value);
	const psa8 = Number(psa8Value);
	const psa75OrLess = Number(psa75OrLessValue);
	const noGrade = Number(noGradeValue);

	const counts = [totalCards, psa10, psa9, psa85, psa8, psa75OrLess, noGrade];

	if (counts.some((value) => !Number.isInteger(value) || value < 0)) {
		console.error(`Line ${lineNumber}: one or more grade counts are invalid.`);
		hasErrors = true;
		return;
	}

	const bucketTotal = psa10 + psa9 + psa85 + psa8 + psa75OrLess + noGrade;

	if (bucketTotal !== totalCards) {
		console.error(
			`Line ${lineNumber} (${submissionNumber}): total cards = ${totalCards}, but grade buckets add up to ${bucketTotal}.`,
		);
		hasErrors = true;
	}
});

if (hasErrors) {
	process.exitCode = 1;
} else {
	console.log(`✓ PSA CSV is valid.`);
	console.log(`✓ ${rows.length} historical submissions found.`);
	console.log(`✓ No duplicate submission numbers.`);
	console.log(`✓ All grade buckets match their total card counts.`);
}

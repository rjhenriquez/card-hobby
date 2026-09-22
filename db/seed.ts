import { config } from "dotenv";

config({ path: ".env.local" });

const statuses = [
	"In Transit",
	"Received",
	"Lost In Transit",
	"Raw Pile",
	"DCSports Submission",
	"Pending Payment",
	"Sold",
	"Available - Raw",
	"Available - Graded",
];

async function seed() {
	const { db } = await import("./index");
	const { cardStatuses } = await import("./schema");

	await db
		.insert(cardStatuses)
		.values(statuses.map((name) => ({ name })))
		.onConflictDoNothing({
			target: cardStatuses.name,
		});

	console.log("Database seeded.");
}

seed().catch((error) => {
	console.error("Failed to seed database:", error);
	process.exit(1);
});

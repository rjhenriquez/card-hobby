import { db } from "./index";
import { cardStatuses } from "./schema";
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
];

async function seed() {
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

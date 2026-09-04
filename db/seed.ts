import { db } from "./index";
import { cardStatuses } from "./schema";

const statuses = [
  "In Transit",
  "Lost In Transit",
  "Raw Pile",
  "DCSports Submission",
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

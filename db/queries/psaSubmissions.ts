import { desc } from "drizzle-orm";
import { db } from "@/db";
import { psaSubmissions } from "@/db/schema";

export async function getPsaSubmissions() {
	return db
		.select({
			id: psaSubmissions.id,
			submissionNumber: psaSubmissions.submissionNumber,
			stage: psaSubmissions.stage,
			sentDate: psaSubmissions.sentDate,
			receivedDate: psaSubmissions.receivedDate,
			completedDate: psaSubmissions.completedDate,
		})
		.from(psaSubmissions)
		.orderBy(desc(psaSubmissions.createdAt));
}

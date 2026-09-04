import { notFound } from "next/navigation";
import { PsaSubmissionCardRow } from "@/components/PsaSubmissionCardRow/PsaSubmissionCardRow";
import { PsaSubmissionStats } from "@/components/PsaSubmissionStats/PsaSubmissionStats";
import { PsaSubmissionForm } from "@/components/PsaSubmissionForm/PsaSubmissionForm";
import {
  getCardsForPsaSubmission,
  getPsaSubmissionByNumber,
} from "@/db/queries/psaSubmissionCards";

interface PsaSubmissionPageProps {
  params: Promise<{
    submissionNumber: string;
  }>;
}

export default async function PsaSubmissionPage({
  params,
}: PsaSubmissionPageProps) {
  const { submissionNumber } = await params;

  const submission = await getPsaSubmissionByNumber(submissionNumber);

  if (!submission) {
    notFound();
  }

  const cards = await getCardsForPsaSubmission(submission.id);

  const sharedCost =
    cards.length > 0
      ? (Number(submission.shippingCost) + Number(submission.insuranceCost)) /
        cards.length
      : 0;

  return (
    <main>
      <h1>PSA Submission {submission.submissionNumber}</h1>

      <PsaSubmissionForm submission={submission} />

      <PsaSubmissionStats cards={cards} />

      <section>
        <h2>Cards</h2>

        {cards.length === 0 ? (
          <p>No cards in this submission.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Year</th>
                <th>Set</th>
                <th>Info</th>
                <th>Base Fee</th>
                <th>Shared Cost</th>
                <th>Adjustment</th>
                <th>Total Grading Cost</th>
                <th>Grade</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {cards.map((card) => (
                <PsaSubmissionCardRow
                  key={card.submissionCardId}
                  card={card}
                  submissionNumber={submission.submissionNumber}
                  sharedCost={sharedCost}
                />
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

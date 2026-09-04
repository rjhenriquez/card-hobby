interface PsaSubmissionCard {
  grade: string | null;
  gradeStatus: "pending" | "graded" | "no_grade";
}

interface PsaSubmissionStatsProps {
  cards: PsaSubmissionCard[];
}

export function PsaSubmissionStats({ cards }: PsaSubmissionStatsProps) {
  const gradedCards = cards.filter((card) => card.gradeStatus === "graded");

  const psa10 = gradedCards.filter((card) => Number(card.grade) === 10).length;

  const psa9 = gradedCards.filter((card) => Number(card.grade) === 9).length;

  const psa85 = gradedCards.filter((card) => Number(card.grade) === 8.5).length;

  const psa8 = gradedCards.filter((card) => Number(card.grade) === 8).length;

  const psa75OrLess = gradedCards.filter(
    (card) => Number(card.grade) <= 7.5,
  ).length;

  const noGrade = cards.filter(
    (card) => card.gradeStatus === "no_grade",
  ).length;

  const completedCards = gradedCards.length + noGrade;

  const gemRate = completedCards > 0 ? (psa10 / completedCards) * 100 : 0;

  const nineOrBetter =
    completedCards > 0 ? ((psa10 + psa9) / completedCards) * 100 : 0;

  return (
    <section className="DevPsaStats">
      <h2>Grading Summary</h2>

      <dl>
        <div>
          <dt>Total Cards</dt>
          <dd>{cards.length}</dd>
        </div>

        <div>
          <dt>Completed</dt>
          <dd>{completedCards}</dd>
        </div>

        <div>
          <dt>PSA 10</dt>
          <dd>{psa10}</dd>
        </div>

        <div>
          <dt>PSA 9</dt>
          <dd>{psa9}</dd>
        </div>

        <div>
          <dt>PSA 8.5</dt>
          <dd>{psa85}</dd>
        </div>

        <div>
          <dt>PSA 8</dt>
          <dd>{psa8}</dd>
        </div>

        <div>
          <dt>PSA 7.5 or Less</dt>
          <dd>{psa75OrLess}</dd>
        </div>

        <div>
          <dt>No Grade</dt>
          <dd>{noGrade}</dd>
        </div>

        <div>
          <dt>Gem Rate</dt>
          <dd>{gemRate.toFixed(1)}%</dd>
        </div>

        <div>
          <dt>9 or Better</dt>
          <dd>{nineOrBetter.toFixed(1)}%</dd>
        </div>
      </dl>
    </section>
  );
}

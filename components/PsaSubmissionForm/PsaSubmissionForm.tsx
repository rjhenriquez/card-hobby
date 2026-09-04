"use client";

import { updatePsaSubmission } from "@/app/actions/psaSubmissions";

interface PsaSubmission {
  id: number;
  submissionNumber: string;
  stage: string | null;
  sentDate: string | null;
  receivedDate: string | null;
  completedDate: string | null;
  shippingCost: string;
  insuranceCost: string;
  totalAmountCharged: string | null;
}

interface PsaSubmissionFormProps {
  submission: PsaSubmission;
}

export function PsaSubmissionForm({ submission }: PsaSubmissionFormProps) {
  return (
    <form action={updatePsaSubmission}>
      <input type="hidden" name="id" value={submission.id} />

      <label>
        Submission Number
        <input type="text" value={submission.submissionNumber} disabled />
      </label>

      <label>
        Stage
        <input type="text" name="stage" defaultValue={submission.stage ?? ""} />
      </label>

      <label>
        Sent Date
        <input
          type="date"
          name="sentDate"
          defaultValue={submission.sentDate ?? ""}
        />
      </label>

      <label>
        Received Date
        <input
          type="date"
          name="receivedDate"
          defaultValue={submission.receivedDate ?? ""}
        />
      </label>

      <label>
        Completed Date
        <input
          type="date"
          name="completedDate"
          defaultValue={submission.completedDate ?? ""}
        />
      </label>

      <label>
        Shipping Cost
        <input
          type="number"
          name="shippingCost"
          step="0.01"
          min="0"
          defaultValue={submission.shippingCost}
        />
      </label>

      <label>
        Insurance Cost
        <input
          type="number"
          name="insuranceCost"
          step="0.01"
          min="0"
          defaultValue={submission.insuranceCost}
        />
      </label>

      <label>
        Total Amount Charged
        <input
          type="number"
          name="totalAmountCharged"
          step="0.01"
          min="0"
          defaultValue={submission.totalAmountCharged ?? ""}
        />
      </label>

      <button type="submit">Save Submission</button>
    </form>
  );
}

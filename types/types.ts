export interface Card {
  id: number;
  player: string;
  category: string | null;
  year: string | null;
  setName: string | null;
  info: string | null;
  notes: string | null;
  portfolio: "investment" | "collection";
  acquisitionType: "purchased" | "pulled";
  purchaseDate: string | null;
  purchasedFrom: string | null;
  ebaySeller: string | null;
  purchasePrice: string | null;
  status: string | null;
  effectiveStatus: string | null;
  activePsaSubmissionNumber: string | null;
}

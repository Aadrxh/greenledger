export interface DailySummary {
  date: string;
  totalsByCategory: Record<string, number>;
  grandTotal: number;
  generatedAt: string;
}

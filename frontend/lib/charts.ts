export const chartColors = {
  invested: "#6366f1",
  value: "#16a34a",
  interest: "#f59e0b",
  principal: "#60a5fa",
  balance: "#94a3b8"
};

export type SeriesPoint = Record<string, number | string> & { t: number };

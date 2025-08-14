/** Shared lightweight types used across calculator clients */

export type Mode = "sip" | "lumpsum";

export type NumericChangeHandler = (v: number) => void;

export type Calculation = {
  type: string;
  inputs: Record<string, number>;
  results: Record<string, number>;
  timestamp: number;
};

export type SavedCalculation = Calculation & { id: string };

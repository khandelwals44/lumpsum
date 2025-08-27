export interface CalculationHistory {
  id: string;
  type: string;
  title: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
  timestamp: number;
  isBookmarked: boolean;
}

const STORAGE_KEY = 'lumpsum_calculations';
const MAX_HISTORY = 50;

export class CalculationHistoryManager {
  private static getStoredHistory(): CalculationHistory[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load calculation history:', error);
      return [];
    }
  }

  private static saveHistory(history: CalculationHistory[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save calculation history:', error);
    }
  }

  static addCalculation(
    type: string,
    title: string,
    inputs: Record<string, any>,
    results: Record<string, any>
  ): void {
    const history = this.getStoredHistory();
    
    const newCalculation: CalculationHistory = {
      id: `${type}_${Date.now()}`,
      type,
      title,
      inputs,
      results,
      timestamp: Date.now(),
      isBookmarked: false
    };

    // Remove duplicate if same type and inputs
    const filteredHistory = history.filter(calc => 
      !(calc.type === type && JSON.stringify(calc.inputs) === JSON.stringify(inputs))
    );

    // Add new calculation at the beginning
    filteredHistory.unshift(newCalculation);

    // Keep only the latest MAX_HISTORY calculations
    if (filteredHistory.length > MAX_HISTORY) {
      filteredHistory.splice(MAX_HISTORY);
    }

    this.saveHistory(filteredHistory);
  }

  static getHistory(): CalculationHistory[] {
    return this.getStoredHistory();
  }

  static getHistoryByType(type: string): CalculationHistory[] {
    return this.getStoredHistory().filter(calc => calc.type === type);
  }

  static getBookmarkedCalculations(): CalculationHistory[] {
    return this.getStoredHistory().filter(calc => calc.isBookmarked);
  }

  static toggleBookmark(id: string): void {
    const history = this.getStoredHistory();
    const calculation = history.find(calc => calc.id === id);
    
    if (calculation) {
      calculation.isBookmarked = !calculation.isBookmarked;
      this.saveHistory(history);
    }
  }

  static removeCalculation(id: string): void {
    const history = this.getStoredHistory();
    const filteredHistory = history.filter(calc => calc.id !== id);
    this.saveHistory(filteredHistory);
  }

  static clearHistory(): void {
    this.saveHistory([]);
  }

  static getRecentCalculations(limit: number = 10): CalculationHistory[] {
    return this.getStoredHistory().slice(0, limit);
  }

  static findSimilarCalculation(
    type: string,
    inputs: Record<string, any>
  ): CalculationHistory | null {
    const history = this.getHistoryByType(type);
    
    return history.find(calc => 
      JSON.stringify(calc.inputs) === JSON.stringify(inputs)
    ) || null;
  }

  static exportHistory(): string {
    const history = this.getStoredHistory();
    return JSON.stringify(history, null, 2);
  }

  static importHistory(data: string): boolean {
    try {
      const history = JSON.parse(data);
      if (Array.isArray(history)) {
        this.saveHistory(history);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }
}

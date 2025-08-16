/** Shared lightweight types used across calculator clients */

// Core calculation types
export type Mode = "sip" | "lumpsum";

export interface Calculation {
  type: string;
  inputs: Record<string, number>;
  results: Record<string, number>;
  timestamp: number;
}

export interface SavedCalculation extends Calculation {
  id: string;
}

export interface Preset {
  label: string;
  value: number;
}

// User Profile & Risk Assessment
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: "male" | "female" | "other";
  income: number;
  location: string;
  riskAppetite: "low" | "moderate" | "high";
  currentPortfolioValue: number;
  monthlySIPCapacity: number;
  investmentGoals: InvestmentGoal[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestmentGoal {
  id: string;
  name: string;
  targetAmount: number;
  timeHorizon: number; // in years
  priority: "low" | "medium" | "high";
  currentSavings: number;
  monthlyContribution: number;
  projectedValue: number;
  requiredMonthlyInvestment: number;
  assetAllocation: AssetAllocation;
  recommendedFunds: FundRecommendation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetAllocation {
  equity: number; // percentage
  debt: number;
  hybrid: number;
  gold: number;
  international: number;
}

export interface FundRecommendation {
  fundId: string;
  fundName: string;
  category: string;
  allocation: number; // percentage
  reason: string;
  riskLevel: "low" | "moderate" | "high";
  expenseRatio: number;
  returns: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
  };
  nav: number;
  fundSize: number;
  minInvestment: number;
}

export interface MutualFund {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  assetClass: "equity" | "debt" | "hybrid" | "gold" | "international";
  riskLevel: "low" | "moderate" | "high";
  expenseRatio: number;
  nav: number;
  fundSize: number;
  minInvestment: number;
  returns: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
  };
  benchmark: string;
  fundManager: string;
  inceptionDate: Date;
  isActive: boolean;
}

// Risk Assessment Questions
export interface RiskQuestion {
  id: string;
  question: string;
  options: RiskOption[];
  category: "investment_experience" | "time_horizon" | "risk_tolerance" | "financial_situation";
}

export interface RiskOption {
  id: string;
  text: string;
  score: number;
}

// Form Types
export interface OnboardingFormData {
  step: number;
  personalInfo: {
    name: string;
    email: string;
    age: number;
    gender: "male" | "female" | "other";
    income: number;
    location: string;
  };
  financialInfo: {
    currentPortfolioValue: number;
    monthlySIPCapacity: number;
  };
  riskAssessment: {
    answers: Record<string, string>;
    score: number;
    riskAppetite: "low" | "moderate" | "high";
  };
  goals: InvestmentGoal[];
}

// Navigation
export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

// Chart Data
export interface ChartDataPoint {
  year: number;
  month?: number;
  value: number;
  invested: number;
  returns: number;
}

export interface GoalProjection {
  goalId: string;
  data: ChartDataPoint[];
  summary: {
    totalInvested: number;
    totalValue: number;
    totalReturns: number;
    xirr: number;
  };
}

// PDF Export
export interface PDFData {
  userProfile: UserProfile;
  goals: InvestmentGoal[];
  recommendations: FundRecommendation[];
  projections: GoalProjection[];
  generatedAt: Date;
}

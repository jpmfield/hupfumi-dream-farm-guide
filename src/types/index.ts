
export interface FarmGoal {
  targetIncome: number;
  timeframe: number; // in months
  landSize: number; // in acres
}

export interface FarmResources {
  budget: number;
  waterSource: 'rain-fed' | 'borehole' | 'river' | 'none';
  laborType: 'family' | 'hired' | 'both' | 'none';
}

export interface CropOption {
  id: string;
  name: string;
  imageUrl: string;
  harvestTime: number; // in months
  investmentPerAcre: number;
  revenuePerAcre: number;
  waterRequirement: 'low' | 'medium' | 'high';
  laborRequirement: 'low' | 'medium' | 'high';
  description: string;
  tasks: FarmTask[];
}

export interface LivestockOption {
  id: string;
  name: string;
  imageUrl: string;
  maturityTime: number; // in months
  investmentPerUnit: number;
  revenuePerUnit: number;
  unitsPerAcre: number;
  waterRequirement: 'low' | 'medium' | 'high';
  laborRequirement: 'low' | 'medium' | 'high';
  description: string;
  tasks: FarmTask[];
}

export interface FarmTask {
  id: string;
  title: string;
  description: string;
  timeframe: string; // e.g., "Day 1", "Week 2-3", "Month 1"
  inputs?: string[];
}

export interface FarmPlan {
  id: string;
  name: string;
  goal: FarmGoal;
  resources: FarmResources;
  crops: Array<{cropId: string, allocation: number}>;
  livestock: Array<{livestockId: string, units: number}>;
  projectedRevenue: number;
  projectedCosts: number;
  projectedProfit: number;
  timeToProfit: number; // in months
  tasks: FarmTask[];
}

export interface FarmScenario {
  id: string;
  name: string;
  plans: FarmPlan[];
  selectedPlanId?: string;
}

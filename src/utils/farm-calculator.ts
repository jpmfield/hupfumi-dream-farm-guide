
import { CropOption, LivestockOption, FarmGoal, FarmResources, FarmPlan, FarmTask } from '../types';
import { cropOptions, livestockOptions } from '../data/farm-options';

// Helper function to get random quote
export const getRandomQuote = (quotes: string[]): string => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};

// Filter suitable options based on resources
export const getSuitableOptions = (
  goal: FarmGoal,
  resources: FarmResources
): { crops: CropOption[]; livestock: LivestockOption[] } => {
  // Filter crops based on water availability
  let suitableCrops = cropOptions.filter(crop => {
    if (resources.waterSource === 'none' && crop.waterRequirement !== 'low') {
      return false;
    }
    if (resources.waterSource === 'rain-fed' && crop.waterRequirement === 'high') {
      return false;
    }
    return true;
  });

  // Filter crops based on labor availability
  if (resources.laborType === 'none') {
    suitableCrops = suitableCrops.filter(crop => crop.laborRequirement === 'low');
  } else if (resources.laborType === 'family') {
    suitableCrops = suitableCrops.filter(crop => crop.laborRequirement !== 'high');
  }

  // Filter livestock based on water availability
  let suitableLivestock = livestockOptions.filter(livestock => {
    if (resources.waterSource === 'none' && livestock.waterRequirement !== 'low') {
      return false;
    }
    return true;
  });

  // Filter livestock based on labor availability
  if (resources.laborType === 'none') {
    suitableLivestock = suitableLivestock.filter(livestock => livestock.laborRequirement === 'low');
  } else if (resources.laborType === 'family') {
    suitableLivestock = suitableLivestock.filter(livestock => livestock.laborRequirement !== 'high');
  }

  return { crops: suitableCrops, livestock: suitableLivestock };
};

// Generate optimal farm allocation
export const generateOptimalAllocation = (
  goal: FarmGoal,
  resources: FarmResources,
  suitableOptions: { crops: CropOption[]; livestock: LivestockOption[] }
): { cropAllocation: Array<{cropId: string, allocation: number}>; livestockAllocation: Array<{livestockId: string, units: number}>} => {
  const { crops, livestock } = suitableOptions;
  
  // Simple allocation strategy:
  // - If we have suitable crops and livestock, split the land 70/30
  // - Otherwise, use what we have
  
  let cropAllocation: Array<{cropId: string, allocation: number}> = [];
  let livestockAllocation: Array<{livestockId: string, units: number}> = [];
  
  if (crops.length > 0 && livestock.length > 0) {
    // Allocate 70% to the most profitable crop
    const mostProfitableCrop = [...crops].sort((a, b) => 
      (b.revenuePerAcre - b.investmentPerAcre) - (a.revenuePerAcre - a.investmentPerAcre)
    )[0];
    
    cropAllocation.push({
      cropId: mostProfitableCrop.id,
      allocation: goal.landSize * 0.7
    });
    
    // Allocate 30% to the most profitable livestock
    const mostProfitableLivestock = [...livestock].sort((a, b) => 
      (b.revenuePerUnit - b.investmentPerUnit) * b.unitsPerAcre - 
      (a.revenuePerUnit - a.investmentPerUnit) * a.unitsPerAcre
    )[0];
    
    const livestockLand = goal.landSize * 0.3;
    const units = Math.floor(livestockLand * mostProfitableLivestock.unitsPerAcre);
    
    livestockAllocation.push({
      livestockId: mostProfitableLivestock.id,
      units: units
    });
  } else if (crops.length > 0) {
    // If we only have crops, use the most profitable one
    const mostProfitableCrop = [...crops].sort((a, b) => 
      (b.revenuePerAcre - b.investmentPerAcre) - (a.revenuePerAcre - a.investmentPerAcre)
    )[0];
    
    cropAllocation.push({
      cropId: mostProfitableCrop.id,
      allocation: goal.landSize
    });
  } else if (livestock.length > 0) {
    // If we only have livestock, use the most profitable one
    const mostProfitableLivestock = [...livestock].sort((a, b) => 
      (b.revenuePerUnit - b.investmentPerUnit) * b.unitsPerAcre - 
      (a.revenuePerUnit - a.investmentPerUnit) * a.unitsPerAcre
    )[0];
    
    const units = Math.floor(goal.landSize * mostProfitableLivestock.unitsPerAcre);
    
    livestockAllocation.push({
      livestockId: mostProfitableLivestock.id,
      units: units
    });
  }
  
  // If we have budget for more diversity, add a second option
  if (resources.budget > 2000 && crops.length > 1) {
    const secondCrop = [...crops]
      .sort((a, b) => (b.revenuePerAcre - b.investmentPerAcre) - (a.revenuePerAcre - a.investmentPerAcre))
      .filter(crop => crop.id !== cropAllocation[0]?.cropId)[0];
      
    if (secondCrop) {
      // Adjust first crop allocation to 60%
      if (cropAllocation.length > 0) {
        cropAllocation[0].allocation = goal.landSize * 0.6;
      }
      
      // Add second crop at 10%
      cropAllocation.push({
        cropId: secondCrop.id,
        allocation: goal.landSize * 0.1
      });
    }
  }
  
  return { cropAllocation, livestockAllocation };
};

// Calculate financial projections
export const calculateFinancialProjections = (
  goal: FarmGoal,
  resources: FarmResources,
  cropAllocation: Array<{cropId: string, allocation: number}>,
  livestockAllocation: Array<{livestockId: string, units: number}>
): { revenue: number; costs: number; profit: number; timeToProfit: number } => {
  let totalRevenue = 0;
  let totalCosts = 0;
  let maxTime = 0;
  
  // Calculate for crops
  cropAllocation.forEach(cropItem => {
    const crop = cropOptions.find(c => c.id === cropItem.cropId);
    if (crop) {
      totalRevenue += crop.revenuePerAcre * cropItem.allocation;
      totalCosts += crop.investmentPerAcre * cropItem.allocation;
      maxTime = Math.max(maxTime, crop.harvestTime);
    }
  });
  
  // Calculate for livestock
  livestockAllocation.forEach(livestockItem => {
    const livestock = livestockOptions.find(l => l.id === livestockItem.livestockId);
    if (livestock) {
      totalRevenue += livestock.revenuePerUnit * livestockItem.units;
      totalCosts += livestock.investmentPerUnit * livestockItem.units;
      maxTime = Math.max(maxTime, livestock.maturityTime);
    }
  });
  
  const profit = totalRevenue - totalCosts;
  
  return {
    revenue: totalRevenue,
    costs: totalCosts,
    profit: profit,
    timeToProfit: maxTime
  };
};

// Generate tasks timeline
export const generateTasksTimeline = (
  cropAllocation: Array<{cropId: string, allocation: number}>,
  livestockAllocation: Array<{livestockId: string, units: number}>
): FarmTask[] => {
  let allTasks: FarmTask[] = [];
  
  // Add crop tasks
  cropAllocation.forEach(cropItem => {
    const crop = cropOptions.find(c => c.id === cropItem.cropId);
    if (crop) {
      crop.tasks.forEach(task => {
        allTasks.push({
          ...task,
          id: `${task.id}-${Math.random().toString(36).substr(2, 9)}`,
          title: `[${crop.name}] ${task.title}`,
        });
      });
    }
  });
  
  // Add livestock tasks
  livestockAllocation.forEach(livestockItem => {
    const livestock = livestockOptions.find(l => l.id === livestockItem.livestockId);
    if (livestock) {
      livestock.tasks.forEach(task => {
        allTasks.push({
          ...task,
          id: `${task.id}-${Math.random().toString(36).substr(2, 9)}`,
          title: `[${livestock.name}] ${task.title}`,
        });
      });
    }
  });
  
  // Sort tasks by timeframe (simple sort that works for our format)
  return allTasks.sort((a, b) => {
    // Extract the numeric part of "Week X" or "Month X"
    const aNum = parseInt(a.timeframe.match(/\d+/)?.[0] || '0');
    const bNum = parseInt(b.timeframe.match(/\d+/)?.[0] || '0');
    
    // Month is worth 4 weeks
    const aValue = a.timeframe.startsWith('Month') ? aNum * 4 : aNum;
    const bValue = b.timeframe.startsWith('Month') ? bNum * 4 : bNum;
    
    return aValue - bValue;
  });
};

// Generate farm plan
export const generateFarmPlan = (
  name: string,
  goal: FarmGoal,
  resources: FarmResources
): FarmPlan => {
  const suitableOptions = getSuitableOptions(goal, resources);
  const { cropAllocation, livestockAllocation } = generateOptimalAllocation(goal, resources, suitableOptions);
  const projections = calculateFinancialProjections(goal, resources, cropAllocation, livestockAllocation);
  const tasks = generateTasksTimeline(cropAllocation, livestockAllocation);
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: name,
    goal,
    resources,
    crops: cropAllocation,
    livestock: livestockAllocation,
    projectedRevenue: projections.revenue,
    projectedCosts: projections.costs,
    projectedProfit: projections.profit,
    timeToProfit: projections.timeToProfit,
    tasks
  };
};

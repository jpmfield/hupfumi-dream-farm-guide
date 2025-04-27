
import { CropOption, LivestockOption, FarmTask } from '../types';

// Reusable tasks
const maizeTasks: FarmTask[] = [
  {
    id: 'maize-1',
    title: 'Land Preparation',
    description: 'Clear land, plow and harrow to prepare seedbed.',
    timeframe: 'Week 1',
    inputs: ['Tractor hire or hoes', 'Labor']
  },
  {
    id: 'maize-2',
    title: 'Planting',
    description: 'Plant seeds at recommended spacing of 75cm between rows and 25cm within rows.',
    timeframe: 'Week 2',
    inputs: ['Maize seed', 'Basal fertilizer', 'Labor']
  },
  {
    id: 'maize-3',
    title: 'First Weeding',
    description: 'Remove weeds to reduce competition for nutrients.',
    timeframe: 'Week 4-5',
    inputs: ['Hoes', 'Labor']
  },
  {
    id: 'maize-4',
    title: 'Top Dressing',
    description: 'Apply nitrogen fertilizer when plants are knee-high.',
    timeframe: 'Week 6',
    inputs: ['Ammonium Nitrate fertilizer', 'Labor']
  },
  {
    id: 'maize-5',
    title: 'Second Weeding',
    description: 'Keep field free of weeds.',
    timeframe: 'Week 8',
    inputs: ['Hoes', 'Labor']
  },
  {
    id: 'maize-6',
    title: 'Pest Monitoring',
    description: 'Check for pests like fall armyworm and apply pesticides if needed.',
    timeframe: 'Week 7-14',
    inputs: ['Pesticides (if needed)', 'Sprayer']
  },
  {
    id: 'maize-7',
    title: 'Harvesting',
    description: 'Harvest when cobs are dry and grain is hard.',
    timeframe: 'Month 4-5',
    inputs: ['Labor', 'Bags', 'Storage space']
  }
];

const tomatoTasks: FarmTask[] = [
  {
    id: 'tomato-1',
    title: 'Seedbed Preparation',
    description: 'Prepare seedbeds or trays for tomato seedlings.',
    timeframe: 'Week 1',
    inputs: ['Tomato seeds', 'Seedling trays', 'Compost']
  },
  {
    id: 'tomato-2',
    title: 'Land Preparation',
    description: 'Prepare main field with good drainage and organic matter.',
    timeframe: 'Week 1-3',
    inputs: ['Manure/compost', 'Hoes', 'Labor']
  },
  {
    id: 'tomato-3',
    title: 'Transplanting',
    description: 'Transplant seedlings when they have 4-6 leaves.',
    timeframe: 'Week 4-5',
    inputs: ['Seedlings', 'Basal fertilizer', 'Labor']
  },
  {
    id: 'tomato-4',
    title: 'Staking',
    description: 'Install stakes and tie plants to support them.',
    timeframe: 'Week 6-7',
    inputs: ['Wooden stakes', 'String', 'Labor']
  },
  {
    id: 'tomato-5',
    title: 'Irrigation',
    description: 'Regular watering, avoiding wetting foliage.',
    timeframe: 'Week 4-16',
    inputs: ['Water', 'Watering cans/irrigation system']
  },
  {
    id: 'tomato-6',
    title: 'Fertilizer Application',
    description: 'Regular feeding with balanced fertilizers.',
    timeframe: 'Week 6, 9, 12',
    inputs: ['NPK fertilizer', 'Labor']
  },
  {
    id: 'tomato-7',
    title: 'Pest and Disease Management',
    description: 'Regular checks for pests and diseases, apply appropriate treatments.',
    timeframe: 'Week 5-16',
    inputs: ['Pesticides', 'Fungicides', 'Sprayer']
  },
  {
    id: 'tomato-8',
    title: 'Harvesting',
    description: 'Pick tomatoes when they start to turn red.',
    timeframe: 'Month 3-5',
    inputs: ['Crates', 'Labor']
  }
];

const chickenTasks: FarmTask[] = [
  {
    id: 'chicken-1',
    title: 'Housing Preparation',
    description: 'Clean, disinfect housing and prepare brooding area.',
    timeframe: 'Week 1',
    inputs: ['Disinfectant', 'Litter material', 'Heater/Brooder']
  },
  {
    id: 'chicken-2',
    title: 'Chick Purchase and Setup',
    description: 'Buy day-old chicks and set them up in brooding area.',
    timeframe: 'Week 1',
    inputs: ['Day-old chicks', 'Chick feed', 'Drinkers', 'Feeders']
  },
  {
    id: 'chicken-3',
    title: 'Vaccination - First Round',
    description: 'Administer first set of vaccines as per schedule.',
    timeframe: 'Week 1-2',
    inputs: ['Vaccines', 'Clean water']
  },
  {
    id: 'chicken-4',
    title: 'Feed Change - Starter to Grower',
    description: 'Change feed from starter to grower mash.',
    timeframe: 'Week 3-4',
    inputs: ['Grower mash']
  },
  {
    id: 'chicken-5',
    title: 'Vaccination - Second Round',
    description: 'Administer second set of vaccines as per schedule.',
    timeframe: 'Week 4',
    inputs: ['Vaccines', 'Clean water']
  },
  {
    id: 'chicken-6',
    title: 'Feed Change - Grower to Finisher',
    description: 'Change feed from grower to finisher mash (for broilers).',
    timeframe: 'Week 5',
    inputs: ['Finisher mash']
  },
  {
    id: 'chicken-7',
    title: 'Daily Management',
    description: 'Daily feeding, watering, and health checks.',
    timeframe: 'Week 1-8',
    inputs: ['Feed', 'Clean water', 'Vitamins']
  },
  {
    id: 'chicken-8',
    title: 'Marketing and Sale',
    description: 'Prepare birds for sale at target weight.',
    timeframe: 'Week 6-8',
    inputs: ['Transport', 'Packaging (if needed)']
  }
];

const rabbitTasks: FarmTask[] = [
  {
    id: 'rabbit-1',
    title: 'Housing Setup',
    description: 'Prepare hutches or cages with proper flooring and nesting boxes.',
    timeframe: 'Week 1',
    inputs: ['Hutch materials', 'Nesting boxes', 'Feeders', 'Waterers']
  },
  {
    id: 'rabbit-2',
    title: 'Purchase Breeding Stock',
    description: 'Buy mature does (females) and at least one buck (male).',
    timeframe: 'Week 1',
    inputs: ['Breeding rabbits', 'Transport']
  },
  {
    id: 'rabbit-3',
    title: 'Breeding',
    description: 'Introduce does to buck for mating.',
    timeframe: 'Week 2',
    inputs: ['Record keeping materials']
  },
  {
    id: 'rabbit-4',
    title: 'Nest Box Preparation',
    description: 'Place nest boxes in doe cages 27-28 days after breeding.',
    timeframe: 'Week 6',
    inputs: ['Nesting materials (hay, straw)']
  },
  {
    id: 'rabbit-5',
    title: 'Kindling (Birth)',
    description: 'Monitor does during kindling, check kits (baby rabbits).',
    timeframe: 'Week 6-7',
    inputs: ['Record keeping materials']
  },
  {
    id: 'rabbit-6',
    title: 'Daily Feeding and Care',
    description: 'Provide fresh feed, water, and check health.',
    timeframe: 'Week 1-16',
    inputs: ['Rabbit pellets', 'Hay', 'Fresh vegetables', 'Fresh water']
  },
  {
    id: 'rabbit-7',
    title: 'Weaning',
    description: 'Separate kits from mother at 4-6 weeks.',
    timeframe: 'Week 11-13',
    inputs: ['Additional cages']
  },
  {
    id: 'rabbit-8',
    title: 'Market Preparation',
    description: 'Prepare rabbits for market at 8-12 weeks or 2-3 kg weight.',
    timeframe: 'Week 14-16',
    inputs: ['Transport cages', 'Processing equipment (if needed)']
  }
];

export const cropOptions: CropOption[] = [
  {
    id: 'maize',
    name: 'Maize (Corn)',
    imageUrl: '/maize.jpg',
    harvestTime: 4, // 4 months
    investmentPerAcre: 500,
    revenuePerAcre: 1200,
    waterRequirement: 'medium',
    laborRequirement: 'medium',
    description: 'Staple crop with ready market. Grows well in many regions with moderate rainfall.',
    tasks: maizeTasks
  },
  {
    id: 'tomatoes',
    name: 'Tomatoes',
    imageUrl: '/tomatoes.jpg',
    harvestTime: 3, // 3 months
    investmentPerAcre: 1200,
    revenuePerAcre: 3000,
    waterRequirement: 'high',
    laborRequirement: 'high',
    description: 'High-value horticultural crop with quick returns. Requires good water supply and pest management.',
    tasks: tomatoTasks
  },
  {
    id: 'cabbage',
    name: 'Cabbage',
    imageUrl: '/cabbage.jpg',
    harvestTime: 3, // 3 months
    investmentPerAcre: 800,
    revenuePerAcre: 2000,
    waterRequirement: 'high',
    laborRequirement: 'medium',
    description: 'Popular vegetable with good market demand. Grows well in cooler seasons or highlands.',
    tasks: [
      {
        id: 'cabbage-1',
        title: 'Seedbed Preparation',
        description: 'Prepare seedbeds for cabbage seeds.',
        timeframe: 'Week 1',
        inputs: ['Cabbage seeds', 'Compost']
      },
      {
        id: 'cabbage-2',
        title: 'Land Preparation',
        description: 'Prepare main field with good drainage.',
        timeframe: 'Week 1-3',
        inputs: ['Manure/compost', 'Hoes', 'Labor']
      },
      {
        id: 'cabbage-3',
        title: 'Transplanting',
        description: 'Transplant seedlings when they have 4-5 true leaves.',
        timeframe: 'Week 4-5',
        inputs: ['Seedlings', 'Basal fertilizer', 'Labor']
      },
      {
        id: 'cabbage-4',
        title: 'Irrigation',
        description: 'Regular watering, especially during head formation.',
        timeframe: 'Week 4-12',
        inputs: ['Water', 'Watering cans/irrigation system']
      },
      {
        id: 'cabbage-5',
        title: 'Fertilizer Application',
        description: 'Apply topdressing fertilizer.',
        timeframe: 'Week 6-7',
        inputs: ['Nitrogen fertilizer', 'Labor']
      },
      {
        id: 'cabbage-6',
        title: 'Pest Management',
        description: 'Control pests like aphids and cabbage worms.',
        timeframe: 'Week 5-12',
        inputs: ['Pesticides', 'Sprayer']
      },
      {
        id: 'cabbage-7',
        title: 'Harvesting',
        description: 'Harvest when heads are firm and full-sized.',
        timeframe: 'Month 3',
        inputs: ['Knife', 'Crates', 'Labor']
      }
    ]
  }
];

export const livestockOptions: LivestockOption[] = [
  {
    id: 'broilers',
    name: 'Broiler Chickens',
    imageUrl: '/chickens.jpg',
    maturityTime: 2, // 2 months
    investmentPerUnit: 5,
    revenuePerUnit: 10,
    unitsPerAcre: 5000,
    waterRequirement: 'medium',
    laborRequirement: 'medium',
    description: 'Fast-growing meat birds with quick returns. Good for beginners with minimum space requirements.',
    tasks: chickenTasks
  },
  {
    id: 'layers',
    name: 'Layer Chickens',
    imageUrl: '/layers.jpg',
    maturityTime: 5, // 5 months to start laying
    investmentPerUnit: 7,
    revenuePerUnit: 25, // over productive lifetime
    unitsPerAcre: 3000,
    waterRequirement: 'medium',
    laborRequirement: 'medium',
    description: 'Egg-producing chickens providing daily income once they start laying.',
    tasks: [
      {
        id: 'layer-1',
        title: 'Housing Preparation',
        description: 'Clean, disinfect housing and prepare brooding area.',
        timeframe: 'Week 1',
        inputs: ['Disinfectant', 'Litter material', 'Heater/Brooder']
      },
      {
        id: 'layer-2',
        title: 'Chick Purchase and Setup',
        description: 'Buy day-old layer chicks and set them up in brooding area.',
        timeframe: 'Week 1',
        inputs: ['Day-old chicks', 'Chick feed', 'Drinkers', 'Feeders']
      },
      {
        id: 'layer-3',
        title: 'Vaccination Schedule',
        description: 'Follow complete vaccination schedule for layers.',
        timeframe: 'Week 1-20',
        inputs: ['Various vaccines', 'Clean water']
      },
      {
        id: 'layer-4',
        title: 'Feed Changes',
        description: 'Change feed according to growth stages: starter, grower, developer, and layer mash.',
        timeframe: 'Various weeks',
        inputs: ['Different feed types']
      },
      {
        id: 'layer-5',
        title: 'Light Management',
        description: 'Implement lighting program to stimulate egg production.',
        timeframe: 'Week 18 onward',
        inputs: ['Lighting equipment']
      },
      {
        id: 'layer-6',
        title: 'Egg Collection',
        description: 'Regular collection of eggs, multiple times daily.',
        timeframe: 'Week 20/21 onward',
        inputs: ['Egg trays', 'Labor']
      },
      {
        id: 'layer-7',
        title: 'Daily Management',
        description: 'Daily feeding, watering, and health checks.',
        timeframe: 'Week 1 onward',
        inputs: ['Feed', 'Clean water', 'Vitamins']
      },
      {
        id: 'layer-8',
        title: 'Marketing Eggs',
        description: 'Establish reliable markets for egg sales.',
        timeframe: 'Week 20 onward',
        inputs: ['Egg packaging', 'Transport']
      }
    ]
  },
  {
    id: 'rabbits',
    name: 'Rabbits',
    imageUrl: '/rabbits.jpg',
    maturityTime: 4, // 4 months to breeding age
    investmentPerUnit: 15,
    revenuePerUnit: 40, // including offspring over time
    unitsPerAcre: 500, // breeding pairs
    waterRequirement: 'low',
    laborRequirement: 'low',
    description: 'Low-investment livestock with rapid reproduction and multiple income streams (meat, fur, manure).',
    tasks: rabbitTasks
  }
];

export const inspirationalQuotes = [
  "Your dream farm is just one plan away from reality.",
  "Small seeds of action grow into forests of abundance.",
  "The best time to start your farm was yesterday. The next best time is today.",
  "Every successful harvest begins with a single seed of determination.",
  "When you plant with purpose, you harvest with pride.",
  "The difference between a dream and a goal is a plan and a deadline.",
  "Your farming journey of a thousand miles begins with a single step.",
  "The fruits of your labor are sweeter when they grow from your own vision.",
  "Patience, persistence, and perspiration make an unbeatable combination for farming success.",
  "Your farm is limited only by your imagination and effort.",
  "Good farmers grow crops; great farmers grow possibilities.",
  "The land does not give, it only lends to those who work with it."
];

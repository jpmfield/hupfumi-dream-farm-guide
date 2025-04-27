
import React from 'react';
import { FarmPlan } from '../types';
import { cropOptions, livestockOptions } from '../data/farm-options';

interface FarmMapVisualizerProps {
  plan: FarmPlan;
}

const FarmMapVisualizer: React.FC<FarmMapVisualizerProps> = ({ plan }) => {
  const totalLand = plan.goal.landSize;
  
  // Get details of all selected items
  const cropDetails = plan.crops.map(crop => {
    const cropInfo = cropOptions.find(c => c.id === crop.cropId);
    return {
      id: crop.cropId,
      name: cropInfo?.name || 'Unknown Crop',
      allocation: crop.allocation,
      percentage: (crop.allocation / totalLand) * 100,
      color: getCropColor(crop.cropId)
    };
  });
  
  const livestockDetails = plan.livestock.map(livestock => {
    const livestockInfo = livestockOptions.find(l => l.id === livestock.livestockId);
    return {
      id: livestock.livestockId,
      name: livestockInfo?.name || 'Unknown Livestock',
      units: livestock.units,
      allocation: livestockInfo ? livestock.units / (livestockInfo.unitsPerAcre || 1) : 0,
      percentage: livestockInfo ? 
        (livestock.units / (livestockInfo.unitsPerAcre || 1) / totalLand) * 100 : 0,
      color: getLivestockColor(livestock.livestockId)
    };
  });
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Your Farm Layout</h3>
      
      <div className="w-full aspect-[3/2] bg-farm-green-light/20 rounded-lg overflow-hidden relative border border-farm-green-light">
        {/* Render crop areas */}
        {cropDetails.map((crop, index) => {
          // Simple layout algorithm - just stack rectangles
          const prevAllocations = cropDetails
            .slice(0, index)
            .reduce((sum, c) => sum + c.percentage, 0);
          
          return (
            <div 
              key={crop.id}
              className="absolute transform transition-transform hover:scale-[1.02] cursor-pointer"
              style={{
                top: `${prevAllocations}%`,
                left: '0',
                width: '100%',
                height: `${crop.percentage}%`,
                backgroundColor: crop.color,
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="bg-white/90 px-2 py-1 rounded text-sm font-medium">
                  {crop.name} ({crop.allocation.toFixed(1)} acres)
                </span>
              </div>
            </div>
          );
        })}
        
        {/* Render livestock areas */}
        {livestockDetails.map((livestock, index) => {
          // Position livestock after crops
          const cropsAllocation = cropDetails.reduce((sum, c) => sum + c.percentage, 0);
          const prevAllocations = cropsAllocation + 
            livestockDetails
              .slice(0, index)
              .reduce((sum, l) => sum + l.percentage, 0);
          
          return (
            <div 
              key={livestock.id}
              className="absolute transform transition-transform hover:scale-[1.02] cursor-pointer"
              style={{
                top: `${prevAllocations}%`,
                left: '0',
                width: '100%',
                height: `${livestock.percentage}%`,
                backgroundColor: livestock.color,
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="bg-white/90 px-2 py-1 rounded text-sm font-medium">
                  {livestock.name} ({livestock.units} units)
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        {cropDetails.map(crop => (
          <div key={crop.id} className="flex items-center text-sm">
            <div 
              className="w-4 h-4 mr-2 rounded-sm" 
              style={{ backgroundColor: crop.color }}
            ></div>
            <span>{crop.name}: {crop.allocation.toFixed(1)} acres</span>
          </div>
        ))}
        
        {livestockDetails.map(livestock => (
          <div key={livestock.id} className="flex items-center text-sm">
            <div 
              className="w-4 h-4 mr-2 rounded-sm" 
              style={{ backgroundColor: livestock.color }}
            ></div>
            <span>{livestock.name}: {livestock.units} units</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper functions for colors
function getCropColor(cropId: string): string {
  const colors: Record<string, string> = {
    'maize': '#FFD700',
    'tomatoes': '#FF6347',
    'cabbage': '#90EE90',
    'default': '#B0C4DE'
  };
  
  return colors[cropId] || colors.default;
}

function getLivestockColor(livestockId: string): string {
  const colors: Record<string, string> = {
    'broilers': '#CD853F',
    'layers': '#DEB887',
    'rabbits': '#D2B48C',
    'default': '#F5DEB3'
  };
  
  return colors[livestockId] || colors.default;
}

export default FarmMapVisualizer;

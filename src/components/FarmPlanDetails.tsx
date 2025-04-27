
import React from 'react';
import { FarmPlan } from '../types';
import { Button } from "@/components/ui/button";
import FarmMapVisualizer from './FarmMapVisualizer';
import FinancialProjection from './FinancialProjection';
import TaskTimeline from './TaskTimeline';
import { cropOptions, livestockOptions } from '../data/farm-options';
import { toast } from "@/components/ui/sonner";

interface FarmPlanDetailsProps {
  plan: FarmPlan;
  onCreateNew: () => void;
}

const FarmPlanDetails: React.FC<FarmPlanDetailsProps> = ({ plan, onCreateNew }) => {
  // Get the crop and livestock details
  const cropDetails = plan.crops.map(crop => {
    const cropInfo = cropOptions.find(c => c.id === crop.cropId);
    return {
      name: cropInfo?.name || 'Unknown',
      allocation: crop.allocation,
      harvestTime: cropInfo?.harvestTime || 0
    };
  });
  
  const livestockDetails = plan.livestock.map(livestock => {
    const livestockInfo = livestockOptions.find(l => l.id === livestock.livestockId);
    return {
      name: livestockInfo?.name || 'Unknown',
      units: livestock.units,
      maturityTime: livestockInfo?.maturityTime || 0
    };
  });

  const handleSavePlan = () => {
    // In a real app, this would save to database
    toast.success("Farm plan saved successfully!", {
      description: "You can access this plan anytime in your saved plans."
    });
  };

  const handleSharePlan = () => {
    // In a real app, this would generate a shareable link
    toast.success("Share link created!", {
      description: "A shareable link has been copied to your clipboard."
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 border border-farm-green-light mb-6">
          <h2 className="text-2xl font-bold text-farm-green-dark mb-2">{plan.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Farm Goal</h3>
              <ul className="space-y-1 text-gray-700">
                <li>Target Income: <span className="font-medium">${plan.goal.targetIncome.toLocaleString()}</span></li>
                <li>Timeframe: <span className="font-medium">{plan.goal.timeframe} months</span></li>
                <li>Land Size: <span className="font-medium">{plan.goal.landSize} acres</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Farm Composition</h3>
              <ul className="space-y-1 text-gray-700">
                {cropDetails.map((crop, index) => (
                  <li key={`crop-${index}`}>
                    {crop.name}: <span className="font-medium">{crop.allocation.toFixed(1)} acres</span> 
                    <span className="text-sm text-gray-500 ml-1">(harvest in {crop.harvestTime} months)</span>
                  </li>
                ))}
                {livestockDetails.map((livestock, index) => (
                  <li key={`livestock-${index}`}>
                    {livestock.name}: <span className="font-medium">{livestock.units} units</span>
                    <span className="text-sm text-gray-500 ml-1">(mature in {livestock.maturityTime} months)</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={handleSavePlan} className="bg-farm-green hover:bg-farm-green-dark">
              Save This Plan
            </Button>
            <Button onClick={handleSharePlan} variant="outline">
              Share Plan
            </Button>
            <Button onClick={onCreateNew} variant="outline">
              Create New Plan
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <FarmMapVisualizer plan={plan} />
          <FinancialProjection plan={plan} />
        </div>
        
        <div className="mb-6">
          <TaskTimeline tasks={plan.tasks} />
        </div>
        
        <div className="bg-farm-green-light/30 rounded-lg p-4 border border-farm-green-light mb-6">
          <h3 className="text-lg font-semibold mb-2">Next Steps</h3>
          <p className="text-gray-700 mb-3">Your farm plan is ready! Here's how to get started:</p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Secure your land and initial budget of <strong>${plan.projectedCosts.toLocaleString()}</strong></li>
            <li>Purchase inputs for your first week's tasks</li>
            <li>Follow the task timeline to stay on schedule</li>
            <li>Track your progress against the projections</li>
            <li>Adjust your plan as needed based on real-world results</li>
          </ol>
          
          <div className="mt-4 text-center">
            <Button className="bg-farm-soil hover:bg-farm-soil-dark">
              Start Your Action Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmPlanDetails;

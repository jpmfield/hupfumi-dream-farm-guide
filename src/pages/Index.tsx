
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import FarmHeader from '../components/FarmHeader';
import ProgressIndicator from '../components/ProgressIndicator';
import GoalInput from '../components/GoalInput';
import ResourceInput from '../components/ResourceInput';
import FarmPlanDetails from '../components/FarmPlanDetails';
import { FarmGoal, FarmResources, FarmPlan } from '../types';
import { generateFarmPlan } from '../utils/farm-calculator';

const steps = [
  { id: 1, label: 'Goals' },
  { id: 2, label: 'Resources' },
  { id: 3, label: 'Farm Plan' }
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [farmGoal, setFarmGoal] = useState<FarmGoal | null>(null);
  const [farmResources, setFarmResources] = useState<FarmResources | null>(null);
  const [farmPlan, setFarmPlan] = useState<FarmPlan | null>(null);
  
  const handleGoalComplete = (goal: FarmGoal) => {
    setFarmGoal(goal);
    setCurrentStep(2);
    window.scrollTo(0, 0);
  };
  
  const handleResourceComplete = (resources: FarmResources) => {
    setFarmResources(resources);
    
    // Generate farm plan
    if (farmGoal) {
      const plan = generateFarmPlan('My Dream Farm', farmGoal, resources);
      setFarmPlan(plan);
      setCurrentStep(3);
      window.scrollTo(0, 0);
    }
  };
  
  const handleCreateNewPlan = () => {
    setCurrentStep(1);
    setFarmGoal(null);
    setFarmResources(null);
    setFarmPlan(null);
    window.scrollTo(0, 0);
  };
  
  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) {
      setCurrentStep(stepId);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <FarmHeader 
          title="Hupfumi-Fields"
          subtitle="Turn Your Farming Goals into Reality"
        />
        
        <div className="flex justify-end mb-4">
          <Link to="/pdf-container">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              PDF Container Demo
            </Button>
          </Link>
        </div>
        
        <ProgressIndicator 
          steps={steps} 
          currentStep={currentStep} 
          onStepClick={handleStepClick}
        />
        
        <div className="mt-8">
          {currentStep === 1 && (
            <GoalInput onComplete={handleGoalComplete} />
          )}
          
          {currentStep === 2 && farmGoal && (
            <ResourceInput 
              onComplete={handleResourceComplete}
              onBack={() => setCurrentStep(1)}
            />
          )}
          
          {currentStep === 3 && farmPlan && (
            <FarmPlanDetails 
              plan={farmPlan}
              onCreateNew={handleCreateNewPlan}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

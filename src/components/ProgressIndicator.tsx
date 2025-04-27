
import React from 'react';

interface ProgressStep {
  id: number;
  label: string;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  steps, 
  currentStep,
  onStepClick 
}) => {
  return (
    <div className="w-full py-4 px-2">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step circle */}
              <div 
                onClick={() => onStepClick && isCompleted && onStepClick(step.id)}
                className={`progress-step ${
                  isActive 
                    ? 'progress-step-active' 
                    : isCompleted 
                    ? 'progress-step-completed cursor-pointer' 
                    : 'progress-step-upcoming'
                }`}
              >
                {step.id}
              </div>
              
              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div 
                  className={`progress-connector ${
                    currentStep > step.id + 1 
                      ? 'progress-connector-active bg-farm-green-dark' 
                      : currentStep > step.id 
                      ? 'progress-connector-active' 
                      : 'progress-connector-upcoming'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Step labels */}
      <div className="flex items-center justify-between max-w-3xl mx-auto mt-1">
        {steps.map((step) => (
          <div key={`label-${step.id}`} className="text-xs text-center w-20 -ml-6 first:ml-0 last:-mr-6">
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;

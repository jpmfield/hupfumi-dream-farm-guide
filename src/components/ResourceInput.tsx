
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FarmResources } from '../types';

interface ResourceInputProps {
  onComplete: (resources: FarmResources) => void;
  onBack: () => void;
}

const ResourceInput: React.FC<ResourceInputProps> = ({ onComplete, onBack }) => {
  const [budget, setBudget] = useState<string>('');
  const [waterSource, setWaterSource] = useState<'rain-fed' | 'borehole' | 'river' | 'none'>('rain-fed');
  const [laborType, setLaborType] = useState<'family' | 'hired' | 'both' | 'none'>('family');
  const [errors, setErrors] = useState<{
    budget?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: {
      budget?: string;
    } = {};

    if (!budget || isNaN(Number(budget)) || Number(budget) < 0) {
      newErrors.budget = 'Please enter a valid budget amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateForm()) {
      onComplete({
        budget: Number(budget),
        waterSource,
        laborType
      });
    }
  };

  return (
    <div className="form-card max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-farm-green-dark mb-6">Tell Us About Your Resources</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="budget">What is your available budget to start?</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5">$</span>
            <Input
              id="budget"
              className="pl-7"
              placeholder="1000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
          {errors.budget && (
            <p className="text-red-500 text-sm">{errors.budget}</p>
          )}
        </div>
        
        <div className="space-y-3">
          <Label>What water source do you have access to?</Label>
          <RadioGroup 
            defaultValue="rain-fed" 
            value={waterSource}
            onValueChange={(value) => setWaterSource(value as 'rain-fed' | 'borehole' | 'river' | 'none')}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rain-fed" id="rain-fed" />
              <Label htmlFor="rain-fed">Rain-fed only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="borehole" id="borehole" />
              <Label htmlFor="borehole">Borehole/well</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="river" id="river" />
              <Label htmlFor="river">River/stream</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none-water" />
              <Label htmlFor="none-water">None yet</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-3">
          <Label>What labor do you have access to?</Label>
          <RadioGroup 
            defaultValue="family" 
            value={laborType}
            onValueChange={(value) => setLaborType(value as 'family' | 'hired' | 'both' | 'none')}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="family" id="family" />
              <Label htmlFor="family">Family labor</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hired" id="hired" />
              <Label htmlFor="hired">Can hire workers</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both">Both family and hired</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none-labor" />
              <Label htmlFor="none-labor">None yet</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={onBack}
          >
            Back
          </Button>
          <Button 
            type="submit" 
            className="flex-1 bg-farm-green hover:bg-farm-green-dark"
          >
            Generate Farm Plan
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResourceInput;

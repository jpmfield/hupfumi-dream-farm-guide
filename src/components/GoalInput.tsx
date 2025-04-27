
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FarmGoal } from '../types';

interface GoalInputProps {
  onComplete: (goal: FarmGoal) => void;
}

const GoalInput: React.FC<GoalInputProps> = ({ onComplete }) => {
  const [targetIncome, setTargetIncome] = useState<string>('');
  const [timeframe, setTimeframe] = useState<string>('');
  const [landSize, setLandSize] = useState<string>('');
  const [errors, setErrors] = useState<{
    targetIncome?: string;
    timeframe?: string;
    landSize?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: {
      targetIncome?: string;
      timeframe?: string;
      landSize?: string;
    } = {};

    if (!targetIncome || isNaN(Number(targetIncome)) || Number(targetIncome) <= 0) {
      newErrors.targetIncome = 'Please enter a valid target income';
    }

    if (!timeframe || isNaN(Number(timeframe))) {
      newErrors.timeframe = 'Please select a timeframe';
    }

    if (!landSize || isNaN(Number(landSize)) || Number(landSize) <= 0) {
      newErrors.landSize = 'Please enter a valid land size';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateForm()) {
      onComplete({
        targetIncome: Number(targetIncome),
        timeframe: Number(timeframe),
        landSize: Number(landSize)
      });
    }
  };

  return (
    <div className="form-card max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-farm-green-dark mb-6">Set Your Farming Goals</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="targetIncome">How much money do you want to make?</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5">$</span>
            <Input
              id="targetIncome"
              className="pl-7"
              placeholder="5000"
              value={targetIncome}
              onChange={(e) => setTargetIncome(e.target.value)}
            />
          </div>
          {errors.targetIncome && (
            <p className="text-red-500 text-sm">{errors.targetIncome}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="timeframe">When do you want to achieve it?</Label>
          <Select onValueChange={setTimeframe}>
            <SelectTrigger>
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 months</SelectItem>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">1 year</SelectItem>
              <SelectItem value="24">2 years</SelectItem>
            </SelectContent>
          </Select>
          {errors.timeframe && (
            <p className="text-red-500 text-sm">{errors.timeframe}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="landSize">How much land do you have? (acres)</Label>
          <Input
            id="landSize"
            type="number"
            min="0.1"
            step="0.1"
            placeholder="1.0"
            value={landSize}
            onChange={(e) => setLandSize(e.target.value)}
          />
          {errors.landSize && (
            <p className="text-red-500 text-sm">{errors.landSize}</p>
          )}
        </div>
        
        <Button type="submit" className="w-full bg-farm-green hover:bg-farm-green-dark">
          Continue to Resources
        </Button>
      </form>
    </div>
  );
};

export default GoalInput;

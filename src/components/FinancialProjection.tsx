
import React from 'react';
import { FarmPlan } from '../types';

interface FinancialProjectionProps {
  plan: FarmPlan;
}

const FinancialProjection: React.FC<FinancialProjectionProps> = ({ plan }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate best and worst case (simple variation for demo)
  const bestCaseProfit = Math.round(plan.projectedProfit * 1.2);
  const worstCaseProfit = Math.round(Math.max(0, plan.projectedProfit * 0.7));
  
  // Calculate monthly profit
  const monthlyProfit = Math.round(plan.projectedProfit / plan.timeToProfit);
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Financial Projections</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-farm-green-light/30 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-600">Revenue</p>
            <p className="text-xl font-bold text-farm-green-dark">{formatCurrency(plan.projectedRevenue)}</p>
          </div>
          <div className="bg-farm-soil-light/20 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-600">Costs</p>
            <p className="text-xl font-bold text-farm-soil-dark">{formatCurrency(plan.projectedCosts)}</p>
          </div>
          <div className="bg-farm-sky-light/30 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-600">Profit</p>
            <p className="text-xl font-bold text-farm-sky-dark">{formatCurrency(plan.projectedProfit)}</p>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Profit Range</p>
          <div className="flex items-center space-x-2">
            <span className="text-red-500 font-medium">{formatCurrency(worstCaseProfit)}</span>
            <div className="h-2 flex-grow rounded-full bg-gray-200 relative overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400"
                style={{ width: '100%' }}
              ></div>
              <div 
                className="absolute h-full w-2 bg-black rounded-full"
                style={{ left: `${(plan.projectedProfit - worstCaseProfit) / (bestCaseProfit - worstCaseProfit) * 100}%` }}
              ></div>
            </div>
            <span className="text-green-500 font-medium">{formatCurrency(bestCaseProfit)}</span>
          </div>
          <div className="text-center mt-1">
            <span className="text-xs text-gray-500">Expected: {formatCurrency(plan.projectedProfit)}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Time to First Profit</p>
            <p className="text-lg font-medium">
              {plan.timeToProfit} {plan.timeToProfit === 1 ? 'month' : 'months'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Monthly Profit (avg)</p>
            <p className="text-lg font-medium">{formatCurrency(monthlyProfit)}</p>
          </div>
        </div>
        
        <div className="p-3 bg-farm-soil-light/10 rounded-lg border border-farm-soil-light">
          <p className="text-sm font-medium">Investment to Start</p>
          <p className="text-2xl font-bold text-farm-soil-dark">{formatCurrency(plan.projectedCosts)}</p>
          <p className="text-xs text-gray-500 mt-1">This is your required initial investment</p>
        </div>
        
        <div className="p-3 bg-farm-green-light/10 rounded-lg border border-farm-green-light">
          <p className="text-sm font-medium">Return on Investment</p>
          <p className="text-2xl font-bold text-farm-green-dark">
            {plan.projectedCosts > 0 
              ? `${Math.round((plan.projectedProfit / plan.projectedCosts) * 100)}%` 
              : 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-1">After {plan.timeToProfit} months</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialProjection;


import React from 'react';
import { inspirationalQuotes } from '../data/farm-options';
import { getRandomQuote } from '../utils/farm-calculator';

interface FarmHeaderProps {
  title: string;
  subtitle?: string;
}

const FarmHeader: React.FC<FarmHeaderProps> = ({ title, subtitle }) => {
  const [quote, setQuote] = React.useState('');

  React.useEffect(() => {
    setQuote(getRandomQuote(inspirationalQuotes));
  }, []);

  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-farm-green-dark mb-2">{title}</h1>
      {subtitle && (
        <p className="text-lg text-gray-600 mb-4">{subtitle}</p>
      )}
      <div className="inspiration-quote mt-4">
        "{quote}"
      </div>
    </div>
  );
};

export default FarmHeader;

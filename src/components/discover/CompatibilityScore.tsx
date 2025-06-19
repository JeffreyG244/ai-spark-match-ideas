
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface CompatibilityScoreProps {
  score: number;
  showLabel?: boolean;
}

const CompatibilityScore = ({ score, showLabel = true }: CompatibilityScoreProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Low Compatibility';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Compatibility</span>
        <span className="text-sm font-bold text-purple-600">{score}%</span>
      </div>
      
      <Progress 
        value={score} 
        className="h-2"
        style={{
          background: '#f3f4f6'
        }}
      />
      
      {showLabel && (
        <Badge 
          variant="secondary" 
          className={`text-xs ${getScoreBadgeColor(score)}`}
        >
          {getScoreLabel(score)}
        </Badge>
      )}
    </div>
  );
};

export default CompatibilityScore;

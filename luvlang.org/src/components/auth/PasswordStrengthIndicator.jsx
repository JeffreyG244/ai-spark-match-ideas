import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
const PasswordStrengthIndicator = ({ passwordValidation, showIndicator }) => {
    const getPasswordStrengthColor = (score) => {
        if (score >= 80)
            return 'bg-green-500';
        if (score >= 60)
            return 'bg-blue-500';
        if (score >= 40)
            return 'bg-yellow-500';
        return 'bg-red-500';
    };
    const getPasswordStrengthText = (score) => {
        if (score >= 80)
            return 'Very Strong';
        if (score >= 60)
            return 'Strong';
        if (score >= 40)
            return 'Moderate';
        if (score >= 20)
            return 'Weak';
        return 'Very Weak';
    };
    if (!showIndicator)
        return null;
    return (<div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Password Strength:</span>
        <span className={passwordValidation.score >= 80 ? 'text-green-600' :
            passwordValidation.score >= 60 ? 'text-blue-600' :
                passwordValidation.score >= 40 ? 'text-yellow-600' :
                    'text-red-600'}>
          {getPasswordStrengthText(passwordValidation.score)}
        </span>
      </div>
      <Progress value={passwordValidation.score} className="h-2"/>
      <div className={`h-2 rounded-full ${getPasswordStrengthColor(passwordValidation.score)}`} style={{ width: `${passwordValidation.score}%` }}/>
      
      {passwordValidation.errors.length > 0 && (<Alert>
          <AlertDescription>
            <ul className="list-disc list-inside text-sm">
              {passwordValidation.errors.map((error, index) => (<li key={index}>{error}</li>))}
            </ul>
          </AlertDescription>
        </Alert>)}
    </div>);
};
export default PasswordStrengthIndicator;
